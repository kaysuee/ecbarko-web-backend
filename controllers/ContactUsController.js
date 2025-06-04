import ContactModel from "../models/contact.js";

// Get Contact Us Content
const getContactContent = async (req, res) => {
  try {
    let contact = await ContactModel.findOne();
    if (!contact) {
      // create default with multiple fields
      contact = await ContactModel.create({
        contactTestimonial: [],
      });
    }
    res.status(200).json(contact);  // send the whole document
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
    console.log(error);
  }
};

// Update contact Content
const updateContactContent = async (req, res) => {
  try {
    const updateData = req.body;  // will contain multiple fields
    let contact = await ContactModel.findOne();
    if (!contact) {
      contact = await ContactModel.create(updateData);
    } else {
      // dynamically update each field sent in req.body
      Object.assign(contact, updateData);
      await contact.save();
    }
    res.status(200).json({ message: "Contact content updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
    console.log(error);
  }
};

export { getContactContent, updateContactContent };