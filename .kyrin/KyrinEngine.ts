
import KyrinContainer from "./Core/ContainerLoader";
import KyrinRouter from "./Core/KyrinRouter";
import PathAliasBinder from "./Core/PathAliasBinder";
import MiddlewareLoader from "./Core/MiddlewareLoader";
import ExpressIntegrator from "./Core/ExpressIntegrator";
export default class KyrinEngine{
    public static boot(app,serverDirectory :string){
        let mode=app.get('env')=="development"?"dev":"prod";
        if (mode!='dev' && mode!='prod'){
            throw Error('Invalid environment spec '+mode+". Valid values are dev and prod.");
        }
        else {
            app.set('container',new KyrinContainer(mode,serverDirectory));
            ExpressIntegrator.attachNetworkLogger(app);
            MiddlewareLoader.attachMiddlewares(app,app.get('container').getLogger());
            KyrinRouter.generateRoutes(app,serverDirectory,app.get('container').getLogger());
            PathAliasBinder.bindAccessPaths(app,serverDirectory,app.get('container').getLogger());
            ExpressIntegrator.attachErrorLogger(app);
            app.get('container').getLogger().kInfo("Kyrin core ready.. Wait for models to load..");
        }
    }
}