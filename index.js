const express = require("express");
const helmet = require("helmet");
const app = express();
// to export the app to the supertest:
exports.app = app;
const hb = require("express-handlebars");

// const { SESSION_SECRET: sessionSecret } = require("./secrets");

// const cookieParser  = require('cookie-parser');
// cookie-parser is gone now! we now use cookie session..
// creates two cookies: second one is an encrypred copy of the first, that makes it temper-proof:
const cookieSession = require("cookie-session");
const csurf = require("csurf");

let secrets;

if (process.env.NODE_ENV === "production") {
    secrets = process.env;
} else {
    secrets = require("./secrets");
}

const {
    addUser,
    getUser,
    getSigID,
    getSigs,
    addSig,
    getSig,
    addProfile,
    getSigners,
    getSignersInCity,
    getProfile,
    updateUser3,
    updateUser4,
    upsertProfile,
    deleteSig
} = require("./db");

const {
    requireLoggedInUser,
    requireLoggedOutUser,
    requireSignature,
    requireNoSignature
} = require('./middleware');

// for log in:
const { hash, compare } = require("./bcrypt");

// this configures express to use express-handlebars:
app.engine("handlebars", hb());
app.set("view engine", "handlebars");

app.use(helmet());

// let's you link to the styles.css in public folder:
app.use(express.static("./public"));

// middleware function, that grabs user input, parses it and makes it available to req.body:
app.use(
    express.urlencoded({
        extended: false
    })
);

app.use(
    cookieSession({
        secret: secrets.SESSION_SECRET,
        maxAge: 1000 * 60 * 60 * 24 * 14
    })
);

app.use(csurf());

app.use(function(req, res, next) {
    res.set("x-frame-options", "DENY");
    res.locals.csrfToken = req.csrfToken();
    next();
});

// app.use((req, res, next) => {
//     if (!req.session.userId && req.url != '/login' && req.url != '/register') {
//         res.redirect('/register');
//     } else {
//         next();
//     }
// });

app.get("/", (req, res) => {
    console.log("*************** / GET ***********");
    res.redirect("/petition");
});
// ------------------- adding log in:-------------------------
app.get("/register", requireLoggedOutUser, (req, res) => {
    console.log("*************** /register GET ***********");
    res.render("register", {
        layout: "main"
    });
});

app.post("/register", requireLoggedOutUser, (req, res) => {
    console.log("*************** /register POST ***********");
    // console.log(`your name is: ${req.body.first} ${req.body.last}`);
    hash(req.body.password)
        .then(password => {
            addUser(
                req.body.first,
                req.body.last,
                req.body.email,
                password
            ).then(result => {
                // console.log('result which includes the RETURNING data: ', result);
                // GET ACTUAL ID HERE:
                let id = result.rows[0].id;
                // console.log(id);
                req.session.userId = id;
                req.session.first = req.body.first;
                req.session.last = req.body.last;
                res.redirect("/profile");
            });
        })
        .catch(err => {
            console.log("err in /register POST: ", err);
            res.render("register", {
                err
            });
        });
});

app.get("/profile", requireLoggedInUser, (req, res) => {
    console.log("*************** /profile GET ***********");
    res.render("profile", {
        layout: "main"
    });
});

app.post("/profile", requireLoggedInUser, (req, res) => {
    console.log("*************** /profile POST ***********");
    let url = req.body.homepage;
    if (!(url.startsWith("http://") || url.startsWith("https://"))) {
        console.log("url of homepage is not safe!");
        url = "";
    }
    // insert user's age, city, url into new user_profiles table:
    addProfile(req.body.age, req.body.city, url, req.session.userId)
        .then(() => {
            res.redirect("/petition");
        })
        .catch(err => {
            console.log("err in /profile POST: ", err);
            res.render("profile", {
                err
            });
        });
});

app.get("/login", requireLoggedOutUser, (req, res) => {
    console.log("*************** /login GET ***********");
    res.render("login", {
        layout: "main"
    });
});

app.post("/login", requireLoggedOutUser, (req, res) => {
    console.log("*************** /login POST ***********");
    // console.log(`your name is: ${req.body.first} ${req.body.last}`);
    let typedPW = req.body.password;
    //  ****CHANGE getUser to querie: JOIN users and signatures to get info about logged in user (password, signature)
    getUser(req.body.email)
        .then(result => {
            let userId = result[0].id;
            let userPW = result[0].password;
            let first = result[0].first;
            let last = result[0].last;
            // console.log("userId in users table: ", userId);
            // console.log("userPW safed in user table: ", userPW);
            compare(typedPW, userPW).then(result => {
                console.log("passwords do match: ", result);
                if (result) {
                    // if password correct:
                    req.session.userId = userId;
                    req.session.first = first;
                    req.session.last = last;

                    // get users signature id and put in session if exists:
                    // console.log("userId: ", userId);
                    getSigID(userId)
                        .then(signatureId => {
                            // only happening when signatureId does exist
                            // console.log(
                            //     "signatureId in signatures table: ",
                            //     signatureId[0].id
                            // );
                            req.session.signatureId = signatureId[0].id;
                            res.redirect("/thanks");
                        })
                        .catch(err => {
                            // happening when signatureId does NOT exist (or there is another error)
                            console.log("err in getSigID", err);
                            res.redirect("/petition");
                        });
                } else {
                    // if password wrong:
                    let loginErr = "wrong password or email!";
                    console.log(loginErr);
                    res.render("login", {
                        loginErr
                    });
                }
            });
        })
        .catch(err => {
            console.log("err in /login: ", err);
            res.render("login", {
                err
            });
        });
});

app.get("/petition", requireLoggedInUser, requireNoSignature, (req, res) => {
    console.log("*************** /petition GET ***********");
    let first = req.session.first;
    let last = req.session.last;
    // console.log('this is the cookie session in petition route: ', req.session);
    // if user is logged in:
    res.render("petition", {
        layout: "main",
        first,
        last
    });
});

// app.get("/petition", requireNoSignature, (req, res) => {
//     console.log("*************** /petition GET ***********");
//     // console.log('this is the cookie session in petition route: ', req.session);
//     // if user is logged in:
//     if (req.session.userId) {
//         let first = req.session.first;
//         let last = req.session.last;
//         // if user already has a signatureId in their cookies, send them to /thanks
//         if (req.session.signatureId) {
//             console.log("redirect to /thanks from /petition happening");
//             res.redirect("/thanks");
//         } else {
//             res.render("petition", {
//                 layout: "main",
//                 first,
//                 last
//             });
//         }
//     } else {
//         // if user is not logged in:
//         res.redirect("/register");
//     }
// });

app.post("/petition", requireNoSignature, (req, res) => {
    console.log("*************** /petition POST ***********");
    // console.log(`your name is: ${req.body.first} ${req.body.last}`);
    let timeStamp = new Date();
    addSig(req.body.sig, timeStamp, req.session.userId)
        .then(result => {
            // console.log('timeStamp: ', timeStamp);
            // console.log('result which includes the RETURNING data: ', result);
            // GET ACTUAL ID HERE:
            let id = result.rows[0].id;
            // console.log(id);
            req.session.signatureId = id;
            res.redirect("/thanks");
        })
        .catch(err => {
            console.log("err in /petition POST: ", err);
            res.render("petition", {
                err
            });
        });
});

app.get("/thanks", requireSignature, (req, res) => {
    console.log("*************** /thanks Route ***********");
    // console.log('req.session.signatureId: ', req.session.signatureId);
    let signatureId = req.session.signatureId;
    getSigs()
        .then(signers => {
            console.log("*************** /thanks Route ***********");
            // console.log("signers.length: ", signers.length);
            let numberOfSigners = signers.length;
            getSig(signatureId)
                .then(result => {
                    let sigUrl = result[0].signature;
                    // console.log('sigUrl: ', sigUrl);
                    res.render("thanks", {
                        layout: "main",
                        sigUrl,
                        numberOfSigners
                    });
                })
                .catch(err => {
                    console.log("err in getSig: ", err);
                });
        })
        .catch(err => {
            console.log("err in getSigs in /thanks: ", err);
        });
});

app.get("/signers", requireSignature, (req, res) => {
    console.log("*************** /signers GET ***********");
    getSigners()
        .then(signers => {
            // console.log(signers);
            res.render("signers", {
                layout: "main",
                signers
            });
        })
        .catch(err => {
            console.log("err in getSigs in /signers: ", err);
        });
});

app.get("/signers/:city", requireSignature, (req, res) => {
    console.log("*************** /signers/city GET ***********");
    let city = req.params.city;
    // console.log("city before: ", city);
    // city = city.charAt(0).toUpperCase() + city.slice(1);
    // console.log("city after: ", city);
    getSignersInCity(city)
        .then(signers => {
            // console.log(signers);
            res.render("signers_city", {
                layout: "main",
                signers,
                city
            });
        })
        .catch(err => {
            console.log("err in getSignersInCity in /signers/city: ", err);
        });
});

// --------------- Part 5: ------------------------------
app.get("/profile/edit", requireLoggedInUser, (req, res) => {
    console.log("*************** /profile/edit Route***********");
    let userId = req.session.userId;
    getProfile(userId)
        .then(profile => {
            // console.log("profile: ", profile);
            profile = profile[0];
            // console.log("profile.first: ", profile.first);
            res.render("profile_edit", {
                layout: "main",
                profile
            });
        })
        .catch(err => {
            console.log("err in getProfile in /profile/edit: ", err);
            res.render("profile_edit", {
                err
            });
        });
});

app.post("/profile/edit", requireLoggedInUser, (req, res) => {
    console.log("*************** /profile/edit POST***********");
    let userId = req.session.userId;
    // console.log('new Name: ', req.body.first);
    let url = req.body.homepage;
    if (!(url.startsWith("http://") || url.startsWith("https://"))) {
        console.log("url of homepage is not safe!");
        url = "";
    }
    if (req.body.password) {
        console.log('password has been changed!');
        hash(req.body.password).then(password => {
            // console.log('hashedPW: ', password);
            Promise.all([
                updateUser4(
                    req.body.first,
                    req.body.last,
                    req.body.email,
                    password,
                    userId
                ),
                upsertProfile(
                    req.body.age, req.body.city, url, userId
                )
            ]).then(() => {
                let changes = 'changes made successfully!';
                console.log(changes);
                res.render("profile_edit", {
                    changes
                });
            }).catch(err => {
                console.log("err in updateUser4 or upsertProfile in /profile/edit: ", err);
                res.render("profile_edit", {
                    err
                });
            });
        });
    } else {
        console.log('password stays the same');
        Promise.all([
            updateUser3(
                req.body.first,
                req.body.last,
                req.body.email,
                userId
            ),
            upsertProfile(
                req.body.age, req.body.city, url, userId
            )
        ]).then(() => {
            let changes = 'changes made successfully!';
            console.log(changes);
            res.render("profile_edit", {
                changes
            });
        }).catch(err => {
            console.log("err in updateUser3 or upsertProfile in /profile/edit: ", err);
            res.render("profile_edit", {
                err
            });
        });
    }
});

app.post("/sig/delete", requireSignature, (req, res) => {
    console.log("*************** /sig/delete POST***********");
    deleteSig(req.session.signatureId).then(() => {
        delete req.session.signatureId;
        res.redirect("/petition");
    }).catch(err => {
        console.log("err in deleteSig: ", err);
    });
});

app.get("/logout", requireLoggedInUser, (req, res) => {
    console.log("*************** /logout ***********");
    req.session = null;
    res.redirect("/login");
});

// to make supertest possible:
console.log(require.main == module);
// only if someona calls "node ."" or "node index.js", will not run, when just called within a test module:
if (require.main == module) {
    app.listen(process.env.PORT || 8080, () => console.log("port 8080 listening!"));
}
