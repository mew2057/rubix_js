/* ----------
   rubixCube.js
   
   Represents the Rubik's cube as a JavaScript object.
   ---------- */
/**
 * A full representation of a single Rubik's cube state.
 * @return a default Rubik's state (i.e. an array of 20 undefined cubies)
 */
function RubixState()
{
    //*=face +=color -=unused
    //-***-+++ 2 unused bits per face 2*20 = 40 40/8 = 5 bytes wasted per state. 
    // (48 bytes total [plus some overhead], pretty damn good).
    this.cubies = null;   
    
}

/**
 * The scratch buffer for rotations. This reduces the number of times we have to 
 * create a temporary buffer.
 */
RubixState.scratchBuffer = new Uint8Array(new ArrayBuffer(20));

/**
 * A scratch array used in face rotations.
 */
RubixState.faceSet = [];

/**
 * The cube's faces. They match the rotation map below for cubie face rotations.
 */
RubixState.faces = {
    back : 0,
    left : 1,
    top : 2,
    right : 3,
    front : 4,
    bottom : 5
};

/**
 * The face value map used in tanslating moves to something human readable. 
 */
RubixState.faceValues = ['R','G','Y','B','O','W'];

/**
 * Defines cubie locations for a side.
 */
RubixState.sideLookUpTable = [
    [ 0,24, 3,28, 9,30, 6,26], // red, back
    [ 0,26, 6,34,15,40,12,32], // green, left
    [ 6, 30,9,36,18,42,15,34], // yellow, top
    [ 9,28, 3,38,21,44,18,36], // blue, right
    [15,42,18,44,21,46,12,40], // orange, front    
    [12,46,21,38, 3,24, 0,32]  // white, bottom
];


/**
 * Handles face rotations. 
 * Calculations to reach each cubie
 * 
 * f(c) = c*3 +  0
 * f(s) = s*2 + 24
 * 
 *             c00 s00 c01
 *             s01  R  s02
 *             c02 s03 c03
 * c00 s01 c02 c02 s03 c03 c03 s02 c01
 * s04  G  s05 s05  Y  s06 s06  B  s07
 * c04 s08 c05 c05 s09 c06 c06 s10 c07
 *             c05 s09 c06 
 *             s08  O  s10 
 *             c04 s11 c07
 *             c04 s11 c07
 *             s04  W  s07
 *             c00 s00 c01
 * 
 * @param state The state that is to be changed.
 * @param face The face that the rotation occurs on.
 * @param rotations The number of clockwise rotations for the action.
*/
RubixState.rotate = function(state, face, rotations)
{
    // The inidicies define the rotation behavior.
    var indicies =  RubixState.sideLookUpTable[face];
    
    /*
     * cubie - holds the cubie index.
     * size - A generic size variable.
     * newIndex - Holds a modified index.
     * cFace - A cubieFace.
     * offset - A generic offset variable.
    */
    var cubie, size, newIndex, cFace, offset;
    
    // Iterate over the indicies and calculate values of the rotated cubies.
    for(var index  = 0, scratchIndex =0; index < indicies.length; index ++)
    {
        // Keep track of the cubie location. If it is a side (loc >= 24) size is 2 else 4
        cubie = indicies[index];
        size = cubie >=24 ? 2 : 3;
        
        // For the number of faces calculate individual face rotations and add them to our scratch.
        for(cFace = 0; cFace < size; cFace++)
        {
             RubixState.scratchBuffer[scratchIndex++] = RubixState.rotateFace(
                state.cubies[cubie+cFace], face, rotations);   
        }
    }
    
    // For each cubie shift the face data to the appropriate location in the buffer.
    // This is done in increments of Corner,Side 4 times.
    for (index = 0, size = indicies.length; index < size; index+=2)
    {
        // Calculate the index of the new cubie index after rotation.
        newIndex = indicies[(index + (2 * rotations)) % 8];
        
        // Clear the face set of data.
        RubixState.faceSet.length = 0;
        RubixState.faceSet.length = 6;
        
        // Determine the face of each of the new buffer locations and load the 
        // new index in the appropriate position. This maps face to memory location.
        RubixState.faceSet[state.cubies[newIndex] >> 4] = newIndex;
        RubixState.faceSet[state.cubies[newIndex + 1] >> 4] = newIndex + 1;
        RubixState.faceSet[state.cubies[newIndex + 2] >> 4] = newIndex + 2;

        // Place the cubie face data in the new position.
        for(offset = 0; offset < 3; offset++)
        {
            cFace = RubixState.scratchBuffer[index * 5/2 +offset];
            
            state.cubies[RubixState.faceSet[cFace >> 4]] = cFace;
        }
        
        // See above.
        newIndex = indicies[(index + 1 + (2 * rotations)) % 8];
        
        RubixState.faceSet.length = 0;
        RubixState.faceSet.length = 6;
        
        RubixState.faceSet[state.cubies[newIndex]>> 4] = newIndex;
        RubixState.faceSet[state.cubies[newIndex + 1] >> 4] = newIndex + 1;
        
         for(offset = 3; offset < 5; offset++)
        {
            cFace = RubixState.scratchBuffer[index * 5/2 + offset];
            
            state.cubies[RubixState.faceSet[cFace >> 4]] = cFace;
        }
    }
};

/**
 * Rotates a face with some boolean magic.
 * 
 * @param faceState The Uint8 number representing the cubie face.
 * @param face The face that the rotation is occuring about [0-5].
 * @param rotations The number of counterclockwise rotations [1-3].
 * @return A Uint8 with the following bit pattern: -***-+++ where:
 *  - : null 
 *  + : color
 *  * : face
 */
RubixState.rotateFace = function(faceState, face, rotations)
{
    // Shift right to get the value of the leading for bits.
    var faceVal = Number(faceState >> 4);
    
    // Mask with 00000111 to retrieve the color from the faceState.
    var colorVal = faceState & 7;

    // If the mapping of face rotations is valid perform it, 
    // else it must be unaffected at this phase.
    if ( RubixState.newFaceMap[face][faceVal])
    {
        return (RubixState.newFaceMap[face][faceVal][rotations] << 4) | colorVal;
    }
    else 
    {
        return faceState;   
    }
};

/**
 * Creates a Rubik cube with the goal state.
 */
RubixState.createWithGoalState = function()
{
    // HAHAHAHAHA #JohnDidn'tFeelLikeWritingASeparateInitializer
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
        
    var state = new RubixState();
    state.cubies = new Uint8Array(new ArrayBuffer(48));

    /*
             00 24 03
             26 -R 28
             06 30 09
    02 27 08 07 31 10 11 29 05
    33 -G 35 34 -Y 36 37 -B 39
    14 41 17 15 42 18 20 45 23
             16 43 19
             40 -O 44
             13 47 22
             12 46 21
             32 -W 38
             01 25 04   
    */
    //c0
    state.cubies[0]  = RubixState.createFace(faces[0][0],0);
    state.cubies[1]  = RubixState.createFace(faces[5][6],5);
    state.cubies[2]  = RubixState.createFace(faces[1][0],1);
    
    //c1
    state.cubies[3]  = RubixState.createFace(faces[0][2],0);
    state.cubies[4]  = RubixState.createFace(faces[5][8],5);
    state.cubies[5]  = RubixState.createFace(faces[3][2],3);
    
    //c2
    state.cubies[6]  = RubixState.createFace(faces[0][6],0);
    state.cubies[7]  = RubixState.createFace(faces[2][0],2);
    state.cubies[8]  = RubixState.createFace(faces[1][2],1);
    
    //c3
    state.cubies[9]  = RubixState.createFace(faces[0][8],0);
    state.cubies[10] = RubixState.createFace(faces[2][2],2);
    state.cubies[11] = RubixState.createFace(faces[3][0],3);
    
    //c4
    state.cubies[12] = RubixState.createFace(faces[5][0],5);
    state.cubies[13] = RubixState.createFace(faces[4][6],4);
    state.cubies[14] = RubixState.createFace(faces[1][6],1);
    
    //c5
    state.cubies[15] = RubixState.createFace(faces[2][6],2);
    state.cubies[16] = RubixState.createFace(faces[4][0],4);
    state.cubies[17] = RubixState.createFace(faces[1][8],1);
    
    //c6
    state.cubies[18] = RubixState.createFace(faces[2][8],2);
    state.cubies[19] = RubixState.createFace(faces[4][2],4);
    state.cubies[20] = RubixState.createFace(faces[3][6],3);   
    
    //c7
    state.cubies[21] = RubixState.createFace(faces[5][2],5);
    state.cubies[22] = RubixState.createFace(faces[4][8],4);
    state.cubies[23] = RubixState.createFace(faces[3][8],3);
    
    //s0
    state.cubies[24] = RubixState.createFace(faces[0][1],0);
    state.cubies[25] = RubixState.createFace(faces[5][7],5);
    
    //s1
    state.cubies[26] = RubixState.createFace(faces[0][3],0);
    state.cubies[27] = RubixState.createFace(faces[1][1],1);
    
    //s2
    state.cubies[28] = RubixState.createFace(faces[0][5],0);
    state.cubies[29] = RubixState.createFace(faces[3][1],3);
    
    //s3
    state.cubies[30] = RubixState.createFace(faces[0][7],0);
    state.cubies[31] = RubixState.createFace(faces[2][1],2);
    
    //s4
    state.cubies[32] = RubixState.createFace(faces[5][3],5);
    state.cubies[33] = RubixState.createFace(faces[1][3],1);
    
    //s5
    state.cubies[34] = RubixState.createFace(faces[2][3],2);
    state.cubies[35] = RubixState.createFace(faces[1][5],1);
    
    //s6
    state.cubies[36] = RubixState.createFace(faces[2][5],2);
    state.cubies[37] = RubixState.createFace(faces[3][3],3);
    
    //s7
    state.cubies[38] = RubixState.createFace(faces[5][5],5);
    state.cubies[39] = RubixState.createFace(faces[3][5],3);
    
    //s8
    state.cubies[40] = RubixState.createFace(faces[4][3],4);
    state.cubies[41] = RubixState.createFace(faces[1][7],1);
    
    //s9
    state.cubies[42] = RubixState.createFace(faces[2][7],2);
    state.cubies[43] = RubixState.createFace(faces[4][1],4);
        
    //s10
    state.cubies[44] = RubixState.createFace(faces[4][5],4);
    state.cubies[45] = RubixState.createFace(faces[3][7],3);
    
    //s11
    state.cubies[46] = RubixState.createFace(faces[5][1],5);
    state.cubies[47] = RubixState.createFace(faces[4][7],4);

    return state;
};

//*=face +=color -=unused
//-***-+++ 

/**
 * Creates a UInt8 face state with the following binary encoding: -***-+++ 
 * where:
 *  - : null 
 *  + : color
 *  * : face
 * 
 * Please note there are 2 bits per space wasted.
 * 
 * @param color The uppercase color character that will be encoded to a 3 bit pattern.
 * @param face The face side to be encoded into the state.
 * 
 * @return The encoded face state as a Uint8.
 */
RubixState.createFace = function(color, face)
{
    var tempElement = 0;
    var toAdd = 0;
    
    switch (color)
    {
        case 'R':
            toAdd = 0;
            break;
        case 'G':
            toAdd = 1;
            break;
        case 'Y':
            toAdd = 2;
            break;
        case 'B':
            toAdd = 3;
            break;
        case 'O':
            toAdd = 4;
            break;
        case 'W':
            toAdd = 5;
            break;
        default:
            break;        
    }
    
    return tempElement | (toAdd | (face << 4));   
};

/**
 * Creates a copy of the supplied RubixState object.
 * 
 * @param state The state that is to be copied.
 * @return The copied state.
 */
RubixState.copy = function(state)
{
    var newState = new RubixState(), copy = state.cubies.buffer.slice(0);
    newState.cubies = new Uint8Array(copy);   
    
    return newState;
};

/**
 * The equivalence function for two RubixState objects.
 * @param state1 A state to be checked for equivalence.
 * @param state2 A state to be checked for equivalence.
 * @return true: All faces are equivalent, false: Any state is non equivalent.
 */
RubixState.isEqual = function(state1, state2)
{
    var equal = true;  
    
    /**
     * Iterate over the cubie buffer to find any abberations, leave if a bad state is found.
     */
    for(var index = 0, length = state1.cubies.length; (index < length) & equal; index ++)
    {
        equal = (state1.cubies[index] === state2.cubies[index]);        
    }

    return equal;
};

/**
 * Retrieve the colorID of a face state.
 * @param faceState The face state to retrieve the color from.
 * @return The color ID.
 */
RubixState.colorID = function(faceState)
{
    return RubixState.faceValues[faceState & 7];
};

/**
 * Finds the cubie located at the specified cubie of state1 in state2.
 */
RubixState.findCubie = function(state1, cubie, state2)
{
    var colorId = RubixState.cubieColorId(state1, cubie);
    
    for (var index = 0; index < 20; index++)
    {
        if (RubixState.cubieColorId(state2, index) === colorId)
            return index;
    }
    
    // Should not get here.
    throw "Cubie not found: Invalid cubie";
};

RubixState.areCubiesEqual = function(state1, state2, cubie)
{
    var cubieIndex, cubieIndicies = RubixState.cubieMap[cubie];
    
    for (var index = 0; index < cubieIndicies.length; index++)
    {
        cubieIndex = cubieIndicies[index];
        
        if (state1.cubies[cubieIndex] !== state2.cubies[cubieIndex])
            return false;
    }
    
    return true;
};

/**
 * Returns a unique ID to represent the colors of the faces of the specified cubie.
 * Disregards orientation.
 * @param state the state containing the cubie
 * @param cubie the index of the cubie according to the cubieMap
 * @return a unique color ID.
 */
RubixState.cubieColorId = function(state, cubie)
{
    var colorId = 0, faceIds = [], cubieIndicies = RubixState.cubieMap[cubie], index;
    
    for (index = 0; index < cubieIndicies.length; index++)
    {
        faceIds[index] = state.cubies[cubieIndicies[index]] & 7;
    }
    
    faceIds.sort();
    
    for (index = 0; index < faceIds.length; index++)
    {
        colorId = (colorId << 3) | faceIds[index];
    }
    
    // A corner ID could produce the same as an edge, so vary them by 13 bits
    if (faceIds.length === 2)
        colorId = colorId << 13;
    
    return colorId;
};

/**
 * The to String functionality for a RubixState.
 * @param state The state to retrieve a String from.
 * @return A String for the RubixState object.
 */
RubixState.toString = function(state)
{
    var output = '   ' + RubixState.colorID(state.cubies[0]) + RubixState.colorID(state.cubies[24]) + RubixState.colorID(state.cubies[3]) + '\n' + 
        '   ' + RubixState.colorID(state.cubies[26]) + 'R' + RubixState.colorID(state.cubies[28]) + '\n' + 
        '   ' + RubixState.colorID(state.cubies[6]) + RubixState.colorID(state.cubies[30]) + RubixState.colorID(state.cubies[9]) + '\n' +
        
        RubixState.colorID(state.cubies[2]) + RubixState.colorID(state.cubies[27]) + RubixState.colorID(state.cubies[8]) +
        RubixState.colorID(state.cubies[7]) + RubixState.colorID(state.cubies[31]) + RubixState.colorID(state.cubies[10]) +
        RubixState.colorID(state.cubies[11]) + RubixState.colorID(state.cubies[29]) + RubixState.colorID(state.cubies[5]) + '\n' + 
        
        RubixState.colorID(state.cubies[33]) + 'G' + RubixState.colorID(state.cubies[35]) +
        RubixState.colorID(state.cubies[34]) + 'Y' + RubixState.colorID(state.cubies[36]) +
        RubixState.colorID(state.cubies[37]) + 'B' + RubixState.colorID(state.cubies[39]) + '\n' + 
        
        RubixState.colorID(state.cubies[14]) + RubixState.colorID(state.cubies[41]) + RubixState.colorID(state.cubies[17]) +
        RubixState.colorID(state.cubies[15]) + RubixState.colorID(state.cubies[42]) + RubixState.colorID(state.cubies[18]) +
        RubixState.colorID(state.cubies[20]) + RubixState.colorID(state.cubies[45]) + RubixState.colorID(state.cubies[23]) + '\n' + 
        
        '   ' + RubixState.colorID(state.cubies[16]) + RubixState.colorID(state.cubies[43]) + RubixState.colorID(state.cubies[19]) + '\n' + 
        '   ' + RubixState.colorID(state.cubies[40]) + 'O' + RubixState.colorID(state.cubies[44]) + '\n' + 
        '   ' + RubixState.colorID(state.cubies[13]) + RubixState.colorID(state.cubies[47]) + RubixState.colorID(state.cubies[22]) + '\n' +
        
        '   ' + RubixState.colorID(state.cubies[12]) + RubixState.colorID(state.cubies[46]) + RubixState.colorID(state.cubies[21]) + '\n' + 
        '   ' + RubixState.colorID(state.cubies[32]) + 'W' + RubixState.colorID(state.cubies[38]) + '\n' + 
        '   ' + RubixState.colorID(state.cubies[1]) + RubixState.colorID(state.cubies[25]) + RubixState.colorID(state.cubies[4]) + '\n';
        
    return output;
        
    
};

RubixState.cubieMap = {
    0 : [0, 1, 2], // c00
    1 : [24, 25],
    2 : [3, 4, 5], // c01
    3 : [26, 27],
    4 : [28, 29],
    5 : [6, 7, 8], // c02
    6 : [30, 31],
    7 : [9, 10, 11], // c03
    8 : [32, 33],
    9 : [34, 35],
    10 : [36, 37],
    11 : [38, 39],
    12 : [15, 16, 17], // c05
    13 : [42, 43],
    14 : [18, 19, 20], // c06
    15 : [40, 41],
    16 : [44, 45],
    17 : [12, 13, 14], // c04
    18 : [46, 47],
    19 : [21, 22, 23] // c07
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