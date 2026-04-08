const express = require("express");
const usersRouter = express.Router();
const User = require("../models/user");
const validator = require("validator");
const { userAuth } = require("../middleware/auth");
const { errorHandler } = require("../middleware/error");
const ConnectionRequest = require("../models/connectionRequest");
const { patch } = require("./auth");

usersRouter.use(express.json());
usersRouter.use(errorHandler);

usersRouter.get("/users", userAuth, async function(req,res){
	let searchQuery = {
		firstName: req.body.firstName
	};
	try {
		let user = await User.find(searchQuery);
		if(user.length === 0) {
			res.status(404).send("User not found");
		} else {
			res.send(user);
		}
	} catch (error) {
		console.log("Error fetching users", error);
		res.status(500).send("Error fetching users");	
	}	
});

usersRouter.get("/usersList", userAuth, async function(req,res){
	try {
		let user = await User.find();
		if(user.length === 0) {
			res.status(404).send("User not found");
		} else {
			res.send(user);
		}
	} catch (error) {
		console.log("Error fetching users", error);
		res.status(500).send("Error fetching users");	
	}	
});

usersRouter.delete("/users/:id", userAuth, async function(req,res){
	let userId = req.params.id;
	try { 
		let data = await User.findByIdAndDelete(userId);
		if(data) {
			res.send("User deleted successfully");
		} else {
			res.status(404).send("User not found");
		}
	} catch (error) {
		console.log("Error deleting user", error);
		res.status(500).send("Error deleting user");	
	}	
});

usersRouter.patch("/users/:id", userAuth, async function(req,res){
	let userId = req.params.id;
	let body = req.body;
	try { 

		let allowed_update = [
			"firstName", "lastName", "age", "gender", "profilePicture", "about", "interests", "skills", "education"];
		let is_allowed_update = allowed_update && Object.keys(body).every((k)=>
			allowed_update.includes(k)
		)

		if(!is_allowed_update) {
			return res.status(400).send("Invalid update field");
		}
		if(body?.skills && body.skills.length > 10) {
			return res.status(400).send("Maximum 10 skills allowed");
		}	

		if(body?.interests && body.interests.length > 10) {
			return res.status(400).send("Maximum 10 interests allowed");
		}	

		let data = await User.findByIdAndUpdate(userId, body, 
			{ 	new: true,
				runValidators: true
			}
		);
		if(data) {
			res.send(data);
		} else {
			res.status(404).send("User not found");
		}
	} catch (error) {
		console.log("Error updating user", error);
		res.status(500).send("Error updating user",error.message);	
	}	
});


usersRouter.get("/users/requests/:status", userAuth, async function(req,res){
	try {
		const status = req.params.status;
		const allowedStatus = ["ignored", "interested","accepted", "rejected"];
		if(!allowedStatus.includes(status)) {
			return res.status(400).send("Invalid status value");
		}
		const userId = req.user._id;
		let searchQuery = {
			toUserId: userId,
			status: status
		};
		const requests = await ConnectionRequest.find(
			searchQuery
		).populate("fromUserId", [
			"firstName", 
			"lastName", 
			"profilePicture", "about", "age", "gender", "interests", "skills", "education"
		]);
		res.send({
			message: "Connection requests fetched successfully",
			requests
		});
	} catch (error) {
		console.log("Error sending connection request", error);
		res.status(500).send("Error sending connection request");
	}
   
});


usersRouter.get("/users/connections", userAuth, async function(req,res){
	try {
		const userId = req.user._id;
		let searchQuery = {
			$or: [
				{ fromUserId: userId, status: "accepted" },
				{ toUserId: userId, status: "accepted" }
			]
		};
		const connections = await ConnectionRequest.find(
			searchQuery
		).populate("fromUserId toUserId", [
			"firstName", 
			"lastName", 
			"profilePicture", 
			"about", 
			"age", "skills", "education", "gender", "interests"
		]).populate("toUserId", [
			"firstName", 
			"lastName", 
			"profilePicture", 
			"about", 
			"age", "skills", "education", "gender", "interests"
		]);
		const data = connections.map(connection => {
			if(connection.fromUserId._id.toString() === userId.toString()) {
				return connection.toUserId;
			} else {
				return connection.fromUserId;
			}
		});	
		
		res.send({
			message: "Connections fetched successfully",
			data
		});
	} catch (error) {
		console.log("Error sending connection request", error);
		res.status(500).send("Error sending connection request");
	}
});


usersRouter.get("/users/feed", userAuth, async function(req,res){
	try {
		const userId = req.user._id;
		//const {page = 1, limit = 10} = req.query;
		const page = req.query.page ? parseInt(req.query.page) : 1;
		let limit = req.query.limit ? parseInt(req.query.limit) : 10;
		limit = limit > 50 ? 50 : limit;
		const skip = (page - 1) * limit;
		//expect
		// 1 his onw card, 2. his connections, 
		// 3. ignored people
		// 4. arleady send the connection request people

		const conectionsRequests = await ConnectionRequest.find({
			$or: [ { fromUserId: userId }, { toUserId: userId } ]
		}).select("fromUserId toUserId")

		const hideUsersFromFeed = new Set();
		conectionsRequests.forEach(connection => {
			hideUsersFromFeed.add(connection.fromUserId.toString());
			hideUsersFromFeed.add(connection.toUserId.toString());
		});
		hideUsersFromFeed.add(userId.toString());

		const Users = await User.find({
			_id: { $nin: Array.from(hideUsersFromFeed) }
		}).select("firstName lastName profilePicture about age gender interests skills education"
		).skip(skip).limit(limit);

		res.send({
			message: "User feed fetched successfully",
			data: Users
		});
	} catch (error) {
		console.log("Error fetching user feed", error);
		res.status(500).send("Error fetching user feed");
	}
});
module.exports = usersRouter;