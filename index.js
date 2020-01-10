const express       = require('express');
const app           = express();
const hb            = require('express-handlebars');

// const cookieParser  = require('cookie-parser');
// cookie-parser is gone now! we now use cookie session:
const cookieSession = require('cookie-session');


const { getNames, addName } = require("./db");

// this configures express to use express-handlebars:
app.engine('handlebars', hb());
app.set('view engine', 'handlebars');

// middleware function, that grabs user input, parses it and makes it available to req.body:
app.use(
    express.urlencoded({
        extended: false
    })
);

// let's you link to the styles.css in public folder:
app.use(express.static('./public'));

// app.use(cookieParser());
app.use(cookieSession({
    secret: `I'm always hungry.`,
    maxAge: 1000 * 60 * 60 * 24 * 14
}));

// let's you serve your static files
// app.use(express.static('./assets'));


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
    res.render('thanks', {
        layout: 'main'
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
