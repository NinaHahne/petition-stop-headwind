const supertest = require('supertest');
const {app} = require('./index');
const cookieSession = require('cookie-session');

const myFakeSession = {};
cookieSession.mockSessionOnce(myFakeSession);
