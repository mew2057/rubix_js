/* ----------
   cubeHeuristics.js
   ---------- */

function CubeHeuristics() {}

CubeHeuristics.goalState = RubixState.createWithGoalState();

CubeHeuristics.corners = [0, 2, 5, 7, 12, 14, 17, 19];
CubeHeuristics.edgesTop = [9, 10, 13, 15, 16, 18];
CubeHeuristics.edgesBottom = [1, 3, 4, 6, 8, 11];

CubeHeuristics.heuristic = function(rubixState)
{
    return Math.max(CubeHeuristics.manhattanDistanceOfAllEdges(rubixState),
                    CubeHeuristics.manhattanDistanceOfCorners(rubixState));
};

/* 
Note if a corner cubie is in the right position but the faces are wrong, it will
take at least 2 moves to right it. 3 moves for sides.
*/

CubeHeuristics.manhattanDistanceOfTopEdges = function(rubixState)
{
    return CubeHeuristics.manhattanDistanceOfEdges(rubixState, CubeHeuristics.edgesTop);
};

CubeHeuristics.manhattanDistanceOfBottomEdges = function(rubixState)
{
    return CubeHeuristics.manhattanDistanceOfEdges(rubixState, CubeHeuristics.edgesBottom);
};

CubeHeuristics.manhattanDistanceOfAllEdges = function(rubixState)
{
    return CubeHeuristics.manhattanDistanceOfEdges(rubixState, CubeHeuristics.edgesBottom.concat(CubeHeuristics.edgesTop));
};

CubeHeuristics.manhattanDistanceOfEdges = function(rubixState, edges)
{
    var sum = 0, moves = 0, cubieIndex, goalIndex, farSides;
    
    for (var index = 0; index < edges.length; index++)
    {        
        moves = 0;
        
        cubieIndex = RubixState.findCubie(CubeHeuristics.goalState, edges[index], rubixState);
        goalIndex = RubixState.findCubie(rubixState, cubieIndex, CubeHeuristics.goalState);
        
        farSides = CubeHeuristics.farSides[cubieIndex];
        // If it's a far side, need at least 2 moves to correct it's position.
        if (farSides.indexOf(goalIndex) !== -1)
            moves = 2;
        // Otherwise, if it's not already in the correct position.
        else if (cubieIndex !== goalIndex)
            moves = 1;
        
        // Check orientation
        if (moves === 0) // Correct position but not necessarily orientation
        {
            if (!(RubixState.areCubiesEqual(rubixState, CubeHeuristics.goalState, cubieIndex)))
                moves += 3;
        }
        else if (moves === 1) // The one rotation may not achieve the correct orientation
        {
            // Rotate to correct position and check orientation.
        }
        
        sum += moves;
    }
    
    // TODO - orientation - I think if the orientation doesn't match, it is still
    //   admissible to assume 1 extra move is needed if its distance away is less than 1.
    //   Also, the only way to do this, at least from what I can see is to perform
    //   the rota2ion to correct it's position, then determine if the orientation is correct.
    return sum / 4;
};

CubeHeuristics.manhattanDistanceOfCorners = function(rubixState)
{
    var sum = 0, moves = 0, cubieIndex, goalIndex;
 
    for (var index = 0; index < CubeHeuristics.corners.length; index++)
    {            
        moves = 0;
        cubieIndex = RubixState.findCubie(CubeHeuristics.goalState, CubeHeuristics.corners[index], rubixState);
        goalIndex = RubixState.findCubie(rubixState, cubieIndex, CubeHeuristics.goalState);
        
        // If it's a far corner, need at least 2 moves to correct it's position.
        if (CubeHeuristics.farCorners[cubieIndex] === goalIndex)
            moves = 2;
        // Otherwise, if it's not already in the correct position.
        else if (cubieIndex !== goalIndex)
            moves = 1;
            
        // Check orientation
        if (moves === 0) // Correct position but not necessarily orientation
        {
            if (!(RubixState.areCubiesEqual(rubixState, CubeHeuristics.goalState, cubieIndex)))
                moves += 2;
        }
        else if (moves === 1) // The one rotation may not achieve the correct orientation
        {
            // Rotate to correct position and check orientation.
        }
        
        sum += moves;
    }
    
    // TODO - orientation - See above
    
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