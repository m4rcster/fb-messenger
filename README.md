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
   verify: FB_VERIFY_TOKEN,
   fields: 'first_name,last_name,profile_pic,locale,timezone,gender,is_payment_enabled'

});

const listener = (action) => {
  console.log(action)
}

let removeListener = messenger.subscribe(listener)
// removeListener() to unsubscribe
```

## Recieve Actions

Subscriber will be executed each time an incoming request is received. Following actions are generated.

```javascript
{
  type: 'TEXT',
  user: {
    _id: 12394759877,
    first_name: 'Peter',
    last_name: 'Chang',
    profile_pic: 'https://...',
    locale: 'en_US',
    timezone: -7,
    gender: 'male'
  },
  text: string
}

{
  type: 'QUICK_REPLY',
  user: {
    _id: 12394759877,
    first_name: 'Peter',
    last_name: 'Chang',
    profile_pic: 'https://...',
    locale: 'en_US',
    timezone: -7,
    gender: 'male'
  },
  payload: 'USER_DEFINED_PAYLOAD'
}

{
  type: 'IMAGE',
  user: {
    _id: 12394759877,
    first_name: 'Peter',
    last_name: 'Chang',
    profile_pic: 'https://...',
    locale: 'en_US',
    timezone: -7,
    gender: 'male'
  },
  url: string
}

{
  type: 'AUDIO',
  user: {
    _id: 12394759877,
    first_name: 'Peter',
    last_name: 'Chang',
    profile_pic: 'https://...',
    locale: 'en_US',
    timezone: -7,
    gender: 'male'
  },
  url: string
}

{
  type: 'VIDEO',
  user: {
    _id: 12394759877,
    first_name: 'Peter',
    last_name: 'Chang',
    profile_pic: 'https://...',
    locale: 'en_US',
    timezone: -7,
    gender: 'male'
  },
  url: string
}

{
  type: 'FILE',
  user: {
    _id: 12394759877,
    first_name: 'Peter',
    last_name: 'Chang',
    profile_pic: 'https://...',
    locale: 'en_US',
    timezone: -7,
    gender: 'male'
  },
  url: string
}

{
  type: 'LOCATION',
  user: {
    _id: 12394759877,
    first_name: 'Peter',
    last_name: 'Chang',
    profile_pic: 'https://...',
    locale: 'en_US',
    timezone: -7,
    gender: 'male'
  },
  coordinates: {lat, long}
}

{
  type: 'POSTBACK',
  user: {
    _id: 12394759877,
    first_name: 'Peter',
    last_name: 'Chang',
    profile_pic: 'https://...',
    locale: 'en_US',
    timezone: -7,
    gender: 'male'
  },
  payload: 'USER_DEFINED_PAYLOAD',
  referral: 'USER_DEFINED_REFERRAL'
}
```

## Send Actions to Messenger

Pass on redux styled actions object to `messenger.dispatch(action)` to send to Facebook Messenger.

```javascript
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
