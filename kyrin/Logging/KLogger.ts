import * as bunyan from "bunyan";
import * as path from "path";
import * as mkdirp from "mkdirp";

export default class KLogger {

    private kyrin_logger;
    private network_logger;
    private static logPath;
    private static logDepth;
    private static appName;
    private static supported_min_log_levels=['trace','debug','info','warn','error','fatal'];
    constructor(mode: string, serverDirectory: string, appConfig: string) {
        if (KLogger.supported_min_log_levels.indexOf(appConfig['default_log_level'])){
            KLogger.logDepth=appConfig['default_log_level'];
        }else{
            KLogger.logDepth='info';
        }
        this.configureAndInit(mode, serverDirectory, appConfig);
    }
    private createFileLogger() {
        this.kyrin_logger = bunyan.createLogger({
            name: KLogger.appName + "-system",
            streams: [
                {
                    type: "rotating-file",
                    path: path.join(KLogger.logPath, "app.log"),
                    level: KLogger.logDepth,
                    period: "1d",   // daily rotation 
                }
            ]
        });
        this.network_logger = bunyan.createLogger({
            name: KLogger.appName + "-network",
            streams: [
                {
                    type: "rotating-file",
                    path: path.join(KLogger.logPath, "network.log"),
                    level: KLogger.logDepth,
                    period: "1d",   // daily rotation 
                }
            ]
        });
    }

    private createTcpBunyanLogger(connectionspec) {
        this.kyrin_logger = bunyan.createLogger({
            name: KLogger.appName,
            streams: [
                {
                    type: "raw",
                    stream: require('bunyan-logstash-tcp').createStream({
                        host: connectionspec['host'],
                        port: connectionspec['port'],
                        max_connect_retries: 10,
                        retry_interval: 1000 * 60
                    }).on('error', console.log),
                    level: KLogger.logDepth
                }
            ]
        });
        this.network_logger = this.kyrin_logger;

    }
    public kErr(message, error = null) {
        //Log errors
        error == null ? this.kyrin_logger.error(message) : this.kyrin_logger.error({ err: error }, message);
    }

    public Eerr(expressData, error) {
        this.kyrin_logger.error(expressData, error.stack);
    }

    public kInfo(message) { //Log info
        this.kyrin_logger.info(message);
    }
    private static prepareLogDirectory(mode: string, serverDirectory: string, customDirectory: string = null): void {
        KLogger.logPath = customDirectory == null ? path.join(serverDirectory, "var/log/" + mode) : path.join(customDirectory, mode);
        if (customDirectory !== null) {
            mkdirp(customDirectory, function (err) {
                if (err) {
                    throw Error("Unable to initialize logger. : " + err);
                }
            });
        }
        mkdirp(KLogger.logPath, function (err) {
            if (err) {
                throw Error("Unable to initialize logger. : " + err);
            }
        });
    }

    private configureAndInit(mode: string, serverDirectory: string, appConfig) {
        if (((typeof appConfig) === 'undefined' || appConfig === null) || (appConfig['logger'] === 'undefined' || appConfig['logger'] == null)) {
            KLogger.appName = 'kyrin';
            KLogger.prepareLogDirectory(mode, serverDirectory, null);
            this.createFileLogger();
        }
        else {
            KLogger.appName = appConfig['name'] !== null && (typeof appConfig['name']).toLowerCase() !== 'undefined' ? appConfig['name'] : 'kyrin';
            try {
                if (appConfig.logger.mode == 'file') {
                    KLogger.prepareLogDirectory(mode, null, appConfig.logger.path);
                    this.createFileLogger();
                }
                else if (appConfig.logger.mode == 'tcp') {
                    let connection = appConfig.connections[appConfig.logger.connection];
                    this.createTcpBunyanLogger(connection);
                }
                else KLogger.prepareLogDirectory(mode, serverDirectory, null); //Defaults to server directory path.
            }
            catch (ex) {
                throw Error('Unable to initialize logger. Please check custom logger definition.')
            }
        }
    }

    public getLogger() {
        return this.kyrin_logger;
    }

    public getNetworkLogger() {
        return this.network_logger;
    }

}