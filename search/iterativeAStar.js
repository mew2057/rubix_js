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
    var goalNode = 0;

            console.log(AStar.goalState.toString(true));
                        console.log(initialState.toString(true));


    for(var depth = 0; depth < 3; depth++)
    {
        if(initialState.toString() === AStar.goalState.toString())
        {
            console.log("ended");
            break;    
        }  
        console.log("the depth steadily increased.");
        
        goalNode = this.iterativeAStarDepthLimted(new RubixNode(initialState),depth);
        console.log(goalNode);
        if(goalNode)
        {
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
            if(successors[index].depth != depth)
            {
                this.frontier.push(successors[index],successors[index].totalPathCost);
            }
        }
    
       // console.log(localNode.rubixState.toString(true));
        
        if(this.frontier.size() > 0)
        {
            localNode = this.frontier.pop();    
        }
    
    }while(this.frontier.size() !== 0 && 
        localNode.rubixState.toString() != AStar.goalState.toString());
    
 
    return localNode.rubixState.toString() === AStar.goalState.toString()?localNode: null;  
};
