var mysql   = require('mysql');
var db  = require('./db_connection.js');

/* DATABASE CONFIGURATION */
var connection = mysql.createConnection(db.config);

/*
 create or replace view company_view as
 select s.*, a.street, a.zip_code from company s
 join address a on a.address_id = s.address_id;

 */

exports.getAll = function(callback) {
    var query = 'SELECT * FROM Company;';

    connection.query(query, function(err, result) {
        callback(err, result);
    });
};

exports.getById = function(company_id, callback) {
    var query = 'SELECT c.*, a.street, a.zip_code FROM Company c ' +
        'LEFT JOIN Company_Address ca on ca.company_id = c.company_id ' +
        'LEFT JOIN Address a on a.address_id = ca.address_id ' +
        'WHERE c.company_id = ?';
    var queryData = [company_id];
    console.log(query);

    connection.query(query, queryData, function(err, result) {

        callback(err, result);
    });
};

exports.insert = function(params, callback) {

    // FIRST INSERT THE COMPANY
    var query = 'INSERT INTO Company (company_name) VALUES (?)';

    var queryData = [params.company_name];

    connection.query(query, params.company_name, function(err, result) {

        // THEN USE THE COMPANY_ID RETURNED AS insertId AND THE SELECTED ADDRESS_IDs INTO COMPANY_ADDRESS
        var company_id = result.insertId;

        // NOTE THAT THERE IS ONLY ONE QUESTION MARK IN VALUES ?
        var query = 'INSERT INTO Company_Address (company_id, address_id) VALUES ?';

        // TO BULK INSERT RECORDS WE CREATE A MULTIDIMENSIONAL ARRAY OF THE VALUES
        var companyAddressData = [];
        for(var i=0; i < params.address_id.length; i++) {
            companyAddressData.push([company_id, params.address_id[i]]);
        }

        // NOTE THE EXTRA [] AROUND companyAddressData
        connection.query(query, [companyAddressData], function(err, result){
            callback(err, result);
        });
    });

};

exports.delete = function(company_id, callback) {
    var query = 'DELETE FROM Company WHERE company_id = ?';
    var queryData = [company_id];

    connection.query(query, queryData, function(err, result) {
        callback(err, result);
    });

};

//declare the function so it can be used locally
var companyAddressInsert = function(company_id, addressIdArray, callback){
    // NOTE THAT THERE IS ONLY ONE QUESTION MARK IN VALUES ?
    var query = 'INSERT INTO Company_Address (company_id, address_id) VALUES ?';

    // TO BULK INSERT RECORDS WE CREATE A MULTIDIMENSIONAL ARRAY OF THE VALUES
    var companyAddressData = [];
    for(var i=0; i < addressIdArray.length; i++) {
        companyAddressData.push([company_id, addressIdArray[i]]);
    }
    connection.query(query, [companyAddressData], function(err, result){
        callback(err, result);
    });
};
//export the same function so it can be used by external callers
module.exports.companyAddressInsert = companyAddressInsert;

//declare the function so it can be used locally
var companyAddressDeleteAll = function(company_id, callback){
    var query = 'DELETE FROM Company_Address WHERE company_id = ?';
    var queryData = [company_id];

    connection.query(query, queryData, function(err, result) {
        callback(err, result);
    });
};
//export the same function so it can be used by external callers
module.exports.companyAddressDeleteAll = companyAddressDeleteAll;

exports.update = function(params, callback) {
    var query = 'UPDATE Company SET company_name = ? WHERE company_id = ?';

    var queryData = [params.company_name, params.company_id];

    connection.query(query, queryData, function(err, result) {
        //delete company_address entries for this company
        companyAddressDeleteAll(params.company_id, function(err, result){

            if(params.address_id != null) {
                //insert company_address ids
                companyAddressInsert(params.company_id, params.address_id, function(err, result){
                    callback(err, result);
                });
            }
            else {
                callback(err, result);
            }
        });

    });
};

/*  Stored procedure used in this example
     DROP PROCEDURE IF EXISTS Company_GetInfo;

     DELIMITER //
     CREATE PROCEDURE Company_GetInfo (_company_id int)
     BEGIN

     SELECT * FROM Company WHERE company_id = _company_id;

     SELECT a.*, s.company_id FROM Address a
     LEFT JOIN Company_Address s on s.address_id = a.address_id AND company_id = _company_id
     ORDER BY a.street, a.zip_code;

     END //
     DELIMITER ;

     # Call the Stored Procedure
     CALL Company_GetInfo (4);

 */

exports.edit = function(company_id, callback) {
    var query = 'CALL Company_GetInfo(?)';
    var queryData = [company_id];

    connection.query(query, queryData, function(err, result) {
        callback(err, result);
    });
};