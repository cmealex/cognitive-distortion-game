// DOM Elements
const loginScreen = document.getElementById('login-screen');
const adminScreen = document.getElementById('admin-screen');
const profileScreen = document.getElementById('profile-screen');
const levelScreen = document.getElementById('level-screen');
const gameScreen = document.getElementById('game-screen');
const levelCompleteScreen = document.getElementById('level-complete');

// Game Configuration
const MAX_LEVELS = 20;
const DEFAULT_TIME_LIMIT = 60; // seconds
const TIME_DECREASE_FACTOR = 2; // seconds to decrease per level
const MIN_TIME_LIMIT = 10; // minimum seconds allowed

// Define a list of valid users (this could be fetched from a database in real-world scenarios)
  const validUsers = [
    { username: 'admin', password: 'parola' },
    { username: 'test1', password: 'pass1' },
    { username: 'jane_smith', password: 'mypassword456' }
  ];
  
  
// Authentication & User Data
let users = [{
    username: 'admin',
    password: 'parola',
    isAdmin: true
}];

let currentUser = null;
let currentProfile = {
    nickname: '',
    avatar: 1
};

// Game State
let currentLevel = 1;
let unlockedLevels = 1;
let score = 0;
let timeLeft = DEFAULT_TIME_LIMIT;
let timerInterval = null;
let situations = [];
let distortions = [];
let selectedSituation = null;
let leaderboard = [];

// Cognitive Distortions Database
const cognitiveDistortions = [
    { id: 1, name: "All-or-Nothing Thinking", description: "Seeing things in black-and-white categories" },
    { id: 2, name: "Overgeneralization", description: "Viewing a negative event as a never-ending pattern of defeat" },
    { id: 3, name: "Mental Filter", description: "Dwelling on negatives and ignoring positives" },
    { id: 4, name: "Discounting the Positive", description: "Rejecting positive experiences" },
    { id: 5, name: "Jumping to Conclusions", description: "Making negative interpretations without evidence" },
    { id: 6, name: "Magnification or Minimization", description: "Exaggerating negatives or minimizing positives" },
    { id: 7, name: "Emotional Reasoning", description: "Believing something must be true because you feel it strongly" },
    { id: 8, name: "Should Statements", description: "Having rigid rules about how you or others should behave" },
    { id: 9, name: "Labeling", description: "Attaching a negative label to yourself or others instead of describing behavior" },
    { id: 10, name: "Personalization", description: "Seeing yourself as the cause of external negative events" }
];

// Situation Database - Base situations that will be modified based on level
const baseSituations = [
    { id: 1, text: "I failed my exam. I'll never be successful in anything.", distortionId: 2 },
    { id: 2, text: "My friend didn't text me back. They must hate me now.", distortionId: 5 },
    { id: 3, text: "I made a mistake at work. I'm completely incompetent.", distortionId: 1 },
    { id: 4, text: "She criticized one part of my presentation. The whole thing was a disaster.", distortionId: 3 },
    { id: 5, text: "I should always make everyone happy. If someone is upset, it's my fault.", distortionId: 10 },
    { id: 6, text: "My boss complimented my work, but they were just being nice. It wasn't really good.", distortionId: 4 },
    { id: 7, text: "I feel anxious about the meeting, so it's going to go terribly.", distortionId: 7 },
    { id: 8, text: "I must always perform perfectly. Making any mistake is unacceptable.", distortionId: 8 },
    { id: 9, text: "I got negative feedback. I'm a failure.", distortionId: 9 },
    { id: 10, text: "That small mistake ruined the entire project.", distortionId: 6 }
];

// Initialization
document.addEventListener('DOMContentLoaded', initialize);

function initialize() {
    // Load data from localStorage if available
    loadData();
    
    // Set up event listeners
    setupEventListeners();
    
    // Show login screen initially
    showScreen(loginScreen);
}

function setupEventListeners() {
    // Login
    document.getElementById('login-btn').addEventListener('click', handleLogin);
    
    // Admin
    //document.getElementById('create-user-btn').addEventListener('click', createUser);
    document.getElementById('admin-logout-btn').addEventListener('click', logout);
    
    // Profile
    document.querySelectorAll('.avatar').forEach(avatar => {
        avatar.addEventListener('click', selectAvatar);
    });
    document.getElementById('save-profile-btn').addEventListener('click', saveProfile);
    
    // Level Selection
    document.getElementById('logout-btn').addEventListener('click', logout);
    
    // Game
    document.getElementById('back-to-levels').addEventListener('click', backToLevels);
    
    // Level Complete
    document.getElementById('retry-btn').addEventListener('click', retryLevel);
    document.getElementById('next-level-btn').addEventListener('click', startNextLevel);
    document.getElementById('return-levels-btn').addEventListener('click', backToLevels);
}

// Data Management
function saveData() {
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('unlockedLevels', unlockedLevels);
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
}

function loadData() {
    const storedUsers = localStorage.getItem('users');
    if (storedUsers) {
        // Ensure admin always exists
        const parsedUsers = JSON.parse(storedUsers);
        const adminExists = parsedUsers.some(user => user.username === 'admin' && user.isAdmin);
        if (adminExists) {
            users = parsedUsers;
        } else {
            parsedUsers.push({
                username: 'admin',
                password: 'parola',
                isAdmin: true
            });
            users = parsedUsers;
        }
    }
    
    const storedLevels = localStorage.getItem('unlockedLevels');
    if (storedLevels) {
        unlockedLevels = parseInt(storedLevels);
    }
    
    const storedLeaderboard = localStorage.getItem('leaderboard');
    if (storedLeaderboard) {
        leaderboard = JSON.parse(storedLeaderboard);
    }
}

// Screen Management
function showScreen(screen) {
    const screens = [loginScreen, adminScreen, profileScreen, levelScreen, gameScreen, levelCompleteScreen];
    screens.forEach(s => s.classList.add('hidden'));
    screen.classList.remove('hidden');
}

// Authentication
function handleLogin() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorElement = document.getElementById('login-error');
    
    const user = users.find(u => u.username === username && u.password === password);
    
    if (!user) {
        errorElement.textContent = 'Invalid username or password';
        return;
    }
    
    currentUser = user;
    
    // Update the logged-in username display
    document.getElementById('logged-in-username').textContent = user.profile?.nickname || user.username;
    document.getElementById('user-info').style.display = 'block';
    
    if (user.isAdmin) {
        showAdminScreen();
    } else {
        if (user.profile) {
            currentProfile = user.profile;
            showLevelScreen();
        } else {
            showScreen(profileScreen);
        }
    }
}

function logout() {
    currentUser = null;
    currentProfile = { nickname: '', avatar: 1 };
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    document.getElementById('login-error').textContent = '';
    showScreen(loginScreen);
}

// Admin Functions
function showAdminScreen() {
    renderUserCredentials();
    showScreen(adminScreen);
}

function createUser() {
    const usernameInput = document.getElementById('new-username');
    const passwordInput = document.getElementById('new-password');
    
    console.log('Username input element:', usernameInput);
    console.log('Password input element:', passwordInput);
    
    const username = usernameInput ? usernameInput.value : 'not found';
    const password = passwordInput ? passwordInput.value : 'not found';
    
    console.log('Username value:', username);
    console.log('Password value:', password);
    
    if (!username || !password) {
        alert('Please enter both username and password');
        return;
    }
    
    if (users.some(u => u.username === username)) {
        alert('Username already exists');
        return;
    }
    
    users.push({
        username,
        password,
        isAdmin: false
    });
    
    saveData();
    renderUserCredentials();
    
    document.getElementById('new-username').value = '';
    document.getElementById('new-password').value = '';
}

function renderUserCredentials() {
    const credentialsList = document.getElementById('credentials-list');
    credentialsList.innerHTML = '';
    
    users.filter(u => !u.isAdmin).forEach(user => {
        const li = document.createElement('li');
        li.textContent = `Username: ${user.username}, Password: ${user.password}`;
        credentialsList.appendChild(li);
    });
}

// Profile Management
function selectAvatar(event) {
    // Remove selected class from all avatars
    document.querySelectorAll('.avatar').forEach(avatar => {
        avatar.classList.remove('selected');
        avatar.style.boxShadow = 'none';
        avatar.style.transform = 'scale(1)';
    });
    
    // Add selected class and visual feedback to clicked avatar
    const clickedAvatar = event.target.closest('.avatar');
    clickedAvatar.classList.add('selected');
    clickedAvatar.style.boxShadow = '0 0 0 4px #3a7bd5';
    clickedAvatar.style.transform = 'scale(1.05)';
    
    // Store the selected avatar ID
    currentProfile.avatar = clickedAvatar.getAttribute('data-avatar');
}

function saveProfile() {
    const nickname = document.getElementById('nickname').value;
    const selectedAvatar = document.querySelector('.avatar.selected');
    
    if (!nickname) {
        alert('Please enter a nickname');
        return;
    }
    
    if (!selectedAvatar) {
        alert('Please select an avatar');
        return;
    }
    
    currentProfile.nickname = nickname;
    currentProfile.avatar = selectedAvatar.getAttribute('data-avatar');
    
    // Save profile to user
    const userIndex = users.findIndex(u => u.username === currentUser.username);
    users[userIndex].profile = currentProfile;
    
    saveData();
    showLevelScreen();
}

// Level Management
function showLevelScreen() {
    updateProfileDisplay();
    renderLevelGrid();
    renderLeaderboard();
    showScreen(levelScreen);
}

function updateProfileDisplay() {
    document.getElementById('profile-nickname').textContent = currentProfile.nickname;
    
    // Get the selected avatar element
    const selectedAvatar = document.querySelector(`.avatar[data-avatar="${currentProfile.avatar}"]`);
    if (selectedAvatar) {
        // Clone the SVG content from the selected avatar
        const avatarSvg = selectedAvatar.querySelector('svg').cloneNode(true);
        const profileAvatarContainer = document.getElementById('profile-avatar');
        profileAvatarContainer.innerHTML = '';
        profileAvatarContainer.appendChild(avatarSvg);
    }
}

function renderLevelGrid() {
    const levelGrid = document.getElementById('level-grid');
    levelGrid.innerHTML = '';
    
    for (let i = 1; i <= MAX_LEVELS; i++) {
        const levelItem = document.createElement('div');
        levelItem.className = `level-item ${i <= unlockedLevels ? 'unlocked' : 'locked'}`;
        levelItem.textContent = `Level ${i}`;
        
        if (i <= unlockedLevels) {
            levelItem.addEventListener('click', () => startLevel(i));
        }
        
        levelGrid.appendChild(levelItem);
    }
}

function renderLeaderboard() {
    const leaderboardBody = document.getElementById('leaderboard-body');
    leaderboardBody.innerHTML = '';
    
    // Sort by level and then by time (ascending)
    const sortedLeaderboard = [...leaderboard].sort((a, b) => {
        if (a.level !== b.level) {
            return a.level - b.level;
        }
        return a.time - b.time;
    });
    
    // Get the top scores for each level
    const topScores = {};
    sortedLeaderboard.forEach(entry => {
        if (!topScores[entry.level] || entry.time < topScores[entry.level].time) {
            topScores[entry.level] = entry;
        }
    });
    
    // Render top scores
    Object.values(topScores).forEach(entry => {
        const row = document.createElement('tr');
        
        const levelCell = document.createElement('td');
        levelCell.textContent = `Level ${entry.level}`;
        
        const playerCell = document.createElement('td');
        playerCell.textContent = entry.player;
        
        const timeCell = document.createElement('td');
        timeCell.textContent = `${entry.time}s`;
        
        row.appendChild(levelCell);
        row.appendChild(playerCell);
        row.appendChild(timeCell);
        
        leaderboardBody.appendChild(row);
    });
}

// Game Functions
function startLevel(level) {
    currentLevel = level;
    score = 0;
    
    // Calculate time limit based on level
    timeLeft = Math.max(DEFAULT_TIME_LIMIT - (level - 1) * TIME_DECREASE_FACTOR, MIN_TIME_LIMIT);
    
    // Generate level content
    generateLevelContent(level);
    
    // Update UI
    document.getElementById('current-level').textContent = level;
    document.getElementById('time-left').textContent = timeLeft;
    document.getElementById('score').textContent = 0;
    document.getElementById('total-pairs').textContent = situations.length;
    
    // Show game screen
    showScreen(gameScreen);
    
    // Start timer
    startTimer();
}

function generateLevelContent(level) {
    // Select random situations for this level
    const numPairs = 3; // Fixed at 3 pairs per level
    const selectedSituations = [];
    const usedIndices = new Set();
    
    // Select unique situations
    while (selectedSituations.length < numPairs) {
        const index = Math.floor(Math.random() * baseSituations.length);
        if (!usedIndices.has(index)) {
            usedIndices.add(index);
            selectedSituations.push({...baseSituations[index]});
        }
    }
    
    // Modify situations based on level difficulty
    situations = selectedSituations.map(situation => {
        let modifiedSituation = {...situation};
        
        if (level > 10) {
            // Make situations more ambiguous for higher levels
            modifiedSituation.text = makeMoreAmbiguous(situation.text, level);
        }
        
        return modifiedSituation;
    });
    
    // Get corresponding distortions
    distortions = situations.map(situation => {
        return cognitiveDistortions.find(d => d.id === situation.distortionId);
    });
    
    // Shuffle distortions
    distortions = shuffleArray([...distortions]);
    
    // Render situations and distortions
    renderGameItems();
}

function makeMoreAmbiguous(text, level) {
    // Levels 11-20: progressively make situations more ambiguous
    const ambiguityLevel = (level - 10) / 10; // 0.1 to 1.0
    
    // Add ambiguity based on level
    if (ambiguityLevel > 0.8) {
        // Very ambiguous (levels 18-20)
        return text.replace(/never|always|completely|totally/gi, 'sometimes').replace(/must|should/gi, 'might');
    } else if (ambiguityLevel > 0.5) {
        // Moderately ambiguous (levels 15-17)
        return text.replace(/never|always/gi, 'often').replace(/completely|totally/gi, 'largely');
    } else if (ambiguityLevel > 0.2) {
        // Slightly ambiguous (levels 12-14)
        return text.replace(/completely|totally/gi, 'somewhat');
    } else {
        // Minimal ambiguity (level 11)
        return text.replace(/never/gi, 'rarely');
    }
}

function renderGameItems() {
    const situationsContainer = document.getElementById('situations-container');
    const distortionsContainer = document.getElementById('distortions-container');
    
    situationsContainer.innerHTML = '';
    distortionsContainer.innerHTML = '';
    
    // Render situations
    situations.forEach((situation, index) => {
        const situationEl = document.createElement('div');
        situationEl.className = 'situation-item';
        situationEl.textContent = situation.text;
        situationEl.dataset.id = situation.id;
        situationEl.dataset.index = index;
        
        situationEl.addEventListener('click', () => selectSituationItem(situationEl, index));
        
        situationsContainer.appendChild(situationEl);
    });
    
    // Render distortions
    distortions.forEach((distortion, index) => {
        const distortionEl = document.createElement('div');
        distortionEl.className = 'distortion-item';
        distortionEl.innerHTML = `<strong>${distortion.name}</strong>: ${distortion.description}`;
        distortionEl.dataset.id = distortion.id;
        distortionEl.dataset.index = index;
        
        distortionEl.addEventListener('click', () => matchItems(distortionEl, index));
        
        distortionsContainer.appendChild(distortionEl);
    });
}

function selectSituationItem(element, index) {
    // Remove selected class from all situations
    document.querySelectorAll('.situation-item').forEach(item => {
        item.classList.remove('selected');
    });
    
    // Add selected class to clicked situation
    element.classList.add('selected');
    
    // Store selected situation
    selectedSituation = situations[index];
}

function matchItems(distortionElement, distortionIndex) {
    // If no situation is selected, do nothing
    if (!selectedSituation) {
        return;
    }
    
    const distortion = distortions[distortionIndex];
    const isMatch = selectedSituation.distortionId === distortion.id;
    
    if (isMatch) {
        // Find the selected situation element
        const situationElement = document.querySelector(`.situation-item[data-id="${selectedSituation.id}"]`);
        
        // Add success indicators
        situationElement.innerHTML += '<span class="match-indicator correct">✓</span>';
        distortionElement.innerHTML += '<span class="match-indicator correct">✓</span>';
        
        // Remove click handlers
        situationElement.style.pointerEvents = 'none';
        distortionElement.style.pointerEvents = 'none';
        
        // Fade out after a short delay
        setTimeout(() => {
            situationElement.style.opacity = '0.5';
            distortionElement.style.opacity = '0.5';
        }, 1000);
        
        // Increment score
        score++;
        document.getElementById('score').textContent = score;
        
        // Check if level is complete
        if (score >= situations.length) {
            endLevel(true);
        }
    } else {
        // Show incorrect indicator
        distortionElement.classList.add('incorrect');
        
        // Add X mark temporarily
        const incorrectMark = document.createElement('span');
        incorrectMark.className = 'match-indicator incorrect';
        incorrectMark.textContent = '✗';
        distortionElement.appendChild(incorrectMark);
        
        // Remove incorrect indicator after animation
        setTimeout(() => {
            distortionElement.classList.remove('incorrect');
            incorrectMark.remove();
        }, 1000);
    }
    
    // Reset selected situation
    selectedSituation = null;
    document.querySelectorAll('.situation-item').forEach(item => {
        item.classList.remove('selected');
    });
}

function startTimer() {
    // Clear any existing timer
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    const timeLeftElement = document.getElementById('time-left');
    timeLeftElement.textContent = timeLeft;
    
    timerInterval = setInterval(() => {
        timeLeft--;
        timeLeftElement.textContent = timeLeft;
        
        if (timeLeft <= 0) {
            endLevel(false);
        }
    }, 1000);
}

function endLevel(isCompleted) {
    // Clear timer
    clearInterval(timerInterval);
    
    // Calculate time used
    const timeUsed = DEFAULT_TIME_LIMIT - timeLeft;
    
    // Update level complete screen
    document.getElementById('completed-level').textContent = currentLevel;
    document.getElementById('time-used').textContent = timeUsed;
    document.getElementById('final-score').textContent = score;
    document.getElementById('max-score').textContent = situations.length;
    
    // Check if next level should be unlocked
    const unlockNextLevel = isCompleted && currentLevel === unlockedLevels && currentLevel < MAX_LEVELS;
    
    if (unlockNextLevel) {
        unlockedLevels++;
        document.getElementById('level-unlocked').classList.remove('hidden');
        document.getElementById('unlocked-level').textContent = unlockedLevels;
        saveData();
    } else {
        document.getElementById('level-unlocked').classList.add('hidden');
    }
    
    // Update leaderboard if completed
    if (isCompleted) {
        leaderboard.push({
            level: currentLevel,
            player: currentProfile.nickname,
            time: timeUsed,
            score: score
        });
        saveData();
    }
    
    // Show/hide next level button
    if (currentLevel < MAX_LEVELS) {
        document.getElementById('next-level-btn').classList.remove('hidden');
    } else {
        document.getElementById('next-level-btn').classList.add('hidden');
    }
    
    // Show level complete screen
    showScreen(levelCompleteScreen);
}

function retryLevel() {
    startLevel(currentLevel);
}

function startNextLevel() {
    if (currentLevel < MAX_LEVELS) {
        startLevel(currentLevel + 1);
    }
}

function backToLevels() {
    // Clear timer if active
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    showLevelScreen();
}

// Utility Functions
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

