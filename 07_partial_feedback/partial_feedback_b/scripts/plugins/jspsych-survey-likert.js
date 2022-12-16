
jsPsych.plugins['survey-likert'] = (function() {

  var plugin = {};

  plugin.info = {
    name: 'survey-likert',
    description: '',
    parameters: {
      instructions: {type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Instructions',
        default: null,
        description: 'Instructions to be displayed on a screen prior to the questionnaire.'},
      stimulus: {
        type: jsPsych.plugins.parameterType.IMAGE,
        pretty_name: "Stimulus",
        default_value: undefined,
        description: "Image associated with option."
      },
      side: {type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Side',
        default: undefined,
        description: 'Side of the screen that the stimulus is presented.'},
      questions: {
        type: jsPsych.plugins.parameterType.COMPLEX,
        array: true,
        pretty_name: 'Questions',
        nested: {
          prompt: {type: jsPsych.plugins.parameterType.STRING,
                     pretty_name: 'Prompt',
                     default: undefined,
                     description: 'Questions that are associated with the slider.'},
          labels: {type: jsPsych.plugins.parameterType.STRING,
                   array: true,
                   pretty_name: 'Labels',
                   default: undefined,
                   description: 'Labels to display for individual question.'},
          required: {type: jsPsych.plugins.parameterType.BOOL,
                     pretty_name: 'Required',
                     default: false,
                     description: 'Makes answering questions required.'}
        }
      },
      preamble: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Preamble',
        default: null,
        description: 'String to display at top of the page.'
      },
      button_label: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Button label',
        default:  'Next',
        description: 'Label of the button.'
      }
    }
  }

  plugin.trial = function(display_element, trial) {

    epistemicTrial++;

    // HTML structure
    display_element.innerHTML = `
    <div id="likert-container">
      <div id="jspsych-survey-stimulus" class="grid-item options"></div> 
      <div id="likert-form-container" class="grid-item">
        <div id="jspsych-survey-likert-instructions">
          <div id="jspsych-survey-likert-instructions-text"></div>
          <div id="jspsych-survey-likert-instructions-button"></div>
        </div>
        <div id="jspsych-survey-likert-preamble"></div>
        <form id="jspsych-survey-likert-form" data-simplebar data-simplebar-auto-hide="false"><form>
      </div>
    </div>`;

    // select Likert container
    const likertContainer = display_element.querySelector('#likert-container');
    const stimulus = display_element.querySelector('#jspsych-survey-stimulus');
    const instructions = display_element.querySelector('#jspsych-survey-likert-instructions');
    const instructionsText = display_element.querySelector('#jspsych-survey-likert-instructions-text');
    const instructionsButton = display_element.querySelector('#jspsych-survey-likert-instructions-button');
    const preamble = display_element.querySelector('#jspsych-survey-likert-preamble');
    const form = display_element.querySelector('#jspsych-survey-likert-form');

    // Add likert contaier to class to display stimulus on left or right
    if (trial.side == "left") {
      likertContainer.classList.add('likert-container-left');
    } else {
      likertContainer.classList.add('likert-container-right');
    }
    
    // HTML for stimulus
    stimulus.innerHTML = `<img id="stimulus1" class="stimuli" src="${trial.stimulus}" draggable="false">`;

    // HTML for instructions ---------------------------------------------------------------------------------------------
    
    instructionsButton.innerHTML = `<button id="jspsych-survey-instructions-next" class="next-button hvr-grow" draggable="false">NEXT</button>`;
    instructionsText.innerHTML = `<p>${trial.instructions}</p>`;

    const instructionsNext = display_element.querySelector('#jspsych-survey-instructions-next');

    // Display next button after delay
    setTimeout(()=> instructionsButton.style.visibility = "visible", 3000);

    // Display likert survey when next button is clicked
    instructionsNext.addEventListener("click", function (){
      instructions.style.display = "none";
      preamble.style.display = "block";
      form.style.display = "block";
    });

    // HTML for preamble text ----------------------------------------------------------------------------------------------
    if(trial.preamble !== null){
      preamble.innerHTML = trial.preamble;
    }

    // HTML for likert form
    let questionnaire = "";

    // Add likert scale questions
    for (var i = 0; i < trial.questions.length; i++) {
      // Add question
      questionnaire += '<label class="jspsych-survey-likert-statement">' + trial.questions[i].prompt + '</label>';
      // Add options
      var width = 100 / trial.questions[i].labels.length;
      var options_string = '<ul class="jspsych-survey-likert-opts" data-radio-group="Q' + i + '">';
      for (var j = 0; j < trial.questions[i].labels.length; j++) {
        options_string += '<li style="width:' + width + '%"><input type="radio" name="Q' + i + '" value="' + j + '"';
        if(trial.questions[i].required){
          options_string += ' required';
        }
        options_string += '><label class="jspsych-survey-likert-opt-label">' + trial.questions[i].labels[j] + '</label></li>';
      }
      options_string += '</ul>';
      questionnaire += options_string;
    }

    // HTML for submit button
    questionnaire += '<input type="submit" id="jspsych-survey-likert-next" class="jspsych-survey-likert next-button hvr-grow" value="'+trial.button_label+'"></input>';

    form.innerHTML = questionnaire;

    // Scroll to top of questionnaire
    form.scrollTop = 0;

    // function for Likert responses -------------------------------------------------------------------
    display_element.querySelector('#jspsych-survey-likert-form').addEventListener('submit', function(e){
      e.preventDefault();
      // measure response time
      var endTime = (new Date()).getTime();
      var response_time = endTime - startTime;

      // create object to hold responses
      var question_data = {};
      var matches = display_element.querySelectorAll('#jspsych-survey-likert-form .jspsych-survey-likert-opts');
      for(var index = 0; index < matches.length; index++){
        var id = matches[index].dataset['radioGroup'];
        var el = display_element.querySelector('input[name="' + id + '"]:checked');
        if (el === null) {
          var response = "";
        } else {
          var response = parseInt(el.value);
        }
        var obje = {};
        obje[id] = response;
        Object.assign(question_data, obje);
      }

      // save data
      var trial_data = {"rt": response_time};
      Object.assign(trial_data, question_data);

      likertContainer.innerHTML = '';
      
      // next trial
      if (epistemicTrial == 1) {
        display_element.innerHTML = '';
        jsPsych.finishTrial(trial_data);
      } else {
        likertContainer.style.backgroundColor = "white";
        setTimeout(()=> {
          display_element.innerHTML = '';
          jsPsych.finishTrial(trial_data);
        }, 2000)
      }
    });

    var startTime = (new Date()).getTime();

  };

  return plugin;
})();
