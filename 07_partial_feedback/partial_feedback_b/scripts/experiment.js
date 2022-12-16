
let timeline = [];
let bandit = null;
let trialNumber = 0;
let participantID = 0;
let condition = "";
let epistemicTrial = 0;
let totalPoints = 0;
let outcomesIndex1 = 0;
let outcomesIndex2 = 0;
let filenameParent = "";
let filename = "";
let trialType = "";
let outcomeArray = [];
let banditPrize = {};
let ellsbergPrize = {};
let prize = 0;

// Trial settings
const pointsPerDollar = 10;
const nTrials = 110;
const nStimuli = nTrials * 2 + 2; // Plus two for the stimuli used in the questionnaire
const colours = ["red", "blue"]; // List of colours that corresponds to the file prefixes
const stimuli = shuffleStimuli(nStimuli, colours);
const shuffledOptions = jsPsych.randomization.sampleWithoutReplacement(["safe", "risky"]);
const turkCode = (Math.floor(Math.random() * 899999) + 100000).toString();
const usingMturk = false;
const useFullscreen = true;
const noRecaptcha = true;
const testBandit = false;
const testEARS = false;
const testEllsberg = false;

// The predetermined condition allocation based on participant ID
const participantOrder = [
  0, 0, 1, 0, 1, 0, 1, 0, 1, 1,
  0, 0, 1, 1, 1, 1, 0, 0, 1, 0, 
  0, 1, 1, 0, 1, 0, 0, 1, 1, 1, 
  0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 
  0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 
  1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 
  0, 1, 1, 0, 1, 0, 0, 1, 0, 0, 
  0, 0, 1, 1, 1, 1, 0, 1, 1, 0, 
  0, 0, 1, 1, 0, 0, 1, 1, 0, 1, 
  1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 
  1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 
  1, 1, 0, 1, 1, 1, 1, 1, 0, 1
];

// Start experiment--inputID triggers runExperiment
inputID()

// Participant ID
function inputID() {
  var id = [{
    type: 'survey-text',
    questions: [
      {prompt: 'ID:', value: '', columns: 14}
    ]
  }];

  jsPsych.init({
    timeline: id,
    on_finish: function(){
      if (participantID <= participantOrder.length | participantID == 666 | participantID == 6666 | participantID == 66666){ // add check for existing participant data
      condition = assignCondition(participantID, participantOrder);
      runExperiment();
      } else {
        inputID()
      }
    }
  });
}

function runExperiment(){

  // Warn on exit or reload
  window.onbeforeunload = function(){
    return "Are you sure you want to leave the experiment?";
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
        <p><strong>Thanks for accepting the HIT. This experiment is a psychological study that investigates how people make decisions. It involves the following steps:</strong></p>
        <ol>
          <li> <span> This is a University research project so first we need to ask for your informed consent. (The consent form is a standard university document so it might look a little weird on MTurk.)<br></span></li>
          <li> <span> We'll ask for some demographic information. This is not connected to your Amazon ID.<br></span></li>
          <li> <span> We'll give you instructions that explain how to do the task in detail. You will need to pass a short quiz that checks your understanding of how the experiment works.<br></span></li>
          <li> <span> Following the instructions, you will be able to complete the experimental task&#8212a simple game that involves making choices.<br></span></li>
          <li> <span> When you have completed the task, we'll give you the completion code you need to get paid for the HIT.</span></li>
        </ol>
      `,
      `
        <p>
          The experiment should take around <strong>20 minutes</strong>. <br><br> 
          Please <strong>do not</strong> use the "back" button on your browser or close the window until the very end when you receive your completion code.
          Doing so might break the experiment and make it difficult for you to get paid but if something does go wrong, please contact us.
        </p>
      `
    ],
    show_clickable_nav: true,
    show_page_number: true
  };

  // Consent form
  var consent = {
    type: 'instructions',
    pages: [`<img src="images/PIS.jpg" width="750" height="800">`],
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
  var demographics = {
    type: 'survey-text',
    task: null,
    preamble: '<strong>Please answer the following demographic questions:</strong><br>(or click Next if you would prefer not to answer):',
    questions: [
      {prompt: 'Age:', value: '', columns: 17},
      {prompt: 'Gender:', value: '', columns: 17}
    ],
    data: {task: "demographics"},
  };

  // Instructions
  var mainInstructions = {
    type: 'instructions',
    pages: [
      `<strong>Here's some information about the experiment:</strong> <br><br>
      This experiment consists of a simple game in which you will make choices between pairs of options.`,
      `You can select an option by clicking on it. Choices might look something like this: <br>
      <img id="instructions-screenshot" src="images/screenshot.jpg">`,
      `Selecting an option will result in winning a number of points. 
      At the beginning of the game, you will not know how many points can be earned by choosing each option. 
      You can learn about options by selecting them.`,
      `Your goal is to win as many points as possible.
      Every choice influences the amount of <strong>real money</strong> that you could earn.`,
      `At the end of the experiment, one of your choices will be randomly selected for a bonus payment. 
      You will be given <strong>$1 for every ten points earned from that choice</strong>, so you should try to earn as many points as possible.`,
      `The next screen contains a short quiz to check your understanding of the task. You can review the instructions by clicking the Previous button
      or click Next when you're ready for the quiz.`
    ],
    show_clickable_nav: true,
    show_page_number: true
  };


  // Instructions attention check -- participants must answer all questions correctly to continue
  let quizIncorrect = true;
  let quizRepeats = 0;
  const question1 = `What is your main objective in the game?`;
  const question2 = `Is it possible to earn real money in the game?`
  const question3 = `How will you be able to learn about each option?`
  const options1 = [
    "To win the smallest possible number of points.",  
    "To choose options based on your favourite colours.", 
    "To win as many points as possible.", 
    "To figure out the meaning of life."
    
  ];
  const options2 = [
    "No, it is not possible to earn a bonus payment of real money during this experiment.",  
    "Yes! I can earn a bonus payment of $1 for every ten points earned for one randomly selected choice.", 
    "Yes! I can earn a bonus payment of $1 for every 1000 points earned for one randomly selected choice.", 
    "Yes! I can earn a bonus payment of $1 for every ten points earned during the entire game."
  ];
    const options3 = [
    "During the game, choosing an option will provide an opportunity to learn about its outcome.",
    "There will be written instructions describing the possible outcomes associated with each option.",  
    "It will not be possible to learn about the options during the game.", 
    "Select this option to review the instructions."
  ];
  const quizAnswers = `{"Q1":"To win as many points as possible.","Q2":"Yes! I can earn a bonus payment of $1 for every ten points earned for one randomly selected choice.","Q3":"During the game, choosing an option will provide an opportunity to learn about its outcome."}`;

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
      After you choose a box, one ball will be randomly selected from that box. If the ball is the right colour, you could win an additional <strong>one dollar</strong>.`,
      `After completing the task, <strong>one of your choices will be randomly selected</strong> by the computer and played for real money. 
      Your winnings will be based on the choices you made.`
    ],
    show_clickable_nav: true,
    show_page_number: true
  };

  // Optional comments
  var comments = {
    type: 'survey-text',
    task: 'comments',
    preamble: `
    <span style="font-size:15pt; line-height: 1.6em;">Finally, you can use the textbox below to write any thoughts you have regarding the experiment. 
    Did you use any particular strategies? Were there specific things that influenced your choices? 
    Did you encounter any technical problems or instructions that were unclear? 
    <strong>(Optional)</strong></span>`,
    questions: [{value: '', rows: 10, columns: 50}],
    data: function() {return {task: "comments", prize: prize};}
  };

  const instructionsEnd = {
    type: 'instructions',
    pages: function() {

      let colourPhrase = "";
      if (ellsbergPrize.amount == 0) {
        colourPhrase = `A <font color="purple"><strong>purple</strong></font color>`;
      } else {
        colourPhrase = `An <font color="orange"><strong>orange</strong></font color>`;
      }

      return [`
        <span style="font-weight:bold;font-size:130%">You have finished the experiment!</span> <br><br> 
        Thanks for participating! One of your choices from each section was randomly selected for payment. 
        The outcome of the randomly selected choice in the first section was <strong>${banditPrize.points} points</strong> so you will receive <strong>\$${banditPrize.amount.toFixed(2)}</strong> for this task.
        For the randomly selected choice in the second section, you chose the box with the ${ellsbergPrize.choice} proportion. 
        For that choice, there were <strong>${ellsbergPrize.orange} <font color="orange">orange</font color></strong> balls and <strong>${100 - ellsbergPrize.orange} <font color="purple">purple</font color></strong> balls.
        ${colourPhrase} ball was randomly selected so you will receive <strong>\$${ellsbergPrize.amount}</strong> for the second task.
        Your total prize will be <span style="font-weight:bold;font-size:130%">$${prize.toFixed(2)}</span>. <br><br>
        <span style="font-weight:bold;font-size:130%">Please let the experimenter know that you have finished.</span>
        `]
      },
    show_clickable_nav: false,
    show_page_number: false

  }

  // Instructions presented at the end of the experiment
  let instructionsEndMturk = {
    type: 'instructions',
    pages: function() {
      return [`
        You have finished the experiment! Your completion code is <span style="font-weight:bold;font-size:130%">${turkCode}</span>. <br><br> 
        To receive payment for the HIT, return to the Amazon Mechanical Turk page and enter this code.
        In addition to the standard payment, one of your choices was randomly selected and you will receive an bonus of <span style="font-weight:bold;font-size:130%">$${prize.toFixed(2)}</span>. 
        Please contact us if something goes wrong and we\'ll fix it as quickly as possible. <br><br> 
        Thank you for your help!
        `]
      },
    show_clickable_nav: false,
    show_page_number: false
  };

  // Bandit task --------------------------------------------------------------------------------------------------------------------------

  // Low stimulus variation condition
  if (condition == "low"){
    bandit = {
      timeline: [{
        type: "bandit-task",
        stimulus1: stimuli.pairedStimuli[0].stimulus1,
        stimulus2: stimuli.pairedStimuli[0].stimulus2,
        outcomeDistribution: "discrete",
        outcomes1: () => generateOutcomes(shuffledOptions[0]),
        outcomes2: () => generateOutcomes(shuffledOptions[1]),
        probs1: [0.5, 0.5],
        probs2: [0.5, 0.5],
        feedbackDuration: 2000,
        preTrialInterval: 0
      }],
      repetitions: nTrials,
    };
  }

  // High stimulus variation condition
  if (condition == "high"){
    bandit = {
      timeline: [{
        type: "bandit-task",
        stimulus1: jsPsych.timelineVariable('stimulus1'),
        stimulus2: jsPsych.timelineVariable('stimulus2'),
        outcomeDistribution: "discrete",
        outcomes1: () => generateOutcomes(shuffledOptions[0]),
        outcomes2: () => generateOutcomes(shuffledOptions[1]),
        probs1: [0.5, 0.5],
        probs2: [0.5, 0.5],
        feedbackDuration: 2000,
        preTrialInterval: 0
      }],
      timeline_variables: stimuli.pairedStimuli.slice(0, -1),
      sample: {
        type: 'without-replacement',
        size: nTrials
      }
    };
  }

  // Epistemicness questionnaire

  let questionnaireStimuli = "";

  if (condition == "high") {
    questionnaireStimuli = stimuli.pairedStimuli.slice(-1)[0];
  } else if (condition == "low") {
    questionnaireStimuli = stimuli.pairedStimuli[0];
  }

  function createEpistemicInstructions(side){
    return `
      On the next screen, you will be asked to imagine that you are going to select the option presented on the ${side}-hand side of the screen.
      You will be asked a number of questions about the <strong>outcome (number of points)</strong> that would occur if you were to select that option.
    `
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

  var epistemicQuestions = {
      type: 'survey-likert',
      timeline: [
      {
        instructions: jsPsych.timelineVariable("instructions"),
        stimulus: jsPsych.timelineVariable("stimulus"),
        side: jsPsych.timelineVariable("side"),
        questions: questionArray,
        preamble: epistemicPreamble,
        data: {
          stimulus: jsPsych.timelineVariable("stimulusName"),
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
        stimulus: questionnaireStimuli.stimulus1,
        stimulusName: questionnaireStimuli.stimulus1.replace("images/stimuli/", "").replace(".jpg", ""),
        side: "left",
        risky: shuffledOptions[0],
        colour: stimuli.colourOrder[0]
      },
      {
        instructions: createEpistemicInstructions("right"), 
        stimulus: questionnaireStimuli.stimulus2,
        stimulusName: questionnaireStimuli.stimulus2.replace("images/stimuli/", "").replace(".jpg", ""),
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
    interTrialInterval: 500,
    on_finish: function(){
      banditPrize.points = jsPsych.randomization.sampleWithoutReplacement(outcomeArray, 1);
      banditPrize.amount = banditPrize.points / pointsPerDollar;
      prize = banditPrize.amount + ellsbergPrize.amount;
    }
  }

  // Push to timeline
  if (!testEllsberg) {
    if (!testEARS) {
      if (!testBandit) {
        if (usingMturk == true) {

          timeline.push(welcomePage, consent);

          if (!noRecaptcha) { timeline.push(recaptcha); }
        }
        
        timeline.push(demographics, instructionsLoop);

        if (useFullscreen) { timeline.push(fullscreen); }  
      }

      timeline.push(bandit);
    }

    timeline.push(epistemicQuestions);
  }

  timeline.push(ellsbergInstructions, ellsbergTask, comments);
  
  if (usingMturk == true) {

    timeline.push(instructionsEndMturk);
  } else {
    timeline.push(instructionsEnd);
  }

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
// Function that retreives stimuli from file, randomises order and colour of stimuli,
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

  // Retreive stimuli from file as an array of length 2 objects
  // This format is required by the timelineVariable function
  // Plus two for the stimuli used in the questionnaire
  for (i = 0; i < (nTrials + 1); i++) {
    tempStimuli = { 
        stimulus1: "images/stimuli/" + stimuli.colourOrder[0] + "-" + stimuli.stimOrder.stimulus1[i] + ".jpg",
        stimulus2: "images/stimuli/" + stimuli.colourOrder[1] + "-" + stimuli.stimOrder.stimulus2[i] + ".jpg"
  };

  stimuli.pairedStimuli.push(tempStimuli);
  stimuli.listStimuli.push(tempStimuli.stimulus1, tempStimuli.stimulus2);

  }

  return stimuli;
}

// Function to assign participants to conditions -----------------------------------------------------------------------
function assignCondition(participantID, participantOrder) {

  // 666 to test low variation, 6666 to test high variation, else assign by participantOrder
  if (participantID == 666){
    condition = "low";
  } else if (participantID == 6666) {
    condition = "high";
  } else {
    let conditionNames = ["low", "high"];
    let conditionIndex = participantOrder[(participantID - 1)];
    condition = conditionNames[conditionIndex];
  }

  return condition;
}

// Function that generates outcomes for the safe and risk options based on shuffledOptions as the option parameter
function generateOutcomes(option) {
  let lowOutcome = 0;
  let highOutcome = 0;

  if (option == "safe") {
    // safe outcome is repeated to allow the funstion to consistently output an array with two elements
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

// Function to detect the trial type and save to the right foldder with the right filename
function saveTrialData(data){
  trialType = jsPsych.data.getLastTrialData().select("trial_type").values.toString();
  switch(trialType){
    case "survey-text":
      filename = `demographics/${filenameParent}-demographics`;
      saveData( filename, jsPsych.data.get().filter({trial_type: 'survey-text'}).csv() );
      break;
    case "bandit-task":
      filename = `choices/${filenameParent}-choices`;
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
  }
}

// Function to save data--------------------------------------------------------------------------------------------
function saveData(name, data){
  var xhr = new XMLHttpRequest();
  xhr.open('POST', 'save_data.php');
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(JSON.stringify({filename: filename, filedata: data}));
};
