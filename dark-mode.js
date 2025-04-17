// Dark mode functionality
let darkMode = false;

// Function to toggle dark mode
function toggleDarkMode() {
    darkMode = !darkMode;
    applyDarkMode();
    // Save preference
    localStorage.setItem('darkMode', darkMode ? 'true' : 'false');
    
    // Update button text based on current state
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (darkModeToggle) {
        const icon = darkMode ? '☀️ ' : '🌙 ';
        const textSpan = darkModeToggle.querySelector('span[data-lang]');
        if (textSpan) {
            // Update the attribute to use the correct language key
            textSpan.setAttribute('data-lang', darkMode ? 'lightModeToggle' : 'darkModeToggle');
            // Update the text content based on current language
            textSpan.textContent = getText(darkMode ? 'lightModeToggle' : 'darkModeToggle');
        }
        // Set the icon
        darkModeToggle.innerHTML = icon + textSpan.outerHTML;
    }
}

// Function to apply dark mode styles
function applyDarkMode() {
    const root = document.documentElement;
    
    if (darkMode) {
        root.classList.add('dark-mode');
    } else {
        root.classList.remove('dark-mode');
    }
}

// Load saved dark mode preference
function loadDarkModePreference() {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode === 'true') {
        darkMode = true;
        applyDarkMode();
        
        // Update button text if it exists
        const darkModeToggle = document.getElementById('dark-mode-toggle');
        if (darkModeToggle) {
            const textSpan = darkModeToggle.querySelector('span[data-lang]');
            if (textSpan) {
                // Update the attribute to use the correct language key
                textSpan.setAttribute('data-lang', 'lightModeToggle');
                // Update the text content based on current language
                textSpan.textContent = getText('lightModeToggle');
            }
            // Set the icon
            darkModeToggle.innerHTML = '☀️ ' + textSpan.outerHTML;
        }
    }
}

// Initialize dark mode setting
document.addEventListener('DOMContentLoaded', loadDarkModePreference); 