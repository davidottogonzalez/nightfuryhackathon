var express = require('express');
var router = express.Router();
const nodemailer = require('nodemailer');

global.stateList = ["START", "UPDATEMENU", "INTRO", "STARTMISSION",
                "BACKUPPOWER", "EMERGENCYLIGHTS", "DANGER"];

global.currentStatus = 0

global.hasEgg = 0

global.afterBeginTO = 0;
global.beforeDangerTO = 10000;

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Night Fury - API' });
});

router.get('/getState', function(req, res, next) {
    res.writeHead(200, {"Content-Type": "text/plain"});
    res.write(global.currentStatus.toString());
    res.end(); 
});

router.get('/currentState', function(req, res, next) {
    res.writeHead(200, {"Content-Type": "text/plain"});
    res.write(global.stateList[global.currentStatus]);
    res.end(); 
});

router.get('/setState', function(req, res, next) {
    var search = req.query.s;
    var state = global.stateList.indexOf(search);

    global.currentStatus = state != -1 ? state : global.currentStatus;

    response = state != -1 ? state.toString() : "State Does Not Exist";

    res.writeHead(200, {"Content-Type": "text/plain"});
    res.write(response);
    res.end(); 
});

router.get('/afterBeginTO', function(req, res, next) {
    res.writeHead(200, {"Content-Type": "text/plain"});
    res.write(global.afterBeginTO.toString());
    res.end(); 
});

router.get('/beforeDangerTO', function(req, res, next) {
    res.writeHead(200, {"Content-Type": "text/plain"});
    res.write(global.beforeDangerTO.toString());
    res.end(); 
});

router.get('/setAfterBeginTO', function(req, res, next) {
    global.afterBeginTO = parseInt(req.query.s);

    res.writeHead(200, {"Content-Type": "text/plain"});
    res.write(global.afterBeginTO.toString());
    res.end(); 
});

router.get('/setBeforeDangerTO', function(req, res, next) {
    global.beforeDangerTO = parseInt(req.query.s);

    res.writeHead(200, {"Content-Type": "text/plain"});
    res.write(global.beforeDangerTO.toString());
    res.end(); 
});

router.get('/hasEgg', function(req, res, next) {
    res.writeHead(200, {"Content-Type": "text/plain"});
    res.write(global.hasEgg.toString());
    res.end(); 
});

router.get('/getEgg', function(req, res, next) {
	global.hasEgg = 1;

    res.writeHead(200, {"Content-Type": "text/plain"});
    res.write(global.hasEgg.toString());
    res.end(); 
});

router.get('/dropEgg', function(req, res, next) {
	global.hasEgg = 0;

    res.writeHead(200, {"Content-Type": "text/plain"});
    res.write(global.hasEgg.toString());
    res.end(); 
});

router.get('/sendEmail', function(req, res, next) {
	// create reusable transporter object using the default SMTP transport
	let transporter = nodemailer.createTransport({
	    service: 'gmail',
	    auth: {
	        user: 'nightfuryhackathon@gmail.com',
	        pass: 'NBCUhackathon17'
	    }
	});

	// setup email data with unicode symbols
	let mailOptions = {
	    from: '"Team Night Fury" <nightfuryhackathon@gmail.com>', // sender address
	    to: req.query.emails ? req.query.emails : 'david.gonzalez036@gmail.com', // list of receivers
	    subject: 'Thanks For Playing "Mission What Came First"', // Subject line
	    text: 'video', // plain text body
	    html: `<!doctype html>
	                <html>
	                <body>
	                <a href="http://video.internetvideoarchive.net/video.mp4?cmd=6&fmt=4&customerid=995688&videokbrate=2500&publishedid=29548&e=1514311020&h=5853e2c9107ec0848e98d11691da2de6" >
	                	<img style="height: 800px; width: 500px; display: block; margin-left: auto; margin-right: auto"
                    	src="https://s3.amazonaws.com/nightfuryhackathon-public/email.jpg" />
                    </a>
	                </body>
	                </html>` // html body
	};

	// send mail with defined transport object
	transporter.sendMail(mailOptions, (error, info) => {
		var message = ""
	    if (error) {
	        message = error;
	    }
	    message = 'Message ' + info.messageId + ' sent: ' + info.response;

	    res.writeHead(200, {"Content-Type": "text/plain"});
	    res.write(message);
	    res.end(); 
	});
});

module.exports = router;
