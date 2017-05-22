var http = require('https');
var express = require('express');
var cors = require('cors');
var app = express();
var options;
var jsonObj;
var resMain;
var hourReset;
var userInvites=0;


// use it before all route definitions
app.use(cors({origin: 'http://163.172.166.116'}));

callback = function(response) {
  var str = '';
  response.on('data', function (chunk) {
    str += chunk;
  });
  response.on('end', function () {
    var jsonObj = JSON.parse(str);
    if(jsonObj.ok){
        resMain.send("Request sent successfully. Please check your email for inventation.");
    }
    else{
        console.log("HTTPS callback error from server: "+jsonObj.error);
        resMain.send("Error: "+jsonObj.error);
    }
  });
}

limitInvites = function() {
  var date = new Date();
  var current_hour = date.getHours();
  if(current_hour!=hourReset){
      hourReset=current_hour;
      userInvites=1;
  }
  else{
      userInvites=userInvites+1;
  }
}

app.get('/', function (req, res) {
  resMain = res;
  var apiKey = process.env.API_KEY;
  var validEmail = false;
  var url = require('url');
  var url_parts = url.parse(req.url, true);
  var query = url_parts.query;
  var validator = require('validator');
  var email = req.query.email; // $_GET["id"
  if(email!=null){;
      if(validator.isEmail(email)){
        limitInvites();  
        console.log(userInvites+" invites have been made in this hour.");
        if(userInvites>20){
          console.log(userInvites+" invites have been made in this hour. Not allowing invites until next hour.");
          res.send('Too many requests have been made. Please try again in an hour.');
        }
        else{
            options = {
              host: 'slack.com',
              path: '/api/users.admin.invite?token='+apiKey+'&email='+email
            };
            http.request(options, callback).end();
            validEmail = true
        }
      }
      else{
        res.send('Email is not valid.');
      }
  }
  else{
    res.send('Email parameter not provided.');
  }
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});