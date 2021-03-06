import mongoose = require("mongoose");
import bluebirdPromise = require("bluebird");

export default class MongoConnection {
    private static connection;
    private static logger;
    constructor(connectionConfig, connection_name, logger) {
        MongoConnection.logger = logger;
        mongoose.Promise = bluebirdPromise;
        mongoose.connection.on('error', function (e) {
            MongoConnection.logger.kErr('Database error : ' + e.message + '. ' + e.stack);
        });
        mongoose.connection.once('open', function () {
            MongoConnection.logger.kInfo('Datastore connected.');
        });
        mongoose.connection.on('close', function () {
            MongoConnection.logger.kInfo('Datastore disconnected.');
        });
        mongoose.connection.on('reconnect', function () {
            MongoConnection.logger.kInfo('Attempting to reconnect to database ...');
        });
        let connectionString = MongoConnection.getConnectionString(connectionConfig);
        try {
            mongoose.connect(connectionString, { server: { reconnectTries: 60 } }).catch(function (err) {
                if (err) {
                    MongoConnection.logger.kErr('Unable to connect to mongo instance. Please, check if mongo is running and configuration is correct.' + err.stack);
                } else {
                    mongoose['info'] = { 'name': connection_name, 'string': connectionString };
                }
            });
            MongoConnection.connection = mongoose;
        } catch (e) {
            MongoConnection.logger.kErr('Unable to establish mongo connection with connection string ' + connectionString);
        }
    }

    //mongodb://[username:password@]host1[:port1][,host2[:port2],...[,hostN[:portN]]][/[database][?options]]
    public static getConnectionString(connectionConfig): string {
        let cstring = "mongodb://";

        if ((typeof connectionConfig['user']) !== 'undefined' && connectionConfig['user'] !== null && (typeof connectionConfig['password']) !== 'undefined' && connectionConfig['password'] !== null) {
            cstring += connectionConfig['user'] + ":" + connectionConfig['password'] + "@";
        }


        if ((typeof connectionConfig['host']) == 'undefined' || connectionConfig['host'] == null) {
            MongoConnection.logger.kErr(' No host specified for connection.');
        }
        else cstring += connectionConfig['host'];

        if ((typeof connectionConfig['port']) !== 'undefined' && connectionConfig['port'] !== null) {
            cstring += ":" + connectionConfig['port'];
        }

        cstring += "/";

        if ((typeof connectionConfig['database']) !== 'undefined' && connectionConfig['database'] !== null) {
            cstring += connectionConfig['database'];
        }

        //To do : Add additional options support while expansion.

        return cstring;
    }

    public getConnection() {
        return MongoConnection.connection;
    }
}
