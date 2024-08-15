const mineflayer = require('mineflayer');
const cmd = require('mineflayer-cmd').plugin;
const fs = require('fs');
let rawdata = fs.readFileSync('config.json');
let data = JSON.parse(rawdata);
var connected = 0;
var reconnectInterval = 15000; // 15 seconds for reconnect attempts
var host = data["ip"];
var username = data["name"];
var bot;

// Mesaj göndermeyi ayarlayan süreler
var messageIntervalFiveMinutes = 300000; // 5 dakika
var messageIntervalTenMinutes = 600000; // 10 dakika
var messageCount = 5;

function createBot() {
    bot = mineflayer.createBot({
        host: host,
        username: username
    });

    bot.loadPlugin(cmd);

    setupBotEvents();
    startMessageLoop();
}

function setupBotEvents() {
    bot.on('login', function () {
        console.log("Logged In");
        connected = 1; // Set connected flag
        // Do nothing while logged in
    });

    bot.on('time', function () {
        if (connected < 1) {
            return;
        }
        // Bot logic for movement and actions can go here if needed in the future
    });

    bot.on('spawn', function () {
        connected = 1;
    });

    bot.on('death', function () {
        bot.emit("respawn");
    });

    bot.on('end', function () {
        console.log("Disconnected from the server - Attempting to reconnect...");
        attemptReconnect();
    });

    bot.on('error', function (err) {
        console.log(`Error occurred: ${err.message}`);
        attemptReconnect();
    });
}

function startMessageLoop() {
    // Her 10 dakikada t.me/distornollo mesajını gönder
    setInterval(function () {
        if (connected) {
            bot.chat('t.me/distornollo');
        }
    }, messageIntervalTenMinutes);

    // Her 5 dakikada dsc.gg/distornollo mesajını 5 kere gönder
    setInterval(function () {
        if (connected) {
            for (let i = 0; i < messageCount; i++) {
                bot.chat('dsc.gg/distornollo');
            }
        }
    }, messageIntervalFiveMinutes);
}

function attemptReconnect() {
    setTimeout(function () {
        try {
            createBot();
            console.log(`Attempting to reconnect...`);
        } catch (error) {
            console.log(`Reconnect attempt failed: ${error.message}`);
            attemptReconnect();
        }
    }, reconnectInterval);
}

// İlk botu oluştur
createBot();
