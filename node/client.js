/*  @ author: Yeji-Kim
    @ date: 2018-05-18
    @ description: node _ ws client.
*/
const WEB_SERVER_IP='192.168.0.15';
const PORT=4000;
const MYPORT=4000;
const IP=require('ip').address();

var WebSocket = require('ws');

var wss=new WebSocket.Server({ port: MYPORT });
var ws=new WebSocket('ws://'+WEB_SERVER_IP+':'+PORT.toString());

let client=[]; //save client ip and port

let recv=function(message){
    /** 메세지가 String이고 그 자체로 사용 가능 할 때 는 그냥 message 변수 자체를 사용
     * 만약, 메세지가 json으로 들어왔을 때 사용해야하는 함수 -2
     * result type: Obj, message type: String -2
    */
    //var result=JSON.parse(message) -2

    /** 원하는 결과를 가지고 어떤 메세지를 받았을 때, 어떻게 동작해야 하는지 아래에 기술*/
    var msg=JSON.parse(message);
    if(msg.Format=='PID'){
        client=msg.Array.slice();
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

    ws.on('message',recv);
}

connect();