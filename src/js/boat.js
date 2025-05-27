document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements (ensure these IDs match your HTML) ---
    const gridContainer = document.getElementById('boat-grid-container');
    const takeControlButton = document.getElementById('boat-take-control-button');
    const arrowControlsDiv = document.getElementById('boat-arrow-controls');
    const arrowButtons = document.querySelectorAll('.boat-arrow-button');
    const boatMessageEl = document.getElementById('boat-game-message');
    const gameStatusEl = document.getElementById('boat-game-status');
    const victoryMessageEl = document.getElementById('boat-game-victory');

    // --- Game Configuration ---
    const gridSize = 20; // Or 25
    const cellSizePx = 25; // Adjust for desired visual size
    const playerMoveCooldownMs = 2000; // Player can make a move every 2s
    const currentMoveIntervalMs = 2000; // Currents also move every 2s
    const messageClearDelayMs = 1800;
    const shoreWidth = 2; // How many columns/rows for the shore

    // --- Game State ---
    let boatPosition = { row: Math.floor(gridSize / 2), col: Math.floor(gridSize / 2) };
    let shorePositions = []; // Array of {row, col} for shore cells
    let isManualControl = false;
    let currentIntervalId;
    let playerMoveTimeoutId; // For player move cooldown
    let pendingPlayerMove = null; // { dRow, dCol }
    let isPlayerMoveExecuting = false;
    let messageTimeoutId;
    let gameEnded = false;

    const distractions = [
        "Social Media!", "Unhealthy Food!", "Bad Habits!", "Endless Scrolling!",
        "Procrastination!", "Sudden Urge!", "Global Crisis News!"
    ];

    // --- CSS Variables for Dynamic Sizing ---
    function setCssVariables() {
        document.documentElement.style.setProperty('--boat-grid-size', gridSize);
        document.documentElement.style.setProperty('--boat-cell-size', `${cellSizePx}px`);
        gridContainer.style.width = `${gridSize * cellSizePx}px`;
        gridContainer.style.height = `${gridSize * cellSizePx}px`;
        gridContainer.style.gridTemplateColumns = `repeat(${gridSize}, ${cellSizePx}px)`;
        gridContainer.style.gridTemplateRows = `repeat(${gridSize}, ${cellSizePx}px)`;

        const messageContainerWidth = gridSize * cellSizePx;
        document.getElementById('boat-game-message-container').style.width = `${messageContainerWidth}px`;
    }

    // --- Grid, Shore, and Boat Rendering ---
    function createGrid() {
        setCssVariables();
        gridContainer.innerHTML = '';
        shorePositions = []; // Reset shore positions

        for (let r = 0; r < gridSize; r++) {
            for (let c = 0; c < gridSize; c++) {
                const cell = document.createElement('div');
                cell.classList.add('boat-grid-cell');
                cell.dataset.row = r;
                cell.dataset.col = c;

                // Define shore (e.g., rightmost columns)
                if (c >= gridSize - shoreWidth) {
                    cell.classList.add('shore');
                    shorePositions.push({ row: r, col: c });
                }
                gridContainer.appendChild(cell);
            }
        }
        renderBoat();
    }

    function renderBoat() {
        const oldBoat = gridContainer.querySelector('.boat-entity');
        if (oldBoat) {
            oldBoat.classList.remove('boat-entity');
        }
        const currentCell = gridContainer.querySelector(`[data-row='${boatPosition.row}'][data-col='${boatPosition.col}']`);
        if (currentCell && !currentCell.classList.contains('shore')) { // Don't draw boat on shore cell
            currentCell.classList.add('boat-entity');
        }
    }

    // --- Message Handling ---
    function showMessage(text, isDistraction = false) {
        if (document.hidden && isDistraction) return;
        boatMessageEl.textContent = text;
        boatMessageEl.style.color = isDistraction ? 'red' : '#333';
        if (messageTimeoutId) clearTimeout(messageTimeoutId);
        if (text && text.trim() !== '') {
            messageTimeoutId = setTimeout(() => {
                if (boatMessageEl.textContent === text) {
                    boatMessageEl.textContent = (isManualControl && !gameEnded) ? 'You are steering...' : '';
                }
            }, messageClearDelayMs);
        } else {
            boatMessageEl.textContent = '';
        }
    }

    // --- Movement Logic ---
    async function executeMove(dRow, dCol, moveTypeMessage = "") {
        const newRow = boatPosition.row + dRow;
        const newCol = boatPosition.col + dCol;
        let moved = false;

        if (newRow >= 0 && newRow < gridSize && newCol >= 0 && newCol < gridSize) {
            boatPosition.row = newRow;
            boatPosition.col = newCol;
            moved = true;
        }
        renderBoat();

        if (moveTypeMessage && !document.hidden && !gameEnded) {
            showMessage(moveTypeMessage, moveTypeMessage.includes("!"));
        }
        checkWinCondition();
        await new Promise(resolve => setTimeout(resolve, 100)); // Short delay for visual
    }

    async function handleCurrentMovement() {
        if (gameEnded || document.hidden) return;

        let dRowCurrent, dColCurrent;
        do {
            dRowCurrent = Math.floor(Math.random() * 3) - 1;
            dColCurrent = Math.floor(Math.random() * 3) - 1;
        } while (dRowCurrent === 0 && dColCurrent === 0);

        const randomDistraction = distractions[Math.floor(Math.random() * distractions.length)];
        const currentMoveMessage = isManualControl ? "Currents are strong!" : randomDistraction;
        
        console.log("Current tries to move boat.");
        await executeMove(dRowCurrent, dColCurrent, currentMoveMessage);
    }

    async function handlePlayerMovement() {
        if (!pendingPlayerMove || isPlayerMoveExecuting || gameEnded) return;

        isPlayerMoveExecuting = true;
        updateArrowButtonsState(true); // Disable buttons during move

        console.log("Player move executing:", pendingPlayerMove);
        await executeMove(pendingPlayerMove.dRow, pendingPlayerMove.dCol, 'You steer the boat...');

        // Clear pending move and selected state
        pendingPlayerMove = null;
        arrowButtons.forEach(btn => btn.classList.remove('selected'));
        isPlayerMoveExecuting = false;
        updateArrowButtonsState(false); // Re-enable buttons for next selection (if in control)

        // Restart player move cooldown
        if (isManualControl && !gameEnded) {
            playerMoveTimeoutId = setTimeout(handlePlayerMovement, playerMoveCooldownMs);
        }
    }
    
    // --- Game State & Controls ---
    function checkWinCondition() {
        if (gameEnded) return;
        if (shorePositions.some(pos => pos.row === boatPosition.row && pos.col === boatPosition.col)) {
            gameEnded = true;
            victoryMessageEl.textContent = "You've reached the shore! Well done!";
            showMessage("Congratulations!", false);
            gameStatusEl.textContent = "Goal Reached!";
            stopGameLoops();
            updateArrowButtonsState(true); // Disable all buttons
            takeControlButton.disabled = true;
            return true;
        }
        return false;
    }

    function updateArrowButtonsState(disabled) {
        arrowButtons.forEach(btn => {
            btn.disabled = disabled || !isManualControl || (isPlayerMoveExecuting && !btn.classList.contains('selected'));
            if (isPlayerMoveExecuting && btn.classList.contains('selected')) {
                // Keep the selected button visually active but technically disabled
            } else if (isManualControl && !disabled && !isPlayerMoveExecuting) {
                btn.classList.remove('selected'); // Clear selection if move done or control lost
            }
        });
    }

    takeControlButton.addEventListener('click', () => {
        if (gameEnded) return;
        isManualControl = !isManualControl;
        if (isManualControl) {
            takeControlButton.textContent = 'Release Control';
            takeControlButton.classList.add('active');
            arrowControlsDiv.style.display = 'block';
            gameStatusEl.textContent = 'You have control! Select a direction.';
            showMessage('You are steering...');
            updateArrowButtonsState(false); // Enable arrow buttons
            // Start player move "loop" if not already (it waits for pendingPlayerMove)
            if (!playerMoveTimeoutId && !isPlayerMoveExecuting) {
                 playerMoveTimeoutId = setTimeout(handlePlayerMovement, 0); // Check immediately for a pending move
            }
        } else {
            takeControlButton.textContent = 'Take Control';
            takeControlButton.classList.remove('active');
            arrowControlsDiv.style.display = 'none';
            gameStatusEl.textContent = 'You are being pushed by the currents...';
            showMessage('');
            pendingPlayerMove = null; // Clear any selected move
            arrowButtons.forEach(btn => btn.classList.remove('selected'));
            if (playerMoveTimeoutId) clearTimeout(playerMoveTimeoutId);
            updateArrowButtonsState(true); // Disable arrow buttons
        }
    });

    arrowButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (!isManualControl || isPlayerMoveExecuting || gameEnded) return;

            // Clear previous selection
            arrowButtons.forEach(btn => btn.classList.remove('selected'));
            // Set new selection
            button.classList.add('selected');

            let dRow = 0, dCol = 0;
            const direction = button.dataset.direction;
            if (direction === 'up') dRow = -1;
            else if (direction === 'down') dRow = 1;
            else if (direction === 'left') dCol = -1;
            else if (direction === 'right') dCol = 1;

            pendingPlayerMove = { dRow, dCol };
            showMessage("Direction locked in. Waiting for next move slot...");
            console.log("Player selected move:", pendingPlayerMove);

            // If the player move "loop" isn't active, start it.
            // This handles the first move after taking control.
            if (!playerMoveTimeoutId && !isPlayerMoveExecuting) {
                 clearTimeout(playerMoveTimeoutId); // Clear any stray timeout
                 playerMoveTimeoutId = setTimeout(handlePlayerMovement, playerMoveCooldownMs);
            }
        });
    });

    function startGameLoops() {
        if (currentIntervalId) clearInterval(currentIntervalId);
        currentIntervalId = setInterval(handleCurrentMovement, currentMoveIntervalMs);

        // Player move loop is managed by setTimeout from control toggle / button clicks
    }
    
    function stopGameLoops() {
        if (currentIntervalId) clearInterval(currentIntervalId);
        if (playerMoveTimeoutId) clearTimeout(playerMoveTimeoutId);
    }

    // --- Tab Visibility ---
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            console.log("Boat game tab hidden.");
        } else {
            console.log("Boat game tab visible.");
            if (isManualControl && !gameEnded) showMessage('You are steering...');
        }
    });

    // --- Initialization ---
    function initGame() {
        gameEnded = false;
        isManualControl = false; // Start without control
        boatPosition = { row: Math.floor(gridSize / 2), col: Math.floor(gridSize / 2) };
        pendingPlayerMove = null;
        isPlayerMoveExecuting = false;
        victoryMessageEl.textContent = "";
        gameStatusEl.textContent = 'You are being pushed by the currents...';
        takeControlButton.textContent = 'Take Control';
        takeControlButton.classList.remove('active');
        takeControlButton.disabled = false;
        arrowControlsDiv.style.display = 'none';
        arrowButtons.forEach(btn => {
            btn.classList.remove('selected');
            btn.disabled = true;
        });

        createGrid(); // This also calls setCssVariables and renderBoat
        startGameLoops();
    }

    initGame(); // Initialize the game on load
});