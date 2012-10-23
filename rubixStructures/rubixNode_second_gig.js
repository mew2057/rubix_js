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
 *
 * 
 */
function RubixNode(state, parent, face, rots,createCopyState)
{
    this.init(state,parent,face, rots,createCopyState);    
}

RubixNode.prototype.init = function(state, parent, face, rots, createCopyState)
{
    if(createCopyState)
    {
       // console.log("copyState",state);
        this.rubixState = RubixState.copy(state);
    }
    else if(this.rubixState)
    {        
        this.rubixState.set(state);
    }
    else
    {
        this.rubixState = state;    
    }
    
    this.nodeAction = null;

    if(face >= 0 && rots >= 0 )
    {
        this.nodeAction =  ((0 | face) << 4) | rots;
        RubixState.rotate(this.rubixState, face, rots);   
    }  
    
    this.parentNode = parent;
    
    
    if (parent)
    {        
        this.depth = parent.depth + 1;
        this.fn = this.depth; //+ CubeHeuristics.heuristic(this.rubixState);

        parent.rc ++;
    }
    else
    {
        this.depth = 0;
        this.fn =0;// CubeHeuristics.heuristic(this.rubixState);
        this.rc = 0;
    }
};
    
RubixNode.buildAndRotateNode  = function(node, parentNode, face, rots)
{
            //console.log("new node");

    if(node)
    {
        node.init(parentNode.rubixState,parentNode, face, rots);
    }
    else
    {
        node = new RubixNode(parentNode.rubixState, parentNode, face, rots,true);
    }
    
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