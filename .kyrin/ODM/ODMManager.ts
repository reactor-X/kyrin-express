import KyrinMongo from "./MongoDB/KyrinMongo";
export default class ODMManager{
    private static instances :Array <any>;
    private constructor(){

    }
    public static Instance(appConfig :any,serverDirectory :string){
        if ((typeof ODMManager.instances) =='undefined')
            {
                ODMManager.instances=[];
                return ODMManager.createConnections(appConfig,serverDirectory);
            }
        else return ODMManager.instances;
    }

    private static createConnections(appConfiguration,serverDirectory){
        for (let connection in appConfiguration.connections){
            if ((typeof appConfiguration.connections[connection]['type'])=='undefined' || appConfiguration.connections[connection]['type']==null)
            {
                continue;
            }
            switch (appConfiguration.connections[connection]['type']){
                case 'mongo': ODMManager.instances[connection]=new KyrinMongo(appConfiguration.connections[connection],serverDirectory);
            }
        }
        return ODMManager.instances;
    }
    
}