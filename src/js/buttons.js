document.addEventListener('DOMContentLoaded', () => {
  const leftButton = document.getElementById('left-button');
  const rightButton = document.getElementById('right-button');
  const hintDisplay = document.getElementById('hint-message');
  const victoryDisplay = document.getElementById('victory-message');

  // --- Configuration ---
  const WIN_SEQUENCE = ['R', 'L', 'R', 'L', 'L', 'R', 'R', 'L'];
  const HINT_AFTER_TOTAL_PRESSES = 8;
  const WIN_TEXT = "You Win!";
  const LOSE_TEXT = "You Lose"; 
  const HINT_TEXT = `Hint: Follow the sequence: Right, Left, Right, Left, Left, Right, Right, Left`;
  const VICTORY_MESSAGE_TEXT = "Well Done! <br>" +
    "Notice how that felt? Initially, it was random. <br>" +
    "Once the goal (win), options (buttons), and correct decisions (sequence) were clear, the game changed. <br>" +
    "You shifted from random guessing to intentional action. An uncertain game became solvable. <br> "

  // --- State Variables ---
  let clickSequence = [];
  let totalPresses = 0;
  let hasWon = false;

  // --- Input Validation ---
  if (!leftButton || !rightButton || !hintDisplay || !victoryDisplay) { 
    console.error("Error: One or more game elements not found!");
    return;
  }

  // --- Helper Functions ---
  function updateDisplay() {
    if (hasWon) {
      leftButton.textContent = WIN_TEXT;
      rightButton.textContent = WIN_TEXT;
      
      leftButton.disabled = true;
      rightButton.disabled = true;

      victoryDisplay.innerHTML = VICTORY_MESSAGE_TEXT;

    } else {
      leftButton.textContent = LOSE_TEXT;
      rightButton.textContent = LOSE_TEXT;

      victoryDisplay.innerHTML = ''; 

      if (totalPresses >= HINT_AFTER_TOTAL_PRESSES) {
        hintDisplay.textContent = HINT_TEXT;
      } else {
        hintDisplay.textContent = '';
      }
    }
  }

  function checkWinCondition() {
    if (hasWon) return;

    const relevantClicks = clickSequence.slice(-WIN_SEQUENCE.length);

    if (relevantClicks.length === WIN_SEQUENCE.length && 
        relevantClicks.join('') === WIN_SEQUENCE.join('')) {
      hasWon = true;
    }
  }


  function handleButtonClick(clickType) {
    if (hasWon) return;

    totalPresses++;
    clickSequence.push(clickType);

    console.log(`Click: ${clickType}, Total: ${totalPresses}, Sequence Tail: ${clickSequence.slice(-WIN_SEQUENCE.length).join('')}`); 

    checkWinCondition();
    updateDisplay();  
  }

  // --- Initialization ---
  updateDisplay(); // This will now also ensure victory message is initially empty

  // --- Event Listeners ---
  rightButton.addEventListener('click', () => handleButtonClick('R')); 
  leftButton.addEventListener('click', () => handleButtonClick('L'));

});