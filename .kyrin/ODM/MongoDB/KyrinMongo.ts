let mongoose=require('mongoose');
let fs = require('fs');
let path = require('path');
import * as readdirp from "readdirp";
export default class KyrinMongo{
    private  static modelFiles :Array <any>;
    private static schemaDirectory: string;
    public static em;
    private static logger;
    private static serverDirectory;
    public constructor(serverDirectory,logger){
        KyrinMongo.modelFiles=[];
        KyrinMongo.logger=logger;
        KyrinMongo.schemaDirectory=path.join(serverDirectory,'src','model','schema');
        KyrinMongo.parseModel(KyrinMongo.schemaDirectory,serverDirectory);
        KyrinMongo.serverDirectory=serverDirectory;
    }

    private static parseModel(modelDirectory,serverDirectory){
        KyrinMongo.logger.kInfo('Start parsing models..');
        readdirp({ root: modelDirectory, fileFilter: '*.js' })
            .on('data',function (entry) {
                     KyrinMongo.modelFiles[path.basename(entry.fullPath, '.js')]=path.relative(serverDirectory,entry.fullPath);
            })
            .on('end',function(err,res){
                if (err){
                    KyrinMongo.logger.kErr('Models could not be read. '+ err.message+ " |||| "+ err.stack);
                    return;
                }
                KyrinMongo.logger.kInfo('Model files parsed..');
            });
    }

    public getModel(name :string){
        if (typeof(KyrinMongo.modelFiles[name])!=='undefined' && KyrinMongo.modelFiles[name]!==null){
            return this.loadModel(KyrinMongo.modelFiles[name]);
        }
        else {
            KyrinMongo.logger.kErr("Non-existent model request : "+name);
            return null;
        }

    }

    private loadModel(modelRelativePath :string) {
       try {
           let pathToModel=path.join(path.relative(__dirname,KyrinMongo.serverDirectory),modelRelativePath);
           return require("./"+pathToModel);
       }catch (e){
           KyrinMongo.logger.kErr("Unable to load model (Invalid schema file?) : "+modelRelativePath+" "+e.message);
           console.log(path.join(path.relative(__dirname,KyrinMongo.serverDirectory),modelRelativePath));
           return null;
       }
    }
};
