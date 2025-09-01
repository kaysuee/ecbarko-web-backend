import mongoose from "mongoose";

const Cardschema= new mongoose.Schema({
    cardNumber:{
        type:String,
        required:true,
        unique:true
    },
    balance:{
        type:String,
        required:true
    },
    type:{
        type:String,
        required:true
    },
    status:{
        type:String,
        enum:["active","inactive"],
        default:"active"
    },
    userId:{
        type:String,
    },
    name:{
        type:String,
        required:true
    },
},{timestamps:true,collection: 'card'})


const CardModel= mongoose.model('card',Cardschema)


export default CardModel