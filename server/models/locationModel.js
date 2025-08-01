import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
  
  latitude: Number,
  longitude: Number,
  address: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
});


export default mongoose.model('Location', locationSchema);
