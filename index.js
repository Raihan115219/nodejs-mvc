import express from "express";
import mongoose from "mongoose";
import userRoutes from "./routes/userRoutes.js";
import 'dotenv/config'

const app = express();
const PORT = process.env.PORT || 3001;
const mongodb = process.env.MONGO_URI;

mongoose.connect(mongodb)
    .then(() => console.log('Connected to MongoDB'))


app.use(express.json());
app.use('/user', userRoutes);

app.listen(PORT, console.log('Server is running on port: ' + PORT));
