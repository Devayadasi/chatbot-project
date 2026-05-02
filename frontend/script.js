// --- Configuration ---
const API_URL = "https://chatbot-project-86yf.onrender.com/chat";
const STORAGE_KEY = "chatmate_history";

// --- DOM Elements ---
const chatWindow = document.getElementById('chat-window');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const typingIndicator = document.getElementById('typing-indicator');
const clearBtn = document.getElementById('clear-btn');

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    loadChatHistory();
});

// --- Core Functions ---

/**
 * Adds a message bubble to the screen
 */
function appendMessage(role, text) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', `${role}-message`);
    msgDiv.textContent = text;
    chatWindow.appendChild(msgDiv);

    // Auto-scroll to bottom
    chatWindow.scrollTo({
        top: chatWindow.scrollHeight,
        behavior: 'smooth'
    });
}

/**
 * Saves message to localStorage for persistence
 */
function saveMessage(role, text) {
    const history = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    history.push({ role, text });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

/**
 * Loads and displays history from localStorage
 */
function loadChatHistory() {
    const history = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    if (history.length === 0) {
        appendMessage('bot', 'Hi! I am Chatmate. How can I help you today?');
    } else {
        history.forEach(msg => appendMessage(msg.role, msg.text));
    }
}

/**
 * Toggles loading states
 */
function setBusy(isBusy) {
    if (isBusy) {
        typingIndicator.classList.remove('hidden');
        userInput.disabled = true;
        sendBtn.disabled = true;
    } else {
        typingIndicator.classList.add('hidden');
        userInput.disabled = false;
        sendBtn.disabled = false;
        userInput.focus();
    }
}

// --- Event Listeners ---

// Send Message Logic
chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const message = userInput.value.trim();
    if (!message) return;

    // 1. User Message UI + Storage
    appendMessage('user', message);
    saveMessage('user', message);
    userInput.value = '';

    // 2. Loading state
    setBusy(true);

    try {
        // 3. API Request
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: message })
        });

        if (!response.ok) throw new Error('API Error');

        const data = await response.json();
        const reply = data.reply || "I couldn't generate a response.";

        // 4. Bot Message UI + Storage
        appendMessage('bot', reply);
        saveMessage('bot', reply);

    } catch (err) {
        console.error(err);
        appendMessage('error', 'Server connection failed. Please try again.');
    } finally {
        setBusy(false);
    }
});

// Clear Chat Logic
clearBtn.addEventListener('click', () => {
    if (confirm('Delete all chat history?')) {
        localStorage.removeItem(STORAGE_KEY);
        chatWindow.innerHTML = '';
        appendMessage('bot', 'History cleared. How can I help you now?');
    }
});