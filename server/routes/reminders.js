require('dotenv').config();
const router = require("express").Router();
const { Reminder } = require("../models/reminder");
const { User } = require("../models/user");

const jwt_decode = require("jwt-decode");
const nodemailer = require("nodemailer");
const twilio = require("twilio");
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const axios = require("axios");
const schedule = require("node-schedule");



const client = new twilio(accountSid, authToken);

router.post("/", async (req, res, next) => {
  try {
    // Check if token exists in request headers
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Decode the token to get user ID
    const decodedToken = jwt_decode(token);
    const userId = decodedToken._id;

    // Create a new reminder using reminder model
    const reminder = new Reminder(req.body);

    // Save the reminder to the database
    await reminder.save();

    // Now, associate the reminder with the user
    const user = await User.findById(userId);

    // Push the reminder's ObjectId to the user's reminder array
    user.reminders.push(reminder._id);

    // Save the updated user document
    await user.save();

    const {
      title,
      dosage,
      caretakerEmail,
      caretakerMobileNumber,
      time,
      frequency,
    } = req.body;
    const message = `Give medicine with dosage as ${dosage}`;
    const sendTime = new Date(); // Get the current date and time
    sendTime.setHours(time.hour); // Set the hours to 18 (6 PM)
    sendTime.setMinutes(time.minute); // Set the minutes to 34
    sendTime.setSeconds(0); // Set the seconds to 0

    scheduleMessage(
      caretakerEmail,
      caretakerMobileNumber,
      message,
      time,
      frequency
    );

    res
      .status(201)
      .json({ message: "Reminder created successfully", reminder });
  } catch (error) {
    console.log("this is catch block");
    next(error); 
  }
});

router.get("/", async (req, res) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decodedToken = jwt_decode(token);
    const userId = decodedToken._id;

    const user = await User.findById(userId).populate("reminders");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const reminders = user.reminders;

    res.json(reminders);
  } catch (error) {
    console.error("Error fetching reminders:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.put("/:reminderId", async (req, res) => {
  const { reminderId } = req.params;
  const updatedReminderData = req.body;

  try {
    // Find the reminder by ID and update its data
    const updatedReminder = await Reminder.findByIdAndUpdate(
      reminderId,
      updatedReminderData,
      {
        new: true, // Return the updated reminder
      }
    );

    if (!updatedReminder) {
      return res.status(404).json({ message: "Reminder not found" });
    }
     const {
      title,
      dosage,
      caretakerEmail,
      caretakerMobileNumber,
      time,
      frequency,
    } = req.body;
    const message = `Give medicine with dosage as ${dosage}`;
    const sendTime = new Date(); // Get the current date and time
    sendTime.setHours(time.hour); // Set the hours to 18 (6 PM)
    sendTime.setMinutes(time.minute); // Set the minutes to 34
    sendTime.setSeconds(0); // Set the seconds to 0

    scheduleMessage(
      caretakerEmail,
      caretakerMobileNumber,
      message,
      time,
      frequency
    );
    res.status(200).json(updatedReminder);
  } catch (error) {
    console.error("Error updating reminder:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:reminderId", async (req, res) => {
  try {
    const reminderId = req.params.reminderId;

    // Find the reminder by ID and remove it
    const deletedReminder = await Reminder.findByIdAndRemove(reminderId);

    if (!deletedReminder) {
      return res.status(404).json({ message: "Reminder not found" });
    }

    // Respond with a success message
    res.status(200).json({ message: "Reminder deleted successfully" });
  } catch (error) {
    // Handle errors, e.g., database errors or server errors
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

function scheduleMessage(email, phoneNumber, message, time, frequency) {
  const sendTime = new Date();
  sendTime.setHours(time.hour);
  sendTime.setMinutes(time.minute);
  sendTime.setSeconds(time.second);
  const job = schedule.scheduleJob(sendTime, async () => {
    try {
      await sendEmail(email, message);
      await sendSMS(phoneNumber, message);
      await sendWhatsAppMessage(phoneNumber, message);
      // console.log(sendTime)
      const nextSendTime = new Date(
        sendTime.getTime() + frequency * 60 * 60 * 1000
      );
      scheduleMessage(email, phoneNumber, message, nextSendTime, frequency);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  });
}

async function sendEmail(email, message) {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.USER_EMAIL,
      pass: process.env.USER_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.USER_EMAIL,
    to: email,
    subject: "Give medicine",
    text: message,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

async function sendSMS(phoneNumber, message) {
  try {
    await client.messages.create({
      to: phoneNumber,
      from: "+13524371143",
      body: message,
    });
    console.log("SMS sent successfully");
  } catch (error) {
    console.error("Error sending SMS:", error);
  }
}

async function sendWhatsAppMessage(phoneNumber, message) {
  return new Promise((resolve, reject) => {
    client.messages
      .create({
        from: "whatsapp:+14155238886",
        body: message,
        to: "whatsapp:" + phoneNumber,
      })
      .then((message) => {
        console.log("WhatsApp message sent successfully");
        resolve("WhatsApp message sent successfully");
      })
      .catch((error) => {
        console.error("Error sending WhatsApp message:", error);
        reject(error);
      });
  });
}

module.exports = router;
