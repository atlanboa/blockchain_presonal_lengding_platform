var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');

/**
 * @param {String} String 사용자이름
 * @param {String} Number 계좌번호
 * @param {Number} balance 잔액
 */
var BankSchema = new Schema({
    username: {
        type: String,
        required: [true],
        unique: true
    },
    account_number: {
        type: Number,
        required: [true]
    },
    balance: {
        type: Number,
        default: 0,
        required: [true]
    },
});

BankSchema.plugin(autoIncrement.plugin, { model: "bank", field: "id", startAt: 1 });
module.exports = mongoose.model('bank', BankSchema);
