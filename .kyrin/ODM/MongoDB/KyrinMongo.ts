let mongoose=require('mongoose');
let fs = require('fs');
let path = require('path');
import EntityManager from "./EntityManager";
import * as readdirp from "readdirp";
export default class KyrinMongo{
    private static modelFiles :Array <any>;
    private static schemaDirectory: string;
    public static em;
    public constructor(config,serverDirectory){
        KyrinMongo.modelFiles=[];
        KyrinMongo.schemaDirectory=path.join(serverDirectory,'src','model','schema');
        KyrinMongo.loadModels(KyrinMongo.schemaDirectory,serverDirectory);
    }

    private static loadModels(modelDirectory,serverDirectory){
        readdirp({ root: modelDirectory, fileFilter: '*.js' })
            .on('data',function (entry) {
                     KyrinMongo.modelFiles.push(path.relative(serverDirectory,entry.fullPath));
            })
            .on('end',function(err,res){
                if (err){
                    console.log('Models could not be read'+ err.getMessage());
                    return;
                }
                KyrinMongo.em=new EntityManager(KyrinMongo.modelFiles);
            });
    }
};
