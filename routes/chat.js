var express = require('express');
var router = express.Router();
 
router.get('/', function(req,res){
    if(!req.isAuthenticated()){
        res.send('<script>alert("로그인이 필요한 서비스입니다.");function popup(){var url ="/accounts/login";var name = "popup";window.open(url,name,"width=300,height=280,toolbar=no,status=no,location=no,scrollbars=yes,menubar=no,resizable=yes,left=50,right=50");}popup();</script>');
    }else{
        res.render('chat/index');
    }
});
 
module.exports = router;