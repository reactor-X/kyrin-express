"use strict";
var express = require("express");
var router = express.Router();
var kyrin_1 = require("../../../kyrin");
router.get('/', function (req, res, next) {
    res.render('index', { service_result: kyrin_1.default.get('say-hello').sayHello() });
});
module.exports = router;
