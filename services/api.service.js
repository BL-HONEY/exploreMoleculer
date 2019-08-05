"use strict";

const ApiGateway = require("moleculer-web");
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
			use: [
				function(err, req, res, next) {
					this.logger.error("Error is occured in middlewares!");
					this.sendError(req, res, err);
				}
			],
			aliases: {
				"POST users/register": "greeter.register"
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
	}
};
