import './style.css'

const channel = new BroadcastChannel('sartori');
channel.addEventListener('message', (e) => log(e.data.type, e.data.message));

let errors: {type: string, message: string}[] = []

const initialMessages = [
    {type: 'success', message: 'Welcome to Sartori!'},
    {type: 'info', message: '`ctrl + return` to play.'},
    {type: 'info', message: '`ctrl + .` to stop.'},
    {type: 'credit', message: `© Cephas Teom ${new Date().getFullYear()}`},
];

initialMessages.forEach((message, index) => {
    setTimeout(() => {
        log(message.type, message.message);
    }, (index+1) * 100); // simulate loading
});

function log(type: string, message: string) {
    errors = [...errors, { type, message }];
    render();
}

function render() {
    const console = document.getElementById('console');
    if (!console) return;

    console.innerHTML = `
        <div class="console__messages">
            ${errors.map(err => `<pre class="console__message console__message--${err.type}">${err.message}</pre>`).join('')}
        </div>
    `;

    console.scrollTop = console.scrollHeight;
}

render();