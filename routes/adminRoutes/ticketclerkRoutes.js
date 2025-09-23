import express from 'express';
import TicketClerk from '../../models/adminModels/ticketclerk.model.js';
import Token from '../../models/token.model.js';
import sendEmail from '../../utlis/sendEmail.js';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const clerks = await TicketClerk.find();
    res.json(clerks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin/SuperAdmin creates a ticket clerk (no password, inactive, sends invite email)
router.post('/', async (req, res) => {
  console.log('Received request body:', req.body);
  const { name, email, clerkId } = req.body;

  try {
    // Validate required fields
    if (!name || !email || !clerkId) {
      return res.status(400).json({ 
        error: 'Missing required fields: name, email, and clerkId are required' 
      });
    }

    // Check if clerk ID already exists
    const existingClerk = await TicketClerk.findOne({ clerkId });
    if (existingClerk) {
      return res.status(400).json({ error: 'Clerk ID already exists' });
    }

    // Check if email already exists
    const existingEmail = await TicketClerk.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const newClerk = new TicketClerk({
      name,
      email,
      clerkId,
      password: null,
      status: 'inactive'
    });
    console.log('Creating clerk:', newClerk);
    await newClerk.save();

    // Generate one-time token
    const token = crypto.randomBytes(32).toString('hex');
    await Token.create({
      userId: newClerk._id,
      token,
      expiresAt: Date.now() + 1000 * 60 * 60, // 1 hour
      userType: 'TicketClerk'
    });

    // Send invitation email with link to frontend
    const link = `${process.env.FRONTEND_URL}/set-password/${token}`;
    await sendEmail(
      email,
      'Set up your Ticket Clerk account',
      `Hi ${name}, please click this link to set your password: ${link}`,
      `<p>Hi ${name},</p>
       <p>Your Ticket Clerk account has been created. Please click the link below to set your password:</p>
       <p><strong>Clerk ID:</strong> ${clerkId}</p>
       <a href="${link}">Set Password</a>
       <p>This link will expire in 1 hour.</p>`
    );

    res.status(201).json({ 
      message: 'Ticket Clerk registered, invitation email sent',
      clerk: newClerk
    });
  } catch (err) {
    console.error('Error creating ticket clerk:', err);
    res.status(400).json({ error: err.message });
  }
});

// Ticket clerk sets their password (from email link)
router.post('/set-password', async (req, res) => {
  const { token, password } = req.body;
  console.log('🔑 Set password request:', {
    tokenPreview: token?.substring(0, 8) + '...',
    passwordLength: password?.length
  });

  try {
    if (!token || !password) {
      return res.status(400).json({ 
        success: false,
        error: 'Token and password are required' 
      });
    }

    // Find token doc for TicketClerk
    const tokenDoc = await Token.findOne({ 
      token,
      userType: 'TicketClerk'
    });

    console.log('📌 Token found:', tokenDoc ? 'Yes' : 'No');

    if (!tokenDoc) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid or expired token' 
      });
    }

    if (tokenDoc.expiresAt < Date.now()) {
      console.log('⚠️ Token expired');
      // Clean up expired token
      await Token.deleteOne({ _id: tokenDoc._id });
      return res.status(400).json({ 
        success: false,
        error: 'Token expired. Please request a new invitation.' 
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log('✅ Password hashed, length:', hashedPassword.length);

    // Update the clerk
    const updatedClerk = await TicketClerk.findByIdAndUpdate(
      tokenDoc.userId,
      {
        password: hashedPassword,
        status: 'active'
      },
      { new: true }
    );

    if (!updatedClerk) {
      console.log('❌ Clerk not found with id:', tokenDoc.userId);
      return res.status(404).json({ 
        success: false,
        error: 'Clerk account not found' 
      });
    }

    console.log('✅ Clerk updated:', {
      id: updatedClerk._id.toString(),
      email: updatedClerk.email,
      status: updatedClerk.status,
      hasPassword: !!updatedClerk.password
    });

    // Delete token so it can't be reused
    await Token.deleteOne({ _id: tokenDoc._id });
    console.log('🗑️ Token deleted');

    // Return consistent success response
    res.status(200).json({
      success: true,
      message: 'Password set successfully! You can now log in.',
      clerkId: updatedClerk.clerkId,
      clerk: {
        name: updatedClerk.name,
        email: updatedClerk.email,
        clerkId: updatedClerk.clerkId,
        status: updatedClerk.status
      }
    });
  } catch (err) {
    console.error('❌ Set password error:', err);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error. Please try again.' 
    });
  }
});


router.put('/:id', async (req, res) => {
  try {
    const updatedClerk = await TicketClerk.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true }
    );
    res.json(updatedClerk);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id/status', async (req, res) => {
    const { status, reason } = req.body;
    try {
      const updatedClerk = await TicketClerk.findByIdAndUpdate(
        req.params.id,
        { status, reason },
        { new: true }
      );
      res.json(updatedClerk);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
});  

// Manual password reset by admin (existing functionality)
router.put('/:id/password', async (req, res) => {
  const { password } = req.body;

  try {
    // Hash the password before storing
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log('Admin password reset - hashing password');

    const updatedUser = await TicketClerk.findOneAndUpdate(
      { clerkId: req.params.id },
      { password: hashedPassword }, // Store hashed password
      { new: true }
    );
    console.log("Updated User:", updatedUser?.clerkId);
    
    // Note: You'll need to import sendResetPassword if you want to keep this functionality
    // await sendResetPassword(updatedUser.email, password);
    res.json(updatedUser);
  } catch (err) {
    console.error('Password reset error:', err);
    res.status(400).json({ error: err.message });
  }
});  

export default router;