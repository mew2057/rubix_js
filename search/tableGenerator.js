
$(document).ready(function() {
    FileOperator.init();
    
    setTimeout(function() {
        FileOperator.presentForDownload("TEST");
    }, 1000);
});

function TableGenerator() {}

TableGenerator.generate = function()
{
    var initialNode = new RubixNode(RubixState.createWithGoalState());
    var nodes = RubixNode.getSuccessors(initialNode);
    
    do 
    {
        
        
    } while (false);
};

function BreadthSearch()
{
    
}

// TODO