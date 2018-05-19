
/**@description 로그인이 필요한 서비스를 사용자가 접속하려고 할 때 로그인이 되어있으면 원래 사용자가 접속하려고 하는 페이지로 넘김,
 * 로그인이 안되어있으면 /accounts/login (routes폴더의 acoount.js 로 jump)*/
module.exports = function(req, res, next) {
    if (!req.isAuthenticated()){ 
        res.redirect('/accounts/login');
    }else{
        return next();
    }
};