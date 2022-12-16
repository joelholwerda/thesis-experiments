let timeline = [];
let trialNumber = 1;
let sampleNumber = 1;
let fixedNumber = 1;
let roundNumber = 1;
let clickedMakeChoice = false;
let epistemicNumber = 0;
let filenameParent = "";
let filename = "";
let trialType = "";
let outcomeArray = [];
let finalSelection = 0;
let prize = 0;
let resultsArray = {
    stimulus: [],
    choice: [],
    safeValue: [],
    riskyValue: [],
};

// Order in which pariticpants are assigned to conditions
const conditionOrder = [
    1, 0, 1, 1, 0, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0,
    1, 1, 1, 0, 1, 1, 1, 0, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 0, 0, 0,
    1, 1, 0, 1, 0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 1, 0, 1, 0, 1, 1, 1, 1, 0, 0,
    0, 0, 1, 1, 0, 0, 1, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1, 0, 1,
    1, 0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 1, 1, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0,
    1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 1,
    0, 1, 0, 0, 1, 1, 1, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1,
    0, 0, 1, 1, 1, 0, 0, 1, 0, 1, 1, 1, 1, 0, 0, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0,
];

// Trial settings
const pointsPerDollar = 100;
const nStimuli = 220; // The number of images of each colour
const colours = ["red", "blue", "yellow", "green", "orange", "purple"]; // List of colours that corresponds to the file prefixes
const stimuli = shuffleStimuli(nStimuli, colours);
const randomID = jsPsych.randomization.randomID(8);
const participantID = getParticipantID();
const condition = assignCondition();

const useFullscreen = true;
const noRecaptcha = true;
const testBandit = false;

// Warn on exit or reload
window.addEventListener("beforeunload", alertBeforeUnload);

function alertBeforeUnload(e) {
    e.preventDefault();
    e.returnValue = "Are you sure you want to leave the experiment?";
}

// Add participant ID and condition to data
jsPsych.data.addProperties({
    participant: participantID,
    randomID: randomID,
    condition: condition,
});

// Instructions ---------------------------------------------------------------------------------------------

// Welcome page
let welcomePage = {
    type: "instructions",
    pages: [
        `
      <p><strong>Welcome! This experiment is a psychological study that investigates how people make decisions. It involves the following steps:</strong></p>
      <ol>
        <li> <span> First we need to ask for your informed consent.<br></span></li>
        <li> <span> We'll then ask you for some basic demographic information.<br></span></li>
        <li> <span> Next, we'll give you instructions that explain how to do the task in detail. You will need to pass a short quiz that checks your understanding of how the experiment works.<br></span></li>
        <li> <span> Following the instructions, you will be able to complete the experimental task&#8212a simple game that involves making choices.<br></span></li>
      </ol>
      <br>
      <br>
      <p><strong>The experiment should take around 20-30 minutes</strong></p>
    `,
    ],
    show_clickable_nav: true,
    show_page_number: true,
};

// Consent form
var consent = {
    type: "instructions",
    pages: [
        `<img src="images/consent-form-internal.png" width="700" height="850" style="margin-bottom:25px">`,
    ],
    show_clickable_nav: true,
    button_label_next: "Accept",
};

// reCAPTCHA
var recaptcha = {
    type: "recaptcha",
    preamble: `<div style="font-size:16pt;">Before we begin the experiment, we just need to check that you're not a robot. Please click the reCAPTCHA checkbox below.</div>`,
    button_label: "Next",
};

// Demographics
const demographics = {
    type: "survey-text",
    task: null,
    preamble:
        "<strong>Please answer the following demographic questions:</strong><br>(or click Next if you would prefer not to answer):",
    questions: [
        { prompt: "Age:", value: "", columns: 17 },
        { prompt: "Gender:", value: "", columns: 17 },
    ],
    data: { task: "demographics" },
};

// Instructions
var mainInstructions = {
    type: "instructions",
    pages: [
        `<strong>Here's some more information about the experiment:</strong> <br><br>
    The experiment consists of a decision-making game with <strong>six rounds</strong>. 
    Each round involves two main phases: an <strong>observation phase</strong> and a <strong>choice phase</strong>.<br>`,
        `The observation phase is the part of the game where you will be able to learn about the options that you will encounter in the choice phase.
    <strong>Clicking on an option in the observation phase will display an outcome (number of points) associated with that option.</strong> <br><br>
    <img id="screenshot-click" src="images/screenshot-click.png" width="500px">`,
        `In some rounds, you will only be allowed to <strong>observe a fixed number of outcomes</strong>. 
    You will need to make a choice after observing that number of outcomes regardless of whether you believe you have enough information. <br><br>
    <img id="screenshot-fixed" src="images/screenshot-fixed.png" width="700px">`,
        `In other rounds, you will be <strong>free to observe as many outcomes as you want</strong> 
    and you should continue observing until you have enough information to make a decision in the choice phase. <br><br>
    <img id="screenshot-free" src="images/screenshot-free.png" width="700px">`,
        `After observing an outcome in these rounds, you will be presented with two buttons: 
    <strong>KEEP OBSERVING</strong> will allow you continue learning about an option by observing another outcome. 
    <strong>MAKE CHOICE</strong> will take you directly to the choice phase.
    You will not be able to continue learning about an option after clicking MAKE CHOICE so <strong>you should ensure that you have enough information</strong>.<br><br>
    <img id="screenshot-buttons" src="images/screenshot-buttons.png" width="400px">`,
        `During the <strong>choice phase</strong> You will be asked whether you would prefer <strong>the outcome (number of points) that results from the displayed option</strong> or <strong>a fixed number of points</strong>. 
    The one you choose will be added to your final score.<br><br>
    <img id="screenshot-choice" src="images/screenshot-choice.png" width="700px">`,
        `<strong>Your goal is to win as many points as possible</strong>. <br><br> 
    At the end of the experiment, any points you earn will be converted into <strong>real money</strong>. You will be paid <strong>$1 for every 100 points earned</strong>.`,
        `The next screen contains <strong>a short quiz</strong> to check your understanding of the task. 
    You can review the instructions by clicking the Previous button or click Next when you're ready for the quiz.`,
    ],
    show_clickable_nav: true,
    show_page_number: true,
};

// Instructions attention check -- participants must answer all questions correctly to continue
let quizIncorrect = true;
let quizRepeats = 0;
const question1 = `How will you be able to learn about each option?`;
const question2 = `How will you be able to earn points in the game?`;
const question3 = `Is it possible to earn real money in this experiment?`;
const options1 = [
    "There will be written instructions describing the possible outcomes associated with each option.",
    "During the observation phase, clicking on an option will display an outcome associated with that option.",
    "Each time an option is selected, it will be possible to either observe or choose the outcome.",
    "It will not be possible to learn about the options during the game.",
];
const options2 = [
    "When points are displayed on the screen during the observation phase, they are added to your final score.",
    "It is possible to earn points in both the observation and choice phases of the experiment.",
    "Points can only be earned during the choice phase by selecting the displayed option or fixed number of points.",
    "Each time you observe an outcome in the observation phase, one point will be added to your final score.",
];
const options3 = [
    "No, it is not possible to earn a bonus payment of real money during this experiment.",
    "Yes! There is a bonus payment of $1 for every 100 points added to the final score by claiming outcomes.",
    "Yes! There is a bonus payment of $1 for every 25 points earned for one randomly selected choice.",
    "Select this option to review the instructions.",
];
const quizAnswers = `{"Q1":"During the observation phase, clicking on an option will display an outcome associated with that option.","Q2":"Points can only be earned during the choice phase by selecting the displayed option or fixed number of points.","Q3":"Yes! There is a bonus payment of $1 for every 100 points added to the final score by claiming outcomes."}`;

let instructionsQuiz = {
    type: "survey-multi-choice",
    questions: [
        { prompt: question1, name: "Q1", options: options1, required: true },
        { prompt: question2, name: "Q2", options: options2, required: true },
        { prompt: question3, name: "Q3", options: options3, required: true },
    ],
    button_label: "Next",
    randomize_question_order: false,
    data: { task: "quiz", repeats: quizRepeats },
    on_finish: function (data) {
        if (data.responses == quizAnswers) {
            quizIncorrect = false;
        } else {
            quizRepeats++;
        }
    },
};

// Additional instructions shown before looping (if the participants get at least one question wrong)
let conditionalInstructions = {
    timeline: [
        {
            type: "instructions",
            pages: [
                `At least one of your answers was incorrect. Please review the instructions and try again.`,
            ],
            show_clickable_nav: true,
            show_page_number: true,
        },
    ],
    conditional_function: function (data) {
        return quizIncorrect;
    },
};

// jsPsych looping function for instructions and quiz
let instructionsLoop = {
    timeline: [mainInstructions, instructionsQuiz, conditionalInstructions],
    loop_function: function (data) {
        return quizIncorrect;
    },
};

// Full screen mode
let fullscreen = {
    type: "fullscreen",
    message: `Great work! You answered the questions correctly. Click START when you're ready to begin the game.`,
    button_label: "START",
    fullscreen_mode: true,
};

// Bandit instructions
var banditInstructions = {
    type: "instructions-black",
    pages: [
        `On the next screen, you will be able to choose between a set amount or the outcome of the option presented on the screen.`,
    ],
    show_clickable_nav: true,
    button_label_next: "Next",
};

// Results screen
const resultsScreen = { type: "results" };

// Bandit task -------------------------------------------------------------------------------------------------------
const sampling = {
    timeline: [
        {
            type: "sampling-task",
            samplingType: jsPsych.timelineVariable("type"),
            nSamples: jsPsych.timelineVariable("nSamples"),
            mean: jsPsych.timelineVariable("mean"),
            sd: jsPsych.timelineVariable("sd"),
            feedbackDuration: 500,
            preTrialInterval: 100,
        },
    ],
    loop_function: function (data) {
        return !clickedMakeChoice;
    },
};

const choiceTask = {
    timeline: [
        {
            type: "choice-task",
            samplingType: jsPsych.timelineVariable("type"),
            mean: jsPsych.timelineVariable("mean"),
            sd: jsPsych.timelineVariable("sd"),
            safeValue: jsPsych.timelineVariable("safeValue"),
            feedbackDuration: 500,
            preTrialInterval: 0,
        },
    ],
};

// Epistemic questionnaire -------------------------------------------------------------------------------------------

function epistemicInstructions() {
    let instructions = "";
    if (finalSelection == 1) {
        instructions = `In this round, you chose to take the points that were displayed on the left. You will find out the outcome of the option on the right at the end of the experiment. <br><br>`;
    } else if (finalSelection == 2) {
        instructions = `In this round, you chose the option that was displayed on the right. You will find out its outcome at the end of the experiment. <br><br>`;
    }

    instructions += `
    Before continuing to the next round, please answer the questions on the following screen regarding the option that was presented on the right.</p>`;

    return instructions;
}

// Make array with shuffled questions and labels for "question" parameter in "survey-likert"
const questions = [
    "The outcome is something that has an element of randomness.",
    "The outcome is determined by chance factors.",
    "The outcome is knowable in advance, given enough information.",
    "The outcome is something that well-informed people would agree on.",
];

const questionOrder = jsPsych.randomization.shuffle([0, 1, 2, 3]);

const scale = ["Not at all", "", "", "", "", "", "Very much"];

let questionArray = [];

for (let q = 0; q < questions.length; q++) {
    questionArray.push({
        prompt: questions[questionOrder[q]],
        labels: scale,
        required: true,
    });
}

const epistemicQuestionnaire = {
    type: "survey-likert",
    timeline: [
        {
            samplingType: jsPsych.timelineVariable("type"),
            instructions: () => epistemicInstructions(),
            stimulus: () =>
                `images/stimuli/${stimuli.colourOrder[roundNumber - 2]}-${
                    stimuli.stimulusOrderA[roundNumber - 2]
                }.jpg`,
            side: "right",
            questions: questionArray,
            preamble: `Please answer the following questions regarding the <strong>outcome (number of points)</strong> associated with the option presented on the right.:`,
            data: {
                questions: questionOrder,
            },
        },
    ],
};

// Main experimental loop -------------------------------------------------------------------------------------------------------

// Define sampling means and add noise to them
let samplingMeans = [10, 30, 50, 70, 90, 110];

for (let i = 0; i < samplingMeans.length; i++) {
    samplingMeans[i] = randomInteger(samplingMeans[i], samplingMeans[i] + 10);
}

// Shuffle differences once for fixed [0, 1, 2] and once for free [3, 4, 5]
let differences = jsPsych.randomization.shuffle([-20, 0, 20]);
differences = differences.concat(jsPsych.randomization.shuffle([-20, 0, 20]));

// Shuffle means and nSamples
const shuffledParameters = {
    mean: jsPsych.randomization.shuffle(samplingMeans),
    difference: differences,
    nSamples: jsPsych.randomization.shuffle([5, 10, 20]),
};

sampleChoiceEpistemic = {
    timeline: [sampling, choiceTask, epistemicQuestionnaire],
    timeline_variables: [
        {
            type: "fixed",
            mean: shuffledParameters.mean[0],
            sd: 20,
            safeValue:
                shuffledParameters.mean[0] + shuffledParameters.difference[0],
            nSamples: shuffledParameters.nSamples[0],
        },
        {
            type: "free",
            mean: shuffledParameters.mean[3],
            sd: 20,
            safeValue:
                shuffledParameters.mean[3] + shuffledParameters.difference[3],
            nSamples: 220,
        },
        {
            type: "fixed",
            mean: shuffledParameters.mean[1],
            sd: 20,
            safeValue:
                shuffledParameters.mean[1] + shuffledParameters.difference[1],
            nSamples: shuffledParameters.nSamples[1],
        },
        {
            type: "free",
            mean: shuffledParameters.mean[4],
            sd: 20,
            safeValue:
                shuffledParameters.mean[4] + shuffledParameters.difference[4],
            nSamples: 220,
        },
        {
            type: "fixed",
            mean: shuffledParameters.mean[2],
            sd: 20,
            safeValue:
                shuffledParameters.mean[2] + shuffledParameters.difference[2],
            nSamples: shuffledParameters.nSamples[2],
        },
        {
            type: "free",
            mean: shuffledParameters.mean[5],
            sd: 20,
            safeValue:
                shuffledParameters.mean[5] + shuffledParameters.difference[5],
            nSamples: 220,
        },
    ],
};

// Push to timeline --------------------------------------------------------------------------------------------------------------
if (!testBandit) {
    timeline.push(welcomePage, consent);
    if (!noRecaptcha) {
        timeline.push(recaptcha);
    }
    timeline.push(demographics, instructionsLoop);
    if (useFullscreen) {
        timeline.push(fullscreen);
    }
}

timeline.push(sampleChoiceEpistemic, resultsScreen);

// Generate file name for saveData
filenameParent = `free-sampling-id-${participantID}-${randomID}`;

// Run timeline and store data
jsPsych.init({
    timeline: timeline,
    preload_images: stimuli.listStimuli,
    show_preload_progress_bar: false,
    on_trial_finish: saveTrialData,
});

// Shuffle stimuli --------------------------------------------------------------------------------------------------------------
// Function that retrieves stimuli from file, randomises order and colour of stimuli,
// Arguments: nStimuli: The number of stimuli of each colour
//             colours: List of colours that corresponds to the file prefixes
function shuffleStimuli(nStimuli, colours) {
    let stimuli = {
        colourOrder: [],
        stimulusOrderA: [],
        stimulusOrderB: [],
        listStimuli: [], // array used to preload images
    };

    // Randomise colours
    stimuli.colourOrder = jsPsych.randomization.shuffle(colours);

    // Create shuffled sequence from 1 to the number of stimuli
    let stimulusSequence = [];
    for (i = 1; i < nStimuli + 1; i++) {
        stimulusSequence.push(i);
    }
    stimulusSequence = jsPsych.randomization.shuffle(stimulusSequence);

    // Split 6 stimuli off the main list for the EARS and constant images condition
    stimuli.stimulusOrderA = stimulusSequence.splice(-6);
    stimuli.stimulusOrderA = jsPsych.randomization.shuffle(
        stimuli.stimulusOrderA
    );

    // Shuffle main list and repeat in case participants take more than 200 samples (unlikely)
    stimuli.stimulusOrderB = jsPsych.randomization.repeat(stimulusSequence, 4);

    // Create list of stimulus files for preloading
    for (i = 1; i < colours + 1; i++) {
        for (j = 1; i < nStimuli + 1; i++) {
            stimuli.listStimuli.push(
                `images/stimuli/${stimuli.colours[i]}-${j}.jpg`
            );
        }
    }

    return stimuli;
}

// Function to retrieve id parameter from Sona -- only used for online
function getParticipantID() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");
    return id;
}

// Function to assign participants to conditions
function assignCondition() {
    let condition = "";
    conditionTypes = ["low", "high"];
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("condition")) {
        condition = urlParams.get("condition");
    } else {
        // Takes the conditionOrder associated with the participant ID -- 0 is low, 1 is high
        condition = conditionTypes[conditionOrder[participantID - 1]];
    }
    return condition;
}

// Function that uses the Box-Muller transformation to generate a random sample from a gaussian distribution
// Truncates at -200 and 200 to avoid very large outcomes.
function randomGaussian(mean, sd) {
    let u1 = 0;
    let u2 = 0;
    let z = 0;
    let outcome = -101; // Number outside of trunctated range to begin loop

    while (outcome < -100 || outcome > 200) {
        u1 = Math.random();
        u2 = Math.random();
        z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(Math.PI * 2 * u2);
        outcome = Math.round(z * sd + mean);
    }

    return outcome;
}

// Function that generates a random integer between min and max
function randomInteger(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

// Function to detect the trial type and save to the right folder with the right filename
function saveTrialData(data) {
    trialType = jsPsych.data
        .getLastTrialData()
        .select("trial_type")
        .values.toString();
    switch (trialType) {
        case "survey-text":
            filename = `demographics/${filenameParent}-demographics`;
            saveData(
                filename,
                jsPsych.data.get().filter({ trial_type: "survey-text" }).csv()
            );
            break;
        case "sampling-task":
            filename = `sampling/${filenameParent}-sampling`;
            saveData(
                filename,
                jsPsych.data.get().filter({ trial_type: "sampling-task" }).csv()
            );
            break;
        case "choice-task":
            filename = `choice/${filenameParent}-choice`;
            saveData(
                filename,
                jsPsych.data.get().filter({ trial_type: "choice-task" }).csv()
            );
            break;
        case "survey-likert":
            filename = `EARS/${filenameParent}-EARS`;
            saveData(
                filename,
                jsPsych.data.get().filter({ trial_type: "survey-likert" }).csv()
            );
            break;
    }
}

// Function to save data--------------------------------------------------------------------------------------------
function saveData(name, data) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "save_data.php");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify({ filename: filename, filedata: data }));
}
