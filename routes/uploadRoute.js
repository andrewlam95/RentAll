//Combine create listing text and image upload into one route.
const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const cloudinary = require('../config/cloudinary');

router.post('/itemSubmit', upload.array('images', 5), async (req, res) => {
    try {
        // Get the uploaded files from multer
        // Files includes all data from the form, including text fields and the image files. 
        // Multer parses the multipart/form-data request and makes the file available in req.files, while text fields are available in req.body.
        const files = req.files;

        // Check if a file was uploaded
        if (!files || files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded' });
        }

        // Must match the 'name' field in the form input element for each field in the create listing form
        const {
            itemTitle,
            itemDescription,
            itemCategory,
            location,
            contactPhone,
            dailyRate,
            minRentalDays,
            maxRentalDays,
            startDate,
            endDate
        } = req.body;

        // Convert the file buffer to a base64 string to upload all images to Cloudinary in parallel
        const uploadPromises = files.map(file => {
            const base64 = file.buffer.toString('base64');
            const dataURI = `data:${file.mimetype};base64,${base64}`;
            return cloudinary.uploader.upload(dataURI);
        })

        const cloudinaryResults = await Promise.all(uploadPromises);

        // Extract the secure URLs and public IDs from the Cloudinary results
        const imageUrls = cloudinaryResults.map(result => result.secure_url);
        const publicIds = cloudinaryResults.map(result => result.public_id);

        // Fetch category ID from Xano based on category name 'itemCategory' from req.body
        const categoryRes = await fetch(`${process.env.XANO_BASE_URL}/category?name=${encodeURIComponent(itemCategory)}`, {
            method: 'GET',
            headers: {'Content-Type': 'application/json'},
        });

        // Parse category response
        const categoryData = await categoryRes.json().catch(() => []);

        // Check if array is empty or if no matching category was found
        const matchedCategory = categoryData.find(cat =>
            cat.name.toLowerCase() === itemCategory.toLowerCase()
        )

        if (!matchedCategory) {
            return res.status(404).json({
                error: `The category "${itemCategory}" does not exist in the database.`
            });
        }

        // Get category ID for the given category name
        const categoryId = matchedCategory.id;

        // Call Xano item creation endpoint
        const xanoRes = await fetch(`${process.env.XANO_BASE_URL}/rental_item`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                category_id: categoryId,
                title: itemTitle,
                description: itemDescription,
                image_urls: imageUrls, // array of image URLs from Cloudinary
                cloudinary_public_ids: publicIds, // array of Cloudinary public IDs for future reference
                location: location,
                contact_phone: contactPhone, // get phone number from user table?
                price: dailyRate,
                min_days: minRentalDays,
                max_days: maxRentalDays,
                start_date: startDate,
                end_date: endDate
            })
        });

        // Parse Xano response
        const data = await xanoRes.json().catch(() => ({}));

         // If Xano returns an error, forward it to the client
        if (!xanoRes.ok) {
            console.log("Xano status:", xanoRes.status);
            console.log("Xano body:", data);
            return res.status(xanoRes.status).send(data.message || data.error || 'Item submission failed.');
        }

        // On success,send success response
        return res.status(200).json({ message: 'Item created successfully' });

    } catch (err) {
        console.error('Item submission error:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;