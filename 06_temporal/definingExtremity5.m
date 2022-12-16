                            
clear all
test = 1;

if test
    Screen('Preference', 'SkipSyncTests', 2 );      % Skips the Psychtoolbox calibrations - REMOVE THIS WHEN RUNNING FOR REAL!
end

Screen('CloseAll');

clc;

functionFoldername = fullfile(pwd, 'functions');    % Generate file path for "functions" folder in current working directory
addpath(genpath(functionFoldername));               % Then add path to this folder and all subfolders

global screenNum MainWindow scr_centre DATA datafilename
global white black numStimuli res currentBlock minInstrTime
global screenBackgroundColour screenRect stimOrder stimType ftmOrder percentOrder

% screenNum = 0;
screenNum = max(Screen('Screens'));  % Which screen to display the experiment

% Get screen resolution, and find location of centre of screen
[scrWidth, scrHeight] = Screen(  'WindowSize',screenNum);
res = [scrWidth scrHeight];
scr_centre = res / 2;
screenRect = [0,0,scrWidth,scrHeight];

KbName('UnifyKeyNames');    % Important for some reason to standardise keyboard input across platforms / OSs

%---------------------------------------------------------------------------------------------------------------
% % Demographic data input

if exist('ExptData', 'dir') == 0
    mkdir('ExptData');
end

inputError = 1;
while inputError == 1
    inputError = 0;
    p_number = input('Participant number  ---> ');
    datafilename = ['ExptData\definingExtremity_subj', num2str(p_number), '.mat'];
    if exist(datafilename, 'file') == 2
        disp(['Data for participant ', num2str(p_number),' already exist'])
        inputError = 1;
    end
end

p_age = input('What is your age? ---> ');
p_gender = input('What is your gender? ---> ', 's');

if p_number < 140 % THIS NEEDS TO BE GREATER THAN THE NUMBER OF PARTICIPANTS
randomOrder = importfile('randomOrder.csv', 1, 130); % THIS NEEDS TO EQUAL THE NUMBER OF PARTICIPANTS
stimTypeCode = randomOrder(p_number);
else 
    stimTypeCode = 2;   
end

if stimTypeCode == 1
    stimType = 'random';
elseif stimTypeCode == 2
    stimType = 'abab';
end

% Store demographic data
DATA.subject = p_number;
DATA.age = p_age;
DATA.gender = p_gender;
DATA.start_time = datestr(now,0);
DATA.stimType = stimType;

%-------------------------------------------------------------------------
% Create some variables--number of blocks and trials etc. Values depend on
% whether test is TRUE.

if test    
    interTrialInterval = 0.1;
    beforeProceed = 0;
    minInstrTime = 0;
    numBlocks = 1;
    trialPerBlock = 6;
else
    interTrialInterval = 0.5;
    beforeProceed = 1;
    minInstrTime = 2;
    numBlocks = 5;
    trialPerBlock = 40;
end
initialPause = 0.5;
interStimulusInterval = 0.2;
pointTally = 0;                 % initial point tally value

%---------------------------------------------------------------------------------------------------------------
% generate a random seed using the clock, then use it to seed the random
% number generator
rng('shuffle');
randSeed = randi(30000);
DATA.rSeed = randSeed;
rng(randSeed);

%---------------------------------------------------------------------------------------------------------------
% Open main window and establish screen parameters

% Create main window and set font
MainWindow = Screen(screenNum, 'OpenWindow', [], [], 32);
Screen('Preference', 'DefaultFontName', 'Calibri');
Screen('TextFont', MainWindow, 'Calibri');
Screen('TextSize', MainWindow, 34);
Screen('TextStyle', MainWindow, 0);

% Save framerate; set black and white variables
DATA.frameRate = round(Screen(MainWindow, 'FrameRate'));
white = WhiteIndex(MainWindow);
black = BlackIndex(MainWindow);
screenBackgroundColour = white;

% Some colours that may be of use
yellow = [255 255 0];
red = [255 0 0];
green = [34 177 76];
blue = [0 0 255];

% fill the main screen with background colour
Screen('FillRect', MainWindow, screenBackgroundColour);
Screen(MainWindow, 'Flip');

%---------------------------------------------------------------------------------------------------------------
% Set up for running trials and Experiment Information

% Import block design matrix. This reads in vectors that correspond to the
% stimulus/outcome contingencies. Some notes:
% - trialType is either shared, context, catch, or single. 
% - Stimulus (or choice) A is always presented on the left.
% - Stimulus B is presented on the right.
% - OutcomeA and OutcomeB are choice contingencies.
% Stimuli are counterbalanced so that each stimulus/outcome combination is
% presented on each side equally often.

structFile = 'struct-file.csv';
[~,trialType,stimA,stimB,outcomeA,outcomeB] = importfile(structFile, 2, trialPerBlock + 1);

numChoiceStimuli = 2;           % number of options presented
stimulusScaling = 1;         % e.g., 0.5 will shrink stimuli by a half
numStimuli = 4;                 % Number of stimuli; here coloured shapes
stimWidth = [scrWidth * 0.35 scrWidth * 0.65];  % Screen X positions for choice stimuli

%------------------------------------------------------------------------
% Convert outcomes to numbers, multiply values by amount set by magLevel,
% then convert back to string.

outA = {};
for ii = 1:length(outcomeA)
    value = str2double(outcomeA(ii));
    temp = num2str(str2double(outcomeA(ii)));
    
        outA{ii} = num2str(value);
    
end

outB = {};
for ii = 1:length(outcomeB)
    value = str2double(outcomeB(ii));
    temp = num2str(str2double(outcomeB(ii)));
    
        outB{ii} = num2str(value);
   
end

outcomeA = outA';
outcomeB = outB';

%------------------------------------------------------------------------

choiceOptions = {'A' 'B'};
numTrials = numBlocks * trialPerBlock;

%---------------------------------------------------------------------------------------------------------------
% Present some instructions

ShowCursor('Arrow');
presentInstructions(1);

%---------------------------------------------------------------------------------------------------------------
% Read in Stimuli and create necessary windows for choice task

% Read in the stimuli. Order randomly determined for each participant.
% This ensures stimulus colour is randomised across trial type.
stimOrder = randperm(numStimuli);

% Also randomise order for memory measures
ftmOrder = randperm(numStimuli);
percentOrder = randperm(numStimuli);

for ii = 1 : numStimuli
    imgMatrix=imread(['stim', num2str(stimOrder(ii)),'.jpg'], 'jpg');
    stimulusHeight = size(imgMatrix,1);
    stimulusWidth = size(imgMatrix,2);
    stimulusTexture(ii) = Screen('MakeTexture', MainWindow, imgMatrix);
end

DATA.stimOrder = stimOrder; % save stim order
DATA.ftmOrder = ftmOrder; 
DATA.percentOrder = percentOrder;

% Scale the stimuli, in case they're too big
ScaledStimulusWidth = stimulusWidth * stimulusScaling;
ScaledStimulusHeight = stimulusHeight * stimulusScaling;

% Rectangle for presenting stimuli
stimRect = CenterRect([0,0,ScaledStimulusWidth,ScaledStimulusHeight], screenRect); % dimensions of choice stimuli
fbRect = CenterRect([0,0,ScaledStimulusWidth * 0.8,ScaledStimulusHeight * 0.8], screenRect); % dimensions of feedback stimuli
choiceRect = zeros(numChoiceStimuli, 4);
selectRect = zeros(numChoiceStimuli, 4);

% Create offscreen windows for the points tally
tallyRect = [0, 0, 300, 125];
tallyDisplayRect = CenterRectOnPoint(tallyRect, scr_centre(1), 150);
tallyWindow = Screen('OpenOffscreenWindow', MainWindow, screenBackgroundColour, tallyDisplayRect);
Screen('TextFont', tallyWindow, 'Calibri');
Screen('TextSize', tallyWindow, 40);
Screen('TextStyle', tallyWindow, 0);
Screen('FrameRect', tallyWindow, black, [], 3);


% Create offscreen windows for the proceed button
buttonRect = [0, 0, 150, 50];
proceedButtonWindow = Screen('OpenOffscreenWindow', MainWindow, screenBackgroundColour, buttonRect);
Screen('TextFont', proceedButtonWindow, 'Calibri');
Screen('TextSize', proceedButtonWindow, 40);
Screen('TextStyle', proceedButtonWindow, 0);
Screen('FillRect', proceedButtonWindow, [100 100 100], [], 4);
DrawFormattedText(proceedButtonWindow, 'Proceed', 'center', 'center' , white, [], [], [], 1.8);
proceedButtonRect = CenterRectOnPoint(buttonRect, scr_centre(1), 980);

% This creates slots in an array that will be used to save the data.
DATA.choiceTrialInfo = zeros(numTrials, 12);

WaitSecs(initialPause);
totTrial = 0;

%---------------------------------------------------------------------------------------------------------------
% Main experimental loop

for block = 1:numBlocks
    
    currentBlock = block;
    
    if strcmp(stimType, 'random')
        
        trialNum = randperm(trialPerBlock);  % randomly shuffle the trial order for each block
        
    elseif strcmp(stimType, 'abab')
       
        % split trial numbers in half. High and low value outcomes are
        % split by trial number in the stuctFile
        trialNum = repelem(0, length(trialPerBlock));
        trialsA = randperm(trialPerBlock / 2);
        trialsB = randperm(trialPerBlock / 2);
        
        % Randomise whether high or low value is presented first for each
        % block
        trialOrder = randi(2);
        if trialOrder == 1
            trialsA = trialsA + trialPerBlock / 2;
        elseif trialOrder == 2
            trialsB = trialsB + trialPerBlock / 2;
        end
        
        % Combine into a single array in an ABAB fashion
        for pair = 1:(trialPerBlock / 2)
            
           trialNum(pair * 2 - 1) = trialsA(pair);
           trialNum(pair * 2) = trialsB(pair);
            
        end
        
    end
    
    for trial = 1 : trialPerBlock
        
        totTrial = totTrial + 1;
        trialStimuli = [stimA(trialNum(trial)) stimB(trialNum(trial))];
        
        if strcmp(trialType(trialNum(trial)),'low')
            trialIndex = 1;
        elseif strcmp(trialType(trialNum(trial)),'high')
            trialIndex = 2;
        elseif strcmp(trialType(trialNum(trial)),'single')
            trialIndex = 3;
        end
        
        % Create offscreen window for drawing choice test stimuli into
        choiceTestWindow = Screen('OpenOffscreenWindow', MainWindow, screenBackgroundColour);

        % Make our rectangle coordinates
        for ii = 1:numChoiceStimuli
            choiceRect(ii, :) = CenterRectOnPoint(stimRect, stimWidth(ii), scr_centre(2));
        end
        
        singleRect = CenterRectOnPoint(stimRect, scr_centre(1), scr_centre(2));
        
        if strcmp(trialType(trialNum(trial)),'single')   % if trial type is single
            index = find(~isnan(trialStimuli));
            Screen('DrawTexture', choiceTestWindow, stimulusTexture(trialStimuli(index)), [], singleRect);
            Screen('DrawTexture', MainWindow, choiceTestWindow);
        else % if trial is catch / decision
            Screen('DrawTexture', choiceTestWindow, stimulusTexture(trialStimuli(1)), [], choiceRect(1,:));
            Screen('DrawTexture', choiceTestWindow, stimulusTexture(trialStimuli(2)), [], choiceRect(2,:));
            Screen('DrawTexture', MainWindow, choiceTestWindow);
        end
        
        DrawFormattedText(tallyWindow, ['Total Points:\n', num2str(pointTally)], 'center', 45 , black, [], [], [], 1.5);
        Screen('DrawTexture', MainWindow, tallyWindow, [], tallyDisplayRect);
        
        choiceStartTime = Screen(MainWindow, 'Flip');
        
        % create variables to indicate option / button selected
        
        numOptionsChosen = 0;
        optionChosen = 0;
        proceedButtonPresented = 0;
        proceedButtonClicked = 0;
        
        % main loop--single option trials
        
        if strcmp(trialType(trialNum(trial)),'single')
            while proceedButtonClicked == 0
                [~, x, y, ~] = GetClicks(MainWindow, 0);
                
                feedbackLabel = [outcomeA(trialNum(trial)) outcomeB(trialNum(trial))];
                feedbackWindow = Screen('OpenOffscreenWindow', MainWindow, screenBackgroundColour, stimRect);
                Screen('TextFont', feedbackWindow, 'Calibri');
                Screen('TextSize', feedbackWindow, 40);
                Screen('TextStyle', feedbackWindow, 0);
                
                if numOptionsChosen < 1
                    
                    % what happens until an option is chosen
                    if ~IsInRect(x, y, singleRect)
                        Screen('DrawTexture', MainWindow, choiceTestWindow);
                        
                        Screen(tallyWindow, 'FillRect', white);
                        Screen('FrameRect', tallyWindow, black, [], 3);
                        DrawFormattedText(tallyWindow, ['Total Points:\n', num2str(pointTally)], 'center', 45 , black, [], [], [], 1.5);
                        Screen('DrawTexture', MainWindow, tallyWindow, [], tallyDisplayRect);
                        
                        Screen(MainWindow, 'Flip', [], 1);
                        
                    % what happens when an option is chosen    
                    elseif IsInRect(x, y, singleRect)
                        numOptionsChosen = 1;
                        optionChosen = index;
                        feedbackText = [feedbackLabel{optionChosen} ' points'];
                        saveFeedback = feedbackLabel{optionChosen};
                        
                        % present feedback for option chosen
                        DrawFormattedText(feedbackWindow, feedbackText, 'center', 'center' , black, [], [], [], 1.8);
                        feedbackRect = CenterRectOnPoint(fbRect, scr_centre(1), scr_centre(2));
                        Screen('DrawTexture', choiceTestWindow, feedbackWindow, [], feedbackRect);
                        Screen('DrawTexture', MainWindow, choiceTestWindow);
                        
                        % Update points tally
                        pointTally = pointTally + str2double(feedbackLabel{optionChosen});
                        Screen(tallyWindow, 'FillRect', white);
                        Screen('FrameRect', tallyWindow, black, [], 3);
                        DrawFormattedText(tallyWindow, ['Total Points:\n', num2str(pointTally)], 'center', 45 , black, [], [], [], 1.5);
                        Screen('DrawTexture', MainWindow, tallyWindow, [], tallyDisplayRect);
                        
                        Screen(MainWindow, 'Flip', [], 1);
                    end
                end
                
                if numOptionsChosen == 1
                    if proceedButtonPresented == 0 
                        responseTime = GetSecs - choiceStartTime; % get reaction time
                        WaitSecs(beforeProceed); % pause before presenting proceed button
                    end
                    % Present the proceed button after choice has been made
                    Screen('DrawTexture', MainWindow, proceedButtonWindow, [], proceedButtonRect);  % When all options selected, present confirm button
                    Screen(MainWindow, 'Flip', [], 1);
                    proceedButtonPresented = 1;
                end
                
                if IsInRect(x, y, proceedButtonRect) && proceedButtonPresented     % If they've clicked the proceed button
                    proceedButtonClicked = 1;
                end
            end
            
        % main decision loop--decision / choice trials
        else
            while proceedButtonClicked == 0
                [~, x, y, ~] = GetClicks(MainWindow, 0);
                
                feedbackLabel = [outcomeA(trialNum(trial)) outcomeB(trialNum(trial))];
                feedbackWindow = Screen('OpenOffscreenWindow', MainWindow, screenBackgroundColour, stimRect);
                Screen('TextFont', feedbackWindow, 'Calibri');
                Screen('TextSize', feedbackWindow, 40);
                Screen('TextStyle', feedbackWindow, 0);
                
                for ii = 1 : numChoiceStimuli
                    if numOptionsChosen < 1
                        
                        % what happens when an option is chosen
                        if IsInRect(x, y, choiceRect(ii,:))
                            numOptionsChosen = numOptionsChosen + 1;
                            optionChosen = ii;
                            feedbackText = [feedbackLabel{optionChosen} ' points'];
                            saveFeedback = feedbackLabel{optionChosen};
                            
                            if optionChosen == 1
                                notChosen = 2;
                                
                            elseif optionChosen == 2
                                notChosen = 1;
                                
                            end
                            
                            DrawFormattedText(feedbackWindow, feedbackText, 'center', 'center' , black, [], [], [], 1.8);
                            
                            feedbackRect = CenterRectOnPoint(fbRect, stimWidth(optionChosen), scr_centre(2));
                            coverRect = CenterRectOnPoint(stimRect * 2, stimWidth(notChosen), scr_centre(2));
                            Screen('DrawTexture', choiceTestWindow, feedbackWindow, [], feedbackRect);
                            Screen('DrawTexture', MainWindow, choiceTestWindow);
                            Screen('FillRect', MainWindow, white, coverRect); % create rectangle to cover other stimulus
                            
                            % Update points tally
                            pointTally = pointTally + str2double(feedbackLabel{optionChosen});
                            Screen(tallyWindow, 'FillRect', white);
                            Screen('FrameRect', tallyWindow, black, [], 3);
                            DrawFormattedText(tallyWindow, ['Total Points:\n', num2str(pointTally)], 'center', 45 , black, [], [], [], 1.5);
                            Screen('DrawTexture', MainWindow, tallyWindow, [], tallyDisplayRect);
                            
                            Screen(MainWindow, 'Flip', [], 1);
                        end
                    end
                end
                
                if numOptionsChosen == 1
                    if proceedButtonPresented == 0 
                        responseTime = GetSecs - choiceStartTime; % get reaction time
                        WaitSecs(beforeProceed); % pause before presenting proceed button
                    end
                    % Present the proceed button after choice has been made
                    Screen('DrawTexture', MainWindow, proceedButtonWindow, [], proceedButtonRect);
                    Screen(MainWindow, 'Flip', [], 1);
                    proceedButtonPresented = 1;
                end
                
                if IsInRect(x, y, proceedButtonRect) && proceedButtonPresented     % If they've clicked the proceed button
                    proceedButtonClicked = 1;
                end
            end
        end
        
        Screen(choiceTestWindow, 'FillRect', white, [0,250,scrWidth,scrHeight]);
        Screen('DrawTexture', MainWindow, choiceTestWindow);
        Screen('DrawTexture', MainWindow, tallyWindow, [], tallyDisplayRect);  
        Screen(MainWindow, 'Flip', [], 1);
        Screen('Close', feedbackWindow);
        Screen('Close', choiceTestWindow);
        
        % Store and save trial data
        DATA.choiceTrialInfo(totTrial,:) = [stimTypeCode, totTrial, block, trial, trialIndex, trialStimuli(1), trialStimuli(2), ...
            str2double(feedbackLabel{1}), str2double(feedbackLabel{2}), optionChosen, str2double(saveFeedback), responseTime];
        save(datafilename, 'DATA');
        
        WaitSecs(interTrialInterval);
    end
    
    if block ~= numBlocks
        presentInstructions(4)
     
    end
end

Screen('Close', tallyWindow);
Screen('Close', proceedButtonWindow);
Screen('Close', stimulusTexture(:));
%---------------------------------------------------------------------------------------------------------------

% Run the "first to mind" and outcome percentage memory questions
[DATA.percentResps, DATA.ftmVals, DATA.outLabels, DATA.ftmRT, DATA.percentRT] = getProbRatings();

prizeSample = DATA.choiceTrialInfo(:, 11);
prizeCalculation = 2; % Calculate prize by random sample (1) or total points (2)
conversionRate = 1000;

if prizeCalculation == 1
    DATA.prize = datasample(prizeSample, 1) / 10;
elseif prizeCalculation == 2
    DATA.prize = round(sum(prizeSample) / conversionRate);
end

DATA.prize = ['$', num2str(DATA.prize)];

% Save the data for the final time
save(datafilename, 'DATA');
DATA.end_time = datestr(now,0);
save(datafilename, 'DATA');

WaitSecs(.5);
Screen(MainWindow, 'FillRect', white); % clear screen
DrawFormattedText(MainWindow, ['Experiment complete! Thank you for your participation. \n\n The outcome of one trial has been randomly selected for payment. You have earned ', DATA.prize, '.\n\n Please let the experimenter know that you have finished.'], 'center', 'center' , black);
Screen(MainWindow, 'Flip');

RestrictKeysForKbCheck(KbName('q'));   % Only accept Q key to quit
KbWait([], 2);

rmpath(genpath(functionFoldername));       % Remove functions folder from path
Screen('Preference', 'SkipSyncTests', 0);
Screen('CloseAll');

clear all