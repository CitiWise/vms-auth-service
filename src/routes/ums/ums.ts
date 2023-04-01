import { Router } from "express";
import { profileRoutes } from "./profile";
import { registerRoutes } from './register';

const umsRoutes = Router();


umsRoutes.use('/register/', registerRoutes);

umsRoutes.use('/profile/', profileRoutes);

export { umsRoutes };

