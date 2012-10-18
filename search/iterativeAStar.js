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
    if(!initialState)
        return "Bad Cube";
    var sequence ="";
    var depth = 0;
    var goalNode = null;
    var initialNode = new RubixNode(initialState);
    
    depth = initialNode.fn;

    while(!goalNode)
    {
        if(RubixState.isEqual(initialState,AStar.goalState))
        {
            goalNode = initialState;
        } 
        else
        {
            goalNode = this.iterativeAStarDepthLimted(new RubixNode(initialState),depth);
        }
        
        depth ++;
        
        console.log("The depth steadily increased:" + depth);
    }
    
    console.log(this.pathFromNode(goalNode));
    sequence =this.pathFromNode(goalNode);

    return sequence;
};

// I find the do while to be more effective in a browser.
AStar.prototype.iterativeAStarDepthLimted = function(currentNode, depth)
{      
    
    if(currentNode.fn == depth && this.frontier.size() === 0)
    {
        return RubixState.isEqual(currentNode.rubixState,AStar.goalState) ? currentNode : null;
    }
    
    var localNode = currentNode;
    var successors = null;

    do{
        
        if(localNode.fn < depth)
        {
            successors = RubixNode.getSuccessors(localNode);

                
            for (var index = 0; index< successors.length; index++)
            {            
                if(successors[index].fn <= depth)
                {
                    this.frontier.push(successors[index],
                        successors[index].fn);    
                }
            }
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
        return this.pathFromNode(node.parentNode) + ", " + RubixState.faceValues[node.nodeAction >> 4] + ":" + (node.nodeAction & 7);
    }
    else if (node.depth === 1) 
    {
        return RubixState.faceValues[node.nodeAction >> 4] + ":" + (node.nodeAction & 7);
    }
    else
    {
        return "It was already solved!";
    }
};
