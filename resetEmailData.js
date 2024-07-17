const mongoose = require("mongoose");
const Email = require("./model");
const data = require("./resetEmailData.json");

const deleteAndInsertData = async () => {
  try {
    const connection =
      "mongodb+srv://wang7z:wang7z@sneat.vjlajdg.mongodb.net/sneat?retryWrites=true&w=majority";
    await mongoose.connect(connection, {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
      // useFindAndModify: false,
    });

    await Email.deleteMany({});

    const newEmails = await Email.insertMany(data.emails);
    await mongoose.disconnect();
    console.log("Data reset successful:", data.emails);
  } catch (error) {
    console.error("Error resetting data:", error);
  }
};

deleteAndInsertData();
