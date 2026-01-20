// --- CONFIGURAÇÃO & ESTADO ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Ajuste dinâmico de resolução
function resize() {
    canvas.width = window.innerWidth > 800 ? 800 : window.innerWidth;
    canvas.height = window.innerHeight > 600 ? 600 : window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// Estado dos Inputs (Bridge Pattern)
const keys = {
    ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false,
    Space: false, z: false
};

// --- INPUT HANDLERS (TECLADO + TOUCH UNIFICADOS) ---
function setKey(key, status) {
    if (keys.hasOwnProperty(key)) keys[key] = status;
    if (key === ' ') keys.Space = status;
}

// Teclado
window.addEventListener('keydown', e => setKey(e.key, true));
window.addEventListener('keyup', e => setKey(e.key, false));

// Touch UI
document.querySelectorAll('.d-btn, .action-btn').forEach(btn => {
    const key = btn.getAttribute('data-key');
    
    // Touch Events (Mobile)
    btn.addEventListener('touchstart', (e) => { e.preventDefault(); setKey(key, true); });
    btn.addEventListener('touchend', (e) => { e.preventDefault(); setKey(key, false); });
    
    // Mouse Events (Debug no Desktop)
    btn.addEventListener('mousedown', () => setKey(key, true));
    btn.addEventListener('mouseup', () => setKey(key, false));
    btn.addEventListener('mouseleave', () => setKey(key, false));
});

// UI Logic
const invBtn = document.getElementById('inventory-btn');
const closeInvBtn = document.getElementById('close-inv');
const invModal = document.getElementById('inventory-modal');

invBtn.addEventListener('click', () => invModal.classList.remove('hidden'));
closeInvBtn.addEventListener('click', () => invModal.classList.add('hidden'));

// --- ENTIDADES DO JOGO (MVP) ---
const player = {
    x: 50, y: 200, width: 30, height: 30,
    color: '#4CAF50', speed: 5,
    dy: 0, jumpPower: -12, gravity: 0.6,
    grounded: false
};

const platforms = [
    { x: 0, y: 350, w: 1000, h: 50 }, // Chão
    { x: 200, y: 250, w: 100, h: 20 },
    { x: 400, y: 180, w: 100, h: 20 },
    { x: 600, y: 100, w: 200, h: 20 }
];

// --- GAME LOOP ---
function update() {
    // Movimento Lateral
    if (keys.ArrowRight) player.x += player.speed;
    if (keys.ArrowLeft) player.x -= player.speed;

    // Pulo
    if ((keys.ArrowUp || keys.Space) && player.grounded) {
        player.dy = player.jumpPower;
        player.grounded = false;
    }

    // Física (Gravidade)
    player.dy += player.gravity;
    player.y += player.dy;

    // Colisão Simples
    player.grounded = false;
    platforms.forEach(p => {
        if (player.x < p.x + p.w &&
            player.x + player.width > p.x &&
            player.y + player.height > p.y &&
            player.y + player.height < p.y + p.h + 20) { // Tolerância
            
            if(player.dy > 0) { // Caindo
                player.dy = 0;
                player.y = p.y - player.height;
                player.grounded = true;
            }
        }
    });

    // Limites da Tela
    if (player.x < 0) player.x = 0;
    if (player.y > canvas.height) { // Caiu no abismo
        player.x = 50; player.y = 200; player.dy = 0;
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Cenário (Exemplo Bioma Básico)
    ctx.fillStyle = '#654321'; // Terra
    platforms.forEach(p => ctx.fillRect(p.x, p.y, p.w, p.h));

    // Player (Quadrado provisório)
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // Olhos do player (Para ver direção)
    ctx.fillStyle = 'white';
    if(keys.ArrowLeft) ctx.fillRect(player.x + 2, player.y + 5, 8, 8);
    else ctx.fillRect(player.x + 20, player.y + 5, 8, 8);
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

// Start
loop();
