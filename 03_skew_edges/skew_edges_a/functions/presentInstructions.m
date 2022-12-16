function presentInstructions(~)

global MainWindow black

instructStr = 'In this experiment, you will be presented with four different coloured squares: red, yellow, green, and blue. \n Clicking on a coloured square will result in a number of points (depending on the one you choose). \n\n Press SPACE to continue.';
showInstructions(instructStr);

instructStr = 'On most trials you will be presented with two coloured squares to choose from. \n On some trials, however, you will be presented with one. \n\n On these trials you must select the single coloured square to continue. \n\n Press SPACE to continue.';
showInstructions(instructStr);

instructStr = 'Following the experiment, the outcome of one trial will be randomly selected. \n You will be given $1 for every ten points earned that trial. \n\n Press SPACE to continue.';
showInstructions(instructStr);

DrawFormattedText(MainWindow, '\n If you have any questions, then please ask the experimenter now.\n\n\n\n Otherwise, press SPACE to continue.', 'center', 500 , black);
Screen(MainWindow, 'Flip');
KbWait([], 2);

Screen(MainWindow, 'Flip');

end

function showInstructions(insStr)

global MainWindow scr_centre black
global screenBackgroundColour

instrWin = Screen('OpenOffscreenWindow', MainWindow, screenBackgroundColour);
Screen('TextFont', instrWin, 'Calibri');
Screen('TextSize', instrWin, 32);
Screen('TextStyle', instrWin, 1);

[~, ~, instrBox] = DrawFormattedText(instrWin, insStr, 'center', 'center' , black, [], [], [], 1.5);
instrBox_width = instrBox(3) - instrBox(1);
instrBox_height = instrBox(4) - instrBox(2);
textTop = 500;
destInstrBox = [scr_centre(1) - instrBox_width / 2   textTop   scr_centre(1) + instrBox_width / 2   textTop +  instrBox_height];
Screen('DrawTexture', MainWindow, instrWin, instrBox, destInstrBox);
Screen(MainWindow, 'Flip');

RestrictKeysForKbCheck(KbName('Space'));   % Only accept spacebar
KbWait([], 2);

Screen('Close', instrWin);

end



