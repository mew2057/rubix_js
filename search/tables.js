
$(document).ready(function() {
    if (!FileOperator.operator)
        FileOperator.init();
        
    Tables.load();
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
 * Loads the pattern databases into memory.
 */
Tables.load = function()
{
    if (!Tables.cornerDatabase)
        Tables.cornerDatabase = new PatternDatabase(Tables.cornersDbSize);
        
    if (!Tables.edgesTopDatabase)
        Tables.edgesTopDatabase = new PatternDatabase(Tables.edgesDbSize);
        
    if (!Tables.edgesBottomDatabase)
        Tables.edgesBottomDatabase = new PatternDatabase(Tables.edgesDbSize);
    
    Tables.cornerDatabase.loadFromFile("tables/corners_table_depth8.txt");
    Tables.edgesTopDatabase.loadFromFile("tables/edges_top_table_depth6.txt");
    Tables.edgesBottomDatabase.loadFromFile("tables/edges_bottom_table_depth6.txt");
};

/**
 * Given a rubix state, returns the corners table heuristic.
 * 
 * @param rubixState the state
 * 
 * @return the corner table heuristic
 */
Tables.cornersHeuristic = function(rubixState)
{
    if (!Tables.cornerDatabase)
        return 0;
    
    var key = RubixState.hashCorners(rubixState);
    var value = Tables.cornerDatabase.get(key);
    
    return value == null ? 0 : value;
};

/**
 * Given a rubix state, returns the top edges table heuristic.
 * 
 * @param rubixState the state
 * 
 * @return the top edges table heuristic
 */
Tables.edgesTopHeuristic = function(rubixState)
{
    if (!Tables.edgesTopDatabase)
        return 0;
    
    var key = RubixState.hashTopEdges(rubixState);
    var value = Tables.edgesTopDatabase.get(key);
    
    return value == null ? 0 : value;
};

/**
 * Given a rubix state, returns the bottom edges table heuristic.
 * 
 * @param rubixState the state
 * 
 * @return the bottom edges table heuristic
 */
Tables.edgesBottomHeuristic = function(rubixState)
{
    if (!Tables.edgesBottomDatabase)
        return 0;
    
    var key = RubixState.hashBottomEdges(rubixState);
    var value = Tables.edgesBottomDatabase.get(key);
    
    return value == null ? 0 : value;
};

/**
 * Handles table generation.
 */
function TableGenerator() {}

// Table to generate: 0 corners, 1 edges top, 2 edges bottom
TableGenerator.tableToGenerate = 0;

// Search type: 0 combined, 1 breadth-first only, 2 depth-limited only
TableGenerator.searchType = 0;

// The maximum depths to go to with each search algorithm
TableGenerator.breadthDepth = 4;
TableGenerator.dlsDepth = 5;

/**
 * Generates the heuristic tables.
 */
TableGenerator.generate = function()
{     
    if (TableGenerator.tableToGenerate === 0)
        Tables.cornerDatabase = new PatternDatabase(Tables.cornersDbSize);
    else if (TableGenerator.tableToGenerate === 1)
        Tables.edgesTopDatabase = new PatternDatabase(Tables.edgesDbSize);
    else if (TableGenerator.tableToGenerate === 2)
        Tables.edgesBottomDatabase = new PatternDatabase(Tables.edgesDbSize);
    
    var initialNode = new RubixNode(RubixState.createWithGoalState());
  
    if (TableGenerator.searchType === 0)
        TableGenerator.generateCombined(initialNode);
    else if (TableGenerator.searchType === 1)
        TableGenerator.generateBreadth(initialNode);
    else if (TableGenerator.searchType === 2)
        TableGenerator.generateDLS(initialNode);

    if (TableGenerator.tableToGenerate === 0)
        FileOperator.presentForDownload(Tables.cornerDatabase);
    else if (TableGenerator.tableToGenerate === 1)
        FileOperator.presentForDownload(Tables.edgesTopDatabase);
    else if (TableGenerator.tableToGenerate === 2)
        FileOperator.presentForDownload(Tables.edgesBottomDatabase);

    console.log("Table generation completed.");
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
 * Performs table generation using a iterative breadth-first search algorithm 
 * starting with the specified node.
 * 
 * @param node the node to start the search at
 * 
 * @return the successors to the nodes at which the search stops
 */
TableGenerator.generateBreadth = function(node)
{    
    var nodes = [], successors = [], theseSuccessors = [], depth, index, jndex;
    var key, value;
    
    RubixNode.getSuccessors(node, successors);
    
    for (depth = 1; depth <= TableGenerator.breadthDepth; depth++)
    {        
        nodes = successors.slice(0);
        successors.length = 0;
        
        for (index = 0; index < nodes.length; index++)
        {
            if (TableGenerator.tableToGenerate === 0)
            {
                // Corners
                key = RubixState.hashCorners(nodes[index].rubixState);
                value = Tables.cornerDatabase.get(key);
                
                // Do not replace existing value as that will effect an inadmissible heuristic.
                if (value === 0 || value > nodes[index].depth)
                    Tables.cornerDatabase.set(key, nodes[index].depth);
                else // State already enumerated
                    continue;
            }
            else if (TableGenerator.tableToGenerate === 1)
            {
                // Top Edges
                key = RubixState.hashTopEdges(nodes[index].rubixState);
                value = Tables.edgesTopDatabase.get(key);
                
                if (value === 0 || value > nodes[index].depth)
                    Tables.edgesTopDatabase.set(key, nodes[index].depth);
                else // State already enumerated
                    continue;
            }
            else if (TableGenerator.tableToGenerate === 2)
            {
                // Bottom Edges
                key = RubixState.hashBottomEdges(nodes[index].rubixState);
                value = Tables.edgesBottomDatabase.get(key);
                
                if (value === 0 || value > nodes[index].depth)
                    Tables.edgesBottomDatabase.set(key, nodes[index].depth);
                else // State already enumerated
                    continue;
            }
            
            RubixNode.getSuccessors(nodes[index], theseSuccessors);
            
            for (jndex = 0; jndex < theseSuccessors.length; jndex++)
                successors.push(theseSuccessors[jndex]);         
            
            if (index % 100000 === 0)
                console.log("Depth: " + depth + "  Node: " + index + "  Successors: " + successors.length);
        }
    }
    
    return nodes;
};

/**
 * Performs table generation using a recursive depth-liminited algorithm 
 * starting with the specified node.
 * 
 * @param node the node to start the search at
 */
TableGenerator.generateDLS = function(node)
{    
    var key, value;
    
    if (TableGenerator.tableToGenerate === 0)
    {
        // Corners
        key = RubixState.hashCorners(node.rubixState);
        value = Tables.cornerDatabase.get(key);
        
        if (value === 0 || value > node.depth)
            Tables.cornerDatabase.set(key, node.depth);
        else // State already enumerated
            return;
    }
    else if (TableGenerator.tableToGenerate === 1)
    {
        // Edges Top
        key = RubixState.hashTopEdges(node.rubixState);
        value = Tables.edgesTopDatabase.get(key);
        
        if (value === 0 || value > node.depth)
            Tables.edgesTopDatabase.set(key, node.depth);
        else // State already enumerated
            return;
    }
    else if (TableGenerator.tableToGenerate === 2)
    {
        // Edges Bottom
        key = RubixState.hashBottomEdges(node.rubixState);
        value = Tables.edgesBottomDatabase.get(key);
        
        if (value === 0 || value > node.depth)
            Tables.edgesBottomDatabase.set(key, node.depth); 
        else // State already enumerated
            return;
    }
    
    // Base case
    if (node.depth === TableGenerator.dlsDepth)
        return;
    
    var successors = [];
    RubixNode.getSuccessors(node, successors);
    
    for (var index = 0; index < successors.length; index++)
    {
        TableGenerator.generateDLS(successors[index]);
        RubixNode.wipeBadChain(successors[index]);
    }
    
    if (TableGenerator.numNodes++ % 1000000 === 0)
        console.log((TableGenerator.numNodes - 1) / 1000000 + "M");
};
