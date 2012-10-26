

/**
 * Creates a new pattern database containing 4-bit entries.
 * @param size the number of 4-bit entries in the database
 * @return a new pattern database
 */
function PatternDatabase(size)
{
    this.entries = new Uint32Array(new ArrayBuffer(size / 2));
}

PatternDatabase.eraser = 15;

/**
 * Sets the key (index) of the database to the specified value.
 * @param key the key (index)
 * @param value the value to store
 */
PatternDatabase.prototype.set = function(key, value)
{
    var index = Math.floor(key / 8);
    var subBitIndex = (key % 8) * 4;
    
    var erase = ~(PatternDatabase.eraser << subBitIndex);
    value <<= subBitIndex;
    
    this.entries[index] = (this.entries[index] & erase) | value;
};

/**
 * Retrieves the value located at the specified key (index).
 * @return the value
 */
PatternDatabase.prototype.get = function(key)
{
    var index = Math.floor(key / 8);
    var subBitIndex = (key % 8) * 4;
    
    var erase = PatternDatabase.eraser << subBitIndex;
    
    return (this.entries[index] & erase) >>> subBitIndex;
};

/**
 * Encodes this database as a string.
 * @return a string representation of this database
 */
PatternDatabase.prototype.toString = function()
{
    var index, strDb = "";
    
    for (index = 0; index < this.entries.length * 4; index += 2)
        strDb += String.fromCharCode(this.get(index) | (this.get(index + 1) << 4));
        
    return strDb;
};

/**
 * Decodes the given string into the database.
 * @param strDb the string to decode
 */
PatternDatabase.prototype.loadFromString = function(strDb)
{
    var index, char;
    
    for (index = 0; index < this.entries.length * 4; index += 2)
    {
        char = strDb.charCodeAt(index);
        this.set(index, (char & 240) >>> 4);    // ----0000
        this.set(index + 1, char & 15);         // 0000----
    }
};

PatternDatabase.prototype.loadFromFile = function(filePath)
{
    var db = this;
    
    $.ajax({
        type : "GET",
        url : filePath,
        contentType : "text/plain; charset=UTF-8",
        async : false,
        success : function(data) {
            db.loadFromString(data);
        }
    });
};