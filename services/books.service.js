const moleculerAdapter = require("moleculer-db-adapter-mongoose");
const DbService = require("moleculer-db");
const { MoleculerClientError } = require("moleculer").Errors;
let book=require("../model/books.model");

module.exports = {
	name: "books",
	mixins: [DbService],
	adapter: new moleculerAdapter("mongodb://localhost:27017/booksdata", { "url-encoded": "true" }), 
	model: book ,
	/**
	 * Service settings
	 */
	settings: {
		fields: ["_id", "bookName", "authorName"],
		populates: {
			"email": {
				action: "greeter.get",
				params: {
					fields: ["email"],
				}
			}
		},
		entityValidator: {
			bookName: { type: "string", min: 1 },
			authorName: { type: "string", min: 1 },
		}
	},

	/**
	 * Service dependencies
	 */
	dependencies: [],

	/**
	 * Actions
	 */

	actions: {
        
		addBook :{
			handler(ctx){
				let entity = ctx.params.body;
				return this.validateEntity(entity)
					.then(() => {
						return this.adapter.insert(entity)
							.then(json => this.entityChanged("created", json, ctx).then(() => json));
					});
			}
		},
        
		getBooks :{
			handler(ctx){
				return this.adapter.find({})
					.then(doc => this.transformDocuments(ctx, { populate: ["email"]}, doc ));

			}
		}
	},		
	/**
	 * Events
	 */
	events: {
		"greeter.register"(user) {
			console.log("User created:" , user);
		},
	},

	/**
	 * Methods
	 */
	methods: {

	},

	/**
	 * Service created lifecycle event handler
	 */
	created() {

	},

	/**
	 * Service started lifecycle event handler
	 */
	started() {

	},

	/**
	 * Service stopped lifecycle event handler
	 */
	stopped() {

	}
};