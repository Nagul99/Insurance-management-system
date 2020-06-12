var mongoose = require("mongoose"),
    passportLocalmongoose = require("passport-local-mongoose");
var AgentSchema = new mongoose.Schema({
    username: String,
    password: String,
    name: String                

});

AgentSchema.plugin(passportLocalmongoose);
module.exports = mongoose.model("Agent", AgentSchema);