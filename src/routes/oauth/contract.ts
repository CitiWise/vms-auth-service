import Joi from 'joi';

// email and phone ar optional because user has the ability to send either email or phone from FE
const postAuthenticateContract = Joi.object({
    xsrfToken: Joi.string().required(),
    email: Joi.optional(),
    phone: Joi.optional(),
    username: Joi.optional(),
    password: Joi.string().required(),
    userLoginType: Joi.string().required()
});

const postGenerateTokenContract = Joi.object({
    grantType: Joi.string().required(),
    code: Joi.string().required()
});

export { postAuthenticateContract, postGenerateTokenContract };
