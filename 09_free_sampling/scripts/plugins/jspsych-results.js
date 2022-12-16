
jsPsych.plugins["results"] = (function() {

  var plugin = {};
  
  plugin.info = {
    name: "results",
    description: "",
    parameters: {}
  }

// -----------------------------------------------------------------------------------------------------------------

  plugin.trial = function(display_element, trial) {

    // Calculate prize
    let totalScore = 0;

    for (let i = 0; i < resultsArray.choice.length; i++) {
      if (resultsArray.choice[i] == 1) {
        totalScore += resultsArray.safeValue[i];
      } else if (resultsArray.choice[i] == 2) {
        totalScore += resultsArray.riskyValue[i];
      }
      
    }

    // Round prize up to nearest $0.50
    prize = (totalScore / pointsPerDollar) + (0.5 - (totalScore / pointsPerDollar) % 0.5);

    // HTML structure ----------------------------------------------------------------------------------------------
    let resultsHTML = `
      <div id="results-screen" class="bandit-screens">
        <div id="results-instructions">
          ${instructions()}
        </div>
    `;

    let optionChosen = "";

    for (let i = 0; i < resultsArray.choice.length; i++) {

      if(resultsArray.choice[i] == 1) {
        optionChosen = ["chosen", "notChosen"];
      } else {
        optionChosen = ["notChosen", "chosen"];
      }

      resultsHTML += `
        <div id="results-${i + 1}" class= "results">
        <div class="results-round"><p>Round ${i + 1}</p></div>
          <div class="results-option-1 ${optionChosen[0]}">
            <img class="results-stimuli" src="images/safe-option.png" draggable="false">
            <div class='results-feedback'><p>${resultsArray.safeValue[i]} points</p></div>
          </div>
          <div class="results-option-2 ${optionChosen[1]}">
            <img class="results-stimuli" src="${resultsArray.stimulus[i]}" draggable="false">
            <div class='results-feedback'><p>${resultsArray.riskyValue[i]} points</p></div>
          </div>
        </div>
      `;
    }

    resultsHTML += `</div`; // results-screen

    display_element.innerHTML = resultsHTML;

    // Save data ------------------------------------------------------------------------------------------
    const resultsCSV = `"id", "prize" \n ${participantID}, ${prize}`;
    filename = `prize/free-sampling-id-${participantID}-${randomID}-prize`;
    saveData(filename, resultsCSV);

    // Fuctions --------------------------------------------------------------------------------------------
    function instructions() {

      const instructions = `Thanks for participating! You earned a total of <span style="font-weight:bold;font-size:120%">$${prize.toFixed(2)}</span>. <br> Please let the experimenter know that you've finished.`
    
      return instructions;
    }
  }

  return plugin;
})();