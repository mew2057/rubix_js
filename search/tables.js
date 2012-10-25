
$(document).ready(function() {
    FileOperator.init();
});

/**
 * Handles interaction with the tables.
 */
function Tables() {}

Tables.cornersDbSize = 88179840;
Tables.edgesDbSize = 42577920;

Tables.cornerDatabase = null;
Tables.edgesTopDatabase = null;
Tables.edgesBottomDatabase = null;

/**
 * Loads the tables into memory
 */
Tables.load = function()
{
    if (!Tables.cornerDatabase)
        Tables.cornerDatabase = new PatternDatabase(Tables.cornersDbSize);
    
    Tables.cornerDatabase.loadFromFile("tables/corners_table_depth5.txt");
    
    // TODO - edges
};

/**
 * Given a rubix state, returns the corners table heuristic.
 * @param rubixState the state
 * @return the corner table heuristic
 */
Tables.cornerHeuristic = function(rubixState)
{
    var key = RubixState.hashCorners(rubixState);
    var value = Tables.cornerDatabase.get(key);
    
    return value == null ? 0 : value;
};

/**
 * Handles table generation.
 */
function TableGenerator() {}

// The maximum depths to go to with each search algorithm
TableGenerator.breadthDepth = 4;
TableGenerator.dlsDepth = 8;

/**
 * Generates the heuristic tables.
 */
TableGenerator.generate = function()
{     
    Tables.cornerDatabase = new PatternDatabase(Tables.cornersDbSize);
//    Tables.edgesTopDatabase = new PatternDatabase(Tables.edgesDbSize);
//    Tables.edgesBottomDatabase = new PatternDatabase(Tables.edgesDbSize);
    
    var initialNode = new RubixNode(RubixState.createWithGoalState());
  
    // Combined
    TableGenerator.generateCombined(initialNode);
  
    // Breadth first
//    TableGenerator.generateBreadth(initialNode);
    
    // Depth Limited
//    TableGenerator.generateDLS(initialNode);

    FileOperator.presentForDownload(Tables.cornerDatabase);
//    FileOperator.presentForDownload(Tables.edgesTopDatabase, "edgesTopTable.txt");
//    FileOperator.presentForDownload(Tables.edgesBottomDatabase, "edgesBottomTable.txt");
    console.log("DONE!");
};

TableGenerator.generateCombined = function(node)
{
    var nodes = TableGenerator.generateBreadth(node);
    
    console.log("NODES to DLS: " + nodes.length);
    for (var index = 0; index < nodes.length; index++)
    {
        TableGenerator.generateDLS(nodes[index]);
        if (index % 10000 === 0)
            console.log("DLS iteration: " + index);
    }
};

TableGenerator.numNodes = 1;

/**
 * Performs table generation using a depth-liminited algorithm starting with the
 * specified node.
 * @param node the node to start the search at
 */
TableGenerator.generateDLS = function(node)
{    
    var key, value;
    
    // Corners
    key = RubixState.hashCorners(node.rubixState);
    value = Tables.cornerDatabase.get(key);
    
    if (value === 0 || value > node.depth)
        Tables.cornerDatabase.set(key, node.depth);
    else // State already enumerated
        return;
/*  
    // Edges Top
    key = RubixState.hashCode(node.rubixState, RubixState.edgesTop) % Tables.edgesDbSize;
    value = Tables.edgesTopDatabase.get(key);
    
    if (value === 0 || value > node.depth)
        Tables.edgesTopDatabase.set(key, node.depth);
    
    // Edges Bottom
    key = RubixState.hashCode(node.rubixState, RubixState.edgesBottom) % Tables.edgesDbSize;
    value = Tables.edgesBottomDatabase.get(key);
    
    if (value === 0 || value > node.depth)
        Tables.edgesBottomDatabase.set(key, node.depth);
*/    
    
    // Base case
    if (node.depth === TableGenerator.dlsDepth)
        return;
    
    var successors = RubixNode.getSuccessors(node);
    
    for (var index = 0; index < successors.length; index++)
    {
        TableGenerator.generateDLS(successors[index]);
        RubixNode.wipeBadChain(successors[index]);
    }
    
    if (TableGenerator.numNodes++ % 1000000 === 0)
        console.log((TableGenerator.numNodes - 1) / 1000000 + "M");
};

/**
 * Performs table generation using a breadth-first search algorithm starting 
 * with the specified node.
 * @param node the node to start the search at
 */
TableGenerator.generateBreadth = function(node)
{    
    var nodes = RubixNode.getSuccessors(node), successors = [], theseSuccessors, depth, index, jndex;
    var key, value;
    
    for (depth = 1; depth <= TableGenerator.breadthDepth; depth++)
    {        
        for (index = 0; index < nodes.length; index++)
        {
            key = RubixState.hashCorners(nodes[index].rubixState);// % Tables.cornersDbSize;
            value = Tables.cornerDatabase.get(key);
            
            // Do not replace existing value as that will effect an inadmissible heuristic.
            if (value === 0 || value > nodes[index].depth)
                Tables.cornerDatabase.set(key, nodes[index].depth);
            else // State already enumerated
            {
                RubixNode.wipeBadChain(nodes[index]);
                continue;
            }
            
            // TODO - edges
            
            theseSuccessors = RubixNode.getSuccessors(nodes[index]);
            RubixNode.wipeBadChain(nodes[index]);
            for (jndex = 0; jndex < theseSuccessors.length; jndex++)
                successors.push(theseSuccessors[jndex]);         
            
            if (index % 100000 === 0)
                console.log("Depth: " + depth + "  Node: " + index + "  Successors: " + successors.length);
        }
        
        nodes = successors.slice(0);
        successors.length = 0; // Clear array
    }
    
    return nodes;
};
