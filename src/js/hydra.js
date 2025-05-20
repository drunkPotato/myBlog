document.addEventListener('DOMContentLoaded', function() {
  const problemContainer = document.getElementById('problem-box-container');
  const skullButton = document.getElementById('skull-button');

  let totalClicksOnProblemBoxes = 0;
  let skullActiveAndVisible = false;
  let gameActive = true;

  let problemBoxCounter = 0;

  // --- Constants ---
  const MAX_PROBLEMS_VISIBLE = 9;
  const BOXES_TO_REVERT = 2;
  const CLICKS_TO_ACTIVATE_SKULL = 10;
  const SKULL_START_OPACITY = 0.0;

  skullButton.style.display = 'inline-block';
  skullButton.style.opacity = '0.0'; 
  skullButton.style.cursor = 'not-allowed';
  skullButton.style.pointerEvents = 'none';

  const hydraImage = document.createElement('img');
  hydraImage.src = '/images/hydra.png';
  hydraImage.style.width = '96px';
  hydraImage.style.height = '96px';
  hydraImage.style.verticalAlign = 'middle';

  const deadHydraImage = document.createElement('img');
  deadHydraImage.src = '/images/hydra_dead.png'; // Ensure this path is correct
  deadHydraImage.style.width = '96px';
  deadHydraImage.style.height = '96px';
  deadHydraImage.style.verticalAlign = 'middle';

  function setBoxAsProblem(boxElement) {
    boxElement.innerHTML = '';
    const hydraInstance = hydraImage.cloneNode(true);
    boxElement.appendChild(hydraInstance);
    boxElement.dataset.status = "problem";

    boxElement.style.borderColor = 'none'; // Or 'red' if you prefer
    boxElement.style.cursor = 'pointer';
    boxElement.setAttribute('aria-label', 'Fix this problem');
    boxElement.onclick = function() { handleProblemBoxClick(this); };
  }

  function setBoxAsFixed(boxElement, message = 'Problem fixed') {
    boxElement.innerHTML = '';
    const deadHydraInstance = deadHydraImage.cloneNode(true);
    boxElement.appendChild(deadHydraInstance);
    boxElement.dataset.status = "fixed";

    boxElement.style.borderColor = 'green';
    boxElement.style.cursor = 'default';
    boxElement.setAttribute('aria-label', message);
    boxElement.onclick = null;
  }

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  // Modified to accept an excludeBox parameter
  function revertSpecificFixedBoxes(excludeBox = null) {
    if (BOXES_TO_REVERT <= 0) return;

    let fixedBoxesQuery = Array.from(problemContainer.querySelectorAll('button[data-status="fixed"]'));

    if (excludeBox && excludeBox.id) {
      fixedBoxesQuery = fixedBoxesQuery.filter(b => b.id !== excludeBox.id);
    }

    if (fixedBoxesQuery.length === 0) {
      console.log("No suitable fixed boxes to revert.");
      return;
    }

    shuffleArray(fixedBoxesQuery);

    let revertedCount = 0;
    for (let i = 0; i < fixedBoxesQuery.length && revertedCount < BOXES_TO_REVERT; i++) {
      const boxToRevert = fixedBoxesQuery[i];
      setBoxAsProblem(boxToRevert);
      revertedCount++;
    }
  }

  function handleProblemBoxClick(boxElement) {
    if (!gameActive) return;

    if (!boxElement.id) {
      boxElement.id = `box-${Math.random().toString(36).substr(2, 5)}-clicked`;
    }

    totalClicksOnProblemBoxes++;
    setBoxAsFixed(boxElement);


    // Make the skull more visible
    if (!skullActiveAndVisible && totalClicksOnProblemBoxes <= CLICKS_TO_ACTIVATE_SKULL) {
      const progress = totalClicksOnProblemBoxes / CLICKS_TO_ACTIVATE_SKULL;
      const newOpacity = SKULL_START_OPACITY + (1 - SKULL_START_OPACITY) * progress;
      skullButton.style.opacity = Math.min(newOpacity, 1).toString();
    }

    if (problemBoxCounter < MAX_PROBLEMS_VISIBLE) {
      problemBoxCounter += 2; 
      createProblemBox(); 
      createProblemBox();
    }
    if (problemContainer.children.length >= MAX_PROBLEMS_VISIBLE) {
      revertSpecificFixedBoxes(boxElement);
    }


    // Skull activation logic
    if (totalClicksOnProblemBoxes >= CLICKS_TO_ACTIVATE_SKULL && !skullActiveAndVisible) {
      console.log("HANDLE CLICK: Activating and showing skull button fully.");
      skullActiveAndVisible = true;
      skullButton.style.opacity = '1';
      skullButton.style.cursor = 'pointer';
      skullButton.style.pointerEvents = 'auto';
    }
  }

  function createProblemBox() {
    if (!gameActive) {
      return;
    }
    if (problemContainer.children.length >= MAX_PROBLEMS_VISIBLE) {
      console.log("Max problems visible reached, not creating new box. DOM children:", problemContainer.children.length);
      return;
    }

    const newBoxId = `box-${Math.random().toString(36).substr(2, 5)}`;
    const box = document.createElement('button');
    box.id = newBoxId;
    box.style.fontSize = '1em';
    box.style.margin = '5px';
    box.style.padding = '5px 10px';

    setBoxAsProblem(box);
    problemContainer.appendChild(box);
  }

  skullButton.onclick = function() {
    if (skullActiveAndVisible && gameActive) {
      console.log("SKULL CLICKED: Fixing all problems.");
      gameActive = false;

      const allProblemBoxes = Array.from(problemContainer.querySelectorAll('button[data-status="problem"]'));
      allProblemBoxes.forEach(box => {
        setBoxAsFixed(box, 'Problem fixed by root cause solution');
      });
      const allFixedBoxes = Array.from(problemContainer.querySelectorAll('button[data-status="fixed"]'));
      allFixedBoxes.forEach(box => {
          if (box.getAttribute('aria-label') !== 'Problem fixed by root cause solution') {
              setBoxAsFixed(box, 'Problem fixed by root cause solution');
          }
      });

      this.textContent = '⚕️';
      this.style.backgroundColor = 'rgb(230, 220, 220)';
      this.style.borderColor = 'rgb(230, 220, 220)';
      this.style.opacity = '1';
      this.style.cursor = 'default';
      this.style.pointerEvents = 'none';
    }
  };

  // Initial game setup
  if (gameActive) {
    console.log("Game starting, creating initial box.");
    createProblemBox();
    if (problemContainer.children.length > 0) { // If box was successfully created
        problemBoxCounter = problemContainer.children.length; // Sync counter
    }
    console.log("Initial problemBoxCounter:", problemBoxCounter);
  }
});