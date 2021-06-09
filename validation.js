const Joi = require('@hapi/joi');

const registerValidation = data => {
    //NOTE: regex(/^\S+$/) is joi expression for no space
    const RegisterSchema = Joi.object({
        username: Joi.string().min(6).regex(/^\S+$/).required(),
        password: Joi.string().min(6).required()
    });

        //This is the new joi to validate a data
        return RegisterSchema.validate(data);
}

const logValidation = data => {
    const LogSchema = Joi.object({
        title: Joi.string().min(6).required(),
        username: Joi.string().min(6).regex(/^\S+$/).required(),
        email: Joi.string().min(6).regex(/^\S+$/).email().required(),
        password: Joi.string().min(6).required()
    });

    return LogSchema.validate(data);
}

module.exports.registerValidation = registerValidation;
module.exports.logValidation = logValidation;