import express from 'express';
import Vehicle from '../../models/adminModels/vehicle.model.js';
import VehicleCategory from '../../models/vehicleCategory.model.js';
import Card from '../../models/card.js';
import UserAccount from '../../models/adminModels/userAccount.model.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const vehicleGroups = await Vehicle.find().sort({ createdAt: -1 });
    
    console.log('Found vehicle groups:', vehicleGroups.length);
    
    const allVehicles = [];
    
    vehicleGroups.forEach((group, groupIndex) => {
      console.log(`Group ${groupIndex}: ${group.cardNumber} with ${group.vehicles.length} vehicles`);
      if (group.vehicles && group.vehicles.length > 0) {
        group.vehicles.forEach((vehicle, vehicleIndex) => {
          console.log(`  Vehicle ${vehicleIndex}: ${vehicle.vehicleName} (${vehicle.plateNumber}) - ID: ${vehicle.vehicleId}`);
          allVehicles.push({
            _id: vehicle.vehicleId,
            cardNumber: group.cardNumber,
            userId: group.userId,
            userName: group.userName,
            vehicleName: vehicle.vehicleName,
            vehicleType: vehicle.vehicleType,
            category: vehicle.category,
            price: vehicle.price,
            laneMeter: vehicle.laneMeter,
            laneMeterRange: vehicle.laneMeterRange,
            icon: vehicle.icon,
            plateNumber: vehicle.plateNumber,
            status: vehicle.status,
            lastActive: vehicle.lastActive,
            registeredBy: group.registeredBy,
            createdAt: group.createdAt,
            updatedAt: group.updatedAt,
            groupId: group._id,
            isGrouped: true,
            totalVehiclesInGroup: group.totalVehicles
          });
        });
      }
    });
    
    allVehicles.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    console.log('Returning flattened vehicles:', allVehicles.length);
    res.json(allVehicles);
  } catch (err) {
    console.error('Error fetching vehicles:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/card/:cardNumber', async (req, res) => {
  try {
    console.log('Fetching vehicles for card:', req.params.cardNumber);
    
    const vehicleGroup = await Vehicle.findOne({ cardNumber: req.params.cardNumber });
    let groupedVehicles = [];
    
    if (vehicleGroup) {
      console.log(`Found vehicle group with ${vehicleGroup.vehicles.length} vehicles`);
      groupedVehicles = vehicleGroup.vehicles.map(vehicle => {
        console.log(`Vehicle: ${vehicle.vehicleName} (${vehicle.plateNumber}) - ID: ${vehicle.vehicleId}`);
        return {
          _id: vehicle.vehicleId,
          cardNumber: vehicleGroup.cardNumber,
          userId: vehicleGroup.userId,
          userName: vehicleGroup.userName,
          vehicleName: vehicle.vehicleName,
          vehicleType: vehicle.vehicleType,
          category: vehicle.category,
          price: vehicle.price,
          laneMeter: vehicle.laneMeter,
          laneMeterRange: vehicle.laneMeterRange,
          icon: vehicle.icon,
          plateNumber: vehicle.plateNumber,
          status: vehicle.status,
          lastActive: vehicle.lastActive,
          registeredBy: vehicleGroup.registeredBy,
          createdAt: vehicleGroup.createdAt,
          updatedAt: vehicleGroup.updatedAt,
          groupId: vehicleGroup._id,
          isGrouped: true
        };
      });
    } else {
      console.log('No vehicle group found for card:', req.params.cardNumber);
    }
    
    console.log(`Returning ${groupedVehicles.length} vehicles for card`);
    res.json(groupedVehicles);
  } catch (err) {
    console.error('Get card vehicles error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('Fetching vehicles for userId:', userId);
    
    // Find the vehicle group where userId matches
    const vehicleGroup = await Vehicle.findOne({ userId: userId });
    
    if (!vehicleGroup) {
      console.log('No vehicle group found for userId:', userId);
      return res.json([]);
    }
    
    console.log(`Found vehicle group for userId ${userId}: Card ${vehicleGroup.cardNumber} with ${vehicleGroup.vehicles.length} vehicles`);
    
    const userVehicles = vehicleGroup.vehicles.map(vehicle => ({
      _id: vehicle.vehicleId,
      cardNumber: vehicleGroup.cardNumber,
      userId: vehicleGroup.userId,
      userName: vehicleGroup.userName,
      vehicleName: vehicle.vehicleName,
      vehicleType: vehicle.vehicleType,
      category: vehicle.category,
      price: vehicle.price,
      laneMeter: vehicle.laneMeter,
      icon: vehicle.icon,
      plateNumber: vehicle.plateNumber,
      status: vehicle.status,
      registeredBy: vehicleGroup.registeredBy,
      createdAt: vehicleGroup.createdAt
    }));
    
    console.log(`Returning ${userVehicles.length} vehicles for userId ${userId}`);
    res.json(userVehicles);
  } catch (err) {
    console.error('Fetch user vehicles error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/categories', async (req, res) => {
  try {
    const categories = await VehicleCategory.find({ isActive: true }).sort({ name: 1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/validate-card/:cardNumber', async (req, res) => {
  try {
    const card = await Card.findOne({ cardNumber: req.params.cardNumber, status: 'active' });
    if (!card) {
      return res.status(404).json({ error: 'Card not found or inactive' });
    }
    
    const userAccount = await UserAccount.findOne({ userId: card.userId });
    
    const vehicleGroup = await Vehicle.findOne({ cardNumber: req.params.cardNumber });
    const totalVehicleCount = vehicleGroup ? vehicleGroup.totalVehicles : 0;
    
    res.json({
      cardNumber: card.cardNumber,
      userId: card.userId,
      name: card.name, 
      email: userAccount?.email || null,
      phone: userAccount?.phone || null,
      vehicleCount: totalVehicleCount,
      canRegisterMore: totalVehicleCount < 5
    });
  } catch (err) {
    console.error('Validate card error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/bulk', async (req, res) => {
  try {
    const { cardNumber, vehicles, registeredBy } = req.body;
    
    console.log('Bulk registration request:', { cardNumber, vehicles, registeredBy });

    if (!cardNumber || !vehicles || !Array.isArray(vehicles) || vehicles.length === 0) {
      return res.status(400).json({ error: 'Card number and vehicles array are required' });
    }

    for (const vehicle of vehicles) {
      if (!vehicle.vehicleName || !vehicle.vehicleName.trim()) {
        return res.status(400).json({ 
          error: 'All vehicles must have a vehicle name' 
        });
      }
      
      const isBicycle = ['Bicycle', 'Bicycle with Sidecar'].includes(vehicle.vehicleName);
      if (!isBicycle && (!vehicle.plateNumber || !vehicle.plateNumber.trim())) {
        return res.status(400).json({ 
          error: `Plate number is required for ${vehicle.vehicleName}` 
        });
      }
    }

    const card = await Card.findOne({ cardNumber, status: 'active' });
    if (!card) {
      return res.status(404).json({ error: 'Card not found or inactive' });
    }

    let vehicleGroup = await Vehicle.findOne({ cardNumber });
    const currentVehicleCount = vehicleGroup ? vehicleGroup.totalVehicles : 0;
    
    if (currentVehicleCount + vehicles.length > 5) {
      return res.status(400).json({ 
        error: `Cannot add ${vehicles.length} vehicles. Card already has ${currentVehicleCount} vehicles. Maximum 5 allowed.` 
      });
    }

    const vehiclesWithPlates = vehicles.filter(v => v.plateNumber && v.plateNumber.trim());
    
    if (vehiclesWithPlates.length > 0) {
      const allVehicleGroups = await Vehicle.find();
      const allExistingPlates = allVehicleGroups.flatMap(group => 
        group.vehicles.filter(v => v.plateNumber).map(v => v.plateNumber)
      );

      const newPlateNumbers = vehiclesWithPlates.map(v => v.plateNumber);
      const duplicatePlates = newPlateNumbers.filter(plate => allExistingPlates.includes(plate));
      if (duplicatePlates.length > 0) {
        return res.status(400).json({ 
          error: `Plate numbers already registered: ${duplicatePlates.join(', ')}` 
        });
      }

      const uniquePlates = [...new Set(newPlateNumbers)];
      if (uniquePlates.length !== newPlateNumbers.length) {
        return res.status(400).json({ error: 'Duplicate plate numbers in submission' });
      }
    }

    const vehicleData = [];
    for (const vehicle of vehicles) {
      const vehicleCategory = await VehicleCategory.findOne({ 
        name: vehicle.vehicleName, 
        isActive: true 
      });
      
      if (!vehicleCategory) {
        return res.status(404).json({ 
          error: `Vehicle category '${vehicle.vehicleName}' not found` 
        });
      }

      vehicleData.push({
        vehicleName: vehicleCategory.name,
        vehicleType: vehicleCategory.type,
        category: vehicleCategory.category,
        price: vehicleCategory.price,
        laneMeter: vehicleCategory.laneMeter,
        laneMeterRange: vehicleCategory.laneMeterRange,
        icon: vehicleCategory.icon,
        plateNumber: vehicle.plateNumber || null, // Allow null for bicycles
        status: 'active',
        registeredAt: new Date()
      });
    }

    if (vehicleGroup) {
      vehicleData.forEach(vehicle => {
        vehicleGroup.addVehicle(vehicle);
      });
      vehicleGroup.lastUpdatedBy = registeredBy;
      await vehicleGroup.save();
    } else {
      vehicleGroup = new Vehicle({
        cardNumber: card.cardNumber,
        userId: card.userId,
        userName: card.name,
        vehicles: [], 
        registeredBy
      });
      
      vehicleData.forEach(vehicle => {
        vehicleGroup.addVehicle(vehicle);
      });
      
      await vehicleGroup.save();
    }

    const addedVehicles = vehicleData.map(vehicle => {
      const groupVehicle = vehicleGroup.vehicles.find(v => v.plateNumber === vehicle.plateNumber);
      console.log('Finding vehicle with plate:', vehicle.plateNumber);
      console.log('Found group vehicle:', groupVehicle ? 'Yes' : 'No');
      if (groupVehicle) {
        console.log('Group vehicle ID:', groupVehicle.vehicleId);
      }
      
      return {
        _id: groupVehicle.vehicleId,
        cardNumber: vehicleGroup.cardNumber,
        userId: vehicleGroup.userId,
        vehicleName: groupVehicle.vehicleName,
        vehicleType: groupVehicle.vehicleType,
        category: groupVehicle.category,
        price: groupVehicle.price,
        laneMeter: groupVehicle.laneMeter,
        laneMeterRange: groupVehicle.laneMeterRange,
        icon: groupVehicle.icon,
        plateNumber: groupVehicle.plateNumber,
        status: groupVehicle.status,
        registeredBy: vehicleGroup.registeredBy,
        createdAt: vehicleGroup.createdAt,
        updatedAt: vehicleGroup.updatedAt,
        groupId: vehicleGroup._id,
        isGrouped: true
      };
    });

    res.status(201).json({
      message: `Successfully registered ${vehicles.length} vehicles as a group`,
      vehicles: addedVehicles,
      groupInfo: {
        groupId: vehicleGroup._id,
        totalVehiclesInGroup: vehicleGroup.totalVehicles,
        cardNumber: vehicleGroup.cardNumber
      }
    });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { cardNumber, vehicleName, plateNumber, registeredBy, notes } = req.body;

    const card = await Card.findOne({ cardNumber, status: 'active' });
    if (!card) {
      return res.status(404).json({ error: 'Card not found or inactive' });
    }

    const individualVehicleCount = await Vehicle.countDocuments({ cardNumber });
    let vehicleGroup = await Vehicle.findOne({ cardNumber });
    const groupedVehicleCount = vehicleGroup ? vehicleGroup.totalVehicles : 0;
    const currentTotalCount = individualVehicleCount + groupedVehicleCount;
    
    if (currentTotalCount >= 5) {
      return res.status(400).json({ error: 'Maximum 5 vehicles allowed per card' });
    }

    const existingIndividualVehicle = await Vehicle.findOne({ plateNumber });
    if (existingIndividualVehicle) {
      return res.status(400).json({ error: 'Plate number already registered' });
    }

    const allVehicleGroups = await Vehicle.find();
    const plateExistsInGroups = allVehicleGroups.some(group => 
      group.vehicles.some(vehicle => vehicle.plateNumber === plateNumber)
    );
    if (plateExistsInGroups) {
      return res.status(400).json({ error: 'Plate number already registered' });
    }

    const vehicleCategory = await VehicleCategory.findOne({ name: vehicleName, isActive: true });
    if (!vehicleCategory) {
      return res.status(404).json({ error: 'Vehicle category not found' });
    }

    const vehicleData = {
      vehicleName: vehicleCategory.name,
      vehicleType: vehicleCategory.type,
      category: vehicleCategory.category,
      price: vehicleCategory.price,
      laneMeter: vehicleCategory.laneMeter,
      laneMeterRange: vehicleCategory.laneMeterRange,
      icon: vehicleCategory.icon,
      plateNumber,
      status: 'active',
      registeredAt: new Date()
    };

    if (vehicleGroup) {
      vehicleGroup.addVehicle(vehicleData);
      vehicleGroup.lastUpdatedBy = registeredBy;
      await vehicleGroup.save();
    } else {
      vehicleGroup = new Vehicle({
        cardNumber: card.cardNumber,
        userId: card.userId,
        userName: card.name,
        vehicles: [vehicleData],
        registeredBy
      });
      await vehicleGroup.save();
    }

    const newVehicle = vehicleGroup.vehicles[vehicleGroup.vehicles.length - 1];
    res.status(201).json({
      _id: newVehicle.vehicleId,
      cardNumber: vehicleGroup.cardNumber,
      userId: vehicleGroup.userId,
      vehicleName: newVehicle.vehicleName,
      vehicleType: newVehicle.vehicleType,
      category: newVehicle.category,
      price: newVehicle.price,
      laneMeter: newVehicle.laneMeter,
      laneMeterRange: newVehicle.laneMeterRange,
      icon: newVehicle.icon,
      plateNumber: newVehicle.plateNumber,
      status: newVehicle.status,
      registeredBy: vehicleGroup.registeredBy,
      createdAt: vehicleGroup.createdAt,
      updatedAt: vehicleGroup.updatedAt,
      groupId: vehicleGroup._id,
      isGrouped: true
    });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { plateNumber } = req.body;
    
    let individualVehicle = await Vehicle.findById(req.params.id);
    
    if (individualVehicle) {
      if (plateNumber && plateNumber !== individualVehicle.plateNumber) {
        const existingIndividual = await Vehicle.findOne({ 
          plateNumber, 
          _id: { $ne: req.params.id } 
        });
        if (existingIndividual) {
          return res.status(400).json({ error: 'Plate number already registered' });
        }
        
        const allVehicleGroups = await Vehicle.find();
        const plateExistsInGroups = allVehicleGroups.some(group => 
          group.vehicles.some(vehicle => vehicle.plateNumber === plateNumber)
        );
        if (plateExistsInGroups) {
          return res.status(400).json({ error: 'Plate number already registered' });
        }
      }

      const updatedVehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true });
      return res.json({...updatedVehicle.toObject(), isGrouped: false});
    }
    
    const vehicleGroup = await VehicleGroup.findOne({
      'vehicles.vehicleId': req.params.id
    });
    
    if (!vehicleGroup) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    if (plateNumber) {
      const existingIndividual = await Vehicle.findOne({ plateNumber });
      if (existingIndividual) {
        return res.status(400).json({ error: 'Plate number already registered' });
      }
      
      const allVehicleGroups = await Vehicle.find();
      const plateExists = allVehicleGroups.some(group => 
        group.vehicles.some(vehicle => 
          vehicle.plateNumber === plateNumber && 
          vehicle.vehicleId.toString() !== req.params.id
        )
      );
      if (plateExists) {
        return res.status(400).json({ error: 'Plate number already registered' });
      }
    }

    vehicleGroup.updateVehicle(req.params.id, req.body);
    vehicleGroup.lastUpdatedBy = req.body.updatedBy || 'system';
    await vehicleGroup.save();

    const updatedVehicle = vehicleGroup.vehicles.find(v => v.vehicleId.toString() === req.params.id);
    res.json({
      _id: updatedVehicle.vehicleId,
      cardNumber: vehicleGroup.cardNumber,
      userId: vehicleGroup.userId,
      vehicleName: updatedVehicle.vehicleName,
      vehicleType: updatedVehicle.vehicleType,
      category: updatedVehicle.category,
      price: updatedVehicle.price,
      laneMeter: updatedVehicle.laneMeter,
      laneMeterRange: updatedVehicle.laneMeterRange,
      icon: updatedVehicle.icon,
      plateNumber: updatedVehicle.plateNumber,
      status: updatedVehicle.status,
      registeredBy: vehicleGroup.registeredBy,
      createdAt: vehicleGroup.createdAt,
      updatedAt: vehicleGroup.updatedAt,
      groupId: vehicleGroup._id,
      isGrouped: true
    });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    console.log('Delete request for vehicle ID:', req.params.id);
    
    const vehicleGroup = await Vehicle.findOne({
      'vehicles.vehicleId': req.params.id
    });
    
    console.log('Found vehicle group:', vehicleGroup ? 'Yes' : 'No');
    if (vehicleGroup) {
      console.log('Vehicle group ID:', vehicleGroup._id);
      console.log('Vehicles in group:', vehicleGroup.vehicles.length);
      console.log('Vehicle IDs in group:', vehicleGroup.vehicles.map(v => v.vehicleId.toString()));
    }
    
    if (!vehicleGroup) {
      console.log('Vehicle not found in any group');
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    console.log('Removing vehicle from group...');
    vehicleGroup.removeVehicle(req.params.id);
    
    console.log('Vehicles remaining after removal:', vehicleGroup.vehicles.length);
    
    if (vehicleGroup.vehicles.length === 0) {
      console.log('No vehicles remaining, deleting entire group');
      await Vehicle.findByIdAndDelete(vehicleGroup._id);
      res.json({ 
        message: 'Vehicle deleted successfully. Group removed as no vehicles remain.',
        wasGrouped: true,
        groupDeleted: true
      });
    } else {
      console.log('Saving updated group with remaining vehicles');
      await vehicleGroup.save();
      res.json({ 
        message: 'Vehicle deleted successfully',
        wasGrouped: true,
        groupDeleted: false,
        remainingVehiclesInGroup: vehicleGroup.vehicles.length
      });
    }

  } catch (err) {
    console.error('Delete vehicle error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
