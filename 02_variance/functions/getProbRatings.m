function [finalRespVals, ftmVals, outLabels, ftmRT, percentRT] = getProbRatings()

global black white screenRect screenNum MainWindow scr_centre numStimuli stimType stimOrder ftmOrder percentOrder% variables from the main experiment
global screenID win ftmVal boxVal1 boxVal2 boxVal3 boxVal4 boxVal5 boxVal6 boxVal7 boxVal8 boxVal9 % new global variables

screenID = screenNum;
win = MainWindow;
centerVert = scr_centre(2);
centerHor = scr_centre(1);
Vert = centerVert*2;

% ListenChar(2); %makes it so characters typed don?t show up in the command window
ShowCursor('Arrow'); % Show cursor

%Get responses from what subjects typed
KbName('UnifyKeyNames'); %used for cross-platform compatibility of keynaming
KbQueueCreate; %creates cue using defaults
KbQueueStart;  %starts the cue

returnKey=KbName('return'); %define return key (used to end)
backSpaceKey=KbName('backspace'); %define backspace key

% Choice Alternative Images
for stim = 1:numStimuli
    tempImg = imread(['stim' num2str(stimOrder(stim)) '.jpg'],'jpg'); % read in patient image
    switch stim
        case 1
            altImg1 = tempImg;
        case 2
            altImg2 = tempImg;
        case 3
            altImg3 = tempImg;
        case 4
            altImg4 = tempImg;
        case 5
            altImg5 = tempImg;
        case 6
            altImg6 = tempImg;
    end
end
imgHight = size(tempImg,1); % hight in pixels
imgWidth = size(tempImg,2); % width in pixels
topOffset = Vert/10;
stimImgLoc = [centerHor-imgWidth/2 topOffset centerHor+imgWidth/2 topOffset+imgHight]; % location to draw image

if strcmp(stimType,'highVar')
    nOuts = 9;
        labelText = {'    0 points -->','  10 points -->','  25 points -->','  40 points -->','  50 points -->','  60 points -->','  75 points -->','  90 points -->','100 points -->'};

elseif strcmp(stimType,'lowVar')
    nOuts = 9;

        labelText = {'    0 points -->','  20 points -->','  25 points -->','  30 points -->','  50 points -->','  70 points -->','  75 points -->','  80 points -->','100 points -->'};

end

% Button variables
buttXpos = [repelem(centerHor - 105, 5), repelem(centerHor + 295, 4)];
buttDims = [0 0 85 40];% set size of buttons
buttColors = [240 240 240]'*ones(1,nOuts); % set the box colors
buttOffset = 80; % verticle distance between buttons
buttYpos = [100 + centerVert + ((1:5) - 3)*buttOffset, 100 + centerVert + ((1:4) - 3)*buttOffset];
for i = 1:length(buttYpos)  % center buttons on 3 points below patient image
    buttRects(:, i) = CenterRectOnPoint(buttDims, buttXpos(i), buttYpos(i));
end

% Proceed button
proceedDims = [0 0 150 50];
buttYpos = [buttYpos, Vert - 100];
buttColors = [buttColors, [100 100 100]']; % set the Proceed button color
buttRects = [buttRects, CenterRectOnPoint(proceedDims, centerHor, buttYpos(end))'];

% Button Labels
labelIndent = 195; % num pixels b/t button and text
labelVshift = 10; % shift text up

instrText1{1} = 'For the coloured square shown here, which outcome'; 
instrText1{2} = '(number of points) comes to mind first?';
instrText1{3} = ' ';
instrText1{4} = 'Enter your answer in the textbox below the square'; 
instrText1{5} = ' ';
instrText1{6} = 'Click PROCEED when you are finished.';

instrText2{1} = 'When you selected the coloured square shown here, on';
instrText2{2} = 'what PERCENTAGE of choices did you experience each';
instrText2{3} = 'of the outcomes listed below?';
instrText2{4} = '  ';
instrText2{5} = 'Click the textbox next to each outcome to enter a number.';
instrText2{6} = 'If you did not experience an outcome, leave "0" in the';
instrText2{7} = 'corresponding textbox.';
instrText2{8} = '  ';
instrText2{9} = 'Click PROCEED when you are finished entering values.';

allowed = KbName({'1','2','3','4','5','6','7','8','9','0','1!','2@','3#','4$','5%','6^','7&','8*','9(','0)'}); % set of values participants can enter
signs = KbName({'-','+','-_','=+'}); 

errorText1 = 'You must enter a valid number before you proceed';
errorText2 = 'Your values must sum to 100 before you proceed';
errorText3 = 'Your must enter a value in each box before you proceed';
errorColor = [255 50 50]; % color of error message text

% 'What comes to mind first' buttons
q1Dim = [0 0 100 40]; % make this box wider than prob boxes
q1Ypos = buttYpos([3 end]);
q1Rects = [CenterRectOnPoint(q1Dim, centerHor, q1Ypos(1))', buttRects(:,end)];
q1Colors = buttColors(:,[3 end]);

% Initialize empty vectors
ftmRT = nan*ones(1,numStimuli); 
percentRT = ftmRT;
finalRespVals = nan*ones(length(labelText),numStimuli);
ftmVals = ftmRT;

% Show instructions
presentInstructions(2);

% --- what comes to mind first --- %
for trial = ftmOrder
    switch trial
        case 1
            altImg = altImg1;
        case 2
            altImg = altImg2;
        case 3
            altImg = altImg3;
        case 4
            altImg = altImg4;
        case 5
            altImg = altImg5;
        case 6
            altImg = altImg6;
            
    end
    proceed1 = 0;
    clickedIn = 0;
    ftmVal = [];
    
    drawEverything(altImg,stimImgLoc,q1Colors,q1Rects,buttXpos,q1Ypos,labelIndent,labelVshift,[],instrText1,1)
    Screen('Flip',win);
    beginFTMtime = GetSecs; % start timer for FTM response
    
    while ~proceed1
        justClicked = 0;
        [x,y,buttons] = GetMouse(screenID); % Check for mouse click
        if buttons(1,1) %left button->choosing
            whichNode = isOverNode(q1Rects, x, y); % get index of clicked button
            if whichNode > 0 && whichNode ~= size(q1Rects,2)
                justClicked = 1;
                clickedIn = 1;
                clickedBox = whichNode;
                ftmRT(trial) = GetSecs - beginFTMtime; % save the RT to first clicking in the FTM box
            end
        end
        while any(buttons) % wait for release
            [x,y,buttons] = GetMouse;
        end
        
        while (clickedIn > 0)
            
            if justClicked
                justClicked = 0;
                currentVal = []; % empty the clicked box
                blink = 0;
                ftmVal = currentVal; % save current buffer
                startTime = GetSecs;
            end
            
            [pressed, firstPress] = KbQueueCheck; % checks for keys
            
            if pressed
                firstPress(find(firstPress==0)) = NaN; %little trick to get rid of 0s
                [endtime, keyInd] = min(firstPress); % gets the RT of the first key-press and its ID
                if ~isnan(firstPress(backSpaceKey)) && ~isempty(currentVal) %if backspace key then erase last entry
                    if blink % erase the last number, not the _
                        currentVal = [currentVal(1:end-2) '_'];
                    else
                        currentVal = currentVal(1:end-1);
                    end
                elseif (any(allowed == keyInd) || any(signs == keyInd)) && length(currentVal) < (6+blink) % check that clicked key is a number & the buffer isn't full
                    if any(allowed(11:end) == keyInd) % regular number buttons, rather than numpad buttons
                        keyInd = allowed(find(allowed == keyInd) - 10); % only display the number, not the symbol
                    elseif any(signs(3:end) == keyInd) % do the same for '-_'
                        keyInd = signs(find(signs == keyInd) - 2); 
                    end
                    if blink % add key to buffer; if blink is on, put the new char before the "_"
                        currentVal = [currentVal(1:end-1) KbName(keyInd) '_']; %add key to buffer
                    else
                        currentVal = [currentVal KbName(keyInd)]; %add key to buffer
                    end
                end
                ftmVal = currentVal; % save current buffer
            end
            
            if (GetSecs - startTime) > .2
                if blink
                    currentVal = currentVal(1:end-1); % remove _ in clicked box
                    blink = 0;
                else
                    currentVal = [currentVal '_']; % add an underscore to the clicked box)
                    blink = 1;
                end
                ftmVal = currentVal; % save current buffer
                startTime = GetSecs;
            end
            
            drawEverything(altImg,stimImgLoc,q1Colors,q1Rects,buttXpos,q1Ypos,labelIndent,labelVshift,labelText,instrText1,1)
            Screen('Flip',win);
            
            [x,y,buttons] = GetMouse(screenID); % Check for mouse click
            if buttons(1,1) %left button->choosing
                whichNode = isOverNode(q1Rects, x, y); % get index of clicked button
                if whichNode > 0
                    justClicked = 1;
                    if blink
                        currentVal = currentVal(1:end-1); % remove _ before saving
                        ftmVal = currentVal; % save current buffer
                    end
                    clickedBox = whichNode;
                    drawEverything(altImg,stimImgLoc,q1Colors,q1Rects,buttXpos,q1Ypos,labelIndent,labelVshift,labelText,instrText1,1)

                    if whichNode == size(q1Rects,2) % clicked Proceed button
                        clickedIn = 0; % deactivate the current box
                        % check that 1) they entered something, 2) it isn't just a '-' or '+', and 3) there isn't a '-' or '+' in the middle somewhere
                        if (length(ftmVal) == 1 && ftmVal ~= '-' && ftmVal ~= '+') || (length(ftmVal) > 1 && (~any(ftmVal(2:end) == '-') && ~any(ftmVal(2:end) == '+')))
                            proceed1 = 1;
                        else
                            DrawFormattedText(win, errorText1, 'center', stimImgLoc(4) + 150, errorColor); % draws error message
                        end
                    end
                    Screen('Flip',win);
                end
            end
            while any(buttons) % wait for release
                [x,y,buttons] = GetMouse;
            end
        end
    end
    ftmVals(trial) = str2num(ftmVal);
end % trials loop

% Show instructions
presentInstructions(3);

% --- percent question --- %
for trial = percentOrder
    switch trial
        case 1
            altImg = altImg1;
        case 2
            altImg = altImg2;
        case 3
            altImg = altImg3;
        case 4
            altImg = altImg4;
        case 5
            altImg = altImg5;
        case 6
            altImg = altImg6;
    end
    
    outLabels(:,trial) = labelText(randperm(nOuts))'; % randomize outcome order
    
    proceed2 = 0;
    clickedIn = 0;
    boxVal1 = '0'; boxVal2 = '0'; boxVal3 = '0'; boxVal4 = '0'; boxVal5 = '0'; boxVal6 = '0';boxVal7 = '0'; boxVal8 = '0'; boxVal9 = '0';
     
    drawEverything(altImg,stimImgLoc,buttColors,buttRects,buttXpos,buttYpos,labelIndent,labelVshift,outLabels(:,trial),instrText2,2)
    Screen('Flip',win);
    beginPercentTime = GetSecs; % start timer for first percent response 
    
    while ~proceed2
        justClicked = 0;
        [x,y,buttons] = GetMouse(screenID); % Check for mouse click
        if buttons(1,1) %left button->choosing
            whichNode = isOverNode(buttRects, x, y); % get index of clicked button
            if whichNode > 0 && whichNode ~= size(buttRects,2)
                justClicked = 1;
                clickedIn = 1;
                clickedBox = whichNode;
                percentRT(trial) = GetSecs - beginPercentTime; % save the RT to first clicking in the FTM box
            end
        end
        while any(buttons) % wait for release
            [x,y,buttons] = GetMouse;
        end
        
        while (clickedIn > 0)
            
            if justClicked
                justClicked = 0;
                currentVal = []; % empty the clicked box
                blink = 0;
                eval(['boxVal' num2str(clickedBox) ' = currentVal;']) % save current buffer
                startTime = GetSecs;
            end
            
            [pressed, firstPress] = KbQueueCheck; % checks for keys
            
            if pressed
                firstPress(find(firstPress==0)) = NaN; %little trick to get rid of 0s
                [endtime, keyInd] = min(firstPress); % gets the RT of the first key-press and its ID
                if ~isnan(firstPress(backSpaceKey)) && ~isempty(currentVal) %if backspace key then erase last entry
                    if blink % erase the last number, not the _
                        currentVal = [currentVal(1:end-2) '_'];
                    else
                        currentVal = currentVal(1:end-1);
                    end
                elseif any(allowed == keyInd) && length(currentVal) < (3+blink) % check that clicked key a number & the buffer isn't full
                    if any(allowed(11:end) == keyInd) % regular number buttons, rather than numpad buttons
                        keyInd = allowed(find(allowed == keyInd) - 10); % only display the number, not the symbol
                    end
                    if blink % add key to buffer; if blink is on, put the new char before the "_"
                        currentVal = [currentVal(1:end-1) KbName(keyInd) '_']; %add key to buffer
                    else
                        currentVal = [currentVal KbName(keyInd)]; %add key to buffer
                    end
                end
                eval(['boxVal' num2str(clickedBox) ' = currentVal;']) % save current buffer
            end
            
            if (GetSecs - startTime) > .2
                if blink
                    currentVal = currentVal(1:end-1); % remove _ in clicked box
                    blink = 0;
                else
                    currentVal = [currentVal '_']; % add an underscore to the clicked box)
                    blink = 1;
                end
                eval(['boxVal' num2str(clickedBox) ' = currentVal;']) % save current buffer
                startTime = GetSecs;
            end
            
            drawEverything(altImg,stimImgLoc,buttColors,buttRects,buttXpos,buttYpos,labelIndent,labelVshift,outLabels(:,trial),instrText2,2)
            Screen('Flip',win);
            
            [x,y,buttons] = GetMouse(screenID); % Check for mouse click
            if buttons(1,1) %left button->choosing
                whichNode = isOverNode(buttRects, x, y); % get index of clicked button
                if whichNode > 0
                    justClicked = 1;
                    if blink
                        currentVal = currentVal(1:end-1); % remove _ before saving
                        eval(['boxVal' num2str(clickedBox) ' = currentVal;']) % save current buffer
                    end
                    clickedBox = whichNode;
                    drawEverything(altImg,stimImgLoc,buttColors,buttRects,buttXpos,buttYpos,labelIndent,labelVshift,outLabels(:,trial),instrText2,2)
                    
                    if whichNode == size(buttRects,2) % clicked Proceed button
                        clickedIn = 0; % deactivate the current box
                        % check if values sum to 100
                        if nOuts == 5
                            respVals = [str2num(boxVal1), str2num(boxVal2), str2num(boxVal3), str2num(boxVal4), str2num(boxVal5)];
                        elseif nOuts == 9
                            respVals = [str2num(boxVal1), str2num(boxVal2), str2num(boxVal3), str2num(boxVal4), str2num(boxVal5), str2num(boxVal6), str2num(boxVal7), str2num(boxVal8), str2num(boxVal9)];
                        end

                        sumVal = sum(respVals);
                        if sumVal ~= 100 
                            DrawFormattedText(win, errorText2, 'center', stimImgLoc(4) + 580, errorColor); % draws error message
                        elseif length(respVals) ~= nOuts
                            DrawFormattedText(win, errorText3, 'center', stimImgLoc(4) + 580, errorColor); % draws error message
                        else
                            proceed2 = 1;
                        end
                    end
                    Screen('Flip',win);
                end
            end
            while any(buttons) % wait for release
                [x,y,buttons] = GetMouse;
            end
        end
    end
    % Save responses for this trial
    finalRespVals(:,trial) = respVals';
end % trials loop

pause(.1);

end % main function

function drawEverything(altImg,stimImgLoc,buttColors,buttRects,buttXpos,buttYpos,labelIndent,labelVshift,labelText,instrText,qNum)

global win black white ftmVal  boxVal1 boxVal2 boxVal3 boxVal4 boxVal5 boxVal6 boxVal7 boxVal8 boxVal9 stimType

Screen(win, 'FillRect', white); % clear screen

oldSize = Screen('TextSize', win, 28);
for l = 1:length(instrText)
    Screen('DrawText',win,instrText{l},30,30+l*30,black); %draws instructions
end
Screen('TextSize', win, oldSize);
Screen(win, 'PutImage', altImg, stimImgLoc); % Draw choice alternative image at top & center of screen
Screen('FillRect', win, buttColors, buttRects); % draw the buttons/boxes on screen
Screen('FrameRect', win, [200 200 200], buttRects); % draw the buttons/boxes on screen

for i = 1:size(buttRects,2)-1 % Draw buttons, labels, and values
    if qNum == 1
        if ~isempty(ftmVal) % don't try to draw the value if it's empty
            DrawFormattedText(win, num2str(ftmVal), buttRects(1,i)+10, buttYpos(i)+11, black);
        end
    elseif qNum == 2
        Screen('DrawText', win, labelText{i}, buttRects(1,i)-labelIndent, buttYpos(i)-labelVshift, black); % draw outcome labels
        if ~isempty(eval(['boxVal' num2str(i)])) % don't try to draw the value if it's empty
            %         Screen('DrawText', win, eval(['boxVal' num2str(i)]), buttXpos, buttYpos(i), black);
            DrawFormattedText(win, eval(['boxVal' num2str(i)]), buttRects(1,i)+10, buttYpos(i)+11, black);
        end
    end
end

DrawFormattedText(win, 'PROCEED', 'center', buttYpos(end)+10, white);
end

function whichNode = isOverNode(coords, x, y)
% check if mouse was clicked on a button; return index of clicked button, otherwise return 0
whichNode=0;
i=1;
% Check each button. I think I could replace 'while' w/ 'for' plus if(hit;'break')
while i <= size(coords,2) && ~whichNode
    if x>=coords(1,i) && x<=coords(3,i) && y>=coords(2,i) && y<=coords(4,i)
        whichNode=i;
    end
    i=i+1;
end
end