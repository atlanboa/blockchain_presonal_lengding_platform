var express = require('express');
var router = express.Router();
var ProductsModel = require('../models/ProductsModel');
var CommentsModel = require('../models/CommentsModel');
var UserModel =require('../models/UserModel');
var ProductsModel = require('../models/ProductsModel');
var csrf = require('csurf');
var csrfProtection = csrf({ cookie: true });
var loginRequired = require('../libs/loginRequired');


var path = require('path');
var uploadDir = path.join( __dirname , '../uploads' ); // 루트의 uploads위치에 저장한다.
var fs = require('fs');

//multer 셋팅
var multer  = require('multer');
var storage = multer.diskStorage({
    destination : function (req, file, callback) { //이미지가 저장되는 도착지 지정
        callback(null, uploadDir );
    },
    filename : function (req, file, callback) { // products-날짜.jpg(png) 저장
        callback(null, 'products-' + Date.now() + '.'+ file.mimetype.split('/')[1] );
    }
});

var upload = multer({ storage: storage });

router.get('/', function(req, res){
    res.send("admin main page");
});

router.get('/products', function(req, res){
    ProductsModel.find(function(err, products){
        res.render('admin/products', 
            { products : products }    
            //ProductModel의 products를 받아서
            //admin/products로 response를 보낸다.
        );
    });
});

router.get('/products/write',loginRequired, csrfProtection, function(req,res){
    //edit에서도 같은 form을 사용하므로 빈 변수( product )를 넣어서 에러를 피해준다
    res.render( 'admin/form' , { product : "" , csrfToken : req.csrfToken() } );
});

router.post('/products/write', upload.single('thumbnail'),loginRequired, csrfProtection, function(req,res){
    if(req.body.price >= 100000){
        var product = new ProductsModel({
        name : req.body.name,
        credit: req.user.credit,
        thumbnail : (req.file) ? req.file.filename : "",
        price : req.body.price,
        content : req.body.content,
        interestrate : 2.5,
        interDate: "연",
        preference: req.body.preference,
        repaymentDate:req.body.repaymentDate,
        username : req.user.username
        });
    }
    else{
        var product = new ProductsModel({
            name : req.body.name,
            credit: req.user.credit,
            thumbnail : (req.file) ? req.file.filename : "",
            price : req.body.price,
            content : req.body.content,
            interestrate : req.body.interestrate,
            interDate: req.body.interDate,
            preference: req.body.preference,
            repaymentDate:req.body.repaymentDate,
            username : req.user.username
        });
    }
    //이 아래는 수정되지 않았음
    var validationError = product.validateSync();
    if(validationError){
        res.send(validationError);
    }else{
        product.save(function(err){
            res.redirect('/admin/products');
        });
    }
    //이 위는 수정되지 않았음
});

router.get('/products/detail/:id' , function(req, res){
    //url 에서 변수 값을 받아올떈 req.params.id 로 받아온다
    ProductsModel.findOne( { 'id' :  req.params.id } , function(err ,product){
        if(req.user == undefined){
            var u = "undefined";
        }
        else{var u = req.user;}
        //제품정보를 받고 그안에서 댓글을 받아온다.
        CommentsModel.find({ product_id : req.params.id } , function(err, comments){
            res.render('admin/productsDetail', { product: product , user: u, comments : comments });
        });        
    });
});

router.get('/products/edit/:id',loginRequired, csrfProtection, function(req, res){
    //기존에 폼에 value안에 값을 셋팅하기 위해 만든다.
    ProductsModel.findOne({ id : req.params.id } , function(err, product){
        res.render('admin/form', { product : product, csrfToken : req.csrfToken() });
    });
});

router.post('/products/edit/:id',loginRequired, upload.single('thumbnail') , csrfProtection, function(req, res){
    //그전에 지정되 있는 파일명을 받아온다
    ProductsModel.findOne( {id : req.params.id} , function(err, product){
        //아래의 코드만 추가되면 된다.
        if(req.file && product.thumbnail){  //요청중에 파일이 존재 할시 이전이미지 지운다.
            fs.unlinkSync( uploadDir + '/' + product.thumbnail );
        }
        //위의 코드만 추가되면 된다.
        //넣을 변수 값을 셋팅한다
        var query = {
            name : req.body.name,
            credit: req.user.credit,
            thumbnail : (req.file) ? req.file.filename : product.thumbnail,
            price : req.body.price,
            content : req.body.content,
            interestrate : req.body.interestrate,
            interDate: req.body.interDate,
            preference: req.body.preference,
            repaymentDate:req.body.repaymentDate,
            username : req.user.username
        };
        ProductsModel.update({ id : req.params.id }, { $set : query }, function(err){
            res.redirect('/admin/products/detail/' + req.params.id);
        });
    });
});

router.get('/products/delete/:id', function(req, res){
    ProductsModel.remove({ id : req.params.id }, function(err){
        res.redirect('/admin/products');
    });
});

router.post('/products/ajax_comment/insert', function(req,res){
    var comment = new CommentsModel({
        content : req.body.content,
        product_id : parseInt(req.body.product_id)
    });
    comment.save(function(err, comment){
        res.json({
            id : comment.id,
            content : comment.content,
            message : "success"
        });
    });
});

router.post('/products/ajax_comment/delete', function(req, res){
    CommentsModel.remove({ id : req.body.comment_id } , function(err){
        res.json({ message : "success" });
    });
});

router.get('/products/makeTransactions/:id',(req,dd)=>{
    console.log("163 : print product : ", req.params.product);
     
    var blockchain=require('../node/global.js').blockchain; //server blockchain
    var Transaction=require('../node/Transaction.js');
    console.log("168, id : ", req.param.id);

    ProductsModel.findOne({id:req.params.id},(err,res)=>{
        console.log("171, admin.js , date : ",blockchain.changeDate_to_DueDate(res.repaymentDate));
        var newTransaction = new Transaction(res.name, req.user.username, res.price, blockchain.changeDate_to_DueDate(res.repaymentDate), res.interestrate, undefined, false);
        console.log("173 : transa : ", newTransaction);
        blockchain.createTransaction(newTransaction);
        dd.redirect('../../../accounts/myroom');
    });
});



router.get('/download',(req,res)=>{
    res.download('uploads/client.exe');
})


module.exports = router;