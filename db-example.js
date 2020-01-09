const spicedPg = require("spiced-pg");

const db = spicedPg("postgres:postgres:postgres@localhost:5432/cities");

exports.getCities = function() {
    db.query(`SELECT * FROM cities ORDER BY id ASC`).then(({ rows }) => rows);
};

exports.addCity = function(name, country, population) {
    return db.query(
        `INSERT INTO cities (city, country, population) VALUES ($1, $2, $3)`,
        [name, country, population]
    );
};
