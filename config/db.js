const mongoose = require("mongoose");

const connectdb = async () => {
    try {
        await mongoose.connect(process.env.mongoose_url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("MongoDB Connected Successfully!");
    } catch (err) {
        console.error("DB Connection Error:", err.message);
        process.exit(1);
    }
};

module.exports = connectdb;
