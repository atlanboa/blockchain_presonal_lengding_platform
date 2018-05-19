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

let client=[]; //save client ip and port

let server_recv=function(message){
    var msg=JSON.parse(message);

}
wss.on('connection',function(ws,req){
    ws.on('message',server_recv);
})



let client_recv=function(message){
    var msg=JSON.parse(message);
    if(msg.Format=='PID'){
        client=msg.Array.slice();
    }
    else if(msg.Format=='VBR'){
        let len=client.length;
        verify = verify +1
        let n = len - parseInt((len-1)/3); //최소 n개의 valid-verifying이 있어야됨.
        //@todo
        if(verfiy >= n){
            appendBlock(block);
        }
    }
}


/**WebServer_ws 와 연결하는 부분 */
var connect = function(){ 
    ws.on('open',function(){
        console.log('Connect with Web_server_wss');
        
        ws.send(JSON.stringify({
            IP:IP, Port:MYPORT
        }));
        
        //ws.send(type:String);
        
        ws.on('close',()=>{
            /** 서버와 연결이 끊어졌을 때 어떻게 동작해야 하는지 아래에 기술 */
            console.log('connection is close!');
            //reconnect
        });

    });

    ws.on('message',client_recv);
}

connect();
