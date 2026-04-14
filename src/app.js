require('dotenv').config()
let express = require("express");
let app = express();
let connectDb = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const http = require("http");
const port = process.env.PORT || 3000;

//The ExpressJSon() middleware is applied to parse incoming JSON request bodies,
app.use(cors({
  origin: 'http://localhost:5175',
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());

const authRouter = require("./routers/auth");
const profileRouter = require("./routers/profile");
const usersRouter = require("./routers/users");
const connectionRouter = require("./routers/connection");
const initializeSocket = require("./utils/socket");
const chatRouter = require("./routers/chat");

app.use("/",authRouter);
app.use("/",profileRouter);
app.use("/",usersRouter);
app.use("/",connectionRouter);
app.use("/", chatRouter);


const server = http.createServer(app);
initializeSocket(server);

connectDb().then(() => {
	console.log('Database connected successfully');
	let server = app.listen(port, function(){
		console.log("listing to port : "+port);
	});
}).catch(err => console.log(err));

// kill -9 $(lsof -t -i:3000)
// killall node