const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');


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
        unique: true, // automatically creates an index in the database for this field
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
        maxlength: 128,
        validate(value) {
            return validator.isStrongPassword(value, {
                minLength: 6,
                minLowercase: 1,
                minUppercase: 1,
                minNumbers: 1,
                minSymbols: 1
            });
        }
    },
    age: {
        type: Number,
        required: false,
        min: 18,
    },
    gender: {
        type: String,
        required: false,
        enum: {
            values: ['male', 'female', 'other'],
            message: `{VALUE} is not supported`
        },
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
        // validate: {
        //     // validator: function(value) {
        //     //     return validator.isURL(value);
        //     // },
        //     // message: 'Invalid URL for profile picture'
        // }
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

userSchema.methods.getJwtToken = async function() {
    const user = this;
    const token = await jwt.sign(
        { _id: this._id, emailId: this.emailId },           
       "DEVTINDER_SECRET_KEY",
        { expiresIn: '1d' }
    );
    return token;
}

userSchema.methods.validatePassword = async function(password) {
    const user = this;
    const passwordHash = user.password;
    const isPasswordValid = await bcrypt.compare(password, passwordHash);
    return isPasswordValid;

}   


const User = mongoose.model('User', userSchema);  

module.exports = User;