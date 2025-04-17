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
let startTime = null;
let situations = [];
let distortions = [];
let selectedSituation = null;
let leaderboard = [];

// Cognitive Distortions Database
let cognitiveDistortions = [];
let baseSituations = [];

// Load cognitive distortions database
async function loadCognitiveDistortions() {
    try {
        // Use embedded data directly
        cognitiveDistortions = [
            {
                "id": 1,
                "name": "All-or-Nothing Thinking",
                "description": "Seeing things in black-and-white categories",
                "examples": [
                    {
                        "id": 101,
                        "text": "If I'm not perfect, I'm a complete failure.",
                        "difficulty": 2,
                        "context": "personal"
                    },
                    {
                        "id": 102,
                        "text": "If I don't get an A, I'm a total failure.",
                        "difficulty": 2,
                        "context": "academic"
                    },
                    {
                        "id": 103,
                        "text": "If I make one mistake, I'm completely incompetent.",
                        "difficulty": 2,
                        "context": "work"
                    }
                ]
            },
            {
                "id": 2,
                "name": "Overgeneralization",
                "description": "Viewing a negative event as a never-ending pattern of defeat",
                "examples": [
                    {
                        "id": 201,
                        "text": "I failed one test, so I'll fail all my classes.",
                        "difficulty": 2,
                        "context": "academic"
                    },
                    {
                        "id": 202,
                        "text": "One person didn't like my idea, so no one will.",
                        "difficulty": 2,
                        "context": "work"
                    },
                    {
                        "id": 203,
                        "text": "My partner forgot one thing, so they never remember anything.",
                        "difficulty": 2,
                        "context": "relationships"
                    }
                ]
            },
            {
                "id": 3,
                "name": "Mental Filter",
                "description": "Dwelling on negatives and ignoring positives",
                "examples": [
                    {
                        "id": 301,
                        "text": "I only remember the one negative comment in my performance review.",
                        "difficulty": 2,
                        "context": "work"
                    },
                    {
                        "id": 302,
                        "text": "I focus only on my mistakes and ignore my successes.",
                        "difficulty": 2,
                        "context": "personal"
                    },
                    {
                        "id": 303,
                        "text": "I only remember the times my partner was late, not the times they were on time.",
                        "difficulty": 2,
                        "context": "relationships"
                    }
                ]
            }
        ];
        
        // Create base situations from the examples in the database
        baseSituations = cognitiveDistortions.flatMap(distortion => 
            distortion.examples.map(example => ({
                id: example.id,
                text: example.text,
                distortionId: distortion.id,
                difficulty: example.difficulty,
                context: example.context
            }))
        );
    } catch (error) {
        console.error('Error loading cognitive distortions:', error);
        // Fallback to default values if loading fails
        cognitiveDistortions = [
            { id: 1, name: "All-or-Nothing Thinking", description: "Seeing things in black-and-white categories" },
            { id: 2, name: "Overgeneralization", description: "Viewing a negative event as a never-ending pattern of defeat" },
            { id: 3, name: "Mental Filter", description: "Dwelling on negatives and ignoring positives" }
        ];
        
        baseSituations = [
            { id: 1, text: "I failed my exam. I'll never be successful in anything.", distortionId: 2 },
            { id: 2, text: "My friend didn't text me back. They must hate me now.", distortionId: 2 },
            { id: 3, text: "I made a mistake at work. I'm completely incompetent.", distortionId: 1 }
        ];
    }
}

// Initialization
document.addEventListener('DOMContentLoaded', async () => {
    await loadCognitiveDistortions();
    initialize();
});

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
        // Get the SVG content from the selected avatar
        const avatarSvg = selectedAvatar.querySelector('svg');
        if (avatarSvg) {
            const profileAvatarContainer = document.getElementById('profile-avatar');
            profileAvatarContainer.innerHTML = '';
            profileAvatarContainer.appendChild(avatarSvg.cloneNode(true));
        }
    }
}

// Load user progress from database
async function loadUserProgress(username) {
    try {
        console.log('Loading progress for user:', username);
        const progress = await gameDB.getProgress(username);
        console.log('Retrieved progress:', progress);
        
        if (progress && progress.length > 0) {
            // Get the highest level completed
            const highestLevel = Math.max(...progress.map(p => p.level));
            console.log('Highest level completed:', highestLevel);
            unlockedLevels = Math.max(highestLevel + 1, 1); // Unlock next level
        } else {
            console.log('No progress found, starting at level 1');
            // New user - start with only level 1 unlocked
            unlockedLevels = 1;
        }
        console.log('Unlocked levels set to:', unlockedLevels);
    } catch (error) {
        console.error('Error loading user progress:', error);
        // On error, default to level 1
        unlockedLevels = 1;
    }
}

// Update level grid with database data
async function renderLevelGrid() {
    const levelGrid = document.getElementById('level-grid');
    levelGrid.innerHTML = '';
    
    const username = document.getElementById('logged-in-username').textContent;
    await loadUserProgress(username);
    
    console.log('Rendering level grid with unlocked levels:', unlockedLevels);
    
    for (let i = 1; i <= MAX_LEVELS; i++) {
        const levelItem = document.createElement('div');
        levelItem.className = `level-item ${i <= unlockedLevels ? 'unlocked' : 'locked'}`;
        levelItem.textContent = `Level ${i}`;
        
        if (i <= unlockedLevels) {
            levelItem.addEventListener('click', () => startLevel(i));
        } else {
            levelItem.style.cursor = 'not-allowed';
            levelItem.title = 'Complete previous levels to unlock';
        }
        
        levelGrid.appendChild(levelItem);
    }
}

// Update leaderboard with database data
async function renderLeaderboard() {
    const leaderboardBody = document.getElementById('leaderboard-body');
    if (!leaderboardBody) return; // Exit if element not found
    
    leaderboardBody.innerHTML = '';
    
    try {
        // Get all levels' leaderboard data
        const allLevelsData = [];
        for (let level = 1; level <= MAX_LEVELS; level++) {
            const levelData = await gameDB.getLeaderboard(level);
            allLevelsData.push(...levelData);
        }
        
        // Sort by level and time
        const sortedData = allLevelsData.sort((a, b) => {
            if (a.level !== b.level) {
                return a.level - b.level;
            }
            return a.time - b.time;
        });
        
        // Get top score for each level
        const topScores = {};
        sortedData.forEach(entry => {
            if (!topScores[entry.level] || entry.time < topScores[entry.level].time) {
                topScores[entry.level] = entry;
            }
        });
        
        // Display top scores
        Object.values(topScores).forEach(entry => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>Level ${entry.level}</td>
                <td>${entry.username}</td>
                <td>${entry.time}s</td>
            `;
            leaderboardBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading leaderboard:', error);
    }
}

// Game Functions
async function startLevel(level) {
    console.log('Starting level:', level);
    currentLevel = level;
    document.getElementById('current-level').textContent = level;
    
    // Reset game state
    score = 0;
    document.getElementById('score').textContent = score;
    
    // Generate situations and distortions for this level
    const { situations: levelSituations, distortions: levelDistortions } = generateLevelContent(level);
    
    // Update global variables
    situations = levelSituations;
    distortions = levelDistortions;
    
    document.getElementById('total-pairs').textContent = situations.length;
    
    // Render the game items
    renderGameItems();
    
    // Show game screen
    showScreen(gameScreen);
    
    // Start timer
    startTimer();
}

function generateLevelContent(level) {
    // Clear previous content
    situations = [];
    distortions = [];
    
    // Calculate number of items based on level
    const numItems = Math.min(3 + Math.floor(level / 2), 5);
    
    // For early levels (1-5), use all situations
    // For higher levels, filter by difficulty
    let eligibleSituations;
    if (level <= 5) {
        eligibleSituations = baseSituations;
    } else {
        const levelDifficulty = Math.min(Math.ceil(level / 3), 5);
        eligibleSituations = baseSituations.filter(s => s.difficulty <= levelDifficulty);
        
        // If no situations match the difficulty, use all situations
        if (eligibleSituations.length === 0) {
            console.log('No situations found for difficulty level, using all situations');
            eligibleSituations = baseSituations;
        }
    }
    
    console.log('Eligible situations:', eligibleSituations.length);
    
    if (eligibleSituations.length === 0) {
        console.error('No eligible situations found for level:', level);
        return { situations: [], distortions: [] };
    }
    
    // Select random situations
    const selectedSituations = shuffleArray([...eligibleSituations]).slice(0, numItems);
    
    // Get corresponding distortions
    const selectedDistortions = selectedSituations.map(s => {
        const distortion = cognitiveDistortions.find(d => d.id === s.distortionId);
        if (!distortion) {
            console.error('No distortion found for situation:', s);
            return null;
        }
        return distortion;
    }).filter(d => d !== null);
    
    if (selectedDistortions.length === 0) {
        console.error('No valid distortions found for selected situations');
        return { situations: [], distortions: [] };
    }
    
    // Make situations more ambiguous based on level
    situations = selectedSituations.map(s => ({
        ...s,
        text: makeMoreAmbiguous(s.text, level)
    }));
    
    // Shuffle distortions and add some distractors
    const allDistortions = [...selectedDistortions];
    const availableDistortions = cognitiveDistortions.filter(d => 
        !selectedDistortions.some(sd => sd && sd.id === d.id)
    );
    
    // Add distractors if needed and available
    while (allDistortions.length < numItems * 2 && availableDistortions.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableDistortions.length);
        const randomDistortion = availableDistortions[randomIndex];
        if (!allDistortions.some(d => d && d.id === randomDistortion.id)) {
            allDistortions.push(randomDistortion);
            // Remove the used distortion from available ones
            availableDistortions.splice(randomIndex, 1);
        }
    }
    
    distortions = shuffleArray(allDistortions);
    
    console.log('Generated content:', {
        situationsCount: situations.length,
        distortionsCount: distortions.length
    });
    
    return { situations, distortions };
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
    
    // Always start at 60 seconds
    timeLeft = DEFAULT_TIME_LIMIT;
    document.getElementById('time-left').textContent = timeLeft;
    
    // Record start time
    startTime = Date.now();
    
    // Start countdown
    timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById('time-left').textContent = timeLeft;
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            endLevel(false); // Level failed
        }
    }, 1000);
}

// End level and update leaderboard
async function endLevel(isCompleted) {
    console.log('Ending level:', currentLevel, 'Completed:', isCompleted);
    
    // Clear timer
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    // Calculate time used
    const endTime = Date.now();
    const timeUsed = Math.floor((endTime - startTime) / 1000);
    
    // Update level complete screen
    document.getElementById('completed-level').textContent = currentLevel;
    document.getElementById('time-used').textContent = timeUsed;
    document.getElementById('final-score').textContent = score;
    document.getElementById('max-score').textContent = situations.length;
    
    const username = document.getElementById('logged-in-username').textContent;
    
    // Always save progress if level was completed
    if (isCompleted) {
        try {
            console.log('Saving progress for level:', currentLevel);
            // Save progress to database
            await gameDB.saveProgress(username, currentLevel, score, timeUsed);
            
            // Update leaderboard
            await gameDB.addToLeaderboard(username, currentLevel, score, timeUsed);
            await renderLeaderboard();
            
            // Check if next level should be unlocked
            console.log('Current unlocked levels:', unlockedLevels);
            if (currentLevel === unlockedLevels && currentLevel < MAX_LEVELS) {
                unlockedLevels++;
                console.log('Unlocking level:', unlockedLevels);
                document.getElementById('level-unlocked').classList.remove('hidden');
                document.getElementById('unlocked-level').textContent = unlockedLevels;
                
                // Save the new unlocked level
                await gameDB.saveProgress(username, currentLevel, score, timeUsed);
            } else {
                document.getElementById('level-unlocked').classList.add('hidden');
            }
        } catch (error) {
            console.error('Error saving progress or updating leaderboard:', error);
        }
    } else {
        document.getElementById('level-unlocked').classList.add('hidden');
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

