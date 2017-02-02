
import KyrinContainer from "./components/ContainerLoader";
import KyrinRouter from "./components/KyrinRouter";
import PathAliasBinder from "./components/PathAliasBinder";
import MiddlewareLoader from "./components/MiddlewareLoader";
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