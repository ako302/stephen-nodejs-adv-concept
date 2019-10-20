  module.exports = {
  googleClientID:
    '964808011168-29vqsooppd769hk90kjbjm5gld0glssb.apps.googleusercontent.com',
  googleClientSecret: 'KnH-rZC23z4fr2CN4ISK4srN',
  mongoURI: 'mongodb+srv://<user>:<pw>@cluster0-1lxde.mongodb.net/test?retryWrites=true&w=majority',
  cookieKey: '123123123', // client secret, used to generate session.sig to ensure the session is not tampered
  //keygrip in cookies module generates the session.sig
  redisUrl: 'redis://127.0.0.1:6379'
};
