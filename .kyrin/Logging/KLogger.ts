import * as winston  from "winston";
import * as path from "path";
import * as mkdirp from "mkdirp";
export default class KLogger{
    
    private kyrin_logger;
    private static logPath ;
    constructor(mode :string, serverDirectory :string,customDirectory :string){
        this.prepareLogDirectory(mode,serverDirectory,customDirectory);
        this.initLogger();
    }

    private initLogger(){
    this.kyrin_logger=new winston.Logger({
                                    transports: [
                                                     new (winston.transports.File)({
                                                        name: 'kyrin_error_file',
                                                        filename: path.join(KLogger.logPath,'error.log'),
                                                        level: 'error'
                                                     }),
                                                     new (winston.transports.File)({
                                                        name: 'kyrin_info_file',
                                                        filename: path.join(KLogger.logPath,'info.log'),
                                                        level: 'info'
                                                     }),
                                                        
                                                     new (winston.transports.File)({
                                                        name: 'kyrin_blockchain',
                                                        filename: path.join(KLogger.logPath,'blockchain.log'),
                                                        level: 'warn'
                                                     })
                                                ]
        }); 
    }

    public kErr(message){ //Log errors
        this.kyrin_logger.error(message);
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

}