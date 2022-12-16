
jsPsych.plugins["sampling-task"] = (function() {

  var plugin = {};
  
  plugin.info = {
    name: "sampling-task",
    description: "",
    parameters: {
      samplingType: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Sampling type',
        default: null,
        description: 'Input whether sampling is "free" or "fixed". This determines whether a continue sampling button is included.'
     },
     nSamples: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: "Number of Samples",
        default_value: null,
        description: "The number of samples in this round (fixed) or the maximum number of samples (free)."  
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
      <div id="sampling-screen" class="bandit-screens">
        <div id="bandit-instructions" class="grid-item">${banditInstructionsText()}</div>
        <div id="option" class="grid-item options"><img id="stimulus" class="stimuli hvr-grow" src="${trialStimulus()}" draggable="false"></div>
        <div class="grid-item next">
          <div><button id="keep-sampling" class="next-button notDisplayed hvr-grow" draggable="false">Keep observing</button></div>
          <div><button id="make-choice" class="next-button notDisplayed hvr-grow" draggable="false">Make choice</button></div>
        </div>
      </div>
    `

    function banditInstructionsText() {

        if (trial.samplingType == "fixed") {
            return `
              <u>Round ${roundNumber}</u><br> In this round, you will observe ${trial.nSamples} outcomes before making a choice. <br>
              You have ${trial.nSamples - sampleNumber + 1} outcomes remaining. 
              <img id="more-info" class="hvr-grow" src="images/info-icon.png" width="30" height="30" align="middle" draggable="false">
            `;
        } else {
            return `
              <u>Round ${roundNumber}</u><br> In this round, you can observe as many outcomes <br> as you want before making a choice.
              <img id="more-info" class="hvr-grow" src="images/info-icon.png" width="30" height="30" align="middle" draggable="false">
            `;
        }

        
    }

    function trialStimulus() {
      let stimulus = null;
      // Cycle through paired stimuli based on current trial number (or always use first pair for low variance)
      if (condition == "high") {
        stimulus = `images/stimuli/${stimuli.colourOrder[roundNumber-1]}-${stimuli.stimulusOrderB[trialNumber-1]}.jpg`;
      } else {
        stimulus = `images/stimuli/${stimuli.colourOrder[roundNumber-1]}-${stimuli.stimulusOrderA[roundNumber-1]}.jpg`;
      }

      return stimulus;
    }

    // Additional information screen
    if (trial.samplingType == "fixed") {
        display_element.innerHTML += `
            <div id="info-screen" class="bandit-screens hidden">
                <div id="info-instructions">
                    At the end of the round, you will be presented with a choice involving an option similar to the one currently on the screen. <br><br>
                    In this round, you will observe a fixed number of outcomes before making a choice.
                </div>
            </div>
        `;
    } else {
        display_element.innerHTML += `
            <div id="info-screen" class="bandit-screens hidden">
                <div id="info-instructions">
                    At the end of the round, you will be presented with a choice involving an option similar to the one currently on the screen. <br><br>
                    In this round, you can continue to observe outcomes until you have enough information to make a good choice.
                </div>
            </div>
        `;
    }

    // Javascript -----

    // Variable used to store the outcome of sampling
    let outcome = null;

    // Display options once pre-trial interval has elapsed
    if(trial.preTrialInterval != 0){
      const options = display_element.querySelector(".options");
      options.style.visibility = "hidden";
      jsPsych.pluginAPI.setTimeout(function(){
        options.style.visibility = "visible";
      }, trial.preTrialInterval);
    }

    // Listen for participant clicking an option
    const stimulus = display_element.querySelector("#stimulus");
    stimulus.addEventListener("click", sampleOption);
    const option = display_element.querySelector("#option");
    const keepSampling = display_element.querySelector("#keep-sampling");
    const makeChoice = display_element.querySelector("#make-choice");

    // Display more info about the conversion rate
    displayMoreInfo();

// FUNCTIONS -------------------------------------------------------------------------------------------------------

    // What happens when a participant samples an option
    function sampleOption() {

      // Calculate reaction time
      const endTime = (new Date()).getTime();
      response_time = endTime - startTime;
      stimulus.classList.add('chosen');

      // Continue to allow hover over more info
      displayMoreInfo();

      // Prevent participants from clicking on the option multiple times
      stopInteraction();

      // Determine the outcome of the choice and display feedback
      outcome = randomGaussian(trial.mean, trial.sd);

      // Show feedback
      option.innerHTML += `<div id='feedback1' class='feedback'><p>${outcome} points</p></div>`;

      // Display next button after delay
      jsPsych.pluginAPI.setTimeout(
        function() { displayNext()}, 
        trial.feedbackDuration
      );

      return outcome
    }

    // Display more info about the conversion rate
    function displayMoreInfo() {
      const infoButton = display_element.querySelector("#more-info");
      const infoScreen = display_element.querySelector("#info-screen");
      infoButton.onmouseover = function () {infoScreen.style.visibility = "visible";};
      infoButton.onmouseout = function () {infoScreen.style.visibility = "hidden";};
    }

    // Stop clicking and hovering interactions with stimuli
    function stopInteraction() {
      stimulus.removeEventListener("click", sampleOption);
      stimulus.classList.remove('hvr-grow');
      stimulus.style.cursor = "default";
    }

    function displayNext() {

      if(sampleNumber == trial.nSamples || trial.samplingType == "free"){
        makeChoice.style.display = "inline-block";
        makeChoice.addEventListener("click", function () {
            clickedMakeChoice = true; 
            endTrial();
          }
        );
      }

      if(sampleNumber != trial.nSamples) {
        keepSampling.style.display = "inline-block";
        keepSampling.addEventListener("click", function () {
            clickedMakeChoice = false; 
            endTrial();
          }
        );
      }
    }

    // Things to do at the end of each trial
    function endTrial() {

      // Kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();

      // Data saving
      var trial_data = {
        round_number: roundNumber,
        sample_number: sampleNumber,
        sampling_type: trial.samplingType,
        nSamples: trial.nSamples,
        mean: trial.mean,
        feedback: outcome,
        stimulus: trialStimulus().replace("images/stimuli/", "").replace(".jpg", ""),
        stimulus_colour: stimuli.colourOrder[roundNumber-1],
        rt: response_time
      };

      // Update trial number
      trialNumber++;

      // Update sample number if midround and update round & reset sampleNumber if at the end of a round
      if (sampleNumber == trial.nSamples || clickedMakeChoice == true) {
        sampleNumber = 1;
      } else {
        sampleNumber++;
      }

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