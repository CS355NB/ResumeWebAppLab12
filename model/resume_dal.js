var mysql   = require('mysql');
var db  = require('./db_connection.js');

/* DATABASE CONFIGURATION */
var connection = mysql.createConnection(db.config);

exports.getAll = function(callback) {
    var query = 'SELECT * FROM Resume_View;';

    connection.query(query, function(err, result) {
        callback(err, result);
    });
};

/*
exports.getById = function(resume_id, callback) {
    var query = 'SELECT * FROM Resume_View WHERE resume_id = ?';
    var queryData = [resume_id];

    connection.query(query, queryData, function(err, result) {
        callback(err, result);
    });
};
*/

exports.getById = function(resume_id, callback) {
    var query = 'SELECT r.*, ac.first_name, ac.last_name, ac.email, sc.school_name, ad.street, ad.zip_code, co.company_name, sk.skill_name, sk.skill_description FROM Account ac ' +
            'LEFT JOIN Resume r ON r.account_id = ac.account_id ' +
            'LEFT JOIN Resume_Company rc ON rc.resume_id = r.resume_id ' +
            'LEFT JOIN Company co ON co.company_id = rc.company_id ' +
            'LEFT JOIN Company_Address ca ON ca.company_id = co.company_id ' +
            'LEFT JOIN Address ad ON ad.address_id = ca.address_id ' +
            'LEFT JOIN School sc ON sc.address_id = ad.address_id ' +
            'LEFT JOIN Resume_School rs ON rs.school_id = sc.school_id' +
            'LEFT JOIN Resume_Skill rsk ON rsk.resume_id = rs.resume_id ' +
            'LEFT JOIN Skill sk ON sk.skill_id = rsk.skill_id ' +
            'WHERE r.resume_id = ?';
    /*var query = 'SELECT r.*, a.*, c.company_name FROM Account a ' +
            'JOIN Resume r ON r.account_id = a.account_id ' +
            'LEFT JOIN Resume_Company rc ON rc.resume_id = r.resume_id ' +
            'LEFT JOIN Company c ON c.company_id = rc.company_id ' +
            'WHERE r.resume_id = ?';*/
    var queryData = [resume_id];
    console.log(query);

    connection.query(query, queryData, function(err, result) {

        callback(err, result);
    });
};

/*
exports.insert = function(params, callback) {
    var query = 'INSERT INTO Resume (account_id, resume_name) VALUES (?, ?)';

    // the question marks in the sql query above will be replaced by the values of the
    // the data in queryData
    var queryData = [params.account_id, params.resume_name];

    connection.query(query, queryData, function(err, result) {
        callback(err, result);
    });

}
*/

exports.insert = function(params, callback) {
    var query = 'INSERT INTO Resume (account_id, resume_name) VALUES (?, ?)';

    // the question marks in the sql query above will be replaced by the values of the
    // the data in queryData
    var queryData = [params.account_id, params.resume_name];

    connection.query(query, queryData, function(err, result) {

        var resume_id = result.insertId;
        var query = 'INSERT INTO Resume_Company (resume_id, company_id) VALUES ?';
        var resumeCompanyData = [];
        for(var i=0; i < params.company_id.length; i++) {
            resumeCompanyData.push([resume_id, params.company_id[i]]);
        }
        connection.query(query, [resumeCompanyData], function(err, result) {
            callback(err, result);
        });

    });

};

exports.delete = function(resume_id, callback) {
    var query = 'DELETE FROM Resume WHERE resume_id = ?';
    var queryData = [resume_id];

    connection.query(query, queryData, function(err, result) {
        callback(err, result);
    });

};

var resumeCompanyInsert = function(resume_id, companyIDArray, callback) {
    var query = 'INSERT INTO Resume_Company (resume_id, company_id) VALUES ?';
    var resumeCompanyData = [];
    for(var i=0; i < companyIdArray.length; i++) {
        resumeCompanyData.push([resume_id, companyIdArray[i]]);
    }
    connection.query(query, [resumeCompanyData], function(err, result) {
        callback(err, result);
    });
};
module.exports.resumeCompanyInsert = resumeCompanyInsert;

var resumeCompanyDeleteAll = function(resume_id, callback) {
    var query = 'DELETE FROM Resume_Company WHERE resume_id = ?';
    var queryData = [resume_id];

    connection.query(query, queryData, function(err, result) {
        callback(err, result);
    });
};
module.exports.resumeCompanyDeleteAll = resumeCompanyDeleteAll;

exports.update = function(params, callback) {
    var query = 'UPDATE Resume SET resume_name = ? WHERE resume_id = ?';
    var queryData = [params.resume_name, params.resume_id];

    connection.query(query, queryData, function(err, result) {
        resumeCompanyDeleteAll(params.resume_id, function(err, result) {
            if(params.company_id != null) {
                resumeCompanyInsert(params.resume_id, params.company_id, function(err, result) {
                    callback(err, result);
                });
            }
            else {
                callback(err, result);
            }
        });
    });
    /*connection.query(query, queryData, function(err, result) {
        resu
    }*/
};

/*  Stored procedure used in this example
 DROP PROCEDURE IF EXISTS Resume_GetInfo;

 DELIMITER //
 CREATE PROCEDURE Resume_GetInfo (_resume_id int)
 BEGIN

 SELECT * FROM Resume WHERE resume_id = _resume_id;

 SELECT c.*, rc.resume_id FROM Company c
 LEFT JOIN Resume_Company rc on rc.company_id = c.company_id AND resume_id = _resume_id
 ORDER BY c.company_name;

 END //
 DELIMITER ;

 # Call the Stored Procedure
 CALL Resume_GetInfo (4);
 */

exports.edit = function(resume_id, callback) {
    var query = 'CALL Resume_GetInfo(?)';
    var queryData = [resume_id];

    connection.query(query, queryData, function(err, result) {
        callback(err, result);
    });
};