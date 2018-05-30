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
//new Blockchain해주면 genesis Block은 기본으로 생성됨.
//Blockchain.js constructor 확인해봐
// blockchain.createGenesisBlock();

// blockchain.createTransaction(new Transaction('ab','dd',12300));
// blockchain.createTransaction(new Transaction('ac','ab',12000));
// blockchain.createTransaction(new Transaction('dd','aa',10400));


wss.broadcast = function(data){
        wss.clients.forEach(function each(client) {
            if(client.readyState == WebSocket.OPEN) {
                var BroadData = JSON.stringify(data);
                client.send(BroadData);
                console.log('Broadcasting : ' + BroadData);
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
            wss.broadcast(makeCIQ('Object'));
        
        // this.send(JSON.stringify(blockchain.makeACQ()));
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


module.exports.init=function(){
    wss.on('connection',function connection(ws,req){
        ws.isAlive=true;
        ws.on('message',recv);
        ws.on('pong',heartbeat);
    
    });
    
    console.log('Server is opened!');
    
    
    const interval=setInterval(function ping(){
        wss.clients.forEach((ws)=>{
            if(ws.isAlive!=true) {
                //@todo 닫혔을 때 client[] 안에 있는거 find ip 찾아서 해당 data remove, 근데 어떻게 찾는지 모름... ㅠㅠㅠㅠ 
                let index=client.findIndex(ele=>{
                    return(ele.IP==ws._socket.remoteAddress);
                })
    
                console.log('104,',client[index],'disconnected.');
                
                if(index!=0){
                    client.slice(0,index-1).join(client.slice(index+1,client.length-1));
                }else{
                    client.shift();
                }           
                
                return ws.terminate();
            }else{
                //console.log('114: all alive!');
            }
            ws.isAlive=false;
            ws.ping(noop);
            
        });
    },2000);
    
    const interval2=setInterval(()=>{
        if(blockchain.pendingTransactions.length >= 1 && client.length!=0){
            var random_int=Math.floor(Math.random()*client.length);
            var iter=wss.clients.values(); //type Set
        
            for(let i=0;i<random_int-1;i++){
                iter.next();
            }
    
            iter.next().value.send(JSON.stringify({
                Format: "CCR",
                Data: {
                        "Status": "Confirm",
                        "Info": "None",
                },
                Transaction:blockchain.pendingTransactions.shift(),
            }));
            console.log('126, Send CCR to',client[random_int].IP,':',client[random_int].Port);
        }
    },3000);
    
    setTimeout(()=>{
        blockchain.createTransaction(new Transaction('aa','bb',10000));
        console.log('132, Make new Transactions!');
    },5000);

}
