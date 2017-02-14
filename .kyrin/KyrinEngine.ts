
import KyrinContainer from "./Core/ContainerLoader";
import KyrinRouter from "./Core/KyrinRouter";
import PathAliasBinder from "./Core/PathAliasBinder";
import MiddlewareLoader from "./Core/MiddlewareLoader";
export default class KyrinEngine{
    public static boot(app,mode :string,serverDirectory :string){
        if (mode!='dev' && mode!='prod'){
            throw Error('Invalid environment spec '+mode+". Valid values are dev and prod.");
        }
        else {
            console.log('\x1b[32m','Initializing kyrin engine in '+mode+' mode..');
            app.set('container',new KyrinContainer(mode,serverDirectory));
            MiddlewareLoader.attachMiddlewares(app);
            KyrinRouter.generateRoutes(app,serverDirectory);
            PathAliasBinder.bindAccessPaths(app,serverDirectory);
            console.log('Kyrin ready..');
            console.log("\x1b[37m","");
        }
    }
}