import express from 'express';
import Location from '../models/locationModel.js';

const router = express.Router();

// Accept POST to both `/` and `/save`
router.post('/', async (req, res) => {
  try {
    const { latitude, longitude, address, timestamp } = req.body;
    const location = new Location({ latitude, longitude, address, timestamp });
    await location.save();
    res.status(201).json({ success: true, message: 'Location saved' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


// GET history by name (2 weeks)
router.get('/history', async (req, res) => {
  try {
    // const { name } = req.params;
    const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const locations = await Location.find({
      
      timestamp: { $gte: twoWeeksAgo },
    }).sort({ timestamp: -1 });

    res.json(locations);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
