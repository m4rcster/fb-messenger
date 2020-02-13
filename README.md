# Facebook-Messenger API

Facebook-Messenger is a small module to interact with the Facebook messenger send API as well as Webhooks. It allows to register listeners which will receive condensed webhook calls.

## Quick start

```
npm install --save @marcster/fb-messenger`
```

Initialise the module with the respective token, secret and verify token.

```javascript
const express = require('express');
const bodyParser = require('body-parser');
const Messenger = require('@marcster/fb-messenger');

let messenger = Messenger({
   token: FB_PAGE_TOKEN,
   secret: FB_APP_SECRET,
   verify: FB_VERIFY_TOKEN,
});

// Listener can receive id of the sender,
// message reduced to { text, quick_reply } 
// https://developers.facebook.com/docs/messenger-platform/reference/webhook-events/messages
// postback reduced to { title, payload, referral }
// https://developers.facebook.com/docs/messenger-platform/reference/webhook-events/messaging_postbacks/

const listener = (id, message, postback) => {
  console.log(action)
}

let removeListener = messenger.subscribe(listener)
// removeListener() to unsubscribe

const app = express();
app.use(bodyParser.json({ verify: messenger.verifyRequest }));
app.use('/', messenger.middleware)

messenger.subscribe(listener);

// Send message to user id, message as per API, or sender Action
// https://developers.facebook.com/docs/messenger-platform/reference/send-api
messenger.send(1234, {
   message: {
   text: 'hello world!'
}, {
  sender_action: 'typing_on'
});
```
