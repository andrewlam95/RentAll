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
        this.setupMaxDaysValidation();
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
                        } else if (clickedDate.getTime() === start.getTime()) { // If clicked the same date, treat it as single day selection
                            this.endDate = this.startDate;
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

                    // Update max rental limit based on selected range
                    this.updateMaxRentalLimit();
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
            startDate: this.startDate,
            endDate: this.endDate,
            selectedDates: Array.from(this.selectedDates),
            unavailableDates: Array.from(this.unavailableDates),
            minRentalDays: parseInt(document.getElementById('minRentalDays').value) || 1,
            maxRentalDays: parseInt(document.getElementById('maxRentalDays').value) || 30,
            advanceBookingDays: parseInt(document.getElementById('advanceBookingDays').value) || 7,
            cancellationPolicy: document.getElementById('cancellationPolicy').value
        };
    }

    // Update the max rental days limit based on the selected range on the calendar
    updateMaxRentalLimit() {
        const maxDaysInput = document.getElementById('maxRentalDays');
        if (!maxDaysInput || !this.startDate || !this.endDate) return;

        const start = new Date(this.startDate);
        const end = new Date(this.endDate);

        // Calculate the difference in days between start and end date
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end date

        // Update the max rental days input to reflect the selected range if it exceeds the current max
        maxDaysInput.max = diffDays;

        // Always set the max rental days input value to the max range after start/end date selection on calendar modal
        maxDaysInput.value = diffDays;
        // if (parseInt(maxDaysInput.value) > diffDays) {
        //     maxDaysInput.value = diffDays;
        // }

        const limitLabel = document.getElementById('maxDaysHint');
        if (limitLabel) {
            limitLabel.textContent = `(Max rental days allowed: ${diffDays} days)`;
        }
    }

    // Validate max rental days does not exceed selected range
    setupMaxDaysValidation() {
        const maxInput = document.getElementById('maxRentalDays');
        const errorMsg = document.getElementById('maxDaysError');

        if (!maxInput) return;

        maxInput.addEventListener('input', () => {
            const currentVal = parseInt(maxInput.value);
            const limit = parseInt(maxInput.getAttribute('max'));

            // Validate limit exists and if the current value exceeds the limit, show error and reset to max
            if (limit && currentVal > limit) {
                maxInput.value = limit; // Reset to max allowed value if user tries to exceed it

                // Show error message for 2 seconds
                errorMsg.classList.remove('d-none');
                maxInput.classList.add('is-invalid'); // Adds red border to indicate error

                setTimeout(() => {
                    errorMsg.classList.add('d-none');
                    maxInput.classList.remove('is-invalid');
                }, 2000);
            } else {
                errorMsg.classList.add('d-none');
                maxInput.classList.remove('is-invalid');
            }
        });
    }

    reset() {
        // Reset Data State
        this.startDate = null;
        this.endDate = null;
        this.selectedDates.clear();

        // Reset calendar visuals
        this.renderCalendar();

        // Reset booking settings inputs
        const hint = document.getElementById('maxDaysHint');
        if (hint) {
            hint.textContent = "Select a date range above to set limit.";
        } 

        // Reset max rental days input to default state of 1
        const maxInput = document.getElementById('maxRentalDays');
        if (maxInput) {
            maxInput.value = 1;
            maxInput.removeAttribute('max');
        }

        // Reset any error messages related to booking settings
        const errorMsg = document.getElementById('maxDaysError');
        if (errorMsg) {
            errorMsg.classList.add('d-none');
        }
        if (maxInput) {
            maxInput.classList.remove('is-invalid');
        }
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
                    window.rentalCalendar.reset();
                }
            });
        }
    // Handle form submission
    // const createListingForm = document.querySelector('#createListingModal form');
    // if (createListingForm) {
    //     createListingForm.addEventListener('submit', function(e) {
    //         e.preventDefault();
    //         const categorySelect = document.getElementById('itemCategory');
    //         if (!categorySelect || !categorySelect.value) {
    //             alert('Please select a category for your item.');
    //             return;
    //         }
    //         if (window.rentalCalendar) {
    //             const bookingData = window.rentalCalendar.getBookingData();

    //             // Validate that both start and end dates are selected
    //             if (!window.rentalCalendar.startDate || !window.rentalCalendar.endDate) {
    //                 alert('Please select both a start and end date on the calendar.');
    //                 return;
    //             }

    //             const formData = {
    //                 title: document.getElementById('itemTitle').value,
    //                 description: document.getElementById('itemDescription').value,
    //                 itemCategory: categorySelect.value,
    //                 dailyRate: document.getElementById('dailyRate').value,
    //                 location: document.getElementById('location').value,
    //                 contactPhone: document.getElementById('contactPhone').value,
    //                 startDate: window.rentalCalendar.startDate,
    //                 endDate: window.rentalCalendar.endDate,
    //                 maxRentalDays: document.getElementById('maxRentalDays').value,
    //                 bookingData: bookingData
    //             };
    //             console.log('Form Data:', formData);
    //             alert(`Listing created successfully! Category: ${categorySelect.value}`);
    //             // Close modal
    //             const modalInstance = bootstrap.Modal.getInstance(document.getElementById('createListingModal'));
    //             modalInstance.hide();
    //         }
    //     });
    // }
    });
} 