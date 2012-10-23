function RubixState(){}


/**
 * Creates a Rubik cube with the goal state.
 */
RubixState.createWithGoalState = function()
{
    return RubixState.createWithString("RRRRRRRRRGGGYYYBBBGGGYYYBBBGGGYYYBBBOOOOOOOOOWWWWWWWWW");
};

/**
 * Creates a Rubik Cube from an upper case String of characters from a string 
 * from the alphabet: {R,G,Y,B,O,W}.
 * 
 * @param text The textual representation of the rubik cube as specified in the 
 *      assignment.
 * @return A state for the supplied text.
 */
RubixState.createWithString = function(text)
{
    
    if(text.length !=  54) 
    {
        console.log("Your rubik's cube doesn't contain the right number of cubie" +
            " faces!");
        return null;
    }
    
    var error = (text.match(/R/g)||[]).length !== 9 ? "Incorrect number of Rs\n" : "";
    error += (text.match(/G/g)||[]).length !== 9 ? "Incorrect number of Gs\n" : "";
    error += (text.match(/Y/g)||[]).length !== 9 ? "Incorrect number of Ys\n" : "";
    error += (text.match(/B/g)||[]).length !== 9 ? "Incorrect number of Bs\n" : "";
    error += (text.match(/O/g)||[]).length !== 9 ? "Incorrect number of Os\n" : "";
    error += (text.match(/W/g)||[]).length !== 9 ? "Incorrect number of Ws\n" : "";
    
    if(error !== "")
    {
        console.log(error);
        return null;
    }
    
    // An array to hold the intermediate state.
    var faces = [];
    
    // Iterate over the input string to organize our data.
    for(var index = 0, line= " ", length = text.length / 9; index <length; index++)
    {
        line = text.substring(index*9,index*9 + 9);
        
        // Switch on indices in a manner befitting of a boss.
        switch(index)
        {
            case 1:
                faces.push(line.substring(0,3));
                faces.push(line.substring(3,6));
                faces.push(line.substring(6,9));
                break;
            case 2 :
            case 3 :
                faces[1] += line.substring(0,3);
                faces[2] += line.substring(3,6);
                faces[3] += line.substring(6,9);
                break;
            default:
                faces.push(line);
                break;
        }        
    }
    
    // Splits the strings into character arrays.
    for(var face in faces)
    {
        faces[face] = faces[face].split('');
    }
    
    // Check the center cubies before advancing.
    for(index = 0; index < faces.length; index ++)
    {
        if(RubixState.faceValues[index] !== faces[index][4])
        {
            console.log("Your " + RubixState.faceValues[index] + " face center cubie" +
                 " is wrong!");
            return null;
        }
    }
        

    /*
             00 08 01
             09 -R 10
             02 11 03
    00 09 02 02 11 03 03 10 01
    12 -G 13 13 -Y 14 14 -B 15
    04 16 05 05 17 06 06 18 07
             05 17 06
             16 -O 18
             04 19 07
             04 19 07
             12 -W 15
             00 08 01   
             
              0  1  2
              3  R  5
              6  7  8
     9 10 11 12 13 14 15 16 17
    18  G 20 21  Y 23 24  B 26
    27 28 29 30 31 32 33 34 35
             36 37 38
             39  O 41
             42 43 44
             45 46 47
             48  W 50
             51 52 53
  
    */
    var state = new Uint8Array(new ArrayBuffer(20));

    try{
        RubixState.faceSet = [0,0,0,0,0,0];
        RubixState.edgeWindowSum = 0;
        
        //corners
        state[0]  = RubixState.processCubie([[faces[0][0],0],[faces[5][6],5],[faces[1][0],1]]);
        
        state[1]  = RubixState.processCubie([[faces[0][2],0],[faces[5][8],5],[faces[3][2],3]]);
        
        state[2]  = RubixState.processCubie([[faces[0][6],0],[faces[2][0],2],[faces[1][2],1]]);
        state[3]  = RubixState.processCubie([[faces[0][8],0],[faces[2][2],2],[faces[3][0],3]]);
        state[4]  = RubixState.processCubie([[faces[5][0],5],[faces[4][6],4],[faces[1][6],1]]);
        state[5]  = RubixState.processCubie([[faces[2][6],2],[faces[4][0],4],[faces[1][8],1]]);
        state[6]  = RubixState.processCubie([[faces[2][8],2],[faces[4][2],4],[faces[3][6],3]]);
        state[7]  = RubixState.processCubie([[faces[5][2],5],[faces[4][8],4],[faces[3][8],3]]);

        // Check the corners for validity before wasting cycles on the sides.
        if(((RubixState.faceSet[0]+RubixState.faceSet[4]) % 3) + 
            ((RubixState.faceSet[1] + RubixState.faceSet[3]) % 3) + 
            ((RubixState.faceSet[2] + RubixState.faceSet[5]) % 3) !== 0)
        {
            RubixState.faceSet.length = 0;
            throw "RotCorner";
        }
        
        RubixState.faceSet.length = 0;
        
        //sides
        state[8]  = RubixState.processCubie([[faces[0][1],0],[faces[5][7],5]], 8);
        state[9]  = RubixState.processCubie([[faces[0][3],0],[faces[1][1],1]], 9);
        state[10] = RubixState.processCubie([[faces[0][5],0],[faces[3][1],3]],10);
        state[11] = RubixState.processCubie([[faces[0][7],0],[faces[2][1],2]],11);
        state[12] = RubixState.processCubie([[faces[5][3],5],[faces[1][3],1]],12);
        state[13] = RubixState.processCubie([[faces[2][3],2],[faces[1][5],1]],13);
        state[14] = RubixState.processCubie([[faces[2][5],2],[faces[3][3],3]],14);
        state[15] = RubixState.processCubie([[faces[5][5],5],[faces[3][5],3]],15);
        state[16] = RubixState.processCubie([[faces[4][3],4],[faces[1][7],1]],16);
        state[17] = RubixState.processCubie([[faces[2][7],2],[faces[4][1],4]],17);
        state[18] = RubixState.processCubie([[faces[4][5],4],[faces[3][7],3]],18);
        state[19] = RubixState.processCubie([[faces[5][1],5],[faces[4][7],4]],19);
        
        // Do the edge pairity check.
        if(RubixState.edgeWindowSum % 2 === 1)
        {
            RubixState.edgeWindowSum =0;
            throw "RotEdge";
        }
        RubixState.edgeWindowSum =0;
    }catch(error)
    {

        if(error ==="CError")
        {
            console.log("One of your corners has an invalid configuration of colors.");
        }
        else if(error === "EError")
        {
            console.log("One of your edges has an invalid configuration of colors.");
        }
        else if (error === "FError")
        {
            console.log("One of your faces could not be found on a cubie.");    
        }
        else if (error === "DupeColorError")
        {
            console.log("One of your cubies has duplicate colors.");
        }
        else if (error === "RotCorner")
        {
            console.log("One of your corner cubies is rotated");
        }
        else if (error === "RotEdge")
        {
            console.log("One of your edge cubies is rotated");
        }
        else if (error === "EWindowError")
        {
            console.log("One of the edge cubies did not match a valid cube edge.");
        }        
        else
        {
            console.log(error);   
        }
    }


    for(var i =0; i < 6; i++)
    {
        for(var j = 1; j < 4; j++)
        {
            
        RubixState.rotate(state, i, j);
        console.log(i,j,RubixState.toString(state));
        RubixState.rotate(state, i,2 - (j - 2));
        }
    }

    //return RubixState.verifyState(state) ? state : null;
};

RubixState.toString = function(state)
{
    var tempIndex = 0, toReturn ="   ", focusedCubie="",offset = 0, limit = 0;
    
    RubixState.outputFaces.length = 54;
    RubixState.outputFaces[4]  = 'R';
    RubixState.outputFaces[19] = 'G';
    RubixState.outputFaces[22] = 'Y';
    RubixState.outputFaces[25] = 'B';
    RubixState.outputFaces[40] = 'O';
    RubixState.outputFaces[49] = 'W';      
    
    for(var index=0; index < state.length; index++) 
    {
        tempIndex = RubixState.cubieOutputMapping[index].faces.indexOf(state[index] & 7);
        
        if(tempIndex == -1)
        {
            console.log(index, state[index] & 7, state[index] >> 3);
            return "Bad State";
        }
        
        focusedCubie = RubixState.cubies.indicies[state[index] >> 3];
        limit = index < 8 ? 3 : 2;
        
        for(tempIndex, offset = 0; offset < limit;tempIndex++,offset++)
        {        
            tempIndex = tempIndex % limit;
            RubixState.outputFaces[
                    RubixState.cubieOutputMapping[index].absolute[tempIndex]] =
                        RubixState.cubies[focusedCubie].printOrder[offset];
        }
    }
    
    for(index = 0; index < RubixState.outputFaces.length; index++)
    {
        toReturn +=RubixState.outputFaces[index];
        
        if(index === 2 || index === 5 ||  index === 35|| 
            index === 38 || index === 41 || index === 44 ||
            index === 47 || index === 50 || index === 53)
        {
            toReturn +="\n   ";    
        }
        else if(index === 8 ||
            index === 17 || index === 26   )
        {
            toReturn +='\n';   
        }
    }
    
    return toReturn;
};

RubixState.processCubie = function (faces, cubie)
{
    var cubieSum = 0;
    for(var index in faces)
    {
        cubieSum += RubixState.faceMap[faces[index][0]].value;        
    }
    return (faces.length === 3 ? RubixState.processCorner:RubixState.processSide)(faces, cubieSum, cubie);
};

/**
 * Processes an array of faces and converts it to the representation for a cubie.
 * In all of these cases the ordering of the faces matters logically, eg RYB is oriented
 * by the red face and the preceding faces are Y then B.
 */
RubixState.processCorner = function(faces, cubieSum)
{
    var composition = 0, testString ='';
    
    for(var index = 0; index <= faces.length;  index++)
    {
        if(index === faces.length)
        {
            throw "CError";    
        }
        else if(faces[index][0] === 'R' || faces[index][0] === 'O')
        {
            break;   
        }
    }    
    switch (cubieSum)
    {
        // RYG
        case 3:
            testString = 'RYG';
            composition = (RubixState.cubies.RYG.value*8)+faces[index][1];
            break;
        // RBY
        case 5:
            testString = 'RBY';
            composition = (RubixState.cubies.RBY.value*8)+faces[index][1];
            break;
        // RGW
        case 6:
            testString = 'RGW';
            composition = (RubixState.cubies.RGW.value*8)+faces[index][1];
            break;
        // OGY
        case 7:
            testString = 'OGY';
            composition = (RubixState.cubies.OGY.value*8)+faces[index][1];
            break;
        // RWB
        case 8:
            testString = 'RWB';
            composition = (RubixState.cubies.RWB.value*8)+faces[index][1];
            break;
        // OYB
        case 9:
            testString = 'OYB';
            composition = (RubixState.cubies.OYB.value*8)+faces[index][1];
            break;
        // OWG
        case 10:
            testString = 'OWG';
            composition = (RubixState.cubies.OWG.value*8)+faces[index][1];
            break;
        // OBW
        case 12:  
            testString = 'OBW';
            composition = (RubixState.cubies.OBW.value*8)+faces[index][1];
            break;
        default:
            break;
    }
    
    if(!RubixState.cubieIsValid(faces, testString))
    {
        throw "CError";
    }
    
    return composition;
};


RubixState.processSide = function(faces,cubieSum, cubie)
{
    var testString = '',composition = 0;
    
    for(var index = 0; index < faces.length;  index++)
    {
        if(faces[index][0] === 'R' || faces[index][0] === 'O')
        {
            break;   
        }
    }    
    
    if(index === 2)
    {
        switch (cubieSum)
        {
            //GY
            case 3:
                index = RubixState.faceIndex(faces, 'G');
                testString = 'GY';
                composition = (RubixState.cubies.GY.value*8)+faces[index][1];
                break;
            // YB
            case 5:
                index = RubixState.faceIndex(faces, 'Y');
                testString = 'YB';
                composition = (RubixState.cubies.YB.value*8)+faces[index][1];
                break;
            // WG
            case 6:
                index = RubixState.faceIndex(faces, 'W');
                testString = 'WG';
                composition = (RubixState.cubies.WG.value*8)+faces[index][1];
                break;
            // BW
            case 8:
                index = RubixState.faceIndex(faces, 'B');
                testString = 'BW';
                composition = (RubixState.cubies.BW.value*8)+faces[index][1];
                break;
			
			default:   
                break;
        }
    }
    else
    {
        switch(cubieSum)
        {
            // RG
            case 1:
                testString = 'RG';
                composition = (RubixState.cubies.RG.value*8)+faces[index][1];
                break;
            // RY
            case 2:
                testString = 'RY';
                composition = (RubixState.cubies.RY.value*8)+faces[index][1];
                break;
            // RB
            case 3:
                testString = 'RB';
                composition = (RubixState.cubies.RB.value*8)+faces[index][1];
                break;
            // RW, OG
            case 5:
                if(faces[0][0] === 'R' || faces[0][0] === 'W')
                {
                    testString = 'RW';
                    composition = (RubixState.cubies.RW.value*8)+faces[index][1];   
                }
                else
                {
                    testString = 'OG';
                    composition = (RubixState.cubies.OG.value*8)+faces[index][1];                    
                }
                break;
            // OY
            case 6:
                testString = 'OY';
                composition = (RubixState.cubies.OY.value*8)+faces[index][1];
                break;
            //OB
            case 7:
                testString = 'OB';
                composition = (RubixState.cubies.OB.value*8)+faces[index][1];
                break;
            //OW
            case 9:
                testString = 'OW';
                composition = (RubixState.cubies.OW.value*8)+faces[index][1];
                break;
            default :
                break;
        
        }
    }
    
    if(!RubixState.cubieIsValid(faces, testString, cubie))
    {
        throw "EError";
    }
    
    return composition;
};

RubixState.faceIndex = function(faces, faceChar)
{
    for(var index = 0; index < faces.length;  index++)
    {
        if(faces[index][0] == faceChar)
        {
            break;   
        }
    }    
    
    if(index == faces.length)
    {
        throw "FError";    
    }
    
    return index;
};



RubixState.cubieIsValid = function(faces, faceComp, cubie)
{    
    var previousVals ='',found =false;
    for(var index in faces)
    {
        // Verify that the colors in the cubie should be there.
        if(faceComp.indexOf(faces[index][0]) === -1)
        {
            return false;   
        }
        
        // Do parity checks
        if(faces.length == 3)
        {
            RubixState.faceSet[faces[index][1]] += RubixState.cubies[faceComp].orientValues[faces[index][0]];
        }
        else if(cubie && RubixState.edgeWindows[cubie] == faces[index][1])

        {
            RubixState.edgeWindowSum += RubixState.cubies[faceComp].orientValues[faces[index][0]];
            found = true;
        }
       
        // Do dupe checking.
        if(previousVals.indexOf(faces[index][0]) != -1)
        {
            throw "DupeColorError";    
        }
        
        previousVals += faces[index][0];
    }
    
    if(cubie && !found)
    {
        throw "EWindowError";   
    }
    
    return true;
};

RubixState.rotate =function(state, face, rotations)
{
    var indicies = RubixState.sideLookUpTable[face];
    
     /*
     * cubie - holds the cubie index.
     * size - A generic size variable.
     * newIndex - Holds a modified index.
     * cFace - A cubieFace.
     * offset - A generic offset variable.
    */
    var cubie, size, newIndex;
    
    // Iterate over the indicies and calculate values of the rotated cubies.
    for(var index  = 0, scratchIndex =0; index < indicies.length; index ++)
    {
        // Keep track of the cubie location. If it is a side (loc >= 24) size is 2 else 3
        cubie = indicies[index];

        RubixState.scratchBuffer[scratchIndex++] = RubixState.rotateFace(
                state[cubie], face, rotations);   
    }

    for (index = 0, size = indicies.length; index < size; index++)
    {
        // Calculate the index of the new cubie index after rotation.
        newIndex = indicies[((index + (2 * rotations))) % 8];
        
        state[newIndex] = RubixState.scratchBuffer[index];      
    }
};

RubixState.rotateFace = function(cubieState, face, rotations)
{
    
    var faceVal = cubieState & 7;   
    var cubieVal = cubieState  - faceVal;


    if ( RubixState.newFaceMap[face][faceVal])
    {
        return cubieVal | RubixState.newFaceMap[face][faceVal][rotations];
    }
    else 
    {
        return cubieState;   
    }
};

RubixState.isEqual = function(stateA, stateB)
{   
    /**
     * Iterate over the cubie buffer to find any abberations.
     */
    for(var index = 0, length = stateA.cubies.length; (index < length); index ++)
    {
        if (stateA[index] !== stateB[index])
        {
            return false;    
        }
    }

    return true;  
};

// The face value map used in tanslating moves to something human readable. 
RubixState.faceValues = ['R','G','Y','B','O','W'];

RubixState.faceMap = {
    'R':{"value":0},
    'G':{"value":1},
    'Y':{"value":2},
    'B':{"value":3},
    'O':{"value":4},
    'W':{"value":5}
};
/**
 * Defines cubie locations for a side.
 */
RubixState.sideLookUpTable = [
    [ 0, 8, 1,10, 3,11, 2, 9], // red, back
    [ 0, 9, 2,13, 5,16, 4,12], // green, left
    [ 2,11, 3,14, 6,17, 5,13], // yellow, top
    [ 3,10, 1,15, 7,18, 6,14], // blue, right
    [ 5,17, 6,18, 7,19, 4,16], // orange, front    
    [ 4,19, 7,15, 1, 8, 0,12]  // white, bottom
];

RubixState.faceSet = [];

RubixState.edgeWindowSum = 0;

RubixState.edgeWindows ={
  8:0,
  9:1,
  10:3,
  11:0,
  12:5,
  13:2,
  14:2,
  15:5,
  16:1,
  17:4,
  18:3,
  19:4  
};

RubixState.outputFaces = [];

RubixState.cubieOutputMapping={
   0:{"absolute":[ 0, 9,51], "faces":[0,1,5]},
   1:{"absolute":[ 2,53,17], "faces":[0,5,3]},
   2:{"absolute":[ 6,12,11], "faces":[0,2,1]},
   3:{"absolute":[ 8,15,14], "faces":[0,3,2]},
   4:{"absolute":[42,45,27], "faces":[4,5,1]},
   5:{"absolute":[36,29,30], "faces":[4,1,2]},
   6:{"absolute":[38,32,33], "faces":[4,2,3]},
   7:{"absolute":[44,35,47], "faces":[4,3,5]},
   8:{"absolute":[ 1,52],    "faces":[0,5]},
   9:{"absolute":[ 3,10],    "faces":[0,1]},
  10:{"absolute":[ 5,16],    "faces":[0,3]},
  11:{"absolute":[ 7,13],    "faces":[0,2]},
  12:{"absolute":[48,18],    "faces":[5,1]},
  13:{"absolute":[20,21],    "faces":[1,2]},
  14:{"absolute":[23,24],    "faces":[2,3]},
  15:{"absolute":[26,50],    "faces":[3,5]},
  16:{"absolute":[39,28],    "faces":[4,1]},
  17:{"absolute":[37,31],    "faces":[4,2]},
  18:{"absolute":[41,34],    "faces":[4,3]},
  19:{"absolute":[43,46],    "faces":[4,5]}
};

/**
 * The scratch buffer for rotations. This reduces the number of times we have to 
 * create a temporary buffer.
 */
RubixState.scratchBuffer = new Uint8Array(new ArrayBuffer(9));

//Leading character Dominates
RubixState.cubies = {
    "indicies":["RGW", "RWB","RYG","RBY","OWG","OGY","OYB","OBW","RW","RG","RB",
        "RY","WG","GY","YB","BW","OG","OY","OB","OW"],
    "RGW":{"value":0 ,"orientValues":{"R":0, "G":1, "W":2}, "printOrder":["R","G","W"]},
    "RWB":{"value":1 ,"orientValues":{"R":0, "W":1, "B":2}, "printOrder":["R","W","B"]},
    "RYG":{"value":2 ,"orientValues":{"R":0, "Y":1, "G":2}, "printOrder":["R","Y","G"]},
    "RBY":{"value":3 ,"orientValues":{"R":0, "B":1, "Y":2}, "printOrder":["R","B","Y"]},
    "OWG":{"value":4 ,"orientValues":{"O":0, "W":1, "G":2}, "printOrder":["O","W","G"]},
    "OGY":{"value":5 ,"orientValues":{"O":0, "G":1, "Y":2}, "printOrder":["O","G","Y"]},
    "OYB":{"value":6 ,"orientValues":{"O":0, "Y":1, "B":2}, "printOrder":["O","Y","B"]},
    "OBW":{"value":7 ,"orientValues":{"O":0, "B":1, "W":2}, "printOrder":["O","B","W"]},
    "RW" :{"value":8 ,"orientValues":{"R":0, "W":1},        "printOrder":["R","W"]},
    "RG" :{"value":9 ,"orientValues":{"R":0, "G":1},        "printOrder":["R","G"]},
    "RB" :{"value":10,"orientValues":{"R":0, "B":1},        "printOrder":["R","B"]},
    "RY" :{"value":11,"orientValues":{"R":0, "Y":1},        "printOrder":["R","Y"]},
    "WG" :{"value":12,"orientValues":{"W":0, "G":1},        "printOrder":["W","G"]},
    "GY" :{"value":13,"orientValues":{"G":0, "Y":1},        "printOrder":["G","Y"]},
    "YB" :{"value":14,"orientValues":{"Y":0, "B":1},        "printOrder":["Y","B"]},
    "BW" :{"value":15,"orientValues":{"B":0, "W":1},        "printOrder":["B","W"]},
    "OG" :{"value":16,"orientValues":{"O":0, "G":1},        "printOrder":["O","G"]},
    "OY" :{"value":17,"orientValues":{"O":0, "Y":1},        "printOrder":["O","Y"]},
    "OB" :{"value":18,"orientValues":{"O":0, "B":1},        "printOrder":["O","B"]},
    "OW" :{"value":19,"orientValues":{"O":0, "W":1},        "printOrder":["O","W"]}  
};

/**
 * Given the cube's rotating face, a cubie face's current face, and 1 to 3 rotations, this map
 * defines the new face for a cubie face. 
 * 
 * Usage: CubieFace.newFaceMap[rotating face][current cubie face's face][number of rotations]
 */
RubixState.newFaceMap = {
    0 : {
        1 : {
            1 : 5,
            2 : 3,
            3 : 2
        },
        2 : {
            1 : 1,
            2 : 5,
            3 : 3
        },
        3 : {
            1 : 2,
            2 : 1,
            3 : 5
        },
        5 : {
            1 : 3,
            2 : 2,
            3 : 1
        }
    },
    1 : {
        0 : {
            1 : 2,
            2 : 4,
            3 : 5
        },
        2 : {
            1 : 4,
            2 : 5,
            3 : 0
        },
        4 : {
            1 : 5,
            2 : 0,
            3 : 2
        },
        5 : {
            1 : 0,
            2 : 2,
            3 : 4
        }
    },
    2 : {
        0 : {
            1 : 3,
            2 : 4,
            3 : 1
        },
        1 : {
            1 : 0,
            2 : 3,
            3 : 4
        },
        3 : {
            1 : 4,
            2 : 1,
            3 : 0
        },
        4 : {
            1 : 1,
            2 : 0,
            3 : 3
        }
    },
    3 : {
        0 : {
            1 : 5,
            2 : 4,
            3 : 2
        },
        2 : {
            1 : 0,
            2 : 5,
            3 : 4
        },
        4 : {
            1 : 2,
            2 : 0,
            3 : 5
        },
        5 : {
            1 : 4,
            2 : 2,
            3 : 0
        }
    },
    4 : {
        1 : {
            1 : 2,
            2 : 3,
            3 : 5
        },
        2 : {
            1 : 3,
            2 : 5,
            3 : 1
        },
        3 : {
            1 : 5,
            2 : 1,
            3 : 2
        },
        5 : {
            1 : 1,
            2 : 2,
            3 : 3
        }
    },
    5 : {
        0 : {
            1 : 1,
            2 : 4,
            3 : 3
        },
        1 : {
            1 : 4,
            2 : 3,
            3 : 0
        },
        3 : {
            1 : 0,
            2 : 1,
            3 : 4
        },
        4 : {
            1 : 3,
            2 : 0,
            3 : 1
        }
    }
};