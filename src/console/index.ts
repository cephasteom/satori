import './style.css'

const channel = new BroadcastChannel('sartori');
channel.addEventListener('message', (e) => log(e.data.type, e.data.message));

let messages: {type: string, message: string}[] = [
    {type: 'title', message: 'Sartori'},
    {type: 'info', message: '`ctrl + return` to play.'},
    {type: 'info', message: '`ctrl + .` to stop.'},
    {type: 'credit', message: `© Cephas Teom ${new Date().getFullYear()}`},
]

function log(type: string, message: string) {
    messages = [...messages, { type, message }];
    render();
}

function render() {
    const console = document.getElementById('console');
    if (!console) return;

    console.innerHTML = `
        <div class="console__messages">
            ${messages.map(err => `<p class="console__message console__message--${err.type}">${err.message}</p>`).join('')}
        </div>
    `;

    messages.length > 6 && (console.scrollTop = console.scrollHeight);
}

render();