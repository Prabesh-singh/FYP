const mongoose = require("mongoose");
const connectdb = async () =>{
    try{
        await mongoose.connect(process.env.mongoose_url);
        console.log("MongooseDB Connected Sucessfully!");
    }catch(err){
        console.log("DB connection error", err);
        process.exit(1);
    }
};
module.exports = connectdb;