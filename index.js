const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());  // Middleware for parsing JSON bodies

// Database connection
const username = 'jashankaur1701';
const password = encodeURIComponent('GpckJKlEQ39dtuGa');
const cluster = 'cluster0.8f4dquy.mongodb.net';
const dbName = 'mydatabase';
const dbUri = `mongodb+srv://${username}:${password}@${cluster}/${dbName}?retryWrites=true&w&m=rs.appName=Cluster0`;

mongoose.connect(dbUri)
    .then(() => console.log('MongoDB connected successfully!'))
    .catch(err => console.error('MongoDB connection error:', err));

// User schema
const userSchema = new mongoose.Schema({
    fullname: String,
    contact: String,
    email: { type: String, unique: true },
    password: String
});
const User = mongoose.model('User', userSchema);

// Property schema
const propertySchema = new mongoose.Schema({
    name: String,
    location: String,
    description: String,
    availability: String,
    images: [String],
    ratings: [{ userId: mongoose.Schema.Types.ObjectId, rating: Number }]  // New field for ratings
});
const Property = mongoose.model('Property', propertySchema);

// Register API
app.post('/api/register', async (req, res) => {
    const { fullname, contact, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({ fullname, contact, email, password: hashedPassword });
    try {
        await user.save();
        res.status(201).send('User registered successfully');
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).send("Email already exists");
        } else {
            res.status(500).send("Error registering new user");
        }
    }
});

// Login API
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: "Authentication failed" });
    }
    if (email.endsWith('@owner.com')) {
        res.json({ message: "Login successful", redirectUrl: 'owner.html', userRole: 'owner' });
    } else if (email.endsWith('@worker.com')) {
        res.json({ message: "Login successful", redirectUrl: 'employee.html', userRole: 'worker' });
    } else {
        res.status(401).json({ message: "Please use a valid company email to log in." });
    }
});

// Properties API for adding, editing, deleting, and listing with ratings
app.post('/api/properties', async (req, res) => {
    const { name, location, description, availability, images } = req.body;
    const property = new Property({ name, location, description, availability, images });
    try {
        await property.save();
        res.status(201).json(property);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/api/properties', async (req, res) => {
    try {
        const properties = await Property.find({});
        res.json(properties);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.put('/api/properties/:id', async (req, res) => {
    const { name, location, description, availability, images, newRating, userId } = req.body;
    const updates = { name, location, description, availability, images };
    if (newRating && userId) {
        updates.$push = { ratings: { userId, rating: newRating } };
    }
    try {
        const property = await Property.findByIdAndUpdate(req.params.id, updates, { new: true });
        res.json(property);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.delete('/api/properties/:id', async (req, res) => {
    try {
        await Property.findByIdAndDelete(req.params.id);
        res.status(200).send('Property deleted successfully');
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Start the server
const PORT = process.env.PORT || 3027;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
