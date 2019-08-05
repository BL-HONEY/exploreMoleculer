const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let UserSchema = new Schema({
	firstName: {
		type: String,
		require: [true, "FirstName required"]
	},
	lastName: {
		type: String,
		require: [true, "LastName required"]
	},
	email: {
		type: String,
		require: [true, "UserName required"],
		unique: true,
	},
	password: {
		type: String,
		require: [true, "Password required"]
	},
},
{
	timestamps:true
});

module.exports = mongoose.model("user", UserSchema);