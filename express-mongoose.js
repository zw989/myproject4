const Email = require("./model");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const mongoURI =
  "mongodb+srv://wang7z:wang7z@sneat.vjlajdg.mongodb.net/sneat?retryWrites=true&w=majority";

mongoose
  .connect(mongoURI)
  .then(() => {
    console.log("MongoDB connected...");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// Route to fetch all emails
app.get("/apps/email", async (req, res) => {
  try {
    const emails = await Email.find();
    res.json(emails);
  } catch (error) {
    res.status(500).json({message: error.message});
  }
});

// Route to fetch emails by folder or special case (starred)
app.get("/apps/email/:folder/:label?", async (req, res) => {
  try {
    const {folder, label} = req.params;
    let emails;
    if (folder === "starred") {
      emails = await Email.find({isStarred: true});
    } else if (label) {
      emails = await Email.find({labels: label});
    } else {
      emails = await Email.find({folder});
    }
    res.json(emails);
  } catch (error) {
    res.status(500).json({message: error.message});
  }
});

// Create or update email
app.post("/apps/email", async (req, res) => {
  const emailData = req.body;
  const isSending = req.query.isSending === "true";
  try {
    if (emailData.id) {
      const existingEmail = await Email.findById(emailData.id);
      if (existingEmail) {
        existingEmail.set(emailData);
        existingEmail.folder = isSending ? "sent" : "draft";
        await existingEmail.save();
        return res.status(200).json(existingEmail);
      }
    }

    // Create new email
    const newEmail = new Email(emailData);
    newEmail.folder = isSending ? "sent" : "draft";
    await newEmail.save();
    res.status(201).json(newEmail);
  } catch (error) {
    res.status(400).json({error: error.message});
  }
});

// const toggleField = async (req, res, field) => {
//   try {
//     if (field == "isStarred" || field == "isRead") {
//       const result = await Email.updateOne({_id: req.params.id}, [
//         {$set: {[field]: {$not: `$${field}`}}},
//       ]);
//     } else if (field == "trash" || field == "spam") {
//       const result = await Email.updateOne({_id: req.params.id}, [
//         {$set: {folder: `${field}`}},
//       ]);
//     }

//     if (result.modifiedCount === 0) {
//       return res.status(404).json({message: "Email not found"});
//     }

//     const updatedEmail = await Email.findById(req.params.id);
//     res.json(updatedEmail);
//   } catch (error) {
//     res.status(500).json({message: error.message});
//   }
// };

const toggleField = async (req, res, field) => {
  try {
    let result;
    if (field === "isStarred" || field === "isRead") {
      result = await Email.updateOne({_id: req.params.id}, [
        {$set: {[field]: {$not: `$${field}`}}},
      ]);
    } else if (field === "trash" || field === "spam") {
      result = await Email.updateOne({_id: req.params.id}, [
        {$set: {folder: `${field}`}},
      ]);
    }

    // else if (field === "label") {
    //   const {label} = req.body;
    //   const email = await Email.findById(req.params.id);
    //   if (!email) {
    //     return res.status(404).json({message: "Email not found"});
    //   }

    //   if (email.labels.includes(label)) {
    //     result = await Email.updateOne(
    //       {_id: req.params.id},
    //       {$pull: {labels: label}}
    //     );
    //   } else {
    //     result = await Email.updateOne(
    //       {_id: req.params.id},
    //       {$addToSet: {labels: label}}
    //     );
    //   }
    // }

    if (result.modifiedCount === 0) {
      return res.status(404).json({message: "Email not found"});
    }

    const updatedEmail = await Email.findById(req.params.id);
    res.json(updatedEmail);
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};

app.put("/apps/email/:id/toggle/:field", (req, res) => {
  const validFields = ["isStarred", "isRead", "trash", "spam"];
  const {field} = req.params;

  if (!validFields.includes(field)) {
    return res.status(400).json({message: "Invalid field"});
  }
  toggleField(req, res, field);
});

app.listen(9000, () => {
  console.log("Server is running on http://localhost:9000");
});

mongoose.connection.once("error", () => {
  console.error("MongoDB connection error");
});

mongoose.connection.once("close", () => {
  console.log("MongoDB connection closed");
});
