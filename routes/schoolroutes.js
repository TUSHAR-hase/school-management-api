const db = require('../db');

const express = require('express');
const router = express.Router();

router.post('/addSchool', async (req, res) => {
  const { name, address, latitude, longitude } = req.body;

  if (!name || !address || typeof latitude !== 'number' || typeof longitude !== 'number') {
    return res.status(400).json({ error: 'Invalid input. Please provide name, address, latitude, and longitude.' });
  }

  const sql = 'INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)';

  try {
    const [result] = await db.query(sql, [name, address, latitude, longitude]);
    res.status(201).json({ message: 'School added successfully!', schoolId: result.insertId });
  } catch (err) {
    console.error('Error inserting school:', err);
    res.status(500).json({ error: 'Failed to add school.' });
  }
});


router.get('/listSchools', async (req, res) => {
  const userLat = parseFloat(req.query.latitude);
  const userLng = parseFloat(req.query.longitude);

  if (isNaN(userLat) || isNaN(userLng)) {
    return res.status(400).json({ error: 'Invalid latitude or longitude' });
  }

  const sql = 'SELECT * FROM schools';

  try {
    const [results] = await db.query(sql);

    const schoolsWithDistance = results.map(school => {
      const distance = haversine(userLat, userLng, school.latitude, school.longitude);
      return { ...school, distance };
    });

    schoolsWithDistance.sort((a, b) => a.distance - b.distance);

    res.json(schoolsWithDistance);
  } catch (err) {
    console.error('Error fetching schools:', err);
    res.status(500).json({ error: 'Failed to fetch schools' });
  }
});

router.get('/test', (req, res) => {
  res.json({ message: 'School routes working!' });
});

module.exports = router;
