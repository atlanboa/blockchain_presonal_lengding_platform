var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');
var BankSchema = new Schema({
    name: {
        type: String,
        required: [true],
        unique: true
    },
    account_number: {
        type: String,
        required: [true]
    },
    balance: {
        type: Number,
        default: 0,
        required: [true]
    },
});

BankSchema.plugin(autoIncrement.plugin, { model: "bank", field: "id", startAt: 1 });
module.exports = mongoose.model('user', BankSchema);