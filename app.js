// Travel Website Application Logic

class TravelApp {
    constructor() {
        this.currentUser = null;
        this.currentPage = 'home';
        this.bookedTrips = [];
        this.isVideoCallActive = false;
        this.audioMuted = false;
        this.videoMuted = false;
        this.carouselIndex = 0;
        this.carouselItems = 6;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        
        // Restore user session from localStorage if available
        const userRestored = this.restoreUserSession();
        
        // Only show home page if no user session was restored
        if (!userRestored) {
            this.showPage('home-page');
        }
        
        // Initialize with some demo trips
        this.bookedTrips = [
            {
                id: 1,
                destination: 'Paris, France',
                travelDate: '2024-03-15',
                returnDate: '2024-03-22',
                travelers: 2,
                status: 'Confirmed'
            },
            {
                id: 2,
                destination: 'Tokyo, Japan',
                travelDate: '2024-05-10',
                returnDate: '2024-05-18',
                travelers: 1,
                status: 'Pending'
            }
        ];
    }
    
    restoreUserSession() {
        try {
            const storedUser = localStorage.getItem('currentUser');
            if (storedUser) {
                this.currentUser = JSON.parse(storedUser);
                
                // Update user display based on restored role
                const nameElement = document.getElementById(`${this.currentUser.role}-name`);
                if (nameElement) {
                    nameElement.textContent = this.currentUser.name;
                }
                
                // Show appropriate dashboard
                this.showPage(`${this.currentUser.role}-dashboard`);
                
                // Show incoming call notification for agents after 3 seconds
                if (this.currentUser.role === 'agent') {
                    setTimeout(() => {
                        this.showIncomingCall();
                    }, 3000);
                }
                
                return true; // User session was successfully restored
            }
        } catch (error) {
            console.error('Error restoring user session:', error);
            // Clear corrupted data
            localStorage.removeItem('currentUser');
        }
        
        return false; // No user session was restored
    }
    
    setupEventListeners() {
        // Login modal triggers
        document.getElementById('login-trigger').addEventListener('click', () => {
            this.showLoginModal();
        });
        
        document.getElementById('close-login-modal').addEventListener('click', () => {
            this.hideLoginModal();
        });
        
        // Unified login form submission
        document.getElementById('unified-login').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });
        
        // Carousel controls
        document.getElementById('prev-btn').addEventListener('click', () => {
            this.previousSlide();
        });
        
        document.getElementById('next-btn').addEventListener('click', () => {
            this.nextSlide();
        });
        
        // Logout buttons
        document.getElementById('customer-logout').addEventListener('click', () => {
            this.logout();
        });
        
        document.getElementById('agent-logout').addEventListener('click', () => {
            this.logout();
        });
        
        // Dashboard tab switching
        const dashTabButtons = document.querySelectorAll('.dash-tab-btn');
        dashTabButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchDashboardTab(e.target.dataset.tab);
            });
        });
        
        // Booking functionality
        document.getElementById('book-now').addEventListener('click', () => {
            this.bookTrip();
        });
        
        // Video chat functionality
        document.getElementById('start-video-chat').addEventListener('click', () => {
            this.startVideoChat();
        });
        
        // Agent call handling
        document.getElementById('accept-call').addEventListener('click', () => {
            this.acceptCall();
        });
        
        document.getElementById('decline-call').addEventListener('click', () => {
            this.declineCall();
        });
        
        // Video chat controls
        document.getElementById('close-video-chat').addEventListener('click', () => {
            this.endVideoChat();
        });
        
        document.getElementById('mute-audio').addEventListener('click', () => {
            this.toggleAudio();
        });
        
        document.getElementById('mute-video').addEventListener('click', () => {
            this.toggleVideo();
        });
        
        document.getElementById('end-call').addEventListener('click', () => {
            this.endVideoChat();
        });
        
        // Modal close on outside click
        document.getElementById('login-modal').addEventListener('click', (e) => {
            if (e.target.id === 'login-modal') {
                this.hideLoginModal();
            }
        });
        
        document.getElementById('video-chat-modal').addEventListener('click', (e) => {
            if (e.target.id === 'video-chat-modal') {
                this.endVideoChat();
            }
        });
    }
    
    // Login Modal Functions
    showLoginModal() {
        document.getElementById('login-modal').classList.add('active');
    }
    
    hideLoginModal() {
        document.getElementById('login-modal').classList.remove('active');
        
        // Clear form
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
    }
    
    // Carousel Functions
    updateCarousel() {
        const track = document.getElementById('carousel-track');
        const cardWidth = 300 + 24; // card width + gap
        const translateX = -this.carouselIndex * cardWidth;
        track.style.transform = `translateX(${translateX}px)`;
        
        // Update button states
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        
        prevBtn.disabled = this.carouselIndex === 0;
        nextBtn.disabled = this.carouselIndex >= this.carouselItems - 3; // Show 3 cards at a time
    }
    
    nextSlide() {
        if (this.carouselIndex < this.carouselItems - 3) {
            this.carouselIndex++;
            this.updateCarousel();
        }
    }
    
    previousSlide() {
        if (this.carouselIndex > 0) {
            this.carouselIndex--;
            this.updateCarousel();
        }
    }
    
    // Removed switchLoginTab method as we now have a unified login form
    
    switchDashboardTab(tab) {
        // Update tab buttons
        document.querySelectorAll('.dash-tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
        
        // Update content
        document.querySelectorAll('.dashboard-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tab).classList.add('active');
        
        // Load specific content
        if (tab === 'my-trips') {
            this.loadTrips();
        }
    }
    
    handleLogin() {
        const usernameField = document.getElementById('username');
        const passwordField = document.getElementById('password');
        
        const username = usernameField.value.trim();
        const password = passwordField.value.trim();
        
        // Define all valid accounts with their roles
        const validAccounts = {
            'customer': { password: 'password123', role: 'customer', name: 'John Doe' },
            'agent': { password: 'password123', role: 'agent', name: 'Agent Smith' },
            'customer1': { password: 'password123', role: 'customer', name: 'Jane Smith' },
            'customer2': { password: 'password123', role: 'customer', name: 'Bob Johnson' },
            'agent1': { password: 'password123', role: 'agent', name: 'Sarah Wilson' },
            'agent2': { password: 'password123', role: 'agent', name: 'Mike Davis' }
        };
        
        // Check if the username exists and password is correct
        if (validAccounts[username] && validAccounts[username].password === password) {
            const account = validAccounts[username];
            
            this.currentUser = {
                username: username,
                role: account.role,
                name: account.name
            };
            
            // Store currentUser information in localStorage for SDK usage
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            
            // Update user display based on actual role
            const nameElement = document.getElementById(`${account.role}-name`);
            if (nameElement) {
                nameElement.textContent = this.currentUser.name;
            }
            
            // Hide login modal and show appropriate dashboard
            this.hideLoginModal();
            this.showPage(`${account.role}-dashboard`);
            
            // Clear form
            usernameField.value = '';
            passwordField.value = '';
            
            // Show incoming call notification for agents after 3 seconds
            if (account.role === 'agent') {
                setTimeout(() => {
                    this.showIncomingCall();
                }, 3000);
            }
            
        } else {
            // Enhanced error message with available accounts
            const availableAccounts = Object.keys(validAccounts).map(username => {
                const role = validAccounts[username].role;
                return `${username} (${role})`;
            }).join(', ');
            
            alert(`Invalid credentials.\n\nAvailable demo accounts:\n${availableAccounts}\n\nPassword for all accounts: password123`);
        }
    }
    
    logout() {
        this.currentUser = null;
        
        // Clear currentUser information from localStorage
        localStorage.removeItem('currentUser');
        
        this.showPage('home-page');
        
        // Hide incoming call notification
        this.hideIncomingCall();
    }
    
    showPage(pageId) {
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        document.getElementById(pageId).classList.add('active');
        this.currentPage = pageId;
    }
    
    bookTrip() {
        const destination = document.getElementById('destination').value;
        const travelDate = document.getElementById('travel-date').value;
        const returnDate = document.getElementById('return-date').value;
        const travelers = document.getElementById('travelers').value;
        
        if (!destination || !travelDate || !returnDate || !travelers) {
            alert('Please fill in all fields to book your trip.');
            return;
        }
        
        if (new Date(travelDate) >= new Date(returnDate)) {
            alert('Return date must be after travel date.');
            return;
        }
        
        const trip = {
            id: this.bookedTrips.length + 1,
            destination: document.querySelector(`#destination option[value="${destination}"]`).textContent,
            travelDate,
            returnDate,
            travelers: parseInt(travelers),
            status: 'Confirmed'
        };
        
        this.bookedTrips.push(trip);
        
        // Clear form
        document.getElementById('destination').value = '';
        document.getElementById('travel-date').value = '';
        document.getElementById('return-date').value = '';
        document.getElementById('travelers').value = '1';
        
        alert('Trip booked successfully! You can view it in the "My Trips" section.');
        
        // Switch to My Trips tab
        this.switchDashboardTab('my-trips');
    }
    
    loadTrips() {
        const tripsList = document.getElementById('trips-list');
        
        if (this.bookedTrips.length === 0) {
            tripsList.innerHTML = '<p style="text-align: center; color: var(--velvet-grey); margin-top: 2rem;">No trips booked yet. Book your first trip!</p>';
            return;
        }
        
        tripsList.innerHTML = this.bookedTrips.map(trip => `
            <div class="trip-card">
                <h3>${trip.destination}</h3>
                <p><strong>Travel Date:</strong> ${this.formatDate(trip.travelDate)}</p>
                <p><strong>Return Date:</strong> ${this.formatDate(trip.returnDate)}</p>
                <p><strong>Travelers:</strong> ${trip.travelers}</p>
                <p><strong>Status:</strong> <span style="color: ${trip.status === 'Confirmed' ? 'var(--mantis)' : 'var(--passion-fruit)'};">${trip.status}</span></p>
            </div>
        `).join('');
    }
    
    formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }
    
    showIncomingCall() {
        const notification = document.getElementById('incoming-call');
        notification.style.display = 'block';
    }
    
    hideIncomingCall() {
        const notification = document.getElementById('incoming-call');
        notification.style.display = 'none';
    }
    
    acceptCall() {
        this.hideIncomingCall();
        this.startVideoChat();
    }
    
    declineCall() {
        this.hideIncomingCall();
        alert('Call declined. The customer will be notified.');
    }
    
    startVideoChat() {
        const modal = document.getElementById('video-chat-modal');
        const loader = document.getElementById('video-loader');
        const chatWindow = document.getElementById('video-chat-window');
        
        // Show modal with loader
        modal.classList.add('active');
        loader.style.display = 'flex';
        chatWindow.classList.remove('active');
        
        // Simulate connection delay (3 seconds)
        setTimeout(() => {
            loader.style.display = 'none';
            chatWindow.classList.add('active');
            this.isVideoCallActive = true;
            
            // Initialize video chat UI
            this.initializeVideoChat();
        }, 3000);
    }
    
    initializeVideoChat() {
        // Reset video chat controls
        this.audioMuted = false;
        this.videoMuted = false;
        
        this.updateVideoControls();
        
        // Simulate video streams (placeholder functionality)
        const localVideo = document.getElementById('local-video');
        const remoteVideo = document.getElementById('remote-video');
        
        // Add placeholder text to video elements
        if (!localVideo.src) {
            localVideo.style.background = 'linear-gradient(45deg, #333, #666)';
            localVideo.style.display = 'flex';
            localVideo.style.alignItems = 'center';
            localVideo.style.justifyContent = 'center';
            localVideo.innerHTML = '<div style="color: white; text-align: center; font-size: 12px;">Local Video<br/>(You)</div>';
        }
        
        if (!remoteVideo.src) {
            remoteVideo.style.background = 'linear-gradient(45deg, #222, #555)';
            remoteVideo.style.display = 'flex';
            remoteVideo.style.alignItems = 'center';
            remoteVideo.style.justifyContent = 'center';
            remoteVideo.innerHTML = '<div style="color: white; text-align: center; font-size: 16px;">Remote Video<br/>(Other Participant)</div>';
        }
    }
    
    toggleAudio() {
        this.audioMuted = !this.audioMuted;
        this.updateVideoControls();
        
        // Here you would implement actual audio muting with WebRTC
        console.log(`Audio ${this.audioMuted ? 'muted' : 'unmuted'}`);
    }
    
    toggleVideo() {
        this.videoMuted = !this.videoMuted;
        this.updateVideoControls();
        
        const localVideo = document.getElementById('local-video');
        if (this.videoMuted) {
            localVideo.style.background = '#333';
            localVideo.innerHTML = '<div style="color: white; text-align: center; font-size: 12px;">Video Off</div>';
        } else {
            localVideo.style.background = 'linear-gradient(45deg, #333, #666)';
            localVideo.innerHTML = '<div style="color: white; text-align: center; font-size: 12px;">Local Video<br/>(You)</div>';
        }
        
        // Here you would implement actual video muting with WebRTC
        console.log(`Video ${this.videoMuted ? 'muted' : 'unmuted'}`);
    }
    
    updateVideoControls() {
        const audioBtn = document.getElementById('mute-audio');
        const videoBtn = document.getElementById('mute-video');
        
        // Update audio button
        if (this.audioMuted) {
            audioBtn.classList.add('active');
            audioBtn.querySelector('.icon').textContent = '🔇';
            audioBtn.querySelector('.label').textContent = 'Unmute Audio';
        } else {
            audioBtn.classList.remove('active');
            audioBtn.querySelector('.icon').textContent = '🔊';
            audioBtn.querySelector('.label').textContent = 'Mute Audio';
        }
        
        // Update video button
        if (this.videoMuted) {
            videoBtn.classList.add('active');
            videoBtn.querySelector('.icon').textContent = '📹';
            videoBtn.querySelector('.label').textContent = 'Unmute Video';
        } else {
            videoBtn.classList.remove('active');
            videoBtn.querySelector('.icon').textContent = '📹';
            videoBtn.querySelector('.label').textContent = 'Mute Video';
        }
    }
    
    endVideoChat() {
        const modal = document.getElementById('video-chat-modal');
        const chatWindow = document.getElementById('video-chat-window');
        
        modal.classList.remove('active');
        chatWindow.classList.remove('active');
        this.isVideoCallActive = false;
        
        // Reset video elements
        const localVideo = document.getElementById('local-video');
        const remoteVideo = document.getElementById('remote-video');
        
        localVideo.innerHTML = '';
        localVideo.style.background = '#000';
        remoteVideo.innerHTML = '';
        remoteVideo.style.background = '#000';
        
        // Reset controls
        this.audioMuted = false;
        this.videoMuted = false;
        this.updateVideoControls();
        
        console.log('Video chat ended');
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new TravelApp();
    
    // Initialize carousel
    app.updateCarousel();
    
    // Auto-scroll carousel every 5 seconds
    setInterval(() => {
        if (app.carouselIndex < app.carouselItems - 3) {
            app.nextSlide();
        } else {
            app.carouselIndex = 0;
            app.updateCarousel();
        }
    }, 5000);
});

// Utility functions for date handling
function setMinDate() {
    const today = new Date().toISOString().split('T')[0];
    const travelDateInput = document.getElementById('travel-date');
    const returnDateInput = document.getElementById('return-date');
    
    if (travelDateInput) {
        travelDateInput.min = today;
        travelDateInput.addEventListener('change', () => {
            const travelDate = travelDateInput.value;
            if (travelDate) {
                const nextDay = new Date(travelDate);
                nextDay.setDate(nextDay.getDate() + 1);
                returnDateInput.min = nextDay.toISOString().split('T')[0];
            }
        });
    }
}

// Set minimum dates when DOM loads
document.addEventListener('DOMContentLoaded', setMinDate);
