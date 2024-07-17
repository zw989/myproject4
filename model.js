const mongoose = require("mongoose");

const emailSchema = new mongoose.Schema({
  subject: String,
  sender: {
    name: String,
    icon: String,
    email: String,
  },
  recipient: String,
  content: String,
  date: Date,
  folder: String,
  labels: [String],
  isStarred: Boolean,
  isRead: Boolean,
});

const Email = mongoose.model("Email", emailSchema);

module.exports = Email;

/* {
name:"Rebecca Gilder",
email:"rebecca@gmai.com",
icon:"https://greakproject.vercel.app/images/avatars/6.png"
} */
