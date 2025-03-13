let playerScore = 0;
let botScore = 0;
let solution = [];
let puzzle = [];
let isPlayerTurn = true;
let filledCells = new Map();

function showStatusMessage(message, isSuccess) {
    const statusElement = document.getElementById('statusMessage');
    statusElement.textContent = message;
    statusElement.className = 'status-message ' + (isSuccess ? 'success-message' : 'error-message');
    setTimeout(() => {
        statusElement.textContent = '';
        statusElement.className = 'status-message';
    }, 2000);
}

function generateSudoku() {
    solution = Array(9).fill().map(() => Array(9).fill(0));
    puzzle = Array(9).fill().map(() => Array(9).fill(0));
    filledCells.clear();
    
    for(let i = 0; i < 9; i += 3) {
        fillBox(i, i);
    }
    
    solveSudoku(solution);
    createPuzzle();
}

function fillBox(row, col) {
    let nums = [1,2,3,4,5,6,7,8,9];
    for(let i = 0; i < 3; i++) {
        for(let j = 0; j < 3; j++) {
            let idx = Math.floor(Math.random() * nums.length);
            solution[row + i][col + j] = nums[idx];
            nums.splice(idx, 1);
        }
    }
}

function solveSudoku(grid) {
    let row = 0;
    let col = 0;
    let isEmpty = true;
    
    for(let i = 0; i < 9; i++) {
        for(let j = 0; j < 9; j++) {
            if(grid[i][j] === 0) {
                row = i;
                col = j;
                isEmpty = false;
                break;
            }
        }
        if(!isEmpty) break;
    }
    
    if(isEmpty) return true;
    
    for(let num = 1; num <= 9; num++) {
        if(isSafe(grid, row, col, num)) {
            grid[row][col] = num;
            if(solveSudoku(grid)) return true;
            grid[row][col] = 0;
        }
    }
    return false;
}

function isSafe(grid, row, col, num) {
    for(let i = 0; i < 9; i++) {
        if(grid[row][i] === num) return false;
    }
    
    for(let i = 0; i < 9; i++) {
        if(grid[i][col] === num) return false;
    }
    
    let boxRow = row - row % 3;
    let boxCol = col - col % 3;
    
    for(let i = 0; i < 3; i++) {
        for(let j = 0; j < 3; j++) {
            if(grid[boxRow + i][boxCol + j] === num) return false;
        }
    }
    
    return true;
}

function createPuzzle() {
    for(let i = 0; i < 9; i++) {
        for(let j = 0; j < 9; j++) {
            if(Math.random() > 0.4) {
                puzzle[i][j] = solution[i][j];
                filledCells.set(`${i}-${j}`, Math.random() > 0.5 ? 'player' : 'bot');
            }
        }
    }
}

function updateTurnIndicator() {
    const indicator = document.getElementById('turnIndicator');
    if(isPlayerTurn) {
        indicator.textContent = '🎮 Giliran Zerina';
        indicator.className = 'turn-indicator player-turn-indicator';
    } else {
        indicator.textContent = '🤖 Giliran Bot';
        indicator.className = 'turn-indicator bot-turn-indicator';
    }
}

function createBoard() {
    const grid = document.getElementById('sudokuGrid');
    grid.innerHTML = '';
    
    for(let i = 0; i < 9; i++) {
        for(let j = 0; j < 9; j++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            
            if(puzzle[i][j] === 0) {
                const input = document.createElement('input');
                input.type = 'number';
                input.min = 1;
                input.max = 9;
                input.dataset.row = i;
                input.dataset.col = j;
                input.addEventListener('change', checkAnswer);
                cell.appendChild(input);
            } else {
                cell.textContent = puzzle[i][j];
                const fillType = filledCells.get(`${i}-${j}`);
                if(fillType === 'player') {
                    cell.classList.add('filled-by-player');
                } else if(fillType === 'bot') {
                    cell.classList.add('filled-by-bot');
                }
            }
            
            grid.appendChild(cell);
        }
    }
    
    updateTurnIndicator();
}

function checkAnswer(e) {
    if(!isPlayerTurn) return;

    const row = parseInt(e.target.dataset.row);
    const col = parseInt(e.target.dataset.col);
    const value = parseInt(e.target.value);
    
    if(value === solution[row][col]) {
        playerScore += 10;
        puzzle[row][col] = value;
        filledCells.set(`${row}-${col}`, 'player');
        showStatusMessage('Zerina berhasil menaruh angka!', true);
        
        document.getElementById('playerScore').textContent = playerScore;
        isPlayerTurn = false;
        createBoard();
        
        setTimeout(botPlay, 1000);
    } else {
        e.target.value = '';
        showStatusMessage('Zerina salah menaruh angka!', false);
        isPlayerTurn = false;
        setTimeout(botPlay, 1000);
    }
    
    checkWinner();
}

function botPlay() {
    let emptyCells = [];
    for(let i = 0; i < 9; i++) {
        for(let j = 0; j < 9; j++) {
            if(puzzle[i][j] === 0) {
                emptyCells.push([i, j]);
            }
        }
    }
    
    if(emptyCells.length > 0) {
        const [row, col] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        puzzle[row][col] = solution[row][col];
        filledCells.set(`${row}-${col}`, 'bot');
        botScore += 5;
        document.getElementById('botScore').textContent = botScore;
        showStatusMessage('Bot berhasil menaruh angka!', true);
        
        isPlayerTurn = true;
        createBoard();
    }
    
    checkWinner();
}

function checkWinner() {
    let completed = true;
    for(let i = 0; i < 9; i++) {
        for(let j = 0; j < 9; j++) {
            if(puzzle[i][j] === 0) {
                completed = false;
                break;
            }
        }
    }
    
    if(completed) {
        if(playerScore > botScore) {
            alert('Selamat! Zerina memenangkan pertandingan dengan skor ' + playerScore + ' melawan ' + botScore + '!');
            showNextMessageButton();
        } else {
            alert('Bot menang dengan skor ' + botScore + ' melawan ' + playerScore + '! Coba lagi?');
            showTryAgainButton();
        }
    }
}

function showNextMessageButton() {
    document.getElementById('gameScreen').innerHTML = `
        <div class="instructions">
            <h2>Selamat Zerina!</h2>
            <button class="button" onclick="showMessage()">
                Lihat Pesan Selanjutnya
            </button>
        </div>
    `;
}

function showTryAgainButton() {
    document.getElementById('gameScreen').innerHTML = `
        <div class="instructions">
            <h2>Jangan Menyerah!</h2>
            <button class="button" onclick="resetGame()">
                Main Lagi
            </button>
        </div>
    `;
}

function showMessage() {
    document.getElementById('gameScreen').style.display = 'none';
    document.getElementById('messageScreen').style.display = 'block';
   

}

function startGame() {
    document.getElementById('welcomeScreen').style.display = 'none';
    document.getElementById('gameScreen').style.display = 'block';
    playerScore = 0;
    botScore = 0;
    isPlayerTurn = true;
    generateSudoku();
    createBoard();
}

function resetGame() {
    playerScore = 0;
    botScore = 0;
    isPlayerTurn = true;
    document.getElementById('playerScore').textContent = '0';
    document.getElementById('botScore').textContent = '0';
    generateSudoku();
    createBoard();
}