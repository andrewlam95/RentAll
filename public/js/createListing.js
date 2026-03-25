// Prevent pages from refreshing and sends all form data to the /api/upload endpoint for processing together (text + image)

const form = document.querySelector('form');

if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(form);

        try{
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (response.ok) {
                alert('Listing Created Successfully');
                window.location.href = '/profile';
            } else {
                alert('Upload failed: ' + result.error);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while submitting the form.');
        }
    });
}