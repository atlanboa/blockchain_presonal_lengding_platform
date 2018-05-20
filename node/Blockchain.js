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

    createBlock() { //When Client needs to create block and send other peers
        let block = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock().hash);
        block.increaseIndex();
        this.block = block;
    }

    //서버도 체인을 가진다면..?
    appendingBlock() { //When Client makes a decision to add a block to the blockchain
        this.chain.push(this.block);
    }

    verifyBlock() {
        let previousblock = this.getLatestBlock();
        if (this.block.hash == previousblock.calculateHash()) {
            return true;
        }
        else {
            return false;
        }
    }

    makeCCR(){
        var CCR = {};
        CCR.Format = 'CCR';
        CCR.Data ={};
        CCR.Data.Status = 'Confirm';
        CCR.Data.Info = 'None';
        return CCR;
    }

    makeBRR(){
        var BRR ={};
        BRR.Format = 'BRR';
        BRR.Data = {};
        BRR.Data.Status = 'Success';
        BRR.Data.Info = 'None'
        return BRR;
    }

    makeVBR(Boolean) {
        if (Boolean == true) {
            var VBR = {};
            VBR.Format = 'VBR';
            VBR.Data = {};
            VBR.Data.Status = 'Valid';
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

    makeBAR(){
        var BAR ={};
        BAR.Format = 'BAR';
        BAR.Data = {};
        BAR.Data.Status = 'Success';
        BAR.Data.Info = 'None'
        return BAR;
    }
    makeBDS() {
        var BDS = {};
        BDS.Format = 'BDS';
        BDS.PreviousHash = this.block.previousHash;
        BDS.Timestamp = this.block.timestamp;
        BDS.Transactions = {};
        BDS.Transactions.Creditor = this.block.creditor;
        BDS.Transactions.Debtor = this.block.debtor;
        BDS.Transactions.Money = this.block.money;
        BDS.Hash = this.block.hash;
        BDS.Index = this.block.index;
        return BDS;

    }

    makeIAP(ip, port){
        var IAP = {};
        IAP.Format = 'IAP';
        IAP.IP = ip;
        IAP.Port = port;
        return IAP;
    }

    makeCIQ_Array(){
        var CIQ = {};
        CIQ.Format ='CIQ';
        CIQ.Type = 'Array';
        CIQ.Array = [];
        CIQ.Array.push(/*something here*/);
        //잘 모르겠는데 이거 맞나
        return CIQ;
    }

    makeCIQ_Object(){
        var CIQ = {};
        CIQ.Format ='CIQ';
        CIQ.Type = 'Object';
        CIQ.Object = [];
        CIQ.Object.push(/*something here*/);
        //이하 동문, 동문? 너 내 친구가 되라
        return CIQ;
    }

    makeCIS(){
        var CIS = {};
        CIS.Format = 'CIS';
        CIS.Status = 'Success';
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

    makeACQ(){
        
    }

    makeACS(boolean){
        var ACS = {};
        ACS.Format = 'ACS';
        if(boolean == true){
            ACS.Status = 'Succes';
        }
        else{
            ACS.Status = 'Fail';
        }
        return ACS;
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