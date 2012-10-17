/* -------------
    RubixNode.js
   --------------*/



//TODO add heuristic calculation to this.
function RubixNode(state,parent,action)
{
    this.rubixState = state;
    this.parentNode = parent;
    
    // This is a two tuple object containing a face and the number of rotations.
    this.nodeAction = action ? ((0 | action[0]) << 4) | action[1] : null;
    
    if(parent)
    {        
        this.depth = parent.depth + 1;
        this.fn = CubeHeuristics.heuristic(this.rubixState) + this.depth;
    }
    else
    {
        this.depth = 0;
        this.fn = CubeHeuristics.heuristic(this.rubixState);
    }
}

/**
 * Retrieves and generates nodes for all possible states that may follow the 
 * invoking node's state.
 * @param node The node to retrieve successors for.
 * @return The array of successors for the rubix cube, if a solution is found 
 *         within the array return the solution alone in an array.
 */
RubixNode.getSuccessors = function(node)
{
    //Initialize placeholders
    var successors = [];
    var tempNode = null;
    
    // For each face iterate over the three possible movements for the cube and 
    // Record them.
    for(var i = 0; i < 6; i++)
    {
        if(node.nodeAction && i === node.nodeAction >> 4)
        {
            continue;
        }
        
        for(var j = 1; j < 4; j++)
        {
            // Create a new node with a copy of the data then rotate the state.
            tempNode = new RubixNode(RubixState.copy(node.rubixState), node, [i,j]);
            
            RubixState.rotate(tempNode.rubixState,i,j);

            successors.push(tempNode);
        }   
    }    

    return successors;
};
