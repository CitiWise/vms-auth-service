import { Router } from 'express';

import { validate } from '../../../middleware/schema';
import { resetPasswordContract } from './contract';
import { validateCookie } from '../../../middleware/authentication';
import { ValuerProfile, OtpController } from '../../../controller/ums/profile';
import { LenderProfile } from '../../../controller/ums/profile/lender.profile';

const profileRoutes = Router();

profileRoutes.get('/valuer', validateCookie, ValuerProfile.get);
profileRoutes.get('/lender', validateCookie, LenderProfile.get);
profileRoutes.put('/valuer', validateCookie, ValuerProfile.update);
profileRoutes.put('/lender', validateCookie, LenderProfile.update);
profileRoutes.put('/reset-password', validate(resetPasswordContract), ValuerProfile.resetPassword);
profileRoutes.post('/verify-otp', validateCookie, OtpController.verifyMobile);
profileRoutes.post('/send-otp', validateCookie, OtpController.send);
profileRoutes.post('/forgot-password-otp', OtpController.send);

export { profileRoutes };
