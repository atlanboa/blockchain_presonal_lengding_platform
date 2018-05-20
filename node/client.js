/**
 * @author: Yeji-Kim
 * @description: node _ ws client.
 * 
*/

const WEB_SERVER_IP=require('ip').address().toString();
const PORT=8888;
const MYPORT=getRandomInt(3000,8500);

console.log('WebServer port:',PORT,' My wss port:',MYPORT);

const IP=require('ip').address();

var WebSocket = require('ws');
//const debug=require('./makedebuglog.js').debug_error();

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
 */
var node_list=[];
let client=[];


//client's wss server open.
wss.on('connection',function(ws,req){
    console.log('25: Someone connect with me.');
    ws.on('message',served_client);
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

    ws.on('message',server_recv);
}

let server_recv=function(message){
    console.log('64:server_recv,',message);
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
            })

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


let served_client=function(message){ //wss에 붙어야 함.
    console.log('118: served_client,',message);
    // var msg=JSON.parse(message);
    
    // if(msg.Format=='VBR'){
    //     let len=client.length;
    //     verify = verify +1
    //     let n = len - parseInt((len-1)/3); //최소 n개의 valid-verifying이 있어야됨.
    //     //@todo
    //     if(verfiy >= n){
    //         appendBlock(block);
    //     }
    // }
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
