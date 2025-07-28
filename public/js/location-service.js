class LocationService {
    constructor() {
        this.currentLocation = {
            city: 'Richmond',
            province: 'BC',
            coordinates: null,
            radius: 10
        };
        this.init();
    }

    init() {
        this.bindLocationEvents();
        this.loadSavedLocation();
        this.updateLocationDisplay();
    }

    bindLocationEvents() {
        // Location picker click event - bind to all location pickers on the page
        const locationPickers = document.querySelectorAll('.location-picker');
        locationPickers.forEach(locationPicker => {
            locationPicker.addEventListener('click', (e) => {
                e.preventDefault();
                this.showLocationModal();
            });
        });

        // Search functionality with location
        const searchInputs = document.querySelectorAll('.search-input');
        const searchButtons = document.querySelectorAll('.search-button');
        
        searchButtons.forEach(searchButton => {
            searchButton.addEventListener('click', () => {
                this.performSearch();
            });
        });

        searchInputs.forEach(searchInput => {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch();
                }
            });
        });
    }

    showLocationModal() {
        // Create location modal dynamically
        const modalHtml = `
            <div class="modal fade" id="locationModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Choose Your Location</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="mb-3">
                                <button class="btn btn-outline-primary w-100 mb-2" id="detectLocation">
                                    <i class="bi bi-geo-alt"></i> Detect My Location
                                </button>
                                <div id="locationStatus" class="text-muted small"></div>
                            </div>
                            
                            <div class="mb-3">
                                <label for="locationCity" class="form-label">City</label>
                                <input type="text" class="form-control" id="locationCity" placeholder="Enter city name">
                            </div>
                            
                            <div class="mb-3">
                                <label for="locationProvince" class="form-label">Province</label>
                                <select class="form-select" id="locationProvince">
                                    <option value="AB">Alberta</option>
                                    <option value="BC">British Columbia</option>
                                    <option value="MB">Manitoba</option>
                                    <option value="NB">New Brunswick</option>
                                    <option value="NL">Newfoundland and Labrador</option>
                                    <option value="NS">Nova Scotia</option>
                                    <option value="NT">Northwest Territories</option>
                                    <option value="NU">Nunavut</option>
                                    <option value="ON">Ontario</option>
                                    <option value="PE">Prince Edward Island</option>
                                    <option value="QC">Quebec</option>
                                    <option value="SK">Saskatchewan</option>
                                    <option value="YT">Yukon</option>
                                </select>
                            </div>
                            
                            <div class="mb-3">
                                <label for="locationRadius" class="form-label">Search Radius</label>
                                <select class="form-select" id="locationRadius">
                                    <option value="5">5 km</option>
                                    <option value="10" selected>10 km</option>
                                    <option value="25">25 km</option>
                                    <option value="50">50 km</option>
                                    <option value="100">100 km</option>
                                </select>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-primary" id="saveLocation">Save Location</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remove existing modal if any
        const existingModal = document.getElementById('locationModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('locationModal'));
        modal.show();

        // Bind modal events
        this.bindModalEvents();
    }

    bindModalEvents() {
        // Detect location button
        const detectBtn = document.getElementById('detectLocation');
        const statusDiv = document.getElementById('locationStatus');
        
        if (detectBtn) {
            detectBtn.addEventListener('click', () => {
                this.detectUserLocation(statusDiv, detectBtn);
            });
        }

        // Save location button
        const saveBtn = document.getElementById('saveLocation');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveLocation();
            });
        }

        // Load current location into form
        this.populateLocationForm();
    }

    detectUserLocation(statusDiv, detectBtn) {
        if (!navigator.geolocation) {
            statusDiv.innerHTML = '<span class="text-danger">Geolocation is not supported by this browser.</span>';
            return;
        }

        detectBtn.disabled = true;
        detectBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> Detecting...';
        statusDiv.innerHTML = 'Requesting location...';

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                this.currentLocation.coordinates = { latitude, longitude };
                
                // Reverse geocoding to get city name
                this.reverseGeocode(latitude, longitude, statusDiv, detectBtn);
            },
            (error) => {
                let errorMessage = 'Unable to retrieve your location.';
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = 'Location access denied. Please enable location services.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = 'Location information unavailable.';
                        break;
                    case error.TIMEOUT:
                        errorMessage = 'Location request timed out.';
                        break;
                }
                statusDiv.innerHTML = `<span class="text-danger">${errorMessage}</span>`;
                detectBtn.disabled = false;
                detectBtn.innerHTML = '<i class="bi bi-geo-alt"></i> Detect My Location';
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000
            }
        );
    }

    reverseGeocode(latitude, longitude, statusDiv, detectBtn) {
        // Using a free reverse geocoding service
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`;
        
        fetch(url)
            .then(response => response.json())
            .then(data => {
                const address = data.address;
                const city = address.city || address.town || address.village || address.county || 'Unknown City';
                const province = address.state || 'Unknown Province';
                
                // Update form fields
                document.getElementById('locationCity').value = city;
                document.getElementById('locationProvince').value = this.getProvinceCode(province);
                
                statusDiv.innerHTML = `<span class="text-success">Location detected: ${city}, ${province}</span>`;
                detectBtn.disabled = false;
                detectBtn.innerHTML = '<i class="bi bi-geo-alt"></i> Detect My Location';
                
                // Update current location
                this.currentLocation.city = city;
                this.currentLocation.province = this.getProvinceCode(province);
                this.currentLocation.coordinates = { latitude, longitude };
            })
            .catch(error => {
                statusDiv.innerHTML = '<span class="text-danger">Failed to get location details. Please enter manually.</span>';
                detectBtn.disabled = false;
                detectBtn.innerHTML = '<i class="bi bi-geo-alt"></i> Detect My Location';
            });
    }

    getProvinceCode(provinceName) {
        const provinceMap = {
            'Alberta': 'AB',
            'British Columbia': 'BC',
            'Manitoba': 'MB',
            'New Brunswick': 'NB',
            'Newfoundland and Labrador': 'NL',
            'Nova Scotia': 'NS',
            'Northwest Territories': 'NT',
            'Nunavut': 'NU',
            'Ontario': 'ON',
            'Prince Edward Island': 'PE',
            'Quebec': 'QC',
            'Saskatchewan': 'SK',
            'Yukon': 'YT'
        };
        return provinceMap[provinceName] || 'BC';
    }

    populateLocationForm() {
        const cityInput = document.getElementById('locationCity');
        const provinceSelect = document.getElementById('locationProvince');
        const radiusSelect = document.getElementById('locationRadius');
        
        if (cityInput) cityInput.value = this.currentLocation.city;
        if (provinceSelect) provinceSelect.value = this.currentLocation.province;
        if (radiusSelect) radiusSelect.value = this.currentLocation.radius || 10;
    }

    saveLocation() {
        const city = document.getElementById('locationCity').value;
        const province = document.getElementById('locationProvince').value;
        const radius = document.getElementById('locationRadius').value;

        if (!city.trim()) {
            alert('Please enter a city name.');
            return;
        }

        // Update current location
        this.currentLocation.city = city;
        this.currentLocation.province = province;
        this.currentLocation.radius = parseInt(radius);

        // Save to localStorage
        localStorage.setItem('rentall_location', JSON.stringify(this.currentLocation));

        // Update display
        this.updateLocationDisplay();

        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('locationModal'));
        modal.hide();

        // Show success message
        this.showLocationUpdateMessage();

        // Trigger location change event for other components
        this.triggerLocationChangeEvent();
    }

    loadSavedLocation() {
        const saved = localStorage.getItem('rentall_location');
        if (saved) {
            try {
                this.currentLocation = { ...this.currentLocation, ...JSON.parse(saved) };
            } catch (e) {
                console.error('Error loading saved location:', e);
            }
        }
    }

    updateLocationDisplay() {
        // Update all location pickers on the page
        const locationPickers = document.querySelectorAll('.location-picker');
        locationPickers.forEach(locationPicker => {
            locationPicker.innerHTML = `
                <i class="bi bi-geo-alt"></i>
                Near ${this.currentLocation.city}, ${this.currentLocation.province}
                <span class="text-secondary">(change)</span>
            `;
        });

        // Update any location-dependent content
        this.updateLocationDependentContent();
    }

    updateLocationDependentContent() {
        // Update search results count if it exists
        const resultsCount = document.querySelector('.mb-2.text-muted.small');
        if (resultsCount && resultsCount.textContent.includes('area')) {
            resultsCount.innerHTML = resultsCount.textContent.replace(
                /in the <b>.*?<\/b> area/,
                `in the <b>${this.currentLocation.city}</b> area`
            );
        }

        // Update any other location-dependent elements
        const locationElements = document.querySelectorAll('[data-location-dependent]');
        locationElements.forEach(element => {
            if (element.dataset.locationType === 'city') {
                element.textContent = this.currentLocation.city;
            } else if (element.dataset.locationType === 'province') {
                element.textContent = this.currentLocation.province;
            }
        });
    }

    showLocationUpdateMessage() {
        // Create a temporary success message
        const message = document.createElement('div');
        message.className = 'alert alert-success alert-dismissible fade show position-fixed';
        message.style.cssText = 'top: 20px; right: 20px; z-index: 9999; max-width: 300px;';
        message.innerHTML = `
            <i class="bi bi-check-circle"></i> Location updated to ${this.currentLocation.city}, ${this.currentLocation.province}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(message);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (message.parentNode) {
                message.remove();
            }
        }, 3000);
    }

    performSearch() {
        const searchInputs = document.querySelectorAll('.search-input');
        let searchTerm = '';
        
        // Get search term from any search input
        searchInputs.forEach(input => {
            if (input.value.trim()) {
                searchTerm = input.value.trim();
            }
        });
        
        if (!searchTerm) {
            alert('Please enter a search term.');
            return;
        }

        // Create search URL with location parameters
        const searchParams = new URLSearchParams({
            q: searchTerm,
            location: `${this.currentLocation.city}, ${this.currentLocation.province}`,
            radius: this.currentLocation.radius || 10
        });

        // For demo purposes, show search results in console
        console.log('Search performed:', {
            term: searchTerm,
            location: `${this.currentLocation.city}, ${this.currentLocation.province}`,
            radius: this.currentLocation.radius || 10,
            url: `search-view.html?${searchParams.toString()}`
        });

        // In a real application, you would redirect to search results page
        // window.location.href = `search-view.html?${searchParams.toString()}`;
        
        // For demo, show an alert
        alert(`Searching for "${searchTerm}" near ${this.currentLocation.city}, ${this.currentLocation.province}`);
    }

    getCurrentLocation() {
        return this.currentLocation;
    }

    triggerLocationChangeEvent() {
        // Dispatch a custom event that other components can listen to
        const event = new CustomEvent('locationChanged', {
            detail: { location: this.currentLocation }
        });
        document.dispatchEvent(event);
    }

    // Method to get nearby items based on location
    getNearbyItems() {
        // This would typically make an API call to get items near the current location
        return {
            location: this.currentLocation,
            items: [] // Would be populated from API
        };
    }
}

// Initialize location service when DOM is loaded
let locationService;
document.addEventListener('DOMContentLoaded', function() {
    locationService = new LocationService();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LocationService;
} 