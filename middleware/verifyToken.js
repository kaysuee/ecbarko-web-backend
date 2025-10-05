import jwt from 'jsonwebtoken';
import UserModel from '../models/superAdminModels/saAdmin.model.js';  
import TicketClerkModel from '../models/adminModels/ticketclerk.model.js';
import BlacklistedTokenModel from '../models/blacklistedToken.model.js';

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
        
        // Check if user is blacklisted (account deactivated)
        const blacklistedToken = await BlacklistedTokenModel.findOne({ userId: decoded.userId });
        if (blacklistedToken) {
            res.clearCookie("token");
            return res.status(401).json({ 
                message: "Your account has been deactivated. Please contact administrator.",
                accountDeactivated: true 
            });
        }
        
        const user = await UserModel.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        // Check if account is still active
        if (user.status !== 'active') {
            await BlacklistedTokenModel.create({ userId: decoded.userId });
            res.clearCookie("token");
            return res.status(401).json({ 
                message: "Your account has been deactivated. Please contact administrator.",
                accountDeactivated: true 
            });
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
        
        // Check if user is blacklisted (account deactivated)
        const blacklistedToken = await BlacklistedTokenModel.findOne({ userId: decoded.userId });
        if (blacklistedToken) {
            res.clearCookie("token");
            return res.status(401).json({ 
                message: "Your account has been deactivated. Please contact administrator.",
                accountDeactivated: true 
            });
        }
        
        const user = await UserModel.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        // Check if account is still active
        if (user.status !== 'active') {
            await BlacklistedTokenModel.create({ userId: decoded.userId });
            res.clearCookie("token");
            return res.status(401).json({ 
                message: "Your account has been deactivated. Please contact administrator.",
                accountDeactivated: true 
            });
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
        
        // Check if user is blacklisted (account deactivated)
        const blacklistedToken = await BlacklistedTokenModel.findOne({ userId: decoded.userId });
        if (blacklistedToken) {
            res.clearCookie("token");
            return res.status(401).json({ 
                message: "Your account has been deactivated. Please contact administrator.",
                accountDeactivated: true 
            });
        }
        
        let user = await UserModel.findById(decoded.userId);
        if (!user) {
            user = await TicketClerkModel.findById(decoded.userId);
            if (!user) {
                return res.status(401).json({ message: "User not found" });
            }
        }

        // Double check if account is still active
        if (user.status !== 'active') {
            // Add to blacklist and clear token
            await BlacklistedTokenModel.create({ userId: decoded.userId });
            res.clearCookie("token");
            return res.status(401).json({ 
                message: "Your account has been deactivated. Please contact administrator.",
                accountDeactivated: true 
            });
        }

        req.user = user;  
        next();
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export { isSuperAdmin, isAdminOrSuperAdmin, isUser };