// expects parameters dbAdmin dbAdminPassword
//like
// node setupDB root root

// the rest of the parameters are taken from the env file

if (process.argv.length <= 3) {
    var mysqlAdmin = process.argv[2]
    var mysqlAdminPassword = process.argv[3]
}

var status = require('dotenv').config()

if(status.error) {
	throw status.error
}

var config = {
	// process.env
	db: {
		host: process.env.DB_HOST,
		user: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		database: process.env.DB_DATABASE
	},
}


var mysql = require('mysql');
var fs = require("fs");


var mysqlConnection = mysql.createConnection({
    host: config.db.host,
    user: mysqlAdmin,
    password: mysqlAdminPassword,
    // database: config.db.host,
    multipleStatements: true
});
debugger;
mysqlConnection.connect();
console.log("DATABASE",config.db.database);

// I could care about mysql injections but i don't since the person who is running the script already has the password
mysqlConnection.query("DROP DATABASE IF EXISTS "+config.db.database+"; CREATE DATABASE "+config.db.database+" CHARACTER SET utf8 COLLATE utf8_general_ci", function(err, mysqlResult) {
    if (err) {
        throw err;
    }
    mysqlConnection = mysql.createConnection({
        host: config.db.host,
        user: mysqlAdmin,
        password: mysqlAdminPassword,
        database: config.db.database,
        multipleStatements: true
    });
    
    mysqlConnection.connect();
    
    console.log("DATABASE",config.db.database);

    fs.readFile("db schema.sql", "utf8",function(err, sqlFile) {
        if (err) {
            throw err;            
        } else {
            // create all the required tables
            mysqlConnection.query(sqlFile, function(err, data){
                if (err) {
                    throw err;
                }
                var username = "'" + config.db.user + "@" + config.db.host + "'"
                var databaseEverything = config.db.database + ".*"
                // create a user and give him basic rights
                mysqlConnection.query("drop user if exists ?@?; create user ?@? identified by ?; grant DELETE, INSERT, SELECT, UPDATE on "+databaseEverything+" to ?@?; FLUSH PRIVILEGES", 
				[config.db.user, config.db.host, config.db.user, config.db.host, config.db.password, config.db.user, config.db.host],
				function(err, data) {
                    if (err) {
                        throw err;
                    }
                    var size = 18;
                    fields = [];
                    for (var x = 0; x < size; x++) {
                        for (var y = 0; y < size; y++) {
                            for (var z = 0; z < size; z++) {
                                fields.push([x,y,z]);
                            }
                        }
                    }

                    mysqlConnection.query("INSERT INTO board_fields(x,y,z) VALUES ?", [fields], function(err, data) {
						if (err) {
							throw err;
						}
						console.log("DONE")
						process.exit();
					})


                    // //
                    // mysqlConnection.query('')
                })
            })
        }
    })
})




