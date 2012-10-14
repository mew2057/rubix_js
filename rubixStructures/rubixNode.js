/* -------------
    RubixNode.js
   --------------*/

//Each step only takes one move
RubixNode.stepCost = 1; 

//TODO add heuristic calculation to this.
function RubixNode(state,parent,action)
{
    this.rubixState = state;
    this.parentNode = parent;
    
    // This is a two tuple object containing a face and the number of rotations.
    this.nodeAction = action;
    
    if(parent)
    {        
        this.depth = parent.depth+1;
        this.totalPathCost = parent.totalPathCost+RubixNode.stepCost;
    }
    else
    {
        this.depth = this.totalPathCost = 0;
    }
}

/**
 * Retrieves and generates nodes for all possible states that may follow the 
 * invoking node's state.
 * @return The array of successors for the rubix cube, if a solution is found 
 *         within the array return the solution alone in an array.
 */
RubixNode.prototype.getSuccessors = function()
{
    //Initialize placeholders
    var successors = [];
    var tempNode = null;
    
    // For each face iterate over the three possible movements for the cube and 
    // Record them.
    for(var i = 0; i < 6; i++)
    {
        for(var j = 1; j < 4; j++)
        {
            // Create a new node with a copy of the data then rotate the state.
            tempNode = new RubixNode(this.rubixState.copy(), this, [i,j]);
            tempNode.rubixState.rotate(i,j);
            
            // If the derived state is valid return just that otherwise continue
            // building the successors.
            if(tempNode.rubixState.toString() === this.rubixState.toString())
            {
                return [tempNode];   
            }
            
            successors.push(tempNode);
        }   
    }    
    return successors;
};

RubixNode.prototype.compareTo = function(node)
{
    return this.totalPathCost - node.totalPathCost;
};


