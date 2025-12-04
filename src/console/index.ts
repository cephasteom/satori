import './style.css'

const channel = new BroadcastChannel('sartori');
channel.addEventListener('message', (e) => log(e.data.type, e.data.message));

let messages: {type: string, message: string}[] = [
    {type: 'title', message: 'Sartori'},
    {type: 'credit', message: `© Cephas Teom ${new Date().getFullYear()}`},
    {type: 'info', message: '`ctrl + return` to play.'},
    {type: 'info', message: '`ctrl + .` to stop.'},
    {type: 'info', message: 'Toggle console `cmd + 1`, docs `cmd + 2`.'},
]

function log(type: string, message: string) {
    messages = type === 'clear' 
        ? messages.filter(m => m.type === 'title' || m.type === 'credit')
        : [...messages, { type, message }];
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
    container && messages.length > 7 && (container.scrollTop = container.scrollHeight);
}

render();