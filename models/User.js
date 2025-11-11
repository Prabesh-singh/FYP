const mongoose = require("mongoose");
const userschema = mongoose.Schema({

        fullName: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        phone: { type: String},
        address: { type: String},
        dob: { type: Date },
        gender: { type: String},
    resetPasswordToken: String,
    resetPasswordExpire: Date
    }, { timestamps: true });
    module.exports = mongoose.model("User", userschema);