import AboutEBCModel from "../models/aboutEBC.js";

// Get About EBC Content
const getAboutEBCContent = async (req, res) => {
  try {
    let aboutEBC = await AboutEBCModel.findOne();
    if (!aboutEBC) {
      // create default with multiple fields
      aboutEBC = await AboutEBCModel.create({
        aboutEBCTextSection: "We ensure each passenger...",
        aboutEBCAddress: "Welcome to our website!",
      });
    }
    res.status(200).json(aboutEBC);  // send the whole document
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
    console.log(error);
  }
};

// Update About EBC Content
const updateAboutEBCContent = async (req, res) => {
  try {
    const updateData = req.body;  // will contain multiple fields
    let aboutEBC = await AboutEBCModel.findOne();
    if (!aboutEBC) {
      aboutEBC = await AboutEBCModel.create(updateData);
    } else {
      // dynamically update each field sent in req.body
      Object.assign(aboutEBC, updateData);
      await aboutEBC.save();
    }
    res.status(200).json({ message: "About EcBarko Card content updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
    console.log(error);
  }
};

export { getAboutEBCContent, updateAboutEBCContent };