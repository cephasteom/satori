import './style.css'

const channel = new BroadcastChannel('sartori');
channel.addEventListener('message', (e) => log(e.data.type, e.data.message));

let messages: {type: string, message: string}[] = [
    {type: 'title', message: 'Sartori'},
    {type: 'credit', message: `© Cephas Teom ${new Date().getFullYear()}`},
    {type: 'info', message: '`ctrl + return` to play.'},
    {type: 'info', message: '`ctrl + .` to stop.'},
    {type: 'info', message: '`cmd + 1` to toggle console.'},
    {type: 'info', message: '`cmd + 2` to toggle help.'},
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
            ${messages.map(message => `<${message.type === 'title' ? 'h1' : 'p'} class="console__message console__message--${message.type}">${message.message}</${message.type === 'title' ? 'h1' : 'p'}>`).join('')}
        </div>
    `;

    const container = console.querySelector('.console__messages');
    container && messages.length > 8 && (container.scrollTop = container.scrollHeight);
}

render();