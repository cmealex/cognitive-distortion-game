// Language dictionary for multilingual support
const languages = {
    en: {
        // General
        appTitle: "Cognitive Distortion Matcher",
        loading: "Loading...",
        save: "Save",
        cancel: "Cancel",
        yes: "Yes",
        no: "No",
        back: "Back",
        next: "Next",
        retry: "Retry",
        continue: "Continue",
        lightModeToggle: "Light Mode",

        // Login Screen
        login: "Login",
        username: "Username:",
        password: "Password:",
        enterUsername: "Enter username",
        enterPassword: "Enter password",
        invalidCredentials: "Invalid username or password",
        aboutLink: "About",
        gameplayLink: "How to Play",
        languageToggle: "Switch to Romanian",
        darkModeToggle: "Dark Mode",

        // Admin Screen
        adminPanel: "Admin Panel",
        createUser: "Create User",
        userCredentials: "User Credentials",
        newUsername: "Username:",
        newPassword: "Password:",
        enterNewUsername: "Enter new username",
        enterNewPassword: "Enter new password",
        userExists: "Username already exists",
        logout: "Logout",
        pleaseEnterBoth: "Please enter both username and password",

        // Profile Screen
        setupProfile: "Setup Your Profile",
        nickname: "Nickname:",
        chooseNickname: "Choose a nickname",
        selectAvatar: "Select an Avatar",
        pleaseEnterNickname: "Please enter a nickname",
        pleaseSelectAvatar: "Please select an avatar",

        // Level Selection
        levels: "Levels",
        level: "Level",
        locked: "Locked",
        complete: "Complete",
        leaderboard: "Leaderboard",
        topScores: "Top Scores",
        player: "Player",
        time: "Time",

        // Game Screen
        situations: "Situations",
        distortions: "Cognitive Distortions",
        score: "Score",
        timeLeft: "Time Left",
        pairs: "Pairs",
        backToLevels: "Back to Levels",

        // Level Complete
        levelComplete: "Level Complete!",
        completedLevel: "You completed Level",
        timeUsed: "Time Used",
        seconds: "seconds",
        finalScore: "Final Score",
        levelUnlocked: "New Level Unlocked!",
        unlocked: "You've unlocked Level",
        returnToLevels: "Return to Levels",
        
        // About Page
        aboutTitle: "About Cognitive Distortion Matcher",
        aboutContent: "This game helps you learn to identify common cognitive distortions - the negative thought patterns that can contribute to anxiety and depression. By matching situations with the appropriate cognitive distortion type, you can become more aware of these patterns in your own thinking.",
        developerInfo: "Developed by Christian Mayer",
        contactInfo: "Contact: contact@christianmayer.info",
        
        // Gameplay Page
        gameplayTitle: "How to Play",
        gameObjective: "Game Objective",
        gameObjectiveText: "The goal of Cognitive Distortion Matcher is to correctly match situations with the cognitive distortion type they represent.",
        gameRules: "Game Rules",
        gameRule1: "Each level contains a set of situations and cognitive distortions.",
        gameRule2: "Click on a situation on the left panel to select it.",
        gameRule3: "Then click on the matching cognitive distortion on the right panel.",
        gameRule4: "If correct, both will be marked with a checkmark (✓) and fade slightly.",
        gameRule5: "If incorrect, the distortion will flash red with an X mark (✗).",
        gameRule6: "Complete all matches before the timer runs out.",
        gameRule7: "Successfully completing a level unlocks the next level.",
        levelProgression: "Level Progression",
        levelProgressionIntro: "The game features 20 levels with increasing difficulty:",
        levelProgression1: "Levels 1-10: 3 matches per level",
        levelProgression2: "Levels 11-15: 4 matches per level",
        levelProgression3: "Levels 16-20: 5 matches per level",
        levelProgression4: "Higher levels feature more ambiguous situations and have tighter time limits.",
        tips: "Tips",
        tip1: "Read each description carefully to understand the core characteristic of each distortion type.",
        tip2: "Look for key phrases in the situations that hint at specific distortion types.",
        tip3: "Practice identifying these patterns in your own thoughts during daily life.",
        tip4: "Focus on speed at higher levels to beat the timer.",
        gameplayContent: "1. Read each situation on the left side.\n2. Click on a situation to select it.\n3. Match it with the appropriate cognitive distortion on the right side.\n4. Complete all matches before time runs out.\n5. Try to progress through all levels to master cognitive distortion identification!"
    },
    ro: {
        // General
        appTitle: "Identificator de Distorsiuni Cognitive",
        loading: "Se încarcă...",
        save: "Salvează",
        cancel: "Anulează",
        yes: "Da",
        no: "Nu",
        back: "Înapoi",
        next: "Următorul",
        retry: "Încearcă din nou",
        continue: "Continuă",
        lightModeToggle: "Mod Luminos",

        // Login Screen
        login: "Autentificare",
        username: "Nume utilizator:",
        password: "Parolă:",
        enterUsername: "Introduceți numele de utilizator",
        enterPassword: "Introduceți parola",
        invalidCredentials: "Nume de utilizator sau parolă invalidă",
        aboutLink: "Despre",
        gameplayLink: "Cum se joacă",
        languageToggle: "Schimbă în Engleză",
        darkModeToggle: "Mod Întunecat",

        // Admin Screen
        adminPanel: "Panou Administrator",
        createUser: "Creează Utilizator",
        userCredentials: "Credențiale Utilizator",
        newUsername: "Nume utilizator:",
        newPassword: "Parolă:",
        enterNewUsername: "Introduceți numele de utilizator nou",
        enterNewPassword: "Introduceți parola nouă",
        userExists: "Numele de utilizator există deja",
        logout: "Deconectare",
        pleaseEnterBoth: "Vă rugăm să introduceți atât numele de utilizator, cât și parola",

        // Profile Screen
        setupProfile: "Configurați Profilul",
        nickname: "Poreclă:",
        chooseNickname: "Alegeți o poreclă",
        selectAvatar: "Selectați un Avatar",
        pleaseEnterNickname: "Vă rugăm introduceți o poreclă",
        pleaseSelectAvatar: "Vă rugăm selectați un avatar",

        // Level Selection
        levels: "Nivele",
        level: "Nivel",
        locked: "Blocat",
        complete: "Complet",
        leaderboard: "Clasament",
        topScores: "Cele mai bune scoruri",
        player: "Jucător",
        time: "Timp",

        // Game Screen
        situations: "Situații",
        distortions: "Distorsiuni Cognitive",
        score: "Scor",
        timeLeft: "Timp Rămas",
        pairs: "Perechi",
        backToLevels: "Înapoi la Nivele",

        // Level Complete
        levelComplete: "Nivel Completat!",
        completedLevel: "Ați completat Nivelul",
        timeUsed: "Timp Utilizat",
        seconds: "secunde",
        finalScore: "Scor Final",
        levelUnlocked: "Nivel Nou Deblocat!",
        unlocked: "Ați deblocat Nivelul",
        returnToLevels: "Înapoi la Nivele",
        
        // About Page
        aboutTitle: "Despre Identificatorul de Distorsiuni Cognitive",
        aboutContent: "Acest joc vă ajută să învățați să identificați distorsiunile cognitive comune - modelele de gândire negative care pot contribui la anxietate și depresie. Prin potrivirea situațiilor cu tipul de distorsiune cognitivă adecvat, puteți deveni mai conștienți de aceste modele în propria gândire.",
        developerInfo: "Dezvoltat de Christian Mayer",
        contactInfo: "Contact: contact@christianmayer.info",
        
        // Gameplay Page
        gameplayTitle: "Cum se joacă",
        gameObjective: "Obiectivul Jocului",
        gameObjectiveText: "Scopul Identificatorului de Distorsiuni Cognitive este de a potrivi corect situațiile cu tipul de distorsiune cognitivă pe care îl reprezintă.",
        gameRules: "Regulile Jocului",
        gameRule1: "Fiecare nivel conține un set de situații și distorsiuni cognitive.",
        gameRule2: "Faceți clic pe o situație din panoul din stânga pentru a o selecta.",
        gameRule3: "Apoi faceți clic pe distorsiunea cognitivă potrivită din panoul din dreapta.",
        gameRule4: "Dacă este corect, ambele vor fi marcate cu un semn de bifare (✓) și se vor estompa ușor.",
        gameRule5: "Dacă este incorect, distorsiunea va clipi în roșu cu un semn X (✗).",
        gameRule6: "Completați toate potrivirile înainte ca cronometrul să expire.",
        gameRule7: "Completarea cu succes a unui nivel deblochează următorul nivel.",
        levelProgression: "Progresul Nivelurilor",
        levelProgressionIntro: "Jocul are 20 de niveluri cu dificultate crescândă:",
        levelProgression1: "Nivelurile 1-10: 3 potriviri per nivel",
        levelProgression2: "Nivelurile 11-15: 4 potriviri per nivel",
        levelProgression3: "Nivelurile 16-20: 5 potriviri per nivel",
        levelProgression4: "Nivelurile superioare prezintă situații mai ambigue și au limite de timp mai stricte.",
        tips: "Sfaturi",
        tip1: "Citiți cu atenție fiecare descriere pentru a înțelege caracteristica de bază a fiecărui tip de distorsiune.",
        tip2: "Căutați fraze cheie în situații care sugerează tipuri specifice de distorsiuni.",
        tip3: "Exersați identificarea acestor modele în propriile gânduri în viața de zi cu zi.",
        tip4: "Concentrați-vă pe viteză la nivelurile superioare pentru a învinge cronometrul.",
        gameplayContent: "1. Citiți fiecare situație din partea stângă.\n2. Faceți clic pe o situație pentru a o selecta.\n3. Potriviți-o cu distorsiunea cognitivă adecvată din partea dreaptă.\n4. Completați toate potrivirile înainte ca timpul să expire.\n5. Încercați să progresați prin toate nivelele pentru a stăpâni identificarea distorsiunilor cognitive!"
    }
};

// Current language 
let currentLanguage = "en";

// Function to set language
function setLanguage(lang) {
    currentLanguage = lang;
    updatePageText();
    // Save preference
    localStorage.setItem('preferredLanguage', lang);
}

// Function to get text in current language
function getText(key) {
    if (languages[currentLanguage] && languages[currentLanguage][key]) {
        return languages[currentLanguage][key];
    }
    // Fallback to English if key not found
    if (languages.en && languages.en[key]) {
        return languages.en[key];
    }
    // Last resort - return the key itself
    return key;
}

// Update all text elements on the page
function updatePageText() {
    const textElements = document.querySelectorAll('[data-lang]');
    textElements.forEach(element => {
        const key = element.getAttribute('data-lang');
        if (element.tagName === 'INPUT' && element.getAttribute('placeholder')) {
            element.placeholder = getText(key);
        } else {
            element.textContent = getText(key);
        }
    });
    
    // Update toggle button text
    const languageToggle = document.getElementById('language-toggle');
    if (languageToggle) {
        languageToggle.textContent = getText('languageToggle');
    }
}

// Load saved language preference
function loadLanguagePreference() {
    const savedLanguage = localStorage.getItem('preferredLanguage');
    if (savedLanguage) {
        currentLanguage = savedLanguage;
    }
    updatePageText();
}

// Initialize language setting
document.addEventListener('DOMContentLoaded', loadLanguagePreference); 