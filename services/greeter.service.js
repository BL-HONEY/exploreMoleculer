"use strict";

const moleculerAdapter = require("moleculer-db-adapter-mongoose");
const DbService = require("moleculer-db");
const { MoleculerClientError } = require("moleculer").Errors;
const bcrypt = require("bcrypt");
let user=require("../model/user.model");


module.exports = {
	name: "greeter",
	mixins: [DbService],
	adapter: new moleculerAdapter("mongodb://localhost:27017/microservicesdata1", { "url-encoded": "true" }),
	model:user,
	/**
	 * Service settings
	 */
	settings: {
		
		fields: ["_id", "firstName", "lastName", "email", "password"],

		/** Validator schema for entity */
		entityValidator: {
			firstName: { type: "string", min: 2, pattern: /^[a-zA-Z0-9]+$/ },
			lastName: { type: "string", min: 2, pattern: /^[a-zA-Z0-9]+$/ },
			email: { type: "email" },
			password: { type: "string", min: 6 },
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

		/**
		 * Register a new user
		 * 
		 * @actions
		 * @param {Object} user - User entity
		 * 
		 * @returns {Object} Created entity & token
		 */
		register: {
			handler(ctx) {
					console.log("data on requesting register 52-------------------",ctx);
				// this.broker.emit("greeter.register" , ctx);
				let entity = ctx.params.body;
				return this.validateEntity(entity)
					.then(() => {
						if (entity.email)
							return this.adapter.findOne({ email: entity.email })
								.then(found => {
									if (found)
									{
										// ctx.meta.$statusCode = 302;
										return Promise.reject(new MoleculerClientError("User already exists!", 422, "", [{ field: "email", message: "already exist" }]));
									}
								});
					})
					.then(() => {
						entity.password = bcrypt.hashSync(entity.password, 10);
						entity.createdAt = new Date();
						return this.adapter.insert(entity)
							.then(doc => this.transformDocuments(ctx, {}, doc))
							.then(json => this.entityChanged("created", json, ctx).then(() => json));
					});
			},

		},

		/**
* Say a 'Hello'
*
* @returns
*/
		hello() {
			return "Hello Moleculer";
		},

		/**
		 * Welcome a username
		 *
		 * @param {String} name - User name
		 */
		welcome: {
			params: {
				name: "string"
			},
			handler(ctx) {
				return `Welcome, ${ctx.params.name}`;
			}
		}
	},


	/**
	 * Events
	 */
	events: {

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