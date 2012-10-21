
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

TableGenerator.nodesGenerated = 0;

TableGenerator.generate = function()
{
    TableGenerator.cornerDatabase = new PatternDatabase(TableGenerator.cornerDbSize);
//    TableGenerator.edgesTopDatabase = new PatternDatabase(TableGenerator.edgeDbSize);
//    TableGenerator.edgesBottomDatabase = new PatternDatabase(TableGenerator.edgeDbSize);

    var initialNode = new RubixNode(RubixState.createWithGoalState());
    
    TableGenerator.generateDLS(initialNode);
    
    console.log("DONE!");
};

TableGenerator.generateDLS = function(node)
{
    var cornersKey = RubixState.hashCode(node.rubixState, RubixState.corners7) % TableGenerator.cornerDbSize;
    var cornersTableValue = TableGenerator.cornerDatabase.get(cornersKey);
    
    if (cornersTableValue === 0 || node.depth < cornersTableValue)
        TableGenerator.cornerDatabase.set(cornersKey, node.depth);
    
    if (node.depth === 11)
        return;
    
    var successors = RubixNode.getSuccessors(node);
    
    for (var index = 0; index < successors.length; index++)
    {
        successors[index].parent = null;
        TableGenerator.generateDLS(successors[index]);
    }
    
    if (TableGenerator.nodesGenerated++ % 1000 === 0)
        console.log("Nodes: " + TableGenerator.nodesGenerated);
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