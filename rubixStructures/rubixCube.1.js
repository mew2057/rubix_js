/* ---------------
    iterativeAStar.js    
    A script for running the IDA* algorithm described in korf's paper.
   ----------------*/
AStar.goalState = RubixState.createWithGoalState();

function AStar()
{
    this.frontier = PriorityQueue({low: true});
}

AStar.prototype.iterativeAStar = function(initialState)
{
    var sequence =[];
    var depth = 0;
    var goalNode = null;
    console.log(RubixState.toString(initialState));

    for(var depth = 0; depth < 20; depth++)
    {
        if(RubixState.isEqual(initialState,AStar.goalState))
        {
            goalNode = initialState;
        } 
        else
        {
            goalNode = this.iterativeAStarDepthLimted(new RubixNode(initialState),depth);
        }
        
        if(goalNode)
        {           
            console.log(this.pathFromNode(goalNode));
            break;
        }
        else{
            console.log("The depth steadily increased.");
   
        }
    }

    return sequence;
};

// I find the do while to be more effective in a browser.
AStar.prototype.iterativeAStarDepthLimted = function(currentNode, depth)
{      
    
    if(currentNode.depth == depth && this.frontier.size() === 0)
    {
        return RubixState.isEqual(currentNode.rubixState,AStar.goalState) ? currentNode : null;
    }
    
    var localNode = currentNode;
    var successors = null;

    do{
        successors = localNode.getSuccessors();

        if(successors.length == 1)
        {
            return successors[0];
        }               
        //console.log(successors.length);
        for (var index = 0; index< successors.length; index++)
        {            
            if(successors[index].depth != depth)
            {
                this.frontier.push(successors[index],
                    //CubeHeuristics.heuristic(successors[index].rubixState) + 
                    successors[index].totalPathCost);    
               /* if( CubeHeuristics.heuristic(successors[index].rubixState) === 0)
                {
                    console.log( CubeHeuristics.heuristic(successors[index].rubixState));
                }*/
            }
    		/*
            else if (RubixState.isEqual(successors[index].rubixState,AStar.goalState))
            {
                return successors[index];   
            }*/
        }
        
        if(this.frontier.size() > 0)
        {
            localNode = this.frontier.pop();    
        }
        
         
        
        console.log("popped");
    }while(this.frontier.size() !== 0 && 
        !RubixState.isEqual(localNode.rubixState,AStar.goalState));
    
 
    return RubixState.isEqual(localNode.rubixState,AStar.goalState) ?localNode: null;  
};

AStar.prototype.pathFromNode = function(node)
{
    if(node.depth > 1)
    {
        console.log(node);
        return this.pathFromNode(node.parentNode) + ", " + RubixState.faceValues[node.nodeAction[0]] + ":" + node.nodeAction[1];
    }
    else if (node.depth === 1) 
    {
        console.log(node);
        return RubixState.faceValues[node.nodeAction[0]] + ":" + node.nodeAction[1];
    }
    else
    {
        return "It was already solved!";
    }
};
