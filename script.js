document.addEventListener('DOMContentLoaded', function() {
    function updateLayoutVariables() {}
    // --- Quick Reply Buttons ---
    const quickReplies = [
        'Show my profile summary',
        'List my top skills',
        'Suggest a Salesforce project',
        'What is Salesforce Apex?',
        'How to improve productivity?'
    ];
    const chatInputArea = document.querySelector('.chat-input-area');
    if (chatInputArea) {
        const quickReplyDiv = document.createElement('div');
        quickReplyDiv.className = 'quick-replies';
        quickReplies.forEach(text => {
            const btn = document.createElement('button');
            btn.className = 'quick-reply-btn';
            btn.textContent = text;
            btn.onclick = () => {
                if (chatInput) chatInput.value = text;
                if (sendChatBtn) sendChatBtn.click();
            };
            quickReplyDiv.appendChild(btn);
        });
        chatInputArea.prepend(quickReplyDiv);
    }

    // --- Theme Switcher ---
    const themeSwitcher = document.createElement('div');
    themeSwitcher.className = 'theme-switcher';
    themeSwitcher.innerHTML = `
      <button id="theme-light" title="Light Mode">🌞</button>
      <button id="theme-dark" title="Dark Mode">🌙</button>
      <button id="theme-system" title="System">🖥️</button>
    `;
    document.body.appendChild(themeSwitcher);
    function setTheme(mode) {
      if (mode === 'dark') {
        document.body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
      } else if (mode === 'light') {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light');
      } else {
        document.body.classList.toggle('dark-mode', window.matchMedia('(prefers-color-scheme: dark)').matches);
        localStorage.setItem('theme', 'system');
      }
    }
    document.getElementById('theme-light').onclick = () => setTheme('light');
    document.getElementById('theme-dark').onclick = () => setTheme('dark');
    document.getElementById('theme-system').onclick = () => setTheme('system');
    // Load theme on startup
    const savedTheme = localStorage.getItem('theme') || 'system';
    setTheme(savedTheme);
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (localStorage.getItem('theme') === 'system') setTheme('system');
    });

    // --- Persistent Chat History ---
    const chatHistoryDiv = document.getElementById('chatHistory');
    function saveChatHistory() {
      if (!chatHistoryDiv) return;
      localStorage.setItem('chatHistory', chatHistoryDiv.innerHTML);
    }
    function loadChatHistory() {
      if (!chatHistoryDiv) return;
      const saved = localStorage.getItem('chatHistory');
      if (saved) chatHistoryDiv.innerHTML = saved;
    }
    loadChatHistory();

    // --- Avatars and Enhanced addMessageToChat ---
    function addMessageToChat(message, sender) {
      if (!chatHistoryDiv) return;
      const messageDiv = document.createElement('div');
      messageDiv.classList.add('chat-message', sender);
      // Avatar
      const avatar = document.createElement('span');
      avatar.className = 'chat-avatar';
      avatar.innerHTML = sender === 'user' ? '🧑' : '🤖';
      messageDiv.appendChild(avatar);
      // Emoji support
      message = message.replace(/:smile:/g, '😄').replace(/:rocket:/g, '🚀').replace(/:wave:/g, '👋');
      const msgContent = document.createElement('span');
      msgContent.className = 'chat-text';
      msgContent.innerHTML = marked.parse(message);
      messageDiv.appendChild(msgContent);
      chatHistoryDiv.appendChild(messageDiv);
      chatHistoryDiv.scrollTop = chatHistoryDiv.scrollHeight;
      saveChatHistory();
    }

    // Patch sendMessage to use enhanced addMessageToChat
    async function sendMessage() {
      if (!chatInput || !sendChatBtn) return;
      const userMessage = chatInput.value.trim();
      if (!userMessage) return;
      addMessageToChat(userMessage, 'user');
      chatInput.value = '';
      chatInput.disabled = true;
      sendChatBtn.disabled = true;
      showTypingIndicator();
      setTimeout(async () => {
        let botResponse = 'This is a sample AI response.';
        hideTypingIndicator();
        addMessageToChat(botResponse, 'bot');
        if ('speechSynthesis' in window) {
          const utter = new SpeechSynthesisUtterance(botResponse);
          window.speechSynthesis.speak(utter);
        }
        chatInput.disabled = false;
        sendChatBtn.disabled = false;
        chatInput.focus();
      }, 1200);
    }

    // Replace event listeners for chat input and button
    if (sendChatBtn) {
      sendChatBtn.onclick = sendMessage;
    }
    if (chatInput) {
      chatInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') sendMessage();
      });
    }

    // --- Typing Animation for Bot ---
    function showTypingIndicator() {
        if (!chatHistoryDiv) return;
        let typingDiv = chatHistoryDiv.querySelector('.typing-indicator');
        if (!typingDiv) {
            typingDiv = document.createElement('div');
            typingDiv.className = 'chat-message bot typing-indicator';
            typingDiv.innerHTML = '<span></span><span></span><span></span>';
            chatHistoryDiv.appendChild(typingDiv);
            chatHistoryDiv.scrollTop = chatHistoryDiv.scrollHeight;
        }
    }
    function hideTypingIndicator() {
        if (!chatHistoryDiv) return;
        const typingDiv = chatHistoryDiv.querySelector('.typing-indicator');
        if (typingDiv) typingDiv.remove();
    }

    // Patch sendMessage to show typing indicator and support voice
    const chatInput = document.getElementById('chatInput');
    const sendChatBtn = document.getElementById('sendChatBtn');
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition;
    if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.continuous = false;
        recognition.interimResults = false;
    }

    // Add voice input button
    if (chatInputArea && SpeechRecognition) {
        const micBtn = document.createElement('button');
        micBtn.innerHTML = '🎤';
        micBtn.title = 'Voice Input';
        micBtn.style.marginLeft = '8px';
        micBtn.style.fontSize = '1.3em';
        micBtn.onclick = () => {
            recognition.start();
        };
        chatInputArea.appendChild(micBtn);
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            if (chatInput) chatInput.value = transcript;
        };
    }

    // Patch addMessageToChat to support emoji
    function addMessageToChat(message, sender) {
        if (!chatHistoryDiv) return;
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('chat-message', sender);
        // Emoji support: replace :smile: etc. with unicode
        message = message.replace(/:smile:/g, '😄').replace(/:rocket:/g, '🚀').replace(/:wave:/g, '👋');
        messageDiv.innerHTML = marked.parse(message);
        chatHistoryDiv.appendChild(messageDiv);
        chatHistoryDiv.scrollTop = chatHistoryDiv.scrollHeight;
    }

    // Patch sendMessage to show typing indicator and use speech synthesis
    async function sendMessage() {
        if (!chatInput || !sendChatBtn) return;
        const userMessage = chatInput.value.trim();
        if (!userMessage) return;
        addMessageToChat(userMessage, 'user');
        chatInput.value = '';
        chatInput.disabled = true;
        sendChatBtn.disabled = true;
        showTypingIndicator();
        // Simulate bot thinking
        setTimeout(async () => {
            // Replace with your AI logic or API call
            let botResponse = 'This is a sample AI response.';
            // Hide typing
            hideTypingIndicator();
            addMessageToChat(botResponse, 'bot');
            // Voice output
            if ('speechSynthesis' in window) {
                const utter = new SpeechSynthesisUtterance(botResponse);
                window.speechSynthesis.speak(utter);
            }
            chatInput.disabled = false;
            sendChatBtn.disabled = false;
            chatInput.focus();
        }, 1200);
    }

    // Replace event listeners for chat input and button
    if (sendChatBtn) {
        sendChatBtn.onclick = sendMessage;
    }
    if (chatInput) {
        chatInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') sendMessage();
        });
    }
});

(function() {
    'use strict';
    // ...existing code for Liquid Glass effect...
})();
