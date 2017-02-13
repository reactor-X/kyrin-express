import * as winston  from "winston";
export class KLogger{
    
    private logger;
    
    constructor(){
        this.initLogger();
    }

    private initLogger(){
    this.logger=new winston.Logger({
                                    transports: [
                                                     new (winston.transports.File)({
                                                        name: 'info-file',
                                                        filename: 'filelog-info.log',
                                                        level: 'info'
                                                     }),
                                                        
                                                     new (winston.transports.File)({
                                                        name: 'error-file',
                                                        filename: 'filelog-error.log',
                                                        level: 'error'
                                                     })
                                                ]
        }); 
    }



}