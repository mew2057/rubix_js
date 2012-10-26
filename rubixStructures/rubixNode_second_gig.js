/* -------------
    RubixNode.js
    Requires - rubixState.js
    A node representation of state for search trees.
   --------------*/

RubixNode.faceCulling = {
    "0" : 4,
    "1" : 3,
    "2" : 5
};

/**
 * Defines an object to represent a node on the IDA* search tree for a rubik's cube.
 * 
 * @param state The state to be wrapped by the node.
 * 
 * @param parent The parent used in retrieving the path.
 * 
 * @param face The face that was rotated by an action.
 * 
 * @param rots The rotations caried out in the action. (if this and face are 
 * supplied a rotation occurs)
 * 
 */
function RubixNode(state, parent, face, rots)
{
    this.rubixState = state;        
    this.nodeAction = null;
    this.rc = 0;


    // Rotate if an action is supplied.
    if (face >= 0 && rots >= 0 )
    {
        this.nodeAction =  ((0 | face) << 4) | rots;
        RubixState.rotate(this.rubixState, face, rots);   
    }  
    
    this.parentNode = parent;    
    
    if (parent)
    {        
        this.depth = parent.depth + 1;
        this.fn = this.depth + CubeHeuristics.heuristic(this.rubixState);
        parent.rc++;
    }
    else
    {
        this.fn = CubeHeuristics.heuristic(this.rubixState);
        this.depth = 0;
    }   
}

/**
 * Retrieves and generates nodes for all possible states that may follow the 
 * invoking node's state.
 * 
 * @param node The node to retrieve successors for.
 * 
 * @return The array of successors for the rubix cube, if a solution is found 
 *         within the array return the solution alone in an array.
 */
RubixNode.getSuccessors = function(node)
{
    var successors = [];
    
    // For each face iterate over the three possible movements for the cube and 
    // Record them.
    for (var i = 0; i < 6; i++)
    {
        /* 
         * Do the face culling. Prevent redundant face rotations with the first condition.
         * The second condition prevents duplicate states from arising due to rotating
         * opposing faces.
         */
        if (node.nodeAction && (i === node.nodeAction >> 4 ||
            (i > 2  && RubixNode.faceCulling[(node.nodeAction >> 4)] == i)))
        {
            continue;
        }
        
        for (var j = 1; j < 4; j++)
        {
            successors.push(new RubixNode(RubixState.copy(node.rubixState), 
                node, i, j));
        }   
    }    
    
    node = null;
    return successors;
};

/**
 * Retrieves and generates nodes for all possible states that may follow the 
 * invoking node's state.
 * 
 * @param node The node to retrieve successors for.
 * @param successors The Array the successors are to be placed in.
 * @return The array of successors for the rubix cube, if a solution is found 
 *         within the array return the solution alone in an array.
 */
RubixNode.getSuccessors = function(node, successors)
{
    successors.length = 0;
    
    
    // For each face iterate over the three possible movements for the cube and 
    // Record them.
    for (var i = 0; i < 6; i++)
    {
        /* 
         * Do the face culling. Prevent redundant face rotations with the first condition.
         * The second condition prevents duplicate states from arising due to rotating
         * opposing faces.
         */
        if (node.nodeAction && (i === node.nodeAction >> 4 ||
            (i > 2  && RubixNode.faceCulling[(node.nodeAction >> 4)] == i)))
        {
            continue;
        }
        
        for (var j = 1; j < 4; j++)
        {
            successors.push(new RubixNode(RubixState.copy(node.rubixState), 
                node, i, j));
        }   
    }    
    
    node = null;
};

/**
 * Wipes out a useless node from the tree and adds it to the node pool for reuse.
 * If the parent node has no more children after this removal cascade up.
 * 
 * @param node The node to remove.
 */
RubixNode.wipeBadChain = function(node)
{
    // If not the root of the search.
    if (node.parentNode)
    {  
        // Decrement the parent and check to see if it needs a wipe.
        node.parentNode.rc--;            

        if (node.parentNode.rc === 0 && node.parentNode.depth !== 0)
        {
            RubixNode.wipeBadChain(node.parentNode);    
        }
        
        // Prep and load the node into the pool.
        node.rubixState = null;
        node.parentNode = null;    
        node.nodeAction = null;
        node.rc = null;
        node.depth = null;
        node.fn = null;
    }    
};

/**
 * Returns a String with the node action pair for the supplied node.
 * 
 * @param node the node that the action is to be retrieved from.
 * 
 * @return A String "face:rotations".
 */
RubixNode.nodeActionToString = function(node)
{
    return RubixState.faceValues[node.nodeAction >> 4] + ":" + (node.nodeAction & 7);  
};
