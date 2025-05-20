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
  const BOXES_TO_REVERT_IN_THIS_SCENARIO = 3;
  const CLICKS_TO_ACTIVATE_SKULL = 15;
  const SKULL_START_OPACITY = 0.0;
  const HYDRA_IMAGE_PATH = '/images/hydra.png';
  const HYDRA_DEAD_IMAGE_PATH = '/images/hydra_dead.png'; 
  const IMAGE_SIZE = '96px'; // Consistent size for both images

  // --- Initial Skull Button Styling ---
  skullButton.style.display = 'inline-block';
  skullButton.style.opacity = SKULL_START_OPACITY.toString();
  skullButton.style.cursor = 'not-allowed';
  skullButton.style.pointerEvents = 'none';

  // --- Helper function to set a box to the "problem" state (Live Hydra image) ---
  function setBoxAsProblem(boxElement) {
    boxElement.innerHTML = '';
    const hydraImage = document.createElement('img');
    hydraImage.src = HYDRA_IMAGE_PATH;
    hydraImage.alt = 'Hydra head problem';
    hydraImage.style.width = IMAGE_SIZE;
    hydraImage.style.height = IMAGE_SIZE;
    hydraImage.style.verticalAlign = 'middle';
    boxElement.appendChild(hydraImage);
    boxElement.dataset.status = "problem"; // Using data attribute for status

    boxElement.style.borderColor = 'red';
    boxElement.style.cursor = 'pointer';
    boxElement.setAttribute('aria-label', 'Fix this problem');
    boxElement.onclick = function() { handleProblemBoxClick(this); };
  }

  // --- Helper function to set a box to the "fixed" state (Dead Hydra image) ---
  function setBoxAsFixed(boxElement, message = 'Problem fixed') {
    boxElement.innerHTML = '';
    const deadHydraImage = document.createElement('img');
    deadHydraImage.src = HYDRA_DEAD_IMAGE_PATH;
    deadHydraImage.alt = 'Hydra head defeated';
    deadHydraImage.style.width = IMAGE_SIZE;
    deadHydraImage.style.height = IMAGE_SIZE;
    deadHydraImage.style.verticalAlign = 'middle';
    boxElement.appendChild(deadHydraImage);
    boxElement.dataset.status = "fixed"; // Using data attribute for status

    boxElement.style.borderColor = 'green';
    boxElement.style.cursor = 'default';
    boxElement.setAttribute('aria-label', message);
    boxElement.onclick = null;
  }

  function countProblemBoxes(statusType = null) {
    const buttons = Array.from(problemContainer.querySelectorAll('button'));
    if (statusType === "fixed") {
      return buttons.filter(b => b.dataset.status === "fixed").length;
    } else if (statusType === "problem") {
      return buttons.filter(b => b.dataset.status === "problem").length;
    }
    return buttons.length; // Total buttons
  }

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  function revertSpecificFixedBoxes(numberOfBoxesToRevert, excludeBox = null) {
    if (numberOfBoxesToRevert <= 0) return;
    
    let fixedBoxesQuery = Array.from(problemContainer.querySelectorAll('button[data-status="fixed"]'));
    
    if (excludeBox) {
        fixedBoxesQuery = fixedBoxesQuery.filter(b => b.id !== excludeBox.id);
    }

    shuffleArray(fixedBoxesQuery); 

    let revertedCount = 0;
    for (let i = 0; i < fixedBoxesQuery.length && revertedCount < numberOfBoxesToRevert; i++) {
      const boxToRevert = fixedBoxesQuery[i];
      if (!boxToRevert.id) boxToRevert.id = `box-${Math.random().toString(36).substr(2, 5)}`;
      
      setBoxAsProblem(boxToRevert);
      revertedCount++;
    }
  }

  function handleProblemBoxClick(boxElement) {
    if (!gameActive) return;
    if (!boxElement.id) boxElement.id = `box-${Math.random().toString(36).substr(2, 5)}`;

    totalClicksOnProblemBoxes++;

    setBoxAsFixed(boxElement);
    gameMessage.textContent = '';

    if (!skullActiveAndVisible && totalClicksOnProblemBoxes <= CLICKS_TO_ACTIVATE_SKULL) {
      const progress = totalClicksOnProblemBoxes / CLICKS_TO_ACTIVATE_SKULL;
      const newOpacity = SKULL_START_OPACITY + (1 - SKULL_START_OPACITY) * progress;
      skullButton.style.opacity = Math.min(newOpacity, 1).toString();
    }

    const currentProblemBoxes = countProblemBoxes("problem");
    const currentTotalBoxes = countProblemBoxes(); // Total boxes in container
    const fixedBoxesCount = countProblemBoxes("fixed");
  
    // Create new boxes if we haven't reached max AND there are few enough problems
    // Or if there are no problem boxes left and we are below max
    if (currentTotalBoxes < MAX_PROBLEMS_VISIBLE) {
        if (currentProblemBoxes < MAX_PROBLEMS_VISIBLE -1 || currentProblemBoxes === 0) { // Allow more problems if not full
             createProblemBox();
             if (countProblemBoxes() < MAX_PROBLEMS_VISIBLE) { // Check again before adding second one
                 createProblemBox();
             }
        }
    } else if (currentTotalBoxes === MAX_PROBLEMS_VISIBLE) { // Max boxes reached
      if (fixedBoxesCount >= TARGET_FIXED_BOXES_FOR_REVERSION) { // Check 'fixed' as it's more reliable
        revertSpecificFixedBoxes(BOXES_TO_REVERT_IN_THIS_SCENARIO, boxElement);
      }
    }


    if (totalClicksOnProblemBoxes >= CLICKS_TO_ACTIVATE_SKULL && !skullActiveAndVisible) {
      console.log("HANDLE CLICK: Activating and showing skull button fully.");
      skullActiveAndVisible = true;
      skullButton.style.opacity = '1';
      skullButton.style.cursor = 'pointer';
      skullButton.style.pointerEvents = 'auto';
      skullButton.style.borderColor = 'orange';
      skullButton.title = 'Address the Root Cause!';
      skullButton.setAttribute('aria-label', 'Address the Root Cause! This button is now active.');
      gameMessage.textContent = 'Perhaps there is a deeper issue?';
    }
  }

  function createProblemBox() {
    if (!gameActive || countProblemBoxes() >= MAX_PROBLEMS_VISIBLE) { // Check total boxes against max
        console.log("Not creating box. Game active:", gameActive, "Current boxes:", countProblemBoxes(), "Max:", MAX_PROBLEMS_VISIBLE);
        return;
    }
    const newBoxId = `box-${Math.random().toString(36).substr(2, 5)}`;

    const box = document.createElement('button');
    box.id = newBoxId;
    box.style.fontSize = '1em'; // Font size for text, not directly for image
    box.style.margin = '5px';
    box.style.padding = '5px 10px';
    
    setBoxAsProblem(box);
    problemContainer.appendChild(box);
    console.log("Created problem box. Total now:", countProblemBoxes());
  }

  skullButton.onclick = function() {
    if (skullActiveAndVisible && gameActive) {
      console.log("SKULL CLICKED: Fixing all problems.");
      gameActive = false;

      const allProblemBoxes = Array.from(problemContainer.querySelectorAll('button[data-status="problem"]'));
      allProblemBoxes.forEach(box => {
          setBoxAsFixed(box, 'Problem fixed by root cause solution');
      });
      
      this.textContent = '⚕️';
      this.style.backgroundColor = 'rgb(230, 220, 220)';
      this.style.borderColor = 'rgb(230, 220, 220)';
      this.style.opacity = '1';
      this.style.cursor = 'default';
      this.style.pointerEvents = 'none';
      gameMessage.textContent = 'Root Cause Addressed! All symptoms are now resolved.';

    } else if (!gameActive) {
        gameMessage.textContent = 'The Root Cause has already been addressed!';
    }
  };

  // Initial game setup
  if (gameActive) {
    console.log("Game starting, creating initial box.");
    createProblemBox(); // Ensure at least one box is created at the start
  }
});