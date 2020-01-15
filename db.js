const spicedPg = require("spiced-pg");

const db = spicedPg("postgres:postgres:postgres@localhost:5432/petition");

exports.getSigs = function() {
    return db.query(`SELECT * FROM signatures`).then(({ rows }) => rows);
};

exports.addSig = function(sig, tstamp, user_id) {
    return db.query(
        `INSERT INTO signatures (signature, time_stamp, user_id) VALUES ($1, $2, $3) RETURNING id`,
        [sig, tstamp, user_id]
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

exports.addProfile = function(age, city, url, user_id) {
    return db.query(
        `INSERT INTO user_profiles (age, city, url, user_id) VALUES ($1, $2, $3, $4) RETURNING id`,
        [age, city, url, user_id]
    );
};

// with signatures:
exports.getSigners = function() {
    return db.query(`SELECT users.first, users.last, user_profiles.age, user_profiles.city, user_profiles.url, signatures.signature FROM users JOIN user_profiles ON users.id = user_profiles.user_id JOIN signatures ON user_profiles.user_id = signatures.user_id`).then(({ rows }) => rows);
};

// without signatures:
// exports.getSigners = function() {
//     return db.query(`SELECT users.first, users.last, user_profiles.age, user_profiles.city, user_profiles.url FROM users JOIN user_profiles ON users.id = user_profiles.user_id JOIN signatures ON user_profiles.user_id = signatures.user_id`).then(({ rows }) => rows);
// };

exports.getSignersInCity = function(city) {
    return db
        .query(`SELECT users.first, users.last, user_profiles.age, user_profiles.city, user_profiles.url, signatures.signature FROM users JOIN user_profiles ON users.id = user_profiles.user_id JOIN signatures ON user_profiles.user_id = signatures.user_id WHERE LOWER(city) = LOWER($1)`, [city])
        .then(({ rows }) => rows);
};

exports.getProfile = function(user_id) {
    return db
        .query(`SELECT users.first, users.last, users.email, users.password, user_profiles.age, user_profiles.city, user_profiles.url FROM users JOIN user_profiles ON users.id = user_profiles.user_id WHERE user_id = $1`, [user_id])
        .then(({ rows }) => rows);
};

// PART 5:
// INSERT INTO user_profiles (age, city, url, user_id) VALUES ($1, $2, $3, $4);
//
// UPDATE user_profiles SET age = $1, city = $2, url = $3 WHERE user_id = $4;
//
// "UPSERT" (update/insert if exists):
// INSERT INTO actors (age, city, url, user_id)
// VALUES ($1, $2, $3, $4)
// ON CONFLICT (user_id)
// DO UPDATE user_profiles SET age = $1, city = $2, url = $3;

// DELETE FROM users WHERE id = $1;
