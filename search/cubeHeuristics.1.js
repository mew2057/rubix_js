/* ----------
   cubeHeuristics.js
   ---------- */

function CubeHeuristics() {}

CubeHeuristics.goalState = RubixState.createWithGoalState();

CubeHeuristics.corners = [0, 2, 5, 7, 12, 14, 17, 19];
//6
CubeHeuristics.edges = [9, 10, 13, 15, 16, 18, 1, 3, 4, 6, 8, 11];
/*

CubeHeuristics.edgesTop = [9, 10, 13, 15, 16, 18];
CubeHeuristics.edgesBottom = [1, 3, 4, 6, 8, 11];*/
CubeHeuristics.test = function()
{
    console.log("TEST");
    var rubix = RubixState.createWithGoalState();
    
    var face, rots;
    
    
    for (var i = 0; i < 100; i++)
    {
        face = Math.floor(Math.random() * 6);
        rots = Math.floor(Math.random() * 3 + 1);
        
        RubixState.rotate(rubix, face, rots);        
    }
    
    //RubixState.rotate(rubix, 2, 1);
    
    console.log(RubixState.toString(rubix));
    
    var cornersH = CubeHeuristics.manhattanDistanceOfCorners(rubix);
    var edgesTopH = CubeHeuristics.manhattanDistanceOfTopEdges(rubix);
    var edgesBotH = CubeHeuristics.manhattanDistanceOfBottomEdges(rubix);
    
    console.log("Corners:  " + cornersH);
    console.log("EdgesTop: " + edgesTopH);
    console.log("EdgesBot: " + edgesBotH);
    console.log("EdgesAll: " + CubeHeuristics.manhattanDistanceOfAllEdges(rubix));
    console.log("Table H:  " + Math.max(cornersH, edgesTopH, edgesBotH));
};

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
    return CubeHeuristics.manhattanDistanceOfEdges(rubixState, CubeHeuristics.edges,0,6);
};

CubeHeuristics.manhattanDistanceOfBottomEdges = function(rubixState)
{
    return CubeHeuristics.manhattanDistanceOfEdges(rubixState, CubeHeuristics.edges,6,6);
};

CubeHeuristics.manhattanDistanceOfAllEdges = function(rubixState)
{
    return CubeHeuristics.manhattanDistanceOfEdges(rubixState,CubeHeuristics.edges, 0,12) //CubeHeuristics.edgesBottom.concat(CubeHeuristics.edgesTop));
};

CubeHeuristics.manhattanDistanceOfEdges = function(rubixState, edges,offset, size)
{
    var sum = 0, moves = 0, cubieIndex, goalIndex;//, rotation, alternateState, cubiesEqual;
    
    for (var index = offset; index < offset+size; index++)
    {        
        moves = 0;
        
        cubieIndex = RubixState.findCubie(CubeHeuristics.goalState, edges[index], rubixState);
        goalIndex = RubixState.findCubie(rubixState, cubieIndex, CubeHeuristics.goalState);
        
        // If it's a far side, need at least 2 moves to correct it's position.
        if ( CubeHeuristics.farSides[cubieIndex].indexOf(goalIndex) !== -1)
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
            /*
            cubiesEqual = false;
            rotation = CubeHeuristics.correctRotation[cubieIndex][goalIndex];
            
            alternateState = RubixState.copy(rubixState);
            
            for (var jndex = 0; jndex < rotation.length; jndex++)
            {
                RubixState.rotate(alternateState, rotation[jndex], rotation[++jndex]);
                
                if (RubixState.areCubiesEqual(rubixState, CubeHeuristics.goalState, cubieIndex))
                {
                    cubiesEqual = true;
                    break;
                }
            }
            
            if (!cubiesEqual)
                moves += 1;
            */
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
    var sum = 0, moves = 0, cubieIndex, goalIndex;//, rotation, alternateState;
 
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
            /*
            rotation = CubeHeuristics.correctRotation[cubieIndex][goalIndex];
            
            alternateState = RubixState.copy(rubixState);
            RubixState.rotate(alternateState, rotation[0], rotation[1]);
            
            if (!(RubixState.areCubiesEqual(rubixState, CubeHeuristics.goalState, cubieIndex)))
                moves += 1;
            */
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

/**
 * A map which produces the rotation(s) needed to move the cubie at a specific location
 * to the following position.
 * 
 * Usage: CubeHeuristics.correctRotation[current cubie location][target cubie location]
 * 
 * Returns an array of [face, rotations, (face, rotations)]
 */
CubeHeuristics.correctRotation = {
    0  : {
        2  : [0, 1, 5, 3],
        5  : [0, 3, 1, 1],
        7  : [0, 2],
        12 : [1, 2],
        17 : [1, 3, 5, 1],
        19 : [5, 2]
    },
    1  : {
        3  : [0, 3],
        4  : [0, 1],
        6  : [0, 2],
        8  : [5, 1],
        11 : [5, 1],
        18 : [5, 2]
    },
    2  : {
        0  : [5, 1, 0, 3],
        5  : [0, 2],
        7  : [0, 1, 3, 3],
        14 : [3, 2],
        17 : [5, 2],
        19 : [5, 3, 3, 1]
    },
    3  : {
        1  : [0, 1],
        4  : [0, 2],
        6  : [0, 3],
        8  : [1, 3],
        9  : [1, 1],
        15 : [1, 2]
    },
    4  : {
        1  : [0, 3],
        3  : [0, 2],
        6  : [0, 1],
        10 : [3, 3],
        11 : [3, 1],
        16 : [3, 2]
    },
    5  : {
        0  : [0, 1, 1, 3],
        2  : [0, 2],
        7  : [0, 3, 2, 1],
        12 : [1, 1, 2, 3],
        14 : [2, 2],
        17 : [1, 2]
    },
    6  : {
        1  : [0, 2],
        3  : [0, 1],
        4  : [0, 3],
        9  : [2, 3],
        10 : [2, 1],
        13 : [2, 2]
    },
    7  : {
        0  : [0, 2],
        2  : [0, 3, 3, 1],
        5  : [0, 1, 2, 3],
        12 : [2, 2],
        14 : [3, 3, 2, 1],
        19 : [3, 2]
    },
    8  : {
        1  : [5, 3],
        3  : [1, 1],
        9  : [1, 2],
        11 : [5, 2],
        15 : [1, 3],
        18 : [5, 1]
    },
    9  : {
        3  : [1, 3],
        6  : [2, 1],
        8  : [1, 2],
        10 : [2, 2],
        13 : [2, 3],
        15 : [1, 1]
    },
    10 : {
        4  : [3, 1],
        6  : [2, 3],
        9  : [2, 2],
        11 : [3, 2],
        13 : [2, 1],
        16 : [3, 3]
    },
    11 : {
        1  : [5, 1],
        4  : [3, 3],
        8  : [5, 2],
        10 : [3, 2],
        16 : [3, 1],
        18 : [5, 3]
    },
    12 : {
        0  : [1, 2],
        5  : [2, 1, 1, 3],
        7  : [2, 2],
        14 : [4, 1, 2, 3],
        17 : [1, 1, 4, 3],
        19 : [4, 2]
    },
    13 : {
        6  : [2, 2],
        9  : [2, 1],
        10 : [2, 3],
        15 : [4, 3],
        16 : [4, 1],
        18 : [4, 2]
    },
    14 : {
        2  : [3, 2],
        5  : [2, 2],
        7  : [2, 3, 3, 1],
        12 : [2, 1, 4, 3],
        17 : [4, 2],
        19 : [4, 1, 3, 3]
    },
    15 : {
        3  : [1, 2],
        8  : [1, 1],
        9  : [1, 3],
        13 : [4, 1],
        16 : [4, 2],
        18 : [4, 3]
    },
    16 : {
        4  : [3, 2],
        10 : [3, 1],
        11 : [3, 3],
        13 : [4, 3],
        15 : [4, 2],
        18 : [4, 1]
    },
    17 : {
        0  : [1, 1, 5, 3],
        2  : [5, 2],
        5  : [1, 2],
        12 : [4, 1, 1, 3],
        14 : [4, 2],
        19 : [4, 3, 5, 1]
    },
    18 : {
        1  : [5, 2],
        8  : [5, 3],
        11 : [5, 1],
        13 : [4, 2],
        15 : [4, 1],
        16 : [4, 3]
    },
    19 : {
        0  : [5, 2],
        2  : [5, 1, 3, 3],
        7  : [3, 2],
        12 : [4, 2],
        14 : [4, 3, 3, 1],
        17 : [4, 1, 5, 3]
    }
};