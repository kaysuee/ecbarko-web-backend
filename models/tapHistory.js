import mongoose from "mongoose";

const tapHistoryschema= new mongoose.Schema({
    userId:{
        type:String,
    },
    name:{
        type:String,
        required:true,
    },
    cardNumber:{
        type:String,
        required:true,
    },
    type:{
        type:String,
        required:true
    },
    dateTransaction: { type: Date, required: true },
    payment: { type: String, required: true }, 
    status: { type: String},
    departureLocation: { type: String, required: true },
    arrivalLocation: { type: String, required: true },
},{timestamps:true,collection: 'tapHistory'})


const taphistory= mongoose.model('tapHistory',tapHistoryschema)


export default taphistory