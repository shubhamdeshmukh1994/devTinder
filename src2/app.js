let express = require("express");
let app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})


app.get("/", function(req,res){
	console.log("home page");
	console.log("global",global)
	res.send("Hello Home Page");
});

app.get("/users", function(req,res){
	console.log("Users Page");
	res.send("Hello Users Page");
});

let server = app.listen(port,function(){
	//let port = server.address().port
	console.log("listing to port : "+port);
	//console.log("Example app listening at http://", host, port)
})

// kill -9 $(lsof -t -i:3000)
// killall node