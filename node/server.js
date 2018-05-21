/** @author: Yeji-Kim
*   @date: 2018-05-18
*   @description: WebServer(express) _ ws server.
*/
var WebSocket = require('ws');
//const debug=require('./makedebuglog.js').debug_error();
var BlockChain=require('./Blockchain.js');
var Transaction=require('./Transaction.js');
var wss = new WebSocket.Server({ port:8889 });

/**
 * @namespace {Object} client
 * @example
 * client=[ { IP:String, Port:Integer},... ]
 * @namespace {BlockChain} blockchain
 * @description server가 가질 chain 변수 이름
 */
let client=[]; //save client ip and port

var blockchain=new BlockChain();
blockchain.createGenesisBlock();
blockchain.createTransaction(new Transaction('aa','bb',10000));
blockchain.createTransaction(new Transaction('ab','dd',12300));
blockchain.createTransaction(new Transaction('ac','ab',12000));
blockchain.createTransaction(new Transaction('dd','aa',10400));


wss.broadcast = function(data){
        wss.clients.forEach(function each(client) {
            if(client.readyState == WebSocket.OPEN) {
                var BroadData = JSON.stringify(data);
                client.send(BroadData);
                console.log('Braodcasting : ' + data);
            }
        });
}

function makeCIQ(type){
    /**@description typeArray는 client ip, port 전부 날리는거고
     * typeObject는 최근에 들어온 ip,port 날려주는 거
     */
    let CIQ={};
    CIQ.Format='CIQ';
    if(type=='Array'){
        CIQ.Type='Array';
        CIQ.Array=client.slice();
    }else{
        CIQ.Type='Object';
        CIQ.Object=client.pop();
        client.push(CIQ.Object);
    }
    return CIQ;
}

let recv=function(message){
    var msg=JSON.parse(message);
    console.log(message);
    if(msg.Format=='IAP'){
        //새로운 IP 가 접속했다는 의미
        client.push({
            IP:msg.IP, Port:msg.Port
        });
        this.send(JSON.stringify(makeCIQ('Array')));
        
        //지금 접속한 얘 제외하고 나머지에게 최근에 들어온 node를 접속하라고 CIQ_type:Obj로 전송 -> client.js 에서 제어
        if(client.length > 1)
            wss.broadcast(JSON.stringify(makeCIQ('Object')));
        
        this.send(JSON.stringify(blockchain.makeACQ()));
    }
    else if(msg.Format=='CIS'){
        if(msg.Status=='Fail'){
            if(msg.Type=='Array')
                this.send(JSON.stringify(makeCIQ('Array')));
            else if(msg.Type=='Object')
                this.send(JSON.stringify(makeCIQ('Object')));
            //else nothing to do.
        }
    }
}

function noop(){}
function heartbeat(){ this.isAlive=true; }

wss.on('connection',function connection(ws,req){
    ws.on('message',recv);
    ws.on('pong',heartbeat);
    ws.isAlive=true;

});

console.log('Server is opened!');


const interval=setInterval(function ping(){
    wss.clients.forEach((ws)=>{
        if(ws.isAlive==false) {
            // @todo 닫혔을 때 client[] 안에 있는거 find ip 찾아서 해당 data remove, 근데 어떻게 찾는지 모름... ㅠㅠㅠㅠ 
            return ws.terminate();
        }
        ws.isAlive=false;
        ws.ping(noop);
        
    });
},30000);