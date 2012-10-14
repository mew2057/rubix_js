
//Javascript has no enum functionality.
RubixState.RED =0;
RubixState.GREEN = 1;
RubixState.YELLOW = 2;
RubixState.BLUE = 3;
RubixState.ORANGE = 4;
RubixState.WHITE = 5;


// This sets up the indicies in reference to a clockwise pattern.
RubixState.sideLookUpTable = [
    [7,6,5,3,0,1,2,4],         // RED
    [5,9,12,15,17,8,0,3],      // GREEN
    [5,6,7,10,14,13,12,9],     // YELLOW
    [14,10,7,4,2,11,19,16],    // BLUE
    [12,13,14,16,19,18,17,15], // ORANGE
    [17,18,19,11,2,1,0,8]      // WHITE
];

function RubixState()
{
    this.cubies = new Array(20);    
}

// Just realized this can be invalid...
/* 
    0: W|G|R
    1: W|R
    2: W|R|B
    3: G|R
    4: R|B
    5: R|G|Y
    6: R|Y
    7: R|Y|B
    8: W|G
    9: G|Y
    10: Y|B
    11: B|W
    12: Y|G|O
    13: Y|O
    14: Y|O|B
    15: G|B
    16: O|B
    17: O|G|W
    18: O|W
    19: O|W|B
*/
RubixState.initAsGoalState = function()
{
    var goalState = new RubixState();
    
    // Cubie reads based I how I drew it...
    goalState.cubies = [/* 0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19*/];
    
        /*[RubixState.WHITE, RubixState.GREEN, RubixState.RED],
        [RubixState.WHITE, RubixState.RED],
        [RubixState.WHITE, RubixState.RED, RubixState.BLUE],
        [RubixState.GREEN, RubixState.RED],
        [RubixState.RED, RubixState.BLUE],
        [RubixState.RED, RubixState.GREEN, RubixState.YELLOW],
        [RubixState.RED, RubixState.YELLOW],
        [RubixState.RED, RubixState.YELLOW, RubixState.BLUE],
        [RubixState.WHITE, RubixState.GREEN],
        [RubixState.GREEN, RubixState.YELLOW],
        [RubixState.YELLOW, RubixState.BLUE],
        [RubixState.BLUE, RubixState.WHITE],
        [RubixState.YELLOW, RubixState.GREEN, RubixState.ORANGE],
        [RubixState.YELLOW, RubixState.ORANGE],
        [RubixState.YELLOW, RubixState.ORANGE, RubixState.BLUE],
        [RubixState.GREEN, RubixState.BLUE],
        [RubixState.ORANGE, RubixState.BLUE],
        [RubixState.ORANGE, RubixState.GREEN, RubixState.WHITE],
        [RubixState.ORANGE, RubixState.WHITE],
        [RubixState.ORANGE, RubixState.WHITE, RubixState.BLUE]        */
        return goalState;
};

RubixState.initFromArray = function(layout)
{
    var state = new RubixState();
    console.log(layout);
    return state;
};

//cubie motion is correct, but orientation is missing.
RubixState.prototype.rotate = function(face, rotations)
{
    var indicies = RubixState.sideLookUpTable[face];
    // Rotationis found by index + 2 % 9
    var tempArray,newIndex=null;
    
    for(var index in indicies)
    {
        newIndex = (index+(2*rotations))%9;
        
        tempArray[newIndex] = this.cubies[newIndex];
        /*
        if(!tempArray[index])
        {
            this.cubies[newIndex] = tempArray[newIndex];
        }
        else
        {
            this.cubies[newIndex] = this.cubies[index];
        }*/
    }
};



function Cubie(attributes)
{
    
}