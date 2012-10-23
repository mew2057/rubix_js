
$(document).ready(function() {
    FileOperator.init();
    //TableGenerator.generate();
});

function TableGenerator() {}

TableGenerator.cornerDbSize = 88179840;
TableGenerator.edgeDbSize = 42577920;

TableGenerator.cornerDatabase = null;
TableGenerator.edgesTopDatabase = null;
TableGenerator.edgesBottomDatabase = null;

TableGenerator.depth = 2;

TableGenerator.generate = function()
{     
    TableGenerator.cornerDatabase = new PatternDatabase(TableGenerator.cornerDbSize);
//    TableGenerator.edgesTopDatabase = new PatternDatabase(TableGenerator.edgeDbSize);
//    TableGenerator.edgesBottomDatabase = new PatternDatabase(TableGenerator.edgeDbSize);
    
    TableGenerator.generateBreadth();
    
    /*
    var initialNode = new RubixNode(RubixState.createWithGoalState());
    
    TableGenerator.generateDLS(initialNode);

    FileOperator.presentForDownload(TableGenerator.cornerDatabase);
//    FileOperator.presentForDownload(TableGenerator.edgesTopDatabase, "edgesTopTable.txt");
//    FileOperator.presentForDownload(TableGenerator.edgesBottomDatabase, "edgesBottomTable.txt");
    */
    
    console.log("DONE!");
};

TableGenerator.generateDLS = function(node)
{
    var key, value;
    
    // Corners
    key = RubixState.hashCode(node.rubixState, RubixState.corners7) % TableGenerator.cornerDbSize;
    value = TableGenerator.cornerDatabase.get(key);
    
    if (value === 0 || value > node.depth)
        TableGenerator.cornerDatabase.set(key, node.depth);
    else // State already enumerated
        return;
/*  
    // Edges Top
    key = RubixState.hashCode(node.rubixState, RubixState.edgesTop) % TableGenerator.edgeDbSize;
    value = TableGenerator.edgesTopDatabase.get(key);
    
    if (value === 0 || value > node.depth)
        TableGenerator.edgesTopDatabase.set(key, node.depth);
    
    // Edges Bottom
    key = RubixState.hashCode(node.rubixState, RubixState.edgesBottom) % TableGenerator.edgeDbSize;
    value = TableGenerator.edgesBottomDatabase.get(key);
    
    if (value === 0 || value > node.depth)
        TableGenerator.edgesBottomDatabase.set(key, node.depth);
*/    
    
    //console.log("Node");
    
    // Base case
    if (node.depth === 11)
        return;
    
    var successors = RubixNode.getSuccessors(node);
    
    for (var index = 0; index < successors.length; index++)
    {
        successors[index].parent = null;
        TableGenerator.generateDLS(successors[index]);
    }
};

TableGenerator.generateBreadth = function()
{
    var initialNode = new RubixNode(RubixState.createWithGoalState());
    
    var nodes = RubixNode.getSuccessors(initialNode), successors = [], depth, index;
    var key, value;
    
    TableGenerator.cornerDatabase = new PatternDatabase(TableGenerator.cornerDbSize);
//    TableGenerator.edgesTopDatabase = new PatternDatabase(TableGenerator.edgeDbSize);
//    TableGenerator.edgesBottomDatabase = new PatternDatabase(TableGenerator.edgeDbSize);
    
    for (depth = 1; depth <= 11; depth++)
    {        
        for (index = 0; index < nodes.length; index++)
        {
            key = RubixState.hashCode(nodes[index].rubixState, RubixState.corners7) % TableGenerator.cornerDbSize;
            value = TableGenerator.cornerDatabase.get(key);
            
            // Do not replace existing value as that will effect an inadmissible heuristic.
            if (value === 0 || value > nodes[index].depth)
                TableGenerator.cornerDatabase.set(key, nodes[index].depth);
            else // State already enumerated
                continue;
            
            // TODO - edges
            
            successors = successors.concat(RubixNode.getSuccessors(nodes[index]));
            nodes[index].parent = null;
            
            if (index % 250 === 0)
            {
                console.log("Depth: " + depth + "  Node: " + index + "  Successors: " + successors.length);
            }
        }
        
        nodes = successors.slice(0);
        successors.length = 0; // Clear array
    }
    
    console.log("Encoding...");
    var strDb = TableGenerator.cornerDatabase.toString();
    console.log("Length: " + strDb.length);
    //console.log(strDb.substr(0, 50));
    //FileOperator.presentForDownload(strDb);
};