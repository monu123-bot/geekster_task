// server.js

const express = require('express');

const app = express();
const cors = require('cors');

// Middleware to parse JSON bodies
app.use(express.json());

// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Enable CORS for all routes
app.use(cors());
const PORT = process.env.PORT || 3001;
const NearbyRouter = require('./Routes/NearbyOutlet');



// Route for finding outlet
app.use("/outlet", NearbyRouter);




app.listen(PORT, () => {
    console.log('Server is running on port :',PORT);
});
