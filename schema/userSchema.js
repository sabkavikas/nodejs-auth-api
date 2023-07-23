import { model, Schema } from "mongoose";

const user = new Schema({
    name:String,
    email:String,
    password:String,
})

const User = model('User',user); 

export default User;