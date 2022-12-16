
jsPsych.plugins["ellsberg-task"] = (function() {

    var plugin = {};
  
    plugin.info = {
        name: "ellsberg-task",
        parameters: {
            startValue: {
                type: jsPsych.plugins.parameterType.INT,
                default: 50
            },
            transitions: {
                type: jsPsych.plugins.parameterType.INT,
                default: [20, 10, 5]
            },
            interTrialInterval: {
                type: jsPsych.plugins.parameterType.INT,
                default: 500
            }
        }
    }
  
    plugin.trial = function(display_element, trial) {

        let choice = [];
        let probWin = [];
        let responseTime = [];
        let startTime = undefined;
        let value = trial.startValue;
        let ellsbergTrial = 0;

        // Add content to css class in order to apply bandit styles
        const content = document.querySelector("#jspsych-content");
        content.classList.add("ellsberg-grid-container");

        // Set up CSS grid container in HTML
        display_element.innerHTML = `
            <div id="ellsberg-question"></div>
            <div id="ellsberg-option-1" class="ellsberg-options"></div>
            <div id="ellsberg-option-2" class="ellsberg-options"></div>
            <div id="ellsberg-table-1" class="ellsberg-tables"></div>
            <div id="ellsberg-table-2" class="ellsberg-tables"></div>
            <div id="ellsberg-submit" class="ellsberg-submit"></div>
        `

        var question = display_element.querySelector("#ellsberg-question");
        var option1 = display_element.querySelector("#ellsberg-option-1");
        var option2 = display_element.querySelector("#ellsberg-option-2");
        var table1 = display_element.querySelector("#ellsberg-table-1");
        var table2 = display_element.querySelector("#ellsberg-table-2");
        var submit = display_element.querySelector("#ellsberg-submit");

        
        displayQuestion(value)

        // Functions -----------------------------------------------------------

        function displayQuestion(value) {

            question.innerHTML = `
                Which would you prefer? The box on the left-hand side contains <strong><span style="font-size:120%">${value}</span> <font color="orange">orange</font color> balls</strong> and <strong><span style="font-size:120%">${100 - value}</span> <font color="purple">purple</font color> balls</strong>.
                The box on the right-hand side contains an <strong>unknown proportion</strong> of <strong><font color="orange">orange</font color></strong> and <strong><font color="purple">purple</font color> balls</strong>.
                One ball will be randomly selected from the box you choose. If the ball is <strong><font color="orange">orange</font color></strong> you will win <strong>one dollar</strong>, 
                but if it is <strong><font color="purple">purple</font color></strong>, you will win <strong>nothing</strong>. You can click on a box to make your choice.
                `
                
            option1.innerHTML = `
            <svg id="urnA" class="hvr-grow" height="300" width="300">
                <rect id="urnARect" x="10" y="10" rx="20" ry="20" width="280" height="280" style="fill:white;stroke:#808080;stroke-width:5;" />
            </svg>`;

            option2.innerHTML = `
            <svg id="urnB" class="hvr-grow" height="300" width="300">
                <defs>
                    <linearGradient id="gradient" x1="25%" y1="0%" x2="75%" y2="0%">
                        <stop offset="0%" style="stop-color:orange;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:purple;stop-opacity:1" />
                    </linearGradient>
                </defs>
                <rect id="urnBRect"x="10" y="10" rx="20" ry="20" width="280" height="280" style="fill:white;stroke:#808080;stroke-width:5;" />
            </svg>`;

            table1.innerHTML = createTable(value);
            table2.innerHTML = createTable("?");

            submit.innerHTML = `<button id="ellsberg-submit-button" class="jspsych-btn btn btn-outline-primary" draggable="false">Next</button>`;
            submit.style.visibility = "hidden";

            // Draw balls inside urn
            var index = 0;
            var colour = "";
            var urnA = document.getElementById("urnA");
            var urnB = document.getElementById("urnB");
            var urnARect = document.getElementById("urnARect");
            var urnBRect = document.getElementById("urnBRect");

            for (xPos = 40; xPos < 280; xPos = xPos + 25){
                for (yPos = 40; yPos < 280; yPos = yPos + 25){

                    if (index < value){
                        colour = "orange";
                    } else {
                        colour = "purple";
                    }
                    
                    urnA.innerHTML += `<circle cx="${xPos}" cy="${yPos}" r="10" stroke="black" stroke-width="2" fill="${colour}" />`;
                    urnB.innerHTML += `
                        <circle cx="${xPos}" cy="${yPos}" r="10" stroke="black" stroke-width="2" fill="url(#gradient)"/>
                        <text x="${xPos - 4}" y="${yPos + 6}" fill="white" font-size="17px" text-rendering="optimizeLegibility" -webkit-font-smoothing="antialiased">?</text>
                    `;
                    
                    index++;
                }
            }

            urnB.innerHTML += `<text x="100" y="250" fill="black" font-size="280px" text-rendering="optimizeLegibility" -webkit-font-smoothing="antialiased">?</text>`;

            urnA.addEventListener("click", chooseButton1);
            urnB.addEventListener("click", chooseButton2);

            startTime = (new Date()).getTime();

        }

        function createTable(value){
            let value2 = null;
            if (value == "?") {
                value2 = "?";
            } else {
                value2 = 100 - value;
            }

            const table = `
                <style type="text/css">
                    .tg  {border-collapse:collapse;border-spacing:0;border-color:#ccc;text-align:center;vertical-align:middle}
                    .tg th{font-weight:bold;padding:10px 10px;border-style:solid;border-color:#ccc;border-width:0px;border-top-width:1px;border-bottom-width:1px;}
                    .tg td{padding:10px 10px;border-style:solid;border-color:#ccc;border-width:0px;border-top-width:1px;border-bottom-width:1px;}
                </style>
                <table class="tg">
                    <tr>
                        <th class="tg-x8tb"></th>
                        <th class="tg-10cr">Chance</th>
                        <th class="tg-10cr">You win</th>
                    </tr>
                    <tr>
                        <td class="tg-0lax"><font color="orange"><strong>Orange</strong></font color></td>
                        <td class="tg-ve35">${value}%</td>
                        <td class="tg-ve35">$1</td>
                    </tr>
                    <tr>
                        <td class="tg-0lax"><font color="purple"><strong>Purple</strong></font color></td>
                        <td class="tg-ve35">${value2}%</td>
                        <td class="tg-ve35">$0</td>
                    </tr>
                </table>
            `;

            return table;

        }


        function chooseButton1(){
            chooseButton(selection=1);
            // Record choice
            choice.push("known");
            
        }
        function chooseButton2(){
            chooseButton(selection=-1);
            // Record choice
            choice.push("unknown");
        }

        var currentSelection = null;

        function chooseButton(selection){

            if (selection == 1) {
                urnARect.setAttribute("style", "fill:white;stroke:red;stroke-width:10;opacity:0.7");
                urnBRect.setAttribute("style", "fill:white;stroke:black;stroke-width:5;opacity:0.5");
                urnA.setAttribute("style", "transform: scale(1.05)");
                urnB.setAttribute("style", "transform: null");
                currentSelection = 1;

            } else if (selection == -1){
                urnARect.setAttribute("style", "fill:white;stroke:black;stroke-width:5;opacity:0.5");
                urnBRect.setAttribute("style", "fill:white;stroke:red;stroke-width:10;opacity:0.7");
                urnA.setAttribute("style", "transform: null");
                urnB.setAttribute("style", "transform: scale(1.05)");
                currentSelection = -1;
            }

            submit.style.visibility = "visible";
            var submitButton = document.getElementById("ellsberg-submit-button");
            submitButton.addEventListener("click", clickSubmit);

        }

        function clickSubmit(){submitSelection(currentSelection);}

        function submitSelection(selection){

            // Calculate reaction time
            const endTime = (new Date()).getTime();
            responseTime.push(endTime - startTime);

            // Record probability of winning
            probWin.push(value);

            if (ellsbergTrial < trial.transitions.length){

                // Calculate proportion of each colour for next rial
                value = value - trial.transitions[ellsbergTrial] * selection;

                // Iterate trial index
                ellsbergTrial++;

                // Hide content for inter-trial interval then make visible
                content.style.visibility = "hidden";
                setTimeout(()=> {content.style.visibility = "visible";}, trial.interTrialInterval)

                // Display next question
                displayQuestion(value);

            } else {

                // Clear the display
                display_element.innerHTML = '';

                // Calculate prize
                let trialIndex = [];
                let trialProbs = [];

                // If known option chose, use known probability, else random probability
                for (let trial = 0; trial < choice.length; trial++) {
                    trialIndex.push(trial);
                    if (choice[trial] == "known") {
                        trialProbs.push(probWin[trial] / 100);
                    } else {
                        trialProbs.push(Math.random());
                    }  
                }

                // Select random trial
                const randomIndex = jsPsych.randomization.sampleWithoutReplacement(trialIndex, 1);
                const prizeProb = trialProbs[randomIndex];
                const orange = prizeProb * 100;
                const orangeRounded = orange.toFixed(0);
                const prizeDraw = Math.random()

                // Compare with random number to determine prize
                if (prizeDraw < prizeProb) {
                    ellsbergPrize.amount = 1;
                    ellsbergPrize.colour = "orange";
                } else {
                    ellsbergPrize.amount = 0;
                    ellsbergPrize.colour = "purple";
                }

                // Store prize data in global variable
                ellsbergPrize.trial = randomIndex[0];
                ellsbergPrize.choice = choice[randomIndex];
                ellsbergPrize.probability = prizeProb;
                ellsbergPrize.orange = orangeRounded;

                // data saving
                var trial_data = {
                    choice: JSON.stringify(choice),
                    probWin: JSON.stringify(probWin),
                    rt: JSON.stringify(responseTime)
                };
    
                // end trial
                jsPsych.finishTrial(trial_data);
            }
        }    
    };
  
    return plugin;
})();