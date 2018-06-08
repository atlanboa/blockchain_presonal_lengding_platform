/**
 * @author Yeji-Kim Jaden-Kim
 * @date 2018-06-28
 */
module.exports=class Transaction{
    /**
     * @param {String} creditor Person
     * @param {String} debtor Person
     * @param {Integer} money Money
     * @param {Date} dueDate date
     * @param {Integer} rate 이자율
     * @param {Boolean} status true/ false
     * @param {Boolean} rate_type 
     * @description Transaction Class. uasge: const transaction = new Transaction(creditor, debtor, money, date, rate)
     * @todo rate_type 에 따라서 고치는거 해야하는데 귀찮아서 안했음 뿌듯!
     */
    constructor(creditor, debtor, money, date,rate,rate_type='year'){
        this.creditor = creditor;
        this.debtor = debtor;
        this.money = money;
        this.dueDate = date;
        this.rate = rate;
        this.rate_type=rate_type;
        this.status = false;
    }
    getCreditor(){
        return this.creditor;
    }
    getDebtor(){
        return this.debtor;
    }

    repayment(){
        this.status = true;
    }

    /**
     * @description
     * APR: 연이자율, MPR: 월이자율, WPR: 주이자율, DPR: 일이자율
     */
    APRtoMPR(){
        rate=rate/12;
    }   
    MPRtoAPR(){
        rate=rate*12;
    }
    MPRtoWPR(){
        rate=rate/4;
    }
    WPRtoDPR(){
        rate=rate/7;
    }
    DPRtoWPR(){
        rate=rate*7;
    }
    WPRtoMPR(){
        rate=rate*4;
    }

}