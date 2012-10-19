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
    var successors = null;

    do{
        
        if(localNode.fn < depth)
        {
            successors = RubixNode.getSuccessors(localNode);
                
            for (var index = 0; index< successors.length; index++)
            {            
                if(successors[index].fn <= depth)
                {
                    this.frontier.insert(successors[index].fn, successors[index]);    
                }
            }
        }
        if(!this.frontier.isEmpty())
        {
            localNode = this.frontier.remove(); 
        }
        
        console.log("popped");
    }while(!this.frontier.isEmpty() && !RubixState.isEqual(localNode.rubixState, 
        AStar.goalState));
    
 
    return RubixState.isEqual(localNode.rubixState,AStar.goalState) ?localNode: null;  
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
    if(node.depth > 1)
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
