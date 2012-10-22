
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

TableGenerator.haltCheckbox = null;

TableGenerator.generate = function()
{   
    TableGenerator.haltCheckbox = $("#haltGeneration");
    
    TableGenerator.cornerDatabase = new PatternDatabase(TableGenerator.cornerDbSize);
    TableGenerator.edgesTopDatabase = new PatternDatabase(TableGenerator.edgeDbSize);
    TableGenerator.edgesBottomDatabase = new PatternDatabase(TableGenerator.edgeDbSize);

    var initialNode = new RubixNode(RubixState.createWithGoalState());
    
    TableGenerator.generateDLS(initialNode);
    
    FileOperator.presentForDownload(TableGenerator.cornerDatabase, "cornersTable.txt");
    FileOperator.presentForDownload(TableGenerator.edgesTopDatabase, "edgesTopTable.txt");
    FileOperator.presentForDownload(TableGenerator.edgesBottomDatabase, "edgesBottomTable.txt");
    
    console.log("DONE!");
};

TableGenerator.generateDLS = function(node)
{
    if (TableGenerator.haltCheckbox.attr("checked"));
        return;
    
    var key, value;
    
    // Corners
    key = RubixState.hashCode(node.rubixState, RubixState.corners7) % TableGenerator.cornerDbSize;
    value = TableGenerator.cornerDatabase.get(key);
    
    if (key === 0 || node.depth < value)
        TableGenerator.cornerDatabase.set(key, node.depth);
    
    // Edges Top
    key = RubixState.hashCode(node.rubixState, RubixState.edgesTop) % TableGenerator.edgeDbSize;
    value = TableGenerator.edgesTopDatabase.get(key);
    
    if (key === 0 || node.depth < value)
        TableGenerator.edgesTopDatabase.set(key, node.depth);
    
    // Edges Bottom
    key = RubixState.hashCode(node.rubixState, RubixState.edgesBottom) % TableGenerator.edgeDbSize;
    value = TableGenerator.edgesBottomDatabase.get(key);
    
    if (key === 0 || node.depth < value)
        TableGenerator.edgesBottomDatabase.set(key, node.depth);
    
    
    // Base case
    if (node.depth === 11)
        return;
    
    var successors = RubixNode.getSuccessors(node);
    
    for (var index = 0; index < successors.length; index++)
    {
        successors[index].parent = null;
        TableGenerator.generateDLS(successors[index]);
    }
    
    console.log("Node");
};

TableGenerator.generateBreadth = function()
{
    var initialNode = new RubixNode(RubixState.createWithGoalState());
    
    var nodes = RubixNode.getSuccessors(initialNode), successors, depth, index;
    var cornersKey, edgesTopKey, edgesBottomKey;
    
    TableGenerator.cornerDatabase = new PatternDatabase(TableGenerator.cornerDbSize);
//    TableGenerator.edgesTopDatabase = new PatternDatabase(TableGenerator.edgeDbSize);
//    TableGenerator.edgesBottomDatabase = new PatternDatabase(TableGenerator.edgeDbSize);
    
    for (depth = 1; depth <= 11; depth++)
    {
        successors = [];
        
        for (index = 0; index < nodes.length; index++)
        {
            cornersKey = RubixState.hashCode(nodes[index].rubixState, RubixState.corners7) % TableGenerator.cornerDbSize;
            //console.log("H:" + RubixState.hashCode(nodes[index].rubixState, RubixState.corners7));
            //console.log("K:" + cornersKey);
            
            // Do not replace existing value as that will effect an inadmissible heuristic.
            if (TableGenerator.cornerDatabase.get(cornersKey) === 0)
                TableGenerator.cornerDatabase.set(cornersKey, nodes[index].depth);
            
            // TODO - edges
            
            successors = successors.concat(RubixNode.getSuccessors(nodes[index]));
            nodes[index].parent = null;
            
            if (index % 250 === 0)
            {
                console.log("Depth: " + depth + "  Node: " + index + "  Successors: " + successors.length);
            }
        }
        
        nodes = successors.slice(0);
    }
    
    console.log("Encoding...");
    var strDb = TableGenerator.cornerDatabase.toString();
    console.log("Length: " + strDb.length);
    //console.log(strDb.substr(0, 50));
    //FileOperator.presentForDownload(strDb);
};