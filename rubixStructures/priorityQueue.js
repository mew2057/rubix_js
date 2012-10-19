function PriorityMinQueue(){
    this.heap = [];  
}

PriorityMinQueue.prototype.insert  = function (priority, element)
{
    if(!this.insertToExisting(priority,element))
    {
        this.heap.push({"p":priority,"values":[element]});
        this.trickleUp(this.heap.length - 1);
    }
};

PriorityMinQueue.prototype.insertToExisting = function(priority,element)
{
    for(var index in this.heap)
    {
        if(this.heap[index].p === priority)    
        {
            this.heap[index].values.push(element);
            return true;
        }
    }
    
    return false;   
};


PriorityMinQueue.prototype.trickleUp = function(index)
{
    // Checks to see if the priority of the checked queue is less than that
    // of its parent in the heap. If so swap them in place in the array.
    
    // This is equivalent to a floor function in JavaScript.
    var parent = ((index - 1)/2) >> 0;

    if(index === 0)
    {
        return;   
    }
    else if(this.heap[index].p < 
        this.heap[parent].p)
    {
        this.heap.push(this.heap[parent]);
        this.heap[parent] = this.heap[index];
        this.heap[index] = this.heap.pop();
        
        this.trickleUp(parent);
    }
};

PriorityMinQueue.prototype.remove = function()
{
    var toReturn = null;
    
    if(this.heap.length > 0)
    {
        toReturn = this.heap[0].values.pop();
        
        
        if(this.heap[0].values.length === 0)
        {
            if(this.heap.length > 1)
            {
                this.heap[0] = this.heap.pop();
                this.heapRebuild(0);
            }
            else
            {
                this.heap = [];   
            }
        }
    }
    return toReturn;
};

PriorityMinQueue.prototype.heapRebuild = function(index)
{
    if(this.heap.length > 2 * index + 1)
    {
        var smallestChild = 2 * index + 1;
        
        if(this.heap.length > smallestChild + 1 && 
            this.heap[smallestChild].p > this.heap[smallestChild + 1].p )
        {
            smallestChild++;
        }
    
        if(this.heap[index].p > this.heap[smallestChild].p)
        {
            this.heap.push(this.heap[smallestChild]);
            this.heap[smallestChild] = this.heap[index];
            this.heap[index] = this.heap.pop();
            
            this.heapRebuild(smallestChild);
        }
        
    }
};

PriorityMinQueue.prototype.isEmpty = function()
{
    return this.heap.length === 0;
};

