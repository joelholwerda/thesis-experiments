
##----------------------------------------------------------
		Stimulus/Outcome Key
##----------------------------------------------------------

Stimulus 1: Gain  100% +20
Stimulus 2: Gain  50% +40 50% 0
Stimulus 3: Loss  100% -20
Stimulus 4: Loss  50% -40 50% 0

##----------------------------------------------------------
		  Trial Type Key
##----------------------------------------------------------

'G': Gain trial = 1
'L': Loss trial = 2
'C': Catch trial = 3
'S': Single trial = 4

##----------------------------------------------------------
		    Randomization
##----------------------------------------------------------

DATA.stimOrder  Codes the randomization of stimuli colors
DATA.outLabels  Order of outcomes during percentage memory task


##----------------------------------------------------------
		 Subject Choice Trials Data Files 
                      (DATA.choiceTrialInfo)
##----------------------------------------------------------

Column 1:	Condition (1 = ???; 2 = ???)
Column 2:	Trial Number
Column 3:	Block Number
Column 4:	Trial in Block
Column 5:	Trial Type (1 = 'G'; 2 = 'L'; 3 = 'C'; 4 = 'S')
Column 6:	stimA: stimulus presented on the left hand side of screen (see Stimulus key above)
Column 7:	stimB: stimulus presented on the right hand side of screen (see Stimulus key above)
Column 8:	outcome associated with stimulus A (see Stimulus key above)
Column 9: 	outcome associated with stimulus B (see Stimulus key above)
Column 10:	Option chosen (1 = Stimulus A; 2 = Stimulus B)
Column 11:	Feedback provided (outcome for option chosen)
Column 12:	Reaction time

##----------------------------------------------------------
		 Subject Memory Data Files
##----------------------------------------------------------

DATA.ftmVals	   "First to Mind" value for each stimulus
DATA.ftmRT	   RT for first click in the FTM response box
DATA.perceptResps  Percentages on trials for each outcome (see outLabels)	
DATA.percentRT     RT for first click in a percentage response box
