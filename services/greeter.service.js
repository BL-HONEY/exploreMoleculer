"use strict";

const moleculerAdapter = require("moleculer-db-adapter-mongoose");
const DbService = require("moleculer-db");
const { MoleculerClientError } = require("moleculer").Errors;
const bcrypt = require("bcrypt");
let user=require("../model/user.model");
const jwt = require("jsonwebtoken");



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
		JWT_SECRET: process.env.JWT_SECRET || "jwt-conduit-secret",
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
							.then(user => this.transformEntity(user, true, ctx.meta.token))
							.then(json => this.entityChanged("created", json, ctx).then(() => json));
					});
			},

		},

			/**
		 * Login with username & password
		 *
		 * @actions
		 * @param {Object} user - User credentials
		 *
		 * @returns {Object} Logged in user with token
		 */
		login: {
			params: {
				user: { type: "object", props: {
					email: { type: "email" },
					password: { type: "string", min: 1 }
				}}
			},
			handler(ctx) {
				const { email, password } = ctx.params.user;

				return this.Promise.resolve()
					.then(() => this.adapter.findOne({ email }))
					.then(user => {
						if (!user)
							return this.Promise.reject(new MoleculerClientError("Email or password is invalid!", 422, "", [{ field: "email", message: "is not found"}]));

						return bcrypt.compare(password, user.password).then(res => {
							if (!res)
								return Promise.reject(new MoleculerClientError("Wrong password!", 422, "", [{ field: "email", message: "is not found"}]));

							// Transform user entity (remove password and all protected fields)
							return this.transformDocuments(ctx, {}, user);
						});
					})
					.then(user => this.transformEntity(user, true, ctx.meta.token));
			}
		},

			/**
		 * Get user by JWT token (for API GW authentication)
		 *
		 * @actions
		 * @param {String} token - JWT token
		 *
		 * @returns {Object} Resolved user
		 */
		resolveToken: {
			cache: {
				keys: ["token"],
				ttl: 60 * 60 // 1 hour
			},
			params: {
				token: "string"
			},
			handler(ctx) {
				console.log("I am here");
			
				return new this.Promise((resolve, reject) => {
					jwt.verify(ctx.params.token, this.settings.JWT_SECRET, (err, decoded) => {
						if (err)
							return reject(err);

						resolve(decoded);
					});

				})
					.then(decoded => {
						if (decoded.id)
							return this.getById(decoded.id);
					});
			}
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
		generateJWT(user) {
			const today = new Date();
			const exp = new Date(today);
			exp.setDate(today.getDate() + 60);

			return jwt.sign({
				id: user._id,
				email: user.email,
				exp: Math.floor(exp.getTime() / 1000)
			}, this.settings.JWT_SECRET);
		},

		/**
		 * Transform returned user entity. Generate JWT token if neccessary.
		 *
		 * @param {Object} user
		 * @param {Boolean} withToken
		 */
		transformEntity(user, withToken, token) {
			if (user) {
				if (withToken)
					user.token = token || this.generateJWT(user);
			}

			return { user };
		},
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