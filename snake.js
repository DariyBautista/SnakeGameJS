const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startGameBtn = document.getElementById('startGameBtn');
const scoreDisplay = document.getElementById('score');
const gameOverDiv = document.getElementById('gameOver');
const usernameInput = document.getElementById('username');
const submitScoreBtn = document.getElementById('submitScore');
const leaderboardList = document.getElementById('leaderboardList');

let snake;
let apple;
let score = 0;
let gameInterval;
let gameOver = false;
let gameStarted = false; 
let firstKeyPress = false; 
let isPaused = false; 
let gameSpeed = 200;
let walls = [];

const CELL_SIZE = 30;
const POINTS_PER_APPLE = 10;
let snakeHeadImg = new Image();
snakeHeadImg.src = "images/snake_head.png"; 
let appleImg = new Image();
appleImg.src = "images/apple.png"; 

// Функція для збереження результату в localStorage
function saveScore(name, score) {
    let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
    leaderboard.push({ name, score });
    leaderboard.sort((a, b) => b.score - a.score); 
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
    displayLeaderboard();
}

// Функція для відображення лідерборду
function displayLeaderboard() {
    let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
    leaderboardList.innerHTML = ''; 
    leaderboard.forEach(entry => {
        let li = document.createElement('li');
        li.textContent = `${entry.name}: ${entry.score} points`;
        leaderboardList.appendChild(li);
    });
}

// Функція для вибору рівня
function selectLevel(level) {
    walls = []; 
    switch (level) {
        case 1:
            gameSpeed = 100; 
            break;
        case 2:
            gameSpeed = 100; 
            createWallsForLevel2(); 
            break;
        case 3:
            gameSpeed = 100; 
            createWallsForLevel3(); 
            break;
    }
}

// Функція для початку гри
function startGame() {
    snake = new Snake();
    apple = new Apple();
    score = 0;
    gameOver = false;
    gameStarted = false; 
    firstKeyPress = false; 
    isPaused = false; 
    scoreDisplay.textContent = `Points: ${score}`;
    gameOverDiv.style.display = 'none';
    clearInterval(gameInterval);
    drawInitialGame(); 
    gameInterval = setInterval(updateGame, gameSpeed);
}

// Функція для завершення гри
function endGame() {
    gameOver = true;
    clearInterval(gameInterval);
    gameOverDiv.style.display = 'block'; 
}

// Клас змії
class Snake {
    constructor() {
        this.body = [{ x: 9, y: 9 }];
        this.direction = { x: 0, y: -1 };
        this.rotation = 180; 
    }

    move() {
        const head = { x: this.body[0].x + this.direction.x, y: this.body[0].y + this.direction.y };
        
        // Перевірка на зіткнення зі стінами
        if (head.x < 0 || head.y < 0 || head.x >= canvas.width / CELL_SIZE || head.y >= canvas.height / CELL_SIZE || this.checkCollision(head) || checkWallCollision(head)) {
            endGame();
        } else {
            this.body.unshift(head);
            if (head.x === apple.position.x && head.y === apple.position.y) {
                score += POINTS_PER_APPLE;
                scoreDisplay.textContent = `Points: ${score}`;
                apple = new Apple(); 
            } else {
                this.body.pop(); 
            }
        }
    }

    checkCollision(head) {
        return this.body.some(segment => segment.x === head.x && segment.y === head.y);
    }

    changeDirection(newDirection, rotation) {
        if (newDirection.x !== -this.direction.x || newDirection.y !== -this.direction.y) {
            this.direction = newDirection;
            this.rotation = rotation;
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.body[0].x * CELL_SIZE + CELL_SIZE / 2, this.body[0].y * CELL_SIZE + CELL_SIZE / 2);
        ctx.rotate((this.rotation * Math.PI) / 180); 
        ctx.drawImage(snakeHeadImg, -CELL_SIZE / 2, -CELL_SIZE / 2, CELL_SIZE, CELL_SIZE);
        ctx.restore();

        ctx.fillStyle = '#90EE90'; 
        this.body.slice(1).forEach(segment => {
            ctx.fillRect(segment.x * CELL_SIZE, segment.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        });
    }
}

// Клас яблука
class Apple {
    constructor() {
        this.position = this.generateValidPosition();
    }

    generateValidPosition() {
        let position;
        do {
            position = {
                x: Math.floor(Math.random() * (canvas.width / CELL_SIZE)),
                y: Math.floor(Math.random() * (canvas.height / CELL_SIZE))
            };
        } while (this.isInsideWall(position)); 
        return position;
    }

    isInsideWall(position) {
        return walls.some(wall => wall.x === position.x && wall.y === position.y);
    }

    draw() {
        ctx.drawImage(appleImg, this.position.x * CELL_SIZE, this.position.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    }
}


// Функція для перевірки зіткнення зі стінами
function checkWallCollision(head) {
    return walls.some(wall => wall.x === head.x && wall.y === head.y);
}

// Функції для створення стін
function createWallsForLevel2() {
    walls.push({ x: 5, y: 5 });
    walls.push({ x: 6, y: 5 });
    walls.push({ x: 7, y: 5 });
    walls.push({ x: 9, y: 5 });
    walls.push({ x: 10, y: 7 });
    walls.push({ x: 10, y: 8 });
    walls.push({ x: 12, y: 10 });
    walls.push({ x: 12, y: 11 });
    walls.push({ x: 15, y: 5 });
    walls.push({ x: 15, y: 6 });
    walls.push({ x: 18, y: 8 });
    walls.push({ x: 18, y: 9 });
    walls.push({ x: 20, y: 5 });
    walls.push({ x: 20, y: 7 });
}

function createWallsForLevel3() {
    for (let i = 3; i < 15; i++) {
        walls.push({ x: i, y: 5 });
    }
    for (let i = 0; i < 10; i++) {
        walls.push({ x: 3, y: i });
    }
    walls.push({ x: 10, y: 15 });
    walls.push({ x: 11, y: 15 });
    walls.push({ x: 12, y: 15 });
    walls.push({ x: 12, y: 14 });
    walls.push({ x: 13, y: 14 });
    walls.push({ x: 14, y: 14 });
    walls.push({ x: 14, y: 12 });
    walls.push({ x: 14, y: 13 });
}

// Оновлення гри
function updateGame() {
    if (!gameOver && firstKeyPress && !isPaused) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        snake.move();
        snake.draw();
        apple.draw();
        drawWalls(); 
    }
    if (isPaused) {
        drawPauseScreen(); 
    }
}

// Малюємо початковий стан гри
function drawInitialGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    snake.draw();
    apple.draw();
    drawWalls(); 
}

// Функція для малювання стін
function drawWalls() {
    ctx.fillStyle = 'black'; 
    walls.forEach(wall => {
        ctx.fillRect(wall.x * CELL_SIZE, wall.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    });
}

const FONT_STYLE = '48px "Press Start 2P", cursive'; 

// Функція для малювання екрану паузи
function drawPauseScreen() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height); 
    ctx.fillStyle = 'white';
    ctx.font = FONT_STYLE; 
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Pause', canvas.width / 2, canvas.height / 2); 
}

// Збереження результату після завершення гри
submitScoreBtn.addEventListener('click', () => {
    const username = usernameInput.value.trim();
    if (username) {
        saveScore(username, score);
        gameOverDiv.style.display = 'none';
        usernameInput.value = ''; 
    }
});

// Старт гри при натисканні на кнопку
startGameBtn.addEventListener('click', startGame);

// Відображення лідерборду при завантаженні сторінки
window.addEventListener('load', displayLeaderboard);

// Вибір рівня гри
document.getElementById('level1Btn').addEventListener('click', () => { selectLevel(1); });
document.getElementById('level2Btn').addEventListener('click', () => { selectLevel(2); });
document.getElementById('level3Btn').addEventListener('click', () => { selectLevel(3); });

// Обробка натискань клавіш
window.addEventListener('keydown', (event) => {
    if (event.code.startsWith('Arrow')) {
        event.preventDefault();
    }
    
    if (!firstKeyPress && !gameOver) {
        firstKeyPress = true; 
        gameStarted = true;
        clearInterval(gameInterval);
        gameInterval = setInterval(updateGame, gameSpeed);
        
    }
    
    if (!firstKeyPress) {
        firstKeyPress = true; 
    }

    if (event.key === 'ArrowUp') {
        snake.changeDirection({ x: 0, y: -1 }, 180); 
    } else if (event.key === 'ArrowDown') {
        snake.changeDirection({ x: 0, y: 1 }, 0); 
    } else if (event.key === 'ArrowLeft') {
        snake.changeDirection({ x: -1, y: 0 }, 90); 
    } else if (event.key === 'ArrowRight') {
        snake.changeDirection({ x: 1, y: 0 }, 270); 
    } else if (event.key === 'p' || event.key === 'KeyP') { 
        isPaused = !isPaused; 
    }
});
