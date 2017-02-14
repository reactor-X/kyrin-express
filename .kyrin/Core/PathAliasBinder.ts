import * as yamlEngine from "js-yaml";
import * as fs from "fs";
import * as path from "path";
import * as express from "express";

/*
*   PathAliasBinder reads static path configuration from config.yml and initializes them for the express app instance.
*   All paths are relative to the server directory.
*
*/
export default class PathAliasBinder{
    public static bindAccessPaths(app,serverDirectory :string){
        try{
            const pathBindings=app.get('container').getConfig('application')['path_bindings'];
            for (let pathAlias in pathBindings){
                app.use(pathBindings[pathAlias][0], express.static(path.join(serverDirectory,pathBindings[pathAlias][1])));
            }
        }catch(e){
            if (typeof app.get('container').getConfig('application')['path_bindings'] !=='undefined'){
                throw Error('Unable to parse path bindings in configuration. Please, check declaration format.');
            }
        }
    }
}