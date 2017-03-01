import * as yamlEngine from "js-yaml";
import * as fs from "fs";
import * as path from "path";
import {ServiceLoader} from "./ServiceLoader";
import KLogger from "../Logging/KLogger";
import ODMManager from "../ODM/ODMManager";
export default class AppContainer{
    private params;
    private config;
    private services;
    private logger :KLogger;
    constructor(mode :string,serverDirectory :string){
        this.loadConfigAndParams(mode,serverDirectory);
        this.logger=new KLogger(mode,serverDirectory,this.getConfig('application'));
        this.logger.kInfo("Initializing kyrin...");
        this.loadServices(serverDirectory);
        ODMManager.Instance(this.getConfig('application'),serverDirectory);
    }

    private loadConfigAndParams(mode :string,serverDirectory :string){
        try {
            this.config=yamlEngine.safeLoad(fs.readFileSync(path.join(serverDirectory,"config/config-"+mode+".yml"), 'utf8'));
            this.params=yamlEngine.safeLoad(fs.readFileSync(path.join(serverDirectory,"config/parameters.yml"), 'utf8'));
            if (this.config==null)
                throw Error("Unable to find a valid configuration file.");
        }catch (e){
           throw Error("Failed to read app configuration. (Bootstrap Error) for environment "+mode+" : " + e.message);
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

        if (this.params!==null && typeof (this.params[key]) !== 'undefined' && this.params[key]!==""){
            return this.params[key];
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

    public memOptimize(){
        if (this.getConfig('application')!==null)
            this.config.application=false;
    }
}
