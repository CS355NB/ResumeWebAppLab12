var express = require('express');
var router = express.Router();
var resume_dal = require('../model/resume_dal');
var account_dal = require('../model/account_dal');
var company_dal = require('../model/company_dal');
var school_dal = require('../model/school_dal');
var skill_dal = require('../model/skill_dal');


// View All resume
router.get('/all', function(req, res) {
    resume_dal.getAll(function(err, result){
        if(err) {
            res.send(err);
        }
        else {
            res.render('resume/resumeViewAll', { 'result':result });
        }
    });

});

// View the resume for the given id
router.get('/', function(req, res){
    if(req.query.resume_id == null) {
        res.send('resume_id is null');
    }
    else {
        resume_dal.getById(req.query.resume_id, function(err,result) {
            if (err) {
                res.send(err);
            }
            else {
                res.render('resume/resumeViewById', {'result': result});
            }
        });
    }
});

// Return the add a new resume form
router.get('/add', function(req, res){
    // passing all the query parameters (req.query) to the insert function instead of each individually
    account_dal.getAll(function (err, result) {
        company_dal.getAll(function (err, company) {
            school_dal.getAll(function(err, school) {
                skill_dal.getAll(function (err, skill) {
                    if (err) {
                        res.send(err);
                    }
                    else {
                        res.render('resume/resumeAdd', {'account': account, 'company': company, 'school': school, 'skill': skill});
                    }
                });
            });
        });
    });
});

// insert a resume record
router.get('/insert', function(req, res){
    // simple validation
    if(req.query.resume_name == null) {
        res.send('Resume Name must be provided.');
    }
    else if(req.query.account_id == null) {
        res.send('An Account must be selected');
    }
    else if(req.query.company_id == null) {
        res.send('At least one company must be selected');
    }
    else {
        // passing all the query parameters (req.query) to the insert function instead of each individually
        resume_dal.insert(req.query, function(err,result) {
            if (err) {
                //console.log(err) //Naz - added from lab 12 company_routes example
                res.send(err);
            }
            else {
                //poor practice, but we will handle it differently once we start using Ajax
                res.redirect(302, '/resume/all');
            }
        });
    }
});

router.get('/edit', function(req, res) {
    if(req.query.resume_id == null) {
        res.send('A resume id is required');
    }
    else {
        resume_dal.edit(req.query.resume_id, function(err, result) {
            console.log(result);
            res.render('resume/resumeUpdate', {resume: result[0][0], company: result[1]});
        });
    }
});

router.get('/edit2', function(req, res) {
    if(req.query.resume_id == null) {
        res.send('A resume id is required');
    }
    else {
        resume_dal.getById(req.query.resume_id, function(err, resume) {
            company_dal.getAll(function(err, company) {
                school_dal.getAll(function(err, school) {
                    skill_dal.getAll(function (err, skill) {
                        res.render('resume/resumeUpdate', {resume: resume[0], company: company, school: school, skill: skill});
                    });
                });
            });
        });
    }
});

router.get('/update', function(req, res) {
    resume_dal.update(req.query, function(err, result) {
        res.redirect(302, '/resume/all');
    });
});

// Delete a resume for the given resume_id
router.get('/delete', function(req, res){
    if(req.query.resume_id == null) {
        res.send('resume_id is null');
    }
    else {
        resume_dal.delete(req.query.resume_id, function(err, result){
            if(err) {
                res.send(err);
            }
            else {
                //poor practice, but we will handle it differently once we start using Ajax
                res.redirect(302, '/resume/all');
            }
        });
    }
});

module.exports = router;