// public/js/calendar.js

class RentalCalendar {
    constructor() {
        this.currentDate = new Date();
        this.selectedDates = new Set();
        this.unavailableDates = new Set();
        this.startDate = null;
        this.endDate = null;
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
            if (date.getMonth() !== month) {
                dayElement.classList.add('other-month');
            }
            const today = new Date();
            if (date.toDateString() === today.toDateString()) {
                dayElement.classList.add('today');
            }
            if (this.unavailableDates.has(date.toISOString().split('T')[0])) {
                dayElement.classList.add('unavailable');
            } else if (date.getMonth() === month) {
                dayElement.classList.add('available');
            }
            
            // Check if date is in selected range
            const dateStr = date.toISOString().split('T')[0];
            if (this.startDate && this.endDate) {
                const start = new Date(this.startDate);
                const end = new Date(this.endDate);
                const current = new Date(dateStr);
                
                if (current >= start && current <= end) {
                    dayElement.classList.add('in-range');
                }
                if (dateStr === this.startDate || dateStr === this.endDate) {
                    dayElement.classList.add('selected');
                }
            } else if (this.startDate && dateStr === this.startDate) {
                dayElement.classList.add('selected');
            }
            
            // Legacy support for individual selected dates
            if (this.selectedDates.has(dateStr)) {
                dayElement.classList.add('selected');
            }
            
            calendarDays.appendChild(dayElement);
        }
    }

    bindEvents() {
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
        if (calendarDays) {
            calendarDays.addEventListener('click', (e) => {
                if (e.target.classList.contains('calendar-day') && e.target.classList.contains('available')) {
                    const date = e.target.dataset.date;
                    const clickedDate = new Date(date);
                    
                    // Range selection logic
                    if (!this.startDate || (this.startDate && this.endDate)) {
                        // Start a new selection
                        this.startDate = date;
                        this.endDate = null;
                        this.selectedDates.clear();
                        this.selectedDates.add(date);
                    } else if (this.startDate && !this.endDate) {
                        // Set end date
                        const start = new Date(this.startDate);
                        if (clickedDate < start) {
                            // If clicked date is before start, make it the new start
                            this.endDate = this.startDate;
                            this.startDate = date;
                        } else {
                            // Set as end date
                            this.endDate = date;
                        }
                        
                        // Add all dates in range to selectedDates
                        this.selectedDates.clear();
                        const rangeStart = new Date(this.startDate);
                        const rangeEnd = new Date(this.endDate);
                        for (let d = new Date(rangeStart); d <= rangeEnd; d.setDate(d.getDate() + 1)) {
                            this.selectedDates.add(d.toISOString().split('T')[0]);
                        }
                    }
                    
                    // Re-render calendar to show the range
                    this.renderCalendar();
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
        }
    }

    getBookingData() {
        return {
            selectedDates: Array.from(this.selectedDates),
            unavailableDates: Array.from(this.unavailableDates),
            minRentalDays: parseInt(document.getElementById('minRentalDays').value) || 1,
            maxRentalDays: parseInt(document.getElementById('maxRentalDays').value) || 30,
            advanceBookingDays: parseInt(document.getElementById('advanceBookingDays').value) || 7,
            cancellationPolicy: document.getElementById('cancellationPolicy').value
        };
    }
}

// Only initialize when modal is shown (if not already initialized by main.js)
if (!window.rentalCalendarInitialized) {
    document.addEventListener('DOMContentLoaded', function() {
        const modal = document.getElementById('createListingModal');
        if (modal) {
            modal.addEventListener('shown.bs.modal', function () {
                if (!window.rentalCalendar) {
                    window.rentalCalendar = new RentalCalendar();
                } else {
                    // Reset calendar state when modal opens
                    window.rentalCalendar.startDate = null;
                    window.rentalCalendar.endDate = null;
                    window.rentalCalendar.selectedDates.clear();
                    window.rentalCalendar.renderCalendar();
                }
            });
        }
    // Handle form submission
    const createListingForm = document.querySelector('#createListingModal form');
    if (createListingForm) {
        createListingForm.addEventListener('submit', function(e) {
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
                    title: document.getElementById('itemTitle').value,
                    description: document.getElementById('itemDescription').value,
                    categories: selectedCategories,
                    dailyRate: document.getElementById('dailyRate').value,
                    location: document.getElementById('location').value,
                    contactPhone: document.getElementById('contactPhone').value,
                    bookingData: bookingData
                };
                console.log('Form Data:', formData);
                alert(`Listing created successfully! Categories: ${selectedCategories.join(', ')}`);
                // Close modal
                const modalInstance = bootstrap.Modal.getInstance(document.getElementById('createListingModal'));
                modalInstance.hide();
            }
        });
    }
    // Add category button functionality
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
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'mb-2';
        buttonContainer.appendChild(selectAllBtn);
        buttonContainer.appendChild(clearAllBtn);
        label.parentNode.insertBefore(buttonContainer, label.nextSibling);
    }
    // Function to update visual feedback
    function updateCategorySelectionFeedback() {
        const selectedCategories = [];
        categoryButtons.forEach(button => {
            if (button.classList.contains('btn-primary')) {
                selectedCategories.push(button.dataset.category);
            }
        });
        const container = document.querySelector('.categories-container');
        if (selectedCategories.length > 0) {
            container.style.borderColor = '#198754';
            container.style.backgroundColor = '#f8fff9';
        } else {
            container.style.borderColor = '#dee2e6';
            container.style.backgroundColor = 'transparent';
        }
    }
    });
} 