const Websocket = require("ws");

const wss = new Websocket.Server({port: 8080, clientTracking: true});

function broadcast(type, data, skipSelf = false) {
  wss.clients.forEach(function(conn){
    if (skipSelf == conn.key) return;
    send(conn, type, data);
  });
}

function syncPlayers(conn) {
  wss.clients.forEach(function(oconn){
    if (conn.key == oconn.key) return;
    send(conn, "join", {id: oconn.key});
    send(conn, "move", {id: oconn.key, x: oconn.gamedata.x, y: oconn.gamedata.y});
  });
}

function send(conn, type, data) {
  conn.send(JSON.stringify({type: type, data: data}));
}

var id = 1;
wss.on('listening', function(){
  console.log("WSS Open");
});

wss.on('connection', function(conn){
  conn.key = id++;
  conn.gamedata = {};
  console.log("Player joined", conn.key);
  syncPlayers(conn);
  send(conn, "iam", {id: conn.key});
  broadcast("join", {id: conn.key}, conn.key);
  conn.on('close', function(){
    console.log("Player left", conn.key);
    broadcast("leave", {id: conn.key});
  })
  conn.on('message', function(msg){
    // console.log(msg);
    let event = JSON.parse(msg);
    if (event.type == "move") {
      // console.log("Player move", event.data.id, event.data.x, event.data.y);
      conn.gamedata.x = event.data.x;
      conn.gamedata.y = event.data.y;
      broadcast("move", {id: conn.key, x: event.data.x, y: event.data.y}, conn.key);
    }
  });
});
