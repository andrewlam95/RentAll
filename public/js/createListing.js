// Array to hold selected files for preview and submission
let selectedFiles = [];

// Image preview functionality for create listing modal
const imageInput = document.getElementById('itemImages');
const previewContainer = document.getElementById('imagePreviewContainer');
const form = document.querySelector('#createListingModal form');
const myModalEl = document.getElementById('createListingModal');
const fileUploadLabel = document.getElementById('fileUploadLabel')

if (myModalEl) {
    myModalEl.addEventListener('hidden.bs.modal', function () {
        selectedFiles = [];
        renderPreviews();
        if (imageInput) imageInput.value = '';
        if (form) form.reset();
    });
}

// Image selection logic
if (imageInput && previewContainer) {
    imageInput.addEventListener('change', function(event) {
        // Get new files selected by user for this specific 'change' event
        const newFiles = Array.from(event.target.files);

        // Append new files to the existing selectedFiles array to allow multiple selections across different 'change' events
        selectedFiles = selectedFiles.concat(newFiles);

        // Clear and rebuild the preview container to show all selected images
        renderPreviews();

        // Clear the file input value to allow re-selection of the same file if needed
        imageInput.value = '';
    });
}

// Function to render image previews in the preview container and remove button for each selected image
function renderPreviews() {
    previewContainer.innerHTML = '';

    // Update the label of the upload section
    if (fileUploadLabel) {
        if (selectedFiles.length > 0) {
            fileUploadLabel.textContent = selectedFiles.length === 1 ? selectedFiles[0].name : `${selectedFiles.length} images selected`;
            fileUploadLabel.classList.add('text-primary', 'fw-bold');
        } else {
            fileUploadLabel.textContent = "Drag and drop images here or click to browse";
            fileUploadLabel.classList.remove('text-primary', 'fw-bold');
        }
    }

    selectedFiles.forEach((file, index) => {
        if (file.type.startsWith('image/')) {

            // Create a wrapper for the given image
            const imgWrapper = document.createElement('div');
            imgWrapper.className = 'position-relative';

            // Append empty wrapper to the container to preserve the order of uploaded images
            previewContainer.appendChild(imgWrapper);

            const reader = new FileReader();
            reader.onload = function(e) {
                // Update the contents of the wrapper only when data is ready
                imgWrapper.innerHTML = `
                    <img src="${e.target.result}" class="rounded border" style="width: 80px; height: 80px; object-fit: cover;">
                    <button type="button" 
                            class="btn btn-danger btn-sm position-absolute top-0 end-0 rounded-circle d-flex align-items-center justify-content-center"
                            style="width: 15px; height: 15px; padding: 0; font-size: 12px;" 
                            onclick="removeFile(${index})">×</button>
                    `;
            };
            reader.readAsDataURL(file);
        }
    });
}

// Global fucntion to remove a file form the list
window.removeFile = function(index) {
    selectedFiles.splice(index, 1);
    renderPreviews();
}

// Submit create-listing modal to /api/itemSubmit (multipart: fields + image).
if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Validate that both start and end dates are selected on the calendar before allowing form submission
        if (!window.rentalCalendar || !window.rentalCalendar.startDate || !window.rentalCalendar.endDate) {
            alert('Please select both a start and end date on the calendar.');
            return;
        }

        // Create FormData object from the form, which will handle both text fields and file uploads.
        const formData = new FormData(form);

        // Append the start and end dates from the calendar to the FormData object to ensure they are included in the submission.
        formData.append('startDate', window.rentalCalendar.startDate);
        formData.append('endDate', window.rentalCalendar.endDate);

        // Remove the old'images' field from FormData input and add the master list instead for current entry
        formData.delete('images');

        // Append all selected files to the FormData object under the same 'images' key, which matches the multer field name expected by the server.
        selectedFiles.forEach(file => {
            formData.append('images', file);
        });

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
                body: formData, // FormData sends dates + images 
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

document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.querySelector('.border.rounded.p-3.text-center');
    const fileInput = document.getElementById('itemImages');

    // Prevent default browser drag behaviour (open the file)
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
        }, false);
    });

    // Add visual feedback when dragging over the drop zone
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.add('bg-light', 'border-primary');
        }, false);
    });

    // Remove visual feedback when dragging leaves the drop zone or when files are dropped
    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.remove('bg-light', 'border-primary');
        }, false);
    });

    // Handle dropped files and update the file input and previews
    dropZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const newFiles = Array.from(dt.files);

        if  (newFiles.length > 0) {
            // Push dropped image files into exisiting global array
            selectedFiles = selectedFiles.concat(newFiles);
            // Trigger existing preview render function
            renderPreviews();
        }
    });

    fileInput.addEventListener('click', (e) => {
        // Prevent the click event from "bubbling up" to the drop zone and triggering the file dialog twice
        e.stopPropagation();
    })

    // Make the entire drop zone clickable to open the file browser dialog
    dropZone.addEventListener('click', () => {
        fileInput.click();
    });
});
