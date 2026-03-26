// Submit create-listing modal to /api/itemSubmit (multipart: fields + image).

const form = document.querySelector('#createListingModal form');

if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const categorySelect = document.getElementById('itemCategory');
        if (!categorySelect || !categorySelect.value) {
            alert('Please select a category for your item.');
            return;
        }

        const formData = new FormData(form);

        try {
            const response = await fetch('/api/itemSubmit', {
                method: 'POST',
                body: formData,
                redirect: 'manual'
            });

            if (response.status === 302 || response.status === 301) {
                alert('Listing Created Successfully');
                window.location.href = '/profile';
                return;
            }

            const contentType = response.headers.get('content-type') || '';

            if (contentType.includes('application/json')) {
                const result = await response.json();
                if (response.ok) {
                    alert('Listing Created Successfully');
                    window.location.href = '/profile';
                } else {
                    alert('Upload failed: ' + (result.error || 'Unknown error'));
                }
                return;
            }

            const text = await response.text();
            if (response.ok) {
                alert('Listing Created Successfully');
                window.location.href = '/profile';
            } else {
                alert('Upload failed: ' + (text.slice(0, 200) || response.statusText));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while submitting the form.');
        }
    });
}
