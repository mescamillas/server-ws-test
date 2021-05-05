const ws = require('ws');
const fs = require("fs");
var inter;
const fileName = `log_${Date.now()}.txt`;
(async function(){
    
    let token ="testtoken";
    let failed = true;
    /* while (failed){
        try{
            let res = await axios.post("http://localhost:2002/login",{
                email:"marcello@example.com",
                password:"MySecurePassword"
            });
            token = res.data.token.token;
            failed = false;
        }catch(error){};
    } */

    const options = {
        headers:{
            Authorization: token,
            email:"marcello@example.com"
        }
    };
    
    let client = new ws("ws://54.167.122.51:3000/?type=watcher",options);
    //let client = new ws("ws://services.itrmachines.com:5551/?type=client",options);
    //let client = new ws("ws://192.168.35.22:3000/?type=client",options);
        
    client.on("open",()=>{
        console.log("open on client");
        
        //client.send(createMessageForChannel({request: "subscribe", channel:'client', payload: { symbol: "USDCOP", data_type: "ticks" }}));
        /* setInterval(()=>{
            console.log("sending unsub");
            client.send(createMessageForChannel({request:'publish', channel:'executor', action: "unsubscribe", payload: { symbol: "USDCOP", data_type: "ticks" }}));
            setTimeout(()=>{
                console.log("sending unsub book");
                client.send(JSON.stringify({request:'publish', channel:'executor', action: "unsubscribe", payload: { symbol: "USDCOP", data_type: "book" }}));
            }, 10000);
        }, 5000); */
        
        /* ;
        client.send(JSON.stringify({action: "createOrder", payload: {
            orderId: "kjskajsghlagk",
            symbol: "USDCOP",
            operation: "BUY",
            type: "LIMIT",
            price: 3600,
            size: 1250000,
            parentId: undefined
        }}));
        client.send(JSON.stringify({action: "createOrder", payload: {
            orderId: "jsaghfkasfbka",
            symbol: "USDCOP",
            operation: "SELL",
            type: "STOP",
            price: 3600,
            size: 1250000,
            parentId: "kjskajsghlagk"
        }}));
        client.send(JSON.stringify({action: "createOrder", payload: {
            orderId: "oiqwruiefksk",
            symbol: "USDCOP",
            operation: "BUY",
            type: "MARKET",
            size: 1250000
        }}));
        client.send(JSON.stringify({action: "updateOrder", payload: {
            orderId: "kjskajsghlagk",
            price: 3600
        }}));
        client.send(JSON.stringify({action: "cancelOrder", payload: {
            orderId: "kjskajsghlagk"
        }})); */
        //client.send(JSON.stringify({action: "panicCancelOrders", payload:"order"}));
    });

    client.on("error",(error)=>{
        console.log(error);
    });

    client.on("close",()=>{
        console.log("Closing client");
        clearInterval(inter);
    });

    client.on('message', (msg)=>{
        // const{action, payload } = JSON.parse(msg)
        // if(action == 'newTick')  console.log("Client: got new payload", payload);
        obj = JSON.parse(msg);
        console.log(obj);

        fs.appendFile(fileName,msg+'\n' , function (err) {
            if (err) throw err;
          });
    });

    

    /* inter = setInterval(()=>{
        
    }, 5000); */

})();


function createMessageForChannel(msg){
    const {request, channel, action, payload} = msg;
    return JSON.stringify({request, channel, action, payload});
}
