const { connect } = require("mongoose");

let isConnected;

const connectDatabase = async () => {
  if (isConnected) return;

  try {
    await connect(process.env.DATABASE_URI).then((data) => {
      console.log(`Mongodb connected with server: ${data.connection.host}`);
    });

    isConnected = true;
  } catch (error) {
    console.log("database not connected");
  }
};

module.exports = connectDatabase;