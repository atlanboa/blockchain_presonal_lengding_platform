var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');
var RestrictedUserSchema = new Schema({
    username: {
        type: String,
        required: [true, ''],
        unique: true
    },
    phone: {
        type: String,
        required: [true, ''],
        unique: true
    },
    email: String,
    credit: {
        type: String,
        default: 5
    },
});
/*
일정 횟수 이상 연체시, 제한된 유저로써 DB에 저장
같은 id, email, phone 셋 중에 하나로도 동일할 경우 가입 제한 - 제약 거는 방법은 다양하나 샘플이기때문에 간단한 제약으로만 제시.
휴대폰 인증이 된다는 가정 - 휴대폰 번호가 바뀌는 경우 : 이름과 번호가 동일한 경우
*/
RestrictedUserSchema.plugin(autoIncrement.plugin, { model: "res-user", field: "id", startAt: 1 });
module.exports = mongoose.model('res-user', RestrictedUserSchema);