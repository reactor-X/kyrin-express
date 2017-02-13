import * as yamlEngine from "js-yaml";
import * as fs from "fs";
import * as path from "path";
import {ServiceLoader} from "./ServiceLoader";
export default class AppContainer{
    private params;
    private config;
    private services;

    constructor(mode :string){
        this.loadConfigAndParams(mode);
        this.loadServices(mode);
    }

    private loadConfigAndParams(mode :string){
        try {
            this.config=yamlEngine.safeLoad(fs.readFileSync(path.join(__dirname,"../../config/config-"+mode+".yml"), 'utf8'));
            this.params=yamlEngine.safeLoad(fs.readFileSync(path.join(__dirname,"../../config/parameters.yml"), 'utf8'));
            this.config['application']['env']=mode;
        }catch (e){
            throw Error("Failed to read app configuration. (Bootstrap Error) for environment"+mode+" : " + e.message);
        }
    }

    private loadServices(mode :string){
            this.services=new ServiceLoader(mode).getServices();
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
}
