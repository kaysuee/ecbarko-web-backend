import mongoose from 'mongoose';

const audittrailSchema = new mongoose.Schema({
  date: { type: String, required: true },
  userID: { type: String, required: true },
  name:  { type: String, required: true },  
  action: { type: String, required: true },
}, {
  timestamps: true
});

export default mongoose.model('AuditTrails', audittrailSchema, 'audittrails');

