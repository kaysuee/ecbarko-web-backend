import mongoose from 'mongoose';

const aboutAppSchema = new mongoose.Schema({
    aboutText: {
        type: String,
        required: true,
    },
}, { timestamps: true });

const AboutApp = mongoose.model('AboutApp', aboutAppSchema);

export default AboutApp;
