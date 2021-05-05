const ws = require('ws');
var inter;

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
    
    let client = new ws("ws://localhost:3000/?type=client",options);
    //let client = new ws("ws://services.itrmachines.com:5551/?type=client",options);
    //let client = new ws("ws://192.168.35.22:3000/?type=client",options);
        
    client.on("open",()=>{
        console.log("open on client");
        client.send(createMessageForChannel({request: "subscribe", channel:'client', payload: { symbol: "USDCOP", data_type: "ticks" }}));
        /* setTimeout(()=>{
            console.log("sending unsub");
            client.send(JSON.stringify({request:'unsubscribe', action: "unsubscribe", payload: { symbol: "USDCOP", data_type: "ticks" }}));
            client.send(JSON.stringify({request:'subscribe',action: "subscribe", payload: { symbol: "USDCOP", data_type: "book" }}));
            setTimeout(()=>{
                console.log("sending unsub book");
                client.send(JSON.stringify({request:'unsubscribe', action: "unsubscribe", payload: { symbol: "USDCOP", data_type: "book" }}));
            }, 10000);
        }, 10000); */
        
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
        console.log("Client: got new msg", JSON.parse(msg));
    });

    

    /* inter = setInterval(()=>{
        
    }, 5000); */

})();

function createMessageForChannel(msg){
    const {request, channel, action, payload} = msg;
    return JSON.stringify({request, channel, action, payload});
}
