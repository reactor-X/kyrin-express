import * as yamlEngine from "js-yaml";
import * as fs from "fs";
import * as path from "path";
/*
* This class is responsible for parsing services.yml file to generate service objects for the container.
* Environment mode is passed to the constructor and can be used to perform mode specific actions on demand.
*
*/

export class ServiceLoader{
    private services;
    private servicePrimitives;
    private log :boolean;
    constructor(mode :string){
        this.services=[];
        this.servicePrimitives=[];
        if (mode=='dev'){
            this.log=true;
        }
    }
    public getServices(){
        this.parsePrimitives();
        this.loadServices();
        return this.services;
    }

    private parsePrimitives(){
        try {
            this.servicePrimitives=yamlEngine.safeLoad(fs.readFileSync(path.join(__dirname,"../../config/services.yml"), 'utf8'));
        }catch (e){
            throw Error("Error parsing service definitions from "+path.join(__dirname,"../../config/services.yml")+". Please make sure file exists and is syntactically correct.");
        }
    }

    private loadServices(){
       for(let serviceKey in this.servicePrimitives){
           this.services[serviceKey]=require(path.join(__dirname,"../../services/"+this.servicePrimitives[serviceKey].class));
       }
    }
}