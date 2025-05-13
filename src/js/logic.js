document.addEventListener('DOMContentLoaded', () => {
  const leftButton = document.getElementById('left-button');
  const rightButton = document.getElementById('right-button');
  const hintDisplay = document.getElementById('hint-message');
  const victoryDisplay = document.getElementById('victory-message');

  // --- Configuration ---
  const WIN_SEQUENCE = ['L', 'R', 'R', 'L', 'L', 'L', 'R'];
  const HINT_AFTER_TOTAL_PRESSES = 10;
  const WIN_TEXT = "You Win!";
  const LOSE_TEXT = "You Lose"; 
  const HINT_TEXT = `Hint: Follow the sequence: Left, Right, Right, Left, Left, Left, Right`;
  const VICTORY_MESSAGE_TEXT = "Well Done! <br>" +
    "So what does this show? Take a moment to think about it. <br><br>" +
    "This game was easy once the goal, possible options, and 'correct decisions' (after the clue) were clear. <br>" +
    "Any button press before was essentially random because there was no way to tell wether it was the correct decision or not. <br>" +
    "Your life is not easy. Defining your 'win', navigating options, and implementing decisions is complex. <br> " +
    "Without a goal, a clear understanding of your abilities and a measure for your decisions, a desirable outcome is less likely. <br> " +
    "By 'Stopping and Thinking,' we identify goals, clarify options, and search for hints. Thus helping us make the right decisions";

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