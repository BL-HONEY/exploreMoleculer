const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let BooksSchema = new Schema({
	bookName: {
		type: String,
		require: [true, "FirstName required"]
	},
	authorName: {
		type: String,
		require: [true, "LastName required"]
    },
    
},
{
	timestamps:true
});

module.exports = mongoose.model("books", BooksSchema);