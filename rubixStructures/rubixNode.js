/* -------------
    RubixNode.js
   --------------*/
function RubixNode(state,parent)
{
    this.rubixState = state;
    this.parentNode = parent;
    this.action = null;
    this.depth = null;
    this.pathCost = null;
    this.totalPathCost = 0;
}


