const Buffer = require('safe-buffer').Buffer;
const Keygrip = require('keygrip');
const keys = require('../../config/keys');
const keygrip = new Keygrip([keys.cookieKey]);

module.exports = (user) => {

    const sessionObject = {
        passport:{
            user: user._id.toString() //user._id is a javascript object
        }
    };

    const session = Buffer.from(
        JSON.stringify(sessionObject)
    ).toString('base64');

    const sig = keygrip.sign('session='+session);//library syntax to include 'session=' part

    return { session, sig };
};