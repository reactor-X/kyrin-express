let fs = require('fs');
let path = require('path');
import * as mkdirp from "mkdirp";
import * as readdirp from "readdirp";
export default class KyrinMongo {
    private static modelFiles: Array<any>;
    private static schemaDirectory: string;
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
                migfiles[modelInstance.db.base.info.name][modelName] = path.relative(KyrinMongo.schemaDirectory,KyrinMongo.modelFiles[modelName]);
            } catch (e) {
                KyrinMongo.logger.kErr(modelName + " cannot be added to migration registry." + " " + e.message);
            }
        }
        let migFile: string;
        for (migFile in migfiles) {
                let migrationConfigDir = path.join(serverDirectory, 'migrations', migFile);
                mkdirp(migrationConfigDir, function (err) {
                    if (err) {
                        throw Error("Unable to create migration directories. : " + err);
                    }
                    fs.openSync(path.join(migrationConfigDir ,"kyrin.migrate.json"), 'r', function (err, fd) {
                        if (!err) {
                            let current_config = require(path.join(path.relative(__dirname, migrationConfigDir), 'kyrin.migrate.json'));
                            for (let model in migfiles[migFile]){
                                current_config['models'][model]=migfiles[migFile][model];
                            }
                            current_config=JSON.stringify(current_config, null, 2);
                            fs.writeFileSync(path.join(migrationConfigDir, "kyrin.migrate.json"), current_config, function (err) {
                                if (err) {
                                    return KyrinMongo.logger.kErr(err);
                                }
                            });
                        }else{
                            return KyrinMongo.logger.kErr(err);
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
