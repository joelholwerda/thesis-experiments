
function presentInstructions(num)

global MainWindow black res currentBlock minInstrTime
global screenBackgroundColour nextLoc buttonColour 

% define instructions

% instructions for beginning of experiment
instructStr{1} = 'In this experiment, you will be presented with six different coloured squares: red, orange, yellow, green, blue, and purple. \n Clicking on a coloured square will result in winning a number of points (depending on the one you choose).';
instructStr{2} = 'Most of the time, you will be presented with two coloured squares to choose between. \n But sometimes, you will be presented with just one square, which you will have to select to continue.';
instructStr{3} = 'Your goal is to win as many points as possible. \n Every choice influences the amount of real money that you will earn.';
instructStr{4} = 'Following the experiment, you will be given $1 for every 5000 points earned during the task.';
instructStr{5} = 'If you have any questions, please ask the experimenter now.\n Otherwise, press Next when you are ready to begin.';

% instructions for first to mind task
instructStr{6} = 'You have finished the first section of this experiment! \n\n In the next section, you will be presented with each of the coloured squares from the previous section \n and asked questions about the outcomes (number of points) that you experienced.';
instructStr{7} = 'For each coloured square you will be asked which outcome (number of points) comes to mind first. \n Enter your answer in the textbox below the square and click PROCEED when you are finished.';

% instructions for percentage estiamtion task
instructStr{8} = 'You will now be presented with each coloured square again. \n\n This time, you will be asked to think ONLY about the times that you selected that square \n and write the PERCENTAGE of choices that resulted in each of the outcomes listed below the square.';
instructStr{9} = 'Enter your answer in the textbox below the square and click PROCEED when you are finished. \n Because your answers are percentages, they should add up to 100.';

% instructions for in between blocks
whichBlock = {'first', 'second', 'third', 'fourth', 'fifth'};
instructStr{10} = ['This is the end of the ', char(whichBlock(currentBlock)), ' block (out of five). \n Take a short break and press Next when you are ready to continue.'];

% define function that presents instructions

    function showInstructions(instr)
       instrWin = Screen('OpenOffscreenWindow', MainWindow, screenBackgroundColour);

       Screen('TextFont', instrWin, 'Calibri');
       Screen('TextSize', instrWin, 32);
       Screen('TextStyle', instrWin, 0);
      
       DrawFormattedText(instrWin, instructStr{instr}, 'center', 'center' , black, [], [], [], 1.5, []);
       
       Screen('DrawTexture', MainWindow, instrWin);
       Screen(MainWindow, 'Flip');
       
       nextLoc = [res(1) * 0.8, res(2) * 0.8, res(1) * 0.9, res(2) * 0.9];
       prevLoc = [res(1) * 0.1, res(2) * 0.8, res(1) * 0.2, res(2) * 0.9];
       buttonColour = [126, 165, 229];
       
       WaitSecs(minInstrTime); % pause before presenting next / previous buttons
       
       DrawFormattedText(instrWin, 'Next', 'center', 'center' , buttonColour, [], [], [], 1.5, [], nextLoc);
       
       if instruct > 1
           
       DrawFormattedText(instrWin, 'Previous', 'center', 'center' , buttonColour, [], [], [], 1.5, [], prevLoc);
       
       end
       
       Screen('DrawTexture', MainWindow, instrWin);
       Screen(MainWindow, 'Flip');
       
       [~, x, y, ~] = GetClicks(MainWindow, 0);
       
       if IsInRect(x, y, nextLoc)    % If they've clicked the 'next' button
           instruct = instruct + 1;
           Screen('Close', instrWin);
       elseif IsInRect(x, y, prevLoc) && instruct > 1   % If they've clicked the 'previous' button
           instruct = instruct - 1;
           Screen('Close', instrWin);
       end

    end

% loop through instructions

instruct = 1;

switch num

    case 1
    
        while instruct < 6
            
            if instruct == 1
                
                showInstructions(1)
                
                
            elseif instruct == 2
                
                showInstructions(2)
                
            elseif instruct == 3
                
                showInstructions(3)
                
                
            elseif instruct == 4
                
                showInstructions(4)

            
            elseif instruct == 5
                
                showInstructions(5)

            end
            
        end
            
     case 2

        while instruct < 3
            
            if instruct == 1
                
                showInstructions(6)
                
                
            elseif instruct == 2
                
                showInstructions(7)
                
            end
        end
                
    case 3
        while instruct < 3
            
            if instruct == 1
                
                showInstructions(8)
                
                
            elseif instruct == 2
                
                showInstructions(9)
            
                
            end
        end
        
    case 4
        
        showInstructions(10)
                
end

end


