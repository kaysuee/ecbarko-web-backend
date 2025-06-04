import HomeModel from "../models/home.js";

// Get Home Content
const getHomeContent = async (req, res) => {
  try {
    let home = await HomeModel.findOne();
    if (!home) {
      // create default with multiple fields
      home = await HomeModel.create({
        homeTestimonial: [],
      });
    }
    res.status(200).json(home);  // send the whole document
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
    console.log(error);
  }
};

// Update Home Content
const updateHomeContent = async (req, res) => {
  try {
    const updateData = req.body;  // will contain multiple fields
    let home = await HomeModel.findOne();
    if (!home) {
      home = await HomeModel.create(updateData);
    } else {
      // dynamically update each field sent in req.body
      Object.assign(home, updateData);
      await home.save();
    }
    res.status(200).json({ message: "Home content updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
    console.log(error);
  }
};

export { getHomeContent, updateHomeContent };