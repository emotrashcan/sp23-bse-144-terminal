const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    attraction: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Attraction',
        required: [true, 'attraction is required']
    },
    visitor: {
        type: [{ name: String, email: String }],
        required: [true, 'review is required'],
        ref: 'Visitor'
    },
    score: {
        type: Number,
        required: [true, 'rating is required']
    },
    comment: {
         type: String,
         required: [false, "optional"]
    }
});

const Review = mongoose.model('Review', ReviewSchema);