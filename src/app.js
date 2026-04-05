let express = require("express");
let app = express();
let connectDb = require("./config/database");
const port = process.env.PORT || 3000;
const User = require("./models/user");
const { validateSingUpData } = require("./utils/validation");
const bycrypt = require("bcrypt");
const validator = require("validator");
const cookieParser = require("cookie-parser");
const { userAuth } = require("./middleware/auth");

app.use(cookieParser());
//The ExpressJSon() middleware is applied to parse incoming JSON request bodies, making the data accessible via req.body.
app.use(express.json());

app.use((err, req, res, next) => {
	if(err) {
		console.error(err.stack);
		res.status(500).send('Something broke!');
	} else {
		next();
	}
});

app.post("/users/login", async function(req,res){
	let { emailId, password } = req.body;
	try {
		if(!validator.isEmail(emailId)) {
			return res.status(400).send("Invalid email");
		}
		let user = await User.findOne({ emailId });
		if(!user) {
			return res.status(404).send("User not found");
		}
		console.log("User found", user);
		const isPasswordMatch = await user.validatePassword(password);
		if(isPasswordMatch) {
			const token = await user.getJwtToken();
			//set and send cookie with token
			res.cookie("token", token, {
				httpOnly: true,
				expires: new Date(Date.now() + 24 * 3600000)
			});
			res.send({
				message: "Login successful",
				token
			});
		} else {
			res.status(401).send("Invalid credentials");
		}
	} catch (error) {
		console.log("Error logging in user", error);
		res.status(500).send("Error logging in user");	
	}	
});

app.post("/users/signup", async function(req,res){
	try {
		validateSingUpData(req.body);
		const { password } = req.body;
		const saltRounds = 10;
		const hashedPassword = await bycrypt.hash(password, saltRounds);
		console.log("Hashed password", hashedPassword);
		const user = new User({
			firstName: req.body.firstName,
			lastName: req.body.lastName,
			emailId: req.body.emailId,
			password: hashedPassword,
			phone: req.body.phone
		});

		let data = await user.save();
		console.log("User created",data);
		res.send("post request to users");
	} catch (error) {
		console.log("Error validating user data", error);
		return res.status(500).send("Error validating user data");
	}

	//validation for required fields
	// Encrypt password

	
});

app.get("/users", userAuth, async function(req,res){
	let searchQuery = {
		firstName: req.body.firstName
	};
	console.log("Search query", searchQuery);
	try {
		let user = await User.find(searchQuery);
		console.log("Users fetched",user);
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

app.get("/users/feed", userAuth, async function(req,res){
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

app.delete("/users/:id", userAuth, async function(req,res){
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

app.patch("/users/:id", userAuth, async function(req,res){
	let userId = req.params.id;
	console.log("User id to delete", userId);
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
		console.log("User updated",data);
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



app.get("/users/profile", userAuth, async function(req,res){
	try {
		const user = req.user;
		if(!user) {
			return res.status(404).send("User not found");
		}
		res.send(user);	
	} catch(err) {
		console.log("Error logging in user", error);
		res.status(500).send("Error logging in user");	
	}
});

app.post("/users/sendConnectionRequest", userAuth, async function(req,res){
	console.log("send connection request");
	res.send("Connection request sent");
});


connectDb().then(() => {
	console.log('Database connected successfully');
	let server = app.listen(port, function(){
		console.log("listing to port : "+port);
	});
}).catch(err => console.log(err));

// kill -9 $(lsof -t -i:3000)
// killall node