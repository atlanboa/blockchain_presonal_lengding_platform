/**
 * @author Yeji-Kim Jaden-Kim
 * @date 2018-05-19
 * @description Transaction Class. uasge: const transaction = new Transaction(creditor, debtor, money)
 */
module.exports=class Transaction{
    constructor(creditor, debtor, money){
        this.creditor = creditor;
        this.debtor = debtor;
        this.money = money;
        //@todo
        //상환 일자, 이자율
    }
}