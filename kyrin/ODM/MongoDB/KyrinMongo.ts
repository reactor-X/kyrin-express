let mongoose = require('mongoose');
let fs = require('fs');
let path = require('path');
import * as mkdirp from "mkdirp";
import * as readdirp from "readdirp";
export default class KyrinMongo {
    private static modelFiles: Array<any>;
    private static schemaDirectory: string;
    public static em;
    private static logger;
    private static serverDirectory;
    public constructor(serverDirectory, logger) {
        KyrinMongo.modelFiles = [];
        KyrinMongo.logger = logger;
        KyrinMongo.schemaDirectory = path.join(serverDirectory, 'src', 'model', 'schema');
        KyrinMongo.parseModel(KyrinMongo.schemaDirectory, serverDirectory);
        KyrinMongo.serverDirectory = serverDirectory;
    }

    private static parseModel(modelDirectory, serverDirectory) {
        KyrinMongo.logger.kInfo('Start parsing models..');
        readdirp({ root: modelDirectory, fileFilter: '*.js' })
            .on('data', function (entry) {
                KyrinMongo.modelFiles[path.basename(entry.fullPath, '.js')] = path.relative(serverDirectory, entry.fullPath);
            })
            .on('end', function (err, res) {
                if (err) {
                    KyrinMongo.logger.kErr('Models could not be read. ' + err.message + " |||| " + err.stack);
                    return;
                }
                KyrinMongo.prepareMigrationFiles(serverDirectory);
                KyrinMongo.logger.kInfo('Model files parsed..');
            });
    }

    public getModel(name: string) {
        if (typeof (KyrinMongo.modelFiles[name]) !== 'undefined' && KyrinMongo.modelFiles[name] !== null) {
            return this.loadModel(KyrinMongo.modelFiles[name]);
        }
        else {
            KyrinMongo.logger.kErr("Non-existent model request : " + name);
            return null;
        }

    }

    public static prepareMigrationFiles(serverDirectory: string) {
        let migfiles = {};
        for (let modelName in KyrinMongo.modelFiles) {
            try {
                let modelInstance = require('./' + path.join(path.relative(__dirname, KyrinMongo.serverDirectory), KyrinMongo.modelFiles[modelName]));
                migfiles[modelInstance.db.base.info.name] = {};
                migfiles[modelInstance.db.base.info.name]['connection'] = modelInstance.db.base.info.string;
                migfiles[modelInstance.db.base.info.name]['current_timestamp'] = 0;
                migfiles[modelInstance.db.base.info.name]['models'] = {};
                migfiles[modelInstance.db.base.info.name]['basepath'] = path.join('migrations',modelName,'patches');
                migfiles[modelInstance.db.base.info.name]['models'][modelName] =KyrinMongo.modelFiles[modelName];
            } catch (e) {
                KyrinMongo.logger.kErr("Unable to read model for migration init (Invalid schema file?) : " + " " + e.message);
            }
        }

        for (let filename in migfiles) {
            let dirname = path.join(serverDirectory, 'migrations', filename);
            mkdirp(dirname, function (err) {
                if (err) {
                    throw Error("Unable to create migration directories. : " + err);
                }
                fs.open(path.join(serverDirectory ,filename+".migrate.json"), 'r', function (err, fd) {
                    if (err) {
                        fs.writeFile(path.join(serverDirectory ,filename+".migrate.json"), JSON.stringify(migfiles[filename]), function (err) {
                            if (err) {
                                return console.log(err);
                            }
                        });
                    }
                });

            });
        }
    }

    private loadModel(modelRelativePath: string) {
        try {
            let pathToModel = path.join(path.relative(__dirname, KyrinMongo.serverDirectory), modelRelativePath);
            return require("./" + pathToModel);
        } catch (e) {
            KyrinMongo.logger.kErr("Unable to load model (Invalid schema file?) : " + modelRelativePath + " " + e.message);
            return null;
        }
    }
};
