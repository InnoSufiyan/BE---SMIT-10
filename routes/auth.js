import express from 'express';
import { forgotPasswordEmail, login, resetPasswordEmail, signUp } from '../controller/authController.js';

export const authRoutes = express.Router();

authRoutes.post('/signup', signUp);
authRoutes.post('/login', login);
authRoutes.post('/forgotPassword', forgotPasswordEmail);
authRoutes.put('/resetPassword', resetPasswordEmail);
