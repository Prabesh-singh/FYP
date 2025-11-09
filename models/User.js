const mongoose = require("mongoose");
const userschema = mongoose.Schema({

        fullName: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        phone: { type: String, required: true },
        address: { type: String, required: true },
        dob: { type: Date, required: true },
        gender: { type: String, required: true }
    }, { timestamps: true });
    module.exports = mongoose.model("User", userschema);