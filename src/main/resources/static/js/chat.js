'use strict'

//stomp : simple text oriented messaging protocol permet de communiquer entre le client et le serveur
let stompClient = null;
let currentUser = null;
let isConnected = false;
let unreadCount = 0;
let isWindowFocused = true;
let typingTimer = null;


//Récupérer les informations de l'utilisateur
const userData = document.getElementById('currentUser');
currentUser = {
    username: userData.dataset.username,
    avatarColor: userData.dataset.color
}

//Gérer les focus
window.addEventListener('focus', () => isWindowFocused = true);
window.addEventListener('blur', () => isWindowFocused = false);

function connect() {

    const socket = new SockJS('/ws');
    //Récupère la Socket qui sera connecté
    stompClient = Stomp.over(socket)

    stompClient.connect({}, onConnected, onError)
}

function onConnected() {

    console.log('Connected established: ' + currentUser.username);
    isConnected = true;

    stompClient.subscribe('/topic/public', onMessageReceived);

    stompClient.send("/app/chat.addUser", {}, JSON.stringify({
        sender: {username: currentUser.username},
        type: 'JOIN'
        }));

    updateOnlineUsers();
}

function updateOnlineUsers() {

    fetch('/api/online-users')
        .then(response => response.json())
        .then(users => {
           const container = document.getElementById('onlineUsers');
           const count = document.getElementById('onlineCount');

           count.textContent = users.length;
           container.innerHTML = '';

           users.forEach(user => {
               const userElement = document.createElement('div');
               userElement.classList.add('online-user');
               userElement.innerHTML = `
                <div class="user-avatar" style="background-color: ${user.avatarColor}">
                        ${user.username.charAt(0).toUpperCase()}
                    </div>
                    <div class="flex-grow-1">
                        <div class="fw-bold">${user.username}</div>
                        <small class="text-muted">Online</small>
                    </div>
                    <div class="online-indicator"></div>
               `;
               container.appendChild(userElement);
           })
        })
        .catch(error => console.error('Error fetching online users:', error));
}

function onMessageReceived(payload) {

    const message = JSON.parse(payload.body);

    if (message.type === 'JOIN') {
        console.log(message.sender + ' joined the chat');
        showSystemMessage( `${message.sender.username} joined the chat`, 'user-plus');
        updateOnlineUsers();
    } else if (message.type === 'LEAVE') {
        console.log(message.sender + ' left the chat');
        showSystemMessage( `${message.sender.username} left the chat`, 'user-minus');
    } else if (message.type === 'TYPING') {
        console.log(message.sender + ' is typing...');
        showTypingIndicator( message.sender.username)
    } else if (message.type === 'CHAT') {
        console.log('New message received!');
        hideTypingIndicator();
        showMessage(message);
    }
}

function showMessage(message) {
    const messageArea = document.getElementById('messageArea');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');

    if(message.sender.username === currentUser.username) {
        messageElement.classList.add('own');
    }

    const timestamp = new Date(message.timestamp).toLocaleDateString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
    });

    messageElement.innerHTML = `
            <div class="message-avatar" style="background-color: ${message.sender.avatarColor}">
            ${message.sender.username.charAt(0).toUpperCase()}
        </div>
        <div class="message-content">
            <div class="message-bubble">
                ${message.sender.username !== currentUser.username ?
        `<div class="fw-bold mb-1">${message.sender.username}</div>` : ''}
                <div>${escapeHtml(message.content)}</div>
            </div>
            <div class="message-time">${timestamp}</div>
        </div>
    `;

    messageArea.appendChild(messageElement);
}

function escapeHtml(unsafe) {
    const div = document.createElement('div');
    div.textContent = unsafe;
    return div.innerHTML;
}


function showTypingIndicator(username) {

    const typingIndicator = document.getElementById('typingIndicator');
    typingIndicator.querySelector('.typing-user').textContent = `${username} is typing`;
    typingIndicator.style.display = 'flex';

    if (typingTimer) {
        clearTimeout(typingTimer);
    }

    typingTimer = setTimeout(() => {
       hideTypingIndicator();
    }, 2000);

}

function hideTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    typingIndicator.style.display = 'none';

}


function showSystemMessage(message, icon) {
    const messageArea = document.createElement('messageArea');
    const messageElement = document.createElement('div');
    messageElement.classList.add('system-message');
    messageElement.innerHTML = `
        <i class="fas fa-${icon}"></i> ${message}
    `;
    messageArea.appendChild(messageElement);

}

function handleTyping() {

    if (stompClient && isConnected) {
        stompClient.send("/app/chat.typing", {}, JSON.stringify({
            sender: {username: currentUser.username},
            type: 'TYPING'
        }));
    }
}


function onError(error) {
    console.log('Could not connect to WebSocket server. Please refresh this page to try again!', error);
}


function sendMessage(event) {
    event.preventDefault();

    const messageContent = document.getElementById('messageInput').value.trim();
    if (messageContent && stompClient && isConnected && isWindowFocused) {
        const chatMessage = {
            sender: {username: currentUser.username},
            content: messageContent,
            type: 'CHAT'
        }
        stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(chatMessage));
        document.getElementById('messageInput').value = '';
        hideTypingIndicator();
    }
}

document.getElementById('messageForm').addEventListener('submit', sendMessage)
document.getElementById('messageInput').addEventListener('input', handleTyping)

connect()

document.getElementById('messageInput').focus();