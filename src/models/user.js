const mongoose = require('mongoose');
var validator = require('validator');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 50
    },
    lastName: {
        type: String,
        required: false,
        default: ""
    },
    emailId: {
        type: String,
        required: true,
        unique: true,
        minlength: 5,
        maxlength: 80,
        lowercase: true,
        validate(value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(value);
        },
        validator: function(value) {
            return validator.isEmail(value);
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        maxlength: 128
    },
    age: {
        type: Number,
        required: true,
        min: 18,
    },
    gender: {
        type: String,
        required: true,
        validate(value) {
            const allowedGenders = ['male', 'female', 'other'];
            return allowedGenders.includes(value);
        }
    },
    phone: {
        type: String,
        required: false,
        unique: true
    },
    profilePicture: {
        type: String,
        required: false,
        default: "",
        validate: {
            validator: function(value) {
                return validator.isURL(value);
            },
            message: 'Invalid URL for profile picture'
        }
    },
    about: {
        type: String,
        required: false
    },
    interests: {
        type: [String],
        required: false,
        default: []
    },
    skills: {
        type: [String],
        required: false
    },
    education: {
        type: String,
        required: false
    }
},
{timestamps: true}
);

const User = mongoose.model('User', userSchema);  

module.exports = User;