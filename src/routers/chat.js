const express = require("express");
const { userAuth } = require("../middleware/auth");
const { Chat } = require("../models/chat");
const ConnectionRequest = require("../models/connectionRequest");
const chatRouter = express.Router();

chatRouter.get("/chat/:targetUserId", userAuth, async (req, res) => {
  const { targetUserId } = req.params;
  const userId = req.user._id;

  try {
    const existingConnection = await ConnectionRequest.findOne({
        $or:[
            { fromUserId: userId, toUserId: targetUserId, status:"accepted" },
            { fromUserId: targetUserId, toUserId: userId }
        ]
    });
    if(!existingConnection){
        res.status(500).json({
            message:"Not authorised to chat : users are not connected"
        });
    }

    let chat = await Chat.findOne({
      participants: { $all: [userId, targetUserId] },
    }).populate({
      path: "messages.senderId",
      select: "firstName lastName",
    });
    if (!chat) {
      chat = new Chat({
        participants: [userId, targetUserId],
        messages: [],
      });
      await chat.save();
    }
    res.json(chat);
  } catch (err) {
    console.error(err);
  }
});

module.exports = chatRouter;