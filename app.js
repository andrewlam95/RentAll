// DB test
require("./utils.js");
require('dotenv').config();

const express = require('express');

// DB test
const session = require('express-session');
const MongoStore = require('connect-mongo');

const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

/* secret information section */
const mongodb_host = process.env.MONGODB_HOST;
const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
const mongodb_database = process.env.MONGODB_DATABASE;
const mongodb_session_secret = process.env.MONGODB_SESSION_SECRET;

const node_session_secret = process.env.NODE_SESSION_SECRET;
/* END secret section */

// DB TEST
var {database} = include('databaseConnection');
const userCollection = database.db(mongodb_database).collection('users');

// Set EJS as templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// DB test
app.use(express.urlencoded({extended: true}));

// DB test
var mongoStore = MongoStore.create({
	mongoUrl: `mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}/sessions`,
	crypto: {
		secret: mongodb_session_secret
	}
})

// DB test
app.use(session({ 
    secret: node_session_secret,
	store: mongoStore, //default is memory store 
	saveUninitialized: false, 
	resave: true
}
));

// Sample data (replace with database later)
const sampleItems = [
    {
        id: 1,
        title: 'Professional Camera Kit',
        price: 25,
        category: 'Electronics',
        description: 'Perfect for photography enthusiasts',
        image: 'https://via.placeholder.com/300x200',
        location: 'Richmond, BC'
    },
    {
        id: 2,
        title: 'Mountain Bike',
        price: 15,
        category: 'Sports',
        description: 'Great for weekend adventures',
        image: 'https://via.placeholder.com/300x200',
        location: 'Richmond, BC'
    },
    {
        id: 3,
        title: 'Power Drill Set',
        price: 10,
        category: 'Tools',
        description: 'Complete with all accessories',
        image: 'https://via.placeholder.com/300x200',
        location: 'Richmond, BC'
    },
    {
        id: 4,
        title: 'Mountain Bike Premium',
        price: 20,
        category: 'Sports',
        description: 'High-quality mountain bike for serious riders',
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=400&q=80',
        location: 'Richmond, BC'
    },
    {
        id: 5,
        title: 'Camping Tent 4-Person',
        price: 35,
        category: 'Sports',
        description: 'Spacious tent perfect for family camping trips',
        image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=400&q=80',
        location: 'Richmond, BC'
    },
    {
        id: 6,
        title: 'Yoga Equipment Set',
        price: 12,
        category: 'Health',
        description: 'Complete yoga kit with mat, blocks, and straps',
        image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=400&q=80',
        location: 'Richmond, BC'
    },
    {
        id: 7,
        title: 'Professional Camera Kit',
        price: 45,
        category: 'Electronics',
        description: 'Professional photography equipment with multiple lenses',
        image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
        location: 'Richmond, BC'
    },
    {
        id: 8,
        title: '4K Smart Projector',
        price: 60,
        category: 'Electronics',
        description: 'High-definition projector for home theater experience',
        image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80',
        location: 'Richmond, BC'
    },
    {
        id: 9,
        title: 'Gaming Console Bundle',
        price: 25,
        category: 'Entertainment',
        description: 'Latest gaming console with controllers and games',
        image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=400&q=80',
        location: 'Richmond, BC'
    },
    {
        id: 10,
        title: 'Board Game Collection',
        price: 8,
        category: 'Entertainment',
        description: 'Collection of popular board games for family fun',
        image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=400&q=80',
        location: 'Richmond, BC'
    },
    {
        id: 11,
        title: 'Karaoke Machine Pro',
        price: 22,
        category: 'Entertainment',
        description: 'Professional karaoke system with microphones',
        image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=400&q=80',
        location: 'Richmond, BC'
    },
    {
        id: 12,
        title: 'VR Gaming Headset',
        price: 35,
        category: 'Entertainment',
        description: 'Virtual reality headset for immersive gaming',
        image: 'https://images.unsplash.com/photo-1519121789249-bc1c1f1c7c93?auto=format&fit=crop&w=400&q=80',
        location: 'Richmond, BC'
    }
];

const categories = [
    { name: 'Tools & Equipment', icon: 'bi-tools', slug: 'tools' },
    { name: 'Sports & Outdoors', icon: 'bi-bicycle', slug: 'sports' },
    { name: 'Electronics', icon: 'bi-camera', slug: 'electronics' },
    { name: 'Entertainment', icon: 'bi-controller', slug: 'entertainment' },
    { name: 'Home & Garden', icon: 'bi-house', slug: 'home' },
    { name: 'Vehicles & Transportation', icon: 'bi-car-front', slug: 'vehicles' },
    { name: 'Fashion & Accessories', icon: 'bi-bag', slug: 'fashion' },
    { name: 'Baby & Kids', icon: 'bi-heart', slug: 'baby' },
    { name: 'Business & Office', icon: 'bi-briefcase', slug: 'business' },
    { name: 'Health & Fitness', icon: 'bi-activity', slug: 'health' },
    { name: 'Photography & Video', icon: 'bi-camera-video', slug: 'photography' },
    { name: 'Music & Audio', icon: 'bi-music-note', slug: 'music' }
];

// Routes
app.get('/', (req, res) => {
    res.render('index', {
        title: 'RentAll - Community Rentals', // tab text for homepage
        featuredItems: sampleItems, // shows all hardcoded sample items as featured
        categories: categories.slice(0, 4), // Show only first 4 categories on homepage
        user: null, // Will be replaced with actual user data later
        path: '/'
    });
});

// Signup and register info to DB
app.post('/registerSubmit', async (req, res) => {
    try {
        const {
            registerFirstName,
            registerLastName,
            registerEmail,
            registerPhone,
            registerPassword,
            confirmPassword,
            termsAgreement
        } = req.body;

        // Check for terms of agreement and password confirmation
        if (!termsAgreement) {
            return res.status(400).send('You must agree to the Terms of Service and Privacy Policy.');
        }
        if(registerPassword !== confirmPassword) {
            return res.status(400).send('Passwords do not match.');
        }

        // Call Xano signup endpoint
        const xanoRes = await fetch(`${process.env.XANO_BASE_URL}/auth/signup`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                first_name: registerFirstName, 
                last_name: registerLastName, 
                email: registerEmail,
                phone_number: registerPhone,
                password: registerPassword,
            })
        });

        // Parse response
        const data = await xanoRes.json().catch(() => ({}));

        // If Xano returns an error, forward it to the client
        if (!xanoRes.ok) {
            console.log("Xano status:", xanoRes.status);
            console.log("Xano body:", data);
            return res.status(xanoRes.status).send(data.message || data.error ||'Signup failed.');
        }
        // On success, redirect to homepage
        return res.redirect('/');

    } catch (err) {
        console.error('Registration error:', err);
        return res.status(500).send('Server error during signup.');
    }
});

// Login route
app.post('/loginSubmit', async (req, res) => {
    try {
        // Extract login credentials
        const { loginEmail, loginPassword } = req.body;

        console.log("req.body:", req.body);
        
        // Call Xano login endpoint
        const xanoRes = await fetch(`${process.env.XANO_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                email: loginEmail,
                password: loginPassword
            })
        });

        // Parse response from Xano
        const data = await xanoRes.json().catch(() => ({}));

        // If Xano returns an error, forward it to the client
        if (!xanoRes.ok) {
            console.log("Xano status:", xanoRes.status);
            console.log("Xano body:", data);
            return res.status(xanoRes.status).send(data.message || data.error || 'Login failed.');
        }
        // On success, redirect to homepage
        return res.redirect('/');
    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).send('Server error during login.');
    }
});

app.get('/categories', (req, res) => {
    res.render('categories', {
        title: 'Categories - RentAll',
        categories: categories,
        user: null,
        path: '/categories'
    });
});

app.get('/search', (req, res) => {
    const { category, query } = req.query;
    let filteredItems = sampleItems;
    
    if (category) {
        filteredItems = sampleItems.filter(item => 
            item.category.toLowerCase() === category.toLowerCase()
        );
    }
    
    if (query) {
        filteredItems = filteredItems.filter(item =>
            item.title.toLowerCase().includes(query.toLowerCase()) ||
            item.description.toLowerCase().includes(query.toLowerCase())
        );
    }
    
    // Define subcategories mapping
    const subcategories = {
        tools: ['Power Tools', 'Gardening', 'Construction', 'Hand Tools', 'Automotive', 'Cleaning', 'Painting', 'Plumbing'],
        sports: ['Bikes', 'Camping', 'Fitness', 'Water Sports', 'Winter Sports', 'Team Sports', 'Hiking', 'Yoga'],
        electronics: ['Cameras', 'Audio', 'Gadgets', 'Computers', 'Gaming', 'Mobile Devices', 'Home Theater', 'Smart Home'],
        entertainment: ['Games', 'Movies', 'Party', 'Musical Instruments', 'Board Games', 'VR Equipment', 'Karaoke', 'DJ Equipment'],
        home: ['Furniture', 'Appliances', 'Decor', 'Garden Tools', 'Kitchen Equipment', 'Cleaning Supplies', 'Storage', 'Lighting'],
        vehicles: ['Cars', 'Trucks', 'Motorcycles', 'Scooters', 'Trailers', 'Bikes', 'Boats', 'Recreational Vehicles'],
        fashion: ['Formal Wear', 'Costumes', 'Jewelry', 'Handbags', 'Accessories', 'Shoes', 'Watches', 'Sunglasses'],
        baby: ['Strollers', 'Car Seats', 'Baby Gear', 'Toys', 'Educational Materials', 'Nursery Equipment', 'Safety Items', 'Feeding Supplies'],
        business: ['Office Equipment', 'Presentation Tools', 'Meeting Furniture', 'Business Supplies', 'Computers', 'Printers', 'Conference Equipment', 'Office Decor'],
        health: ['Exercise Equipment', 'Yoga Mats', 'Fitness Trackers', 'Massage Chairs', 'Wellness Products', 'Medical Equipment', 'Rehabilitation', 'Sports Medicine'],
        photography: ['Professional Cameras', 'Lenses', 'Lighting Equipment', 'Tripods', 'Video Production', 'Studio Equipment', 'Accessories', 'Editing Tools'],
        music: ['Musical Instruments', 'Sound Systems', 'Microphones', 'Amplifiers', 'Recording Equipment', 'DJ Equipment', 'Studio Gear', 'Accessories']
    };
    
    // Get featured items for the selected category
    const currentFeaturedItems = sampleItems.filter(item => {
        if (category) {
            return item.category.toLowerCase() === category.toLowerCase();
        }
        return true; // Show all items if no category selected
    }).slice(0, 6); // Limit to 6 featured items
    
    res.render('search-view', {
        title: 'Search Results - RentAll',
        items: filteredItems,
        searchQuery: query || '',
        selectedCategory: category || '',
        categories: categories,
        subcategories: subcategories,
        featuredItems: currentFeaturedItems,
        user: null,
        path: '/search'
    });
});

app.get('/product/:id', (req, res) => {
    const item = sampleItems.find(item => item.id == req.params.id);
    if (!item) {
        return res.status(404).render('404', { 
            title: 'Item Not Found - RentAll',
            path: req.path,
            user: null
        });
    }
    
    res.render('product-details', {
        title: `${item.title} - RentAll`,
        item: item,
        user: null,
        path: '/product'
    });
});

app.get('/contact', (req, res) => {
    res.render('contact', {
        title: 'Contact Us - RentAll',
        user: null,
        path: '/contact'
    });
});

app.get('/profile', (req, res) => {
    res.render('profile', {
        title: 'Profile - RentAll',
        user: null,
        path: '/profile'
    });
});

// Add route for individual user profiles
app.get('/user/:userId', (req, res) => {
    // Mock user data - in a real app, this would come from a database
    const userData = {
        id: req.params.userId,
        name: 'John Doe',
        location: 'Richmond, BC',
        memberSince: 'January 2023',
        rating: 4.8,
        reviewCount: 15,
        itemsListed: 12,
        totalRentals: 45,
        earnings: 1250,
        responseRate: 98,
        bio: 'Friendly community member who loves sharing useful items with neighbors!',
        items: sampleItems.filter(item => item.id <= 6) // Mock items for this user
    };
    
    res.render('user-profile', {
        title: `${userData.name} - RentAll`,
        user: userData,
        path: '/user'
    });
});



// 404 handler
app.use((req, res) => {
    res.status(404).render('404', { 
        title: 'Page Not Found - RentAll',
        path: req.path,
        user: null
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
}); 