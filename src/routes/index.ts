import express, { Router } from 'express';
import { oauthRoutes } from './oauth';
import { umsRoutes } from './ums';
const apiRoutes = Router();

apiRoutes.use('/oauth2', oauthRoutes);
apiRoutes.use('/ums', umsRoutes);

export { apiRoutes };
