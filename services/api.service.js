"use strict";

const ApiGateway = require("moleculer-web");
const { UnAuthorizedError } = ApiGateway.Errors;

// const express = require("express");       
// const route = express.Router();  
module.exports = {
	name: "api",
	mixins: [ApiGateway],

	// More info about settings: https://moleculer.services/docs/0.13/moleculer-web.html
	settings: {
		port: process.env.PORT || 3000,
		// Global CORS settings for all routes
		cors: {
			// Configures the Access-Control-Allow-Origin CORS header.
			origin: "*",
			// Configures the Access-Control-Allow-Methods CORS header. 
			methods: ["GET", "OPTIONS", "POST", "PUT", "DELETE"],
			// Configures the Access-Control-Allow-Headers CORS header.
			allowedHeaders: [],
			// Configures the Access-Control-Expose-Headers CORS header.
			exposedHeaders: [],
			// Configures the Access-Control-Allow-Credentials CORS header.
			credentials: false,
			// Configures the Access-Control-Max-Age CORS header.
			maxAge: 3600
		},


		routes: [{
			path: "/api",
			mergeParams: false,
			authorization: true,
			// use: [
			// 	function(err, req, res, next) {
			// 		this.logger.error("Error is occured in middlewares!");
			// 		this.sendError(req, res, err);
			// 	}
			// ],
			aliases: {
				"POST users/register": "greeter.register",
				"POST users/login": "greeter.login",
				"GET greeter/hello": "greeter.hello",
				"POST books/add": "books.addBook",
				"GET books/getallbooks": "books.getBooks"
			},
			// use:[
			// 	// Access to any actions in all services under "/api" URL
			// 	route.post("/api/greeter/register", function(err,req, res){
			// 		this.logger.error("error in register...");
			// 		this.sendError(err,req,res);
			// 	}),
			// ]

			mappingPolicy: "restrict",

			// Parse body content
			bodyParsers: {
				json: {
					strict: false
				},
				urlencoded: {
					extended: false
				}
			}
		}],
		// Serve assets from "public" folder
		assets: {
			folder: "public"
		}
	},

	

	methods: {
		/**
		 * Authorize the request
		 *
		 * @param {Context} ctx
		 * @param {Object} route
		 * @param {IncomingRequest} req
		 * @returns {Promise}
		 */
		authorize(ctx, route, req) {
			console.log("i am inside authorize method 84", req);
			
			let token;
			if (req.headers.authorization) {
				let type = req.headers.authorization.split(" ")[0];
				if (type === "Token" || type === "Bearer")
					token = req.headers.authorization.split(" ")[1];
			}

			return this.Promise.resolve(token)
				.then(token => {
					if (token) {
						// Verify JWT token
						return ctx.call("greeter.resolveToken", { token })
							.then(user => {
								if (user) {
									this.logger.info("Authenticated via JWT: ", user.email);
									// Reduce user fields (it will be transferred to other nodes)
									// ctx.meta.user = _.pick(user, ["_id", "email"]);
									ctx.meta.user = { _id: user._id , email: user.email};

									ctx.meta.token = token;
									ctx.meta.userID = user._id;
								}
								return user;
							})
							.catch(err => {
								// Ignored because we continue processing if user is not exist
								return null;
							});
					}
				})
				.then(user => {
					if (req.$action.auth == "required" && !user)
						return this.Promise.reject(new UnAuthorizedError());
				});
		},
	},
};
