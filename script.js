let board = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";
let isGameActive = true;

const boardElement = document.getElementById('game-board');
const statusDisplay = document.getElementById('status-display');
const resetButton = document.getElementById('reset-button');
const messageModal = document.getElementById('message-modal');
const modalText = document.getElementById('modal-text');
const modalCloseButton = document.getElementById('modal-close-button');
const winningLine = document.getElementById('winning-line');

const winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

const updateStatus = (message, colorClass = 'text-gray-600') => {
    statusDisplay.innerHTML = `<span class="${colorClass}">${message}</span>`;
};

const showModal = (message, colorClass = 'text-gray-800') => {
    isGameActive = false;
    modalText.innerHTML = `<p class="${colorClass}">${message}</p>`;
    messageModal.style.display = 'flex';
};

const handleModalClose = () => {
    messageModal.style.display = 'none';
    handleRestartGame();
};

const drawWinningLine = (condition, player) => {
    let width, transform;
    let top = '50%';
    let left = '50%';
    const rowColWidth = '90%';
    const diagWidth = '130%';
    const [c1, c2, c3] = condition;

    if (c1 === 0 && c2 === 1) {
        top = '16.67%';
        width = rowColWidth;
        transform = 'translate(-50%, -50%) rotate(0deg)';
    } else if (c1 === 3 && c2 === 4) {
        top = '50%';
        width = rowColWidth;
        transform = 'translate(-50%, -50%) rotate(0deg)';
    } else if (c1 === 6 && c2 === 7) {
        top = '83.33%';
        width = rowColWidth;
        transform = 'translate(-50%, -50%) rotate(0deg)';
    } else if (c1 === 0 && c2 === 3) {
        left = '16.67%';
        width = rowColWidth;
        transform = 'translate(-50%, -50%) rotate(90deg)';
    } else if (c1 === 1 && c2 === 4) {
        left = '50%';
        width = rowColWidth;
        transform = 'translate(-50%, -50%) rotate(90deg)';
    } else if (c1 === 2 && c2 === 5) {
        left = '83.33%';
        width = rowColWidth;
        transform = 'translate(-50%, -50%) rotate(90deg)';
    } else if (c1 === 0 && c2 === 4) {
        width = diagWidth; 
        transform = 'translate(-50%, -50%) rotate(45deg)';
    } else if (c1 === 2 && c2 === 4) {
        width = diagWidth;
        transform = 'translate(-50%, -50%) rotate(-45deg)';
    }
    winningLine.classList.remove('line-x', 'line-o');
    winningLine.classList.add(player === 'X' ? 'line-x' : 'line-o');
    winningLine.style.width = width;
    winningLine.style.top = top;
    winningLine.style.left = left;
    winningLine.style.transform = transform;
    winningLine.style.display = 'block';
};

const initializeBoard = () => {
    boardElement.innerHTML = '';
    boardElement.appendChild(winningLine);
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('button');
        cell.className = 'cell';
        cell.setAttribute('data-index', i);
        cell.innerHTML = '<span class="cell-content"></span>';
        cell.addEventListener('click', handleCellClick);
        boardElement.appendChild(cell);
    }
};

const handleCellClick = (event) => {
    const clickedCell = event.currentTarget;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));
    if (board[clickedCellIndex] !== "" || !isGameActive) {
        return;
    }
    board[clickedCellIndex] = currentPlayer;
    updateCellUI(clickedCell, currentPlayer);
    const result = checkGameResult();
    if (result === 'win') {
        const message = currentPlayer === 'X' 
            ? `Woohoo! The red pen <span class="font-bold">X</span> is the best doodler!` 
            : `Nice one! The blue circle <span class="font-bold">O</span> is the master sketcher!`;
        showModal(message, currentPlayer === 'X' ? 'text-red-500' : 'text-blue-500');
    } else if (result === 'tie') {
        showModal('A full page! Time for a new drawing.', 'text-gray-800');
    } else {
        changePlayer();
    }
};

const updateCellUI = (cell, player) => {
    const contentSpan = cell.querySelector('.cell-content');
    contentSpan.textContent = player;
    contentSpan.classList.add(player === 'X' ? 'x-mark' : 'o-mark');
    cell.disabled = true;
};

const checkGameResult = () => {
    let roundWon = false;
    let winningCondition = null;
    for (let i = 0; i < winningConditions.length; i++) {
        const condition = winningConditions[i];
        let [a, b, c] = condition.map(index => board[index]);
        if (a === '' || b === '' || c === '') {
            continue;
        }
        if (a === b && b === c) {
            roundWon = true;
            winningCondition = condition;
            break;
        }
    }
    if (roundWon) {
        highlightWinningCells(winningCondition);
        return 'win';
    }
    let roundTied = !board.includes("");
    if (roundTied) {
        return 'tie';
    }
    return 'continue';
};

const highlightWinningCells = (condition) => {
    condition.forEach(index => {
        const cell = boardElement.querySelector(`[data-index="${index}"]`);
        if (cell) {
            cell.classList.add('winning-cell');
        }
    });
    drawWinningLine(condition, currentPlayer); 
    boardElement.querySelectorAll('.cell').forEach(cell => cell.disabled = true);
}

const changePlayer = () => {
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    const playerColor = currentPlayer === 'X' ? 'text-red-500' : 'text-blue-500';
    updateStatus(`Player <span class="${playerColor} font-bold">${currentPlayer}</span>'s Turn to Draw`, 'text-gray-600');
};

const handleRestartGame = () => {
    isGameActive = true;
    board = ["", "", "", "", "", "", "", "", ""];
    currentPlayer = "X";
    const currentWinningLine = document.getElementById('winning-line');
    if (currentWinningLine) {
        currentWinningLine.style.display = 'none';
    }
    const cells = boardElement.querySelectorAll('.cell');
    cells.forEach(cell => {
        const contentSpan = cell.querySelector('.cell-content');
        contentSpan.textContent = "";
        contentSpan.classList.remove('x-mark', 'o-mark');
        cell.classList.remove('winning-cell');
        cell.disabled = false;
    });
    updateStatus(`Player <span class="text-red-500 font-bold">X</span>'s Turn to Draw`, 'text-gray-600');
};

window.onload = () => {
    initializeBoard();
    resetButton.addEventListener('click', handleRestartGame);
    modalCloseButton.addEventListener('click', handleModalClose);
    updateStatus(`Player <span class="text-red-500 font-bold">X</span>'s Turn to Draw`, 'text-gray-600');
};
