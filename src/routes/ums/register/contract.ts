import Joi from 'joi';
import CustomValidation from '../../../utils/customValidation';



const registerLenderContract = Joi.object({
    xsrfToken: Joi.string().required(),
    email: Joi.string().email({ tlds: { allow: false } }),
    password: CustomValidation.passwordValidation('Password'),
    confirmPassword: CustomValidation.passwordValidation('Confirm Password'),
    phone: Joi.number().min(1000000000).max(9999999999).required(),
    pan: Joi.string().length(10).required(),
    gst: Joi.string().length(15).required(),
    website: Joi.string().required().allow(null, ''),
    name: Joi.string().required(),
    poc: Joi.string().required(),
    pocPhone: Joi.string().required(),
    address: {
        line1: Joi.string().required(),
        line2: Joi.string().required(),
        city: Joi.string().required(),
        state: Joi.string().required(),
        pincode: Joi.string().required()
    }
});

const registerValuerContract = Joi.object({
    xsrfToken: Joi.string().required(),
    email: Joi.string().email({ tlds: { allow: false } }),
    password: CustomValidation.passwordValidation('Password'),
    confirmPassword: CustomValidation.passwordValidation('Confirm Password'),
    phone: Joi.number().min(1000000000).max(9999999999).required(),
    pan: Joi.string().length(10).required(),
    name: Joi.string().required(),
    address: {
        line1: Joi.string().required(),
        line2: Joi.string().required(),
        city: Joi.string().required(),
        state: Joi.string().required(),
        pincode: Joi.string().required()
    }
});

export { registerLenderContract, registerValuerContract };
