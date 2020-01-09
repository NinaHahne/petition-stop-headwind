const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const hb = require('express-handlebars');
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

app.use(cookieParser());

// let's you serve your static files
// app.use(express.static('./assets'));

// let's you link to the styles.css in public folder:
app.use(express.static('./public'));

app.get('/', (req, res) => {
    res.redirect('/petition');
});

app.get('/petition', (req, res) => {
    res.render('petition', {
        layout: 'main'
    });
});

app.post('/petition', (req, res) => {
    console.log(`your name is: ${req.body.first} ${req.body.last}`);
    addName(req.body.first, req.body.last, req.body.sig).then(() => {
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
    }
    ).catch(err => {
        console.log(err);
    });
});

app.listen(8080, () => console.log('port 8080 listening!'));
