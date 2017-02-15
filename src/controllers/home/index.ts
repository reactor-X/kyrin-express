import * as express from "express";
let router = express.Router();
import container from "../../../kyrin";

router.get('/', function(req, res, next) {
    res.render('index',{service_result:container.get('say-hello').sayHello()});
});

export = router;