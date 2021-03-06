/*
    Page that retrieves the location of all the vehicles that work for a certain company and are active.
*/

var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var conn_detail = require(".././conn.json")

var connection = mysql.createConnection({
    // properties
    'host': conn_detail.host,
    'user': conn_detail.user,
    'password': conn_detail.password,
    'database': conn_detail.database,
    'connectionLimit': 100,
    'port': 3306,
    'debug': false,
    'multipleStatements': true
});

connection.connect(function (error) {
    // callback
    if (!!error) {
        console.log('Error when connecting from getActiveVehicles.js');

        console.log(error);
    } else {
        console.log('Db connected from getActiveVehicles.js!');
    }
});

/* GET if login is correct. */
router.get('/', function (req, res, next) {
    // parameters being passed in
    var company_id = req.query.cid;

    if (company_id) {
        connection.query(`
            SELECT v.vehicleID, lp.number_plate, s.state_value FROM State s
            JOIN Vehicle v USING(stateID)
            JOIN License_Plate lp USING(plateID)
            JOIN Company c USING(companyID)
            WHERE c.companyID = ${1};`, { company_id }, function (error, results, fields) {
                if (error) {
                    res.status(404).send('Error when retrieving active vehicles from db');
                    throw error;
                }
                if (results.length > 0) {
                    if (results) {
                        res.json(results);
                        // res.status(200).send("CONFIRMED");
                    }
                } else {
                    res.status(204).send("No match");
                }
            });
    } else {
        res.status(400).send("No company_id passed");
    }
});

router.get('/count', function (req, res, next) {
    // parameters being passed in
    var company_id = req.query.cid;
    let sql_select_activeCount = `
        SELECT count(case when s.state_value = "Active" then 1 else null end) as "active", count(*) as "total" FROM Vehicle v 
        LEFT JOIN Transport t USING (transportID)
        LEFT JOIN State s USING (stateID)
        JOIN Company c Using(companyID)
        WHERE c.companyID = ?;
    `;
    if (company_id) {
        let sql_activeCount_data = [company_id];
        connection.query(sql_select_activeCount, sql_activeCount_data, function (error, results, fields) {
                if (error) {
                    res.status(404).send('Error when retrieving count of active vehicles from db');
                    throw error;
                }
                if (results.length > 0) {
                    if (results) {
                        res.json(results);
                        // res.status(200).send("CONFIRMED");
                    }
                } else {
                    res.status(204).send("No match");
                }
            });
    } else {
        res.status(400).send("No company_id passed");
    }


});
module.exports = router;

