import { Router } from 'express';
import { registerLender, registerValuer } from '../../../controller/ums/registeration';
import { validate } from '../../../middleware/schema';
import { registerLenderContract, registerValuerContract } from './contract';

const registerRoutes = Router();

registerRoutes.post('/lender', validate(registerLenderContract), registerLender);
registerRoutes.post('/valuer', validate(registerValuerContract), registerValuer);

export { registerRoutes };
