const WebSocket = require('ws');
 
const wss = new WebSocket.Server({ port: 4000 });

// 连接池
let clients = [];

let myWs = () =>{
    wss.on('connection', function connection(ws) {
        clients.push(ws);
        ws.on('message', function incoming(message) {
            // 广播消息
            clients.forEach(function(ws1){
                if(ws1 !== ws) {
                    ws1.send(message);
                }
            });
        });
        ws.on('close', function(message) {
            // 连接关闭时，将其移出连接池
            clients = clients.filter(function(ws1){
                return ws1 !== ws
            })
        });
    });
}


module.exports = myWs;