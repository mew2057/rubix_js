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

/**
 * Initializes the File Operator so it may be used on a web page.
 */
FileOperator.init = function()
{
    FileOperator.operator = new FileOperator();

    window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
       
    window.addEventListener("drop",FileOperator.operator.drop);
    window.addEventListener("dragenter",FileOperator.operator.nullEffects);    
    window.addEventListener("dragover",FileOperator.operator.nullEffects);
};

/**
 * Prevents page propagation on drag and drop events.
 * @param e The event that brought us to this callback.
 */
FileOperator.prototype.nullEffects = function(e)
{
    e.stopPropagation();
    e.preventDefault();
};


/**
 * Performs the file load and defines the behavior to take when loading is completed.
 * @param e The event
 */
FileOperator.prototype.drop = function(e)
{
    e.stopPropagation();
    e.preventDefault();
    
    // Generate a FileReader to handle an asynchronous file load.
    var reader = new FileReader();
    
    // Define the callback for when the file finishes loading.
    reader.onload = function(e)
    {
        console.log(e.target.result);
        FileOperator.operator.processFileText(e.target.result.toString());
    };
    
    // Read the file that was dragged onto the browser pane as a text file.
    reader.readAsText(e.dataTransfer.files[0]);
};

/**
 * Cleans up the text pulled from the rubik's cube text file and runs the IDA* search.
 * @param input A String version of the file.
 */
FileOperator.prototype.processFileText = function(input)
{
    this.text = input.replace(/\s/g,'').toUpperCase();
    
    var state = RubixState.createWithString(this.text);
    
    (new AStar()).iterativeAStar(state,"#outputDiv");
};

/**
 * The generic callback for file system issues.
 * @param e The object containing error details.
 */
function generalErrorHandler(e)
{
    console.log("Error" + e.toString());
}

/**
 * Presents an object for download in the form of a download link on the webpage.
 * @param data An object to write to a file.
 * @param fn Optional - defines a function that represents the data as a string. 
 *           If not supplied toString is invoked.
 */
FileOperator.presentForDownload = function(data, fn)
{
    if(fn)
    {
        FileOperator.operator.toWrite = data.fn();
    }
    else
    {
        FileOperator.operator.toWrite = data.toString();
    }
    
    // Initialize the sandboxed file system with 60 MB; to be refined
    window.requestFileSystem(window.TEMPORARY, 60*1024*1024 , FileOperator.operator.writeAndPresent, generalErrorHandler);
};

/**
 * Does the nitty gritty file writing (so messy >.<)
 * 
 * @param fs The file system that the file shall live on.
 */
FileOperator.prototype.writeAndPresent = function(fs)
{
    var filename = 'rubixOutput.txt';
    
    fs.root.getFile(filename ,{create: true}, function(file) {
        FileOperator.operator.downloadURL = file.toURL();
        
        file.createWriter(function(fileWriter) {
            fileWriter.onwriteend = function(e) {
              console.log("File Write Complete: " + e.toString());

                // Presents the file created for downloading.
                $('<a id="dl" href="' + FileOperator.operator.downloadURL + 
                    '" download="' + filename + '">RECIEVE YOUR ' +
                    'BIRTHRIGHT!</a>').prependTo("body");
            };
            
            fileWriter.onerror = function(e) {
              console.log("File Write Failed: " + e.toString());
            };
            
            var blob = new Blob([FileOperator.operator.toWrite], {type: 'text/plain'});
            
            fileWriter.write(blob);
        },generalErrorHandler);
        
    },generalErrorHandler);
};
