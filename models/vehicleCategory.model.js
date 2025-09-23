import mongoose from 'mongoose';

const vehicleCategorySchema = new mongoose.Schema({
	_id: { type: String, required: true },
	name: { type: String, required: true },
	description: { type: String },
	type: { type: String, required: true },
	displayName: { type: String, required: true },
	laneMeterRange: { type: String },
	laneMeter: { type: Number },
	price: { type: Number, required: true },
	category: { type: String },
	color: { type: String },
	priceRange: { type: String },
	isActive: { type: Boolean, default: true },
}, { timestamps: true, collection: 'vehicle_categories' });

const VehicleCategory = mongoose.model('VehicleCategory', vehicleCategorySchema);

export default VehicleCategory;
