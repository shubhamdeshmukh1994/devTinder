let express = require("express");
let app = express();
let connectDb = require("./config/database");
const cookieParser = require("cookie-parser");
const port = process.env.PORT || 3000;

//The ExpressJSon() middleware is applied to parse incoming JSON request bodies,
app.use(cookieParser());
app.use(express.json());


const authRouter = require("./routers/auth");
const profileRouter = require("./routers/profile");
const requestRouter = require("./routers/request");

app.use("/",authRouter);
app.use("/",profileRouter);
app.use("/",requestRouter);


connectDb().then(() => {
	console.log('Database connected successfully');
	let server = app.listen(port, function(){
		console.log("listing to port : "+port);
	});
}).catch(err => console.log(err));

// kill -9 $(lsof -t -i:3000)
// killall node