import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
    cardNumber: { type: String, required: true, unique: true }, 
    userId: { type: String, required: true }, 
    userName: { type: String, required: true }, 
    
    vehicles: [{
      vehicleName: { type: String, required: true }, 
      vehicleType: { type: String, required: true }, 
      category: { type: String, required: true }, 
      price: { type: Number, required: true }, 
      laneMeter: { type: Number, required: true }, 
      laneMeterRange: { type: String }, 
      icon: { type: String }, 
      
      plateNumber: { type: String, required: false, default: null }, 
      status: { type: String, default: 'active', enum: ['active', 'inactive', 'suspended'] },
      lastActive: { type: Date, default: Date.now },
      registeredAt: { type: Date, default: Date.now },
      vehicleId: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() } // Unique ID for each vehicle within the group
    }],
    
    totalVehicles: { type: Number, default: 0 },
    registeredBy: { type: String, required: true }, 
    lastUpdatedBy: { type: String }, 
    groupStatus: { type: String, default: 'active', enum: ['active', 'inactive', 'suspended'] },
  }, {
    timestamps: true 
  });
  
  vehicleSchema.index({ cardNumber: 1 });
  vehicleSchema.index({ userId: 1 });
  vehicleSchema.index({ 'vehicles.plateNumber': 1 });
  
  vehicleSchema.pre('save', function(next) {
    this.totalVehicles = this.vehicles.length;
    
    this.vehicles.forEach(vehicle => {
      if (!vehicle.vehicleId) {
        vehicle.vehicleId = new mongoose.Types.ObjectId();
      }
    });
    
    next();
  });
  
  vehicleSchema.methods.addVehicle = function(vehicleData) {
    if (this.vehicles.length >= 5) {
      throw new Error('Maximum 5 vehicles allowed per card');
    }
    
    const existingPlate = this.vehicles.find(v => v.plateNumber === vehicleData.plateNumber);
    if (existingPlate) {
      throw new Error('Plate number already exists in this group');
    }
    
    if (!vehicleData.vehicleId) {
      vehicleData.vehicleId = new mongoose.Types.ObjectId();
    }
    
    this.vehicles.push(vehicleData);
    this.totalVehicles = this.vehicles.length;
    return this;
  };
  
  vehicleSchema.methods.removeVehicle = function(vehicleId) {
    this.vehicles = this.vehicles.filter(v => v.vehicleId.toString() !== vehicleId.toString());
    this.totalVehicles = this.vehicles.length;
    return this;
  };
  
  vehicleSchema.methods.updateVehicle = function(vehicleId, updateData) {
    const vehicleIndex = this.vehicles.findIndex(v => v.vehicleId.toString() === vehicleId.toString());
    if (vehicleIndex === -1) {
      throw new Error('Vehicle not found in group');
    }
    
    if (updateData.plateNumber) {
      const existingPlate = this.vehicles.find((v, index) => 
        index !== vehicleIndex && v.plateNumber === updateData.plateNumber
      );
      if (existingPlate) {
        throw new Error('Plate number already exists in this group');
      }
    }
    
    Object.assign(this.vehicles[vehicleIndex], updateData);
    return this;
  };
  
  export default mongoose.model('Vehicle', vehicleSchema, 'vehicle');