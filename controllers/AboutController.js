import AboutModel from "../models/about.js";

// Get About Content
const getAboutContent = async (req, res) => {
  try {
    let about = await AboutModel.findOne();
    if (!about) {
      // create default with multiple fields
      about = await AboutModel.create({
        aboutIntro: "Welcome to our website!",
        aboutTextSection: "We ensure each passenger...",
        aboutTextSectionR: "We ensure each passenger...",
        aboutVideoUrl: "https://www.youtube.com/embed/qA3MA-J-Jrg",
        aboutVideoTitle: "Port of Lucena",
        aboutVideoSideTextTitle: "We blah blah blah blah blah blah",
        aboutVideoSideText: [],
        aboutImages: [],
        aboutTeam: []
      });
    }
    res.status(200).json(about);  // send the whole document
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
    console.log(error);
  }
};

// Update About Content
const updateAboutContent = async (req, res) => {
  try {
    const updateData = req.body;  // will contain multiple fields
    let about = await AboutModel.findOne();
    if (!about) {
      about = await AboutModel.create(updateData);
    } else {
      // dynamically update each field sent in req.body
      Object.assign(about, updateData);
      await about.save();
    }
    res.status(200).json({ message: "About content updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
    console.log(error);
  }
};

export { getAboutContent, updateAboutContent };