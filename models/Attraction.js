const mongoose = require('mongoose');

const AttractionSchema = new mongoose.Schema({
    name: {
        type:String,
        required: [true, 'name is required']
    },
    location: {
        type:String,
        required: [true]
    },
    entryFee: {
        type:Number,
        required: [true],
        min: [1, 'Entry fee cannot be negative'],
    },
    Rating: {
        type:Number,
        required: [true, 'password is required'], default: 0, between: [0, 5]
    }
});



const Attraction = mongoose.model('User', AttractionSchema);
module.exports = Attraction;