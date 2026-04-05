const mongoose = require('mongoose');

  

const connectDb = async () => {
  const uri = "mongodb+srv://shubham:lrTKRQUH3CaCg47C@cluster0.vbbkn0j.mongodb.net/devTinder";
  await mongoose.connect(uri);
}

// connectDb().then(
//     console.log('Database connected successfully')
// ).catch(err => console.log(err));


module.exports = connectDb;