import KyrinMongo from "./MongoDB/KyrinMongo";
import MongoConnection from "./MongoDB/MongoConnection";
export default class ODMManager{
    public CONNECTIONS :Array <any>;
    public MODELMANAGER;
    public constructor(appConfig :any,serverDirectory :string,logger){
        if ((typeof this.CONNECTIONS) =='undefined')
            {
                this.CONNECTIONS=[];
                this.createConnections(appConfig,serverDirectory,logger);
            }
    }

    private  createConnections(appConfiguration,serverDirectory,logger){
        for (let connection in appConfiguration.connections){
            if ((typeof appConfiguration.connections[connection]['type'])=='undefined' || appConfiguration.connections[connection]['type']==null)
            {
                continue;
            }
            switch (appConfiguration.connections[connection]['type']){
                case 'mongo': this.CONNECTIONS[connection]=new MongoConnection(appConfiguration.connections[connection],logger);
                              this.MODELMANAGER=new KyrinMongo(serverDirectory,logger);
                              break;
                default: logger.kErr("Invalid connection type for "+connection);
            }
        }
        if ((typeof this.MODELMANAGER)=='undefined'){
            this.MODELMANAGER=null;
        }
    }
}