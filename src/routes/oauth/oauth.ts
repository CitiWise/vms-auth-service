import { Router } from "express";
import { authenticateClient, authenticateUser, generateToken, logoutUser } from "../../controller/oauth";
const oauthRoutes = Router();
import { validateCookie } from '../../middleware/authentication';
import { validate } from '../../middleware/schema';
import { postAuthenticateContract, postGenerateTokenContract } from "./contract";

oauthRoutes.get('/authenticate', authenticateClient);
oauthRoutes.post('/authenticate', validate(postAuthenticateContract), authenticateUser);
oauthRoutes.post('/token', validate(postGenerateTokenContract), generateToken);
oauthRoutes.delete('/logout', validateCookie, logoutUser);

export { oauthRoutes };

