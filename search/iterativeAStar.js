
function IterativeAStar(initialState, goalState)
{
    var sequence =[];
    var depth = 0;
    var goalNode = 0;
    
    while(true)
    {
        //TODO make a node class.
        goalNode = IterativeAStarRecursive(initialState,goalState,depth);
        
        if(goalNode)
        {
            sequence = getPathFromNode(goalNode);    
        }  
    }
    
    return sequence;
}

function IterativeAStarRecursive(currentNode, goalState, depth)
{
    var successors = currentNode.getSuccessors();
    
    for (var index in successors)
    {
        successors[index];    
    }
    
    
}


function getPathFromNode(node)
{
 //recursion goes here.   
}