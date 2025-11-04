// --- Global Variables and Constants ---
let board = ["", "", "", "", "", "", "", "", ""]; // Represents the 3x3 board state
let currentPlayer = "X"; // Tracks the current player ('X' or 'O')
let isGameActive = true; // Flag to stop the game after a win or tie

// DOM Elements - Selected once for efficiency
const boardElement = document.getElementById('game-board');
const statusDisplay = document.getElementById('status-display');
const resetButton = document.getElementById('reset-button');
const messageModal = document.getElementById('message-modal');
const modalText = document.getElementById('modal-text');
const modalCloseButton = document.getElementById('modal-close-button');
const winningLine = document.getElementById('winning-line'); // The dashed line element

// Winning combinations (indices of the board array)
const winningConditions = [
    [0, 1, 2], // Row 1
    [3, 4, 5], // Row 2
    [6, 7, 8], // Row 3
    [0, 3, 6], // Column 1
    [1, 4, 7], // Column 2
    [2, 5, 8], // Column 3
    [0, 4, 8], // Diagonal 1 (Top-Left to Bottom-Right)
    [2, 4, 6]  // Diagonal 2 (Top-Right to Bottom-Left)
];

// --- Utility Functions ---

/**
 * Updates the text in the status display area.
 * @param {string} message - The HTML content to display.
 * @param {string} colorClass - Tailwind class for text color.
 */
const updateStatus = (message, colorClass = 'text-gray-600') => {
    statusDisplay.innerHTML = `<span class="${colorClass}">${message}</span>`;
};

/**
 * Shows the custom modal with a message and stops the game.
 * @param {string} message - The message text for the modal.
 * @param {string} colorClass - Tailwind class for text color in modal.
 */
const showModal = (message, colorClass = 'text-gray-800') => {
    isGameActive = false;
    modalText.innerHTML = `<p class="${colorClass}">${message}</p>`;
    messageModal.style.display = 'flex';
};

/**
 * Handles the click on the modal close button, hiding the modal and restarting the game.
 */
const handleModalClose = () => {
    messageModal.style.display = 'none';
    handleRestartGame();
};

// --- Line Drawing Logic (Custom Sketchy Effect) ---

/**
 * Calculates and applies the style to draw the winning line with gaps at the ends.
 * @param {number[]} condition - The winning cell indices.
 * @param {string} player - The winning player ('X' or 'O').
 */
const drawWinningLine = (condition, player) => {
    let width, transform;
    let top = '50%';
    let left = '50%';
    
    // Widths are set to less than 100%/141% to create the 'a --- b' gap effect
    const rowColWidth = '90%'; // 90% of the board's width
    const diagWidth = '130%';  // 130% of the board's width (scaled for diagonal)

    // Determine the line's position and rotation based on the condition
    const [c1, c2, c3] = condition;

    if (c1 === 0 && c2 === 1) { // Row 1 (0, 1, 2)
        top = '16.67%'; // Positioned at the center of the first row
        width = rowColWidth;
        transform = 'translate(-50%, -50%) rotate(0deg)';
    } else if (c1 === 3 && c2 === 4) { // Row 2 (3, 4, 5)
        top = '50%'; // Positioned at the center of the second row
        width = rowColWidth;
        transform = 'translate(-50%, -50%) rotate(0deg)';
    } else if (c1 === 6 && c2 === 7) { // Row 3 (6, 7, 8)
        top = '83.33%'; // Positioned at the center of the third row
        width = rowColWidth;
        transform = 'translate(-50%, -50%) rotate(0deg)';
    } else if (c1 === 0 && c2 === 3) { // Col 1 (0, 3, 6)
        left = '16.67%'; // Positioned at the center of the first column
        width = rowColWidth;
        transform = 'translate(-50%, -50%) rotate(90deg)';
    } else if (c1 === 1 && c2 === 4) { // Col 2 (1, 4, 7)
        left = '50%'; // Positioned at the center of the second column
        width = rowColWidth;
        transform = 'translate(-50%, -50%) rotate(90deg)';
    } else if (c1 === 2 && c2 === 5) { // Col 3 (2, 5, 8)
        left = '83.33%'; // Positioned at the center of the third column
        width = rowColWidth;
        transform = 'translate(-50%, -50%) rotate(90deg)';
    } else if (c1 === 0 && c2 === 4) { // Diag 1 (0, 4, 8)
        width = diagWidth; 
        transform = 'translate(-50%, -50%) rotate(45deg)';
    } else if (c1 === 2 && c2 === 4) { // Diag 2 (2, 4, 6)
        width = diagWidth;
        transform = 'translate(-50%, -50%) rotate(-45deg)';
    }
    
    // Apply line class for dashed background image and color
    winningLine.classList.remove('line-x', 'line-o');
    winningLine.classList.add(player === 'X' ? 'line-x' : 'line-o');
    
    // Apply calculated styles to make the line appear
    winningLine.style.width = width;
    winningLine.style.top = top;
    winningLine.style.left = left;
    winningLine.style.transform = transform;
    winningLine.style.display = 'block';
};

// --- Game Logic Functions ---

/**
 * Initializes the game board by creating 9 interactive cell buttons.
 */
const initializeBoard = () => {
    // Clear the board, preserving the winning-line element
    boardElement.innerHTML = '';
    boardElement.appendChild(winningLine);
    
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('button');
        cell.className = 'cell';
        cell.setAttribute('data-index', i);
        // Each cell contains a content span to hold the X or O marker
        cell.innerHTML = '<span class="cell-content"></span>';
        cell.addEventListener('click', handleCellClick);
        
        boardElement.appendChild(cell);
    }
};

/**
 * Handles the action when a cell is clicked, placing the marker and checking for results.
 */
const handleCellClick = (event) => {
    const clickedCell = event.currentTarget;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

    // Ignore clicks if the cell is already filled or the game is over
    if (board[clickedCellIndex] !== "" || !isGameActive) {
        return;
    }

    // Update state and UI
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

/**
 * Updates the visual representation of the cell by adding the X or O marker.
 * @param {HTMLElement} cell - The cell button element.
 * @param {string} player - The current player ('X' or 'O').
 */
const updateCellUI = (cell, player) => {
    const contentSpan = cell.querySelector('.cell-content');
    contentSpan.textContent = player;
    contentSpan.classList.add(player === 'X' ? 'x-mark' : 'o-mark');
    cell.disabled = true; // Disable the cell after a move
};

/**
 * Checks the board state against the winning conditions.
 * @returns {string} - 'win', 'tie', or 'continue'.
 */
const checkGameResult = () => {
    let roundWon = false;
    let winningCondition = null;
    
    // Check all winning conditions
    for (let i = 0; i < winningConditions.length; i++) {
        const condition = winningConditions[i];
        let [a, b, c] = condition.map(index => board[index]);

        // If any cell in the condition is empty, move to the next condition
        if (a === '' || b === '' || c === '') {
            continue;
        }
        
        // Check for three in a row
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
    
    // Check for a tie (no empty cells left)
    let roundTied = !board.includes("");
    if (roundTied) {
        return 'tie';
    }

    return 'continue';
};

/**
 * Visually highlights the three winning cells and draws the sketchy line.
 * @param {number[]} condition - The indices of the winning cells.
 */
const highlightWinningCells = (condition) => {
    condition.forEach(index => {
        const cell = boardElement.querySelector(`[data-index="${index}"]`);
        if (cell) {
            cell.classList.add('winning-cell');
        }
    });
    
    drawWinningLine(condition, currentPlayer); 

    // Disable all cells to end interaction
    boardElement.querySelectorAll('.cell').forEach(cell => cell.disabled = true);
}

/**
 * Switches the current player and updates the status display.
 */
const changePlayer = () => {
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    const playerColor = currentPlayer === 'X' ? 'text-red-500' : 'text-blue-500';
    updateStatus(`Player <span class="${playerColor} font-bold">${currentPlayer}</span>'s Turn to Draw`, 'text-gray-600');
};

/**
 * Resets all game variables and the UI for a new round (Restart Drawing).
 */
const handleRestartGame = () => {
    // 1. Reset variables
    isGameActive = true;
    board = ["", "", "", "", "", "", "", "", ""];
    currentPlayer = "X";
    
    // 2. Hide the winning line
    const currentWinningLine = document.getElementById('winning-line');
    if (currentWinningLine) {
        currentWinningLine.style.display = 'none';
    }

    // 3. Reset UI of cells
    const cells = boardElement.querySelectorAll('.cell');
    cells.forEach(cell => {
        const contentSpan = cell.querySelector('.cell-content');
        contentSpan.textContent = "";
        contentSpan.classList.remove('x-mark', 'o-mark');
        cell.classList.remove('winning-cell');
        cell.disabled = false; // Re-enable the cell for play
    });
    
    // 4. Update status (always starts with X)
    updateStatus(`Player <span class="text-red-500 font-bold">X</span>'s Turn to Draw`, 'text-gray-600');
};


// --- Event Listeners and Initialization ---

/**
 * Initializes the game when the window loads.
 */
window.onload = () => {
    // 1. Create the board structure
    initializeBoard();
    
    // 2. Attach handlers to the restart button and modal close button
    resetButton.addEventListener('click', handleRestartGame);
    modalCloseButton.addEventListener('click', handleModalClose);
    
    // 3. Set the initial status
    updateStatus(`Player <span class="text-red-500 font-bold">X</span>'s Turn to Draw`, 'text-gray-600');
};
