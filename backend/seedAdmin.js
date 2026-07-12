require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/user.model");

async function createAdmin() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected");

        // Check if admin already exists
        const existingAdmin = await User.findOne({
            email: "admin@lostfound.ng",
        });

        if (existingAdmin) {
            console.log("Admin already exists.");
            process.exit();
        }

        const hashedPassword = await bcrypt.hash("admin123", 10);

        await User.create({
            name: "Administrator",
            email: "badmusayomide104@gmail.com",
            password: hashedPassword,
            role: "admin",
            verified: true,
        });

        console.log("✅ Admin created successfully.");
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

createAdmin();