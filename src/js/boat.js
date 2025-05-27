document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const gridContainer = document.getElementById('boat-grid-container');
    const takeControlButton = document.getElementById('boat-take-control-button');
    const arrowControlsDiv = document.getElementById('boat-arrow-controls');
    const arrowButtons = document.querySelectorAll('.boat-arrow-button');
    const boatMessageEl = document.getElementById('boat-game-message');
    const gameStatusEl = document.getElementById('boat-game-status');
    const victoryMessageEl = document.getElementById('boat-game-victory');

    // --- Game Configuration ---
    const gridSize = 20;
    const cellSizePx = 25;
    const actionIntervalMs = 2000; 
    const visualMoveDurationMs = 300; // How long the boat "slides"
    const messageClearDelayMs = actionIntervalMs - 200;
    const shoreWidth = 2;

    // --- Game State ---
    let boatPosition = { row: Math.floor(gridSize / 2), col: Math.floor(gridSize / 2) };
    let shorePositions = [];
    let isManualControl = false;
    let gameTickIntervalId;
    let pendingPlayerAction = null; // { dRow, dCol, buttonElement }
    let isActionAnimating = false;  // True ONLY during the visualMoveDurationMs
    let messageTimeoutId;
    let gameEnded = false;

    const distractions = [ /* ... */ ];

    // (setCssVariables, createGrid, renderBoat, showMessage - ensure these are complete and correct)
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

    function createGrid() {
        setCssVariables();
        gridContainer.innerHTML = '';
        shorePositions = [];
        for (let r = 0; r < gridSize; r++) {
            for (let c = 0; c < gridSize; c++) {
                const cell = document.createElement('div');
                cell.classList.add('boat-grid-cell');
                cell.dataset.row = r;
                cell.dataset.col = c;
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
        if (oldBoat) oldBoat.classList.remove('boat-entity');
        const currentCell = gridContainer.querySelector(`[data-row='${boatPosition.row}'][data-col='${boatPosition.col}']`);
        if (currentCell && !currentCell.classList.contains('shore')) {
            currentCell.classList.add('boat-entity');
        }
    }
    
    function showMessage(text, isDistraction = false) {
        if (document.hidden && isDistraction && !gameEnded) return;
        boatMessageEl.textContent = text;
        boatMessageEl.style.color = isDistraction ? 'red' : (text.toLowerCase().includes("congratulations") ? 'green' : '#333');
        if (messageTimeoutId) clearTimeout(messageTimeoutId);
        if (text && text.trim() !== '') {
            messageTimeoutId = setTimeout(() => {
                if (boatMessageEl.textContent === text) { // Only clear if it's still this message
                    boatMessageEl.textContent = (isManualControl && !gameEnded) ? 'You are steering...' : '';
                }
            }, messageClearDelayMs);
        } else {
            boatMessageEl.textContent = '';
        }
    }


    async function executeVisualMove(dRow, dCol, moveTypeMessage = "") {
        if (gameEnded) return;
        isActionAnimating = true; // Mark that a move is visually happening
        updateArrowButtonsState(); // Disable buttons during animation

        const newRow = boatPosition.row + dRow;
        const newCol = boatPosition.col + dCol;
        if (newRow >= 0 && newRow < gridSize && newCol >= 0 && newCol < gridSize) {
            boatPosition.row = newRow;
            boatPosition.col = newCol;
        }
        renderBoat();

        if (moveTypeMessage && !document.hidden) {
            showMessage(moveTypeMessage, moveTypeMessage.includes("!"));
        }
        
        await new Promise(resolve => setTimeout(resolve, visualMoveDurationMs)); 
        
        isActionAnimating = false; // Mark visual move as finished
        // Win condition checked AFTER visual move finishes, so player sees boat on shore
        if (!checkWinCondition()) { // Only update buttons if game not ended
            updateArrowButtonsState(); // Re-enable buttons after animation (if appropriate)
        }
    }
    
    function checkWinCondition() {
        if (gameEnded) return true; // Already ended, do nothing
        if (shorePositions.some(pos => pos.row === boatPosition.row && pos.col === boatPosition.col)) {
            gameEnded = true;
            victoryMessageEl.textContent = "You've reached the shore! Well done!";
            showMessage("Congratulations! You navigated successfully.", false);
            gameStatusEl.textContent = "Goal Reached!";
            stopGameLoops();
            updateArrowButtonsState(); // This will disable all due to gameEnded
            takeControlButton.disabled = true;
            return true;
        }
        return false;
    }

    function updateArrowButtonsState() {
        arrowButtons.forEach(btn => {
            // Conditions to disable a button:
            // 1. Game has ended.
            // 2. Not in manual control.
            // 3. An action is currently animating.
            // 4. A player action is pending, AND this button is NOT the pending one.
            //    (The pending button itself should be visually 'selected' but also disabled to prevent re-clicking).
            const isThisButtonPending = pendingPlayerAction && btn === pendingPlayerAction.buttonElement;
            
            btn.disabled = gameEnded || !isManualControl || isActionAnimating || (pendingPlayerAction && !isThisButtonPending);

            if (isThisButtonPending) {
                btn.classList.add('selected');
                btn.disabled = true; // The selected button is also disabled until processed
            } else {
                btn.classList.remove('selected');
            }
        });
    }

    // --- Main Game Tick ---
    async function gameTick() {
        if (gameEnded || document.hidden || isActionAnimating) {
            return; 
        }

        // 1. Player Action (if one is pending for this tick)
        if (isManualControl && pendingPlayerAction) {
            console.log("Game Tick: Processing Player Action");
            const actionToExecute = { ...pendingPlayerAction }; // Clone it
            pendingPlayerAction = null; // Consume the pending action *before* async execution

            // The button was already marked as selected and disabled.
            // It will be un-selected and re-enabled by updateArrowButtonsState
            // called after executeVisualMove completes.

            await executeVisualMove(actionToExecute.dRow, actionToExecute.dCol, 'You steer the boat...');
            // After player move, updateArrowButtonsState is called inside executeVisualMove
            // or by checkWinCondition if game ends.
            return; 
        }

        // 2. Current's Turn (if no player action took the tick)
        console.log("Game Tick: Processing Current Action");
        let dRowCurrent, dColCurrent;
        do {
            dRowCurrent = Math.floor(Math.random() * 3) - 1;
            dColCurrent = Math.floor(Math.random() * 3) - 1;
        } while (dRowCurrent === 0 && dColCurrent === 0);
        
        const randomDistraction = distractions[Math.floor(Math.random() * distractions.length)];
        const currentMoveMessage = isManualControl ? "Currents are strong!" : randomDistraction;
        
        await executeVisualMove(dRowCurrent, dColCurrent, currentMoveMessage);
        // updateArrowButtonsState is called inside executeVisualMove
    }


    takeControlButton.addEventListener('click', () => {
        if (gameEnded) return;
        isManualControl = !isManualControl;
        if (isManualControl) {
            takeControlButton.textContent = 'Release Control';
            takeControlButton.classList.add('active');
            arrowControlsDiv.style.display = 'block';
            gameStatusEl.textContent = 'You have control! Select your next move.';
            showMessage('You are steering...');
        } else {
            takeControlButton.textContent = 'Take Control';
            takeControlButton.classList.remove('active');
            arrowControlsDiv.style.display = 'none';
            gameStatusEl.textContent = 'You are being pushed by the currents...';
            showMessage('');
            if (pendingPlayerAction && pendingPlayerAction.buttonElement) {
                pendingPlayerAction.buttonElement.classList.remove('selected');
            }
            pendingPlayerAction = null; 
        }
        updateArrowButtonsState();
    });

    arrowButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (!isManualControl || isActionAnimating || gameEnded || pendingPlayerAction) {
                return; // Can't select if not in control, animating, game over, or move already pending
            }
            // No need to clear other selections, as pendingPlayerAction blocks new selections.
            
            let dRow = 0, dCol = 0;
            const direction = button.dataset.direction;
            if (direction === 'up') dRow = -1;
            else if (direction === 'down') dRow = 1;
            else if (direction === 'left') dCol = -1;
            else if (direction === 'right') dCol = 1;

            pendingPlayerAction = { dRow, dCol, buttonElement: button };
            // updateArrowButtonsState will handle making this button 'selected' and disabling others
            updateArrowButtonsState(); 
            showMessage("Direction selected. Will move on next turn.");
            console.log("Player queued action:", pendingPlayerAction);
        });
    });

    function startGameLoops() {
        if (gameTickIntervalId) clearInterval(gameTickIntervalId);
        gameTickIntervalId = setInterval(gameTick, actionIntervalMs);
    }
    
    function stopGameLoops() {
        if (gameTickIntervalId) clearInterval(gameTickIntervalId);
    }

    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            console.log("Boat game tab hidden.");
        } else {
            console.log("Boat game tab visible.");
            if (isManualControl && !gameEnded) {
                // If a move was pending, the message might be "Direction selected"
                if (!pendingPlayerAction) {
                    showMessage('You are steering...');
                }
            }
        }
    });

    function initGame() {
        gameEnded = false;
        isManualControl = false;
        boatPosition = { row: Math.floor(gridSize / 2), col: Math.floor(gridSize / 2) };
        pendingPlayerAction = null;
        isActionAnimating = false;
        if(gameTickIntervalId) clearInterval(gameTickIntervalId);

        victoryMessageEl.textContent = "";
        gameStatusEl.textContent = 'You are being pushed by the currents...';
        takeControlButton.textContent = 'Take Control';
        takeControlButton.classList.remove('active');
        takeControlButton.disabled = false;
        arrowControlsDiv.style.display = 'none';
        
        setCssVariables(); 
        createGrid();      
        updateArrowButtonsState(); // Set initial button state
        startGameLoops();
    }

    initGame();
});