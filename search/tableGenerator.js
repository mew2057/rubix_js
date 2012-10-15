
$(document).ready(function() {
    TableGenerator.generate();
});

function TableGenerator() {}

TableGenerator.generate = function()
{
    var rubix = CubeHeuristics.goalState.copy();
    
    var face = Math.floor(Math.random() * 6);
    var rots = Math.floor(Math.random() * 3 + 1);
    
    for (var i = 0; i < 5; i++)
    {
        rubix.rotate(face, rots);
        
        face = Math.floor(Math.random() * 6);
        rots = Math.floor(Math.random() * 3 + 1);
    }
    
    console.log(CubeHeuristics.goalState.toString(true));
    console.log(rubix.toString(true));
    
    console.log(CubeHeuristics.manhattanDistanceOfSides(rubix) + ":" + 
                CubeHeuristics.manhattanDistanceOfCorners(rubix));
    console.log(CubeHeuristics.heuristic(rubix));
};

// TODO