/**
 * @author Yeji-Kim Jaden-Kim
 * @date 2018-05-19
 * @param {String} creditor Person
 * @param {String} debtor Person
 * @param {Integer} money Money
 * @param {Date} dueDate date
 * @param {Integer} rate 이자율
 * @description Transaction Class. uasge: const transaction = new Transaction(creditor, debtor, money, date, rate)
 */
module.exports=class Transaction{
    constructor(creditor, debtor, money, date){
        this.creditor = creditor;
        this.debtor = debtor;
        this.money = money;
        this.dueDate = date;
        this.rate = rate;
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