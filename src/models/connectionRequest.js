const mongoose = require('mongoose');

const connectionRequestSchema = new mongoose.Schema({
    fromUserId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    toUserId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: {
            values: ['ignored', 'interested', 'accepted', 'rejected'],
            message: `{VALUE} is not supported`
        },
        default: ''
    }
}, { timestamps: true });

connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 }, { unique: true });

connectionRequestSchema.pre('save', async function(next) {
    try {
        const connectionRequest = this;
        // const existingRequest = await ConnectionRequest.findOne({
        //     $or:[
        //         { fromUserId: this.fromUserId, toUserId: this.toUserId },
        //         { fromUserId: this.toUserId, toUserId: this.fromUserId }
        //     ]
        // });
        // if(existingRequest) {
        //     throw new Error("A connection request already exists between these users.");
        // }
        if(connectionRequest.fromUserId.equals(connectionRequest.toUserId)) {
            throw new Error("You cannot send a connection request to yourself.");
        }
    } catch (error) {
        next(error);
    }
});

const ConnectionRequest = mongoose.model('ConnectionRequest', connectionRequestSchema);

module.exports = ConnectionRequest;