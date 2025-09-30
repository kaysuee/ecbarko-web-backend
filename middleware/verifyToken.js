import jwt from 'jsonwebtoken';
import UserModel from '../models/superAdminModels/saAdmin.model.js';  
import UserAccountModel from '../models/adminModels/userAccount.model.js';
import TicketClerkModel from '../models/adminModels/ticketclerk.model.js';
import BasicUserModel from '../models/user.js';

const getTokenFromRequest = (req) => {
    let token = req.cookies.token;
    
    if (!token && req.headers.authorization) {
        const authHeader = req.headers.authorization;
        if (authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        }
    }
    
    return token;
};

const isSuperAdmin = async (req, res, next) => {
    try {
        const token = getTokenFromRequest(req);
        if (!token) {
            return res.status(401).json({ message: "Unauthorized: No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await UserModel.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        if (user.role !== 'super admin') {
            return res.status(403).json({ message: 'Unauthorized: User is not a super admin' });
        }

        req.user = user; 
        next();  
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const isAdminOrSuperAdmin = async (req, res, next) => {
    try {
        const token = getTokenFromRequest(req);
        if (!token) {
            return res.status(401).json({ message: "Unauthorized: No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await UserModel.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        if (user.role !== 'admin' && user.role !== 'super admin') {
            return res.status(403).json({ message: 'Unauthorized: User is not an admin or superadmin' });
        }

        req.user = user;  
        next();  
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const isUser = async (req, res, next) => {    
    try {
        const token = getTokenFromRequest(req);
        if (!token) {
            return res.status(401).json({ message: "Unauthorized: No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        let user = await UserModel.findById(decoded.userId);
        if (!user) {
            user = await UserAccountModel.findById(decoded.userId);
        }
        if (!user) {
            user = await TicketClerkModel.findById(decoded.userId);
        }
        if (!user) {
            user = await BasicUserModel.findById(decoded.userId);
            if (!user) {
                return res.status(401).json({ message: "User not found" });
            }
        }

        req.user = user;  
        next();
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export { isSuperAdmin, isAdminOrSuperAdmin, isUser };