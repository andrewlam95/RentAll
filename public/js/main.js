// main.js - Consolidated JavaScript for RentAll application

// ============================================================================
// NAVBAR SCROLL EFFECT
// ============================================================================

function setupNavbarScrollEffect() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    let lastScrollTop = 0;
    const scrollThreshold = 50;

    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Add scrolled class for enhanced styling
        if (scrollTop > scrollThreshold) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Optional: Hide/show navbar on scroll (uncomment if desired)
        // if (scrollTop > lastScrollTop && scrollTop > 100) {
        //     navbar.style.transform = 'translateY(-100%)';
        // } else {
        //     navbar.style.transform = 'translateY(0)';
        // }
        
        lastScrollTop = scrollTop;
    });
}

// ============================================================================
// RENTAL CALENDAR CLASS
// ============================================================================

class RentalCalendar {
    constructor() {
        this.currentDate = new Date();
        this.selectedDates = new Set();
        this.unavailableDates = new Set();
        this.init();
    }

    init() {
        this.renderCalendar();
        this.bindEvents();
        this.setupBookingSettings();
    }

    renderCalendar() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        // Update month/year display
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                          'July', 'August', 'September', 'October', 'November', 'December'];
        const currentMonthElement = document.getElementById('currentMonth');
        if (currentMonthElement) {
            currentMonthElement.textContent = `${monthNames[month]} ${year}`;
        }

        // Get first day of month and number of days
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        const calendarDays = document.getElementById('calendarDays');
        if (!calendarDays) return;
        
        calendarDays.innerHTML = '';

        // Generate calendar days
        for (let i = 0; i < 42; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = date.getDate();
            dayElement.dataset.date = date.toISOString().split('T')[0];

            // Check if it's current month
            if (date.getMonth() !== month) {
                dayElement.classList.add('other-month');
            }

            // Check if it's today
            const today = new Date();
            if (date.toDateString() === today.toDateString()) {
                dayElement.classList.add('today');
            }

            // Check availability
            if (this.unavailableDates.has(date.toISOString().split('T')[0])) {
                dayElement.classList.add('unavailable');
            } else if (date.getMonth() === month) {
                dayElement.classList.add('available');
            }

            // Check if selected
            if (this.selectedDates.has(date.toISOString().split('T')[0])) {
                dayElement.classList.add('selected');
            }

            calendarDays.appendChild(dayElement);
        }
    }

    bindEvents() {
        // Month navigation
        const prevMonthBtn = document.getElementById('prevMonth');
        const nextMonthBtn = document.getElementById('nextMonth');
        const calendarDays = document.getElementById('calendarDays');
        
        if (prevMonthBtn) {
            prevMonthBtn.addEventListener('click', () => {
                this.currentDate.setMonth(this.currentDate.getMonth() - 1);
                this.renderCalendar();
            });
        }

        if (nextMonthBtn) {
            nextMonthBtn.addEventListener('click', () => {
                this.currentDate.setMonth(this.currentDate.getMonth() + 1);
                this.renderCalendar();
            });
        }

        // Day selection
        if (calendarDays) {
            calendarDays.addEventListener('click', (e) => {
                if (e.target.classList.contains('calendar-day') && e.target.classList.contains('available')) {
                    const date = e.target.dataset.date;
                    if (this.selectedDates.has(date)) {
                        this.selectedDates.delete(date);
                        e.target.classList.remove('selected');
                    } else {
                        this.selectedDates.add(date);
                        e.target.classList.add('selected');
                    }
                }
            });
        }
    }

    setupBookingSettings() {
        // Set up booking settings based on form inputs
        const minDays = document.getElementById('minRentalDays');
        const maxDays = document.getElementById('maxRentalDays');
        const advanceDays = document.getElementById('advanceBookingDays');

        if (minDays && maxDays && advanceDays) {
            // You can add logic here to validate booking settings
            console.log('Booking settings initialized');
        }
    }

    getBookingData() {
        return {
            selectedDates: Array.from(this.selectedDates),
            unavailableDates: Array.from(this.unavailableDates),
            minRentalDays: parseInt(document.getElementById('minRentalDays')?.value) || 1,
            maxRentalDays: parseInt(document.getElementById('maxRentalDays')?.value) || 30,
            advanceBookingDays: parseInt(document.getElementById('advanceBookingDays')?.value) || 7,
            cancellationPolicy: document.getElementById('cancellationPolicy')?.value || 'flexible'
        };
    }
}

// ============================================================================
// SEARCH AND FILTER FUNCTIONS
// ============================================================================

function filterBySubcategory(subcategory) {
    console.log('Filtering by subcategory:', subcategory);
    // Add your filtering logic here
    // This could update the URL parameters or make an AJAX request
}

function clearFilters() {
    const filterForm = document.getElementById('filterForm');
    if (filterForm) {
        filterForm.reset();
    }
    console.log('Filters cleared');
}

function applyFilters() {
    const filterForm = document.getElementById('filterForm');
    if (filterForm) {
        const formData = new FormData(filterForm);
        const filters = Object.fromEntries(formData);
        console.log('Applied filters:', filters);
        
        // Add your filter application logic here
        // This could update the search results or make an AJAX request
    }
}

// ============================================================================
// FORM HANDLING AND VALIDATION
// ============================================================================

function handleCreateListingForm() {
    const form = document.querySelector('#createListingModal form');
    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get selected categories
        const selectedCategories = [];
        const categoryButtons = document.querySelectorAll('.category-btn');
        categoryButtons.forEach(button => {
            if (button.classList.contains('btn-primary')) {
                selectedCategories.push(button.dataset.category);
            }
        });
        
        // Validate that at least one category is selected
        if (selectedCategories.length === 0) {
            alert('Please select at least one category for your item.');
            return;
        }
        
        if (window.rentalCalendar) {
            const bookingData = window.rentalCalendar.getBookingData();
            const formData = {
                title: document.getElementById('itemTitle')?.value,
                description: document.getElementById('itemDescription')?.value,
                categories: selectedCategories,
                dailyRate: document.getElementById('dailyRate')?.value,
                location: document.getElementById('location')?.value,
                contactPhone: document.getElementById('contactPhone')?.value,
                bookingData: bookingData
            };
            
            console.log('Form Data:', formData);
            console.log('Selected Categories:', selectedCategories);
            
            // Here you would typically send the data to your backend
            alert(`Listing created successfully! Categories: ${selectedCategories.join(', ')}`);
            
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('createListingModal'));
            if (modal) {
                modal.hide();
            }
        }
    });
}

// ============================================================================
// CATEGORY SELECTION FUNCTIONALITY
// ============================================================================

function setupCategorySelection() {
    const categoryButtons = document.querySelectorAll('.category-btn');
    
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Toggle button state
            if (this.classList.contains('btn-outline-primary')) {
                this.classList.remove('btn-outline-primary');
                this.classList.add('btn-primary');
            } else {
                this.classList.remove('btn-primary');
                this.classList.add('btn-outline-primary');
            }
            
            // Update visual feedback
            updateCategorySelectionFeedback();
        });
    });

    // Add "Select All" and "Clear All" functionality
    const categoriesContainer = document.querySelector('.categories-container');
    if (categoriesContainer) {
        const selectAllBtn = document.createElement('button');
        selectAllBtn.type = 'button';
        selectAllBtn.className = 'btn btn-sm btn-outline-primary me-2';
        selectAllBtn.textContent = 'Select All';
        selectAllBtn.addEventListener('click', function() {
            categoryButtons.forEach(button => {
                button.classList.remove('btn-outline-primary');
                button.classList.add('btn-primary');
            });
            updateCategorySelectionFeedback();
        });

        const clearAllBtn = document.createElement('button');
        clearAllBtn.type = 'button';
        clearAllBtn.className = 'btn btn-sm btn-outline-secondary';
        clearAllBtn.textContent = 'Clear All';
        clearAllBtn.addEventListener('click', function() {
            categoryButtons.forEach(button => {
                button.classList.remove('btn-primary');
                button.classList.add('btn-outline-primary');
            });
            updateCategorySelectionFeedback();
        });

        // Insert buttons before the categories container
        const label = categoriesContainer.previousElementSibling;
        if (label) {
            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'mb-2';
            buttonContainer.appendChild(selectAllBtn);
            buttonContainer.appendChild(clearAllBtn);
            label.parentNode.insertBefore(buttonContainer, label.nextSibling);
        }
    }
}

function updateCategorySelectionFeedback() {
    const selectedCategories = [];
    const categoryButtons = document.querySelectorAll('.category-btn');
    
    categoryButtons.forEach(button => {
        if (button.classList.contains('btn-primary')) {
            selectedCategories.push(button.dataset.category);
        }
    });
    
    // Update visual feedback
    const container = document.querySelector('.categories-container');
    if (container) {
        if (selectedCategories.length > 0) {
            container.style.borderColor = '#198754'; // Green border when categories selected
            container.style.backgroundColor = '#f8fff9';
        } else {
            container.style.borderColor = '#dee2e6'; // Default border
            container.style.backgroundColor = 'transparent';
        }
    }
    
    console.log('Selected categories:', selectedCategories);
}

// ============================================================================
// INTERACTIVE FEATURES
// ============================================================================

function setupInteractiveFeatures() {
    // Auto-populate some fields for demo
    const itemTitle = document.getElementById('itemTitle');
    if (itemTitle) {
        itemTitle.addEventListener('focus', function() {
            if (!this.value) {
                this.placeholder = 'e.g., Professional Camera Kit, Mountain Bike, Power Tools';
            }
        });
    }

    // Show booking preview
    const dailyRate = document.getElementById('dailyRate');
    if (dailyRate) {
        dailyRate.addEventListener('input', function() {
            const rate = parseFloat(this.value) || 0;
            const minDays = parseInt(document.getElementById('minRentalDays')?.value) || 1;
            const maxDays = parseInt(document.getElementById('maxRentalDays')?.value) || 30;
            
            if (rate > 0) {
                const minTotal = (rate * minDays).toFixed(2);
                const maxTotal = (rate * maxDays).toFixed(2);
                
                // You could display this information somewhere in the UI
                console.log(`Rental range: $${minTotal} - $${maxTotal}`);
            }
        });
    }
}

// ============================================================================
// CALENDAR INITIALIZATION
// ============================================================================

function initializeCalendar() {
    const modal = document.getElementById('createListingModal');
    if (modal) {
        modal.addEventListener('shown.bs.modal', function () {
            if (!window.rentalCalendar) {
                window.rentalCalendar = new RentalCalendar();
            } else {
                window.rentalCalendar.renderCalendar();
            }
        });
    }
}

// ============================================================================
// MAIN INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', function() {
    // Initialize calendar functionality
    initializeCalendar();
    
    // Setup form handling
    handleCreateListingForm();
    
    // Setup category selection
    setupCategorySelection();
    
    // Setup interactive features
    setupInteractiveFeatures();

    // Setup navbar scroll effect
    setupNavbarScrollEffect();
    
    console.log('RentAll JavaScript initialized');
});

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// Global utility functions that can be called from HTML
window.filterBySubcategory = filterBySubcategory;
window.clearFilters = clearFilters;
window.applyFilters = applyFilters; 