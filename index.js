// Import packages
const express = require("express");
const home = require("./routes/home");

// Middlewares
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }))

// Routes
app.use("/api", home);

// connection
const port = process.env.PORT || 8888;
app.listen(port, () => console.log(`Listening to port ${port}`));
