const canvas = document.getElementById('pong-canvas');
const ctx = canvas.getContext('2d');

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

// Score
let playerScore = 0;
let aiScore = 0;

// Pause logic
let paused = false;
const pauseBtn = document.getElementById('pause-btn');
pauseBtn.addEventListener('click', () => {
    paused = !paused;
    pauseBtn.textContent = paused ? 'Resume' : 'Pause';
});

// Mouse control for player paddle
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    let mouseY = e.clientY - rect.top;
    playerY = mouseY - PADDLE_HEIGHT / 2;
    if (playerY < 0) playerY = 0;
    if (playerY + PADDLE_HEIGHT > canvas.height) playerY = canvas.height - PADDLE_HEIGHT;
});

// Improved AI
function updateAI() {
    // Predict ball position when it reaches the AI paddle
    let predictedY = ball.y + ball.vy * ((AI_X - ball.x) / ball.vx);
    predictedY = Math.max(0, Math.min(predictedY, canvas.height - PADDLE_HEIGHT));

    // Add random error for realism
    let error = (Math.random() - 0.5) * 30;
    let target = predictedY + error;

    if (aiY + PADDLE_HEIGHT / 2 < target) {
        aiY += PADDLE_SPEED + Math.random() * 2;
    } else if (aiY + PADDLE_HEIGHT / 2 > target) {
        aiY -= PADDLE_SPEED + Math.random() * 2;
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
        ball.vx *= -1.1;
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

    // Left or right wall (score)
    if (ball.x < 0) {
        aiScore++;
        resetBall();
    }
    if (ball.x + BALL_SIZE > canvas.width) {
        playerScore++;
        resetBall();
    }
}

// Reset ball to center
function resetBall() {
    ball.x = canvas.width / 2 - BALL_SIZE / 2;
    ball.y = canvas.height / 2 - BALL_SIZE / 2;
    ball.vx = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
    ball.vy = BALL_SPEED * (Math.random() * 2 - 1);
}

// Draw everything
function draw() {
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

    // Draw score
    document.getElementById('score-counter').textContent = `Player: ${playerScore} | AI: ${aiScore}`;
}

// Game loop
function loop() {
    if (!paused) {
        updateAI();
        updateBall();
        draw();
    } else {
        draw(); // Still draw, just don't update positions
        ctx.save();
        ctx.globalAlpha = 0.7;
        ctx.fillStyle = "#333";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1;
        ctx.fillStyle = "#fff";
        ctx.font = "48px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Paused", canvas.width / 2, canvas.height / 2);
        ctx.restore();
    }
    requestAnimationFrame(loop);
}

// Start game
loop();
