const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
context.scale(20, 20); // 240x400 canvas, 12x20 grid

// Tetromino shapes
const tetrominos = [
    [[1,1,1,1]],                       // I
    [[2,2],[2,2]],                     // O
    [[0,3,0],[3,3,3]],                 // T
    [[0,4,4],[4,4,0]],                 // S
    [[5,5,0],[0,5,5]],                 // Z
    [[6,0,0],[6,6,6]],                 // J
    [[0,0,7],[7,7,7]]                  // L
];
const colors = [
    null,
    '#00f0f0', // I
    '#f0f000', // O
    '#a000f0', // T
    '#00f000', // S
    '#f00000', // Z
    '#0000f0', // J
    '#f0a000'  // L
];

function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                context.fillStyle = colors[value];
                context.fillRect(x + offset.x, y + offset.y, 1, 1);
                context.strokeStyle = "#222";
                context.strokeRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}

function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

function collide(arena, player) {
    const m = player.matrix;
    const o = player.pos;
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] &&
                (arena[y + o.y] &&
                 arena[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
        }
    }
    if (dir > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
}

function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenaSweep();
        updateScore();
    }
    dropCounter = 0;
}

function playerMove(dir) {
    player.pos.x += dir;
    if (collide(arena, player)) {
        player.pos.x -= dir;
    }
}

function playerRotate(dir) {
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
    while (collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
}

function playerReset() {
    const idx = Math.floor(Math.random() * tetrominos.length);
    player.matrix = tetrominos[idx].map(row => row.slice());
    player.pos.y = 0;
    player.pos.x = Math.floor(arena[0].length / 2) - Math.floor(player.matrix[0].length / 2);
    if (collide(arena, player)) {
        arena.forEach(row => row.fill(0));
        score = 0;
        updateScore();
    }
}

function arenaSweep() {
    let rowCount = 1;
    for (let y = arena.length - 1; y >= 0; --y) {
        if (arena[y].every(v => v !== 0)) {
            arena.splice(y, 1);
            arena.unshift(new Array(arena[0].length).fill(0));
            score += rowCount * 10;
            rowCount *= 2;
        }
    }
}

function draw() {
    context.fillStyle = "#111";
    context.fillRect(0, 0, canvas.width, canvas.height);
    drawMatrix(arena, {x:0, y:0});
    drawMatrix(player.matrix, player.pos);
}

function updateScore() {
    document.title = "Tetris - Score: " + score;
}

let arena = createMatrix(12, 20);

let player = {
    pos: {x:0, y:0},
    matrix: null
};

let dropCounter = 0;
let dropInterval = 700;
let lastTime = 0;
let score = 0;

function update(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;
    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop();
    }
    draw();
    requestAnimationFrame(update);
}

document.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') {
        playerMove(-1);
    } else if (event.key === 'ArrowRight') {
        playerMove(1);
    } else if (event.key === 'ArrowDown') {
        playerDrop();
    } else if (event.key === 'q') {
        playerRotate(-1);
    } else if (event.key === 'w' || event.key === 'ArrowUp') {
        playerRotate(1);
    }
});

playerReset();
updateScore();
update();
