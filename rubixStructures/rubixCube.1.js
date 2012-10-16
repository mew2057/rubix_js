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
    this.cubies = new Uint8Array(new ArrayBuffer(48));
    
    
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

// The logic behind this still works and only one copy of this need exist.
RubixState.sideLookUpTable = [
    [ 0,24, 3,28, 9,30, 6,26], // red, back
    [ 0,26, 6,34,15,40,12,32], // green, left
    [ 6, 30,9,36,18,42,15,34], // yellow, top
    [ 9,28, 3,38,21,44,18,36], // blue, right
    [15,42,18,34,21,46,12,40], // orange, front    
    [12,46,21,38, 3,24, 0,32]  // white, bottom
];

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
    var cubie, size,newIndex,offset, cFace;
    
    for(var index in indicies)
    {
        cubie = indicies[index];
        size = cubie >=24 ? 2 : 3;
        
        for(cFace = 0; cFace < size; cFace++)
        {
            RubixState.scratchBuffer[index+cFace] = RubixState.rotateFace(
                state.cubies[cubie+cFace], face, rotations);   
        }
    }
    
    //3,2, 3,2, 3,2, 3,2    
    for (index = 0; index < RubixState.scratchBuffer.length; index+=2)
    {
        newIndex = indicies[(index + (2 * rotations)) % 8];
        
        for(offset = 0; offset < 3; offset++)
        {
            state.cubies[newIndex + offset] = RubixState.scratchBuffer[index * 5 + offset];
        }
        
        newIndex = indicies[(index + 1 + (2 * rotations)) % 8];
        
        for(offset = 0; offset < 2; offset++)
        {
            state.cubies[newIndex + offset] = RubixState.scratchBuffer[index * 5 + offset + 3];
        }
    }
};

RubixState.rotateFace = function(faceState, face, rotations)
{
    var faceVal = Number(faceState >> 4);
    var colorVal = faceState & 7;
    
    if ( CubieFace.newFaceMap[face][faceVal])
    {
        return (CubieFace.newFaceMap[face][faceVal][rotations] << 5) | colorVal;
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
    console.log(RubixState.toString(state));
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
    
};

RubixState.faceValues = ['R','G','Y','B','O','W'];

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
CubieFace.newFaceMap = {
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

//--------------------------------------------------------------------------------------

/**
 * Rotates the cube 1 to 3 rotations in the clockwise direction given the face.
 * @param {number} face the face of the cube to rotate
 * @param {number} rotations the number of rotations
 */
RubixState.prototype.rotate = function(face, rotations)
{
    var indicies = RubixState.sideLookUpTable[face];
    
    var tempCubies = [], newIndex, index;
    
    for (index = 0; index < indicies.length; index++)
    {
        tempCubies[indicies[index]] = this.cubies[indicies[index]];
        tempCubies[indicies[index]].rotate(face, rotations);
    }
    
    for (index = 0; index < indicies.length; index++)
    {
        newIndex = (index + (2 * rotations)) % 8;
        this.cubies[indicies[newIndex]] = tempCubies[indicies[index]];
    }
};

/**
 * Finds and returns the index of the given cubie on this cube state.
 * @return the index of the given cubie.
 */
RubixState.prototype.findCubie = function(cubie)
{
    for (var index = 0; index < this.cubies.length; index++)
    {
        if (cubie.colorId() === this.cubies[index].colorId())
            return index;
    }
    
    // Should not get here.
    throw "Cubie not found: Invalid cubie";
};

/**
 * Returns a copy of this state.
 * @return a copy of this state
 */
RubixState.prototype.copy = function()
{
    var copy = new RubixState();
    for (var index in this.cubies)
        copy.cubies[index] = this.cubies[index].copy();
    return copy;
};

/**
 * Converts this cube to a formatted string. 
 * @return the cube represented as a string
 */
RubixState.prototype.toString = function(spaces)
{
    var newLine = spaces ? "\n" : "";
    var space = spaces ? "   " : "";
    
    // Back
    var rubixStr = space + this.cubies[0].getColor(RubixState.faces.back) + this.cubies[1].getColor(RubixState.faces.back) + this.cubies[2].getColor(RubixState.faces.back) + newLine +
                   space + this.cubies[3].getColor(RubixState.faces.back) + RubixState.colors.red + this.cubies[4].getColor(RubixState.faces.back) + newLine +
                   space + this.cubies[5].getColor(RubixState.faces.back) + this.cubies[6].getColor(RubixState.faces.back) + this.cubies[7].getColor(RubixState.faces.back) + newLine +
    // Left Top Right, 1st row
                   this.cubies[0].getColor(RubixState.faces.left) + this.cubies[3].getColor(RubixState.faces.left) + this.cubies[5].getColor(RubixState.faces.left) + 
                   this.cubies[5].getColor(RubixState.faces.top) + this.cubies[6].getColor(RubixState.faces.top) + this.cubies[7].getColor(RubixState.faces.top) + 
                   this.cubies[7].getColor(RubixState.faces.right) + this.cubies[4].getColor(RubixState.faces.right) + this.cubies[2].getColor(RubixState.faces.right) + newLine +
    // Left Top Right, 2nd row
                   this.cubies[8].getColor(RubixState.faces.left) + RubixState.colors.green + this.cubies[9].getColor(RubixState.faces.left) + 
                   this.cubies[9].getColor(RubixState.faces.top) + RubixState.colors.yellow + this.cubies[10].getColor(RubixState.faces.top) + 
                   this.cubies[10].getColor(RubixState.faces.right) + RubixState.colors.blue + this.cubies[11].getColor(RubixState.faces.right) + newLine +
    // Left Top Right, 3rd row
                   this.cubies[17].getColor(RubixState.faces.left) + this.cubies[15].getColor(RubixState.faces.left) + this.cubies[12].getColor(RubixState.faces.left) + 
                   this.cubies[12].getColor(RubixState.faces.top) + this.cubies[13].getColor(RubixState.faces.top) + this.cubies[14].getColor(RubixState.faces.top) + 
                   this.cubies[14].getColor(RubixState.faces.right) + this.cubies[16].getColor(RubixState.faces.right) + this.cubies[19].getColor(RubixState.faces.right) + newLine +
    // Front
                   space + this.cubies[12].getColor(RubixState.faces.front) + this.cubies[13].getColor(RubixState.faces.front) + this.cubies[14].getColor(RubixState.faces.front) + newLine +
                   space + this.cubies[15].getColor(RubixState.faces.front) + RubixState.colors.orange + this.cubies[16].getColor(RubixState.faces.front) + newLine +
                   space + this.cubies[17].getColor(RubixState.faces.front) + this.cubies[18].getColor(RubixState.faces.front) + this.cubies[19].getColor(RubixState.faces.front) + newLine +
    // Bottom
                   space + this.cubies[17].getColor(RubixState.faces.bottom) + this.cubies[18].getColor(RubixState.faces.bottom) + this.cubies[19].getColor(RubixState.faces.bottom) + newLine +
                   space + this.cubies[8].getColor(RubixState.faces.bottom) + RubixState.colors.white + this.cubies[11].getColor(RubixState.faces.bottom) + newLine +
                   space + this.cubies[0].getColor(RubixState.faces.bottom) + this.cubies[1].getColor(RubixState.faces.bottom) + this.cubies[2].getColor(RubixState.faces.bottom);  
               
    return rubixStr;     
};

/**
 * Returns a new Rubik's cube state set up as the goal state.
 * @return a new Rubik's cube state set up as the goal state
 */
RubixState.initWithGoalState = function()
{
    var goalState = new RubixState();
    
    goalState.cubies = [
        // In order according to the representation below.
        Cubie.create(RubixState.colors.red, RubixState.colors.white, RubixState.colors.green),
        Cubie.create(RubixState.colors.red, RubixState.colors.white),
        Cubie.create(RubixState.colors.red, RubixState.colors.white, RubixState.colors.blue),
        Cubie.create(RubixState.colors.red, RubixState.colors.green),
        Cubie.create(RubixState.colors.red, RubixState.colors.blue),
        Cubie.create(RubixState.colors.red, RubixState.colors.yellow, RubixState.colors.green),
        Cubie.create(RubixState.colors.red, RubixState.colors.yellow),
        Cubie.create(RubixState.colors.red, RubixState.colors.yellow, RubixState.colors.blue),
        Cubie.create(RubixState.colors.white, RubixState.colors.green),
        Cubie.create(RubixState.colors.yellow, RubixState.colors.green),
        Cubie.create(RubixState.colors.yellow, RubixState.colors.blue),
        Cubie.create(RubixState.colors.white, RubixState.colors.blue),
        Cubie.create(RubixState.colors.yellow, RubixState.colors.orange, RubixState.colors.green),
        Cubie.create(RubixState.colors.yellow, RubixState.colors.orange),
        Cubie.create(RubixState.colors.yellow, RubixState.colors.orange, RubixState.colors.blue),
        Cubie.create(RubixState.colors.orange, RubixState.colors.green),
        Cubie.create(RubixState.colors.orange, RubixState.colors.blue),
        Cubie.create(RubixState.colors.white, RubixState.colors.orange, RubixState.colors.green),
        Cubie.create(RubixState.colors.white, RubixState.colors.orange),
        Cubie.create(RubixState.colors.white, RubixState.colors.orange, RubixState.colors.blue)
    ];
    
    for (var index in goalState.cubies)
        goalState.cubies[index].faces.sort(function(a,b){return a.face - b.face;});
    
    return goalState;
};

RubixState.initWithString = function(text)
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
    
    var tempState = new RubixState();
    
    tempState.cubies = [
        // In order according to the representation below.
        Cubie.create(faces[0][0], faces[5][6], faces[1][0],0, 5, 1),
        Cubie.create(faces[0][1], faces[5][7], null, 0, 5),
        Cubie.create(faces[0][2], faces[5][8], faces[3][2], 0, 5, 3),
        Cubie.create(faces[0][3], faces[1][1], null, 0, 1),
        Cubie.create(faces[0][5], faces[3][1], null, 0, 3),
        Cubie.create(faces[0][6], faces[2][0], faces[1][2], 0, 2, 1),
        Cubie.create(faces[0][7], faces[2][1], null, 0, 2),
        Cubie.create(faces[0][8], faces[2][2], faces[3][0], 0, 2, 3),
        Cubie.create(faces[5][3], faces[1][3], null, 5, 1),
        Cubie.create(faces[2][3], faces[1][5], null, 2, 1),
        Cubie.create(faces[2][5], faces[3][3], null, 2, 3),
        Cubie.create(faces[5][5], faces[3][5], null, 5, 3),
        Cubie.create(faces[2][6], faces[4][0], faces[1][8], 2, 4, 1),
        Cubie.create(faces[2][7], faces[4][1], null, 2, 4),
        Cubie.create(faces[2][8], faces[4][2], faces[3][6], 2, 4, 3),
        Cubie.create(faces[4][3], faces[1][7], null, 4, 1), 
        Cubie.create(faces[4][5], faces[3][7], null, 4, 3),
        Cubie.create(faces[5][0], faces[4][6], faces[1][6], 5, 4, 1),
        Cubie.create(faces[5][1], faces[4][7], null, 5, 4),
        Cubie.create(faces[5][2], faces[4][8], faces[3][8], 5, 4, 3)
    ];
    for (var index in tempState.cubies)
        tempState.cubies[index].faces.sort(function(a,b){return a.face - b.face;});
    
    return tempState;
};

/**
 * The cube's colors. 
 */
RubixState.colors = {
    red : "R",
    green : "G",
    yellow : "Y",
    blue : "B",
    orange : "O",
    white : "W"
};



/**
 * This sets up the indicies in reference to a clockwise pattern. 
 * 
 *           00 01 02
 *           03 Re 04
 *           05 06 07
 * 
 * 00 03 05  05 06 07  07 04 02
 * 08 Gr 09  09 Ye 10  10 Bl 11
 * 17 15 12  12 13 14  14 16 19
 * 
 *           12 13 14
 *           15 Or 16
 *           17 18 19
 * 
 *           17 18 19
 *           08 Wh 11
 *           00 01 02
 *
RubixState.sideLookUpTable = [
    [ 7, 6, 5, 3, 0, 1, 2, 4], // red, back
    [ 5, 9,12,15,17, 8, 0, 3], // green, left
    [ 5, 6, 7,10,14,13,12, 9], // yellow, top
    [14,10, 7, 4, 2,11,19,16], // blue, right
    [12,13,14,16,19,18,17,15], // orange, front
    [17,18,19,11, 2, 1, 0, 8]  // white, bottom
];*/


/**
 * Defines a new cubie.
 * @param {Object} faces an array of 2 or 3 cubie faces (depending on if it's a side or corner)
 */
function Cubie(faces)
{
    // The cubie's faces (2 for sides, 3 for corners)
    this.faces = faces.slice(0); // Copy array
}

/**
 * Rotates the cubie 1 to 3 rotations in the clockwise direction given the face.
 * @param {number} face the face of the cube to rotate
 * @param {number} rotations the number of rotations
 */
Cubie.prototype.rotate = function(face, rotations)
{
    for (var index in this.faces)
    {
        // Face doesn't change if it's the rotating face.
        if (this.faces[index].face === face)
            continue;
        
        this.faces[index].rotate(face, rotations);
    }
    
    this.faces.sort(function(a,b){return a.face - b.face;});
};

/**
 * Returns an identifier for this cubie based on its colors. Disregards position.
 * @return an identifier for this cubie
 */
Cubie.prototype.colorId = function()
{
    var colors = [];
    for (var index in this.faces)
        colors.push(this.faces[index].color);
    
    colors.sort();
    var id = "";

    for (index in colors)
        id += colors[index];
    
    return id;
};

/**
 * Returns the color on the given face of this cubie. 
 * @param {number} face the specified face
 */
Cubie.prototype.getColor = function(face)
{
    for (var i in this.faces)
    {
        if (this.faces[i].face === face)
            return this.faces[i].color;
    }
};

/**
 * Returns true if the cubie is valid. Only checks colors, since a cubie doesn't
 * know if it's in the correct position. (Not sure if this will be useful...)
 * @return true if the cubie is valid, false otherwise. 
 */
Cubie.prototype.isValid = function() 
{
    // Check if all sides are different colors
    if (this.isSide())
    {
        if (this.faces[0].color == this.faces[1].color)
            return false;
    }
    else if (this.isCorner())
    {
        if (this.faces[0].color == this.faces[1].color ||
            this.faces[1].color == this.faces[2].color ||
            this.faces[0].color == this.faces[2].color)
            return false;
    }
    
    return false;
};

/**
 * Returns true if the cubie is a side cube.
 * @return true if the cubie is a side, false otherwise. 
 */
Cubie.prototype.isSide = function()
{
    return this.faces.length === 2;
};

/**
 * Returns true if the cubie is a corner cube.
 * @return true if the cubie is a corner, false otherwise. 
 */
Cubie.prototype.isCorner = function()
{
    return this.faces.length === 3;
};

Cubie.prototype.equals = function(other)
{
    return JSON.stringify(this) === JSON.stringify(other);
};

/**
 * Returns a copy of this cubie.
 * @return a copy of this cubie
 */
Cubie.prototype.copy = function()
{
    var faces = [];
    for (var index in this.faces)
        faces[index] = this.faces[index].copy();
    return new Cubie(faces);
};

/**
 * Creates a new cubie given 2 or 3 colors and faces.
 * @param {number} color1 the color of the first face.
 * @param {number} color2 the color of the second face.
 * @param {number} color3 the color of the third face (optional if a side cubie).
 * @param {number} face1 the direction of the first face (optional if assuming goal state).
 * @param {number} face2 the direction of the second face (optional if assuming goal state).
 * @param {number} face3 the direction of the third face (optional if assuming goal state).
 * @return a new Cubie.
 */
Cubie.create = function(color1, color2, color3, face1, face2, face3)
{
    face1 = face1 == null ? Cubie.defaultFace(color1) : face1;
    face2 = face2 == null ? Cubie.defaultFace(color2) : face2;
    
    // A side
    if (color3 == null)
    {        
        return new Cubie([new CubieFace(color1, face1),
                          new CubieFace(color2, face2)]);
    }
    
    // A corner
    face3 = face3 == null ? Cubie.defaultFace(color3) : face3;
    
    return new Cubie([new CubieFace(color1, face1),
                      new CubieFace(color2, face2),
                      new CubieFace(color3, face3)]);
};

/**
 * Returns the default face of the given color ( assumes the cube is in the goal state). 
 * @param {number} color the specified color
 * @return the default face
 */
Cubie.defaultFace = function(color)
{
    switch (color)
    {
        case RubixState.colors.yellow:
            return RubixState.faces.top;
        case RubixState.colors.red:
            return RubixState.faces.back;
        case RubixState.colors.white:
            return RubixState.faces.bottom;
        case RubixState.colors.orange:
            return RubixState.faces.front;
        case RubixState.colors.green:
            return RubixState.faces.left;
        case RubixState.colors.blue:
            return RubixState.faces.right;
        default:
            return undefined;
    }
};

/**
 * Defines a cubie face. 
 * @param {number} color the cubie face's color.
 * @param {number} face the cubie face's direction.
 * @return a new cubie face.
 */
function CubieFace(color, face)
{
    this.color = color;
    this.face =  face;
}

/**
 * Rotates the cubie face 1 to 3 rotations in the clockwise direction given the face.
 * Rotating the cubie face only means redefining its face direction depending on the rotation.
 * @param {number} face the face of the cube to rotate (not the cubie face's face)
 * @param {number} rotations the number of rotations
 */
CubieFace.prototype.rotate = function(face, rotations)
{
    // Added a tenary operator to handle an undefined issue.
    this.face = CubieFace.newFaceMap[face][this.face]? 
        CubieFace.newFaceMap[face][this.face][rotations]:this.face;
};

/**
 * Returns a copy of this cubie face.
 * @return a copy of this cubie face
 */
CubieFace.prototype.copy = function()
{
    return new CubieFace(this.color, this.face);
};


