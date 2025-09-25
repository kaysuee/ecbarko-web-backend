import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String }, 
  role: {
    type: String,
    enum: ['super admin', 'sa-admin' ,'admin', 'ticketclerk'],
    default: 'admin'
  },
  adminId:  { type: String, required: true, unique: true },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  shippingLines: {
    type: String,
    validate: {
      validator: function (v) {
        if (this.role === 'admin') {
          return v != null && v.trim() !== '';
        }
        return true;
      },
      message: 'ShippingLines is required for users with role "admin"'
    }
  },
}, { timestamps: true });

export default mongoose.model('Users', userSchema, 'users');
