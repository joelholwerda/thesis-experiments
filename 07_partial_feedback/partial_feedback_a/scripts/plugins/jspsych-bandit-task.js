
jsPsych.plugins["bandit-task"] = (function() {

  var plugin = {};
  
  plugin.info = {
    name: "bandit-task",
    description: "",
    parameters: {
      stimulus1: {
        type: jsPsych.plugins.parameterType.IMAGE,
        pretty_name: "Option 1",
        default_value: undefined,
        description: "Stimulus for Option 1."
      },
      stimulus2: {
        type: jsPsych.plugins.parameterType.IMAGE,
        pretty_name: "Option 2",
        default_value: undefined,
        description: "Stimulus for Option 2."
      },
      outcomeDistribution: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: "Outcome Distribution",
        default_value: undefined,
        description: "The type of distribution used to generate outcomes. Either 'discrete' or 'gaussian'."
      },
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

      // Probabilities only required for "discrete" outcomeDistribution
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

    let stimulus1 = null;
    let stimulus2 = null;

    // Variable to store trial data
    var response = {
      choice: null,
      feedback: null,
      rt: null
    };

    // Update trial number
    trialNumber++;

    // Add content to css class in order to apply bandit styles
    const content = document.querySelector("#jspsych-content");
    content.classList.add("bandit-grid-container");

    // Set up CSS grid container in HTML
    display_element.innerHTML = `
        <div class="grid-item tally">Total Points: ${totalPoints}</div>
        <div id="option1" class="grid-item options"></div>
        <div id="option2" class="grid-item options"></div>
        <div class="grid-item next"></div>`;

    // Make variables for the options and next button
    var option1 = display_element.querySelector("#option1");
    var option2 = display_element.querySelector("#option2");
    var next = display_element.querySelector(".next");
    var outcome = null;

    // If probabilities parameters == "equal", fill array to use in sampling function
    if (trial.probs1 == "equal"){
      trial.probs1 = Array(trial.outcomes1.length).fill(1);
    }
    if (trial.probs2 == "equal"){
      trial.probs2 = Array(trial.outcomes2.length).fill(1);
    }

    // Display choice stimuli once pre-trial interval has elapsed
    if(trial.preTrialInterval == 0){
      displayChoice();
    } else {
      jsPsych.pluginAPI.setTimeout(function(){
        displayChoice();
      }, trial.preTrialInterval);
    }

// FUNCTIONS -------------------------------------------------------------------------------------------------------

    function displayChoice() {

      option1.innerHTML = `<img id="stimulus1" class="stimuli" src="${trial.stimulus1}" draggable="false">`;
      option2.innerHTML = `<img id="stimulus2" class="stimuli" src="${trial.stimulus2}" draggable="false">`;

      stimulus1 = display_element.querySelector("#stimulus1");
      stimulus2 = display_element.querySelector("#stimulus2");

      stimulus1.addEventListener("click", chooseOption1);
      stimulus2.addEventListener("click", chooseOption2);

    };

    function chooseOption1() {makeChoice(selection=1)}
    function chooseOption2() {makeChoice(selection=2)}

    function makeChoice(selection) {

      // Calculate reaction time
      const endTime = (new Date()).getTime();
      response_time = endTime - startTime;

      stimulus1.removeEventListener("click", chooseOption1);
      stimulus2.removeEventListener("click", chooseOption2);

      // Determine the outcome of the choice
      if (trial.outcomeDistribution == "discrete") {
        outcome = outcomeDiscrete(selection);
        feedbackHTML(selection)

      } else if (trial.outcomeDistribution == "predetermined") {
        outcome = outcomePredetermined(selection);
        feedbackHTML(selection)
      }

      // Update the tally
      updateTally(outcome);

      // Wait before displaying the next button
      setTimeout(function (){nextButton()}, 2000);

      return(response)
    };

    function updateTally(outcome) {
      totalPoints += outcome;

      tally = display_element.querySelector(".tally");
      tally.innerHTML = `Total Points: ${totalPoints}`

    }

    function feedbackHTML(selection){
      if(selection == 1){
        stimulus1.classList.add('chosen');
        stimulus2.classList.add('notChosen');
        option1.innerHTML += `<div id='feedback${selection}' class='feedback'><p>${outcome} points</p></div>`;
        } else if(selection == 2){
          stimulus2.classList.add('chosen');
          stimulus1.classList.add('notChosen');
          option2.innerHTML += `<div id='feedback${selection}' class='feedback'><p>${outcome} points</p></div>`;
        }
        
        response.choice = selection;
        response.feedback = outcome;
    };

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

    function outcomePredetermined(selection) {

      if (selection == 1){
        if (trial.outcomes1.length == undefined){
          outcome = trial.outcomes1;
        } else {
          outcome = trial.outcomes1[(outcomesIndex1)];
          outcomesIndex1 += 1;
        }
      } else if (selection == 2){
        if (trial.outcomes2.length == undefined){
          outcome = trial.outcomes2;
        } else {
          outcome = trial.outcomes2[(outcomesIndex2)];
          outcomesIndex2 += 1;
        }
      }

      return(outcome)
    }

    function nextButton() {

      next.innerHTML += `<button id="next-button" class="next-button hvr-grow" draggable="false">NEXT</button>`;
      next.addEventListener("click", function (){
        endTrial();
      });
    }

    function endTrial() {

      // Kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();

      // Remove from bandit styles css
      content.classList.remove("bandit-grid-container")

      // Data saving
      var trial_data = {
        trial: trialNumber,
        choice: shuffledOptions[(response.choice - 1)],
        feedback: response.feedback,
        left_stimulus: trial.stimulus1.replace("images/stimuli/", "").replace(".jpg", ""),
        right_stimulus: trial.stimulus2.replace("images/stimuli/", "").replace(".jpg", ""),
        left_option: shuffledOptions[0],
        right_option: shuffledOptions[1],
        rt: response_time
      };

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