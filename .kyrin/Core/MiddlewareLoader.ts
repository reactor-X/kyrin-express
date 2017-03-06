import * as fs from "fs";
import * as path from "path";
import KLogger from "../Logging/KLogger";
/*
*   Still an alpha feature.
*   Supports express session.    
*
*/
export default class MiddlewareLoader {
    public static attachMiddlewares(app, logger: KLogger) {
        try {
            let middlewares = app.get('container').getConfig('middlewares');
            for (let middleware in middlewares) {
                logger.kInfo("Initialising " + middleware);
                if (middlewares[middleware]['use_default'] == true) {
                    app.use(require(middleware)());
                }
                else {
                    app.use(require(middleware)(middlewares[middleware]['init_params']));
                }
            }
        } catch (e) {
            logger.kErr("Error parsing middleware declarations from " + path.join(__dirname, "../../config/config-" + app.get('container').getConfig('application')['env'] + ".yml") + ". Please make sure file exists and is syntactically correct.", e);
            logger.kInfo("Terminating app due to error");
            throw Error("Error parsing middleware declarations from " + path.join(__dirname, "../../config/config-" + app.get('container').getConfig('application')['env'] + ".yml") + ". Please make sure file exists and is syntactically correct.");
        }
    }
}
