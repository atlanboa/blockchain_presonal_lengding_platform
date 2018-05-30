var express=require('express');
var app=express();
var router=require('./router/main')(app);
var bodyParser=require('body-parser');

app.set('views',__dirname+'/view'); 
app.set('view engine','ejs');
//setting using EJS engine when server render html
app.engine('html',require('ejs').renderFile);

app.use(bodyParser.urlencoded({extended:true}));



var server=app.listen(3000,()=>{
    console.log('Express server has started on port 3000');
});

app.use(express.static('public')); //static file 이 위치할 디렉토리의 이름
