const {parentPort, workerData, isMainThread} = require('worker_threads');
// console.log("Worker created with id => ", worker.threadId);
// console.log("Main thread id => ", process.pid);
// console.log("Number of CPU cores => ", os.cpus().length);
console.log("Is main thread => ", isMainThread);
parentPort.postMessage(workerData.num * workerData.num)