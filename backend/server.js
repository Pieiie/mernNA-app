const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
// ใช้ MONGODB_URI จาก environment variable ใน docker-compose.yml: mongodb://mongo:27017/merndb
mongoose.connect(process.env.MONGODB_URI || 'mongodb://mongo:27017/merndb')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Simple Schema
const ItemSchema = new mongoose.Schema({
  name: String,
  description: String,
  createdAt: { type: Date, default: Date.now }
});

const Item = mongoose.model('Item', ItemSchema);

// ------------------------------------------------------------------
// ROUTES (เพิ่ม Update Operation)
// ------------------------------------------------------------------

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Backend is running!',
    timestamp: new Date()
  });
});

// GET All Items (Read All)
app.get('/api/items', async (req, res) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST New Item (Create)
app.post('/api/items', async (req, res) => {
  try {
    const newItem = new Item(req.body);
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT/PATCH Update Item (Update)
// ใช้ PUT เพื่ออัพเดท Item ที่ระบุด้วย ID
app.patch('/api/items/:id', async (req, res) => {
    try {
        const updatedItem = await Item.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true, runValidators: true } // {new: true} ให้คืนค่าเอกสารที่อัพเดทแล้ว
        );

        if (!updatedItem) {
            return res.status(404).json({ message: 'Item not found' });
        }

        res.json(updatedItem);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});


// DELETE Item (Delete)
app.delete('/api/items/:id', async (req, res) => {
  try {
    const deletedItem = await Item.findByIdAndDelete(req.params.id);

    if (!deletedItem) {
        return res.status(404).json({ message: 'Item not found' });
    }
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Server Start
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});