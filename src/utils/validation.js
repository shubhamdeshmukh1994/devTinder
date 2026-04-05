const validator = require('validator');

const validateSingUpData = (req) => {
    const { firstName, lastName, emailId, password} = req;

    if (!firstName || typeof firstName !== 'string' || firstName.length < 2 || firstName.length > 50) {
        return { valid: false, message: 'First name must be a string between 2 and 50 characters' };
    }
    
    if (lastName && (typeof lastName !== 'string' || lastName.length > 50)) {
        return { valid: false, message: 'Last name must be a string with a maximum of 50 characters' };
    }

    if (!emailId || typeof emailId !== 'string' || emailId.length < 5 || emailId.length > 80 || !validator.isEmail(emailId)) {
        return { valid: false, message: 'Email must be a valid email address between 5 and 80 characters' };
    }
    if (!password || typeof password !== 'string' || password.length < 6 || password.length > 128 || !validator.isStrongPassword(password,{
         minLength: 6,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1
    })) {
        return { valid: false, message: 'Password must be a string between 6 and 128 characters and meet strength requirements' };
    }
    return { valid: true }; 
}

module.exports = {
    validateSingUpData
};