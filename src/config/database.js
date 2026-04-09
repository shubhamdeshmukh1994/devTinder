const mongoose = require('mongoose');

  

const connectDb = async () => {
  await mongoose.connect(process.env.DB_CONNECTION_SECRET);
}

// connectDb().then(
//     console.log('Database connected successfully')
// ).catch(err => console.log(err));


module.exports = connectDb;