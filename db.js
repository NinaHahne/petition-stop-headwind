const spicedPg = require("spiced-pg");

const db = spicedPg("postgres:postgres:postgres@localhost:5432/petition");

exports.getNames = function() {
    return db.query(`SELECT * FROM signatures`).then(({ rows }) => rows);
};

exports.addName = function(first, last, sig, tstamp) {
    return db.query(
        `INSERT INTO signatures (first, last, signature, time_stamp) VALUES ($1, $2, $3, $4) RETURNING id`,
        [first, last, sig, tstamp]
    );
};

exports.getSig = function(id) {
    return db.query(`SELECT signature FROM signatures WHERE id = $1`, [id]).then(({ rows }) => rows);
};
