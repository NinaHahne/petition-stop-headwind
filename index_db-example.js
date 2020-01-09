const db = require("./db");

db.addCity("Funky Town", "Funkyland", 16)
    .then(function() {
        return db.getCities();
    })
    .then(data => console.log("new city: ", data));

// db.getCities().then(
//     data => console.log(data)
// );
