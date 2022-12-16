
jsPsych.plugins["choice-task"] = (function() {

  var plugin = {};
  
  plugin.info = {
    name: "choice-task",
    description: "",
    parameters: {
      samplingType: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Sampling type',
        default: null,
        description: 'Input whether sampling is "free" or "fixed" for this round -- only used for data.'
      },
      mean: {
        type: jsPsych.plugins.parameterType.FLOAT,
        pretty_name: "Mean of outcome distribution",
        default_value: null,
        description: "The mean of the Gaussian distribution from which outcomes are drawn on each trial."
      },
      sd: {
        type: jsPsych.plugins.parameterType.FLOAT,
        pretty_name: "Standard deviation of outcome distribution",
        default_value: null,
        description: "The standard deviation of the Gaussian distribution from which outcomes are drawn on each trial."
      },
      safeValue: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: "Safe value",
        default_value: 50,
        description: "The number of points associated with the safe option."  
      },

      feedbackDuration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: "Feedback Duration",
        default_value: 2000,
        description: "How long (ms) to display feedback (reward)."  
      },
      preTrialInterval: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: "Pre-trial Interval",
        default_value: 0,
        description: "How long (ms) before presenting choice stimuli."
      }
    }
  }

// -----------------------------------------------------------------------------------------------------------------

  plugin.trial = function(display_element, trial) {

    // HTML structure -----

    // Sampling
    display_element.innerHTML = `
      <div id="choice-screen" class="bandit-screens">
        <div id="bandit-instructions" class="grid-item">${banditInstructionsText()}</div>
        <div id="option1" class="grid-item options hvr-grow">
          <img id="stimulus1" class="stimuli" src="images/safe-option.png" draggable="false">
          <div id='feedback1' class='feedback'><p>${trial.safeValue} points</p></div>
        </div>
        <div id="option2" class="grid-item options">
          <img id="stimulus2" class="stimuli hvr-grow" src="images/stimuli/${stimuli.colourOrder[roundNumber-1]}-${stimuli.stimulusOrderA[roundNumber-1]}.jpg" draggable="false">
        </div>
        <div class="grid-item next">
          <div><button id="claim" class="next-button hidden hvr-grow" draggable="false">Confirm choice</button></div>
        </div>
      </div>
    `

    function banditInstructionsText() {

        return `
          Which would you prefer: the number of points displayed on the left or the outcome of the option on the right?
          <img id="more-info" class="hvr-grow" src="images/info-icon.png" width="30" height="30" align="middle" draggable="false">
        `;
    }

    // Additional information screen
    display_element.innerHTML += `
      <div id="info-screen" class="bandit-screens hidden">
        <div id="info-instructions">
          Choose an option by clicking on it. If you choose the points on the left, that number of points will be added to your final score. 
          If you choose the option on the right, its outcome will be added to your final score.
        </div>
      </div>
    `;

    // Javascript -----

    // Variable to store trial data
    let response = {
      choice: null,
      selection_array: [],
    };

    // Variable used between functions
    let buttonsVisible = false;

    // Display options once pre-trial interval has elapsed
    if(trial.preTrialInterval != 0){
      const options = display_element.querySelector(".options");
      options.style.visibility = "hidden";
      jsPsych.pluginAPI.setTimeout(function(){
        options.style.visibility = "visible";
      }, trial.preTrialInterval);
    }

    // Listen for participant clicking an option
    const stimulus1 = display_element.querySelector("#option1");
    const stimulus2 = display_element.querySelector("#stimulus2");
    stimulus1.addEventListener("click", chooseOption1);
    stimulus2.addEventListener("click", chooseOption2);
    const claimButton = display_element.querySelector("#claim");

    // Display more info about the conversion rate
    displayMoreInfo();

// FUNCTIONS -------------------------------------------------------------------------------------------------------

    // When a participant chooses an option
    function chooseOption1() {makeChoice(selection=1)} // Intermediate function due to parameter issue
    function chooseOption2() {makeChoice(selection=2)}

    function makeChoice(selection) {

      // Calculate reaction time
      const endTime = (new Date()).getTime();
      response_time = endTime - startTime;
      response.selection_array.push(selection);

      // Chosen item is increases size. Not chosen item decreases opacity.
      if(selection == 1){
        stimulus2.classList.remove('chosen');
        stimulus1.classList.remove('notChosen');
        stimulus1.classList.add('chosen');
        stimulus2.classList.add('notChosen');
        
      } else if(selection == 2){
        stimulus1.classList.remove('chosen');
        stimulus2.classList.remove('notChosen');
        stimulus2.classList.add('chosen');
        stimulus1.classList.add('notChosen');
      }

      // Continue to allow hover over more info
      displayMoreInfo();

      // Show confirm choice button
      if (buttonsVisible == false) {
        displayButtons();
        buttonsVisible = true
      }

      return(response)
    }

    // Display more info about the conversion rate
    function displayMoreInfo() {
      const infoButton = display_element.querySelector("#more-info");
      const infoScreen = display_element.querySelector("#info-screen");
      infoButton.onmouseover = function () {infoScreen.style.visibility = "visible";};
      infoButton.onmouseout = function () {infoScreen.style.visibility = "hidden";};
    }

    // Make buttons visible and listen for clicks
    function displayButtons() {

      // Choose option
      claimButton.style.visibility = "visible";
      claimButton.addEventListener("click", function (){
        stopInteraction();
        // Choice is the final element in the selection array
        finalSelection = response.selection_array[response.selection_array.length-1];
        // Store choice
        response.choice = finalSelection;
        // End trial
        endTrial();
      });
    }

    // Stop clicking and hovering interactions with stimuli
    function stopInteraction() {
      stimulus1.removeEventListener("click", chooseOption1);
      stimulus2.removeEventListener("click", chooseOption2);
      stimulus1.classList.remove('hvr-grow');
      stimulus2.classList.remove('hvr-grow');
      stimulus1.style.cursor = "default";
      stimulus2.style.cursor = "default";
      claimButton.style.visibility = "hidden";
    }

    // Things to do at the end of each trial
    function endTrial() {

      // Kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();

       // Data saving
       var trial_data = {
        round_number: roundNumber,
        sampling_type: trial.samplingType,
        mean: trial.mean,
        safe_value: trial.safeValue,
        choice: response.choice,
        stimulus: `${stimuli.colourOrder[roundNumber-1]}-${stimuli.stimulusOrderA[roundNumber-1]}`,
        stimulus_colour: stimuli.colourOrder[roundNumber-1],
        rt: response_time
      };

      // Determine the outcome of the risky option
      resultsArray.stimulus.push(`images/stimuli/${stimuli.colourOrder[roundNumber-1]}-${stimuli.stimulusOrderA[roundNumber-1]}.jpg`);
      resultsArray.choice.push(response.choice);
      resultsArray.safeValue.push(trial.safeValue);
      resultsArray.riskyValue.push(randomGaussian(trial.mean, trial.sd));

      // Update round number
      roundNumber++;

      // Clear the display
      display_element.innerHTML = '';

      // End trial
      jsPsych.finishTrial(trial_data);

    }

    var response_time = 0; 
    const startTime = (new Date()).getTime();
  }

  return plugin;
})();