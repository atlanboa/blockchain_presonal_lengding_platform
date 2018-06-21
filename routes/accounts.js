var express = require('express');
var router = express.Router();
var UserModel = require('../models/UserModel');
var VirtualBankModel = require('../models/VirtualBankModel');
var passwordHash = require('../libs/passwordHash');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

/** 
 *  @var UserModel 몽고DB의 UserData
 *  @var passport 로그인이 되어있는지 않되어있는지 관리 (Session)
 *  @function passport.serializeUser 로그인 성공 시 실행되는 done(null, user); 에서
 * user 객체를 전달받아 세션(req.session.passport.user)에 저장
 *  @function passport.deserializeUser 실제 서버로 들어오는 요청마다 세션 정보를 실제 
 * DB의 데이터와 비교, 해당하는 유저 정보가 있으면 done의 두 번째 인자(user 객체)를 
 * req.user에 저장, 요청을 처리할 때 유저의 정보를 req.user를 통해 반환
 */

passport.serializeUser(function (user, done) {
    console.log('serializeUser');
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    var result = user;
    result.password = "";
    console.log('deserializeUser');
    done(null, result);
});


/**
 * @class LocalStrategy 로그인 전략 작성
 * @description usernameField, passwordField 어떤 폼으로부터 id, pw 를 전달받을지 
 *              설정하는 옵션, body {id : 'userid', pw : 'userpw'} 라면 콜백함
 *              
 * @description session : true or false , session의 사용 유무
 * @description passReqToCallback : true  express의 req 객체에 접근 가능
 * @description                   : false express의 req 객체에 접근 불가
 * @description passReqToCallback을 true로 해 두어 req 객체를 passport 인증 시 활용
 * @function done(parameter1,parameter2,parameter3)
 *          1 : 서버 에러
 *          2 : 성공했을 때 return value 
 *          3 : 사용자가 임의로 실패를 만들고 싶을 경우, 일반적으로 에러 메시지 작성 
 * req.session.passport.user 에 세션 정보 저장
 */
passport.use(new LocalStrategy({
        usernameField: 'username',
        passwordField : 'password',
        session : true,
        passReqToCallback : true //false 하면 콜백 parameter req가 없어짐
    },
    function (req, username, password, done) {
        UserModel.findOne({ username : username , password : passwordHash(password) }, function (err,user) {
            if (!user){
                if(user.login_permit == false){
                    return done(null, false, { message: '제한된 사용자입니다.' });
                }
                return done(null, false, { message: '아이디 또는 비밀번호 오류 입니다.' });
            }else{
                //login ok, make connect
                return done(null, user );
            }
        });
    }
));

router.get('/', function(req, res){
    res.send('account app');
});

router.get('/join', function(req, res){
    res.render('accounts/join');
});

router.post('/join', function(req, res){
    var User = new UserModel({
        username : req.body.username,
        password : passwordHash(req.body.password),
        displayname : req.body.displayname,
        nickname : req.body.nickname,
        birth1: req.body.birth1,
        birth2: req.body.birth2,
        birth3: req.body.birth3,
        sex : req.body.sex,
        email : req.body.email
    });
    User.save(function(err){
        res.send('<script>alert("회원가입 성공");location.href="/#";</script>');
    });
});

router.get('/login', function(req, res){
    res.render('accounts/login', { flashMessage : req.flash().error });
});

//login시 failureFlash
router.post('/login' , 
passport.authenticate('local', {
    failureRedirect: '/accounts/login', 
    failureFlash: true 
}), 
function(req, res){
    res.send('<script>opener.document.location.reload();self.close();</script>');
}
);

router.get('/success', function(req, res){
    res.send(req.user);
});

router.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
});

router.get('/myroom', function(req,res){
    if(!req.isAuthenticated()){
        res.send('<script>alert("로그인이 필요한 서비스입니다.");function popup(){var url ="/accounts/login";var name = "popup";window.open(url,name,"width=300,height=280,toolbar=no,status=no,location=no,scrollbars=yes,menubar=no,resizable=yes,left=50,right=50");}popup();</script>');
    }else{
        var balance;
        var blockchain=require('../node/global.js').blockchain;
        var object=blockchain.findTransaction(req.user.username);
        console.log('account.js:122:',object);
        console.log('122 : username print : ', req.user.username);
        VirtualBankModel.findOne({ username : req.user.username}, (err, doc)=>{
            if(!doc) console.log('123 : CAN NOT FIND USER BANK ACCOUNT');
            balance = doc.balance;
            console.log('125 : print balance : ',balance);
            res.render('accounts/myroom',{user : req.user, balance : balance,object:object, date:new Date().toLocaleDateString('ko-KR',{year:'numeric',month:'2-digit', day:'2-digit'})});
        });
        
    }
});

router.get('/charge/:id',function(req,res){
    res.render('accounts/charge', { flashMessage : req.flash().error});
});
router.post('/charge/:id',function(req,res){
    UserModel.findOne( {id : req.params.id} , function(err, user){
        if(!user){
            console.log(req.body.chargemoney);
        }
        else{
            req.user.money=user.money+Number(req.body.chargemoney);
            var query = {
                money:user.money+Number(req.body.chargemoney)
            };
            UserModel.update({ id : req.params.id }, { $set : query }, function(err){
                res.send('<script>opener.document.location.reload();self.close();</script>');
            });
        }
    });
});

router.get('/makeTransaction/:data',(req,res)=>{
    var info=req.params.data;
    console.log("158, info, account.js : ", info);
    var data = info.split('@')
    var blockchain=require('../node/global.js').blockchain;
    var Transaction=require('../node/Transaction.js');
    
    var k=new Transaction(data[0],req.user.username,data[1], blockchain.changeDate_to_LocaleDateString(),'주',undefined);
    k.status=true;
    console.log("164, 상환 transaction : ", k);
    blockchain.createTransaction(k);
    res.redirect('../../../accounts/myroom');

})

router.get('/checkBlockchain',(req,res)=>{
    //@todo 사이트에 체인 넘겨주기
    var blockchain = require('../node/global.js');
    var chain = blockchain.chain;
    console.log("175, account.js : chain : ",chain);
    res.render('accounts/checkBlockchain',{chain: chain});
});


module.exports = router;