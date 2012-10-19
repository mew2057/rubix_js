
$(document).ready(function() {
    FileOperator.init();
    //TableGenerator.generate();
});

function TableGenerator() {}

TableGenerator.generate = function()
{
    var initialNode = new RubixNode(RubixState.createWithGoalState());
    var nodes = RubixNode.getSuccessors(initialNode), successors, index;
    
    var cornerData = new Uint8Array(50), edgeTopData = "", edgeBottomData = "";
    
    do 
    {
        for (index = 0; index < 1/*nodes.length*/; index++)
        {
            cornerData[0] = 
                CubeHeuristics.manhattanDistanceOfCorners(nodes[index].rubixState);
            
            console.log(RubixState.hash(nodes[index].rubixState, RubixState.corners));
            console.log(RubixState.toString(nodes[index].rubixState));
        }
        
    } while (false);
    
    var data = "";
    
    for (index = 0; index < cornerData.length; index++)
        data += cornerData[index];
    
    console.log(data);
    
    FileOperator.presentForDownload(data);
};

// TODO