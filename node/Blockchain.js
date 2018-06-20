/**
 * @author Yeji-Kim Jaden-Kim
 * @date 2018-05-21
 * @description Blockchain class
 * @example var chain=new BlockChain()
 */
var Block = require('./block.js');
var Transaction = require('./Transaction.js');

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
        this.count = 0;
        this.count_state = true;
        this.tempBlock = undefined;

        //this.miningReward = 100;
        //this.difficulty = 2;
        this.testappendBlock();
    }

    createGenesisBlock() {

        var genesisBlock = new Block(Date.parse("2018-06-17"), new Transaction("1", "2", 100000, Date.parse("2018-06-20"), "주"), "0", 0, false);
        return genesisBlock;
    }
    testappendBlock() {
        this.chain.push(new Block(Date.parse("2018-06-17"), new Transaction("2", "1", 95000, Date.parse("2018-06-21"), "주"), "0", 0, false));
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    createTempBlock2(timestamp, transaction, previousHash, index) {
        this.tempBlock = new Block(timestamp, transaction, previousHash, index);
    }

    createTempBlock() {
        let block = new Block(Date.now(), this.pendingTransactions.shift(), this.getLatestBlock().hash, this.getLatestBlock().index + 1);

        this.tempBlock = block;
    }

    appendingBlock() {
        this.count_state = true;
        this.verify = 0;
        this.count = 0;
        this.chain.push(this.tempBlock);
        console.log('60 Blockchain.js : Chain : ', this.chain);

    }
    // makeBAR(){
    //     let block = this.getLatestBlock();
    //     var BAR ={};
    //     BAR.Format = 'BAR';
    //     BAR.Data = {};
    //     BAR.Data.Status = 'Success';
    //     BAR.Block = {};
    //     BAR.Block.Timestamp = block.timestamp;
    //     BAR.Block.Transactions = block.transactions;
    //     BAR.Block.PreviousHash = block.previousHash;
    //     BAR.Block.Hash = block.hash;
    //     BAR.Block.Index = block.index;
    //     return BAR;
    // }
    appendingBlock_server_chain(msg) {
        this.chain.push(new Block(msg.Block.Timestamp, msg.Block.Transactions,
            msg.Block.PreviousHash, msg.Block.Index));

    }

    /**
     * @description 체인에서 관련 된 유저의 Trasaction을 반환합니다.
     * @return {Object} { creditor_list:Array, debtor_list:Array }
     * @param {String} userName 
     */
    findTransaction(userName) {
        var transaction_creditor = [];
        var transaction_debtor = [];
        this.chain.find(ele => {
            var tt = ele.getTransaction();

            if (tt.creditor == userName) {
                tt.dueDate = new Date(tt.dueDate).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
                console.log('9393:', tt.dueDate);
                if (tt.status == true) {
                    for (var trans in transaction_creditor) {
                        if (transaction_creditor[trans].dueDate == tt.dueDate && transaction_creditor[trans].money == tt.money) {
                            transaction_creditor[trans] = tt;
                            break;
                        }
                    }
                }else{
                    transaction_creditor.push(tt);
                }

                
            } else if (tt.debtor == userName) {
                tt.dueDate = new Date(tt.dueDate).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
                if (tt.status == true) {
                    for (var trans in transaction_debtor) {
                        if (transaction_debtor[trans].dueDate == tt.dueDate && transaction_debtor[trans].money == tt.money) {
                            transaction_debtor[trans] = tt;
                            break;
                        }
                    }
                }else{
                    transaction_debtor.push(tt);
                }
            }
        });

        return {
            creditor_list: transaction_creditor,
            debtor_list: transaction_debtor,
        }

    }

    findDueTransaction() {
        var result = [];
        var date = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
        this.chain.find(ele => {
            var tt = ele.getTransaction();
            if (!tt.status) {
                if (tt.duedate == date) { //강제상환 대상!
                    result.push(tt);
                }
            }
        })

        return result;
    }

    verifyBlock() {
        let previousblock = this.getLatestBlock();
        console.log('66 Blockchain.js Hash Result Comparing : ', this.tempBlock.previousHash, ' , ', previousblock.calculateHash());
        if (this.tempBlock.previousHash == previousblock.calculateHash()) {
            this.verify++;
            return true;
        }
        else {
            return false;
        }
    }
    makeBRR() {
        var BRR = {};
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
    makeBAR() {
        let block = this.getLatestBlock();
        var BAR = {};
        BAR.Format = 'BAR';
        BAR.Data = {};
        BAR.Data.Status = 'Success';
        BAR.Block = {};
        BAR.Block.PreviousHash = block.previousHash;
        BAR.Block.Timestamp = block.timestamp;
        BAR.Block.Transactions = block.transactions;
        console.log("180 : makeBAR : ", block.transactions);
        BAR.Block.Hash = block.hash;
        BAR.Block.Index = block.index;
        return BAR;
    }
    makeBDS() {
        var BDS = {};
        BDS.Format = 'BDS';
        BDS.Block = {};
        BDS.Block.PreviousHash = this.tempBlock.previousHash;
        BDS.Block.Timestamp = this.tempBlock.timestamp;
        BDS.Block.Transactions = this.tempBlock.transactions;
        BDS.Block.Hash = this.tempBlock.hash;
        BDS.Block.Index = this.tempBlock.index;

        return BDS;

    }

    makeIAP(ip, port) {
        var IAP = {};
        IAP.Format = 'IAP';
        IAP.IP = ip;
        IAP.Port = port;
        return IAP;
    }

    makeCIQ_Array() {
        var CIQ = {};
        CIQ.Format = 'CIQ';
        CIQ.Type = 'Array';
        CIQ.Array = [];
        CIQ.Array.push(/*something here*/);
        //잘 모르겠는데 이거 맞나
        return CIQ;
    }

    makeCIQ_Object() {
        var CIQ = {};
        CIQ.Format = 'CIQ';
        CIQ.Type = 'Object';
        CIQ.Object = [];
        CIQ.Object.push(/*something here*/);
        //이하 동문, 동문? 너 내 친구가 되라
        return CIQ;
    }

    makeCIS() {
        var CIS = {};
        CIS.Format = 'CIS';
        CIS.Status = 'Success';
    }
    makeACQ() {
        var ACQ = {
            Format: 'ACQ',
            Data: {
                chain: this.chain,
                pendingTransactions: this.pendingTransactions,
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

    makeACS(boolean) {
        var ACS = {};
        ACS.Format = 'ACS';
        if (boolean == true) {
            ACS.Status = 'Succes';
        }
        else {
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
    changeStringChain_to_BlockChain(arr) {
        this.chain.pop(); //pop genesis block.
        arr.forEach(ele => {
            this.chain.push(new Block(ele.timestamp, new Transaction(ele.transactions.creditor, ele.transactions.debtor, ele.transactions.money, new Date(ele.transactions.duedate), ele.transactions.rate, undefined, ele.transactions.status), ele.previousHash, ele.index));
        })

    }

    changeString_to_Transactions(arr) {
        arr.forEach(ele => {
            this.pendingTransactions.push(new Transaction(ele.creditor, ele.debtor, ele.money, ele.transactions.duedate, ele.transactions.rate, ele.transactions.rate_type, ele.transaction.status));
        })
    }

    changeDate_to_DueDate(days) {
        var t = new Date();
        t.setDate(t.getDate() + days);
        var options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        return t.toLocaleDateString('ko-KR', options);
    }
    
    changeDate_to_LocaleDateString() {
        var t = new Date();
        var options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        return t.toLocaleDateString('ko-KR', options);
    }


}