import mongoose from "mongoose";

const CardHistoryschema= new mongoose.Schema({
    userId:{
        type:String,
        required:true,
    },
    dateTransaction: { type: Date, required: true },
    payment: { type: Number, required: true }, 
    status: { type: String},
    type: { type: String, required: true }, 
},{timestamps:true,collection: 'cardHistory'})


const CardModel= mongoose.model('cardHistory',CardHistoryschema)


export default CardModel