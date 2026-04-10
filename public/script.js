// DOM Elements
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');

// Event listener for form submission
chatForm.addEventListener('submit', handleFormSubmit);

/**
 * Handles form submission: sends user message to backend
 */
async function handleFormSubmit(event) {
  event.preventDefault();

  const message = userInput.value.trim();

  // Validate input
  if (!message) {
    return;
  }

  // Add user message to chat box
  addMessageToChatBox('user', message);

  // Clear input field
  userInput.value = '';

  // Show "Thinking..." bot message and get its reference
  const thinkingMessageId = addMessageToChatBox('bot', 'Thinking...');

  try {
    // Send message to backend
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        conversation: [
          {
            role: 'user',
            text: message,
          },
        ],
      }),
    });

    // Check if response is ok
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Validate response contains result
    if (!data.result) {
      throw new Error('No response received');
    }

    // Replace "Thinking..." with actual response
    updateMessageInChatBox(thinkingMessageId, data.result);
  } catch (error) {
    console.error('Error:', error);

    // Replace "Thinking..." with error message
    const errorMessage = 'Failed to get response from server.';
    updateMessageInChatBox(thinkingMessageId, errorMessage);
  }

  // Keep focus on input for better UX
  userInput.focus();
}

/**
 * Adds a message to the chat box
 * @param {string} role - Either 'user' or 'bot'
 * @param {string} message - The message text
 * @returns {string} - The unique ID of the message element
 */
function addMessageToChatBox(role, message) {
  const messageId = `msg-${Date.now()}`;
  const messageElement = document.createElement('div');
  messageElement.id = messageId;
  messageElement.className = `message message-${role}`;

  // Create message content with label
  const label = role === 'user' ? '😊 You:' : '🤖 Bot:';
  messageElement.innerHTML = `<strong>${label}</strong> <span>${escapeHtml(message)}</span>`;

  chatBox.appendChild(messageElement);

  // Auto-scroll to bottom
  chatBox.scrollTop = chatBox.scrollHeight;

  return messageId;
}

/**
 * Updates an existing message in the chat box
 * @param {string} messageId - The ID of the message element to update
 * @param {string} newMessage - The new message text
 */
function updateMessageInChatBox(messageId, newMessage) {
  const messageElement = document.getElementById(messageId);

  if (messageElement) {
    // Preserve the label, update only the message content
    const label = messageElement.querySelector('strong');
    messageElement.innerHTML = ``;
    messageElement.appendChild(label.cloneNode(true));

    const span = document.createElement('span');
    span.textContent = newMessage;
    messageElement.appendChild(span);

    // Auto-scroll to bottom
    chatBox.scrollTop = chatBox.scrollHeight;
  }
}

/**
 * Escapes HTML special characters to prevent XSS attacks
 * @param {string} text - The text to escape
 * @returns {string} - The escaped text
 */
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}
