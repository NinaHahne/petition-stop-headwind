DROP TABLE IF EXISTS signatures ;

-- CREATE TABLE signatures(
--     id SERIAL PRIMARY KEY,
--     first VARCHAR NOT NULL CHECK (first != ''),
--     last VARCHAR NOT NULL CHECK (last != ''),
--     signature TEXT NOT NULL CHECK (signature != ''),
--     time_stamp VARCHAR
-- );

CREATE TABLE signatures(
    id SERIAL PRIMARY KEY,
    first VARCHAR NOT NULL CHECK (first != ''),
    last VARCHAR NOT NULL CHECK (last != ''),
    signature TEXT NOT NULL CHECK (signature != ''),
    time_stamp VARCHAR,
    user_id INT NOT NULL REFERENCES users(id)
);
