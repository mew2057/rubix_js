/* -------------
    RubixNode.js
    Requires - rubixState.js
    A node representation of state for search trees.
   --------------*/


/**
 * Defines an object to represent a node on the IDA* search tree for a rubik's cube.
 * @param state The state to be wrapped by the node.
 * @param parent Optional - The parent used in retrieving the path.
 * @param action Optional - The action that was taken to reach this node.
 *          Has the following bit pattern: -###-@@@ where -:null #:face @:rotations
 * 
 */
function RubixNode(state,parent,action)
{
    this.rubixState = state;
    this.parentNode = parent;
    
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
 * 
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

/**
 * Returns a String with the node action pair for the supplied node.
 * 
 * @param node the node that the action is to be retrieved from.
 * @return A String "face:rotations".
 */
RubixNode.nodeActionToString = function(node)
{
  return RubixState.faceValues[node.nodeAction >> 4] + ":" + (node.nodeAction & 7);  
};
