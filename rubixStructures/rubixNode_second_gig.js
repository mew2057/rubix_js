/* -------------
    RubixNode.js
    Requires - rubixState.js
    A node representation of state for search trees.
   --------------*/

RubixNode.nodePool = [];
RubixNode.faceCulling = {
    "0":4,
    "1":3,
    "2":5
};

/**
 * Defines an object to represent a node on the IDA* search tree for a rubik's cube.
 * @param state The state to be wrapped by the node.
 * @param parent Optional - The parent used in retrieving the path.
 * @param action Optional - The action that was taken to reach this node.
 *          Has the following bit pattern: -###-@@@ where -:null #:face @:rotations
 * 
 */
function RubixNode(state, parent, face, rots)
{
    this.init(state,parent,face, rots);    
}

RubixNode.prototype.init = function(state, parent, face, rots)
{
    if(this.rubixState)
    {
        this.rubixState.set(state);
    }
    else
    {
        this.rubixState = new Uint8Array().set(state);
    }
    
    this.nodeAction = null;

    if(face >= 0 && rots >= 0 )
    {
        this.nodeAction =  ((0 | face) << 4) | rots;
   
    }  
    
    this.parentNode = parent;
    
    
    if (parent)
    {        
        this.depth = parent.depth + 1;
        this.fn = this.depth + CubeHeuristics.heuristic(this.rubixState);

        parent.rc ++;
    }
    else
    {
        this.depth = 0;
        this.fn = CubeHeuristics.heuristic(this.rubixState);
        this.rc = 0;
    }
};
    
RubixNode.buildAndRotateNode  = function(node, parentNode, face, rots)
{
    if(node)
    {
        node.init(parentNode.state,parentNode, face, rots);
    }
    else
    {
        node = new RubixNode(parentNode.state, parentNode,  face, rots);
    }
    
    RubixState.rotate(node.rubixState, face, rots);
    
    return node;
};

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
            if(node.nodeAction && RubixNode.faceCulling[(node.nodeAction >> 4)] == i 
               && (2 - (node.nodeAction & 7 - 2)) == j)
            {
               continue;
            }
            // Create a new node with a copy of the data then rotate the state.          
            successors.push(
                RubixNode.buildAndRotateNode(RubixNode.nodePool.pop(), node, i, j));
        }   
    }    

    return successors;
};


RubixNode.wipeBadChain = function(node)
{
    if(node.parentNode)
    {   
        node.parentNode.rc--;
        if(node.parentNode.rc === 0 && node.parentNode.depth !== 0)
        {
            RubixNode.wipeBadChain(node.parentNode);    
        }
        node.parentNode = null;    
        node.nodeAction = null;
        node.rc = null;
        node.depth = null;
        node.fn = null;
        RubixNode.nodePool.push(node);
    }    
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
