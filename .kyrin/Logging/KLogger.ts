import * as bunyan  from "bunyan";
import * as path from "path";
import * as mkdirp from "mkdirp";
import * as process from "process";
export default class KLogger{
    
    private kyrin_logger;
    private network_logger;
    private static logPath ;
    constructor(mode :string, serverDirectory :string,customDirectory :string){
        this.prepareLogDirectory(mode,serverDirectory,customDirectory);
        this.initLogger();
    }

    private initLogger(){
    this.kyrin_logger=bunyan.createLogger({
                                            name: "system",
                                            streams: [
                                                        {   type: "rotating-file",
                                                            path: path.join(KLogger.logPath,"info.log"),
                                                            level: "info",
                                                            period: "1d",   // daily rotation 
                                                        }
                                                    ]
                                        });
    this.network_logger=bunyan.createLogger({
                                            name: "network",
                                            streams: [
                                                        {   type: "rotating-file",
                                                            path: path.join(KLogger.logPath,"network.log"),
                                                            level: "info",
                                                            period: "1d",   // daily rotation 
                                                        }
                                                    ]
                                        });
    }

    public kErr(message,error=null){ //Log errors
        error==null?this.kyrin_logger.error(message):this.kyrin_logger.error({err: error}, message);
    }

    public kInfo(message){ //Log info
        this.kyrin_logger.info(message);
    }
    private prepareLogDirectory(mode :string,serverDirectory :string,customDirectory :string=null) :void{
        KLogger.logPath=customDirectory==null?path.join(serverDirectory,"var/log/"+mode):path.join(customDirectory,mode);
        mkdirp(KLogger.logPath, function(err) { 
            if (err){
                throw Error("Unable to initialize logger. : "+ err);
            }
           
        });
    }

    public getLogger(){
        return this.kyrin_logger;
    }

    public getNetworkLogger(){
        return this.network_logger;
    }

}