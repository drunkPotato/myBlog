document.addEventListener('DOMContentLoaded', function() {
  const problemContainer = document.getElementById('problem-box-container');
  const skullButton = document.getElementById('skull-button');
  const gameMessage = document.getElementById('skull-game-message');

  if (!problemContainer || !skullButton || !gameMessage) {
    console.error("Hydra game elements not found! Check HTML IDs: problem-box-container, skull-button, skull-game-message.");
    return;
  }

  let totalClicksOnProblemBoxes = 0;
  let skullActiveAndVisible = false;
  let gameActive = true;

  const MAX_PROBLEMS_VISIBLE = 9;
  const TARGET_FIXED_BOXES_FOR_REVERSION = 7;
  const BOXES_TO_REVERT_IN_THIS_SCENARIO = 2;
  const CLICKS_TO_ACTIVATE_SKULL = 10; // User needs to click 10 ❌ boxes

  function countProblemBoxes(type = null) {
    const buttons = Array.from(problemContainer.querySelectorAll('button'));
    if (type) {
      return buttons.filter(b => b.textContent === type).length;
    }
    return buttons.length;
  }

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  function revertSpecificFixedBoxes(numberOfBoxesToRevert, excludeBox = null) {
    if (numberOfBoxesToRevert <= 0) return;
    
    let fixedBoxesQuery = Array.from(problemContainer.querySelectorAll('button')).filter(b => b.textContent === '✅');
    
    if (excludeBox) {
        fixedBoxesQuery = fixedBoxesQuery.filter(b => b.id !== excludeBox.id);
    }

    shuffleArray(fixedBoxesQuery); 

    let revertedCount = 0;
    for (let i = 0; i < fixedBoxesQuery.length && revertedCount < numberOfBoxesToRevert; i++) {
      const boxToRevert = fixedBoxesQuery[i];
      if (!boxToRevert.id) boxToRevert.id = `box-${Math.random().toString(36).substr(2, 5)}`;
      
      boxToRevert.textContent = '❌';
      boxToRevert.style.borderColor = 'red';
      boxToRevert.style.cursor = 'pointer';
      boxToRevert.setAttribute('aria-label', 'Fix this problem');
      boxToRevert.onclick = function() { handleProblemBoxClick(this); };
      revertedCount++;
    }
  }

  function handleProblemBoxClick(boxElement) {
    if (!gameActive) return;
    if (!boxElement.id) boxElement.id = `box-${Math.random().toString(36).substr(2, 5)}`;

    totalClicksOnProblemBoxes++;

    // 1. Fix the clicked box
    boxElement.textContent = '✅';
    boxElement.style.borderColor = 'green';
    boxElement.style.cursor = 'default';
    boxElement.setAttribute('aria-label', 'Problem fixed');
    boxElement.onclick = null; 
    
    gameMessage.textContent = '';

    const currentTotalBoxes = countProblemBoxes();
    const fixedBoxesCount = countProblemBoxes('✅');
  

    // 2. Determine next action
    if (currentTotalBoxes < MAX_PROBLEMS_VISIBLE) {
      createProblemBox(); 
      if (countProblemBoxes() < MAX_PROBLEMS_VISIBLE) {
          createProblemBox(); 
      }
    } else if (currentTotalBoxes === MAX_PROBLEMS_VISIBLE) {
      if (fixedBoxesCount === TARGET_FIXED_BOXES_FOR_REVERSION) {
        revertSpecificFixedBoxes(BOXES_TO_REVERT_IN_THIS_SCENARIO, boxElement);
      }
    }

    if (totalClicksOnProblemBoxes >= CLICKS_TO_ACTIVATE_SKULL && !skullActiveAndVisible) {
      console.log("HANDLE CLICK: Activating and showing skull button.");
      skullActiveAndVisible = true;
      skullButton.style.display = 'block'; // Or remove 'hidden' class
      skullButton.style.opacity = '1';
      skullButton.style.cursor = 'pointer';
      skullButton.style.borderColor = 'orange';
      skullButton.title = 'Address the Root Cause!';
      skullButton.setAttribute('aria-label', 'Address the Root Cause! This button is now active.');
      gameMessage.textContent = 'Perhaps there is a deeper issue?';
    }
  }

  function createProblemBox() {
    if (!gameActive || countProblemBoxes() >= MAX_PROBLEMS_VISIBLE) return;
    const newBoxId = `box-${Math.random().toString(36).substr(2, 5)}`;

    const box = document.createElement('button');
    box.id = newBoxId;
    box.textContent = '❌';
    box.style.fontSize = '1.5em';
    box.style.margin = '5px';
    box.style.padding = '5px 10px';
    box.style.border = '1px solid red';
    box.style.cursor = 'pointer';
    box.setAttribute('aria-label', 'Fix this problem');
    box.onclick = function() { handleProblemBoxClick(this); };
    problemContainer.appendChild(box);
  }

  skullButton.onclick = function() {
    if (skullActiveAndVisible && gameActive) {
      console.log("SKULL CLICKED: Fixing all problems.");
      gameActive = false;

      const allProblemBoxes = Array.from(problemContainer.querySelectorAll('button'));
      allProblemBoxes.forEach(box => {
        if (box.textContent === '❌') {
          box.textContent = '✅';
          box.style.borderColor = 'green';
          box.style.cursor = 'default';
          box.setAttribute('aria-label', 'Problem fixed by root cause solution');
          box.onclick = null;
        }
      });
      
      this.textContent = '✔️'; 
      this.style.backgroundColor = 'green';
      this.style.borderColor = 'darkgreen';
      this.style.opacity = '1';
      this.style.cursor = 'default';
      this.title = 'Root Cause Addressed!';
      this.setAttribute('aria-label', 'Root Cause Addressed!');
      gameMessage.textContent = 'Root Cause Addressed! All symptoms are now resolved.';
    } else if (!skullActiveAndVisible && gameActive) {
      gameMessage.textContent = 'The deeper issue isn\'t apparent yet.';
    } else if (!gameActive) {
      gameMessage.textContent = 'The Root Cause has already been addressed!';
    }
  };

  skullButton.style.display = 'none'; 


  if (gameActive) {
    createProblemBox();
  }
});