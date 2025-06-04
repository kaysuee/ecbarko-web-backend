import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import UserModel from './models/user.js'; 

dotenv.config(); 

mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('MongoDB connected');
}).catch((err) => {
    console.error('MongoDB connection error:', err);
});

const createUser = async () => {
    try {
        const name = '';
        const email = '';
        const password = ''; 
        const role = 'admin'; 

        const existing = await UserModel.findOne({ email });
        if (existing) {
            console.log('User already exists with this email.');
            return;
        }

        const hashedPassword = bcrypt.hashSync(password, 10);

        const newUser = new UserModel({
            name,
            email,
            password: hashedPassword,
            role,
        });

        await newUser.save();
        console.log('User created successfully:', newUser);
    } catch (error) {
        console.error('Error creating user:', error);
    } finally {
        mongoose.disconnect();
    }
};

createUser();
