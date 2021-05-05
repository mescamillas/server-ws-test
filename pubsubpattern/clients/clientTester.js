const fs = require('fs');
const ws = require('ws');
const io = require('socket.io-client');

const socket = io("ws://localhost:3001", {
  reconnectionDelayMax: 10000,
});

socket.on('connect', () => {
	console.log("> socket is connected");
});

socket.on('success', (result) => {
	console.log("> success: ", result);
});

socket.on('stopped', (result) => {
	console.log("> stopped: ", result);
});

socket.on('activeTrades', (result) => {
	console.log("> active trades: ", result);
});

socket.emit('NewTrade', { strategy: "VWAP", quantity: 5000000, operation: "buy", market: "Demo", symbol: "USDCOP", accountId: 18, account: "ITRM1000", type: "book" });
//socket.emit('NewTrade', { strategy: "ALTAMIRA", market: "Demo", symbol: "USDCOP", accountId: 18, account: "ITRM1000", type: "ticks" });
//socket.emit('StopTrade', { executionId: "3d3c4d38-9887-4ca6-ac68-c46768345b4470" });
//socket.emit('ListActiveTrades');