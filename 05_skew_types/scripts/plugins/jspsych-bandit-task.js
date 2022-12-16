
jsPsych.plugins["bandit-task"] = (function() {

  var plugin = {};
  
  plugin.info = {
    name: "bandit-task",
    description: "Simple 2-armed bandit task",
    parameters: {
      option1: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: "Option 1",
        default_value: undefined,
        description: "The name associated with option 1."
      },
      colour1: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: "Colour 1",
        default_value: undefined,
        description: "The colour used for the square for Option 1."
      },
      outcomes1: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: "Option 1 Outcomes",
        default_value: undefined,
        description: "Possible outcomes (number of points) for selecting Option 1. Only used if Outcome Distribution == 'discrete'."
      },
      option2: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: "Option 2",
        default_value: undefined,
        description: "The name associated with option 2."
      },
      colour2: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: "Colour 2",
        default_value: undefined,
        description: "The colour used for the square for Option 2."
      },
      outcomes2: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: "Option 2 Outcomes",
        default_value: undefined,
        description: "Possible outcomes (number of points) for selecting Option 2.Only used if Outcome Distribution == 'discrete'."
      },
      prob1: {
        type: jsPsych.plugins.parameterType.FLOAT,
        pretty_name: "Option 1 Outcomes Probabilities",
        default_value: null,
        description: "Probabilities associated with Option 1 outcomes. Must be an array of the same length as outcomes1. Only used if Outcome Distribution == 'discrete'."
      },
      prob2: {
        type: jsPsych.plugins.parameterType.FLOAT,
        pretty_name: "Option 2 Outcomes Probabilities",
        default_value: null,
        description: "Probabilities associated with Option 2 outcomes. Must be an array of the same length as outcomes2. Only used if Outcome Distribution == 'discrete'."
      },
      singleOption: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: "Single option trial",
        default_value: false,
        description: "If true, a single option is presented."
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

    let stimulus1 = null;
    let stimulus2 = null;

    const stimuli = randomiseSide();

    // Variable to store trial data
    var response = {
      choice: null,
      feedback: null,
      rt: null
    };

    // Update trial number
    trialNumber++;
    trialInBlock++;

    // Add content to css class in order to apply bandit styles
    const content = document.querySelector("#jspsych-content");
    content.classList.add("bandit-grid-container");

    // Set up CSS grid container in HTML
    display_element.innerHTML = `
        <div class="grid-item tally">Total points: <strong>${totalPoints}</strong></div>
        <div id="option1" class="grid-item options"></div>
        <div id="option2" class="grid-item options"></div>
        <div id="centred" class="grid-item options"></div>
        <div class="grid-item next"></div>`;

    // Make variables for the options and next button
    var option1 = display_element.querySelector("#option1");
    var option2 = display_element.querySelector("#option2");
    var centred = display_element.querySelector("#centred");
    var next = display_element.querySelector(".next");
    var outcome = null;

    // Display choice stimuli once pre-trial interval has elapsed
    if(trial.preTrialInterval == 0){
      displayChoice(trial.singleOption);
    } else {
      jsPsych.pluginAPI.setTimeout(function(){
        displayChoice(trial.singleOption);
      }, trial.preTrialInterval);
    }

// FUNCTIONS -------------------------------------------------------------------------------------------------------

    // Function to randomise side --------------------------------------------------------------
    function randomiseSide() {
      var colours = [trial.colour1, trial.colour2];
      var order = jsPsych.randomization.sampleWithoutReplacement([0, 1], 2);
      
      var stimuli = {
        order: order,
        leftColour: colours[order[0]],
        rightColour: colours[order[1]]
      };
      return stimuli
    }

    // Funciton to draw stimuli to the screen and start listening for clicks----------------------
    function displayChoice(singleOption) {

      if (singleOption == false) {
        
        option1.innerHTML = `
          <svg id="stimulus${(stimuli.order[0]+1)}" class="stimuli" width="300" height="300" draggable="false">
            <rect width="300" height="300" rx="15" ry="15" style="fill:${stimuli.leftColour}" />
          </svg>
          `;
        option2.innerHTML = `
          <svg id="stimulus${(stimuli.order[1]+1)}" class="stimuli" width="300" height="300" draggable="false">
            <rect width="300" height="300" rx="15" ry="15" style="fill:${stimuli.rightColour}" />
          </svg>
          `;

        // Select the stimuli so you can interact with them
        stimulus1 = display_element.querySelector("#stimulus1");
        stimulus2 = display_element.querySelector("#stimulus2");

        // Start "listening" for the participant clicking the stimulus
        // When they click on it, run the function chooseOption
        stimulus1.addEventListener("click", chooseOption1);
        stimulus2.addEventListener("click", chooseOption2);
      } else {

        centred.innerHTML = `
          <svg id="stimulus1" class="stimuli" width="300" height="300" draggable="false">
            <rect width="300" height="300" rx="15" ry="15" style="fill:${trial.colour1}" />
          </svg>
          `;

          stimulus1 = display_element.querySelector("#stimulus1");
          stimulus1.addEventListener("click", chooseOption1);
      }

    };

    // Functions for when the participant chooses each option
    // Necessary because you can't pass parameters directly into addEventListener (above)
    function chooseOption1() {makeChoice(selection=1, trial.singleOption)}
    function chooseOption2() {makeChoice(selection=2, trial.singleOption)}

    // What happens when the participant clicks the stimulus
    function makeChoice(selection, singleOption) {

      // Calculate reaction time
      const endTime = (new Date()).getTime();
      response_time = endTime - startTime;

      // Stop listening for clicks (so people can't select more than one option)
      stimulus1.removeEventListener("click", chooseOption1);

      if (singleOption == false) {
        stimulus2.removeEventListener("click", chooseOption2);
      }
      // Calculate and display outcome of choice
      outcome = outcomeDiscrete(selection);
      feedbackHTML(selection, trial.singleOption)

      // Update the tally
      updateTally(outcome);

      // Wait before displaying the next button
      setTimeout(function (){nextButton()}, 2000);

      return(response)
    };

    // Function that updates the tally
    function updateTally(outcome) {
      totalPoints += parseInt(outcome);

      // Draw tally using HTML
      tally = display_element.querySelector(".tally");
      tally.innerHTML = `Total points: <strong>${totalPoints}</strong>`

    }

    // Function that displays the number of points won
    function feedbackHTML(selection, singleOption){
      // String with the number of points won
      let feedbackString = ``;
      if (outcome == 1) {
        feedbackString = `${outcome} point`;
      } else {
        feedbackString = `${outcome} points`;
      }

      //When the participant chooses an option
      if(selection == 1){
        if(singleOption) {
          stimulus1.classList.add('chosen');
          // Draw feedback using HTML
          centred.innerHTML += `<div id='feedback1' class='feedback'><p>${feedbackString}</p></div>`;
        } else {
          // Add option to CSS classes that change opacity of the stimuli (same below)
          stimulus1.classList.add('chosen');
          stimulus2.classList.add('notChosen');
          // Draw feedback using HTML
          if (stimuli.order[0] == 0){
            option1.innerHTML += `<div id='feedback${selection}' class='feedback'><p>${feedbackString}</p></div>`;
          } else {
            option2.innerHTML += `<div id='feedback${selection}' class='feedback'><p>${feedbackString}</p></div>`;
          }
        }
      } else if(selection == 2){
        stimulus2.classList.add('chosen');
        stimulus1.classList.add('notChosen');
        if (stimuli.order[0] == 1){
          option1.innerHTML += `<div id='feedback${selection}' class='feedback'><p>${feedbackString}</p></div>`;
        } else {
          option2.innerHTML += `<div id='feedback${selection}' class='feedback'><p>${feedbackString}</p></div>`;
        }
      }
        
        // Save selection and outcome for trial data
        response.choice = selection;
        response.feedback = outcome;
    };

    // Draw the outcome from the probability distribution
    function outcomeDiscrete(selection) {

      if (selection == 1){
        if (trial.outcomes1.length == undefined){ // If there's only one possible outcome (same below)
          outcome = trial.outcomes1;
        } else {
          outcome = jsPsych.randomization.sampleWithReplacement(trial.outcomes1, 1, trial.prob1);
        }
      } else if (selection == 2){
        if (trial.outcomes2.length == undefined){
          outcome = trial.outcomes2;
        } else {
          outcome = jsPsych.randomization.sampleWithReplacement(trial.outcomes2, 1, trial.prob2);
        }
      }

      return(outcome)
    }

    // Function to draw the next button and to end the trial when participants click on it
    function nextButton() {

      next.innerHTML += `<button id="next-button" class="next-button jspsych-btn btn btn-outline-primary" draggable="false">Next</button>`;
      next.addEventListener("click", function (){
        endTrial();
      });
    }

    // What to do at the end of the trial
    function endTrial() {

      // Kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();

      // Remove from bandit styles css (in case the next trial uses standard jspsych.css)
      content.classList.remove("bandit-grid-container")


      const options = [trial.option1, trial.option2];
      const chosenOption = options[(response.choice - 1)];
      let leftOption = null;
      let rightOption = null;

      if (trial.singleOption) {
        leftOption = "";
        rightOption = "";
      } else {
        leftOption = options[stimuli.order[0]];
        rightOption = options[stimuli.order[1]];
      }

      // Save data
      var trial_data = {
        banditTrial: trialNumber,
        block: block,
        trialInBlock: trialInBlock,
        singleOption: trial.singleOption,
        leftOption: leftOption,
        rightOption: rightOption,
        choice: options[(response.choice - 1)],
        feedback: response.feedback,
        rt: response_time
      };

      // push outcome to array (for prize draw)
      outcomeArray.push(response.feedback);

      // interate index for context outcomes
      if (trial_data.choice == "context"){ contextIndex++ }

      // Clear the display
      display_element.innerHTML = '';

      // End trial
      jsPsych.finishTrial(trial_data);

    };

    var response_time = 0; 
    const startTime = (new Date()).getTime();
  };

  return plugin;
})();