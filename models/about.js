import mongoose from "mongoose";

const AboutSchema = new mongoose.Schema({
  aboutContent: { type: String, default: "Welcome to our website!" },
  aboutIntro: { type: String, default: "Welcome to our website!" },
  aboutTextSection: { type: String, default: "We ensure each passenger..." },
  aboutTextSectionR: { type: String, default: "We ensure each passenger..." },
  aboutVideoUrl: { type: String, default: "https://www.youtube.com/embed/qA3MA-J-Jrg" },
  aboutVideoTitle: {type: String, default: "Port of Lucena"},
  aboutVideoSideTextTitle: {type: String, default: "We blah blah blah blah blah blah"},
  aboutVideoSideText: {type: String, default: ''},

  aboutTeam: {
    type: [
      {
        image: { type: String, default: '' },
        name: { type: String, default: 'Member' },
        role: { type: String, default: 'Role' }
      }
    ],
    default: [
      { image: '', name: 'Member 1', role: 'Role' },
      { image: '', name: 'Member 2', role: 'Role' },
      { image: '', name: 'Member 3', role: 'Role' },
      { image: '', name: 'Member 4', role: 'Role' }
    ]
  }
});

export default mongoose.model("About", AboutSchema);
