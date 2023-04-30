import { Router } from "express";
import { profileRoutes } from "./profile";
import { registerRoutes } from './register';
import { tsRoutes } from "./toServer/toServer";

const umsRoutes = Router();


umsRoutes.use('/register/', registerRoutes);

umsRoutes.use('/profile/', profileRoutes);

umsRoutes.use('/ts', tsRoutes);
export { umsRoutes };

