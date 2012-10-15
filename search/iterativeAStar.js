/* ---------------
    iterativeAStar.js    
    A script for running the IDA* algorithm described in korf's paper.
   ----------------*/
AStar.goalState = RubixState.initWithGoalState();

function AStar()
{
    this.frontier = PriorityQueue({low: true});
    this.counts = [0,0,0,0,0];
}

AStar.prototype.iterativeAStar = function(initialState)
{
    var sequence =[];
    var depth = 0;
    var goalNode = null;
    console.log(initialState.toString(true));

    for(var depth = 0; depth < 3; depth++)
    {
        if(initialState.toString() === AStar.goalState.toString())
        {
            break;    
        }  
        console.log("The depth steadily increased.");
        
        goalNode = this.iterativeAStarDepthLimted(new RubixNode(initialState),depth);
console.log(goalNode);
        if(goalNode)
        {
            console.log("goal");
            console.log(this.pathFromNode(goalNode));
            break;
        }
    }

    return sequence;
};

// I find the do while to be more effective in a browser.
AStar.prototype.iterativeAStarDepthLimted = function(currentNode, depth)
{      
    
    if(currentNode.depth == depth && this.frontier.size() === 0)
    {
        return (currentNode.toString() === AStar.goalState.toString())?currentNode:null;
    }
    
    var localNode = currentNode;
    var successors = null;

    
    do{
        successors = localNode.getSuccessors();

        if(successors.length == 1)
        {
            return successors[0];
        }               
        
        for (var index in successors)
        {
            if(successors[index].toString(false,false) 
                === AStar.goalState.toString(false,false))
            {
                return successors[index];   
            }
            if(successors[index].depth != depth)
            {
                this.frontier.push(successors[index],successors[index].totalPathCost);
            }
        }
            
        if(this.frontier.size() > 0)
        {
            localNode = this.frontier.pop();    
        }
    
    }while(this.frontier.size() !== 0 && 
        localNode.rubixState.toString(false,false) != AStar.goalState.toString(false,false));
    
 
    return localNode.rubixState.toString() === AStar.goalState.toString()?localNode: null;  
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
        return RubixState.faceValues[node.nodeAction[0]] + ":" + node.nodeAction[1];
    }
};
