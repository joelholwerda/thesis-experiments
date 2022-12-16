      
clear all
test = 0;

if test
    Screen('Preference', 'SkipSyncTests', 2 );      % Skips the Psychtoolbox calibrations - REMOVE THIS WHEN RUNNING FOR REAL!
end
Screen('CloseAll');

clc;

functionFoldername = fullfile(pwd, 'functions');    % Generate file path for "functions" folder in current working directory
addpath(genpath(functionFoldername));               % Then add path to this folder and all subfolders

global screenNum MainWindow scr_centre DATA datafilename
global white black numStimuli
global screenBackgroundColour screenRect stimOrder stimType

% screenNum = 0;
screenNum = max(Screen('Screens'));  % Which screen to display the experiment

% Get screen resolution, and find location of centre of screen
[scrWidth, scrHeight] = Screen('WindowSize',screenNum);
res = [scrWidth scrHeight];
scr_centre = res / 2;
screenRect = [0,0,scrWidth,scrHeight];

KbName('UnifyKeyNames');    % Important for some reason to standardise keyboard input across platforms / OSs.

%---------------------------------------------------------------------------------------------------------------
% % Demographic data input

if exist('ExptData', 'dir') == 0
    mkdir('ExptData');
end

inputError = 1;
while inputError == 1
    inputError = 0;
    p_number = input('Participant number  ---> ');
    datafilename = ['ExptData\MagMem2_subj', num2str(p_number), '.mat'];
    if exist(datafilename, 'file') == 2
        disp(['Data for participant ', num2str(p_number),' already exist'])
        inputError = 1;
    end
end

p_age = input('What is your age? ---> ');
p_gender = input('What is your gender? ---> ', 's');

if p_number < 100
order = importfile('order.csv', 1, 80);
stimTypeCode = order(p_number);
else 
    stimTypeCode = 1;   
end

if stimTypeCode == 1
    stimType = 'low';
else
    stimType = 'high';
end

% Store demographic data
DATA.subject = p_number;
DATA.age = p_age;
DATA.gender = p_gender;
DATA.start_time = datestr(now,0);
DATA.stimType = stimType;

%---------------------------------------------------------------------------------------------------------------
% generate a random seed using the clock, then use it to seed the random
% number generator
rng('shuffle');
randSeed = randi(30000);
DATA.rSeed = randSeed;
rng(randSeed);

%---------------------------------------------------------------------------------------------------------------
% Open main window and establish screen parameters
HideCursor;

% Create main window and set font
MainWindow = Screen(screenNum, 'OpenWindow', [], [], 32);
Screen('Preference', 'DefaultFontName', 'Calibri');
Screen('TextFont', MainWindow, 'Calibri');
Screen('TextSize', MainWindow, 34);
Screen('TextStyle', MainWindow, 1);

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
% - trialType is either Extreme ('X'), Non-extreme ('NX'), Catch ('C'), or Single ('S')
% - Stimulus (or choice) A is always presented on the left.
% - Stimulus B is presented on the right.
% - OutcomeA and OutcomeB are choice contingencies.
% Stimuli are counterbalanced so that each stimulus/outcome combination is
% presented on each side equally often.
if strcmp(stimType,'high')
    structFile = 'blockStructHigh.csv';
elseif strcmp(stimType,'low')
    structFile = 'blockStructLow.csv';
end
[~,trialType,stimA,stimB,outcomeA,outcomeB] = importfile(structFile, 2, 49);

numChoiceStimuli = 2;           % number of options presented
stimulusScaling = 0.75;         % e.g., 0.5 will shrink stimuli by a half
numStimuli = 4;                 % Number of stimuli; here coloured shapes
if test
    interTrialInterval = .1;
else
    interTrialInterval = 1.5;
end
initialPause = 0.5;
interStimulusInterval = 0.2;
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

if test
    numBlocks = 2;
    trialPerBlock = 48;
else
    numBlocks = 5;
    trialPerBlock = 48;
end
choiceOptions = {'A' 'B'};
numTrials = numBlocks * trialPerBlock;

%---------------------------------------------------------------------------------------------------------------
% Present some instructions

presentInstructions();

%---------------------------------------------------------------------------------------------------------------
% Read in Stimuli and create necessary windows for choice task

% Read in the stimuli. Order randomly determined for each participant.
% This ensures stimulus colour is randomised across trial type.
stimOrder = randperm(numStimuli);
for ii = 1 : numStimuli
    imgMatrix=imread(['stim', num2str(stimOrder(ii)),'.jpg'], 'jpg');
    stimulusHeight = size(imgMatrix,1);
    stimulusWidth = size(imgMatrix,2);
    stimulusTexture(ii) = Screen('MakeTexture', MainWindow, imgMatrix);
end
DATA.stimOrder = stimOrder; % save stim order

% Scale the stimuli, in case they're too big
ScaledStimulusWidth = stimulusWidth * stimulusScaling;
ScaledStimulusHeight = stimulusHeight * stimulusScaling;

% Rectangle for presenting stimuli
stimRect = CenterRect([0,0,ScaledStimulusWidth,ScaledStimulusHeight], screenRect);
choiceRect = zeros(numChoiceStimuli, 4);
selectRect = zeros(numChoiceStimuli, 4);

% Create offscreen windows for the proceed button
buttonRect = [0, 0, 220, 100];
proceedButtonWindow = Screen('OpenOffscreenWindow', MainWindow, screenBackgroundColour, buttonRect);
Screen('TextFont', proceedButtonWindow, 'Calibri');
Screen('TextSize', proceedButtonWindow, 48);
Screen('TextStyle', proceedButtonWindow, 1);
Screen('FrameRect', proceedButtonWindow, black, [], 4);
DrawFormattedText(proceedButtonWindow, 'Proceed', 'center', 'center' , black, [], [], [], 1.8);
proceedButtonRect = CenterRectOnPoint(buttonRect, scr_centre(1), 980);

% This creates slots in an array that will be used to save the data.
DATA.choiceTrialInfo = zeros(numTrials, 12);

WaitSecs(initialPause);
totTrial = 0;

%---------------------------------------------------------------------------------------------------------------
% Main experimental loop

for block = 1:numBlocks
    
    trialNum = randperm(trialPerBlock);  % randomly shuffle the trial order for each block
    
    for trial = 1 : trialPerBlock
        
        totTrial = totTrial + 1;
        trialStimuli = [stimA(trialNum(trial)) stimB(trialNum(trial))];
        
        if strcmp(trialType(trialNum(trial)),'X')
            trialIndex = 1;
        elseif strcmp(trialType(trialNum(trial)),'NX')
            trialIndex = 2;
        elseif strcmp(trialType(trialNum(trial)),'C')
            trialIndex = 3;
        else
            trialIndex = 4;
        end
        
        % Create offscreen window for drawing choice test stimuli into
        choiceTestWindow = Screen('OpenOffscreenWindow', MainWindow, screenBackgroundColour);
        
        % Make our rectangle coordinates
        for ii = 1:numChoiceStimuli
            choiceRect(ii, :) = CenterRectOnPoint(stimRect, stimWidth(ii), scr_centre(2));
        end
        
        if strcmp(trialType(trialNum(trial)),'S')   % if trial type is single
            index = find(~isnan(trialStimuli));
            Screen('DrawTexture', choiceTestWindow, stimulusTexture(trialStimuli(index)), [], choiceRect(index,:));
            Screen('DrawTexture', MainWindow, choiceTestWindow);
        else
            Screen('DrawTexture', choiceTestWindow, stimulusTexture(trialStimuli(1)), [], choiceRect(1,:));
            Screen('DrawTexture', choiceTestWindow, stimulusTexture(trialStimuli(2)), [], choiceRect(2,:));
            Screen('DrawTexture', MainWindow, choiceTestWindow);
        end
        
        choiceStartTime = Screen(MainWindow, 'Flip');
        ShowCursor('Arrow');
        
        numOptionsChosen = 0;
        optionChosen = 0;
        proceedButtonPresented = 0;
        proceedButtonClicked = 0;
        
        if strcmp(trialType(trialNum(trial)),'S')
            while proceedButtonClicked == 0
                [~, x, y, ~] = GetClicks(MainWindow, 0);
                
                feedbackLabel = [outcomeA(trialNum(trial)) outcomeB(trialNum(trial))];
                feedbackWindow = Screen('OpenOffscreenWindow', MainWindow, screenBackgroundColour, stimRect);
                Screen('TextFont', feedbackWindow, 'Calibri');
                Screen('TextSize', feedbackWindow, 40);
                Screen('TextStyle', feedbackWindow, 1);
                
                if numOptionsChosen < 1
                    if ~IsInRect(x, y, choiceRect(index,:))
                        Screen('DrawTexture', MainWindow, choiceTestWindow);
                        Screen(MainWindow, 'Flip', [], 1);
                    elseif IsInRect(x, y, choiceRect(index,:))
                        numOptionsChosen = 1;
                        optionChosen = index;
                        feedbackText = [feedbackLabel{optionChosen} ' points'];
                        saveFeedback = feedbackLabel{optionChosen};
                        
                        DrawFormattedText(feedbackWindow, feedbackText, 'center', 'center' , black, [], [], [], 1.8);
                        feedbackRect = CenterRectOnPoint(stimRect, stimWidth(optionChosen), scr_centre(2));
                        Screen('DrawTexture', choiceTestWindow, feedbackWindow, [], feedbackRect);
                        Screen('DrawTexture', MainWindow, choiceTestWindow);
                        
                        Screen(MainWindow, 'Flip', [], 1);
                    end
                end
                
                if numOptionsChosen == 1
                    % Present the proceed button after choice has been made
                    Screen('DrawTexture', MainWindow, proceedButtonWindow, [], proceedButtonRect);  % When all options selected, present confirm button
                    Screen(MainWindow, 'Flip', [], 1);
                    proceedButtonPresented = 1;
                end
                
                if IsInRect(x, y, proceedButtonRect) && proceedButtonPresented     % If they've clicked the proceed button
                    responseTime = GetSecs - choiceStartTime;
                    proceedButtonClicked = 1;
                end
            end
        else
            while proceedButtonClicked == 0
                [~, x, y, ~] = GetClicks(MainWindow, 0);
                
                feedbackLabel = [outcomeA(trialNum(trial)) outcomeB(trialNum(trial))];
                feedbackWindow = Screen('OpenOffscreenWindow', MainWindow, screenBackgroundColour, stimRect);
                Screen('TextFont', feedbackWindow, 'Calibri');
                Screen('TextSize', feedbackWindow, 40);
                Screen('TextStyle', feedbackWindow, 1);
                
                for ii = 1 : numChoiceStimuli
                    if numOptionsChosen < 1
                        if IsInRect(x, y, choiceRect(ii,:))
                            numOptionsChosen = numOptionsChosen + 1;
                            optionChosen = ii;
                            feedbackText = [feedbackLabel{optionChosen} ' points'];
                            saveFeedback = feedbackLabel{optionChosen};
                            
                            DrawFormattedText(feedbackWindow, feedbackText, 'center', 'center' , black, [], [], [], 1.8);
                            feedbackRect = CenterRectOnPoint(stimRect, stimWidth(optionChosen), scr_centre(2));
                            Screen('DrawTexture', choiceTestWindow, feedbackWindow, [], feedbackRect);
                            Screen('DrawTexture', MainWindow, choiceTestWindow);
                            
                            Screen(MainWindow, 'Flip', [], 1);
                        end
                    end
                end
                
                if numOptionsChosen == 1
                    % Present the proceed button after choice has been made
                    Screen('DrawTexture', MainWindow, proceedButtonWindow, [], proceedButtonRect);
                    Screen(MainWindow, 'Flip', [], 1);
                    proceedButtonPresented = 1;
                end
                
                if IsInRect(x, y, proceedButtonRect) && proceedButtonPresented     % If they've clicked the proceed button
                    responseTime = GetSecs - choiceStartTime;
                    proceedButtonClicked = 1;
                end
            end
        end
        Screen(MainWindow, 'Flip', []);
        Screen(MainWindow, 'Flip', []);
        Screen('Close', feedbackWindow);
        Screen('Close', choiceTestWindow);
        
        HideCursor;
        
        % Store and save trial data
        DATA.choiceTrialInfo(totTrial,:) = [stimTypeCode, totTrial, block, trial, trialIndex, trialStimuli(1), trialStimuli(2), ...
            str2double(feedbackLabel{1}), str2double(feedbackLabel{2}), optionChosen, str2double(saveFeedback), responseTime];
        save(datafilename, 'DATA');
        
        WaitSecs(interTrialInterval);
    end
    
    if block ~= numBlocks
        DrawFormattedText(MainWindow, 'That is the end of the block.\n\n Press the SPACE bar to continue on to the next block.', 'center', 500 , black);
        Screen(MainWindow, 'Flip');
        RestrictKeysForKbCheck(KbName('space'));
        KbWait([], 2);
        Screen(MainWindow, 'Flip');
        WaitSecs(initialPause);
        %     
    end
end

% Screen('Close', tallyWindow);
Screen('Close', proceedButtonWindow);
Screen('Close', stimulusTexture(:));
%---------------------------------------------------------------------------------------------------------------

% Run the "first to mind" and outcome percentage memory questions
[DATA.percentResps, DATA.ftmVals, DATA.outLabels, DATA.ftmRT, DATA.percentRT] = getProbRatings();

prizeSample = DATA.choiceTrialInfo(:, 11);
DATA.prize = datasample(prizeSample, 1);
prize = ['$', num2str(DATA.prize / 10)]

% Save the data for the final time
save(datafilename, 'DATA');
DATA.end_time = datestr(now,0);
save(datafilename, 'DATA');

WaitSecs(.5);
Screen(MainWindow, 'FillRect', white); % clear screen
DrawFormattedText(MainWindow, ['Experiment complete! Thank you for your participation. \n\n The outcome of one trial has been randomly selected for payment. You have earned ', prize, '.\n\n Please let the experimenter know that you have finished.'], 'center', 'center' , black);
Screen(MainWindow, 'Flip');

RestrictKeysForKbCheck(KbName('q'));   % Only accept Q key to quit
KbWait([], 2);

rmpath(genpath(functionFoldername));       % Remove functions folder from path
Screen('Preference', 'SkipSyncTests', 0);
Screen('CloseAll');

clear all