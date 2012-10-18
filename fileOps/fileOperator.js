/*  ---------------
    fileOperator.js
    A collection of operations that make use of the HTML5 file api. This contains
    convenience functions to handle file io on a browser.
    
    ----------------------------------------------------------------------------
    10-4-12:
        Updated By: John Dunham
        Notes: Created the file and class. Opted for a psuedo singleton, as 
            there should really only be one of these per window.
    ---------------
 */
function FileOperator()
{
    this.text = "";
    this.toWrite = "";
    this.downloadURL = "";
}

FileOperator.operator = null;

FileOperator.init = function()
{
    FileOperator.operator = new FileOperator();

    window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
       
    this.corners = new Uint32Array(new ArrayBuffer(32));
    this.sides = new Uint16Array(new ArrayBuffer(24));
       
    window.addEventListener("drop",FileOperator.operator.drop);
    window.addEventListener("dragEnter",FileOperator.operator.nullEffects);    
};

FileOperator.prototype.nullEffects = function(e)
{
    e.stopPropagation();
    e.preventDefault();
};

FileOperator.prototype.drop = function(e)
{
    e.stopPropagation();
    e.preventDefault();
    
    console.log(e.dataTransfer.files[0]);
    var reader = new FileReader();
    
    reader.onload = function(e)
    {
        console.log(e.target.result);
        FileOperator.operator.processFileText(e.target.result.toString());
    };
    
    reader.readAsText(e.dataTransfer.files[0]);
};

FileOperator.prototype.processFileText = function(input)
{
    this.text = input.replace(/\s/g,'').toUpperCase();
    
    var state = RubixState.createWithString(this.text);
    
    (new AStar()).iterativeAStar(state);
};

function generalErrorHandler(e)
{
    console.log("Error" + e);
}

FileOperator.presentForDownload = function(data, functionCallback)
{
    if(functionCallback)
    {
        FileOperator.operator.toWrite = data.functionCallback();
    }
    else
    {
        FileOperator.operator.toWrite = data.toString();
    }
    
    // Initialize the sandboxed file system 
    // I allocated 60 MB, but I don't think we'll need that much (will refine)
    window.requestFileSystem(window.TEMPORARY, 60*1024*1024 , FileOperator.operator.writeAndPresent, generalErrorHandler);
};

FileOperator.prototype.writeAndPresent = function(fs)
{
    fs.root.getFile('rubixOutput.txt',{create: true}, function(file){
        FileOperator.operator.downloadURL = file.toURL();
        
        file.createWriter(function(fileWriter){
            fileWriter.onwriteend = function(e){
              console.log("File Write Complete: " + e.toString());

            // Presents the file created for downloading.
            $('<a id="dl" href="' + FileOperator.operator.downloadURL + 
                '" download="rubixOutput.txt">RECIEVE YOUR '+
                'BIRTHRIGHT!</a>').prependTo("body");
            };
            
            fileWriter.onerror = function(e){
              console.log("File Write Failed: " + e.toString());
            };
            
            var blob = new Blob([FileOperator.operator.toWrite], 
                {type: 'text/plain'});
            
            fileWriter.write(blob);
        },generalErrorHandler);
        
    },generalErrorHandler);
};
