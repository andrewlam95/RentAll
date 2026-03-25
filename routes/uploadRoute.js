//Combine create listing text and image upload into one route.
const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const cloudinary = require('../config/cloudinary');

router.post('/itemSubmit', upload.single('image'), async (req, res) => {
    try {
        // Get the uploaded file from multer
        const file = req.file;

        // Check if a file was uploaded
        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const {
            itemTitle,
            itemDescription,
            itemImages,
            itemCategory,
            location,
            contactPhone,
            dailyRate,
            minRentalDays,
            maxRentalDays
        } = req.body;


        // Convert the file buffer to a base64 string to upload to Cloudinary
        const base64 = file.buffer.toString('base64');
        const dataURI = `data:${file.mimetype};base64,${base64}`;
        const cloudinaryResult = await cloudinary.uploader.upload(dataURI);

        const imageUrl = cloudinaryResult.secure_url;
        const publicId = cloudinaryResult.public_id; // store public ID for future reference (e.g., image deletion)?

        // Fetch category ID from Xano based on category name
        const categoryRes =  await fetch(`${process.env.XANO_BASE_URL}/category?name=${encodeURIComponent(itemCategory)}`, {
            method: 'GET',
            headers: {'Content-Type': 'application/json'},
        });

        // Parse category response
        const categoryData = await categoryRes.json().catch(() => ({}));

        // Check if category exists
        if (!categoryData || categoryData.length === 0) {
            return res.status(404).json({error: "Category not found"});
        }

        // Get category ID for the given category name
        const categoryId = categoryData[0].id;

        // Call Xano item creation endpoint
        const xanoRes = await fetch(`${process.env.XANO_BASE_URL}/rental_item`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                category_id: categoryId,
                title: itemTitle,
                description: itemDescription,
                image_url: imageUrl, // image URL from Cloudinary
                cloudinary_public_id: publicId, // store Cloudinary public ID for future reference
                location: location,
                contact_phone: contactPhone, // get phone number from user table?
                price: dailyRate,
                min_days: minRentalDays,
                max_days: maxRentalDays
            })
        });

        const data = await xanoRes.json().catch(() => ({}));

         // If Xano returns an error, forward it to the client
        if (!xanoRes.ok) {
            console.log("Xano status:", xanoRes.status);
            console.log("Xano body:", data);
            return res.status(xanoRes.status).send(data.message || data.error || 'Item submission failed.');
        }

        // On success, redirect to homepage
        return res.redirect('/');

    } catch (err) {
        console.error('Item submission error:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;