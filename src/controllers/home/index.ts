import * as express from "express";
let router = express.Router();
import container from "../../../kyrin";

router.get('/', function(req, res, next) {
    let User=container.getModel('User');
    let user=new User();
    user.setName("ravi","semwal");
    user.setUsername("reactor-X");
    console.log(user);
    user.save(function (err){
        if (!err) 
        console.log('Saved successfully');
    }) 
    // User.find({fname:"ravi"},function(err,user){
    //     console.log(user);
    // })
    res.render('index',{service_result:container.get('say-hello').sayHello()});
});

export = router;