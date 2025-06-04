import express from 'express';
import { Getuser, deletUser } from '../controllers/Admin.js';
import { isSuperAdmin, isAdminOrSuperAdmin } from '../middleware/verifyToken.js'; 
import { getAboutContent, updateAboutContent } from '../controllers/AboutController.js';
import { getHomeContent, updateHomeContent } from '../controllers/HomeControllers.js';
import { getContactContent, updateContactContent } from '../controllers/ContactUsController.js';
import { getAboutEBCContent, updateAboutEBCContent } from '../controllers/AboutEBCController.js';
import { sendAutomaticEmail } from '../controllers/EmailController.js';
import { sendContactMessage } from '../controllers/ContactFormController.js';

const AdminRoutes = express.Router();

AdminRoutes.get('/getuser', isAdminOrSuperAdmin, Getuser);  
AdminRoutes.delete('/delet/:id', isAdminOrSuperAdmin, deletUser);  

// New email route
AdminRoutes.post('/send-email', sendAutomaticEmail);
AdminRoutes.post('/contact-message', sendContactMessage);

//Edit Web
AdminRoutes.get('/about', isSuperAdmin, getAboutContent);
AdminRoutes.put('/about', isSuperAdmin, updateAboutContent);

AdminRoutes.get('/home', isSuperAdmin, getHomeContent);
AdminRoutes.put('/home', isSuperAdmin, updateHomeContent);

AdminRoutes.get('/contact', isSuperAdmin, getContactContent);
AdminRoutes.put('/contact', isSuperAdmin, updateContactContent);

//add about ebc
AdminRoutes.get('/aboutEBC', isSuperAdmin, getAboutEBCContent);
AdminRoutes.put('/aboutEBC', isSuperAdmin, updateAboutEBCContent);

export default AdminRoutes;
