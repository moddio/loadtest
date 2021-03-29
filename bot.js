/*
pm2 start npm --name=Taro -- run server  --game=5fd192eb7e39dc434d10e26c
* Get the node module
* npm install websocket
*
* Increase the max duplicate ips 
* server.js this.maxDuplicateIpsAllowed = 999
*
* set botCount to somethign reasonable (40 will lag, but no longer freeze)
*
* optional: can re-enable the break; in IgeStreamComponent to reproduce the freezing
*/
var { WebSocket } = require('@clusterws/cws');;
var IP = process.env.IP || 'localhost';


function getRandomString() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 5; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

var cliArgs = process.argv.slice(2);

var botCount = 0
var maxBotCount = 5
var wsPort = "2001"
if (cliArgs[0] && cliArgs[0] != 'null') {
    wsPort = cliArgs[0];
}
if (cliArgs[1]) {
    maxBotCount = parseInt(cliArgs[1]);
}
console.log("Will connect ", maxBotCount, " to port ", wsPort)
function mockIgeConnection(i) {

    console.log(botCount, "<", maxBotCount)

    // closure exists to save i variable
    return function () {
        var name = 'bot_' + i
        var portDivider = ":"
        if (isNaN(wsPort)) {
            portDivider = ""
        }
        var client = new WebSocket(`ws://${IP}${portDivider}${wsPort}/?token=`, 'netio1')

        client.on('error', error => {
            console.log('Connect Error: ', error.message)
        })


        client.on('open', connection => {

            console.log('WebSocket Client Connected')
            client.send(JSON.stringify(["@", "1"]));
            const n = getRandomInt(1000, 1999);
            client.send(JSON.stringify(["\u0004", { "number": n, "isAdBlockEnabled": false }]));
            client.send(JSON.stringify(["\n", [0, 0]]));


            client.on('error', error => {
                console.log("Connection Error: " + error.toString())
            })


            client.on('close', () => {
                console.log('echo-protocol Connection Closed')
            })


            client.on('message', message => {
                if (message.type === 'utf8') {
                    // uncomment to see data from server (reduce bot count to 1 first!)
                    //console.log(message.utf8Data)
                }
            })

            // after connecting, press "PLAY" button
            setTimeout(() => {
                client.send(JSON.stringify(['\u0004',
                    {
                        number: 200,
                        _id: undefined,
                        sessionId: getRandomString(),
                        isAdBlockEnabled: false
                    }])) //  player name change

            }, 200)

            var keys = ['w', 'a', 's', 'd']
            const directions = ['up', 'left', 'down', 'right']
            var commands = setInterval(() => {

                // release all keys
                for (var i = 0; i < keys.length; i++) {
                    client.send(JSON.stringify(['\t', { device: 'key', key: keys[i] }]));
                }
                //const randFloat = Math.random()
                //console.log(randFloat)
                // press one random key
                //var randomInt = Math.floor(randFloat * Math.floor(keys.length));
                var randomInt = getRandomInt(0, keys.length - 1)
                console.log(directions[randomInt])
                client.send(JSON.stringify(['\b', { device: 'key', key: keys[randomInt] }]));

            }, 500)

            // disconnect player after 10000ms
            setTimeout(() => {
                clearInterval(commands)
                client.close()
                botCount--;
            }, 10000)
        })
    }
}
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
// Random number balancer
const biasKiller = function (min, max) {
    var self = this
    let i = min
    const bias = {}
    while (i < max + 1) {
        bias[i] = 0
        i++
    }
    self.min = min
    self.max = max
    self.bias = bias
    self.checkBias = function (n) {

    }
    return self
}
// create a new player every 250ms
setInterval(() => {
    while (botCount < maxBotCount) {
        mockIgeConnection(botCount)()
        botCount++
        break;
    }
}, 300)
