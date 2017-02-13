import * as express from "express";
import * as helmet from "helmet";
import * as bodyParser  from "body-parser";
import * as expressSession from "express-session";
import * as path from "path";
import * as fs from "fs";
import KyrinEngine from "./.kyrin/KyrinEngine";

let app = express();

// Initialise express specific settings here.
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));
app.engine('html', require('ejs').renderFile);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

//Initialise kyrin.
KyrinEngine.boot(app,app.get('env')=="development"?"dev":"prod");
export default app.get('container');

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err;
    err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}
// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});
export var kyrinApp=app;
//# sourceMappingURL=app.js.map
