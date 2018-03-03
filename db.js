const mssql = require("mssql"); 

const dbConfig = {
 user: "Tr@ck",
 password: "W4@tM@tt3r5",
 server: "206.123.100.20",
 database: "GPS",
 port: "1535"
};

//Connection Promise
const cp = mssql.connect(dbConfig).then(pool =>{
	return pool;
}).catch(err => {
	console.log(err)
})

module.exports = cp; 