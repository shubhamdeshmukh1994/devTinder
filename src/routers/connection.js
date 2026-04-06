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
        const toUserId =req.params.toUserId;
        const fromUserId = req.user._id;

        const allowedStatus = ["ignored", "interested"];
        if(!allowedStatus.includes(status)) {
            return res.status(400).json({
                message: "Invalid status value. Allowed values are 'ignored' and 'interested'."
            });
        }
        if(toUserId === fromUserId){
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

module.exports = connectionRouter;