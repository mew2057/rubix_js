/* ----------
   cubeHeuristics.js
   ---------- */

function CubeHeuristics() {}

/**
 * Gives a heuristic for the supplied state.
 * @param rubixState the state to find a heuristic for.
 * @return The heuristic.
 */
CubeHeuristics.heuristic = function(rubixState)
{
    var heuristic = Math.max(Tables.cornersHeuristic(rubixState),
                             Tables.edgesTopHeuristic(rubixState),
                             Tables.edgesBottomHeuristic(rubixState));
    
    if (heuristic !== 0)
        return heuristic;
    
    // Korf rounds in his implementation.
    return Math.round(Math.max(CubeHeuristics.manhattanDistanceOfEdges(rubixState), 
                    CubeHeuristics.manhattanDistanceOfCorners(rubixState)));
};


/**
 * The function name is verbose for a reason.
 * @param rubixState The state to find the distance for.
 */
CubeHeuristics.manhattanDistanceOfEdges = function(rubixState)
{
    var sum = 0, moves = 0, cubie;

    for (var index = 8; index < 20; index++)
    {            
        cubie = rubixState[index] >> 3;
        
        /*
         *If the cubie is in the right place it is either zero or 3 moves from 
            being properly oriented.
         * Else if it's a far side it is 2 moves away.
         * else assume one move.
         */ 
        if (cubie === index)
        {            
            if (RubixState.cubieOutputMapping[index].faces[0] !== (rubixState[index] & 7))
            {
                moves = 3;
            }
            else
            {               
                moves = 0;
            }            
        }
        else if (CubeHeuristics.farSides[cubie].indexOf(index) !== -1)
        {
            moves = 2;
        }
        else
        {
            moves = 1;    
        }     
        
        sum += moves;
    }

    return sum / 4;
};

/**
 * The function name is verbose for a reason.
 * @param rubixState The state to find the distance for.
 */
CubeHeuristics.manhattanDistanceOfCorners = function(rubixState)
{
    var sum = 0, moves = 0, cubie;
 
    for (var index = 0; index < 8; index++)
    {                    
        cubie = rubixState[index] >> 3;
        
        /*
         *If the cubie is in the right place it is either zero or 3 moves from 
            being properly oriented.
         * Else if it's a far corner it is 2 moves away.
         * else assume one move.
         */ 
        if (cubie == index)
        {            
            if (RubixState.cubieOutputMapping[index].faces[0] !== (rubixState[index] & 7))
            {
                // I Think this should be 3 moves instead of 2, since no corner cubie may be fixed with only two.
                moves = 3;
            }
            else
            {
                moves = 0;    
            }
        }
        else if (CubeHeuristics.farCorners[index] === cubie)
        {
            moves = 2;
        }
        else
        {
            moves = 1;    
        }        
        sum += moves;
    }
    
    return sum / 4;
};

/**
 * A map defining the far corner of the given corner (i.e. the corner it will
 * take 2 moves to reach).
 */
CubeHeuristics.farCorners = {
    0 : 6,
    1 : 5,
    2 : 7,
    3 : 4,
    4 : 3,
    5 : 1,
    6 : 0,
    7 : 2
};

/**
 * A map defining the far sides of the given side (i.e. the sides it will
 * take 2 moves to reach). They are not in any particular order.
 */
CubeHeuristics.farSides = {
    8   : [ 18, 16, 17, 14, 13],
    9   : [ 14, 17, 18, 19, 15],
    10  : [ 12, 19, 16, 13, 17],
    11  : [ 16, 12, 19, 15, 18],
    12  : [ 17, 18, 14, 10, 11],
    13  : [  8, 10, 15, 19, 18],
    14  : [  8,  9, 12, 16, 19],
    15  : [  9, 11, 13, 17, 16],
    16  : [  8, 15, 10, 14, 11],
    17  : [  9, 12,  8, 10, 15],
    18  : [ 11, 13,  9, 12,  8],
    19  : [ 10, 14, 11, 13,  9]
};
