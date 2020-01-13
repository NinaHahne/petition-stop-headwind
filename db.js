const spicedPg = require("spiced-pg");

const db = spicedPg("postgres:postgres:postgres@localhost:5432/petition");

exports.getSigs = function() {
    return db.query(`SELECT * FROM signatures`).then(({ rows }) => rows);
};

exports.addSig = function(first, last, sig, tstamp, user_id) {
    return db.query(
        `INSERT INTO signatures (first, last, signature, time_stamp, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [first, last, sig, tstamp, user_id]
    );
};

exports.getSig = function(id) {
    return db
        .query(`SELECT signature FROM signatures WHERE id = $1`, [id])
        .then(({ rows }) => rows);
};

exports.getSigID = function(userId) {
    return db
        .query(`SELECT id FROM signatures WHERE user_id = $1`, [userId])
        .then(({ rows }) => rows);
};


exports.addUser = function(first, last, email, password) {
    return db.query(
        `INSERT INTO users (first, last, email, password) VALUES ($1, $2, $3, $4) RETURNING id`,
        [first, last, email, password]
    );
};

exports.getUser = function(email) {
    return db
        .query(`SELECT * FROM users WHERE email = $1`, [email])
        .then(({ rows }) => rows);
};
