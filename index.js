'use strict';

// Imports dependencies and set up http server
const
  express = require('express'),
  bodyParser = require('body-parser'),
  app = express().use(bodyParser.json()),
  request=require('request');


// Sets server port and logs message on success
//Diese Message wird ausgeprintet
app.listen(process.env.PORT || 1337, () => console.log('webhook is listening'));

// Your verify token. Should be a random string. TOKEN als umgebrungsvariable abgespeichert
const VERIFY_TOKEN = process.env.FB_VERIFY_TOKEN; 
//Accsestoken durch FB generiert
const ACCESS_TOKEN =process.env.FB_ACCESS_TOKEN; 
//
// Adds support for GET requests to our webhook
app.get('/webhook', (req, res) => {

  // Parse the query params
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];
    
  // Checks if a token and mode is in the query string of the request
  if (mode && token) {
  
    // Checks the mode and token sent is correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      
      // Responds with the challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
      
    
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);      
    }
  }
    
});

/*app.post('/webhook', (req, res) => {  
 
  let body = req.body;
  
  //SO greift man auf den Inhalt zu von Facebook und in changes befinden sich die Daten f�r das Event. sowas wie Message Texts
  console.log(body.entry);
  // Checks this is an event from a page subscription
  if (body.object === 'page') {
    // Iterates over each entry - there may be multiple if batched
    body.entry.forEach(function(entry) {
      let pageID=entry.id;
      let timeOfEvent=entry.time;

      // Gets the message. entry.messaging is an array, but 
      // will only ever contain one message, so we get index 0
      //let webhook_event = entry.messaging[0];
      console.log("time: " + timeOfEvent + "  id: "+pageID + " \n");
      var senderid= entry['messaging'][0]['sender']['id'];
      console.log("sender id: "+senderid );
      if(entry['messaging'][0]['message'] && entry['messaging'][0]['text'])
      {
          var senderid= entry['messaging'][0]['sender']['id'];
          sendTestAnswer(senderid);
      }
    //  sendTestAnswer(senderid);
     // console.log(entry['messaging'][0]['message']['text']);
     // console.log(entry.changes[0].value);



        sendTestAnswer(1228516987273545);
        res.status(200).send('EVENT_RECEIVED');

    });

    //res.status(200).send('EVENT_RECEIVED');
    // Returns a '200 OK' response to all requests
    
  } else {
    // Returns a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }

});*/

app.post('/webhook/', function (req, res) {
    let messaging_events = req.body.entry[0].messaging
    for (let i = 0; i < messaging_events.length; i++) {
      let event = req.body.entry[0].messaging[i];
     // event.sender.id="100029278720161";
      let sender = event.sender.id;
      
      console.log("Sender:  "+sender+" type:"+typeof(sender));
      if (event.message && event.message.text) {
        let text = event.message.text
        if (text === 'Generic') {
            //sendGenericMessage(sender)
            continue
        }
        sendTextMessage(sender, "Message received: " + text.substring(0, 200))
      }
      if (event.postback) {
        let text = JSON.stringify(event.postback)
        sendTextMessage(1228516987273545, "Postback: "+text.substring(0, 200), token)
        continue
      }
    }
    res.sendStatus(200)
})


function sendTextMessage(sender, text) {
    let messageData = { text:text }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:ACCESS_TOKEN},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}

function sendGenericMessage(sender) {
    let messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": "First card",
                    "subtitle": "Element #1 of an hscroll",
                    "image_url": "http://messengerdemo.parseapp.com/img/rift.png",
                    "buttons": [{
                        "type": "web_url",
                        "url": "https://www.messenger.com",
                        "title": "web url"
                    }, {
                        "type": "postback",
                        "title": "Postback",
                        "payload": "Payload for first element in a generic bubble",
                    }],
                }, {
                    "title": "Second card",
                    "subtitle": "Element #2 of an hscroll",
                    "image_url": "http://messengerdemo.parseapp.com/img/gearvr.png",
                    "buttons": [{
                        "type": "postback",
                        "title": "Postback",
                        "payload": "Payload for second element in a generic bubble",
                    }],
                }]
            }
        }
    }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:ACCESS_TOKEN},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}


// Handles messages events
function handleMessage(sender_psid, received_message) {

}

// Handles messaging_postbacks events
function handlePostback(sender_psid, received_postback) {

}

// Sends response messages via the Send API
function callSendAPI(sender_psid, response) {
  
}

function sendTestAnswer(sender_id)
{
     let messageData = { text: "dude!" }
    request({
        url: 'https://graph.facebook.com/v3.1/me/messages',
        qs: {access_token:ACCESS_TOKEN},
        method: 'POST',
        json: {
            recipient: {id:sender_id},
            messaging_type : "UPDATE",
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
            
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
        else
        {
           console.log(response);
        }
})
}