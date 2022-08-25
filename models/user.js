import mongoose from "mongoose";

const Schema = mongoose.Schema;

const userSchema = new Schema({
    firstName: {
        type: String,
        require: true
    },
    lastName: {
        type: String,
        require: true
    },
    emailAddress: {
        type: String,
        require: true,
        unique: true
    }
});

const User = mongoose.model("user", userSchema);

export default User;