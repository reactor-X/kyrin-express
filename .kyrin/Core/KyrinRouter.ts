import * as yamlEngine from "js-yaml";
import * as fs from "fs";
import * as path from "path";
/*
* This class is responsible for parsing routing.yml file to initialise routes for the app.
*
*/
export default class KyrinRouter{
    public static generateRoutes(app,serverDirectory :string){
        try {
            let routeSpecs=yamlEngine.safeLoad(fs.readFileSync(path.join(serverDirectory,"config/routing.yml"), 'utf8'));
            for(let route in routeSpecs){
                app.use(routeSpecs[route]['entry-point'],require(path.join(serverDirectory,"src/controllers/"+routeSpecs[route]['controller'])));
            }
            
        }catch (e){
            throw Error("Error parsing route definition from "+path.join(serverDirectory,"config/routing.yml")+". Please make sure file exists and is syntactically correct.");
        }
    }
}