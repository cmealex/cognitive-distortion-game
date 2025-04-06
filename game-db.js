// Database name and version
const DB_NAME = 'CognitiveDistortionGameDB';
const DB_VERSION = 1;

// Store names
const STORES = {
    USERS: 'users',
    PROFILES: 'profiles',
    PROGRESS: 'progress',
    LEADERBOARD: 'leaderboard'
};

// Database instance
let db = null;

// Initialize the database
function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
            console.error('Database error:', request.error);
            reject(request.error);
        };

        request.onsuccess = () => {
            db = request.result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;

            // Create users store
            if (!db.objectStoreNames.contains(STORES.USERS)) {
                const usersStore = db.createObjectStore(STORES.USERS, { keyPath: 'username' });
                usersStore.createIndex('username', 'username', { unique: true });
            }

            // Create profiles store
            if (!db.objectStoreNames.contains(STORES.PROFILES)) {
                const profilesStore = db.createObjectStore(STORES.PROFILES, { keyPath: 'username' });
                profilesStore.createIndex('username', 'username', { unique: true });
            }

            // Create progress store
            if (!db.objectStoreNames.contains(STORES.PROGRESS)) {
                const progressStore = db.createObjectStore(STORES.PROGRESS, { keyPath: 'id', autoIncrement: true });
                progressStore.createIndex('username', 'username');
                progressStore.createIndex('level', 'level');
            }

            // Create leaderboard store
            if (!db.objectStoreNames.contains(STORES.LEADERBOARD)) {
                const leaderboardStore = db.createObjectStore(STORES.LEADERBOARD, { keyPath: 'id', autoIncrement: true });
                leaderboardStore.createIndex('level', 'level');
                leaderboardStore.createIndex('score', 'score');
            }
        };
    });
}

// User management functions
async function addUser(username, password, isAdmin = false) {
    const transaction = db.transaction(STORES.USERS, 'readwrite');
    const store = transaction.objectStore(STORES.USERS);
    
    return new Promise((resolve, reject) => {
        // First check if user exists
        const checkRequest = store.get(username);
        checkRequest.onsuccess = () => {
            if (checkRequest.result) {
                reject(new Error('Username already exists'));
                return;
            }
            
            // If user doesn't exist, add them
            const addRequest = store.add({ username, password, isAdmin });
            addRequest.onsuccess = () => resolve();
            addRequest.onerror = () => reject(addRequest.error);
        };
        checkRequest.onerror = () => reject(checkRequest.error);
    });
}

async function getUser(username) {
    const transaction = db.transaction(STORES.USERS, 'readonly');
    const store = transaction.objectStore(STORES.USERS);
    
    return new Promise((resolve, reject) => {
        const request = store.get(username);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function listUsers() {
    const transaction = db.transaction(STORES.USERS, 'readonly');
    const store = transaction.objectStore(STORES.USERS);
    
    return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// Profile management functions
async function saveProfile(username, profile) {
    const transaction = db.transaction(STORES.PROFILES, 'readwrite');
    const store = transaction.objectStore(STORES.PROFILES);
    
    return new Promise((resolve, reject) => {
        const request = store.put({ username, ...profile });
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

async function getProfile(username) {
    const transaction = db.transaction(STORES.PROFILES, 'readonly');
    const store = transaction.objectStore(STORES.PROFILES);
    
    return new Promise((resolve, reject) => {
        const request = store.get(username);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// Progress management functions
async function saveProgress(username, level, score, time) {
    const transaction = db.transaction(STORES.PROGRESS, 'readwrite');
    const store = transaction.objectStore(STORES.PROGRESS);
    
    return new Promise((resolve, reject) => {
        const request = store.add({ username, level, score, time, timestamp: new Date() });
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

async function getProgress(username, level) {
    const transaction = db.transaction(STORES.PROGRESS, 'readonly');
    const store = transaction.objectStore(STORES.PROGRESS);
    const index = store.index('username');
    
    return new Promise((resolve, reject) => {
        const request = index.getAll(IDBKeyRange.only(username));
        request.onsuccess = () => {
            const progress = request.result.filter(p => p.level === level);
            resolve(progress);
        };
        request.onerror = () => reject(request.error);
    });
}

// Leaderboard functions
async function addToLeaderboard(username, level, score, time) {
    const transaction = db.transaction(STORES.LEADERBOARD, 'readwrite');
    const store = transaction.objectStore(STORES.LEADERBOARD);
    
    return new Promise((resolve, reject) => {
        const request = store.add({ username, level, score, time, timestamp: new Date() });
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

async function getLeaderboard(level, limit = 10) {
    const transaction = db.transaction(STORES.LEADERBOARD, 'readonly');
    const store = transaction.objectStore(STORES.LEADERBOARD);
    const index = store.index('level');
    
    return new Promise((resolve, reject) => {
        const request = index.getAll(IDBKeyRange.only(level));
        request.onsuccess = () => {
            const leaderboard = request.result
                .sort((a, b) => b.score - a.score)
                .slice(0, limit);
            resolve(leaderboard);
        };
        request.onerror = () => reject(request.error);
    });
}

// Initialize the database when the script loads
initDB().catch(console.error);

// Export functions
window.gameDB = {
    addUser,
    getUser,
    listUsers,
    saveProfile,
    getProfile,
    saveProgress,
    getProgress,
    addToLeaderboard,
    getLeaderboard
}; 