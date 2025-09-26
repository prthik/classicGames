const canvas = document.getElementById('snake');
const ctx = canvas.getContext('2d');

// Game settings
const gridSize = 20; // 20x20 grid
const tileSize = canvas.width / gridSize;

// Snake properties
let snake = [{ x: 10, y: 10 }];
let direction = { x: 0, y: 0 };
let nextDirection = { x: 0, y: 0 };
let food = { x: 5, y: 5 };
let score = 0;
let gameOver = false;

// Handle keyboard input
document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowUp' && direction.y !== 1) {
        nextDirection = { x: 0, y: -1 };
    } else if (e.key === 'ArrowDown' && direction.y !== -1) {
        nextDirection = { x: 0, y: 1 };
    } else if (e.key === 'ArrowLeft' && direction.x !== 1) {
        nextDirection = { x: -1, y: 0 };
    } else if (e.key === 'ArrowRight' && direction.x !== -1) {
        nextDirection = { x: 1, y: 0 };
    }
    if (gameOver && (e.key === ' ' || e.key === 'Enter')) {
        restartGame();
    }
});

// Main game loop
function gameLoop() {
    if (gameOver) return;
    setTimeout(() => {
        requestAnimationFrame(gameLoop);
        update();
        draw();
    }, 100); // 10 frames/sec
}

function update() {
    direction = nextDirection;

    // Move snake
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

    // Wall collision
    if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize) {
        return endGame();
    }

    // Self collision
    for (let segment of snake) {
        if (head.x === segment.x && head.y === segment.y) {
            return endGame();
        }
    }

    snake.unshift(head);

    // Food collision
    if (head.x === food.x && head.y === food.y) {
        score++;
        placeFood();
    } else {
        snake.pop();
    }
}

function draw() {
    // Clear canvas
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw food
    ctx.fillStyle = "#f00";
    ctx.fillRect(food.x * tileSize, food.y * tileSize, tileSize, tileSize);

    // Draw snake
    ctx.fillStyle = "#0f0";
    snake.forEach((segment, i) => {
        ctx.fillRect(segment.x * tileSize, segment.y * tileSize, tileSize, tileSize);
        // Give the head a slightly brighter color
        if (i === 0) {
            ctx.strokeStyle = "#fff";
            ctx.lineWidth = 2;
            ctx.strokeRect(segment.x * tileSize, segment.y * tileSize, tileSize, tileSize);
        }
    });

    // Draw score
    ctx.font = "20px Arial";
    ctx.fillStyle = "#fff";
    ctx.fillText("Score: " + score, 10, 30);

    // Draw game over
    if (gameOver) {
        ctx.font = "40px Arial";
        ctx.fillStyle = "#ff0";
        ctx.fillText("Game Over", 70, 200);
        ctx.font = "20px Arial";
        ctx.fillText("Press Space or Enter to Restart", 60, 240);
    }
}

function placeFood() {
    let valid = false;
    while (!valid) {
        food.x = Math.floor(Math.random() * gridSize);
        food.y = Math.floor(Math.random() * gridSize);
        valid = !snake.some(segment => segment.x === food.x && segment.y === food.y);
    }
}

function endGame() {
    gameOver = true;
    document.title = "Snake - Game Over! Score: " + score;
}

function restartGame() {
    snake = [{ x: 10, y: 10 }];
    direction = { x: 0, y: 0 };
    nextDirection = { x: 0, y: 0 };
    score = 0;
    gameOver = false;
    placeFood();
    document.title = "Snake";
    draw();
    gameLoop();
}

// Start game
placeFood();
draw();
gameLoop();
