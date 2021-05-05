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
    
    let client = new ws("ws://foul-cord-plain.glitch.me/?type=executor",options);
    //let client = new ws("ws://services.itrmachines.com:5551/?type=executor",options);
    var dataSendInterval = {
        tick: null,
        book: null
    };
    //let client = new ws("ws://192.168.35.22:3000/?type=executor",options);
    
    client.on("open",()=>{
        console.log("open on executor");
        client.send(JSON.stringify({request: "subscribe", channel:'executor'}));
        enableTicksSubscription();
        //enableBookSubscription();
    });

    client.on("close",()=>{
        console.log("Closing executor");
        clearInterval(dataSendInterval.tick);
        clearInterval(dataSendInterval.book);
    });

    client.on("error",(error)=>{
        console.log(error);
    });

    client.on("message", (msg)=>{
        let m = JSON.parse(msg);
        console.log("Executor: got new msg", m);
        processData(m);
    });


    function processUnsubscription(msgData){
        if(msgData.payload.data_type == "ticks"){
            clearInterval(dataSendInterval.tick);
        }
        else if(msgData.payload.data_type == "book"){
            clearInterval(dataSendInterval.book);
        }
    }

    function processSubscription(msgData) {
        if(msgData.payload.data_type == "ticks"){
            enableTicksSubscription(msgData.payload)
        }
        else if(msgData.payload.data_type == "book"){
            enableBookSubscription(msgData.payload)
        }
    }

    function enableTicksSubscription(){
        dataSendInterval.tick = setInterval(()=>{
            let p = {bid:Math.random()*3700, bidSize:Math.random()*500000, ask:Math.random()*3700, askSize: Math.random()*500000};
            console.log("Sending ticks", p)
            client.send(JSON.stringify({request:'publish', channel:'client', action:'newTick', payload: p}));
        }, 5000);
    }

    function enableBookSubscription(){
        dataSendInterval.book = setInterval(()=>{
            let p = {bid:Math.random()*3700, bidSize:Math.random()*500000, ask:Math.random()*3700, askSize: Math.random()*500000};
            let t = {price:Math.random()*3700, volume:Math.random()*500000, datetime:new Date().toISOString()};
            client.send(JSON.stringify({ request:'publish', channel:'client', action:'topOrderBookUpdate', payload: {marketData: [p], trades: [t]} }));
        }, 3000);
    }

    function processData(msgData){
        if(msgData.action == "subscribe"){
            processSubscription(msgData);
            client.send(JSON.stringify({request:'publish', channel:'client', action:'updateMsg', payload:{event: "subscribedToChannel", content:"subscribed to "+msgData.payload.data_type}}));
        } else if(msgData.action == "unsubscribe"){
            console.log("got unsubed");
            processUnsubscription(msgData);
            client.send(JSON.stringify({request:'publish', channel:'client', action:'updateMsg', payload:{event: "unSubscribedToTicks", content:"subscribed to "+msgData.payload.data_type}}));
        }
        else if(msgData.action == "createOrder"){
            client.send(JSON.stringify({ request:'publish', channel:'client',action:'orderStatus', payload:{event: "orderPlaced", content:"order"}}));
            client.send(JSON.stringify({ request:'publish', channel:'client',action:'updateMsg', payload:{event: "orderCreated", content:"symbol"}}));
        } else if(msgData.action == "updateOrder"){
            client.send(JSON.stringify({request:'publish', channel:'client', action:'orderStatus', payload:{event: "orderUpdated", content:"order"}}));
            client.send(JSON.stringify({ request:'publish', channel:'client', action:'updateMsg', payload:{event: "orderUpdated", content:"order"}}));
        } else if(msgData.action == "cancelOrder"){
            client.send(JSON.stringify({request:'publish', channel:'client', action:'orderStatus', payload:{event: "orderCancel", content:"order"}}));
            client.send(JSON.stringify({request:'publish', channel:'client', action:'updateMsg', payload:{event: "orderCancelled", content:"symbol"}}));
        } else if(msgData.action == "panicCancelOrders"){
            client.send(JSON.stringify({request:'publish', channel:'client', action:'orderStatus', payload:{event: "orderCancel", content:"order"}}));
            client.send(JSON.stringify({request:'publish', channel:'client', action:'updateMsg', payload:{event: "ordersCancelled", content:"symbol"}}));
            client.send(JSON.stringify({request:'publish', channel:'client', action:'errorMsg', payload:{event: "disconnection", content:"socket disconnected"}}));
        } else if(msgData.action == "clientDisconnected"){
            console.log("clearing data interval");
            clearInterval(dataSendInterval.tick);
            clearInterval(dataSendInterval.book);
        }
        /* client.send(JSON.stringify({action:'updateMsg', payload:{event: "orderCanceled", content:"order"}}));
        client.send(JSON.stringify({action:'updateMsg', payload:{event: "panicCancelOrders", content:"order"}})); */
    }
    /* inter = setInterval(()=>{
        
    }, 5000); */

})();


function createMessage(msg){
    return JSON.stringify(msg);
}
