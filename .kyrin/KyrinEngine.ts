
import KyrinContainer from "./Core/ContainerLoader";
import KyrinRouter from "./Core/KyrinRouter";
import PathAliasBinder from "./Core/PathAliasBinder";
import MiddlewareLoader from "./Core/MiddlewareLoader";
let bunyanMiddleware=require("bunyan-middleware");
export default class KyrinEngine{
    public static boot(app,serverDirectory :string){
        let mode=app.get('env')=="development"?"dev":"prod";
        if (mode!='dev' && mode!='prod'){
            throw Error('Invalid environment spec '+mode+". Valid values are dev and prod.");
        }
        else {
            app.set('container',new KyrinContainer(mode,serverDirectory));
            
            //Integrate express logger
            app.use(bunyanMiddleware(
                {   headerName: 'X-Request-Id', 
                    propertyName: 'reqId',
                    logName: 'req_id',
                    obscureHeaders: [],
                    immediate:true,
                    parseUA:false,
                    logger: app.get('container').getExpressLogger(),
                    additionalRequestFinishData: function(req, res) {
                    return { example: true };}
                }   
            ));
            MiddlewareLoader.attachMiddlewares(app,app.get('container').getLogger());
            KyrinRouter.generateRoutes(app,serverDirectory,app.get('container').getLogger());
            PathAliasBinder.bindAccessPaths(app,serverDirectory,app.get('container').getLogger());
            app.get('container').getLogger().kInfo("Kyrin ready..");
        }
    }
}