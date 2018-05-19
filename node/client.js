/*  @ author: Yeji-Kim
    @ date: 2018-05-18
    @ description: node _ ws client.
*/
const WEB_SERVER_IP='192.168.0.15';
const PORT=4000;
const MYPORT=5000;
const IP=require('ip').address();

var WebSocket = require('ws');

var wss=new WebSocket.Server({ port: MYPORT });
var ws=new WebSocket('ws://'+WEB_SERVER_IP+':'+PORT.toString());

var node_list=[]; //save Websocket
let client=[]; //save client ip and port
/* {Ip: , Port: } */



wss.on('connection',function(ws,req){
    ws.on('message',server_recv);
})

let server_recv=function(message){
    var msg=JSON.parse(message);
    if(msg.Format=='CIQ'){
        if(msg.Type=='Array'){
            client=msg.Array.slice();
            client.forEach(ele => {
                node_list.push(new WebSocket(getWsAddr(ele.Ip,ele.Port))); //create socket.
            });
            node_list.forEach(ele=>{
                connect_node(ele);
            })
        }else{
            client.push(msg.Object);
            node_list.push(new WebSocket(getWsAddr(msg.Object.Ip,msg.Object.Port)));
        }
    }
}

let client_recv=function(message){
    var msg=JSON.parse(message);
    
    if(msg.Format=='VBR'){
        let len=client.length;
        verify = verify +1
        let n = len - parseInt((len-1)/3); //최소 n개의 valid-verifying이 있어야됨.
        //@todo
        if(verfiy >= n){
            appendBlock(block);
        }
    }
}

/**각 노드와 연결하려는 부분 */
var connect_node=function(ws){

    ws.on('open',()=>{
        console.log('Connect with node I\'m',IP);
    });
    ws.on('close',()=>{
        console.log('connection_node is closed!');
    })
    ws.on('message',client_recv);
}

/**WebServer_ws 와 연결하는 부분 */
var connect = function(){ 
    ws.on('open',function(){
        console.log('Connect with Web_server_wss');
        
        ws.send(JSON.stringify({
            IP:IP, Port:MYPORT
        }));
        
        ws.on('close',()=>{
            /** 서버와 연결이 끊어졌을 때 어떻게 동작해야 하는지 아래에 기술 */
            console.log('connection is close!');
            //reconnect
        });

    });

    ws.on('message',server_recv);
}


/** other function */

function getWsAddr(ip,port){
    /** @param {String} ip
     *  @param {Integer} port
     */
    return 'ws://'+ip+':'+port.toString();
}



/**main */
connect();