// Submit create-listing modal to /api/itemSubmit (multipart: fields + image).

const form = document.querySelector('#createListingModal form');

if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Create FormData object from the form, which will handle both text fields and file uploads.
        const formData = new FormData(form);

        const categoryValue = formData.get('itemCategory');
        if (!categoryValue) {
            alert('Please select a category.');
            return;
        }

        try {
            // Disable the submit button to prevent multiple submissions.
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.disabled = true;

            const response = await fetch('/api/itemSubmit', {
                method: 'POST',
                body: formData,
            });

            // If server responds with a 200/201 JSON response
            if (response.ok) {
                alert('Listing Created Successfully');
                window.location.href = '/profile';
                return;
            }

            // If the response is not ok, try to parse the error message from the server.
            const result = await response.json().catch(() => ({ error: 'Server error' }));
            alert('Upload failed: ' + (result.error || response.statusText));
            submitBtn.disabled = false; // Re-enable the submit button on failure

        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while submitting the form.');
            form.querySelector('button[type="submit"]').disabled = false; // Re-enable the submit button on error
        }
    });
}
