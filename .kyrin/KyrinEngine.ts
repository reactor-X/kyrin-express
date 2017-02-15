
import KyrinContainer from "./Core/ContainerLoader";
import KyrinRouter from "./Core/KyrinRouter";
import PathAliasBinder from "./Core/PathAliasBinder";
import MiddlewareLoader from "./Core/MiddlewareLoader";
let expressWinston=require("express-winston");   //Types for express-winston not yet available.

export default class KyrinEngine{
    public static boot(app,serverDirectory :string){
        let mode=app.get('env')=="development"?"dev":"prod";
        if (mode!='dev' && mode!='prod'){
            throw Error('Invalid environment spec '+mode+". Valid values are dev and prod.");
        }
        else {
            app.set('container',new KyrinContainer(mode,serverDirectory));
            //Integrate express logger
            app.use(expressWinston.logger({winstonInstance: app.get('container').getWinstonInstance(),meta:true}));
            MiddlewareLoader.attachMiddlewares(app,app.get('container').getLogger());
            KyrinRouter.generateRoutes(app,serverDirectory,app.get('container').getLogger());
            PathAliasBinder.bindAccessPaths(app,serverDirectory,app.get('container').getLogger());
            app.get('container').getLogger().kInfo("Kyrin ready..");
        }
    }
}