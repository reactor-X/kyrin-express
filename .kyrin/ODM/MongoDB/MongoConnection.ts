import mongoose = require("mongoose");
export default class MongoConnection {
    private static connection;
    private static logger;
    constructor(connectionConfig, logger) {
        MongoConnection.logger = logger;
        mongoose.connection.on('error', function () { MongoConnection.logger.kErr('Unable to connect to mongo instance. Please, check if mongo is running and configuration is correct.') });
        mongoose.connection.once('open', function () {
            // we're connected!
            MongoConnection.logger.kInfo('Datastore connected.');
        });
        mongoose.connection.on('close', function () {
            // we're connected!
            MongoConnection.logger.kInfo('Datastore disconnected.');
        });
        let connectionString = this.getConnectionString(connectionConfig);
        try {
            mongoose.connect(connectionString);
            MongoConnection.connection = mongoose;
        } catch (e) {
            MongoConnection.logger.kErr('Unable to establish mongo connection with connection string ' + connectionString);
        }
    }

    //mongodb://[username:password@]host1[:port1][,host2[:port2],...[,hostN[:portN]]][/[database][?options]]
    private getConnectionString(connectionConfig): string {
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
