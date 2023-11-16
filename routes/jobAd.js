import express from 'express';
import { addJobController } from '../controller/jobAdController.js';
import { validateToken } from '../helpers/token.js';

export const jobAdRoutes = express.Router();

jobAdRoutes.post('/', validateToken, addJobController);
// jobAdRoutes.get('/', getJobAdsController);
// jobAdRoutes.get('/:id', getJobAdController);
// jobAdRoutes.put('/:id', updateJobAdController);
