var express = require("express");
var app = express();
var path = require("path");
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var mongo = require('mongodb');
var bodyParser = require("body-parser");
var urlEncodedParser = bodyParser.urlencoded({ extended: false });
var mongoose = require("mongoose");
var liveServer = require("live-server");
var MongoClient = require('mongodb').MongoClient;
mongoose.connect("mongodb://localhost:27017");
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

app.use(session({
    secret: "I am Batman",
    resave: false,
    saveUninitialized: false
}));



app.use('/public', express.static('public'));

var params = {
    port: 3000,
    host: "localhost",
    file: "index.ejs"
};
liveServer.start(params);


var UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
    },
    agentName: String
});

var AgentSchema = new mongoose.Schema({
    agentname: {
        type: String,
        required: false
    },
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
    },
});

var MemberSchema = new mongoose.Schema({
    name: String,
    mailid: String,
    phoneno: Number,
    plan: String,
    user: {
        type: String,
        required: false
    }
});

var PlanSchema = new mongoose.Schema({
    _id: Number,
    name: String,
    monthlyAmount: Number,
    maxClaim: Number,
    maxMembers: Number,
    url: String
});


app.get("/", function(req, res) {
    res.render("index");
});
app.get("/about", function(req, res) {
    res.render("about");
});
app.get("/contact", function(req, res) {
    res.render("contact");
});


var User = mongoose.model("users", UserSchema);
app.use(bodyParser.urlencoded({ extended: true }));

var Agent = mongoose.model("agents", AgentSchema);
app.use(bodyParser.urlencoded({ extended: true }));

var Plan = mongoose.model("plans", PlanSchema);
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/register', function(req, res) {
    res.render('register.ejs');
});

app.get('/login', function(err, res) {
    res.render('login.ejs');
});

app.get('/agentRegister', function(req, res) {
    res.render('agentRegister.ejs');
});

app.get('/agentLogin', function(err, res) {
    res.render('agentLogin.ejs');
});

app.post('/register', function(req, res, next) {

    var userData = {
        username: req.body.username,
        password: req.body.password,
        agentName: null
    }
    var user_ = { username: userData.username, password: userData.password, agentName: userData.agentName };
    User.create(user_, function(err, user) {
        if (err) {
            console.log(err);
        } else {
            req.session.userId = user._id;
            res.redirect("/login")
        }
    });
});

app.post('/login', function(req, res) {

    var loginData = {
        username: req.body.username,
        password: req.body.password
    }
    User.findOne({ username: loginData.username }, function(err, _user) {
        if (_user.username === loginData.username && _user.password == loginData.password) {
            req.session.userId = _user._id;
            res.redirect("/userDashboard");
        } else {
            console.log(err);
        }
    });
});

app.post('/agentRegister', function(req, res, next) {

    var agentData = {
        agentname: req.body.agentname,
        username: req.body.username,
        password: req.body.password,
    }
    var agent_ = { agentname: agentData.agentname, username: agentData.username, password: agentData.password };
    Agent.create(agent_, function(err, _agent) {
        if (err) {
            console.log(err);
        } else {
            res.redirect("/agentLogin")
        }
    });
});

var loginData = {};

app.post('/agentLogin', function(req, res) {

    loginData = {
        username: req.body.username,
        password: req.body.password
    }
    Agent.findOne({ username: loginData.username }, function(err, _agent) {
        if (_agent.username === loginData.username && _agent.password == loginData.password) {
            req.session.agentId = _agent._id;
        } else {
            console.log(err);
        }
        User.countDocuments({ agentName: _agent.agentname }, function(err, c) {
            console.log("Count is " + c);
            res.render("agentDashboard.ejs", { count: c });
        });
    });

});

app.get('/logout', function(req, res, next) {
    if (req.session) {
        req.session.destroy(function(err) {
            if (err) {
                return next(err);
            } else {
                return res.redirect('/');
            }
        });
    }
});

app.get('/agentDashboard', function(req, res) {

    Agent.findOne({ username: loginData.username }, function(err, _agent) {
        if (_agent.username === loginData.username && _agent.password == loginData.password) {
            req.session.agentId = _agent._id;
        } else {
            console.log(err);
        }
        User.countDocuments({ agentName: _agent.agentname }, function(err, c) {
            console.log("Count is " + c);
            res.render("agentDashboard.ejs", { count: c });
        });
    });
});
app.get('/userDashboard', function(req, res) {
    res.render('userDashboard.ejs');
});

app.get('/addUser', function(req, res) {
    res.render('addUser.ejs');
});
app.post('/addUser', function(req, res) {
    var userDataReg = {
        agentname: req.body.agentname,
        username: req.body.username,
        password: req.body.password
    }
    var data = { username: userDataReg.username, password: userDataReg.password, agentName: userDataReg.agentname };
    User.create(data, function(err, user) {
        if (err) {
            console.log(err);
        } else {
            req.session.userId = user._id;

            res.redirect("/agentDashboard")
        }
    });
});

var Member = mongoose.model("members", MemberSchema);



app.post("/booker", function(req, res) {
    var name = req.body.name;
    var mailid = req.body.mailid;
    var phoneno = req.body.phoneno;
    var plan = req.body.plan;
    var user = req.body.user;
    var member = { name: name, mailid: mailid, phoneno: phoneno, plan: plan, user: user };
    Member.create(member, function(err, mem) {
        if (err) {
            console.log(err);
        } else {
            res.redirect("/booker");
        }
    });
});
app.get("/room", function(req, res) {
    Plan.find({}, function(err, allPlans) {
        res.render("room.ejs", { plans: allPlans });
    });
});

app.get("/form", function(req, res) {
    res.render("form.ejs");
});
app.get("/booker", function(req, res) {
    Member.find({}, function(err, allmembers) {
        res.render("booker.ejs", { members: allmembers });

    });
});



app.listen(3000 || process.env.PORT, 3000 || process.env.IP, function() {
    console.log("Server has started");
});