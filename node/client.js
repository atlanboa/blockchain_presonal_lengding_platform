/**
 * @author: Yeji-Kim
 * @description: node _ ws client.
 * 
*/
const BlockChain=require('./Blockchain.js');
const Block=require('./Block.js');
const WEB_SERVER_IP=require('ip').address().toString();
const PORT=8889;
const MYPORT=getRandomInt(3000,8500);

console.log('WebServer port:',PORT,' My wss port:',MYPORT);

const IP=require('ip').address();

var WebSocket = require('ws');
var wss=new WebSocket.Server({ port: MYPORT });
var ws=new WebSocket('ws://'+WEB_SERVER_IP+':'+PORT.toString());

/**
 * @namespace {Object} node_list 
 * @example
 * node_list=[{ws:,IP:,Port:,},...]
 * IP 와 Port가 해당 클라이언트의 ip 와 port인 경우에 삽입하지 않습니다.
 * @namespace {Object} client
 * @example
 * client=[{IP:,Port:},...]
 * WebServer_ws 에서 CIQ로 날라온 접속된 client의 목록을 저장하는 변수입니다.
 * @namespace {BlockChain} blockchain
 * @description client가 가질 Chain 변수 이름
 */
var node_list=[];
let client=[];
var blockchain=undefined;


wss.broadcast = function(data){
    wss.clients.forEach(function each(client) {
        if(client.readyState == WebSocket.OPEN) {
            var BroadData = JSON.stringify(data);
            client.send(BroadData);
            console.log('Braodcasting : ' + data);
        }
    });
}

//client's wss server open.
wss.on('connection',function(ws,req){
    console.log('25: Someone connect with me.');
    ws.on('message',server_recv);
});


/**WebServer_ws 와 연결하는 부분 */
var connect_server = function(){ 
    ws.on('open',function(){
        console.log('33: Connect with Web_server_wss');
        var IAP={};
        IAP.Format='IAP';
        IAP.IP=IP;
        IAP.Port=MYPORT;
        ws.send(JSON.stringify(IAP));
        
        ws.on('close',()=>{
            /** 서버와 연결이 끊어졌을 때 어떻게 동작해야 하는지 아래에 기술 */
            console.log('42: WebServer is closed!');
            //reconnect
        });

    });

    ws.on('message',webServer_recv);
}

let webServer_recv=function(message){
    console.log('64:webServer_recv,',message);
    var msg=JSON.parse(message);

    if(msg.Format=='CIQ'){
        if(msg.Type=='Array'){
            client=msg.Array.slice();
            client.forEach(ele => {
                if(!(ele.IP==IP && ele.Port==MYPORT)){
                    node_list.push({ws:new WebSocket(getWsAddr(ele.IP,ele.Port)),IP:ele.IP,Port:ele.Port}); //create socket.
                }else{
                    console.log('74: My Ip and Port. Ignore.');
                }
            });

            node_list.forEach(ele=>{
                connect_node(ele.ws);
                console.log('79: Connect with',ele.IP,':',ele.Port);
            });

        }else if(msg.Type=='Object'){
            if(!(msg.Object.IP==IP && msg.Object.Port==MYPORT)){
                //내가 새로 추가된 노드 일때는 push 할 필요 없음.
                //msg.Type 'Array'에서 처리되어야 함. (server.js 68 line)
                client.push(msg.Object);
                node_list.push(new WebSocket(getWsAddr(msg.Object.IP,msg.Object.Port)));
                connect_node(node_list[node_list.length-1].ws); 
                var CIS={}; CIS.Format='CIS';
                CIS.Status='Success'; CIS.Type='Object';
                this.send(JSON.stringify(CIS));
                console.log('94:Connect With',msg.Object.IP,':',msg.Object.Port);
            }else{
                console.log('95: My Ip and Port. Ignore.');
            }
            
        }else{
            console.error('86:CIQ type is fault?');
            console.error('100:',message);
            var CIS={}; CIS.Format='Fail';
            CIS.Status='Success'; CIS.Type=msg.Type;
            this.send(JSON.stringify(CIS));
            
        }
    }
    else if(msg.Format=='ACQ'){
        if(!blockchain){ //not setting
            blockchain = new BlockChain();
            blockchain.changeStringChain_to_BlockChain(msg.Data.chain);
            blockchain.changeString_to_Transactions(msg.Data.pendingTransactions);

        }else{
            console.log('135,Warnning, BlockChain is changed. Is that right?');
        }
    }
    else if(msg.Format=='CCR'){
        sendBlock();
    }
}

/**각 노드와 연결하려는 부분 */
var connect_node=function(ws){
    ws.on('open',()=>{
        //console.log('Connect with node I\'m',IP);
        ws.send("I'm "+IP.toString()+':'+MYPORT.toString());
 
        ws.on('close',()=>{
            console.log('105: Connection_node is closed!');
        })
    });
    
    ws.on('message',client_recv);
}

let client_recv=function(message){ //ws 에 붙어야 함.
    console.log('113: client_recv,',message);
}

var object_to_Transaction=function(msg) {
    return new Transaction(msg.Creditor,msg.Debtor,msg.Money);
}

let server_recv=function(message){ //wss에 붙어야 함.
    console.log('118: server_recv,',message);

    var msg=JSON.parse(message);
    if(msg.Format=='BDS'){
        //@todo
        //tempBlock에 저장하는 코드
        //BRR send하는 코드
        if(blockchain.getLatestBlock().index+1 == msg.Block.Index){
            //받은 BDS 데이터의 블록 index가 다음 생성될 블록의 index와 일치하면
            //blockchain.tempBlock에 저장
            blockchain.createTempBlock2(msg.Block.TimeStamp,object_to_Transaction(msg.Block.Transactions),msg.Block.PreviousHash,msg.Block.Index);

            wss.broadcast(JSON.stringify(blockchain.makeBRR()));
        }
    }
    else if(msg.Format=='BRR'){
        if(blockchain.getLatestBlock().index+1 == msg.Data.Index){
            //받은 BRR 데이터의 index가 다음 생성될 블록의 index와 일치하면
            blockchain.count = blockchain.count + 1;
            let len=client.length;   
            let n = len - parseInt((len-1)/3); //최소 n개의 valid-verifying이 있어야됨.
            //@todo
            if((blockchain.count >= n)&&(blockchain.count_state == true)){
                //n개 이상의 node가 블록을 수신했으면 검증 결과 배포
                verifiedResult();
            }
        }

    }
    else if(msg.Format=='VBR'){ //sendingBlock 함수가 실행될때 verify는 0으로 초기화
        if((blockchain.getLatestBlock().index+1 == msg.Data.Index)
            && msg.Data.Status =='Valid'){
            //받은 VBR 데이터의 index가 다음 생성될 블록의 index와 일치하면
            blockchain.verify = blockchain.verify +1;
            let len=client.length;
            let n = len - parseInt((len-1)/3); //최소 n개의 valid-verifying이 있어야됨.
            //@todo
            if((blockchain.verfiy >= n)&&(blockchain.verify_state == true)){
                //n개 이상의 node가 블록이 valid하다고 했을때
                blockchain.appendingBlock();
            }
        }

    }

}

function verifiedResult(){
    blockchain.count_state = false;
    blockchain.verify_state = true;
    wss.broadcast(JSON.stringify(blockchain.makeVBR(blockchain.verifyBlock())));
}

function sendBlock(){
    blockchain.pendingTransactions.push(new Transaction(msg.Transaction.creditor,msg.Transaction.debtor,msg.Transaction.money))
    blockchain.createTempBlock();
    blockchain.count++;
    blockchain.count_state=true;
    wss.broadcast(JSON.stringify(blockchain.makeBDS()));
}

/** other function */

function getWsAddr(ip,port){
    /** @param {String} ip
     *  @param {Integer} port
     */
    return 'ws://'+ip+':'+port.toString();
}

function getRandomInt(min, max) { //min ~ max 사이의 임의의 정수 반환
    return Math.floor(Math.random() * (max - min)) + min;
}


/**main */
connect_server();
