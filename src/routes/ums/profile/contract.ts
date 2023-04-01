import Joi from 'joi';
import CustomValidation from '../../../utils/customValidation';

const updateSellerProfileContract = Joi.object({
    pocPhone: Joi.string().min(10).max(10).required().allow(null, ''),
    poc: Joi.string().required().allow(null, ''),
    website: Joi.string().required().allow(null, '')
});

const updateDeliveryPartnerPreferences = Joi.object({
    partners: Joi.array()
        .required()
        .items(
            Joi.object({
                name: Joi.string().required(),
                status: Joi.boolean().required(),
                priority: Joi.number().required(),
                clientId: Joi.string().allow(null, ''),
                username: Joi.string().allow(null, ''),
                password: Joi.string().allow(null, ''),
                email: Joi.string().allow(null, ''),
                appId: Joi.string().allow(null, ''),
                licenceKey: Joi.string().allow(null, ''),
                customerCode: Joi.string().allow(null, ''),
                shippingLicenseKey: Joi.string().allow(null, ''),
                originArea: Joi.string().allow(null, ''),
                loginId: Joi.string().allow(null, ''),
                trackingLoginId: Joi.string().allow(null, ''),
                trackingLicKey: Joi.string().allow(null, '')
            })
        )
});

const resetPasswordContract = Joi.object({
    password: CustomValidation.passwordValidation('Password'),
    otp: Joi.string().required(),
    phone: Joi.string().required()
});

export { updateSellerProfileContract, updateDeliveryPartnerPreferences, resetPasswordContract };
