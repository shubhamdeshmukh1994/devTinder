const express = require("express");
const connectionRouter = express.Router();
const ConnectionRequest = require("../models/connectionRequest");
const validator = require("validator");
const { userAuth } = require("../middleware/auth");
const { errorHandler } = require("../middleware/error");
const User = require("../models/user");


connectionRouter.use(express.json());
connectionRouter.use(errorHandler);

connectionRouter.post("/connection/send-request/:status/:toUserId", userAuth, async function(req,res){
    try {   
        const status = req.params.status;
        const toUserId =req.params.toUserId.toString();
        const fromUserId = req.user._id.toString()

        const allowedStatus = ["ignored", "interested"];
        if(!allowedStatus.includes(status)) {
            return res.status(400).json({
                message: "Invalid status value. Allowed values are 'ignored' and 'interested'."
            });
        }
        if(toUserId === fromUserId) {
            return res.status(400).json({
                message: "You cannot send a connection request to yourself."
            });
        }
        const isValidToUserId = await User.findById(toUserId);
        if(!isValidToUserId) {
            return res.status(400).json({
                message: "Invalid toUserId. It should be a valid MongoDB ObjectId."
            });
        }
        const existingRequest = await ConnectionRequest.findOne({
            $or:[
                { fromUserId, toUserId },
                { fromUserId: toUserId, toUserId: fromUserId }
            ]
        });

        if(existingRequest) {
            return res.status(400).json({
                message: "A connection request already exists between these users."
            });
        }

        const conneqtionRequest = new ConnectionRequest({
            fromUserId: fromUserId,
            toUserId: toUserId,
            status: status
        });
        const data = await conneqtionRequest.save();
        res.send({
            message: "Connection request sent successfully",
            data
        });
    } catch (error) {
        console.log("Error sending connection request", error);
        res.status(500).send("Error sending connection request");
    }
});

connectionRouter.post("/connection/review-request/:status/:requestId", userAuth, async function(req,res){
    try {
        const status = req.params.status;
        const requestId = req.params.requestId;
        const userId = req.user._id;
    
        const allowedStatus = ["accepted", "rejected"];
        if(!allowedStatus.includes(status)) {
            return res.status(400).json({
                message: "Invalid status value. Allowed values are 'accepted' and 'rejected'."
            }); 
        }
        const connectionRequest = await ConnectionRequest.findById(requestId);
        if(!connectionRequest) {
            return res.status(404).json({
                message: "Connection request not found."
            });
        }
        console.log("userId",userId.toString(),"fromUserId",connectionRequest.fromUserId.toString())
        if(connectionRequest.fromUserId.toString() === userId.toString()) {
            return res.status(403).json({
                message: "You are not authorized to review this connection request."
            });
        }
        if(connectionRequest.status !== "interested") {
            return res.status(400).json({
                message: `This connection request has already been ${connectionRequest.status}.`
            });
        }
        connectionRequest.status = status;
        const data =await connectionRequest.save();
        res.send({
            message: `Connection request ${status} successfully.`,
            data
        });
    } catch (error) {
        console.log("Error reviewing connection request", error);
        res.status(500).send("Error reviewing connection request");
    }
});

module.exports = connectionRouter;