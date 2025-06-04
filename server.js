import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import cookieparser from 'cookie-parser'
import DbCon from './utlis/db.js'
import AuthRoutes from './routes/Auth.js'
import AdminRoutes from './routes/AdminRoutes.js'
import UserRoutes from './routes/adminRoutes/userRoutes.js'
import CardRoutes from './routes/adminRoutes/cardRoutes.js';
import VehicleRoutes from './routes/adminRoutes/vehicleRoutes.js';
import ScheduleRoutes from './routes/adminRoutes/scheduleRoutes.js';
import TicketclerkRoutes from './routes/adminRoutes/ticketclerkRoutes.js';
import saAdminRoutes from './routes/superAdminRoutes/saAdminRoutes.js';
import BookingRoutes from './routes/adminRoutes/bookingRoutes.js';
import nfcRoutes from './routes/nfc.js';

console.log('BookingRoutes endpoints:', listEndpoints(BookingRoutes));

import './controllers/NfcController.js';
import listEndpoints from 'express-list-endpoints';

dotenv.config()
const PORT=process.env.PORT || 3000
const app=express()

// mongo db 
DbCon()
app.use(express.json())
app.use(cookieparser())

// CORS configuration with your exact frontend URL
app.use(cors({
    credentials: true,
    origin: [
        'http://localhost:5173', // For local development
        'https://ecbarko-kr8b.onrender.com' // Your production frontend
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposedHeaders: ['Set-Cookie']
}));

// Debug middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path} - Origin: ${req.get('Origin')}`);
    next();
});

app.use('/api/auth',AuthRoutes)
app.use('/api/admin',AdminRoutes)
app.use('/api/users', UserRoutes)
app.use('/api/cards', CardRoutes);
app.use('/api/vehicles', VehicleRoutes);
app.use('/api/schedules', ScheduleRoutes);
app.use('/api/ticketclerks', TicketclerkRoutes);
app.use('/api/sa-admins', saAdminRoutes);
app.use('/api', nfcRoutes);
app.use('/api/bookings', BookingRoutes);

app.get('/',(req,res)=>{
    res.send('EcBarko Backend API is running!')
})

console.log("Registered endpoints:", listEndpoints(app));

app.listen(PORT,()=>{
    console.log(`server is running on ${PORT}`)
})