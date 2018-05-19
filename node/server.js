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
function makeCIQ(type){
    let CIQ={};
    CIQ.Format='CIQ';
    if(type=='Array'){
        CIQ.Array=client.slice();
    }else{
        CIQ.Object=client.pop();
        client.push(CIQ.Object);
    }
    return CIQ;
}
let recv=function(message){

    var msg=JSON.parse(message);
    if(msg.Format=='IAP'){
        //새로운 IP 가 접속했다는 의미
        client.push({
            IP:msg.IP, Port:msg.Port
        });
        var CIQ=makeCIQ('Array');
        ws.send(JSON.stringify(CIQ));
    }
    else if(msg.Format=='CIS'){
        if(msg.Status=='Fail'){
            if(msg.Type=='Array')
                ws.send(JSON.stringify(makeCIQ('Array')));
            else
                ws.send(JSON.stringify(makeCIQ('Object')));
        }
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