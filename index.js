///////////////Server config
// 1. Establish server
// 1.1 Create http server
// 1.2 Develop upgrade
// 1.3 connect
//const wsAdmin = require('./socket/socketServer');
const wsAdmin = require('./pubsubpattern/server/server');

async function deploy(){
    try {
        await wsAdmin.deployMainServer();
    } catch(err) {
        console.log("Process halted", err);
    }
}

deploy();



// 2. Spawn fix engine