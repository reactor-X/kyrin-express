import * as yamlEngine from "js-yaml";
import * as fs from "fs";
import * as path from "path";
import {ServiceLoader} from "./ServiceLoader";
import KLogger from "../Logging/KLogger";

export default class AppContainer{
    private params;
    private config;
    private services;
    private logger :KLogger;
    constructor(mode :string,serverDirectory :string){
        this.loadConfigAndParams(mode,serverDirectory);
        if(typeof (this.getConfig('application')['logger'])!== 'undefined')
            this.logger=new KLogger(mode,serverDirectory,this.getConfig('application'));
        else
            this.logger=new KLogger(mode,serverDirectory,null);
        this.logger.kInfo("Initializing kyrin...");
        this.loadServices(serverDirectory);
    }

    private loadConfigAndParams(mode :string,serverDirectory :string){
        try {
            this.config=yamlEngine.safeLoad(fs.readFileSync(path.join(serverDirectory,"config/config-"+mode+".yml"), 'utf8'));
            this.params=yamlEngine.safeLoad(fs.readFileSync(path.join(serverDirectory,"config/parameters.yml"), 'utf8'));
            this.config['application']['env']=mode;
        }catch (e){
           this.logger.kErr("Failed to read app configuration. (Bootstrap Error) for environment"+mode+" : " + e.message,e);
           this.logger.kInfo("Terminating app due to error");
           throw Error("Failed to read app configuration. (Bootstrap Error) for environment"+mode+" : " + e.message);
        }
    }

    private loadServices(serverDirectory :string){
            this.services=new ServiceLoader(this.logger).getServices(serverDirectory);
    }
    public getConfig(key :string) :any{

        if (key=='all'){
                return this.config;
            }
        else if (typeof (this.config[key]) !== 'undefined' && this.config[key]!==""){
                return this.config[key];
        }
        else return null;
    }
 
    public getParameter(key :string) :any{
        if (typeof (this.params['global'][key]) !== 'undefined' && this.params['global'][key]!==""){
            return this.params['global'][key];
        }
        else return null;
    }
    public get(name :string){
        if (typeof (this.services[name]) !== 'undefined'){
            return this.services[name];
        }
        else throw Error("That service doesn't exist yet. Check with services.yml or reboot the node server if you made a change to service declarations.");
    }

    public getLogger(){
        return this.logger;
    }

    public getNetworkLogger(){
        return this.logger.getNetworkLogger();
    }
}
