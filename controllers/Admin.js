
import UserModel from "../models/user.js"
import AdminModel from "../models/superAdminModels/saAdmin.model.js"
import TicketClerkModel from "../models/adminModels/ticketclerk.model.js"
import bcryptjs from 'bcryptjs'
const Getuser=async(req,res)=>{
    try {
        const users=await UserModel.find()
         res.status(200).json({users})
    } catch (error) {
        res.status(500).json({message:"internal server error"})
        console.log(error)
    }
}

const deletUser=async(req,res)=>{
    try {
        const userId=req.params.id
              const checkAdmin=await UserModel.findById(userId)

              if (checkAdmin.role === 'admin' && req.user.role !== 'super admin') {
                return  res.status(409).json({message:"you cannot delete yourself"})
              }
        const user=await UserModel.findByIdAndDelete(userId)
        if (!user) {
          return  res.status(404).json({message:"user not found"})
        }
        res.status(200).json({message:"user deleted successfully ",user})
    } catch (error) {
        res.status(500).json({message:"internal server error"})
        console.log(error)
    }
}

const verifyAdminAuth = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required" });
        }

        // First try to find user in AdminModel
        let user = await AdminModel.findOne({ email });
        let clerk = false;
        
        // If not found in AdminModel, try TicketClerkModel
        if (!user) {
            user = await TicketClerkModel.findOne({ email });
            clerk = true;
        }

        if (!user) {
            return res.status(404).json({ success: false, message: "Invalid credentials" });
        }

        // Check if account is active
        if ((!clerk && (user.status === 'inactive' || user.status === 'deactivated')) || 
            (clerk && user.status === 'inactive')) {
            return res.status(403).json({ 
                success: false, 
                message: "Account is deactivated. Please contact administration." 
            });
        }

        // Check password
        let isPasswordValid = false;
        if (user.password && user.password.startsWith('$2')) {
            // Password is hashed - use bcrypt compare
            isPasswordValid = await bcryptjs.compare(password, user.password);
        } else {
            // Password is plain text - direct comparison
            isPasswordValid = password === user.password;
        }

        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        // Authentication successful
        res.status(200).json({ 
            success: true, 
            message: "Authentication successful",
            user: {
                id: user._id,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Admin auth error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export {Getuser,deletUser,verifyAdminAuth}