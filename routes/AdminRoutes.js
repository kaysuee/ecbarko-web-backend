import express from 'express';
import { Getuser, deletUser } from '../controllers/Admin.js';
import { isSuperAdmin, isAdminOrSuperAdmin } from '../middleware/verifyToken.js'; 
import { getAboutContent, updateAboutContent } from '../controllers/AboutController.js';
import { getHomeContent, updateHomeContent } from '../controllers/HomeControllers.js';
import { getContactContent, updateContactContent } from '../controllers/ContactUsController.js';
import { getAboutEBCContent, updateAboutEBCContent } from '../controllers/AboutEBCController.js';
import { getAboutAppContent, updateAboutAppContent } from '../controllers/AboutAppController.js'; 
import { sendAutomaticEmail } from '../controllers/EmailController.js';
import { sendContactMessage } from '../controllers/ContactFormController.js';
import { getFaqs, createFaq, updateFaq, deleteFaq } from '../controllers/FaqsController.js';

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

//add about app routes
AdminRoutes.get('/aboutapp', isSuperAdmin, getAboutAppContent);
AdminRoutes.put('/aboutapp', isSuperAdmin, updateAboutAppContent);

//add faqs routes
AdminRoutes.get('/faqs', isSuperAdmin, getFaqs);
AdminRoutes.post('/faqs', isSuperAdmin, createFaq);
AdminRoutes.put('/faqs/:id', isSuperAdmin, updateFaq);
AdminRoutes.delete('/faqs/:id', isSuperAdmin, deleteFaq);

export default AdminRoutes;