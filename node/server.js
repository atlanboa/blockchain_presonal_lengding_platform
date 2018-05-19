/* @author: Yeji-Kim
*  @date: 2018-05-18
*  @description: WebServer(express) _ ws server.
*/
var WebSocket = require('ws');
var wss = new WebSocket.Server({ port:4000 });

/**
 * client=[ { IP:String, Port:Integer, id: ? }, ]
 */
let client=[]; //save client ip and port

wss.broadcast = function(data){
    wss.clients.forEach(function each(client) {
        if(client.readyState == WebSocket.OPEN) {
            var BroadData = JSON.stringify(data);
            client.send(BroadData);
            console.log('Braodcasting : ' + data);
        }
    });
}

let recv=function(message){

    /** 메세지가 String이고 그 자체로 사용 가능 할 때 는 그냥 message 변수 자체를 사용
     * 만약, 메세지가 json으로 들어왔을 때 사용해야하는 함수 -2
     * result type: Obj, message type: String -2
    */
    //var result=JSON.parse(message) -2

    /** 원하는 결과를 가지고 어떤 메세지를 받았을 때, 어떻게 동작해야 하는지 아래에 기술*/
    
    var msg=JSON.parse(message);
    if(msg.Format=='IAP'){
        //새로운 IP 가 접속했다는 의미
        client.push({
            IP:msg.IP, Port:msg.Port
        });
        let PID={};
        PID.Format='PID';
        PID.Array=client;
        //this.id=uuid.v4();
        ws.send(JSON.stringify(PID));
    }

}

function noop(){}
function heartbeat(){ this.isAlive=true; }

function connection(ws,req){
    console.log('Server is opened');
    ws.on('message',recv);
    
    ws.isAlive=true;
    ws.on('pong',heartbeat);

}


wss.on('connection',connection);
const interval=setInterval(function ping(){
    wss.clients.forEach((ws)=>{
        if(ws.isAlive==false) {
            // 닫혔을 때 client[] 안에 있는거 find ip 찾아서 해당 data remove, 근데 어떻게 찾는지 모름... ㅠㅠㅠㅠ
            return ws.terminate();
        }
        ws.isAlive=false;
        ws.ping(noop);
        
    });
},30000);