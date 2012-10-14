
$(document).ready(function() {
    
});

function TableGenerator() {}

// TODO

function CubeHeuristics() {}

CubeHeuristics.goalState = RubixState.initWithGoalState();

CubeHeuristics.heuristic = function(rubixState)
{
    return Math.max(CubeHeuristics.manhattanDistanceOfSides(),
                    CubeHeuristics.manhattanDistanceOfCorners());
};

/* 
Note if a corner cubie is in the right position but the faces are wrong, it will
take at least 2 moves to right it. 3 moves for sides.
*/

CubeHeuristics.manhattanDistanceOfSides = function(rubixState)
{
    var sum = 0, goalIndex;
    
    for (var index in rubixState.cubies)
    {
        if (rubixState.cubies[index].isCorner())
            continue;
        
        goalIndex = CubeHeuristics.goalState.findCubie(rubixState.cubies[index]);
        
        // TODO
    }
    
    // TODO - orientation - I think if the orientation doesn't match, it is still
    //   admissible to assume 1 extra move is needed if its distance away is only 1.
    
    return sum / 4;
};

CubeHeuristics.manhattanDistanceOfCorners = function(rubixState)
{
    var sum = 0, goalIndex;
    
    for (var index in rubixState.cubies)
    {
        if (rubixState.cubies[index].isSide())
            continue;
        
        goalIndex = CubeHeuristics.goalState.findCubie(rubixState.cubies[index]);
        
        if (CubeHeuristics.farCorners[index] === goalIndex)
            sum += 2;
        else
            sum += 1;
    }
    
    // TODO - orientation - I think if the orientation doesn't match, it is still
    //   admissible to assume 1 extra move is needed if its distance away is only 1.
    
    return sum / 4;
};

/**
 * A map defining the far corner of the given corner (i.e. the corner it will
 * take 2 moves to reach).
 */
CubeHeuristics.farCorners = {
    0  : 14,
    2  : 12,
    5  : 19,
    7  : 17,
    12 : 2,
    14 : 0,
    17 : 7,
    19 : 5
};

/**
 * A map defining the far sides of the given side (i.e. the sides it will
 * take 2 moves to reach). They are not in any particular order.
 */
CubeHeuristics.farSides = {
    1  : [16, 15, 13, 10, 9],
    3  : [10, 13, 16, 18, 11],
    4  : [8, 18, 15, 9, 13],
    6  : [15, 8, 18, 11, 16],
    8  : [13, 16, 10, 4, 6],
    9  : [1, 4, 11, 18, 16],
    10 : [1, 3, 8, 15, 18],
    11 : [3, 6, 9, 13, 15],
    13 : [3, 8, 1, 4, 11],
    15 : [1, 11, 4, 10, 6],
    16 : [6, 9, 3, 8, 1],
    18 : [4, 10, 6, 9, 3]
};