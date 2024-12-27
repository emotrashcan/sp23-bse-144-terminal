const mongoose = require('mongoose');
const { Schema } = mongoose;

const VisitorSchema = new Schema({
    name: {
        type: String,
        required: [true, 'name is required']
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'email is required'],
        match: [/.+\@.+\..+/, 'Please fill a valid email address']
    },
    visitedAttractions: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Attraction' 
        }
    ]
});

const Visitor = mongoose.model('Visitor', VisitorSchema);
module.exports = Visitor;
