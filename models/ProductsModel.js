var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');

//생성될 필드명을 정한다.
var ProductsSchema = new Schema({
    name : { //제품명
        type : String,
        required: [true, '제목은 입력해주세요']
    },
    credit: String,
    thumbnail : String, //이미지 파일명
    price : {  // 대출금액
        type : Number,
        required: [true, '빌려줄 금액을 입력하세요']
    },
    interestrate:{
        type : Number,
        required: [true, '이자율 을 입력하세요']
    },
    content : String, // 내용
    created_at : { //작성일
        type : Date,
        default : Date.now()
    },
    username : String  //작성자추가
});

ProductsSchema.virtual('getDate').get(function(){
    var date = new Date(this.created_at);
    return {
        year : date.getFullYear(),
        month : date.getMonth()+1,
        day : date.getDate()
    };
});

// 1씩 증가하는 primary Key를 만든다
// model : 생성할 document 이름
// field : primary key , startAt : 1부터 시작
ProductsSchema.plugin( autoIncrement.plugin , { model : 'products' , field : 'id' , startAt : 1 });
module.exports = mongoose.model('products', ProductsSchema);