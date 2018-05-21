/**
 * @author Yeji-Kim Jaden-Kim
 * @date 2018-05-21
 * @description Blockchain class
 * @example var chain=new BlockChain()
 */
var Block = require('./block.js');
var Transaction=require('./Transaction.js');

module.exports = class Blockchain {
    /**
     * @class BlockChain
     * 
     * @property {Integer} verify VBR message count variable
     * @property {Integer} count BRR message count variable
     * 
     * @function createGenesisBlock blockchain이 생성이 되면 genesisBlock이 처음 체인에 달리게됨 이 때 index를 증가시켜줌
     * @function createTempBlock make msg into block and save block as tempBlock
     * @function createBlock When Client needs to create block and send other peers
     * @function appendingBlock When Client makes a decision to add a block to the blockchain
     * @function verifyBlock verify init이 0이면 client가 검증 정보를 전달하기 전에 verify++해야함
     * @function isChainValid Check that Chain is valid.
     */
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.pendingTransactions = [];
        this.verify = 0;
        this.verify_state = true;
        this.count = 0;
        this.count_state = true;
        this.tempBlock = undefined;
    
        //this.miningReward = 100;
        //this.difficulty = 2;
    }

    createGenesisBlock() { 
        var genesisBlock = new Block(Date.parse("2017-01-01"), new Transaction(), "0", 0);
        return genesisBlock;
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    createTempBlock2(timestamp,transaction,previousHash,index){
        this.tempBlock=new Block(timestamp,transaction,previousHash,index);
    }

    createTempBlock() {
        let block = new Block(Date.now(), this.pendingTransactions.shift(), this.getLatestBlock().index+1);
       
        this.tempBlock = block;
    }

    appendingBlock() {
        this.verify_state=false;
        this.verify = 0;
        this.count =0;
        this.chain.push(this.tempBlock);
        
    }

    verifyBlock() {
        let previousblock = this.getLatestBlock();
        if (this.tempBlock.hash == previousblock.calculateHash()) {
            this.verify++;
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
        BDS.PreviousHash = this.tempBlock.previousHash;
        BDS.Timestamp = this.tempBlock.timestamp;
        BDS.Transactions = this.tempBlock.transactions;
        BDS.Hash = this.tempBlock.hash;
        BDS.Index = this.tempBlock.index;

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
    makeACQ(){
        var ACQ={
            Format:'ACQ',
            Data:{
                chain:this.chain,
                pendingTransactions:this.pendingTransactions,
            }
        };
        return ACQ;
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
    //string으로 전달받은 chain을 다시 바꾸는중..
    changeStringChain_to_BlockChain(arr){
        this.chain.pop(); //pop genesis block.
        arr.forEach(ele=>{
            this.chain.push(new Block(ele.timestamp,new Transaction(ele.transactions.creditor,ele.transactions.debtor,ele.transactions.money),ele.previousHash,ele.index));
        })
        
    }
    changeString_to_Transactions(arr){
        arr.forEach(ele=>{
            this.pendingTransactions.push(new Transaction(ele.creditor,ele.debtor,ele.money));
        })
    }

}