var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');
var UserSchema = new Schema({
  username : {
      type : String,
      required: [true, '아이디는 필수입니다.'],
      unique : true
  },
  password : {
      type : String,
      required: [true, '패스워드는 필수입니다.']
  },
  nickname: String,
  displayname : String,
  birth1: {
      type: String,
      required: [true, '생년월일은 필수입니다.']
  },
  birth2: {
      type: String,
      required: [true, '생년월일은 필수입니다.']
  },
  birth3: {
      type: String,
      required: [true, '생년월일은 필수입니다.']
  },
  sex: {
      type : String,
      required: [true, '성별은 필수입니다.']
  },
  email: String,
  money: {
      type: Number,
      default : '0'
  },
  credit: {
      type: String,
      default : 5
  },
});

UserSchema.plugin( autoIncrement.plugin , { model : "user", field : "id" , startAt : 1 } );
module.exports = mongoose.model('user' , UserSchema);