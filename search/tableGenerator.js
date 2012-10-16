
$(document).ready(function() {
    TableGenerator.generate();
});

function TableGenerator() {}

TableGenerator.generate = function()
{
    var rubix = RubixState.createWithGoalState();
    
//    var face = Math.floor(Math.random() * 6);
//    var rots = Math.floor(Math.random() * 3 + 1);
    
//    for (var i = 0; i < 5; i++)
//    {
//        RubixState.rotate(rubix, face, rots);
//        
//        face = Math.floor(Math.random() * 6);
//        rots = Math.floor(Math.random() * 3 + 1);
//    }

    RubixState.rotate(rubix, 0,1);
    //console.log(RubixState.toString(rubix));

    RubixState.rotate(rubix, 5,1);

    
    console.log(RubixState.toString(CubeHeuristics.goalState));
    console.log(RubixState.toString(rubix));
    
    //console.log(CubeHeuristics.manhattanDistanceOfSides(rubix) + ":" + 
    //            CubeHeuristics.manhattanDistanceOfCorners(rubix));
    //console.log(CubeHeuristics.heuristic(rubix));
};

// TODO