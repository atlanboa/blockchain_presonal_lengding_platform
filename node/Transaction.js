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
     * @description Transaction Class. uasge: const transaction = new Transaction(creditor, debtor, money, date, rate)
     * 일 이자율로 고정 (계산하기 편함)
     */
    constructor(creditor, debtor, money, date,rate,rate_type){
        this.creditor = creditor;
        this.debtor = debtor;
        this.money = money;
        this.dueDate = date;
        this.rate = rate;
        this.rate_type=rate_type;
        this.status = false;
        
        switch(this.rate_type){
            case '연':
                this.day_rate=WPRtoDPR(MPRtoWPR(APRtoMPR(this.rate)));
                break;
            case '달':
                this.day_rate=MPRtoWPR(WPRtoDPR(this.rate))                ;
                break;
            case '주':
                this.day_rate=WPRtoDPR(this.rate);
                break;
            default:
                this.day_rate=this.rate;
            break;
        }
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
    APRtoMPR(rate){
        rate=rate/12;
        return rate;
    }   
    MPRtoAPR(rate){
        rate=rate*12;
        return rate;
    }
    MPRtoWPR(rate){
        rate=rate/4;
        return rate;
    }
    WPRtoDPR(rate){
        rate=rate/7;
        return rate;
    }
    DPRtoWPR(rate){
        rate=rate*7;
        return rate;
    }
    WPRtoMPR(rate){
        rate=rate*4;
        return rate;
    }

}