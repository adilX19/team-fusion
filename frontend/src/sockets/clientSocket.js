const socket = new WebSocket('ws://localhost:3000');
const userId = 123; // fetch from session/auth

socket.onopen = () => {
    socket.send(JSON.stringify({ type: 'REGISTER', user_id: userId }));
};

socket.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.type === 'NOTIFICATION') {
        console.log('📬 New notification:', msg.data);
        // Update notification UI
    }
};

setInterval(() => {
    fetch(`/notifications?user_id=${userId}`)
        .then(res => res.json())
        .then(data => console.log('🔄 Polled notifications:', data));
}, 30000);