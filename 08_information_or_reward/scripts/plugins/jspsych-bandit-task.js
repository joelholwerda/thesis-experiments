
jsPsych.plugins["bandit-task"] = (function() {

  var plugin = {};
  
  plugin.info = {
    name: "bandit-task",
    description: "",
    parameters: {
      outcomes1: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: "Option 1 Outcomes",
        default_value: undefined,
        description: "Possible outcomes (number of points) for selecting Option 1. Only used if Outcome Distribution == 'discrete'."
      },
      outcomes2: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: "Option 2 Outcomes",
        default_value: undefined,
        description: "Possible outcomes (number of points) for selecting Option 2.Only used if Outcome Distribution == 'discrete'."
      },
      probs1: {
        type: jsPsych.plugins.parameterType.FLOAT,
        pretty_name: "Option 1 Probabilities",
        default_value: null,
        description: "Probabilities associated with Option 1 outcomes. Must be an array of the same length as outcomes1. Only used if Outcome Distribution == 'discrete'."
      },
      probs2: {
        type: jsPsych.plugins.parameterType.FLOAT,
        pretty_name: "Option 2 Probabilities",
        default_value: null,
        description: "Probabilities associated with Option 2 outcomes. Must be an array of the same length as outcomes2. Only used if Outcome Distribution == 'discrete'."
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
      <div id="bandit-screen" class="bandit-screens">
        <div id="bandit-instructions" class="grid-item">${banditInstructionsText()}</div>
        <div id="option1" class="grid-item options"><img id="stimulus1" class="stimuli hvr-grow" src="${trialStimulus("left")}" draggable="false"></div>
        <div id="option2" class="grid-item options"><img id="stimulus2" class="stimuli hvr-grow" src="${trialStimulus("right")}" draggable="false"></div>
        <div class="grid-item next">
          <div><button id="observe-outcome" class="next-button hidden hvr-grow" draggable="false">Observe outcome</button></div>
          <div><button id="claim" class="next-button hidden hvr-grow" draggable="false">Claim outcome</button></div>
          <div><button id="next-trial" class="next-button hidden hvr-grow" draggable="false">Next</button></div>
        </div>
      </div>
    `

    function banditInstructionsText() {

        return `
          Select an option to observe or claim. <br>
          You have ${nSamples - sampleNumber} choices remaining. 
          <img id="more-info" class="hvr-grow" src="images/info-icon.png" width="30" height="30" align="middle" draggable="false">
        `;
    }

    function trialStimulus(side) {
      let stim = null;
      // Cycle through paired stimuli based on current trial number (or always use first pair for low variance)
      if (condition == "high") {
        stim = stimuli.pairedStimuli[trialNumber]
      } else {
        stim = stimuli.pairedStimuli[0]
      }

      // Return the left or right stimulus in the pair based on side argument
      if (side == "left") {
        return stim.stimulus1
      } else {
        return stim.stimulus2
      }
    }

    // Additional information screen
    display_element.innerHTML += `
      <div id="info-screen" class="bandit-screens hidden">
        <div id="info-instructions">Each time you select an option you will have to choose between two possible actions. You can either observe the outcome to learn about the option but not have the points added to your score or you can claim the outcome to add it to your score but not find out what it was.</div>
      </div>
    `;

    // Javascript -----

    // Update sample number
    sampleNumber++;

    // Variable to store trial data
    let response = {
      choice: null,
      feedback: null,
      selection_array: [],
      rt: null
    };

    // Variable used between functions
    let outcome = null;
    let action = "";
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
    const stimulus1 = display_element.querySelector("#stimulus1");
    const stimulus2 = display_element.querySelector("#stimulus2");
    stimulus1.addEventListener("click", chooseOption1);
    stimulus2.addEventListener("click", chooseOption2);
    const observeButton = display_element.querySelector("#observe-outcome");
    const claimButton = display_element.querySelector("#claim");
    const nextButton = display_element.querySelector("#next-trial");

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

      // Show observe and claim buttons
      if (buttonsVisible == false) {
        displayButtons(selection);
        buttonsVisible = true
      }

      return(response)
    }

    // Display feedback when option is selected
    function feedbackHTML(selection, observe){
      if(selection == 1){
        const option1 = display_element.querySelector("#option1");
        if (observe == true) {
          option1.innerHTML += `<div id='feedback${selection}' class='feedback'><p>${outcome} points</p></div>`;
        } else {
          option1.innerHTML += `<div id='feedback${selection}' class='feedback'><p>Points added <br> to total</p></div>`;
          // push outcome to array (for prize draw)
          outcomeArray.push(outcome[0]);
        }
      } else if(selection == 2){
        const option2 = display_element.querySelector("#option2");
        if (observe == true) {
          option2.innerHTML += `<div id='feedback${selection}' class='feedback'><p>${outcome} points</p></div>`;
        } else {
          option2.innerHTML += `<div id='feedback${selection}' class='feedback'><p>Points added <br> to total</p></div>`;
          // push outcome to array (for prize draw)
          outcomeArray.push(outcome[0]);
        }
      }
        
        // Store responses
        response.choice = selection;
        response.feedback = outcome;
    }

    // Determine the outcome presented based on a random sample
    function outcomeDiscrete(selection) {

      if (selection == 1){
        if (trial.outcomes1.length == undefined){
          outcome = trial.outcomes1;
        } else {
          outcome = jsPsych.randomization.sampleWithReplacement(trial.outcomes1, 1, trial.probs1);
        }
      } else if (selection == 2){
        if (trial.outcomes2.length == undefined){
          outcome = trial.outcomes2;
        } else {
          outcome = jsPsych.randomization.sampleWithReplacement(trial.outcomes2, 1, trial.probs2);
        }
      }

      return(outcome)
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
      let finalSelection = 0;
      // Observe outcomes 
      observeButton.style.visibility = "visible";
      observeButton.addEventListener("click", function (){
        stopInteraction();
        // Determine the outcome of the choice and display feedback
        outcome = outcomeDiscrete(selection);
        // Record observe action
        action = "observe";
        // Selection is the final element in the selection array
        finalSelection = response.selection_array[response.selection_array.length-1];
        feedbackHTML(finalSelection, true);
        // Display next button after delay
        jsPsych.pluginAPI.setTimeout(
          function() { displayNext()}, 
          trial.feedbackDuration
        );
      });
      
      // Choose option
      claimButton.style.visibility = "visible";
      claimButton.addEventListener("click", function (){
        stopInteraction();
        // Determine the outcome of the choice and display feedback
        outcome = outcomeDiscrete(selection);
        // Record claim action
        action = "claim";
        // Selection is the final element in the selection array
        finalSelection = response.selection_array[response.selection_array.length-1];
        feedbackHTML(finalSelection, false);
        // Display next button after delay
        jsPsych.pluginAPI.setTimeout(
          function() { displayNext()}, 
          trial.feedbackDuration
        );
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
      observeButton.style.visibility = "hidden";
      claimButton.style.visibility = "hidden";
    }

    function displayNext() {
      nextButton.style.visibility = "visible";
      nextButton.addEventListener("click", endTrial);
    }

    // Things to do at the end of each trial
    function endTrial() {

      // Kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();

      // Data saving
      var trial_data = {
        trial: trialNumber,
        choice: shuffledOptions[(response.choice - 1)],
        action: action,
        feedback: response.feedback,
        left_stimulus: trialStimulus("left").replace("images/stimuli/", "").replace(".jpg", ""),
        right_stimulus: trialStimulus("right").replace("images/stimuli/", "").replace(".jpg", ""),
        left_option: shuffledOptions[0],
        right_option: shuffledOptions[1],
        rt: response_time
      };

      // Update trial number
      trialNumber++;

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