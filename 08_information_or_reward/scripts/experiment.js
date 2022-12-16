
let timeline = [];
let trialNumber = 0;
let sampleNumber = 0;
let epistemicNumber = 0;
let filenameParent = "";
let filename = "";
let trialType = "";
let paypalEmail = "";
let outcomeArray = [];
let ellsbergArray = [];
let banditScore = 0;
let ellsbergScore = 0;
let totalScore = 0;
let prize = 0;

// Trial settings
const pointsPerDollar = 1000;
const nSamples = 100;
const nStimuli = nSamples * 2 + 4; // Plus four for the stimuli used in the questionnaire
const colours = ["red", "blue"]; // List of colours that corresponds to the file prefixes
const stimuli = shuffleStimuli(nStimuli, colours);
const shuffledOptions = jsPsych.randomization.sampleWithoutReplacement(["safe", "risky"]);
const turkCode = (Math.floor(Math.random() * 899999) + 100000).toString();
const participantID = getSonaId();
const condition = assignCondition();

const useFullscreen = true;
const noRecaptcha = true;
const testBandit = false;
const testSecondChoice = false;
const testEllsberg = false;

// Begin experiment
runExperiment();

function runExperiment(){

  // Warn on exit or reload
  window.addEventListener("beforeunload", alertBeforeUnload);

  function alertBeforeUnload(e) {
    e.preventDefault();
    e.returnValue = 'Are you sure you want to leave the experiment?';
  };

  // Add participant ID and condition to data
  jsPsych.data.addProperties({
    participant: participantID,
    condition: condition
  });

  // Instructions ---------------------------------------------------------------------------------------------

  // Welcome page
  let welcomePage = {
    type: 'instructions',
    pages: [
      `
        <p><strong>Thanks for signing up! This experiment is a psychological study that investigates how people make decisions. It involves the following steps:</strong></p>
        <ol>
          <li> <span> First we need to ask for your informed consent.<br></span></li>
          <li> <span> We'll then ask for some demographic information including your PayPal account email address. This will only be used to send you any money that you earn during the task.<br></span></li>
          <li> <span> Next, we'll give you instructions that explain how to do the task in detail. You will need to pass a short quiz that checks your understanding of how the experiment works.<br></span></li>
          <li> <span> Following the instructions, you will be able to complete the experimental task&#8212a simple game that involves making choices.<br></span></li>
          <li> <span> When you have completed the task, we will redirect you back to the Sona page so that they can record your participation.</span></li>
        </ol>
      `,
      `
        <p>
          <strong>The experiment should take around 20 minutes</strong>. <br><br> 
          Please <strong>do not</strong> attempt to complete the experiment on a mobile device or tablet. It will not work correctly. You should also avoid using the "back" button on your browser or closing the window until the very end when you are redirected back to the Sona page. Doing so might break the experiment and make it more difficult to verify your participation, but if something does go wrong, please contact us.
        </p>
      `
    ],
    show_clickable_nav: true,
    show_page_number: true
  };

  // Consent form
  var consent = {
    type: 'instructions',
    pages: [`<img src="images/consent-form-internal.png" width="700" height="850" style="margin-bottom:25px">`],
    show_clickable_nav: true,
    button_label_next: "Accept"
  }

  // reCAPTCHA
  var recaptcha = {
    type: 'recaptcha',
    preamble: `<div style="font-size:16pt;">Before we begin the experiment, we just need to check that you're not a robot. Please click the reCAPTCHA checkbox below.</div>`,
    button_label: 'Next'
  };

  // Demographics
  const demographics = {
    type: 'survey-text',
    task: null,
    preamble: '<strong>Please answer the following demographic questions:</strong><br>(or click Next if you would prefer not to answer):',
    questions: [
      {prompt: 'Age:', value: '', columns: 17},
      {prompt: 'Gender:', value: '', columns: 17}
    ],
    data: {task: "demographics"},
  };

  
// PayPal
const paypal = {
  type: 'survey-text',
  task: null,
  preamble: 'You will be able to earn a small amount of real money depending on the choices you make in this experiment. We will send you any money you earn via PayPal. <strong>Please enter the email address associated with your PayPal account below.</strong> If you don\'t have a PayPal account, you can sign up for one <strong><a href="https://www.paypal.com/welcome/signup/" target="_blank">here</a></strong>.'
  ,
  questions: [
    {prompt: '<strong>PayPal account email address:</strong>', value: '', columns: 40}
  ],
  data: {task: "demographics"},
  on_finish: function(data) {
    const responses = JSON.parse(data.responses);
    paypalEmail = responses.Q0;
  }
};


  // Instructions
  var mainInstructions = {
    type: 'instructions',
    pages: [
      `<strong>Here's some more information about the experiment:</strong> <br><br>
      It will involve a game in which you'll be able to earn points while choosing between options similar to the ones presented below. But there's a catch...<br>
      <img id="instructions-screenshot" src="images/bandit-screenshot-stimuli.png" width="500px">`,
      `Each time you select an option, you will have to choose between two possible actions. 
      You will be able to either <strong>observe</strong> or <strong>claim</strong> the outcome.<br>
      <img id="instructions-screenshot" src="images/bandit-screenshot-options.png" width="500px">`,
      `When you choose to <strong>observe</strong> the outcome, it will be displayed on the screen. This will allow you to learn the outcomes associated with each option, <strong>but the points will not be added to your total score</strong><br>
      <img id="instructions-screenshot" src="images/bandit-screenshot-observe.png" width="500px">`,
      `If you instead decide to <strong>claim</strong> the outcome, the number of points <strong>will not be displayed</strong> but they <strong>will</strong> be added to your total score.<br>
      <img id="instructions-screenshot" src="images/bandit-screenshot-claim.png" width="500px">`,
      `You will have a total of ${nSamples} opportunities to either observe or claim the outcomes of different options. <strong>Your goal is to win as many points as possible</strong> and to do this, you will need to balance learning about the available options and adding points to your score.`,
      `At the end of the experiment, any points you earn will be converted into <strong>real money</strong>. You will be paid <strong>$1 for every 1000 points earned</strong>. We will send this money to your PayPal account.`,
      `The next screen contains <strong>a short quiz</strong> to check your understanding of the task. 
      You can review the instructions by clicking the Previous button or click Next when you're ready for the quiz.`
    ],
    show_clickable_nav: true,
    show_page_number: true
  };


  // Instructions attention check -- participants must answer all questions correctly to continue
  let quizIncorrect = true;
  let quizRepeats = 0;
  const question1 = `How will you be able to learn about each option?`;
  const question2 = `How will you be able to earn points in the game?`
  const question3 = `Is it possible to earn real money in this experiment?`
  const options1 = [
    "There will be written instructions describing the possible outcomes associated with each option.",  
    "During the game, it will be possible to sample a total of 50 options and receive feedback. The points earned from sampling contribute to the final score.", 
    "Each time an option is selected, it will be possible to either observe or claim the outcome. Choosing 'observe outcome' will display the outcome but these points will not be added to the final score.", 
    "It will not be possible to learn about the options during the game."
    
  ];
  const options2 = [
    "When points are displayed on the screen, these points are added to the total score.",  
    "Each time an option is selected, it will be possible to either observe or claim the outcome. Choosing 'claim outcome' will add these points to the final score but they will not be displayed on the screen.", 
    "Each time an option is selected, it will be possible to either observe or claim the outcome. Choosing 'claim outcome' will display the outcome but these points will not be added to the final score.", 
    "During the game, it will "
  ];
    const options3 = [
    "No, it is not possible to earn a bonus payment of real money during this experiment.",
    "Yes! I can earn a bonus payment of $1 for every 1000 points added to the final score by claiming outcomes.",  
    "Yes! I can earn a bonus payment of $1 for every 25 points earned for one randomly selected choice.", 
    "Select this option to review the instructions."
  ];
  const quizAnswers = `{"Q1":"Each time an option is selected, it will be possible to either observe or claim the outcome. Choosing 'observe outcome' will display the outcome but these points will not be added to the final score.","Q2":"Each time an option is selected, it will be possible to either observe or claim the outcome. Choosing 'claim outcome' will add these points to the final score but they will not be displayed on the screen.","Q3":"Yes! I can earn a bonus payment of $1 for every 1000 points added to the final score by claiming outcomes."}`;

  let instructionsQuiz = {
    type: 'survey-multi-choice',
    questions: [
      {prompt: question1, name: "Q1", options: options1, required: true},
      {prompt: question2, name: "Q2", options: options2, required: true},
      {prompt: question3, name: "Q3", options: options3, required: true}
    ],
    button_label: 'Next',
    randomize_question_order: false,
    data: {task: "quiz", repeats: quizRepeats},
    on_finish: function(data) {
      if( data.responses == quizAnswers) {
        quizIncorrect = false;
      } else {
        quizRepeats++;
      }
    }
  };

  // Additional instructions shown before looping (if the participants get at least one question wrong)
  let conditionalInstructions = {
    timeline: [
      {
        type: 'instructions',
        pages: [`At least one of your answers was incorrect. Please review the instructions and try again.`],
        show_clickable_nav: true,
        show_page_number: true
      }
    ],
    conditional_function: function(data) {
      return quizIncorrect;
    }
  };

  // jsPsych looping function for instructions and quiz
  let instructionsLoop = {
    timeline: [mainInstructions, instructionsQuiz, conditionalInstructions],
    loop_function: function(data) {
      return quizIncorrect;
    }
  };

  // Full screen mode
  let fullscreen = {
    type: 'fullscreen',
    message: `Great work! You answered the questions correctly. Click START when you're ready to begin the game.`,
    button_label: "START",
    fullscreen_mode: true
  };

  // Ellsberg instructions
  var ellsbergInstructions = {
    type: 'instructions',
    pages: [
      `<strong>You have finished the first section of the experiment!</strong> <br><br>
      In the next (much shorter) section, you will play another game that involves choosing between pairs of options.
      Similarly to the first game, you will have the opportunity to earn some <strong>real money</strong>.`,
      `You will be asked to choose between two boxes. Each box contains <strong>100 balls</strong> that can be either <font color="orange"><strong>orange</strong></font color> or <font color="purple"><strong>purple</strong></font color>.
      After you choose a box, one ball will be randomly selected from that box. If the ball is the right colour, you will win an additional <strong>100 points</strong> that will be added to your final score.`
    ],
    show_clickable_nav: true,
    show_page_number: true
  };

  // Optional comments
  var comments = {
    type: 'survey-text',
    task: 'comments',
    preamble: `
    <span style="font-size:15pt; line-height: 1.6em;">Great work! You can use the textbox below to write any thoughts you have regarding the experiment. Did you use any particular strategies? Were there specific things that influenced your choices? Did you encounter any technical problems or instructions that were unclear? <strong>(Optional)</strong></span>`,
    questions: [{value: '', rows: 10, columns: 50}],
    data: function() {
      // Determine payment amount and store with Paypal
      // Calculate sum of claimed outcomes then combine with Ellsberg score
      banditScore = outcomeArray.reduce((a,b) => a + b, 0);
      ellsbergScore = ellsbergArray.reduce((a,b) => a + b, 0);
      totalScore = banditScore + ellsbergScore;
      
      // Round prize up to nearest $0.50
      prize = (totalScore / pointsPerDollar) + (0.5 - (totalScore / pointsPerDollar) % 0.5);
      
      return {task: "comments", paypal: paypalEmail, prize: prize};}
  };

  var debrief = {
    type: 'instructions',
    pages: [
      `<p><strong>Here's some information about the experiment that you just completed (you might need to scroll down). The next screen contains your final score.</strong></p>
      <ol id="debrief-list">
        <li>
          <font color="#0000cd"><strong>What kind of study is it, e.g., descriptive, correlational?</strong></font>
          This study uses an experimental design that manipulates variables within- and between-subjects. <br>
        </li>
        <li>
          <font color="#0000cd"><strong>What are the independent variables? How are you operationalising them?</strong></font>
          The aim of this experiment was to assess whether variability in the appearance of options influences the way people interpret uncertainty. Participants were randomly assigned to two groups. In the low variability group, participants were presented with the same two pictures for each choice, whereas, in the high variability group, participants were presented with slightly different pictures for every choice.<br>
        </li>
        <li>
          <font color="#0000cd"><strong>What are the dependent variables that were measured? How are you operationalising them?</strong></font>
          The dependent measures were the proportion of choices for which participants selected the riskier of the two options and their responses to the uncertainty questionnaire. <br>
        </li>
        <li>
          <font color="#0000cd"><strong>What is one potential confounding variable and how have you attempted to control for it?</strong></font>
          It is possible that participants may show a preference for some colours and select an option based on colour-preference rather than risk-preference. To alleviate this possible issue, the colour associated with each outcome remains contingent for each participant but is counterbalanced between participants. <br>
        </li>
        <li>
          <font color="#0000cd"><strong>What is one potential ethical issue, and how has the experimenter attempted to resolve it?</strong></font>
          The confidentiality of participants is an ethical concern for all experiments. This is addressed in this study by de-identifying participants using numbers instead of identifiable personal information. <br>
        </li>
        <li>
          <font color="#0000cd"><strong>How did the experimenter get from first year psychology to conducting this research?</strong></font>
          After graduating with a Bachelor of Arts in Psychology, I spent four years working and travelling before returning to complete my Honours and PhD at UNSW under the supervision of Prof. Ben Newell.
        </li>
      </ol>
      `
    ],
    show_clickable_nav: true,
    show_page_number: true,
    on_finish: function(){
      filename = `paypal/${filenameParent}-paypal`;
      saveData(filename, `id, paypal, prize
      ${participantID}, ${paypalEmail}, ${prize}`);
    }
  };

  const instructionsEnd = {
    type: 'instructions',
    pages: function() {

      return [`
        <span style="font-weight:bold;font-size:130%">You have finished the experiment!</span> <br><br> 
        Thanks for participating! You chose to claim ${outcomeArray.length} outcomes in the first task and earned <strong>${banditScore} points</strong>. In the second task you earned an additional <strong>${ellsbergScore} points</strong> giving you a final score of <strong>${totalScore} points</strong>.
        Your total prize will be <span style="font-weight:bold;font-size:130%">$${prize.toFixed(2)}</span>. We will send the money that you earned to the PayPal account provided at the beginning of the experiment.<br><br>
        <span style="font-weight:bold;font-size:130%">Click Next to return to Sona and receive participation credit.</span>
        `]
      },
    show_clickable_nav: true,
    show_page_number: false,
    on_finish: function() {
      window.removeEventListener("beforeunload", alertBeforeUnload);
      window.location = `https://unsw-psy.sona-systems.com/webstudy_credit.aspx?experiment_id=1339&credit_token=92297749b97b470381c02e8f64a14c16&survey_code=${participantID}`;
    }
  }

  // Bandit task -------------------------------------------------------------------------------------------------------
    const sampling = {
      type: "bandit-task",
      outcomes1: () => generateOutcomes(shuffledOptions[0]),
      outcomes2: () => generateOutcomes(shuffledOptions[1]),
      probs1: [0.5, 0.5],
      probs2: [0.5, 0.5],
      feedbackDuration: 2000,
      preTrialInterval: 0
    };

  // Epistemic questionnaire

  function questionnaireStimuli() {

    if (condition == "high") {
        return stimuli.pairedStimuli.slice(-1)[0];
    } else if (condition == "low") {
      return stimuli.pairedStimuli[0];
    }
  }

  function createEpistemicInstructions(side){
    const instrString = `Imagine that you are about to select the option presented on the ${side}-hand side of the screen.
    You will be asked about the <strong>outcome (number of points)</strong> that would occur if you were to select that option.`
    return instrString;
  }

  const epistemicPreamble = `<strong>Imagine you are going to select the option presented here.</strong> Please answer the following questions regarding the <strong>outcome (number of points)</strong> that would result from your choice (you might need to scroll down):`;

  const scale = ["Not at all", "", "", "", "", "", "Very much"];

  const questions = [
    "The outcome is something that has an element of randomness.",
    "The outcome is unpredictable.",
    "The outcome is determined by chance factors.",
    "The outcome could play out in different ways on similar occasions",
    "The outcome is in principle knowable in advance",
    "The outcome is something that has been determined in advance.",
    "The outcome is knowable in advance, given enough information.",
    "The outcome is something that well-informed people would agree on.",
    "The outcome is something that could be better predicted by consulting an expert.",
    "The outcome is something that becomes more predictable with additional knowledge or skills."
  ];

  const questionOrder = jsPsych.randomization.shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);

  let questionArray = [];

  for (let q = 0; q < questions.length; q++) {
    questionArray.push({prompt: questions[questionOrder[q]], labels: scale, required: true});
  }

  const epistemicQuestions = {
      type: 'survey-likert',
      timeline: [
      {
        instructions: jsPsych.timelineVariable("instructions"),
        stimulus: jsPsych.timelineVariable("stimulus"),
        side: jsPsych.timelineVariable("side"),
        questions: questionArray,
        preamble: epistemicPreamble,
        data: {
          questions: questionOrder, 
          risky: jsPsych.timelineVariable("risky"), 
          colour: jsPsych.timelineVariable("colour"), 
          side: jsPsych.timelineVariable("side")
        }
      }
    ],
    timeline_variables: [
      {
        instructions: createEpistemicInstructions("left"), 
        stimulus: () => questionnaireStimuli().stimulus1,
        side: "left",
        risky: shuffledOptions[0],
        colour: stimuli.colourOrder[0]
      },
      {
        instructions: createEpistemicInstructions("right"), 
        stimulus: () => questionnaireStimuli().stimulus2,
        side: "right",
        risky: shuffledOptions[1],
        colour: stimuli.colourOrder[1]
      }
    ],
    randomize_order: true
  };

  // Ellsberg task
  var ellsbergTask = {
    type: 'ellsberg-task',
    startValue: 50,
    transitions: [20, 10, 5],
    interTrialInterval: 500
  }

  // Push to timeline
  if (!testEllsberg) {
    if(!testSecondChoice) {
      if (!testBandit) {
        
        timeline.push(welcomePage, consent);
        if (!noRecaptcha) { timeline.push(recaptcha); }
        timeline.push(demographics, paypal, instructionsLoop);
        if (useFullscreen) { timeline.push(fullscreen); }  
      }

      for (let index = 0; index < nSamples; index++) {
        timeline.push(sampling);
      }
    }

    timeline.push(epistemicQuestions)
  }

  timeline.push(ellsbergInstructions, ellsbergTask, comments, debrief, instructionsEnd);
  
  // Generate file name for saveData
  filenameParent = `epistemic-2-id-${participantID}-${turkCode}`;
  
  // Run timeline and store data
  jsPsych.init({
    timeline: timeline,
    preload_images: stimuli.listStimuli,
    show_preload_progress_bar: false,
    on_trial_finish: saveTrialData
  });
}

// Shuffle stimuli --------------------------------------------------------------------------------------------------------------
// Function that retrieves stimuli from file, randomises order and colour of stimuli,
// returns an array of length 2 objects as required by the timelineVariable function
// Arguments: nStimuli: The number of stimuli--double the number of trials
//            colours: List of colours that corresponds to the file prefixes
function shuffleStimuli(nStimuli, colours) {
  let stimuli = {
    colourOrder: [],
    stimOrder: [],
    listStimuli: [], // array used to preload images
    pairedStimuli: [] // passed through to timelineVariables
  };
  let randOrder = [];
  let tempStimuli = null;

  // Randomise colours
  stimuli.colourOrder = jsPsych.randomization.repeat(colours, 1);

  // Create shuffled sequence from 1 to the number of stimuli
  for (i = 1; i < (nStimuli + 1); i++) {
    randOrder.push(i);
  }

  randOrder = jsPsych.randomization.repeat(randOrder, 1);

  // Split sequence into half for each stimulus colour
  stimuli.stimOrder = {
    stimulus1: randOrder.slice(start = 0, end = (nStimuli / 2)),
    stimulus2: randOrder.slice(start = (nStimuli / 2), end = (nStimuli))
  };

  // Retrieve stimuli from file as an array of length 2 objects
  // This format is required by the timelineVariable function
  // Plus two for the stimuli used in the questionnaire
  for (i = 0; i < (nStimuli / 2); i++) {
    tempStimuli = { 
        stimulus1: "images/stimuli/" + stimuli.colourOrder[0] + "-" + stimuli.stimOrder.stimulus1[i] + ".jpg",
        stimulus2: "images/stimuli/" + stimuli.colourOrder[1] + "-" + stimuli.stimOrder.stimulus2[i] + ".jpg"
  };

  stimuli.pairedStimuli.push(tempStimuli);
  stimuli.listStimuli.push(tempStimuli.stimulus1, tempStimuli.stimulus2);

  }

  return stimuli;
}

// Function to retrieve id parameter from Sona
function getSonaId() {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id");
  return id;
}

// Function to assign participants to conditions
function assignCondition() {
  let condition = "";
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has("condition")) {
    condition = urlParams.get("condition");
  } else {
    condition = jsPsych.randomization.sampleWithoutReplacement(["low", "high"], 1)
  }
  return condition;
}

// Function that generates outcomes for the safe and risk options based on shuffledOptions as the option parameter
function generateOutcomes(option) {
  let lowOutcome = 0;
  let highOutcome = 0;

  if (option == "safe") {
    // safe outcome is repeated to allow the function to consistently output an array with two elements
    const outcome = randomGaussian(50, 1);
    return [outcome, outcome];
  } else if (option == "risky"){
    while (lowOutcome < 10 || highOutcome < 10 || lowOutcome > 90 || highOutcome > 90) {
      lowOutcome = randomGaussian(30, 10);
      highOutcome = randomGaussian(70, 10);
    }
    return [lowOutcome, highOutcome];
  }
}

// Function that uses the Box-Muller transformation to generate a random sample from a gaussian distribution
function randomGaussian(mean, sd) {
  const u1 = Math.random();
  const u2 = Math.random();

  const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(Math.PI*2 * u2);

  return Math.round(z * sd + mean);
}

// Function to detect the trial type and save to the right folder with the right filename
function saveTrialData(data){
  trialType = jsPsych.data.getLastTrialData().select("trial_type").values.toString();
  switch(trialType){
    case "survey-text":
      filename = `demographics/${filenameParent}-demographics`;
      saveData( filename, jsPsych.data.get().filter({trial_type: 'survey-text'}).csv() );
      break;
    case "bandit-task":
      filename = `sampling/${filenameParent}-sampling`;
      saveData( filename, jsPsych.data.get().filter({trial_type: 'bandit-task'}).csv() );
      break;
    case "survey-likert":
      filename = `EARS/${filenameParent}-EARS`;
      saveData( filename, jsPsych.data.get().filter({trial_type: 'survey-likert'}).csv() );
      break;
    case "ellsberg-task":
      filename = `ellsberg/${filenameParent}-ellsberg`;
      saveData( filename, jsPsych.data.get().filter({trial_type: 'ellsberg-task'}).csv() );
      break;
      case "comments":
      filename = `comments/${filenameParent}-comments`;
      saveData( filename, jsPsych.data.get().filter({task: 'comments'}).csv() );
      break;
  }
}

// Function to save data--------------------------------------------------------------------------------------------
function saveData(name, data){
  var xhr = new XMLHttpRequest();
  xhr.open('POST', 'save_data.php');
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(JSON.stringify({filename: filename, filedata: data}));
};
