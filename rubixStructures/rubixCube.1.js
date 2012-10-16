/* ----------
   rubixCube.js
   
   Represents the Rubik's cube as a JavaScript object.
   ---------- */


// I can actually halve the size of this,but I'm not doing that unless I have to(it's hard...)
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

RubixState.scratchBuffer = new Uint8Array(new ArrayBuffer(20));

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

RubixState.faceValues = ['R','G','Y','B','O','W'];

// The logic behind this still works and only one copy of this need exist.
RubixState.sideLookUpTable = [
    [ 0,24, 3,28, 9,30, 6,26], // red, back
    [ 0,26, 6,34,15,40,12,32], // green, left
    [ 6, 30,9,36,18,42,15,34], // yellow, top
    [ 9,28, 3,38,21,44,18,36], // blue, right
    [15,42,18,44,21,46,12,40], // orange, front    
    [12,46,21,38, 3,24, 0,32]  // white, bottom
];

RubixState.colorSet =[];

/**
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
*/
RubixState.rotate = function(state, face, rotations)
{
    var indicies =  RubixState.sideLookUpTable[face];
    var cubie, size,newIndex, cFace,offset;
    
    for(var index  = 0, scratchIndex =0; index < indicies.length; index ++)
    {
        cubie = indicies[index];
        size = cubie >=24 ? 2 : 3;
        for(cFace = 0; cFace < size; cFace++)
        {
             RubixState.scratchBuffer[scratchIndex++] = RubixState.rotateFace(
                state.cubies[cubie+cFace], face, rotations);   
        }
    }
    
    //3,2, 3,2, 3,2, 3,2    
    for (index = 0; index < indicies.length; index+=2)
    {
        newIndex = indicies[(index + (2 * rotations)) % 8];
        
        RubixState.colorSet.length = 0;
        RubixState.colorSet.length = 6;
        
        RubixState.colorSet[state.cubies[newIndex] & 7] = newIndex;
        RubixState.colorSet[state.cubies[newIndex + 1] & 7] = newIndex + 1;
        RubixState.colorSet[state.cubies[newIndex + 2] & 7] = newIndex + 2;


        for(offset = 0; offset < 3; offset++)
        {
            cFace = RubixState.scratchBuffer[index * 5/2 +offset];
            
            state.cubies[RubixState.colorSet[cFace >> 4]] = cFace;
        }

        newIndex = indicies[(index + 1 + (2 * rotations)) % 8];
        
        RubixState.colorSet.length = 0;
        RubixState.colorSet.length = 6;

        
        RubixState.colorSet[state.cubies[newIndex] & 7] = newIndex;
        RubixState.colorSet[state.cubies[newIndex + 1] & 7] = newIndex + 1;
        
         for(offset = 3; offset < 5; offset++)
        {
            cFace = RubixState.scratchBuffer[index * 5/2 + offset];
            
            state.cubies[RubixState.colorSet[cFace >> 4]] = cFace;
        }
    }
};

RubixState.rotateFace = function(faceState, face, rotations)
{
    var faceVal = Number(faceState >> 4);
    var colorVal = faceState & 7;

    if ( RubixState.newFaceMap[face][faceVal])
    {
        return (RubixState.newFaceMap[face][faceVal][rotations] << 4) | colorVal;
    }
    else 
    {
        return faceState;   
    }
};

RubixState.createWithGoalState = function()
{
    // HAHAHAHAHA -John
    return RubixState.createWithString("RRRRRRRRRGGGYYYBBBGGGYYYBBBGGGYYYBBBOOOOOOOOOWWWWWWWWW");
};

RubixState.createWithString = function(text)
{
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

RubixState.copy = function(state)
{
    var newState = new RubixState(), copy = state.cubies.buffer.slice(0);
    newState.cubies = new Uint8Array(copy);
   
    return newState;
};

RubixState.isEqual = function(state1, state2)
{
    var equal = true;  

    for(var index = 0, length = state1.cubies.length; index < length; index ++)
    {
        equal = (state1.cubies[index] === state2.cubies[index]);
        
        if(!equal)
        {
            break;    
        }
    }

    return equal;
};


RubixState.colorID = function(face)
{
    return RubixState.faceValues[face & 7];
};

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




/**
 * Given the cube's rotating face, a cubie face's current face, and 1 to 3 rotations, this map
 * defines the new face for a cubie face. 
 * 
 * Usage: CubieFace.newFaceMap[rotating face][current cubie face's face][number of rotations]
 * 
 * There's probably a better way to do this...
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

