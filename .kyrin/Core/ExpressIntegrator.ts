let bunyanMiddleware=require("bunyan-middleware");

export default class ExpressIntegrator{
    
    public static attachErrorLogger(app){
        let errorLogger = function (err, req, res, next) {
            app.get('container').getLogger().Eerr({ req: req, res: res, error: err }, err);
            next(err);
        }
        app.use(errorLogger);
    }
    

    public static attachNetworkLogger(app){
        app.use(bunyanMiddleware(
                {   headerName: 'X-Request-Id', 
                    propertyName: 'reqId',
                    logName: 'req_id',
                    obscureHeaders: [],
                    immediate:true,
                    parseUA:false,
                    logger: app.get('container').getNetworkLogger(),
                    additionalRequestFinishData: function(req, res) {
                    return { example: true };}
                }   
            ));
    }
}