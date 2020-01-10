const express       = require('express');
const app           = express();
const hb            = require('express-handlebars');

const {SESSION_SECRET:sessionSecret} = require('./secrets');

// const cookieParser  = require('cookie-parser');
// cookie-parser is gone now! we now use cookie session:
const cookieSession = require('cookie-session');
const csurf = require('csurf');


const { getNames, addName, getSig } = require("./db");

// this configures express to use express-handlebars:
app.engine('handlebars', hb());
app.set('view engine', 'handlebars');

// let's you link to the styles.css in public folder:
app.use(express.static('./public'));

// middleware function, that grabs user input, parses it and makes it available to req.body:
app.use(
    express.urlencoded({
        extended: false
    })
);

// app.use(cookieParser());
// app.use(cookieSession({
//     secret: `I'm always hungry.`,
//     maxAge: 1000 * 60 * 60 * 24 * 14
// }));

app.use(cookieSession({
    secret: sessionSecret,
    maxAge: 1000 * 60 * 60 * 24 * 14
}));

app.use(csurf());

app.use(function(req, res, next) {
    res.set('x-frame-options', 'DENY');
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.get('/', (req, res) => {
    console.log("*************** / Route ***********");
    console.log('req.session before setting: ', req.session);
    req.session.peppermint = '<3';
    // creates two cookies: second one is an encrypred copy of the first, that makes it temper-proof
    console.log('req.session after setting: ', req.session);

    console.log("*************** / Route ***********");
    res.redirect('/petition');
});

app.get('/petition', (req, res) => {
    console.log("*************** /petition Route ***********");
    console.log('this is the cookie session in petition route: ', req.session);
    console.log("*************** /petition Route ***********");
    res.render('petition', {
        layout: 'main'
    });
});

app.post('/petition', (req, res) => {
    // console.log(`your name is: ${req.body.first} ${req.body.last}`);
    addName(req.body.first, req.body.last, req.body.sig).then((result) => {
        console.log('result which includes the RETURNING data: ', result);
        // GET ACTUAL ID HERE...
        let id = 1;
        req.session.signatureId = id;
        res.redirect('/thanks');
    }
    ).catch(err => {
        console.log(err);
        res.render('petition', {
            err
        });
        // res.redirect('/petition');
    });

});

app.get('/thanks', (req, res) => {
    req.session.signatureId = 1;
    console.log("*************** /thanks Route ***********");
    console.log('req.session.signatureId: ', req.session.signatureId);
    console.log("*************** /thanks Route ***********");
    let signatureId = req.session.signatureId;

    getSig(signatureId).then(result => {
        let sigUrl = result[0].signature;
        // console.log('sigUrl: ', sigUrl);
        res.render('thanks', {
            layout: 'main',
            sigUrl
        });
    }).catch(err => {
        console.log(err);
    });

});

app.get('/signers', (req, res) => {
    getNames().then(signers => {
        // console.log(signers);
        res.render('signers', {
            layout: 'main',
            signers
        });
    }).catch(err => {
        console.log(err);
    });
});

app.listen(8080, () => console.log('port 8080 listening!'));
