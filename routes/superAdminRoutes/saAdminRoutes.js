import express from "express";
import SAAdmin from "../../models/superAdminModels/saAdmin.model.js";
import bcryptjs from 'bcryptjs';

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const admins = await SAAdmin.find();
    res.json(admins);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const existingAdmin = await SAAdmin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ error: "Email already exists." });
    }

    const lastAdmin = await SAAdmin.findOne().sort({ adminId: -1 });

    let newAdminId = 'A101'; 
    if (lastAdmin && lastAdmin.adminId) {
      const lastIdNum = parseInt(lastAdmin.adminId.slice(1));
      const nextIdNum = lastIdNum + 1;
      newAdminId = `A${nextIdNum}`;
    }

    const hashedPassword = bcryptjs.hashSync(password, 10);

    const newAdmin = new SAAdmin({
      name,
      email,
      password: hashedPassword,
      role: "admin",
      status: "active",
      adminId: newAdminId
    });

    await newAdmin.save();
    res.status(201).json(newAdmin);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const updateFields = req.body;

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ error: "No data to update." });
    }

    const updatedAdmin = await SAAdmin.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true }
    );

    if (!updatedAdmin) {
      return res.status(404).json({ error: "Admin not found." });
    }

    res.json(updatedAdmin);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deletedAdmin = await SAAdmin.findByIdAndDelete(req.params.id);
    
    if (!deletedAdmin) {
      return res.status(404).json({ error: "Admin not found." });
    }
    
    res.json({ message: "Admin deleted successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


export default router;
