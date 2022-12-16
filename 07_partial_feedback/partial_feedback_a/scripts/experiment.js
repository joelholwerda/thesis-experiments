let timeline = [];
let bandit = null;
let trialNumber = 0;
let participantID = 0;
let totalPoints = 0;
let outcomesIndex1 = 0;
let outcomesIndex2 = 0;
let condition = "";
let filenameParent = "";
let filename = "";
let trialType = "";

// Trial settings
const nTrials = 110;
const nStimuli = nTrials * 2;
const colours = ["red", "blue"]; // List of colours that corresponds to the file prefixes
const stimuli = shuffleStimuli(nStimuli, colours);
const shuffledOptions = jsPsych.randomization.sampleWithoutReplacement(["safe", "risky"]);
const distName = assignDistribution();
const useFullscreen = true;
const testBandit = false;
const testEndQs = false;

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

  // Demographics
  var demographics = {
    type: 'survey-text',
    preamble: '<strong>Please answer the following demographic questions</strong><br>(or click continue if you would prefer not to answer):',
    questions: [
      {prompt: 'Age:', value: '', columns: 17},
      {prompt: 'Gender:', value: '', columns: 17}
    ]
  };

  // Instructions
  var instructions1 = {
    type: 'instructions',
    pages: [`<strong>Welcome to the experiment!</strong><br><br>
      This experiment consists of a simple game in which you will make choices between pairs of options.`,
      `You can select an option by clicking on it. Choices might look something like this: <br>
      <img id="instructions-screenshot" src="images/screenshot.jpg">`,
      `Selecting an option will result in winning a number of points. At the beginning of the game, you will not know how many points can be earned by choosing each option. You can learn about options by selecting them.`,
      `<strong>Your goal is to win as many points as possible.</strong>`],
    show_clickable_nav: true,
    show_page_number: true
  };

  var instructions2 = {
    type: 'instructions',
    pages: ['You have finished the first section of the experiment.', 
    'The second section will involve questions about the <strong>outcomes (numbers of points)</strong> that you experienced when you chose options during the game.',
    'Each question will refer either to when you selected a <font color="red">red</font> or <font color="blue">blue</font> option.',
    'Please answer each question carefully. Click Next when you are ready to begin.'],
    show_clickable_nav: true,
    show_page_number: true
  };

  var instructionsEnd = {
    type: 'instructions',
    pages: ['Congratulations. You have finished the experiment. Thank you for participating! Please let the experimenter know that you have finished.'],
    show_clickable_nav: false,
    show_page_number: true
  };

  // Full screen mode
  var fullscreen = {
    type: 'fullscreen',
    message: `If you have any questions, please ask the experimenter now. Otherwise, click START to begin the game.`,
    button_label: "START",
    fullscreen_mode: true
  };

  // Bandit task

  // Low stimulus variation condition
  if (condition == "low"){
    bandit = {
      timeline: [{
        type: "bandit-task",
        stimulus1: stimuli.pairedStimuli[0].stimulus1,
        stimulus2: stimuli.pairedStimuli[0].stimulus2,
        outcomeDistribution: "predetermined",
        outcomes1: outcomes[distName][shuffledOptions[0]],
        outcomes2: outcomes[distName][shuffledOptions[1]],
        probs1: [],
        probs2: [],
        feedbackDuration: 2000,
        preTrialInterval: 0,
        data: {distribution: distName}
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
        outcomeDistribution: "predetermined",
        outcomes1: outcomes[distName][shuffledOptions[0]],
        outcomes2: outcomes[distName][shuffledOptions[1]],
        probs1: [],
        probs2: [],
        feedbackDuration: 2000,
        preTrialInterval: 0,
        data: {distribution: distName}
      }],
      timeline_variables: stimuli.pairedStimuli,
      sample: {
        type: 'without-replacement',
        size: nTrials
      }
    };
  }

  // Epistemicness questionnaire
  var scale = ["Not at all", "", "", "", "", "", "Very much"];

  var epistemicQuestions = {
      type: 'survey-likert',
      timeline: [
      {
        questions: [{prompt: "<strong>The outcomes were something that had an element of randomness.</strong>", labels: scale, required: true}, 
          {prompt: "<strong>The outcomes were unpredictable.</strong>", labels: scale, required: true}, 
          {prompt: "<strong>The outcomes were determined by chance factors.</strong>", labels: scale, required: true}, 
          {prompt: "<strong>The outcomes could play out in different ways on similar occasions.</strong>", labels: scale, required: true}, 
          {prompt: "<strong>The outcomes were, in principle, knowable in advance.</strong>", labels: scale, required: true}],
        preamble: jsPsych.timelineVariable("preamble1"),
        data: {set: "A", risky: jsPsych.timelineVariable("risky"), colour: jsPsych.timelineVariable("colour")}
      },
      {
        type: 'survey-likert',
        questions: [{prompt: "<strong>The outcomes were something that had been determined in advance.</strong>", labels: scale, required: true}, 
          {prompt: "<strong>The outcomes were knowable in advance, given enough information.</strong>", labels: scale, required: true}, 
          {prompt: "<strong>The outcomes were something that well-informed people would agree on.</strong>", labels: scale, required: true}, 
          {prompt: "<strong>The outcomes were something that could be better predicted by consulting an expert.</strong>", labels: scale, required: true}, 
          {prompt: "<strong>The outcomes were something that became more predictable with additional knowledge or skills.</strong>", labels: scale, required: true}],
        preamble: jsPsych.timelineVariable("preamble2"),
        data: {set: "B", risky: jsPsych.timelineVariable("risky"), colour: jsPsych.timelineVariable("colour")}
      }
    ],
    timeline_variables: [
      {preamble1: "<b>Thinking now of outcomes (numbers of points) <br> that you received when you chose a <font color='red'>red</font> option, <br> please answer the following questions:</b>",
      preamble2: "<b>Again, thinking of outcomes (numbers of points) <br> that you received when you chose a <font color='red'>red</font> option, <br> please answer the following questions:</b>",
      risky: shuffledOptions[stimuli.colourOrder.indexOf("red")],
      colour: "red"
      },
      {preamble1: "<b>Thinking now of outcomes (numbers of points) <br> that you received when you chose a <font color='blue'>blue</font> option, <br> please answer the following questions:</b>",
      preamble2: "<b>Again, thinking of outcomes (numbers of points) <br> that you received when you chose a <font color='blue'>blue</font> option, <br> please answer the following questions:</b>",
      risky: shuffledOptions[stimuli.colourOrder.indexOf("blue")],
      colour: "blue"
      }
    ],
    randomize_order: true,
  };

  // Push to timeline
  if (!testEndQs & participantID != 66666){
    if (!testBandit) {
      if (useFullscreen) {
        timeline.push(demographics, instructions1, fullscreen, bandit, instructions2, epistemicQuestions, instructionsEnd);
      } else {
        timeline.push(demographics, instructions1, bandit, instructions2, epistemicQuestions, instructionsEnd);
      }
    } else {
      timeline.push(bandit, instructions2, epistemicQuestions, instructionsEnd);
    } 
  } else {
    timeline.push(instructions2, epistemicQuestions, instructionsEnd);
  }

  // Generate file name for saveData
  filenameParent = `epistemic-1-id-${participantID}`;
  
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
  for (i = 0; i < (nTrials); i++) {
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

// Function to randomly assign participants to an outcome distribution--------------------------------------------------

function assignDistribution() {
  const names = Object.getOwnPropertyNames(outcomes);
  const distName = jsPsych.randomization.sampleWithoutReplacement(names, 1);

  return distName;
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
  }
}

// Function to save data--Thanks to Jenny-------------------------------------------------------------------------------
function saveData(name, data){
  var xhr = new XMLHttpRequest();
  xhr.open('POST', 'save_data.php'); // 'save_data.php' is the path to the php file described above.
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(JSON.stringify({filename: filename, filedata: data}));
};
