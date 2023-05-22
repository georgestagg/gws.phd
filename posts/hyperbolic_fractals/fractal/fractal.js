function getShader ( gl, id ){
    var shaderScript = document.getElementById ( id );
    var str = "";
    var k = shaderScript.firstChild;
    while ( k ){
        if ( k.nodeType == 3 ) str += k.textContent;
        k = k.nextSibling;
    }
    var shader;
    if ( shaderScript.type == "x-shader/x-fragment" )
            shader = gl.createShader ( gl.FRAGMENT_SHADER );
    else if ( shaderScript.type == "x-shader/x-vertex" )
            shader = gl.createShader(gl.VERTEX_SHADER);
    else return null;
    gl.shaderSource(shader, str);
    gl.compileShader(shader);
    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS) == 0)
        alert(gl.getShaderInfoLog(shader));
    return shader;
}
var c = document.getElementById("fractal");
var gl = c.getContext("experimental-webgl",{antialias: false, depth: false, alpha: false});
var prog  = gl.createProgram();
gl.attachShader(prog, getShader( gl, "shader-vs" ));
gl.attachShader(prog, getShader( gl, "shader-fs" ));
gl.linkProgram(prog);

console.log(gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER,gl.HIGH_FLOAT).precision);
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var x=-0.11797382149338043;
var y=0.761550513837472 ;
var Tx=0.0;
var Ty=0.0;
var Zoom=0.1;
var dz = 0;
var dx = 0;
var dy = 0;
var mx;
var my;

function draw() {
    stats.begin();
    if(isDown){
        x += 0.1*(mx-scale/2.)/scale*Math.pow((1.1-Zoom),7.0);
        y -= 0.1*(my-scale/2.)/scale*Math.pow((1.1-Zoom),7.0);
        gl.uniform2f(gl.getUniformLocation(prog, "xy"), x, y);
    }
    Zoom += dz;
    x += dx*Math.pow((1.1-Zoom),7.0);
    y += dy*Math.pow((1.1-Zoom),7.0);
    gl.uniform2f(gl.getUniformLocation(prog, "xy"), x, y);
    gl.uniform1f(gl.getUniformLocation(prog, "zoom"), Zoom);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    stats.end();
    window.setTimeout(window.requestAnimationFrame.bind(window, draw),5);
}

if( gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE)
    alert("FRAMEBUFFER not complete");

gl.useProgram(prog);
var aPosLoc = gl.getAttribLocation(prog, "aPos");
gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 0,0,  1,-1, 1,0,  -1,1, 0,1, 1,1, 1,1]), gl.STATIC_DRAW);
gl.vertexAttribPointer(aPosLoc, 2, gl.FLOAT, gl.FALSE, 16, 0);
gl.enableVertexAttribArray( aPosLoc );

var scale = ((window.innerHeight<window.innerWidth)?window.innerHeight:window.innerWidth);
gl.canvas.width = gl.canvas.height = scale;
gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
gl.uniform2f(gl.getUniformLocation(prog, "resolution"), gl.canvas.width, gl.canvas.height);
gl.uniform2f(gl.getUniformLocation(prog, "xy"), x, y);

$( window ).resize(function() {
    var scale = ((window.innerHeight<window.innerWidth)?window.innerHeight:window.innerWidth);
    gl.canvas.width = gl.canvas.height = scale;
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.uniform2f(gl.getUniformLocation(prog, "resolution"), gl.canvas.width, gl.canvas.height);
});

c.addEventListener("touchend", function (e) {
    //gl.useProgram(prog);
    //gl.uniform1i(gl.getUniformLocation(prog, "addPot"), 0);
}, false);

c.addEventListener("touchmove", function (e) {
    var touch = e.touches[0];
    var rect = c.getBoundingClientRect();
    var mx =  touch.clientX - rect.left;
    var my =  touch.clientY - rect.top;
}, false);


var isDown = false;
var isKeyDown = false;
$("#fractal")
.mousedown(function() {
    isDragging = false;
    isDown = true;
})
.mousemove(function(e) {
    mx = (e.offsetX != null) ? e.offsetX : e.originalEvent.layerX;
    my = (e.offsetY != null) ? e.offsetY : e.originalEvent.layerY;
 })
.mouseup(function(e) {
    isDown = false;
});

$("body").mouseup(function(e) {
    isDown = false;
})
.keydown(function (e) {
  if (e.which === 87) {
        isKeyDown = true;
        dz = 0.001;
        dx = 0;
    }
  if (e.which === 83) {
        isKeyDown = true;
        dz = -0.001;
        dx = 0;
    }

  if (e.which === 65) {
        isKeyDown = true;
        dx = -0.02;
    }
  if (e.which === 68) {
        isKeyDown = true;
        dx = 0.02;
    }
}).keyup(function (e) {

    if (e.which === 87) {
        dz = 0;
    }
  if (e.which === 83) {
        dz = 0;
    }
  if (e.which === 65) {
        dx = 0;
    }
  if (e.which === 68) {
        dx = 0;
    }
});

var stats = new Stats();
stats.showPanel( 0 );
document.body.appendChild( stats.dom );
var gui = new dat.GUI();
var gammaController = gui.add(window, 'Zoom',0.1,1.0).step(0.001);


draw();