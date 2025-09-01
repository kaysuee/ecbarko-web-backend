import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['info', 'warning', 'urgent'], default: 'info' },
  scheduleAffected: { type: String },
  dateCreated: { type: Date, default: Date.now },
  status: { type: String, enum: ['draft', 'sent'], default: 'draft' },
  sentTo: { type: Number, default: 0 },
  author: { type: String, default: 'Admin' },
});

const Announcement = mongoose.model('Announcement', announcementSchema, 'announcement');
export default Announcement;
