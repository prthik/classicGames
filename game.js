const canvas = document.getElementById('pong-canvas');
const ctx = canvas.getContext('2d');

// Game constants
const PADDLE_WIDTH = 12;
const PADDLE_HEIGHT = 90;
const BALL_SIZE = 16;
const PLAYER_X = 25;
const AI_X = canvas.width - PLAYER_X - PADDLE_WIDTH;
const PADDLE_SPEED = 6;
const BALL_SPEED = 6;

// Paddle objects
let playerY = canvas.height / 2 - PADDLE_HEIGHT / 2;
let aiY = canvas.height / 2 - PADDLE_HEIGHT / 2;

// Ball object
let ball = {
    x: canvas.width / 2 - BALL_SIZE / 2,
    y: canvas.height / 2 - BALL_SIZE / 2,
    vx: BALL_SPEED * (Math.random() > 0.5 ? 1 : -1),
    vy: BALL_SPEED * (Math.random() * 2 - 1)
};

// Track mouse for player paddle
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    let mouseY = e.clientY - rect.top;
    playerY = mouseY - PADDLE_HEIGHT / 2;
    // Clamp paddle to canvas
    if (playerY < 0) playerY = 0;
    if (playerY + PADDLE_HEIGHT > canvas.height) playerY = canvas.height - PADDLE_HEIGHT;
});

// Basic AI for right paddle
function updateAI() {
    let target = ball.y + BALL_SIZE / 2 - PADDLE_HEIGHT / 2;
    if (aiY + PADDLE_HEIGHT / 2 < target) {
        aiY += PADDLE_SPEED;
    } else if (aiY + PADDLE_HEIGHT / 2 > target) {
        aiY -= PADDLE_SPEED;
    }
    // Clamp AI paddle
    if (aiY < 0) aiY = 0;
    if (aiY + PADDLE_HEIGHT > canvas.height) aiY = canvas.height - PADDLE_HEIGHT;
}

// Ball movement and collision
function updateBall() {
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Top and bottom wall collision
    if (ball.y < 0) {
        ball.y = 0;
        ball.vy *= -1;
    }
    if (ball.y + BALL_SIZE > canvas.height) {
        ball.y = canvas.height - BALL_SIZE;
        ball.vy *= -1;
    }

    // Player paddle collision
    if (
        ball.x <= PLAYER_X + PADDLE_WIDTH &&
        ball.x >= PLAYER_X &&
        ball.y + BALL_SIZE > playerY &&
        ball.y < playerY + PADDLE_HEIGHT
    ) {
        ball.x = PLAYER_X + PADDLE_WIDTH;
        ball.vx *= -1.1; // increase speed slightly
        // Add spin based on hit position
        let collidePoint = (ball.y + BALL_SIZE / 2) - (playerY + PADDLE_HEIGHT / 2);
        ball.vy += collidePoint * 0.15;
    }

    // AI paddle collision
    if (
        ball.x + BALL_SIZE >= AI_X &&
        ball.x + BALL_SIZE <= AI_X + PADDLE_WIDTH &&
        ball.y + BALL_SIZE > aiY &&
        ball.y < aiY + PADDLE_HEIGHT
    ) {
        ball.x = AI_X - BALL_SIZE;
        ball.vx *= -1.1;
        let collidePoint = (ball.y + BALL_SIZE / 2) - (aiY + PADDLE_HEIGHT / 2);
        ball.vy += collidePoint * 0.15;
    }

    // Left or right wall (score) -- just reset ball
    if (ball.x < 0 || ball.x + BALL_SIZE > canvas.width) {
        // Reset position and velocity
        ball.x = canvas.width / 2 - BALL_SIZE / 2;
        ball.y = canvas.height / 2 - BALL_SIZE / 2;
        ball.vx = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
        ball.vy = BALL_SPEED * (Math.random() * 2 - 1);
    }
}

// Draw everything
function draw() {
    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw player paddle
    ctx.fillStyle = "#4caf50";
    ctx.fillRect(PLAYER_X, playerY, PADDLE_WIDTH, PADDLE_HEIGHT);

    // Draw AI paddle
    ctx.fillStyle = "#e53935";
    ctx.fillRect(AI_X, aiY, PADDLE_WIDTH, PADDLE_HEIGHT);

    // Draw ball
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(ball.x + BALL_SIZE / 2, ball.y + BALL_SIZE / 2, BALL_SIZE / 2, 0, Math.PI * 2);
    ctx.fill();

    // Draw center line
    ctx.strokeStyle = "#fff";
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

// Game loop
function loop() {
    updateAI();
    updateBall();
    draw();
    requestAnimationFrame(loop);
}

// Start game
loop();