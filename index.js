const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Attraction = require('./models/Attraction');
const Visitor = require('./models/visitor');
const Review = require('./models/Review');
const app = express();
const session = require('express-session');
const bcrypt = require('bcrypt');
const ejs = require('ejs');


app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//mongodb connection
mongoose.connect('mongodb://localhost:27017/TouristManagement', {
    useNewUrlParser: true, useUnifiedTopology: true
}).then(() => { console.log('Connected to MongoDB');
}).catch((error) => {console.error('Error connecting to MongoDB:', error);});

//attraction route
app.get('/attraction', (req, res) => {
    res.render('attraction');
});


//visitor route
app.get('/visitor', (req, res) => {
    res.render('visitor');
})


//add a new visitor
app.post('/visitor', async (req, res) => {
    try {
        const { name, email } = req.body;
        const newVisitor = new Visitor({ name, email});
        await newVisitor.save();
        // res.status(201).json(newVisitor);
        res.redirect('/attraction');
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


app.get('/review', (req, res) => {  
    res.render('review');
});


// Insert a sample document
const insertSampleData = async () => {
    try {
        const newVisitor = new Visitor({ 
            name: 'John Doe', 
            email: 'john.doe@example.com', 
        });
        await newVisitor.save();
        console.log('Sample visitor added!');
    } catch (error) {
        console.error('Error inserting sample data:', error.message);
    }
};

// Call the function
insertSampleData();


// Add a new review
app.post('/reviews', async (req, res) => {
    try {
        const { visitorId, attractionId, rating, comment } = req.body;

        // Check if the visitor has visited the attraction
        const visitor = await Visitor.findById(visitorId);
        if (!visitor) {
            return res.status(404).json({ message: 'Visitor not found' });
        }

        const attraction = await Attraction.findById(attractionId);
        if (!attraction) {
            return res.status(404).json({ message: 'Attraction not found' });
        }

        // Check if the visitor has already posted a review for the same attraction
        const existingReview = await Review.findOne({ visitorId, attractionId });
        if (existingReview) {
            return res.status(400).json({ message: 'You have already reviewed this attraction' });
        }

        // Create and save the new review
        const newReview = new Review({ visitorId, attractionId, rating, comment });
        await newReview.save();
         res.status(201).json(newReview);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

const insertSampleData2 = async () => {
    try {
        const sampleAttractions = [
            { name: 'Eiffel Tower', location: 'Paris, France', entryFee: 25, Rating: 4.8 },
            { name: 'Great Wall of China', location: 'Beijing, China', entryFee: 20, Rating: 4.7 },
            { name: 'Statue of Liberty', location: 'New York, USA', entryFee: 30, Rating: 4.6 },
            { name: 'Colosseum', location: 'Rome, Italy', entryFee: 18, Rating: 4.5 },
            { name: 'Machu Picchu', location: 'Peru', entryFee: 35, Rating: 4.9 }
        ];

        // Use the Attraction model to insert data
        await Attraction.insertMany(sampleAttractions);
        console.log('Sample attractions added successfully');
    } catch (error) {
        console.error('Error inserting sample data:', error);
    }
};

// Call the function to insert sample data
insertSampleData2();



// Create a new attraction
app.post('/attractions', async (req, res) => {
    try {
        const { name, location, entryFee, Rating } = req.body;
        const newAttraction = new Attraction({ name, location, entryFee, Rating });
        await newAttraction.save();
        
        res.redirect('/review');
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


// Update an attraction by ID (its rating)
app.put('/attractions/:id/rating', async (req, res) => {
    try {
        const { Rating } = req.body;
        const updatedAttraction = await Attraction.findByIdAndUpdate( req.params.id, { Rating }, { new: true });
        if (!updatedAttraction) {
            return res.status(404).json({ message: 'Attraction not found' });
        }
        res.status(200).json(updatedAttraction);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});



// Get top 5 highest rated attractions
app.get('/attractions/top-rated', async (req, res) => {
    try {
        const topAttractions = await Attraction.find().sort({ Rating: -1 }).limit(5);
        res.render('top-rated', { attractions: topAttractions });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});




//visitors_with_reviews
app.get('/visitors-with-reviews', async (req, res) => {
    try {
        const visitors = await Visitor.aggregate([
            {
                $lookup: {
                    from: 'reviews',
                    localField: '_id',
                    foreignField: 'visitorId',
                    as: 'reviews'
                }
            },
            {
                $addFields: {
                    reviewCount: { $size: '$reviews' }
                }
            },
            {
                $project: {
                    name: 1,
                    email: 1,
                    reviewCount: 1
                }
            }
        ]);
        res.status(200).json(visitors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Insert sample data for visitors and reviews
const insertSampleData3 = async () => {
    try {
        const sampleReviews = [
            { visitorId: 'visitor_id_1', attractionId: 'eiffel_tower_id', rating: 5, comment: 'Amazing experience!' },
            { visitorId: 'visitor_id_2', attractionId: 'great_wall_of_china_id', rating: 4, comment: 'Wonderful view, but crowded.' },
            { visitorId: 'visitor_id_3', attractionId: 'statue_of_liberty_id', rating: 4.5, comment: 'A must-see landmark.' },
            { visitorId: 'visitor_id_4', attractionId: 'colosseum_id', rating: 4.8, comment: 'Historic and majestic.' },
            { visitorId: 'visitor_id_5', attractionId: 'machu_picchu_id', rating: 5, comment: 'Breathtaking views!' }
        ];

        // Assuming Visitor and Attraction data are already created, we'll use sample data
        const visitors = await Visitor.find();
        const attractions = await Attraction.find();

        if (visitors.length > 0 && attractions.length > 0) {
            for (let i = 0; i < sampleReviews.length; i++) {
                const review = new Review({
                    visitorId: visitors[i % visitors.length]._id, // cycle through sample visitors
                    attractionId: attractions[i % attractions.length]._id, // cycle through sample attractions
                    rating: sampleReviews[i].rating,
                    comment: sampleReviews[i].comment
                });

                await review.save();
            }
            console.log('Sample reviews added successfully');
        } else {
            console.log('Please ensure that visitors and attractions are added first.');
        }
    } catch (error) {
        console.error('Error inserting sample reviews:', error.message);
    }
};

// Call the function to insert sample reviews
insertSampleData3();



app.listen(3000, () => {
    console.log('Server started on port 3000');
});