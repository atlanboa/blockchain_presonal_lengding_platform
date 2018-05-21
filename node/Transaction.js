/**
 * @author Yeji-Kim
 * @date 2018-05-19
 * @description Transaction Class. uasge: const transaction = new Transaction(creditor, debtor, money)
 */
module.exports=class Transaction{
    constructor(creditor, debtor, money){
        this.creditor = creditor;
        this.debtor = debtor;
        this.money = money;
    }
    // makeJson(){
    //     return {
    //         creditor:this.creditor,
    //         debtor:this.debtor,
    //         money:this.money,
    //     }
    // }
}