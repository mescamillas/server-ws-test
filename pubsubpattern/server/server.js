/************REQUIRES**************/
const ws = require('ws');
const express = require('express');
const http = require('http');
const https = require('https');
const EventEmitter = require('events');
const PubSubManager = require('./PubSubManager').getPSClass();
/************REQUIRES**************/

/************VARIABLES*************/
var mainServer;
var wsServer;
var pubSubManager = new PubSubManager();


function defineServer(){
    const app = express();
    const server = getServer(app);
    app.get('/', (req, res) => { res.send('Broker server is running') });
    //setMainEmitterEvents();
    return server;
}

function getServer(app){
  let port = process.env.PORT || 3000;
  return createHttpServer(app, port);
}

function createHttpServer(app, port){
    return http.createServer(app)
    .listen(port,'0.0.0.0', ()=>{
        const p = mainServer.address();
        console.log('admin listening on port', p);
    });
}

function verifyClientType(clientType){
    let verifiedClientTypes = ["executor", "register", "client", "watcher"];
    return verifiedClientTypes.includes(clientType);
}

function obtainConnectionParameters(req){
      let parameters = {};
      let url = (req.url)? req.url: '';
      for(let value of url.replace(/\/\?/,"").split("&")){
          let split = value.split("=");
          parameters[split[0]] =  split[1];
      }
    return parameters;
}

async function startServer(){
    mainServer = defineServer();
    //startSessionManager();
    mainServer.on('upgrade',()=>{
        console.log("upgrading...");
    })
    wsServer = new ws.Server({server: mainServer, clientTracking: true });
    wsServer.on('connection', async (wsClient, req)=>{
        const ip = req.socket.remoteAddress;
        console.log("new connection from:", ip);
        informNewConnection(ip);
        processNewConnection(wsClient, req);
        setRulesForMessages(wsClient);
        wsClient.on('close',(code)=>{
            pubSubManager.unsubscribe(wsClient.currentChannel, wsClient, code);
        })
    });
}

function informNewConnection(ip){
    pubSubManager.informNewConnection(ip);
}

async function processNewConnection(socket, req){
    let params = obtainConnectionParameters(req);
    socket.sessionParams = params;
    socket.ip = req.socket.remoteAddress;
    socket.sessionParams.headers = req.headers;
    try {
        await verifyClientConnections(params.type, socket);
    }    
    catch(e) {
        //closeSocket(socket, "Connection params are not valid"); 
        console.log("failed at updating new connection", e);
    }
}

function setRulesForMessages(wsClient){
    wsClient.on('message', (msg)=>{
        const msgParsed = JSON.parse(msg);
        const { payload, action, channel, request } = msgParsed;

        switch(request){
            case 'publish':
                publishMessage(channel, action, payload, wsClient, msg);
                break;
            case 'subscribe':
                subscribeClient(channel, wsClient, msg);
                break;
            case 'unsubscribe':
                unsubscribeClient(channel, wsClient, msg);
                break;
        }
    });
}

function publishMessage(channel, action, payload, wsClient, msg){
    //if(channel == 'executor') console.log("data", channel, action, payload);
    pubSubManager.publish(channel, JSON.stringify({ action, payload }), msg).catch(()=>{
      wsClient.send({action:"ERROR", payload:{title: "couldnt send message", content: payload}});
    });
}

function subscribeClient(channel, wsClient, msg){
    wsClient.currentChannel = channel;
    pubSubManager.subscribe(wsClient, channel, msg).catch(()=>{
      wsClient.send({action:"ERROR", payload:{title: "couldnt subscribe to channel", content: channel}});
    })
}

function unsubscribeClient(channel, wsClient, msg){
    pubSubManager.unsubscribe(wsClient, channel, msg).catch(()=>{
      wsClient.send({action:"ERROR", payload:{title: "couldnt unsubscribe to channel", content: channel}});
    })
}

async function verifyClientConnections(type, wsClient){
    return new Promise((resolve, reject)=>{
        if(verifyClientType(type) ) {
          console.log("client type", type);
            let flag = pubSubManager.isClientSubscribedOnChannel(wsClient, type)
            if(!flag){
                //pubSubManager.subscribe(wsClient, type);
                //console.log("Subscribed client to channel", type,  wsClient.sessionParams, flag);
                if(type == "watcher")
                    subscribeClient("watcher", wsClient, JSON.stringify({address:wsClient.ip}));
                resolve();
            } else {
                pubSubManager.informWatchers(`Error:Client is already subscribed as ${type}`, wsClient.sessionParams);
                closeSocket(wsClient,"Client is already subscribed", wsClient.sessionParams);
                reject();
            }
        }
        else {
            pubSubManager.informWatchers(`Error:bad type parameters as ${type}`, wsClient.sessionParams);
            closeSocket(wsClient,"Socket error: bad type parameters", wsClient.sessionParams);
            reject();
        }
    });
}

function closeSocket(socket, reason, params){
    console.log("closing socket", params, "Reason: " +reason);
    socket.send(JSON.stringify({action:"ERROR", payload:{message:reason}}));
    socket.close();
}



exports.deployMainServer = async function(){
  return new Promise((resolve, reject)=>{
    try {
        startServer();
        resolve();
    } catch(err) {
        console.log("couldn't deploy main server", err);
        reject();
    }
  });
}
