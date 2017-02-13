
import KyrinContainer from "./Core/ContainerLoader";
import KyrinRouter from "./Core/KyrinRouter";
import PathAliasBinder from "./Core/PathAliasBinder";
import MiddlewareLoader from "./Core/MiddlewareLoader";
export default class KyrinEngine{
    public static boot(app,mode :string){
        if (mode!='dev' && mode!='prod'){
            throw Error('Invalid environment spec '+mode+". Valid values are dev and prod.");
        }
        else {
            console.log('\x1b[32m','Initializing kyrin engine in '+mode+' mode..');
            app.set('container',new KyrinContainer(mode));
            MiddlewareLoader.attachMiddlewares(app);
            KyrinRouter.generateRoutes(app);
            PathAliasBinder.bindAccessPaths(app);
            console.log('Kyrin ready..');
            console.log("\x1b[37m","");
        }
    }
}