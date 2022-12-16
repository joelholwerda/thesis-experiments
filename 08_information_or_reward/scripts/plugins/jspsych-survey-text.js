/**
 * jspsych-survey-text
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
        description: 'Specify specify task as "comments" or leave blank'
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
    if (trial.task == "comments") {
      html += '<div class="jspsych-comments-task-container">';
    } else {
      html += '<div class="jspsych-survey-text-question-container">';
    }
    
    // show preamble text
    if(trial.preamble !== null){
      html += '<div id="jspsych-survey-text-preamble" class="jspsych-survey-text-preamble">'+trial.preamble+'</div>';
    }

        // add questions
        if(trial.task !== "comments"){
          html += '<div class="jspsych-survey-text-question-group">';
            for (var i = 0; i < trial.questions.length; i++) {
              html += '<div id="jspsych-survey-text-question-"'+i+'" class="jspsych-survey-text-question">';
                html += '<p class="jspsych-survey-text">' + trial.questions[i].prompt + '</p>';
              html += '</div>'; // jspsych-survey-text-question
            }
          html += '</div>'; // jspsych-survey-text-question-group
        }

        // add input for answers
        if (trial.task == "comments") {
          html += '<div class="jspsych-comments-task-answer-group">';
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
    html += '</div>'; // jspsych-survey-text-question-container OR jspsych-comments-task-container


    display_element.innerHTML = html;

    // focus on first input
    document.getElementsByName("#jspsych-survey-text-response-0")[0].focus();

    const next = display_element.querySelector('#jspsych-survey-text-next');

    next.style.visibility = "hidden";
        
        setTimeout(()=> {
          next.style.visibility = "visible";
          next.addEventListener('click', btnListener);
        }, 2000);
    
    // function for when next button pressed
    function btnListener() {
      // measure response time
      var endTime = (new Date()).getTime();
      var response_time = endTime - startTime;

      // create object to hold responses
      var question_data = {};
      var matches = display_element.querySelectorAll('div.jspsych-survey-text-answer');
      for(var index=0; index<matches.length; index++){
        var id = "Q" + index;
        var val = matches[index].querySelector('textarea, input').value;
        var obje = {};
        obje[id] = val;
        Object.assign(question_data, obje);
      }
      // save data
      var trialdata = {
        "rt": response_time,
        "responses": JSON.stringify(question_data)
      };

      display_element.innerHTML = '';

      // update participant ID with input response
      if (trial.questions[0].prompt == "ID:") {
        if (typeof participantID != "undefined") {
          let idString = JSON.parse(trialdata.responses).Q0;
          participantID = parseInt(idString);
        }
      }

      // next trial
      jsPsych.finishTrial(trialdata);

    }

    var startTime = (new Date()).getTime();
  };

  return plugin;
})();
