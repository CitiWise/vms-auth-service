import Joi from 'joi';

class CustomValidationClass {
    passwordValidation(name) {
        return Joi.string()
            .required()
            .min(8)
            .max(20)
            .pattern(/[*|;@#%^*+=()_\-&$]/)
            .pattern(/[*^\d+$|]/)
            .messages({
                'string.pattern.base': `${name} should contain at least one number or special character!`,
                'string.min': `${name} length should be greater than 8 characters`,
                'string.max': `${name} length should be less than 20 characters`
            });
    }
}

const CustomValidation = new CustomValidationClass();
export default CustomValidation;
