jsPsych.plugins["recaptcha"] = (function() {

  var plugin = {};

  plugin.info = {
    name: "recaptcha",
    parameters: {
      preamble: {
        type: jsPsych.plugins.parameterType.STRING,
        default: "Please click the reCAPTCHA checkbox below to prove you're not a robot"
      },
      button_label: {
        type: jsPsych.plugins.parameterType.STRING,
        default: "Submit"
      },
      error_message: {
        type: jsPsych.plugins.parameterType.STRING,
        default: "You must complete the reCAPTCHA in order to begin the experiment."
      }
    }
  }

  plugin.trial = function(display_element, trial) {

    // Add recaptcha api link to head
    recaptchaLink = document.createElement('script')
    recaptchaLink.src = 'https://www.google.com/recaptcha/api.js';
    document.getElementsByTagName('head')[0].appendChild(recaptchaLink);
    
    // HTML and CSS
    display_element.innerHTML = `
      <style>
        #recaptcha-container{
          display: relative;
          display: grid;
          grid-template-columns: 1fr 800px 1fr;
          grid-template-rows: 3fr auto 1fr 100px 3fr auto 100px;
          grid-template-areas:
          ". . ."
          ". preamble ."
          ". . ."
          ". recaptcha ."
          ". . ."
          ". submit ."
          ". . .";
          width: 100vw;
          height: 100vh;
        }
        #recaptcha-preamble{
          text-align: center;
          grid-area: preamble;
          font-size: 16pt;
          line-height: 1.5em;
        }  
        .recaptcha{
          grid-area: recaptcha;
          border
        }
        .g-recaptcha{
          display: inline-block;
          padding: 7px 5px 5px 7px;
        }
        #error-message{
          text-align: center;
          grid-area: error;
        }
        .submit{
          grid-area: submit;
        }
      </style>

      <div id="recaptcha-container">
        <div id="recaptcha-preamble">${trial.preamble}</div>
        <div class="recaptcha"><div class="g-recaptcha" data-sitekey="6Le0trAUAAAAACZKjTOMlIbxiG9GtBNtVZnbwNlX"></div></div> 
        <div class="submit"><button id="submit-recaptcha" class="jspsych-btn">${trial.button_label}</button></div>
      </div>
    `;

    let recaptcha = display_element.querySelector(".g-recaptcha");

    // Send AJAX request to PHP file when submit is clicked
    const submit = display_element.querySelector("#submit-recaptcha");
    submit.addEventListener("click", sendAjaxRequest);

    // Functions --------------------------------------------------------------------------------
    function sendAjaxRequest() {
      if (grecaptcha === undefined) {
        alert('Recaptcha not defined'); 
        return; 
      }
    
      var response = grecaptcha.getResponse();
    
      if (!response) {
        recaptcha.style.borderStyle = 'solid';
        recaptcha.style.borderWidth = '3px';
        recaptcha.style.borderColor = 'red';
        recaptcha.style.borderRadius = '10px';
        alert(trial.error_message);
        return; 
      }
    
      var ajax = new XMLHttpRequest();
      ajax.onreadystatechange = function() {
        if (this.readyState === 4) {
          if (this.status === 200) {
            if (this.responseText == 'valid') {
              endTrial();
            }
          }
        }
      }
      ajax.open('GET', `validate-recaptcha.php?recaptcha=${response}`, true);
      ajax.send();
    }
    
    function endTrial() {
    
      // Kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();
    
      // Clear the display
      display_element.innerHTML = '';
    
      // data saving
      var trial_data = {
        parameter_name: 'parameter value'
      };
    
      // end trial
      jsPsych.finishTrial(trial_data);
    }
  };

  return plugin;
})();


