/* ---------------
    iterativeAStar.js    
    Requires - priorityQueue.js, rubixNode.js, rubixState.js
    A script for running the IDA* algorithm described in korf's paper.
   ----------------*/
 
// A goal state to compare to the incremental states.
AStar.goalState = RubixState.createWithGoalState();

// Specifies the linear portion of the callback function.
AStar.loopsBeforeCallback = 15000;

// A pointer to the currently executing object.
AStar.self = null;

// Prevents two AStar searches from running.
AStar.blockAdditionalSearches = false;

/**
 * An object to contain AStar searches, only one exists in this implementation.
 */
function AStar()
{
    // The frontier for the IDA* search.
    this.frontier = new PriorityMinQueue();
    
    // Specifies where output info goes.
    this.htmlElement = "";
    
    // The starting node of the search (essential for search restarts).
    this.startNode = null;
    
    // Initialized high here, but will actually be initialized to baseCost + 1 in
    // implementation.
    this.nextCost = 100000;
}

/**
 * Runs IDA* on a RubixState object supplied by the user. Kicks off a set of timouts
 * which update the web page independent of the invoking function.
 * 
 * @param initialState A valid RubixState to find a solution to.
 * @param htmlElement The output location for the search.
 */
AStar.prototype.iterativeAStar = function(initialState,htmlElement)
{
    // If a search is running Prevent a second search from running.
    if(!AStar.blockAdditionalSearches)
    {
        // Check the state before continuing.
        if(!initialState)
        {
            alert("Poorly formatted cube, please check console.");
            return;
        }
        
        console.log(RubixState.toString(initialState));
        
        // Prevent too many searches from running at one time.
        AStar.blockAdditionalSearches = true;
        
        // Create a self function for callbacks.
        AStar.self = this;
                
        this.htmlElement = htmlElement;    
        
        
        // Initialize the nodes and depth.
        var goalNode = RubixState.isEqual(initialState,AStar.goalState) ? initialState: null;
        this.startNode = new RubixNode(initialState);              
        var baseCost = this.startNode.fn;       
        this.nextCost = baseCost + 1;

        $(this.htmlElement).text("Processing: " + baseCost);
        console.log("Processing:" + baseCost);

        // Start the search proper.       
        if(goalNode)
        {
            this.iterativeAStarCallback(goalNode, baseCost);
        }
        else
        {  
            this.iterativeAStarDepthLimted(this.startNode,baseCost);
        }
    }
    else{
        alert("A search is already executing!");   
    }
};

/**
 * A callback that checks for complete states and calls the actual search.
 * If a node is non null a solution has been found and is output, otherwise 
 * the search continues and the depth is incremented.
 * 
 * @param node The hopeful goalNode, if null continue search, else we have a solution.
 * @param costLimit the current depth for the search.
 */
AStar.prototype.iterativeAStarCallback = function(node, costLimit)
{
    if(node)
    {
        $(this.htmlElement).text("The solution is: " + this.pathFromNode(node));
        console.log("The solution is: " + this.pathFromNode(node));
        AStar.blockAdditionalSearches = false;
        AStar.self = null;        
    }
    else
    {
        $(this.htmlElement).text("Now Processing Upper Cost of   " + costLimit);
        console.log("Now Processing Upper Cost of  " + costLimit);
          
        // Increment the next cost so it may only increase.
        this.nextCost++;
        
        // Sets a timeout to the search so Garbage Collection can hopefully run and 
        // Memory doesn't get slammed too hard.
        setTimeout(function() {            
            AStar.self.iterativeAStarDepthLimted(AStar.self.startNode,costLimit);
        }, 100 * costLimit); 
    }
};

/**
 * Performs the actual search. Runs for AStar.loopsBeforeCallback times then
 * recalls itself with the current leading node. This is done in an effort to
 * encourage (not guarantee) garbage collection.
 * 
 * @param node The current leading node in the search.
 * @param costLimit The current depth for the search.
 */
AStar.prototype.iterativeAStarDepthLimted = function(node, costLimit)
{    
    // Placeholder node variables.
    var localNode = node;
    var tempNode = null;
    
    // The callback functions for the search, declared here in an effort to clena up the implementation.
    var endSearch = function(){AStar.self.iterativeAStarCallback(localNode, AStar.self.nextCost); }; 
    var continueSearch = function() {AStar.self.iterativeAStarDepthLimted(AStar.self.frontier.remove(), costLimit);};    
    
    // Loop n times and perform search operations.
    for(var index = 0; index < AStar.loopsBeforeCallback; index ++)
    {
        /*
         * If our current node is a goal state, we are finished.
         * Else If the localNode is less than the depth expand it.
         * Else cull the node.
        */
        if(RubixState.isEqual(localNode.rubixState, AStar.goalState))
        {
            // End the search.
            endSearch(); 
            return;
        }    
        else if(localNode.fn < costLimit)
        {
            // Increments the local reference counter by one (done to prevent the node from
            // being deleted until after its successors are declared)
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
                    // Creats a new node and culls it if it's not of the proper depth.
                    tempNode = new RubixNode(RubixState.copy(localNode.rubixState), 
                        localNode, i, j);
                        
                    if(tempNode.fn <= costLimit)
                    {
                        this.frontier.insert(tempNode.fn, tempNode);
                    }
                    else
                    {
                        // The next cost for cutoff should be a min value based on 
                        // Korf's algorithm (honestly this will basically be incrementing by 1...)
                        this.nextCost = tempNode.fn > this.nextCost ?
                            Math.min(tempNode.fn, this.nextCost) : this.nextCost;
                            
                        RubixNode.wipeBadChain(tempNode);
                    }                    
                }   
            }  
            
            // Cull the local node if it has no children after expansion.
            if(--localNode.rc === 0 )
            {
                RubixNode.wipeBadChain(localNode);
            }
            
        }
        else
        {
            RubixNode.wipeBadChain(localNode);
        }   
        
        // Continue if elements are in the frontier end this level of the depth search otherwise.
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
    
    // continue the search with a brief interlude.
    setTimeout(continueSearch, 500); 
    localNode = null;
    node = null;
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
