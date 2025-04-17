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
    
    // Initialize language support
    loadLanguagePreference();
    
    // Initialize dark mode
    loadDarkModePreference();
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
    document.getElementById('create-user-btn').addEventListener('click', createUser);
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
    
    // Update text for current language whenever screen changes
    updatePageText();
    
    // Update button text based on dark mode state
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (darkModeToggle) {
        darkModeToggle.innerHTML = darkMode ? 
            '☀️ <span data-lang="lightModeToggle">' + getText('lightModeToggle') + '</span>' : 
            '🌙 <span data-lang="darkModeToggle">' + getText('darkModeToggle') + '</span>';
    }
}

// Authentication
function handleLogin(event) {
    if (event) {
        event.preventDefault();
    }
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const errorElement = document.getElementById('login-error');
    
    if (!username || !password) {
        errorElement.textContent = getText('pleaseEnterBoth');
        return;
    }
    
    // Check if user exists and password is correct
    const user = users.find(u => u.username === username && u.password === password);
    
    if (!user) {
        errorElement.textContent = getText('invalidCredentials');
        return;
    }
    
    // Store the username as a string in currentUser
    currentUser = username;
    console.log('Logged in as:', currentUser);
    
    // Update the logged-in username element
    const usernameElement = document.getElementById('logged-in-username');
    if (usernameElement) {
        usernameElement.textContent = username;
    } else {
        // Create the element if it doesn't exist
        const newElement = document.createElement('span');
        newElement.id = 'logged-in-username';
        newElement.style.display = 'none';
        newElement.textContent = username;
        document.body.appendChild(newElement);
        console.log('Created logged-in-username element');
    }
    
    // Set current profile if user has one
    if (user.profile) {
        currentProfile = user.profile;
    } else {
        // Set default profile values
        currentProfile = { 
            nickname: username,
            avatar: '1'
        };
    }
    
    // Update nickname display
    const profileNickname = document.getElementById('profile-nickname');
    if (profileNickname) {
        profileNickname.textContent = currentProfile.nickname || username;
    }
    
    // Make user info visible
    const userInfo = document.getElementById('user-info');
    if (userInfo) {
        userInfo.style.display = 'block';
    }
    
    // Show appropriate screen based on user type
    if (user.isAdmin) {
        showAdminScreen();
    } else {
        if (user.profile) {
            // User already has a profile, show level screen
            showLevelScreen();
        } else {
            // No profile, show profile setup screen
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

function createUser(event) {
    if (event) {
        event.preventDefault();
    }
    
    const usernameInput = document.getElementById('new-username');
    const passwordInput = document.getElementById('new-password');
    
    if (!usernameInput || !passwordInput) {
        console.error('New user form elements not found');
        return;
    }
    
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    
    if (!username || !password) {
        alert(getText('pleaseEnterBoth'));
        return;
    }
    
    if (users.some(u => u.username === username)) {
        alert(getText('userExists'));
        return;
    }
    
    // Add new user to users array
    const newUser = {
        username,
        password,
        isAdmin: false,
        profile: {
            nickname: username,
            avatar: '1'
        }
    };
    
    users.push(newUser);
    console.log('Added new user:', username);
    
    // Save data to localStorage as backup
    saveData();
    
    // Try to save to IndexedDB if available
    try {
        gameDB.addUser(username, password)
            .then(() => {
                // Save a default profile for the new user
                return gameDB.saveProfile(username, {
                    nickname: username,
                    avatar: '1'
                });
            })
            .then(() => {
                console.log('User and profile saved to database');
            })
            .catch(error => {
                console.error('Error saving user to database:', error);
            });
    } catch (error) {
        console.error('Error creating user in database:', error);
    }
    
    // Update admin view
    renderUserCredentials();
    
    // Clear form fields
    usernameInput.value = '';
    passwordInput.value = '';
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

function saveProfile(event) {
    if (event) {
        event.preventDefault();
    }
    
    const nickname = document.getElementById('nickname').value;
    const selectedAvatar = document.querySelector('.avatar.selected');
    
    if (!nickname) {
        alert(getText('pleaseEnterNickname'));
        return;
    }
    
    if (!selectedAvatar) {
        alert(getText('pleaseSelectAvatar'));
        return;
    }
    
    currentProfile.nickname = nickname;
    currentProfile.avatar = selectedAvatar.getAttribute('data-avatar');
    
    // Save profile to user
    const userIndex = users.findIndex(u => u.username === currentUser);
    users[userIndex].profile = currentProfile;
    
    saveData();
    showLevelScreen();
}

// Level Management
function showLevelScreen() {
    console.log('Showing level screen');
    
    // Display the level screen
    showScreen(levelScreen);
    
    try {
        // Update profile display if we have a profile
        if (currentProfile && currentProfile.nickname) {
            updateProfileDisplay();
        }
        
        // Always render level grid and leaderboard
        renderLevelGrid();
        renderLeaderboard();
    } catch (error) {
        console.error('Error in showLevelScreen:', error);
    }
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
        
        if (!username) {
            console.error('No username provided for loadUserProgress');
            return;
        }
        
        // Get user's progress from database or fallback to localStorage
        let progress = [];
        
        // Try to get progress from IndexedDB
        try {
            progress = await gameDB.getProgress(username);
            console.log('Progress from database:', progress);
        } catch (dbError) {
            console.warn('Error getting progress from database:', dbError);
            // Fallback to localStorage
            console.log('Using localStorage fallback for progress');
            const storedLevels = localStorage.getItem('unlockedLevels');
            if (storedLevels) {
                unlockedLevels = parseInt(storedLevels);
                return;
            }
        }
        
        // If no progress found, or progress is empty, keep default level 1
        if (!progress || progress.length === 0) {
            console.log('No progress found, keeping level 1 unlocked');
            return;
        }
        
        // Find the highest completed level
        const completedLevels = progress.filter(p => p.score > 0);
        if (completedLevels.length === 0) {
            console.log('No completed levels found, keeping level 1 unlocked');
            return;
        }
        
        const maxCompletedLevel = Math.max(...completedLevels.map(p => p.level));
        console.log('Max completed level:', maxCompletedLevel);
        
        // Unlock the next level (if not already at max level)
        unlockedLevels = Math.min(maxCompletedLevel + 1, MAX_LEVELS);
        console.log('Set unlockedLevels to:', unlockedLevels);
    } catch (error) {
        console.error('Error loading user progress (general):', error);
        // Default to level 1 on error (already set earlier)
    }
}

// Update level grid with database data
async function renderLevelGrid() {
    const levelGrid = document.getElementById('level-grid');
    if (!levelGrid) {
        console.error('Level grid element not found');
        return;
    }
    
    levelGrid.innerHTML = '';
    
    console.log('Rendering level grid - begin');
    
    // Get username from DOM or currentUser
    let username = '';
    const usernameElement = document.getElementById('logged-in-username');
    
    if (usernameElement && usernameElement.textContent) {
        username = usernameElement.textContent;
        console.log('Using username from DOM element:', username);
    } else if (currentUser) {
        // Handle both string and object formats of currentUser
        if (typeof currentUser === 'string') {
            username = currentUser;
        } else if (typeof currentUser === 'object' && currentUser.username) {
            username = currentUser.username;
        }
        console.log('Using username from currentUser:', username);
        
        // Create the username element if it doesn't exist
        if (!usernameElement) {
            const newElement = document.createElement('span');
            newElement.id = 'logged-in-username';
            newElement.style.display = 'none';
            newElement.textContent = username;
            document.body.appendChild(newElement);
            console.log('Created logged-in-username element with:', username);
        } else if (!usernameElement.textContent) {
            usernameElement.textContent = username;
            console.log('Updated logged-in-username element with:', username);
        }
    }
    
    // Ensure we have at least level 1 unlocked
    unlockedLevels = 1;
    
    try {
        // Only load user progress if we have a username
        if (username) {
            await loadUserProgress(username);
        } else {
            console.warn('No username available, defaulting to level 1 only');
        }
        
        console.log('Creating level grid with unlocked levels:', unlockedLevels);
        
        // Create level buttons for all levels
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
    } catch (error) {
        console.error('Error rendering level grid:', error);
        
        // Fallback: Always show at least level 1
        console.log('Using fallback to display level 1');
        const levelItem = document.createElement('div');
        levelItem.className = 'level-item unlocked';
        levelItem.textContent = 'Level 1';
        levelItem.addEventListener('click', () => startLevel(1));
        levelGrid.appendChild(levelItem);
    }
    
    console.log('Rendering level grid - complete');
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
    
    try {
        // Set current level
        currentLevel = level;
        const currentLevelElement = document.getElementById('current-level');
        if (currentLevelElement) {
            currentLevelElement.textContent = level;
        }
        
        // Reset game state
        score = 0;
        const scoreElement = document.getElementById('score');
        if (scoreElement) {
            scoreElement.textContent = '0';
        }
        
        // Generate situations and distortions for this level
        const { situations: levelSituations, distortions: levelDistortions } = generateLevelContent(level);
        
        // Update global variables
        situations = levelSituations;
        distortions = levelDistortions;
        
        // Update total pairs display
        const totalPairsElement = document.getElementById('total-pairs');
        if (totalPairsElement) {
            totalPairsElement.textContent = situations.length;
        }
        
        // Render the game items
        renderGameItems();
        
        // Show game screen
        showScreen(gameScreen);
        
        // Start timer
        startTimer();
    } catch (error) {
        console.error('Error starting level:', error);
        alert('There was an error starting the level. Please try again.');
        showLevelScreen();
    }
}

function generateLevelContent(level) {
    // Clear previous content
    situations = [];
    distortions = [];
    
    // Calculate number of items based on level progression
    // Levels 1-10: 3 items
    // Levels 11-15: 4 items
    // Levels 16-20: 5 items
    let numItems;
    if (level <= 10) {
        numItems = 3;
    } else if (level <= 15) {
        numItems = 4;
    } else {
        numItems = 5;
    }
    
    console.log('Number of items for level', level, ':', numItems);
    
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
    
    // Ensure we have enough situations for the level, even if we need to reuse some
    let availableSituations = [...eligibleSituations];
    if (availableSituations.length < numItems) {
        console.log('Not enough unique situations, reusing some');
        // Add situations repeatedly until we have enough
        while (availableSituations.length < numItems) {
            availableSituations = [...availableSituations, ...eligibleSituations];
        }
    }
    
    // Select random situations
    const selectedSituations = shuffleArray(availableSituations).slice(0, numItems);
    
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
    
    // For levels 1-10, we want exactly 3 distortions (matching the 3 situations)
    // For higher levels, show more options
    let totalDistortionsToShow;
    if (level <= 10) {
        // Just show the exact matches for early levels (3 vs 3)
        totalDistortionsToShow = numItems;
    } else {
        // For higher levels, show double the number of situations
        // This creates a 4 vs 8 or 5 vs 10 setup, making it harder
        totalDistortionsToShow = numItems * 2;
    }
    
    // Start with the correct matching distortions
    let allDistortions = [...selectedDistortions];
    
    // If we need more distortions (for higher levels), add distractors
    if (totalDistortionsToShow > selectedDistortions.length) {
        // Get distortions that are not used in the selected situations (for distractors)
        const unusedDistortions = cognitiveDistortions.filter(d => 
            !selectedDistortions.some(sd => sd && sd.id === d.id)
        );
        
        // If we have fewer unique distortions than we need, allow duplicates
        if (selectedDistortions.length + unusedDistortions.length < totalDistortionsToShow) {
            console.log('Not enough unique distortions, reusing some');
            
            // Add all unused distortions first
            allDistortions = [...allDistortions, ...unusedDistortions];
            
            // Then add duplicates of all distortions until we have enough
            const allAvailableDistortions = [...cognitiveDistortions];
            while (allDistortions.length < totalDistortionsToShow && allAvailableDistortions.length > 0) {
                // Shuffle to randomize which distortions get duplicated
                const shuffledDistortions = shuffleArray([...allAvailableDistortions]);
                for (const distortion of shuffledDistortions) {
                    if (allDistortions.length < totalDistortionsToShow) {
                        allDistortions.push(distortion);
                    } else {
                        break;
                    }
                }
            }
        } else {
            // Add distractors if needed and available
            while (allDistortions.length < totalDistortionsToShow && unusedDistortions.length > 0) {
                const randomIndex = Math.floor(Math.random() * unusedDistortions.length);
                const randomDistortion = unusedDistortions[randomIndex];
                allDistortions.push(randomDistortion);
                // Remove the used distortion from available ones
                unusedDistortions.splice(randomIndex, 1);
            }
        }
    }
    
    // Ensure we have exactly the right number of distortions
    if (allDistortions.length > totalDistortionsToShow) {
        allDistortions = allDistortions.slice(0, totalDistortionsToShow);
    }
    
    // Shuffle distortions
    distortions = shuffleArray(allDistortions);
    
    console.log('Generated content:', {
        situationsCount: situations.length,
        distortionsCount: distortions.length,
        expectedItems: numItems,
        level: level
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
        distortionEl.innerHTML = `<strong>${distortion.name}:</strong> ${distortion.description}`;
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



