class PubSubManager{
    constructor(){
        this.channels = {
            client:{
                subscribers: []
            },
            executor: {
                subscribers: []
            },
            watcher: {
                subscribers: []
            }
        }
    }

    async informNewConnection(ip){
        this.informWatchers("new connection",{address:ip});
    }

    informWatchers(event, content){
        this.channels["watcher"].subscribers.forEach((watcher)=>{
            watcher.send(JSON.stringify({
                event,
                content,
                time: new Date()
            }))
        })
    }

    async subscribe(susbcriber, channel, msg){ 
        return new Promise((resolve, reject)=>{
            if(this.channels[channel]){
                this.channels[channel].subscribers.push(susbcriber);

                this.informWatchers(`new ${channel} sub`, JSON.parse(msg));
                
                resolve();
            }else {
                reject();
            }
        })
        
    }

    publish(channel, message, msg){ 
        return new Promise((resolve, reject)=>{
            if(this.channels[channel]){
                this.channels[channel].subscribers.forEach(element => {
                    element.send(message);
                });
                this.informWatchers(`channel:${channel} publish`, JSON.parse(msg))
                resolve();
            } else {
                reject();
            }
        });
    }

    isClientSubscribedOnChannel(wsClient, channel){
        for (let i = 0; i < this.channels[channel].subscribers.length; i++) {
            if(this.areSocketsAuthTokenTheSame(this.channels[channel].subscribers[i], wsClient))
                return true;
        }
        return false;
    }

    unsubscribe(channel, wsClient,code){
        //console.log("unsubscribing client from channel", channel, wsClient.sessionParams);
        this.informWatchers(`channel:${channel} unsub`, {address:wsClient.ip,closeCode:code, headers: wsClient.sessionParams.headers});
        return new Promise((resolve, reject)=>{
            if(this.channels[channel]){
                this.channels[channel].subscribers = this.channels[channel].subscribers.filter(( socket )=> {
                    return !this.areSocketsAuthTokenTheSame(socket,wsClient);
                });
                resolve();
            } else {
                reject();
            }
        });
    }

    areSocketsAuthTokenTheSame(aSocket, bSocket){
        return aSocket.sessionParams.headers.authorization === bSocket.sessionParams.headers.authorization;
    }

}

exports.getPSClass = function(){
    return PubSubManager;
}