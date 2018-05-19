/**
 * @author Yeji-Kim
 * @date 2018-05-19
 * @description Blockchain class. usage: var chain=new BlockChain()
 * @editor Jaden-Kim
 */
var Block = require('./block.js');
const SHA256 = require('crypto-js/sha256')

module.exports=class Blockchain{
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.pendingTransactions = [];
        this.verify = 0;
        this.block;

        //this.miningReward = 100;
        //this.difficulty = 2;
    }

    createGenesisBlock() {
        return new Block(Date.parse("2017-01-01"), [], "0");
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    createBlock(){ //When Client needs to create block and send other peers
        let block = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock().hash);
        block.increaseIndex();
        this.block = block;
    }

    //서버도 체인을 가진다면..?
    appendingBlock(){ //When Client makes a decision to add a block to the blockchain
        this.chain.push(this.block);
    } 

    verifyBlock(){
        let previousblock = this.getLatestBlock();
        if(this.block.hash == previousblock.calculateHash())
        {
            return true;
        }
        else{
            return false;
        }
    }
    
    constructTRD(){
        var TRD = {};
        TRD.Format = 'TRD';
        TRD.Data = [];
        TRD.Data.push(this.pendingTransactions.shift());
        // for(var i =0; i<5; i++){ //this code for 5 transactions sending
        //     TRD.Data.push(this.pendingTransactions.shift());
        // }
        return TRD;        
    }

    constructBDS(){
        var BDS = {};
        BDS.PreviousHash = this.block.previousHash;
        BDS.Timestamp=this.block.timestamp;
        BDS.Transactions={};
        BDS.Transactions.Creditor = this.block.creditor;
        BDS.Transactions.Debtor = this.block.debtor;
        BDS.Transactions.Money = this.block.money;
        BDS.Hash = this.block.hash;
        BDS.Index = this.block.index;
        return BDS;
    
    }

    // minePendingTransactions(miningRewardAddress){
    //     let block = this.createBlock();
    //     //block.mineBlock(this.difficulty);

    //     console.log('Block successfully created!');
    //     this.chain.push(block);

    //     this.pendingTransactions = [
    //     new Transaction(null, miningRewardAddress, this.miningReward)
    //     ];
    // }

    createTransaction(transaction){
        this.pendingTransactions.push(transaction);
    }


    isChainValid() {
        for (let i = 1; i < this.chain.length; i++){
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }

            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }

        return true;
    }
}