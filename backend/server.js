require('dotenv').config();
const mongoose = require('mongoose');
const cors = require('cors');
const express=require('express');

const app = express();

app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://localhost:3001",
    process.env.FRONTEND_URL,
  ].filter(Boolean),
  credentials: true,
}));

// Allow Google OAuth popups to communicate with opener window
// (without this, COOP policy blocks window.closed calls from the popup)
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'unsafe-none');
  res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
  next();
});

app.use(express.json());


mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000,
})
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch(err => console.log("Mongo Connection Error:", err));


app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));

app.use('/api/ai', require('./server/routes/aiRoutes'));

app.get('/', (req, res) => {
  res.send("API Running...");
});

app.use("/api/documents", require("./routes/documents.js"));

app.use('/api/ai', require('./routes/ai'));

app.use('/api/admin', require('./server/routes/adminRoutes'));

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;



app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
