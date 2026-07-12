const express = require("express");
const app = express();
const cors = require("cors");

require("dotenv").config();
require("./config/db");

// CORS origin(s) come from env so this works in both local dev and
// production without ever touching code again. Supports a comma-separated
// list, e.g. CLIENT_URLS="http://localhost:5173,https://lostfoundng.com"
const allowedOrigins = (process.env.CLIENT_URLS || "http://localhost:5173")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

app.use(express.json());
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (curl, mobile apps, server-to-server)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`CORS: origin ${origin} is not allowed.`));
        }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "authorization"],
}));

const userRoutes = require("./routes/user.route");
const reportRoutes = require("./routes/report.route");
const matchRoutes = require("./routes/match.route");
const messageRoutes = require("./routes/message.route");
const notificationRoutes = require("./routes/notification.route");
const supportRoutes = require("./routes/support.route");
const adminRoutes = require("./routes/admin.routes");

app.use("/api/users", userRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/support", supportRoutes);

app.listen(process.env.PORT, () => {
    console.log("Server is now running on PORT", process.env.PORT)
});