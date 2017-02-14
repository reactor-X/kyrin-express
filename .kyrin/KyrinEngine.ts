
import KyrinContainer from "./Core/ContainerLoader";
import KyrinRouter from "./Core/KyrinRouter";
import PathAliasBinder from "./Core/PathAliasBinder";
import MiddlewareLoader from "./Core/MiddlewareLoader";
export default class KyrinEngine{
    public static boot(app,serverDirectory :string){
        let mode=app.get('env')=="development"?"dev":"prod";
        if (mode!='dev' && mode!='prod'){
            throw Error('Invalid environment spec '+mode+". Valid values are dev and prod.");
        }
        else {
            app.set('container',new KyrinContainer(mode,serverDirectory));
            MiddlewareLoader.attachMiddlewares(app);
            KyrinRouter.generateRoutes(app,serverDirectory,app.get('container').getLogger());
            PathAliasBinder.bindAccessPaths(app,serverDirectory,app.get('container').getLogger());
            app.get('container').getLogger().kInfo("Kyrin ready..");
        }
    }
}