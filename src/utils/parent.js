const {Worker} = require("node:worker_threads");
const path = require("path");
const os = require("os");
const worker = new Worker(path.resolve(
    __dirname, "../workers/cpu-intensive.worker.js"),
    {
        workerData:{
            num:10
        }
    }
);
worker.on("message",(result)=>{
    console.log("sqare of 10 = ", result);
});
worker.on("error", (msg)=>{
    console.log("Error => ", msg);
});
console.log('hurreyy')


//console.log(os.cpus().length);