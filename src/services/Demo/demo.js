"use strict";
var Demo = (function () {
    function Demo() {
    }
    Demo.prototype.sayHello = function () {
        return "Hello from the simple Demo service. You can find it as 'say-hello' in services.yml!";
    };
    return Demo;
}());
module.exports = new Demo();
