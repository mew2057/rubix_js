/* ---------------
    iterativeAStar.js    
    Requires - priorityQueue.js, rubixNode.js, rubixState.js
    A script for running the IDA* algorithm described in korf's paper.
   ----------------*/
AStar.goalState = RubixState.createWithGoalState();

function AStar()
{
    this.frontier = new PriorityMinQueue();
}

/**
 * Runs IDA* on a RubixState object supplied by the user.
 * 
 * @param initialState A valid RubixState to find a solution to.
 * @return A string containing the necessary sequence of moves to achieve a goal state.
 */
AStar.prototype.iterativeAStar = function(initialState)
{
    if(!initialState)
        return "Bad Cube";
    var sequence ="";
    var depth = 0;
    var goalNode = null;
    /*
    for (var i = 0; i < 6; i ++)
    {
        RubixState.rotate(initialState,Math.floor(Math.random()*6), Math.floor(Math.random()*3 + 1));  
    }*/
    
    console.log(RubixState.toString(initialState));

    var initialNode = new RubixNode(initialState);
    
    
    depth = initialNode.fn;
    
    while(!goalNode)
    {
        //TODO get Garbage collection to run here...
        for(var index in this.record)
        {
            this.record.pop().parent = null;    
        }
        
        if(RubixState.isEqual(initialState,AStar.goalState))
        {
            goalNode = initialState;
        } 
        else
        {
            goalNode = this.iterativeAStarDepthLimted(new RubixNode(initialState),depth);
        }
        
        depth ++;
        this.frontier = new PriorityMinQueue();
        
        if(!goalNode)
        {    
            $("#outputDiv").text("The depth steadily increased:" + depth);

            console.log("The depth steadily increased:" + depth);
        }
            
    }
    
    console.log(this.pathFromNode(goalNode));
    sequence =this.pathFromNode(goalNode);
    
    return sequence;
};

/**
 * @brief Performs the IDA* search using a do while loop and Priority min queue. 
 * 
 * Each iteration of the search checks to see if the current node f(n) is less than
 * the limit imposed by the depth. If this evaluates to true new nodes may be spawned.
 * The spawned nodes are then added to a min priority queue if their f(n) does not exceed the
 * depth. The frontier is then checked if it is empty and if not a new node is 
 * pulled from the priority queue. The loop is exited if the priority queue is empty
 * or a goal state is found.
 * 
 * @param currentNode The initial node containing the state to find a solution for.
 * @param depth The noninclusive maximum f(n) of a node that may be expanded.
 * 
 * @return The goal node if found or null.
 */
AStar.prototype.iterativeAStarDepthLimted = function(currentNode, depth)
{      
    var localNode = currentNode;
    var isGoal = false;
    var successors = null, size = 0, index = 0;

    do {
        if(localNode.fn < depth)
        {
            successors = RubixNode.getSuccessors(localNode);        
            
            for (index = 0, size = successors.length; index< successors.length; index++)
            {        
                if(successors[index].fn <= depth)
                {
                    this.frontier.insert(successors[index].fn, successors[index]);    
                }
                else
                {        
                    RubixNode.wipeBadChain(successors[index]);   
                }
            }
        }
        else
        {
            RubixNode.wipeBadChain(localNode);
        }
        
        
        if(!this.frontier.isEmpty())
        {
            //this.record.push(localNode);
            localNode = null;
            localNode = this.frontier.remove(); 
        }
        
        isGoal = RubixState.isEqual(localNode.rubixState, AStar.goalState);

       console.log("popped");
    }while(!this.frontier.isEmpty() && !isGoal);
    
    return isGoal ? localNode : null;  
};

/**
 * Recursively generates a path from the goal node.
 * 
 * @param node The goal node the path is reuired from.
 * @return The string containing the sequence.
 */
AStar.prototype.pathFromNode = function(node)
{
    // If the depth is > 1 recursion must be done.
    // else if the depth is 1 the action sequence is done.
    // else the cube was already solved when it reached this search.
    if (node.depth > 1)
    {
        return this.pathFromNode(node.parentNode) + ", " + RubixNode.nodeActionToString(node);
    }
    else if (node.depth === 1) 
    {
        return RubixNode.nodeActionToString(node);
    }
    else
    {
        return "It was already solved!";
    }
};
