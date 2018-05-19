/* @author: Yeji-Kim
*  @date: 2018-05-18
*  @description: WebServer(express) _ ws server.
*/
var WebSocket = require('ws');
var wss = new WebSocket.Server({ port:4000 });

/**
 * client=[ { ip:String, port:Integer }, ]
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
    
}

function connection(ws,req){
    var tdata={
        ip: req.connection.remoteAddress.slice(7), //
        port: 4000,
    }
    client.push(tdata); //client 가 접속할 때 마다 client.push

    ws.on('message',recv);
    
    // 닫혔을 때 client[] 안에 있는거 find ip 찾아서 해당 data remove

}


wss.on('connection',connection);