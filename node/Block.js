/**
 * @author Yeji-Kim
 * @date 2018-05-19
 * @description Block class. 
 * @example let block = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock().hash)
 * @editor Jaden-Kim
 */
const SHA256 = require('crypto-js/sha256')

module.exports=class Block{
    constructor(timestamp, transactions, previousHash = '', index) {
        this.previousHash = previousHash;
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.hash = this.calculateHash();
        this.index = index;
        //this.nonce = 0; //variable nonce is for mining.
    }

    calculateHash() {
        return SHA256(this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.index).toString();
    }

    increaseIndex(){
        return this.index++;
    }

    //Mining의 필요성이 없어서 삭제, mining에 사용되면 변수 nonce는 index로 대체
    //index는 block create될때 increaseIndex를 호출해서 증가

    // mineBlock(difficulty) {
    //     while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
    //         this.nonce++;
    //         this.hash = this.calculateHash();
    //     }

    //     console.log("BLOCK CREATED: " + this.hash);
    // }
}