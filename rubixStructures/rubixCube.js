
//Javascript has no enum functionality.
RubixState.YELLOW = 0;
RubixState.WHITE = 1;
RubixState.ORANGE = 2;
RubixState.RED = 3;
RubixState.BLUE = 4;
RubixState.GREEN = 5;

// This sets up the indicies in reference to a clockwise pattern.
RubixState.sideLookUpTable = [[5,6,7,10,14,13,12,9],
    [17,18,19,11,2,1,0,8],
    [12,13,14,16,19,18,17,15],
    [7,6,5,3,0,1,2,4],
    [14,10,7,4,2,11,19,16],
    [5,9,12,15,17,8,0,3]];
function RubixState()
{
    this.cubies = new Array(20);    
}

RubixState.initAsGoalState = function()
{
    var goalState = new RubixState();
    
    //Cubie reads based I how I drew it...
    goalState.mutableCubies = [
        [RubixState.WHITE, RubixState.GREEN, RubixState.RED],
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
        [RubixState.ORANGE, RubixState.WHITE, RubixState.BLUE]        
    ];
};

RubixState.prototype.rotate = function(face, rotations)
{
    var indicies = RubixState.sideLookUpTable[face];
    // Rotationis found by index + 2 % 9
    var tempArray,newIndex=null;
    
    for(var index in indicies)
    {
        newIndex = (index+(2*rotations))%9;
        
        tempArray[newIndex] = this.cubies[newIndex];
        
        if(!tempArray[index])
        {
            this.cubies[newIndex] = tempArray[newIndex];
        }
        else
        {
            this.cubies[newIndex] = this.cubies[index];
        }
    }
};

function Cubie(attributes)
{
    
}