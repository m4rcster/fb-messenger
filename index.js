/**
 *  Node Mensenger API Library
 *
 *  @function Messenger
 *  Framework to interact with Facebook Messenger.
 *  Provide all parameters and save the return object.
 *  Currently optin, message read, delivery confirmation and account linking are not supported.
 *  @param {string} token - The access FB_PAGE_TOKEN
 *  @param {string} secret - The FB_APP_SECRET
 *  @param {string} verify - The FB_VERIFY_TOKEN for Webhook
 *  @returns {object} Messenger - The point generated by the factory.
 *
 *  @example
 *  // let messenger = Messenger({
 *  //   token: FB_PAGE_TOKEN,
 *  //   secret: FB_APP_SECRET,
 *  //   verify: FB_VERIFY_TOKEN
 *  // })
 *
 *  @function Messenger.subscribe
 *  Provide a method to subscribe to incoming events from FB Messenger.
 *  @param {func({action})} listener - The function that gets called when a new api call is received
 *  @returns {func} removeListener - The function to remove the listener.
 *
 *  @function Messenger.getUserProfile
 *  @param {int} fbid - The fbid of the user

 *  Provide a method to subscribe to incoming events from FB Messenger.
 *  @param {func} listener - The function that gets called when a new api call is received
 *  @returns {object} user profile - The user with first_name, last_name, profile_pic, locale, timezone, gender
 *
 *  @function Messenger.dispatch
 *  @param {object} action - The corresponding action to send to FB Messenger
 *  @returns {function} promise - The promise of call to FB Messenger
 *
 *  Actions that are generated and consumed by the Messenger Library
 *
 *  Received text message.
 *  @event TEXT
 *  @type {Action}
 *  @property {int} sender - fbid of sender
 *  @property {string} text - message text
 *
 *  Received quick reply message.
 *  @event QUICK_REPLY
 *  @type {Action}
 *  @property {int} sender - fbid of sender
 *  @property {object} payload - payload of the quick_reply
 *
 *  Received image attachment.
 *  @event IMAGE
 *  @type {Action}
 *  @property {int} sender - fbid of sender
 *  @property {string} url - url of image
 *
 *  Received audio attachment.
 *  @event AUDIO
 *  @type {Action}
 *  @property {int} sender - fbid of sender
 *  @property {string} url - url of audio file
 *
 *  Received video attachment.
 *  @event VIDEO
 *  @type {Action}
 *  @property {int} sender - fbid of sender
 *  @property {string} url - url of video file
 *
 *  Received file attachment.
 *  @event FILE
 *  @type {Action}
 *  @property {int} sender - fbid of sender
 *  @property {string} url - url of file
 *
 *  Received location attachment.
 *  @event LOCATION
 *  @type {Action}
 *  @property {int} sender - fbid of sender
 *  @property {object} coordinates - coordinates object with property lat and long
 *
 *  Received postback message.
 *  @event POSTBACK
 *  @type {Action}
 *  @property {int} sender - fbid of sender
 *  @property {object} payload - payload object of the postback
 *  @property {string} referral - referral string optional
 *
 *  Send message.
 *  @event MESSAGE
 *  @type {Action}
 *  @property {int} id - id of recipient
 *  @property {object} message - message payload
 *
 *  Send sender action.
 *  @event SENDER_ACTION
 *  @type {Action}
 *  @property {int} id - fbid of recipient
 *  @property {string} sender_action - sender action of mark_seen | typing_on | typing_off
 *
 *  Set thread settings.
 *  @event SET_THREAD_SETTINGS
 *  @type {Action}
 *  @property {string} payload - payload of the setting
 *
 *  Remove thread settings.
 *  @event REMOVE_THREAD_SETTINGS
 *  @type {Action}
 *  @property {object} payload - payload of the setting
 *
 */

const debug = require('debug')('fb-messenger');
const request = require('request-promise');
const crypto = require('crypto');

const DEBUG = false;

const Messenger = (options) => {
    const
        token = options.token || false,
        secret = options.secret || false,
        verify = options.verify || false,
        listeners = [];

    const middleware = (req, res, next) => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        if(req.method === 'GET') return _verify(req, res);
        if(req.method !== 'POST') return res.end();

        let body = '';

        req.on('data', chunk => {
            body += chunk;
        });

        req.on('end', () => {
            if(!secret) {
                console.error('Error, Missing app secret.');
                return res.end();
            }

            let hmac = crypto.createHmac('sha1', secret);
            hmac.update(body);

            if(req.headers['x-hub-signature'] !== `sha1=${hmac.digest('hex')}`) {
                console.error('Error, Message integrity check failed.');
                return res.end();
            }

            let parsed = JSON.parse(body);
            _handleMessage(parsed);
            res.end();
        })
    };

    const subscribe = (listener) => {
        listeners.push(listener);
        return() => {
            listeners = listeners.filter(l => l !== listener);
        }
    };

    const getUserProfile = (fbid) => {
        return _send('GET', 'https://graph.facebook.com/v2.6/' + fbid, _getQs({ fields: 'first_name,last_name,profile_pic,locale,timezone,gender,is_payment_enabled' }), true);
    };

    const dispatch = (action) => {
        debug('Dispatch: ', JSON.stringify(action, null, 3));
        const
            muri = 'https://graph.facebook.com/v2.6/me/messages',
            turi = 'https://graph.facebook.com/v2.6/me/thread_settings';
        switch(action.type) {
            case 'MESSAGE':
                return _send('POST', muri, _getQs(), {
                    recipient: { id: action.id },
                    message: action.message
                });
            case 'SENDER_ACTION':
                return _send('POST', muri, _getQs(), {
                    recipient: { id: action.id },
                    sender_action: action.sender_action
                });
            case 'SET_THREAD_SETTINGS':
                return _send('POST', turi, _getQs(), action.payload);
            case 'REMOVE_THREAD_SETTINGS':
                return _send('DELETE', turi, _getQs(), action.payload);
            default:
                return Promise.reject(new Error('Messenger dispatch action unknown'));
        }
    }

    const _handleMessage = (data) => {
        if(data.object !== 'page') {
            return console.error('Error, Message not sent from page.');
        }
        data.entry.forEach(entry => {
            let events = entry.messaging;
            events.forEach(event => {
                DEBUG && console.log('Messenger Incoming: ', JSON.stringify(event, null, 3));
                if(event.message && !event.message.quick_reply && !event.message.attachments) {
                    _dispatch({ type: 'TEXT', sender: event.sender.id, text: event.message.text });
                } else if(event.message && event.message.quick_reply && !event.message.attachments) {
                    _dispatch({ type: 'QUICK_REPLY', sender: event.sender.id, payload: event.message.quick_reply.payload });
                } else if(event.postback) {
                    _dispatch({ type: 'POSTBACK', sender: event.sender.id, payload: event.postback.payload, referral: event.postback.referral });
                } else if(event.message.attachments[0].type === 'image') {
                    _dispatch({ type: 'IMAGE', sender: event.sender.id, url: event.message.attachments[0].payload.url });
                } else if(event.message.attachments[0].type === 'audio') {
                    _dispatch({ type: 'AUDIO', sender: event.sender.id, url: event.message.attachments[0].payload.url });
                } else if(event.message.attachments[0].type === 'video') {
                    _dispatch({ type: 'VIDEO', sender: event.sender.id, url: event.message.attachments[0].payload.url });
                } else if(event.message.attachments[0].type === 'file') {
                    _dispatch({ type: 'FILE', sender: event.sender.id, url: event.message.attachments[0].payload.url });
                } else if(event.message.attachments[0].type === 'location') {
                    _dispatch({ type: 'LOCATION', sender: event.sender.id, coordinates: event.message.attachments[0].payload.coordinates });
                }
            });
        });
    };

    const _dispatch = (action) => {
        listeners.forEach(listener => listener(action));
    };

    const _verify = (req, res) => {
        if(req.query['hub.verify_token'] === verify) {
            return res.end(req.query['hub.challenge']);
        }
        console.error('Failed validation. Make sure the validation tokens match.');
        return res.end('Error, wrong validation token.');
    }

    const _send = (method, uri, qs, json) => {
        return request({ method, uri, qs, json })
            .then(body => {
                if(body.error) return Promise.reject(body.error);
                return body;
            })
            .catch(err => Promise.reject(err));
    }

    const _getQs = (qs) => {
        if(typeof qs === 'undefined') {
            qs = {};
        }
        qs['access_token'] = token;

        return qs;
    }

    return { middleware, subscribe, getUserProfile, dispatch };
}

module.exports = Messenger;
