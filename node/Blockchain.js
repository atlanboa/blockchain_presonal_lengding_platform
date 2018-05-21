/**
 * @author Yeji-Kim
 * @date 2018-05-19
 * @description Blockchain class. usage: var chain=new BlockChain()
 * @editor Jaden-Kim
 */
var Block = require('./block.js');
const SHA256 = require('crypto-js/sha256')

module.exports = class Blockchain {
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.pendingTransactions = [];
        this.verify = 0;
        this.count = 0;
        this.tempBlock = undefined;
        

        //this.miningReward = 100;
        //this.difficulty = 2;
    }


    //blockchain이 생성이 되면 genesisBlock이 처음 체인에 달리게됨
    //이때 index를 증가시켜줌
    createGenesisBlock() { 
        var genesisBlock = new Block(Date.parse("2017-01-01"), [], "0", 0);
        return genesisBlock;
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    //make msg into block and save block as tempBlock
    createTempBlock(msg){
        this.tempBlock = new Block(msg.Block.PreviousHash, msg.Block.Timestamp
        , msg.Block.Transactions, msg.Block.Hash, msg.Block.Index);
    }

    createBlock() { //When Client needs to create block and send other peers
        let block = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock().hash, this.getLatestBlock.index+1);
        this.tempBlock = block;
    }

    //서버도 체인을 가진다면..?
    appendingBlock() { //When Client makes a decision to add a block to the blockchain
        this.chain.push(this.tempBlock);
        this.verify = 0;
        this.count =0;
    }

    verifyBlock() { //verify init이 0이면 client가 검증 정보를 전달하기 전에 verify++해야함
        let previousblock = this.getLatestBlock();
        if (this.tempBlock.hash == previousblock.calculateHash()) {
            return true;
        }
        else {
            return false;
        }
    }

    makeBRR(){
        var BRR ={};
        BRR.Format = 'BRR';
        BRR.Data = {};
        BRR.Data.Status = 'Success';
        BRR.Data.Index = this.tempBlock.index;
        BRR.Data.Info = 'None'
        return BRR;
    }

    makeVBR(Boolean) {
        if (Boolean == true) {
            var VBR = {};
            VBR.Format = 'VBR';
            VBR.Data = {};
            VBR.Data.Status = 'Valid';
            VBR.Data.Index = this.tempBlock.index;
            VBR.Data.Info = 'None';
        }
        else {
            var VBR = {};
            VBR.Format = 'VBR';
            VBR.Data = {};
            VBR.Data.Status = 'Non_Valid';
            VBR.Data.Info = 'None';
        }

        return VBR;
    }


    makeTRD() {
        var TRD = {};
        TRD.Format = 'TRD';
        TRD.Data = [];
        TRD.Data.push(this.pendingTransactions.shift());
        // for(var i =0; i<5; i++){ //this code for 5 transactions sending
        //     TRD.Data.push(this.pendingTransactions.shift());
        // }
        return TRD;
    }

    makeBDS() {
        var BDS = {};
        BDS.PreviousHash = this.tempBlock.previousHash;
        BDS.Timestamp = this.tempBlock.timestamp;
        BDS.Transactions = {};
        BDS.Transactions.Creditor = this.tempBlock.creditor;
        BDS.Transactions.Debtor = this.tempBlock.debtor;
        BDS.Transactions.Money = this.tempBlock.money;
        BDS.Hash = this.tempBlock.hash;
        BDS.Index = this.tempBlock.index;
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

    createTransaction(transaction) {
        this.pendingTransactions.push(transaction);
    }


    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
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