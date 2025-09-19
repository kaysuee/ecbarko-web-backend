import mongoose from 'mongoose';

const faqSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true,
        trim: true
    },
    answer: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        enum: ['general', 'payment', 'booking', 'schedule', 'account', 'support'],
        default: 'general'
    },
    order: {
        type: Number,
        required: true,
        default: 1
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

faqSchema.index({ category: 1, order: 1 });
faqSchema.index({ isActive: 1 });

const FAQ = mongoose.model('FAQ', faqSchema);

export default FAQ;