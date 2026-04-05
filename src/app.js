let express = require("express");
let app = express();
let connectDb = require("./config/database");
const port = process.env.PORT || 3000;
const User = require("./models/user");

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

app.post("/users/signup", async function(req,res){
	console.log("Request body", req.body);
	const user = new User({
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		emailId: req.body.emailId,
		password: req.body.password,
		age: req.body.age,
		gender: req.body.gender,
		phone: req.body.phone,
		profilePicture: req.body.profilePicture	
	});
	try {
		let data = await user.save();
		console.log("User created",data);
		res.send("post request to users");
	} catch (error) {
		console.log("Error creating user", error);
		res.status(500).send("Error creating user");	
	}
});

app.get("/users", async function(req,res){
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

app.get("/users/feed", async function(req,res){
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


app.delete("/users/:id", async function(req,res){
	console.log("Request params", req.params,req.body, req);
	let userId = req.params.id;
	console.log("User id to delete", userId);
	try { 
		let data = await User.findByIdAndDelete(userId);
		console.log("User deleted",data);
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

app.patch("/users/:id", async function(req,res){
	console.log("Request params", req.params,req.body, req);
	let userId = req.params.id;
	console.log("User id to delete", userId);
	let body = req.body;
	try { 
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




connectDb().then(() => {
	console.log('Database connected successfully');
	let server = app.listen(port, function(){
		console.log("listing to port : "+port);
	});
}).catch(err => console.log(err));

// kill -9 $(lsof -t -i:3000)
// killall node