const { SESClient } = require("@aws-sdk/client-ses");

const RIGION = "ap-south-1";

const sesClient = new SESClient({
  region: RIGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
  
});

module.exports = { sesClient };
