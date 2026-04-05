const express = require("express");
const requestRouter = express.Router();
const User = require("../models/user");
const validator = require("validator");
const { userAuth } = require("../middleware/auth");
const { errorHandler } = require("../middleware/error");

requestRouter.use(express.json());
requestRouter.use(errorHandler);

requestRouter.get("/users", userAuth, async function(req,res){
	let searchQuery = {
		firstName: req.body.firstName
	};
	console.log("Search query", searchQuery);
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

requestRouter.get("/users/feed", userAuth, async function(req,res){
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

requestRouter.delete("/users/:id", userAuth, async function(req,res){
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

requestRouter.patch("/users/:id", userAuth, async function(req,res){
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


requestRouter.post("/users/sendConnectionRequest", userAuth, async function(req,res){
    console.log("send connection request");
    res.send("Connection request sent");
});

module.exports = requestRouter;