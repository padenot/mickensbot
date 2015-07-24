var irc = require('irc');
var request = require('request');
var config = require('./config');

var ignorees = ['firebot', 'mrgiggles', config.nick];

function ignore(from) {
    for (var i = 0; i < ignorees.length; i++) {
        if (from.indexOf(ignorees[i]) !== -1)
           return true;
    }
    return false;
}

var quotes = [];

fs = require('fs')
fs.readFile('mickens.txt', 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }
  quotes = data.split("\n");
});

function getQuote(message) {
if (message) {
  var query = message.replace("mickensbot: ", "")
		     .replace("mickensbot, ", "")
                     .replace("mickensbot:", "")
                     .replace("mickensbot,", "")
                     .replace("mickensbot", "");
    console.log(query)
    for (var i = 0; i < quotes.length; i++) {
      var index = quotes[i].indexOf(query);
      if (index !== -1) {
        return quotes[i]
      }
    }
  }
  var quote = quotes[Math.floor(Math.random() * quotes.length)];
  return "Not sure about " + query + " but " + quote.substring(0, 1).toLowerCase() + quote.substring(1);
}

function mickensbot(client)
{
    var keywordMap = {};

    const KNOWN_KEYWORDS = ['quote'];

    const DEFAULT_CENSORSHIP_PERIOD = config.defaultCensorshipPeriod;
    var censorshipMap = config.censorshipPeriodMap;

    var shutupMap = {};

    function setCensorship(chan) {
        var censorshipPeriod = censorshipMap[chan] || DEFAULT_CENSORSHIP_PERIOD;
        shutupMap[chan] = true;
        setTimeout(function() {
            shutupMap[chan] = false;
        }, censorshipPeriod);
    }

        console.log('setting up client');

        client.addListener('message', function (from, chan, message) {
            if (ignore(from) || shutupMap[chan])
                return;

            if (message.indexOf('mickensbot') !== -1) {

                if (message.indexOf('shut up') !== -1 || message.indexOf('shutup') !== -1) {
                    setCensorship(chan);
                    return;
                }

	    client.say(chan, getQuote(message));
                return;
            }
        });

}

var extensions = [mickensbot];

function run()
{
    var client = new irc.Client(config.server, config.nick, {
        debug: true,
        channels: config.channels,
        userName: config.userName,
        realName: config.realName,
        retryDelay: 120000
    });

    for (var i = 0, e = extensions.length; i < e; ++i) {
        extensions[i](client);
    }
}

function changeName()
{
    var names = ['john', 'mark', 'robert', 'rubber', 'patrick', 'wu', 'lulz', 'troll', 'wat'];
    var number = Math.floor(Math.random() * 255);
    var usedName = names[Math.floor(Math.random() * names.length)] + number;
    return {
        nick: usedName,
        userName: usedName,
        realName: usedName
    }
}

run(config);
