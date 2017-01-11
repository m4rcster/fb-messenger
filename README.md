# Facebook-Messenger Module

Facebook-Messenger is a small module to interact with the Facebook messenger send API as well as Webhooks. It transforms incoming request into redux compatible actions and accepts redux styled actions to send to facebook.

## Quick start

```
npm install --save @marcster/fb-messenger`
```

Initialise the module with the respective token, secret and verify token.

```javascript
const messenger = require('@marcster/fb-messenger');

let messenger = Messenger({
   token: FB_PAGE_TOKEN,
   secret: FB_APP_SECRET,
   verify: FB_VERIFY_TOKEN
});

const listener = (action) => {
  console.log(action)
}

messenger.subscribe(listener)
```

## Recieve Actions

Subscriber will be executed each time an incoming request is received. Following actions are generated.

```javascript
{
  type: 'TEXT',
  sender: fbid,
  text: string
}

{
  type: 'QUICK_REPLY',
  sender: fbid,
  payload: 'USER_DEFINED_PAYLOAD'
}

{
  type: 'IMAGE',
  sender: fbid,
  url: string
}

{
  type: 'AUDIO',
  sender: fbid,
  url: string
}

{
  type: 'VIDEO',
  sender: fbid,
  url: string
}

{
  type: 'FILE',
  sender: fbid,
  url: string
}

{
  type: 'LOCATION',
  sender: fbid,
  coordinates: {lat, long}
}

{
  type: 'POSTBACK',
  sender: fbid,
  payload: 'USER_DEFINED_PAYLOAD',
  referral: 'USER_DEFINED_REFERRAL'
}
```

## Send Actions to Messenger
Pass on redux styled actions object to `messenger.dispatch(action)` to send to Facebook Messenger.

```js
//https://developers.facebook.com/docs/messenger-platform/send-api-reference
{
  type: 'MESSAGE',
  id: fbid,
  message: {message}
}

{
  type: 'SENDER_ACTION',
  id: fbid,
  sender_action: 'mark_seen || typing_on || typing_off'
}

//https://developers.facebook.com/docs/messenger-platform/thread-settings/get-started-button
//https://developers.facebook.com/docs/messenger-platform/thread-settings/greeting-text
{
  type: 'SET_THREAD_SETTINGS',
  payload: {payload}
}

{
  type: 'REMOVE_THREAD_SETTINGS',
  payload: {payload}
}
```
