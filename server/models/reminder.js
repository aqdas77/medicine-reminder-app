const mongoose = require("mongoose");

const reminderSchema = new mongoose.Schema({
  title: { type: String, required: true },
  dosage: { type: String, required: true },
  caretakerEmail: { type: String }, 
  caretakerMobileNumber: { type: String }, 
  frequency: { type: String, required: true },
  time: {
    hour: Number,
    minute: Number,
    second: Number
  },
});

const Reminder = mongoose.model("Reminder", reminderSchema);

module.exports = { Reminder };
