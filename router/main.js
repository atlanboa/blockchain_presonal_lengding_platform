/**
 * @Author: Yeji Kim
 * @param {express} app
 * @description router code
 */
module.exports=function(app){
    app.get('/',(req,res)=>{
        res.render('main.html')
    });
    app.get('/about',(req,res)=>{
        res.render('about.html');
    });
    app.get('/transactions/new',(req,res)=>{
        res.render('transaction_new.html');
    })
}