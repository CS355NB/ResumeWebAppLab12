var mysql   = require('mysql');
var db  = require('./db_connection.js');

// DATABASE CONFIGURATION
var connection = mysql.createConnection(db.config);

exports.getAll = function(callback) {
    var query = 'SELECT * FROM Account;';

    connection.query(query, function(err, result) {
        callback(err, result);
    });
};

exports.getById = function(account_id, callback) {
    var query = 'SELECT * FROM Account WHERE account_id = ?';
    var queryData = [account_id];

    connection.query(query, queryData, function(err, result) {
        callback(err, result);
    });
};

exports.insert = function(params, callback) {
    var query = 'INSERT INTO Account (first_name, last_name, email) VALUES (?, ?, ?)';

    // the question marks in the sql query above will be replaced by the values of the
    // the data in queryData
    var queryData = [params.first_name, params.last_name, params.email];

    connection.query(query, queryData, function(err, result) {
        callback(err, result);
    });

}

exports.delete = function(account_id, callback) {
    var query = 'DELETE FROM Account WHERE account_id = ?';
    var queryData = [account_id];

    connection.query(query, queryData, function(err, result) {
        callback(err, result);
    });

};

exports.update = function(params, callback) {
    var query = 'UPDATE Account SET last_name = ? WHERE account_id = ?';
    var queryData = [params.last_name,  params.account_id];

    connection.query(query, queryData, function(err, result) {
        callback(err, result);
    });
};

/*  Stored procedure used in this example
 DROP PROCEDURE IF EXISTS Account_GetInfo;

 DELIMITER //
 CREATE PROCEDURE Account_GetInfo (account_id int)
 BEGIN
 SELECT * FROM Account WHERE account_id = account_id;

 END //
 DELIMITER ;

 # Call the Stored Procedure
 CALL Account_GetInfo (4);

 */

exports.edit = function(account_id, callback) {
    var query = 'CALL Account_GetInfo(?)';
    var queryData = [account_id];

    connection.query(query, queryData, function(err, result) {
        callback(err, result);
    });
};