const mineflayer = require('mineflayer');
const fs = require('fs');
let rawdata = fs.readFileSync('config.json');
let data = JSON.parse(rawdata);
var connected = 0;
var reconnecting = false;
var reconnectInterval = 60000;
var host = data["ip"];
var port = data["port"];
var username = data["name"];
var bot;

function createBot() {
    bot = mineflayer.createBot({
        host: host,
        port: port,
        username: username
    });

    setupBotEvents();
    startAntiAFK();
}

function setupBotEvents() {
    bot.on('login', function () {
        console.log("Logged In");
        connected = 1;
    });

    bot.on('spawn', function () {
        connected = 1;
    });

    bot.on('time', function () {
        if (connected < 1) {
            return;
        }
    });

    bot.on('death', function () {
        bot.emit("respawn");
    });

    bot.on('end', function () {
        console.log("Disconnected from the server");
        if (!reconnecting) {
            reconnecting = true;
            attemptReconnect();
        }
    });

    bot.on('error', function (err) {
        console.log(`Error occurred: ${err.message}`);
        if (!reconnecting) {
            reconnecting = true;
            attemptReconnect();
        }
    });
}

function attemptReconnect() {
    setTimeout(function () {
        try {
            createBot();
            console.log(`Attempting to reconnect...`);
            reconnecting = false;
        } catch (error) {
            console.log(`Reconnect attempt failed: ${error.message}`);
            attemptReconnect();
        }
    }, reconnectInterval);
}

function startAntiAFK() {
    setInterval(function () {
        if (bot.entity) {
            const x = bot.entity.position.x;
            const y = bot.entity.position.y;
            const z = bot.entity.position.z;
            bot.setControlState('jump', true);
            setTimeout(() => {
                bot.setControlState('jump', false);
                bot.setControlState('forward', true);
                setTimeout(() => {
                    bot.setControlState('forward', false);
                }, 1000);
            }, 1000);
        }
    }, 30000);
}

createBot();
