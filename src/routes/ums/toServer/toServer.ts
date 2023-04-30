import { Router } from 'express';
import { ValuerProfile } from '../../../controller/ums/profile';
import { validateAuthorization } from '../../../middleware/authentication';


const tsRoutes = Router();

tsRoutes.get('/verifyToken', validateAuthorization, ValuerProfile.verifyToken);


export { tsRoutes };
