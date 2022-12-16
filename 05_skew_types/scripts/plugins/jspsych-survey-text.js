/**
 * jspsych-survey-text plugin (adapted for percentage and ftm task responses)
 * a jspsych plugin for free response survey questions
 *
 * Josh de Leeuw
 *
 * documentation: docs.jspsych.org
 *
 */


jsPsych.plugins['survey-text'] = (function() {

  var plugin = {};

  plugin.info = {
    name: 'survey-text',
    description: '',
    parameters: {
      task: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Task',
        default: null,
        description: 'Specify specify task as "comments", "percentage", "ftm"  or leave blank'
      },
      questions: {
        type: jsPsych.plugins.parameterType.COMPLEX,
        array: true,
        pretty_name: 'Questions',
        default: undefined,
        nested: {
          prompt: {
            type: jsPsych.plugins.parameterType.STRING,
            pretty_name: 'Prompt',
            default: null,
            description: 'Prompt for the subject to response'
          },
          value: {
            type: jsPsych.plugins.parameterType.STRING,
            pretty_name: 'Value',
            default: "",
            description: 'The string will be used to populate the response field with editable answer.'
          },
          rows: {
            type: jsPsych.plugins.parameterType.INT,
            pretty_name: 'Rows',
            default: 1,
            description: 'The number of rows for the response text box.'
          },
          columns: {
            type: jsPsych.plugins.parameterType.INT,
            pretty_name: 'Columns',
            default: 40,
            description: 'The number of columns for the response text box.'
          }
        }
      },
      colour: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Colour',
        default: null,
        description: 'The colour of the coloured square to be presented above the preamble text.'
      },
      preamble: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Preamble',
        default: null,
        description: 'HTML formatted string to display at the top of the page above all the questions.'
      },
      button_label: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Button label',
        default:  'Next',
        description: 'The text that appears on the button to finish the trial.'
      }
    }
  }

  plugin.trial = function(display_element, trial) {

    for (var i = 0; i < trial.questions.length; i++) {
      if (typeof trial.questions[i].rows == 'undefined') {
        trial.questions[i].rows = 1;
      }
    }
    for (var i = 0; i < trial.questions.length; i++) {
      if (typeof trial.questions[i].columns == 'undefined') {
        trial.questions[i].columns = 40;
      }
    }
    for (var i = 0; i < trial.questions.length; i++) {
      if (typeof trial.questions[i].value == 'undefined') {
        trial.questions[i].value = "";
      }
    }

    var html = "";
    
    // ADDED CONTAINER TO STYLE QUESTIONS AND ANSWERS
    if (trial.task == "percentage") {
      html += '<div class="jspsych-percentage-task-container">';
    } else if (trial.task == "ftm" || trial.task == "comments") {
      html += '<div class="jspsych-ftm-task-container">';
    } else {
      html += '<div class="jspsych-survey-text-question-container">';
    }
    
    // show coloured square
    if(trial.colour !== null){
      html += `
        <div id="jspsych-survey-text-stimulus" class="jspsych-survey-text-stimulus">
          <svg width="250" height="250" draggable="false">
            <rect width="250" height="250" rx="12" ry="12"style="fill:${trial.colour}" />
          </svg>
        </div>`;
    }

    // show preamble text
    if(trial.preamble !== null){
      html += '<div id="jspsych-survey-text-preamble" class="jspsych-survey-text-preamble">'+trial.preamble+'</div>';
    }

        // add questions
        if(trial.task !== "ftm"  && trial.task !== "comments"){
          html += '<div class="jspsych-survey-text-question-group">';
            for (var i = 0; i < trial.questions.length; i++) {
              html += '<div id="jspsych-survey-text-question-"'+i+'" class="jspsych-survey-text-question">';
                html += '<p class="jspsych-survey-text">' + trial.questions[i].prompt + '</p>';
              html += '</div>'; // jspsych-survey-text-question
            }
          html += '</div>'; // jspsych-survey-text-question-group
        }

        // add input for answers
        if (trial.task == "ftm" || trial.task == "comments") {
          html += '<div class="jspsych-ftm-task-answer-group">';
        } else {
          html += '<div class="jspsych-survey-text-answer-group">';
        }
          for (var i = 0; i < trial.questions.length; i++) {
            html += '<div id="jspsych-survey-text-answer-'+i+'" class="jspsych-survey-text-answer">';
              if(trial.questions[i].rows == 1){
                html += `<input type="text" name="#jspsych-survey-text-response-${i}" class="form-control" autocomplete="off" size="${trial.questions[i].columns}" value="${trial.questions[i].value}"></input>`;
              } else {
                html += `<textarea name="#jspsych-survey-text-response-${i}" class="form-control" autocomplete="off" cols="${trial.questions[i].columns}" rows="${trial.questions[i].rows}">${trial.questions[i].value}</textarea>`;
              }
            html += '</div>'; // jspsych-survey-text-answer
          }
        html += '</div>'; // jspsych-survey-text-answer-group

      // add submit button
      html += '<div class="jspsych-survey-text-button">';
        html += '<button id="jspsych-survey-text-next" class="jspsych-btn jspsych-survey-text btn btn-outline-primary">'+trial.button_label+'</button>';
      html += '</div>'; //jspsych-survey-text-button
    html += '</div>'; // jspsych-survey-text-question-container OR jspsych-percentage-task-container OR jspsych-ftm-task-container

    display_element.innerHTML = html;

    // focus on first input
    document.getElementsByName("#jspsych-survey-text-response-0")[0].focus();

    display_element.querySelector('#jspsych-survey-text-next').addEventListener('click', function() {
      // measure response time
      var endTime = (new Date()).getTime();
      var response_time = endTime - startTime;

      // create object to hold responses
      var question_data = {};
      var input_array = [];
      var matches = display_element.querySelectorAll('div.jspsych-survey-text-answer');
      for(var index=0; index<matches.length; index++){
        if (trial.task == "percentage") {
          var id = percentageOrder[index];
        } else {
          var id = "Q" + index;
        }
        var val = matches[index].querySelector('textarea, input').value;
        var obje = {};
        obje[id] = val;
        Object.assign(question_data, obje);
        input_array.push(val);
      }

      if (trial.task == "percentage" && (parseInt(input_array[0]) + parseInt(input_array[1]) != 100)) {

        alert("Your answers are percentages and should sum to 100.");   
             
      } else if (trial.task == "ftm" && isNaN(parseInt(input_array[0]))) {

        alert("Please enter a number into the box.");

      } else if (response_time < 1000) {

      } else {
        // save data
        var trialdata = {
          "rt": response_time,
          "responses": JSON.stringify(question_data)
        };

        display_element.innerHTML = '';

        // next trial
        jsPsych.finishTrial(trialdata);
      }

    });

    var startTime = (new Date()).getTime();
  };

  return plugin;
})();
