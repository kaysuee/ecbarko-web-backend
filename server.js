import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import cookieparser from 'cookie-parser'
import listEndpoints from 'express-list-endpoints'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import DbCon from './utlis/db.js'
import AuthRoutes from './routes/Auth.js'
import AdminRoutes from './routes/AdminRoutes.js'
import UserRoutes from './routes/adminRoutes/userRoutes.js'
import CardRoutes from './routes/adminRoutes/cardRoutes.js'
import VehicleRoutes from './routes/adminRoutes/vehicleRoutes.js'
import ScheduleRoutes from './routes/adminRoutes/scheduleRoutes.js'
import TicketclerkRoutes from './routes/adminRoutes/ticketclerkRoutes.js'
import saAdminRoutes from './routes/superAdminRoutes/saAdminRoutes.js'
import BookingRoutes from './routes/adminRoutes/bookingRoutes.js'
import AuditTrailsRoutes from './routes/superAdminRoutes/saAuditTrailsRoutes.js'
import EticketRoutes from './routes/eticketRoutes.js'
import nfcRoutes from './routes/nfc.js'
import dashboardRoutes from './routes/dashboard.js'
import AnnouncementRoutes from './routes/announcement.js'
import saFareRoutes from './routes/superAdminRoutes/saFareRoutes.js'
import saVehicleRoutes from './routes/superAdminRoutes/saVehicleRoutes.js'

import './controllers/NfcController.js'

dotenv.config()
const PORT = process.env.PORT || 3000
const app = express()

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ✅ CREATE UPLOADS DIRECTORY IF IT DOESN'T EXIST
const uploadsDir = path.join(__dirname, 'uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
  console.log('✅ Created uploads directory at:', uploadsDir)
} else {
  console.log('✅ Uploads directory exists at:', uploadsDir)
}

// connect to mongo
DbCon()

// ✅ IMPORTANT: Serve static files BEFORE json parser
app.use("/uploads", express.static("uploads"))
console.log('✅ Static files served from /uploads')

// ✅ JSON parser - but this will be skipped for multipart/form-data
app.use(express.json())
app.use(cookieparser())

// CORS configuration with your exact frontend URL
app.use(cors({
    credentials: true,
    origin: [
        'http://localhost:5173', // For local development
        'https://www.ecbarko.com',
        'https://ecbarko.com', // Production frontend
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposedHeaders: ['Set-Cookie']
}))

// ✅ DETAILED DEBUG MIDDLEWARE - Add before routes
app.use((req, res, next) => {
    if (req.method === 'POST' || req.method === 'PUT') {
        console.log('\n=== Incoming Request ===')
        console.log('Method:', req.method)
        console.log('URL:', req.url)
        console.log('Content-Type:', req.headers['content-type'])
        console.log('Content-Length:', req.headers['content-length'])
        console.log('Origin:', req.get('Origin'))
        
        // Log when request reaches update-profile endpoint
        if (req.url.includes('update-profile')) {
            console.log('🎯 UPDATE-PROFILE endpoint hit!')
        }
    }
    next()
})

// ✅ Routes
app.use('/api/auth', AuthRoutes)
app.use('/api/admin', AdminRoutes)
app.use('/api/users', UserRoutes)
app.use('/api/cards', CardRoutes)
app.use('/api/vehicles', VehicleRoutes)
app.use('/api/schedules', ScheduleRoutes)
app.use('/api/sa-fares', saFareRoutes)
app.use('/api/sa-vehicles', saVehicleRoutes)
app.use('/api/audittrails', AuditTrailsRoutes)
app.use('/api/ticketclerks', TicketclerkRoutes)
app.use('/api/sa-admins', saAdminRoutes)
app.use('/api', nfcRoutes)
app.use('/api/bookings', BookingRoutes)
app.use('/api/eticket', EticketRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/announcements', AnnouncementRoutes)

app.get('/', (req, res) => {
    res.send('EcBarko Backend API is running!')
})

// ✅ Test endpoint for file uploads (for debugging)
app.get('/test-uploads', (req, res) => {
    try {
        const files = fs.readdirSync(uploadsDir)
        res.json({
            uploadsDir,
            filesCount: files.length,
            files: files.slice(0, 10), // Show first 10 files
            message: 'Uploads directory is accessible'
        })
    } catch (err) {
        res.status(500).json({
            error: err.message,
            uploadsDir,
            message: 'Error accessing uploads directory'
        })
    }
})

// ✅ Debug logs after app is built
try {
    console.log('\n=== Registered Endpoints ===')
    const endpoints = listEndpoints(app)
    const userEndpoints = endpoints.filter(e => e.path.includes('/api/users'))
    console.log('User endpoints:', userEndpoints)
    
    // Check if update-profile exists
    const updateProfileExists = endpoints.some(e => 
        e.path.includes('update-profile')
    )
    console.log('✅ Update-profile endpoint registered:', updateProfileExists)
    
} catch (err) {
    console.error("Error listing endpoints:", err.message)
}

app.listen(PORT, () => {
    console.log(`\n🚀 Server is running on port ${PORT}`)
    console.log(`📁 Uploads directory: ${uploadsDir}`)
    console.log(`🌐 Backend URL: ${process.env.BACKEND_URL || 'http://localhost:' + PORT}`)
})