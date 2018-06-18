/** @author: Yeji-Kim
*   @date: 2018-05-18 ~ 
*   @description: WebServer(express) _ ws server.
*/
var WebSocket = require('ws');
//const debug=require('./makedebuglog.js').debug_error();
var global = require('./global.js');
var BlockChain = require('./Blockchain.js');
var Transaction = require('./Transaction.js');
var BankModel = require('../models/VirtualBankModel');
var UserModel = require('../models/UserModel');
var RestrictedUserModel = require('../models/RestrictedUserModel.js');

var wss = new WebSocket.Server({ port: 8889 });

/**
 * @namespace {Object} client
 * @example
 * client=[ { IP:String, Port:Integer},... ]
 * @namespace {BlockChain} global.blockchain
 * @description server가 가질 chain 변수 이름
 */
let client = []; //save client ip and port

global.blockchain = new BlockChain();

wss.broadcast = function (data) {
    wss.clients.forEach(function each(client) {
        if (client.readyState == WebSocket.OPEN) {
            var BroadData = JSON.stringify(data);
            client.send(BroadData);
            console.log('Broadcasting : ' + BroadData);
        }
    });
}

function makeCIQ(type) {
    /**@description typeArray는 client ip, port 전부 날리는거고
     * typeObject는 최근에 들어온 ip,port 날려주는 거
     */
    let CIQ = {};
    CIQ.Format = 'CIQ';
    if (type == 'Array') {
        CIQ.Type = 'Array';
        CIQ.Array = client.slice();
    } else {
        CIQ.Type = 'Object';
        CIQ.Object = client.pop();
        client.push(CIQ.Object);
    }
    return CIQ;
}

let recv = function (message) {
    var msg = JSON.parse(message);
    console.log(message);
    if (msg.Format == 'IAP') {
        //새로운 IP 가 접속했다는 의미
        client.push({
            IP: msg.IP, Port: msg.Port
        });
        this.send(JSON.stringify(makeCIQ('Array')));

        //지금 접속한 얘 제외하고 나머지에게 최근에 들어온 node를 접속하라고 CIQ_type:Obj로 전송 -> client.js 에서 제어
        if (client.length > 1)
            wss.broadcast(makeCIQ('Object'));

        // this.send(JSON.stringify(blockchain.makeACQ()));
    }
    else if (msg.Format == 'CIS') {
        if (msg.Status == 'Fail') {
            if (msg.Type == 'Array')
                this.send(JSON.stringify(makeCIQ('Array')));
            else if (msg.Type == 'Object')
                this.send(JSON.stringify(makeCIQ('Object')));
            //else nothing to do.
        }
    }
    else if (msg.Format == 'BAR') {
        if (msg.Data.Status == 'Success') {
            // @todo 
            // 2/3 이상의 클라이언트가 블록을 추가했을때 서버 체인에 추가하는 조건 필요
            global.blockchain.count++;
            let len = client.length;
            let n = len - parseInt((len - 1) / 3); //최소 n개의 valid-verifying이 있어야됨.
            if ((global.blockchain.getLatestBlock().index + 1 == msg.Block.Index)
                /*&& global.blockchain.count >= n*/) {
                //console.log('87 : received BAR');
                console.log("89 : msg : ", msg);
                global.blockchain.appendingBlock_server_chain(msg);
                global.blockchain.count = 0;
                console.log(global.blockchain.chain);
                console.log('92 : msg.Block.Transactions : ', msg.Block.Transactions);
                var recent_tr = msg.Block.Transactions;
                var query = {
                    username: undefined, account_number: undefined, balance: undefined,
                }

                if (!recent_tr.status) { //새로 생긴 transaction
                    console.log('98 : recent_tr.creditor : ',recent_tr.creditor);
                    BankModel.findOne({ username: recent_tr.creditor }, (err, res) => {
                        if (!res) console.log('99: node/server.js ERROR! CAN NOT FIND BANK MODEL!!!!');
                        query.username = recent_tr.creditor;
                        query.account_number = res.account_number;
                        query.balance = res.balance - recent_tr.money;
                        res.update({ username: recent_tr.creditor }, { $set: query });
                    });

                    BankModel.findOne({ username: recent_tr.debtor }, (err, res) => {
                        if (!res) console.log('108: node/server.js ERROR! CAN NOT FIND BANK MODEL!!!!');
                        query.username = recent_tr.debtor;
                        query.account_number = res.account_number;
                        query.balance = res.balance + recent_tr.money;
                        res.update({ username: recent_tr.debtor }, { $set: query });
                    });
                }
                else { //상환된 transaction
                    var days=getDayDiff(getTodayDate(), dueDate);
                    let Overdue;
                    if(days == 30){
                        UserModel.findOne({username : recent_tr.debtor}, (err, res) =>{
                            if(!res) console.log("119 : node/server.js ERROR! CAN NOT FIND User Model");
                            Overdue = res.overdue + 1;
                        });
                        UserModel.updateOne({username : recent_tr.debtor}, { $set:{overdue : Overdue}});
                        
                    }

                    BankModel.findOne({ username: recent_tr.creditor }, (err, res) => {
                        if (!res) console.log('121: node/server.js ERROR! CAN NOT FIND BANK MODEL!!!!');
                        query.username = recent_tr.creditor;
                        query.account_number = res.account_number;

                        query.balance = res.balance + recent_tr.money + (recent_tr.money * recent_tr.day_rate) * days;

                        res.update({ username: recent_tr.creditor }, { $set: query });

                    })
                    BankModel.findOne({ username: recent_tr.debtor }, (err, res) => {
                        if (!res) console.log('128: node/server.js ERROR! CAN NOT FIND BANK MODEL!!!!');
                        query.username = recent_tr.debtor;
                        query.account_number = res.account_number;

                        query.balance = res.balance - recent_tr.money - (recent_tr.money * recent_tr.day_rate) * days;
                        
                        if(query.balance<0){ //음수가 될 수 없으니까
                            //@todo 강제상환 부분
                        query.balance = res.balance + recent_tr.money + (recent_tr.money * recent_tr.day_rate) * days;

                        res.update({ username: recent_tr.creditor }, { $set: query });
                        }

                    })
                    BankModel.findOne({ username: recent_tr.debtor }, (err, res) => {
                        if (!res) console.log('128: node/server.js ERROR! CAN NOT FIND BANK MODEL!!!!');
                        query.username = recent_tr.debtor;
                        query.account_number = res.account_number;

                        query.balance = res.balance - recent_tr.money - (recent_tr.money * recent_tr.day_rate) * days;
                        
                        if(query.balance<0){ //음수가 될 수 없으니까
                            //@todo 강제상환 부분
                            query.balance=0;
                        }

                        res.update({ username: recent_tr.debtor }, { $set: query });
                    })
                }

            }

        }

    }
}

function getTodayDate() {
    return new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
}
/**
 * @param {String} date1 '2018-06-08'
 * @param {String} date2 '2018-06-08'
 * @returns {Integer} date1이 date2보다 과거이면 양수 값, date1이 date2보다 미래면 마이너스를 반환합니다. 일치하면 0
 */
function getDayDiff(date1, date2) { //두 날짜간의 일 차이를 구한다.
    var d1 = new Date(date1);
    var d2 = new Date(date2);
    var diff = (d2.getTime() - d1.getTime());
    diff = Math.ceil(diff / (1000 * 3600 * 24));
    return diff;
}

function noop() { }
function heartbeat() { this.isAlive = true; }


module.exports.init = function () {
    wss.on('connection', function connection(ws, req) {
        ws.isAlive = true;
        ws.on('message', recv);
        ws.on('pong', heartbeat);

    });

    console.log('Blockchain Server is opened!');


    // const interval = setInterval(function ping() {
    //     wss.clients.forEach((ws) => {
    //         if (ws.isAlive != true) {
    //             //@todo 닫혔을 때 client[] 안에 있는거 find ip 찾아서 해당 data remove, 근데 어떻게 찾는지 모름... ㅠㅠㅠㅠ 
    //             let index = client.findIndex(ele => {
    //                 return (ele.IP == ws._socket.remoteAddress);
    //             })

    //             console.log('104,', client[index], 'disconnected.');

    //             if (index != 0) {
    //                 client.slice(0, index - 1).join(client.slice(index + 1, client.length - 1));
    //             } else {
    //                 client.shift();
    //             }

    //             return ws.terminate();
    //         } else {
    //             //console.log('114: all alive!');
    //         }
    //         ws.isAlive = false;
    //         ws.ping(noop);

    //     });
    // }, 2000);

    const interval2 = setInterval(() => {
        if (global.blockchain.pendingTransactions.length >= 1 && client.length != 0) {
            var random_int = Math.floor(Math.random() * client.length);
            var iter = wss.clients.values(); //type Set

            for (let i = 0; i < random_int - 1; i++) {
                iter.next();
            }

            iter.next().value.send(JSON.stringify({
                Format: "CCR",
                Data: {
                    "Status": "Confirm",
                    "Info": "None",
                },
                Transaction: global.blockchain.pendingTransactions.shift(),
            }));
            console.log('126, Send CCR to', client[random_int].IP, ':', client[random_int].Port);
        }
    }, 3000);

    const interval3 = setInterval(()=>{
        //@todo 사용자 overdue 5회인지 체크, sample version은 overdue가 1일때 로그인 제한
        UserModel.update({overdue: 1}, {$set: {login_permit: false} }, function(err, res){
            if(err){
                console.log("231 : overdue 5 User update error");
            }else{
                console.log("overdue 5 users are restricted");
            }
        });
        // UserModel.find({ overdue : 5}, function(err, users){
        //     //users : Array
        //     users.forEach(ele=>{
        //         ele.update()
        //         var rusermodel = new RestrictedUserModel({
        //             username: ele.username,
        //         });
                
        //     });
            
        // });
        // UserModel.remove({ overdue : 5});
        // @todo usermodel에서 채무자 overdue +1, 5번넘으면 remove,
        // 강제거래 완료이므로 Transaction 만들고, 거래완료 true


        var result=global.blockchain.findDueTransaction();
        if(result.length!=0){
            result.forEach(ele=>{
                ele.status=true;
                global.blockchain.createTransaction(ele);
            })
        }
        
    },12*3600*1000);

    //temp block
    // setTimeout(() => {

    //     global.blockchain.createTransaction(new Transaction('aa', 'bb', 10000));
    //     console.log('132, Make new Transactions!');
    // }, 5000);

}
