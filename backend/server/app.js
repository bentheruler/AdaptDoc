const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const aiRoutes = require('./routes/aiRoutes');
const templateRoutes = require('./routes/templateRoutes');
const documentRoutes = require('./routes/documentRoutes');

const app = express();


app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// routes for frontend to 'tap' into
app.use('/api/ai', aiRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/documents', documentRoutes);

// Root test endpoint
app.get('/', (req, res) => {
  res.json({ message: "AdoptDoc Backend API is running!" });
});

module.exports = app;
