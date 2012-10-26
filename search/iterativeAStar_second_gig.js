/* ---------------
    iterativeAStar.js    
    Requires - priorityQueue.js, rubixNode.js, rubixState.js
    A script for running the IDA* algorithm described in korf's paper.
   ----------------*/
AStar.goalState = RubixState.createWithGoalState();
AStar.loopsBeforeCallback = 15000;
AStar.self = null;

function AStar()
{
    this.frontier = new PriorityMinQueue();
    this.blockAdditionalSearches = false;
    this.index = 0;
    this.size = 0;
    this.successors = [];
    this.startNode = null;
}

/**
 * Runs IDA* on a RubixState object supplied by the user.
 * 
 * @param initialState A valid RubixState to find a solution to.
 * @return A string containing the necessary sequence of moves to achieve a goal state.
 */
AStar.prototype.iterativeAStar = function(initialState)
{
    if(!this.blockAdditionalSearches)
    {
        // Check the state before continuing.
        if(!initialState)
        {
            alert("Poorly formatted cube, please check console.");
            return;
        }
        /*
        for (var i = 0; i < 10; i ++)
        {
            RubixState.rotate(initialState,Math.floor(Math.random()*6), Math.floor(Math.random()*3 + 1));  
        }*/


        
        console.log(RubixState.toString(initialState));
        
        // Prevent too many searches from running at one time.
        this.blockAdditionalSearches = true;
        
        // Declare necessary values to send to the timeout function.
        var goalNode = RubixState.isEqual(initialState,AStar.goalState) ? initialState: null;
        
        this.startNode = new RubixNode(initialState);        
        
        var depth = this.startNode.fn;
        
        AStar.self = this;
        
        setTimeout(function() {
            AStar.self.iterativeAStarCallback(goalNode, depth);
        }, 0);
    }
    else{
        alert("A search is already executing!");   
    }
};

AStar.prototype.iterativeAStarCallback = function(node, depth)
{
    if(node)
    {
        $("#outputDiv").text("Solution is: " + this.pathFromNode(node));
        this.blockAdditionalSearches = false;
    }
    else
    {
        $("#outputDiv").text("Finished processing: " + depth + "  Now Processing: " + (depth + 1));
         console.log("Finished processing: " + depth + "  Now Processing: " + (depth + 1));
        setTimeout(function() {            
            AStar.self.iterativeAStarDepthLimted(AStar.self.startNode,depth + 1);
        }, 100 * Math.exp(2,depth)); 
    }
};

AStar.prototype.iterativeAStarDepthLimted = function(node, depth)
{    
    var localNode = node;
    var tempNode = null;
    var endSearch = function(){AStar.self.iterativeAStarCallback(localNode, depth); }; 
    var continueSearch = function() {AStar.self.iterativeAStarDepthLimted(AStar.self.frontier.remove(), depth);};    
    
    
    for(var tempIndex = 0; tempIndex < AStar.loopsBeforeCallback; tempIndex ++)
    {
        if(RubixState.isEqual(localNode.rubixState, AStar.goalState))
        {
            setTimeout(endSearch,0); 
            return;
        }    
        else if(localNode.fn < depth)
        {
            localNode.rc++;
            
            for(var i = 0; i < 6; i++)
            {
                /* 
                 * Do the face culling. Prevent redundant face rotations with the first condition.
                 * The second condition prevents duplicate states from arising due to rotating
                 * opposing faces.
                 */
                if(localNode.nodeAction && (i === localNode.nodeAction >> 4 ||
                    (i > 2  && RubixNode.faceCulling[(localNode.nodeAction >> 4)] == i)))
                {
                    continue;
                }
                
                for(var j = 1; j < 4; j++)
                {
                    tempNode = new RubixNode(RubixState.copy(localNode.rubixState), 
                        localNode, i, j);
                        
                    if(tempNode.fn <=depth)
                    {
                        this.frontier.insert(tempNode.fn, tempNode);
                    }
                    else
                    {
                        RubixNode.wipeBadChain(tempNode);
                    }                    
                }   
            }  
            
            if(--localNode.rc === 0 )
            {
                RubixNode.wipeBadChain(localNode);
            }
            
        }
        else
        {
            RubixNode.wipeBadChain(localNode);
        }   
        
        if(!this.frontier.isEmpty())
        {        
            localNode = null;
            localNode = AStar.self.frontier.remove();    

        }
        else
        {          
            localNode = null;
            setTimeout(endSearch, 1000); 
            return;
        }
    }
    
    if(!this.frontier.isEmpty())
    {  
        setTimeout(continueSearch, 500); 
        localNode = null;
        node = null;
    }
    else
    {          
        localNode = null;
        setTimeout(endSearch, 1000); 
        return;
    }
};

/**
 * @brief Performs the IDA* search using a do while loop and Priority min queue. 
 * 
 * Each iteration of the search checks to see if the current node f(n) is less than
 * the limit imposed by the depth. If this evaluates to true new nodes may be spawned.
 * The spawned nodes are then added to a min priority queue if their f(n) does not exceed the
 * depth. The frontier is then checked if it is empty and if not a new node is 
 * pulled from the priority queue. The loop is exited if the priority queue is empty
 * or a goal state is found.
 * 
 * @param currentNode The initial node containing the state to find a solution for.
 * @param depth The noninclusive maximum f(n) of a node that may be expanded.
 * 
 * @return The goal node if found or null.
 */

/**
 * Recursively generates a path from the goal node.
 * 
 * @param node The goal node the path is reuired from.
 * @return The string containing the sequence.
 */
AStar.prototype.pathFromNode = function(node)
{
    // If the depth is > 1 recursion must be done.
    // else if the depth is 1 the action sequence is done.
    // else the cube was already solved when it reached this search.
    if (node.depth > 1)
    {
        return this.pathFromNode(node.parentNode) + ", " + RubixNode.nodeActionToString(node);
    }
    else if (node.depth === 1) 
    {
        return RubixNode.nodeActionToString(node);
    }
    else
    {
        return "It was already solved!";
    }
};
