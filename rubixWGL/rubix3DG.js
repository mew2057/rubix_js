/*
 *  Rubix3DG.js 
 *  requires:
 *      rubixCube.js, rubixShader.js    
 *
 *  Contains the initializer for the WebGL rubix cube.
 *
 */

function Rubix3DG()
{
    this.canvas = null;
    this.context = null;
    this.cubies = null;
}

Rubix3DG.init = function()
{
    var rubix = new Rubix3DG();
    rubix.canvas = document.getElementById("playWindow");
    rubix.context = rubix.canvas.getContext("experimental-webgl");
    rubix.context.clearColor(0.0, 0.0, 1.0, 1.0);
    rubix.context.clear(rubix.context.COLOR_BUFFER_BIT);
};

function Cubie()
{
    this.vetices=null;
}
