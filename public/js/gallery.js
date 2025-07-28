// Product Gallery JavaScript
let currentImageIndex = 0;
const totalImages = 12; // Total number of images in the gallery

// Initialize gallery
document.addEventListener('DOMContentLoaded', function() {
    updateImageCounter();
    setupKeyboardNavigation();
    setupFullscreenView();
    preloadImages();
});

// Change image using navigation arrows
function changeImage(direction) {
    const thumbnails = document.querySelectorAll('.thumbnail');
    
    currentImageIndex += direction;
    
    // Handle circular navigation
    if (currentImageIndex < 0) {
        currentImageIndex = totalImages - 1;
    } else if (currentImageIndex >= totalImages) {
        currentImageIndex = 0;
    }
    
    // Update main image
    const mainImage = document.getElementById('mainImage');
    const selectedThumbnail = thumbnails[currentImageIndex];
    
    if (selectedThumbnail && mainImage) {
        const newImageSrc = selectedThumbnail.getAttribute('data-image');
        
        // Add loading state
        mainImage.classList.add('loading');
        
        // Update image with smooth transition
        mainImage.style.opacity = '0.7';
        
        setTimeout(() => {
            mainImage.src = newImageSrc;
            mainImage.alt = selectedThumbnail.querySelector('img').alt;
            
            // Remove loading state and restore opacity
            mainImage.classList.remove('loading');
            mainImage.style.opacity = '1';
            
            // Update thumbnail selection
            updateThumbnailSelection();
            updateImageCounter();
            
            // Scroll thumbnail into view if needed
            scrollThumbnailIntoView();
        }, 150);
    }
}

// Select image by clicking on thumbnail
function selectImage(index) {
    if (index >= 0 && index < totalImages) {
        currentImageIndex = index;
        changeImage(0); // Update without changing direction
    }
}

// Update thumbnail selection
function updateThumbnailSelection() {
    const thumbnails = document.querySelectorAll('.thumbnail');
    
    thumbnails.forEach((thumbnail, index) => {
        if (index === currentImageIndex) {
            thumbnail.classList.add('active');
        } else {
            thumbnail.classList.remove('active');
        }
    });
}

// Scroll active thumbnail into view
function scrollThumbnailIntoView() {
    const activeThumbnail = document.querySelector('.thumbnail.active');
    if (activeThumbnail) {
        activeThumbnail.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center'
        });
    }
}

// Update image counter display
function updateImageCounter() {
    const currentIndexElement = document.getElementById('currentImageIndex');
    const totalImagesElement = document.getElementById('totalImages');
    
    if (currentIndexElement) {
        currentIndexElement.textContent = currentImageIndex + 1;
    }
    
    if (totalImagesElement) {
        totalImagesElement.textContent = totalImages;
    }
}

// Setup keyboard navigation
function setupKeyboardNavigation() {
    document.addEventListener('keydown', function(event) {
        switch(event.key) {
            case 'ArrowLeft':
                event.preventDefault();
                changeImage(-1);
                break;
            case 'ArrowRight':
                event.preventDefault();
                changeImage(1);
                break;
            case 'Escape':
                event.preventDefault();
                closeFullscreen();
                break;
            case 'f':
            case 'F':
                event.preventDefault();
                toggleFullscreen();
                break;
        }
    });
}

// Setup fullscreen view
function setupFullscreenView() {
    const mainImageContainer = document.querySelector('.main-image-container');
    if (mainImageContainer) {
        mainImageContainer.addEventListener('click', function(e) {
            if (e.target.classList.contains('main-image')) {
                toggleFullscreen();
            }
        });
    }
}

// Toggle fullscreen view
function toggleFullscreen() {
    let overlay = document.getElementById('galleryOverlay');
    if (!overlay) {
        createFullscreenOverlay();
        overlay = document.getElementById('galleryOverlay');
    }
    
    const isFullscreen = overlay.classList.contains('active');
    
    if (isFullscreen) {
        closeFullscreen();
    } else {
        openFullscreen();
    }
}

// Create fullscreen overlay
function createFullscreenOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'galleryOverlay';
    overlay.className = 'gallery-overlay';
    overlay.innerHTML = `
        <div class="fullscreen-gallery">
            <button class="fullscreen-close" onclick="closeFullscreen()">
                <i class="bi bi-x-lg"></i>
            </button>
            <button class="fullscreen-nav fullscreen-prev" onclick="changeImage(-1)">
                <i class="bi bi-chevron-left"></i>
            </button>
            <button class="fullscreen-nav fullscreen-next" onclick="changeImage(1)">
                <i class="bi bi-chevron-right"></i>
            </button>
            <img id="fullscreenImage" src="" alt="">
            <div class="fullscreen-counter">
                <span id="fullscreenCurrentIndex">1</span>/<span id="fullscreenTotalImages">12</span>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
}

// Open fullscreen view
function openFullscreen() {
    const overlay = document.getElementById('galleryOverlay');
    const fullscreenImage = document.getElementById('fullscreenImage');
    const mainImage = document.getElementById('mainImage');
    
    if (overlay && fullscreenImage && mainImage) {
        fullscreenImage.src = mainImage.src;
        fullscreenImage.alt = mainImage.alt;
        
        // Update fullscreen counter
        const fullscreenCurrentIndex = document.getElementById('fullscreenCurrentIndex');
        const fullscreenTotalImages = document.getElementById('fullscreenTotalImages');
        
        if (fullscreenCurrentIndex) {
            fullscreenCurrentIndex.textContent = currentImageIndex + 1;
        }
        if (fullscreenTotalImages) {
            fullscreenTotalImages.textContent = totalImages;
        }
        
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// Close fullscreen view
function closeFullscreen() {
    const overlay = document.getElementById('galleryOverlay');
    if (overlay) {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Preload images for better performance
function preloadImages() {
    const thumbnails = document.querySelectorAll('.thumbnail');
    thumbnails.forEach(thumbnail => {
        const img = thumbnail.querySelector('img');
        if (img && img.src) {
            const preloadImg = new Image();
            preloadImg.src = img.src;
        }
    });
}

// Add touch/swipe support for mobile devices
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', function(event) {
    touchStartX = event.changedTouches[0].screenX;
});

document.addEventListener('touchend', function(event) {
    touchEndX = event.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            // Swipe left - next image
            changeImage(1);
        } else {
            // Swipe right - previous image
            changeImage(-1);
        }
    }
}

// Auto-play functionality (optional)
let autoPlayInterval = null;

function startAutoPlay() {
    if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
    }
    
    autoPlayInterval = setInterval(() => {
        changeImage(1);
    }, 4000); // Change image every 4 seconds
}

function stopAutoPlay() {
    if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
        autoPlayInterval = null;
    }
}

// Pause auto-play when user interacts
document.addEventListener('mouseenter', stopAutoPlay);
document.addEventListener('touchstart', stopAutoPlay);

// Resume auto-play when user leaves
document.addEventListener('mouseleave', startAutoPlay);

// Initialize auto-play (optional - uncomment to enable)
// startAutoPlay(); 