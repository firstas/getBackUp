//all vars changes to consts
//change x.0s to xs works, but not gonna risk

const vertexShaderText = `
  precision mediump float;

  attribute vec3 vertPosition;
  attribute vec3 vertColor;
  varying vec3 fragColor;
  uniform mat4 mWorld;
  uniform mat4 mView;
  uniform mat4 mProj;

  void main() {
    fragColor = vertColor;
    gl_Position = mProj*mView*mWorld*vec4(vertPosition, 1.0);
  }
`

const fragmentShaderText = `
  precision mediump float;

  varying vec3 fragColor;

  void main() {
    gl_FragColor = vec4(fragColor, 1.0);
  }
`

const generateCubeEdges = function(size, colors) {
  var oldVertices = 
	[ // X, Y, Z           R, G, B
		// Top
		-1.0, 1.0, -1.0,   0.5, 0.5, 0.5,
		-1.0, 1.0, 1.0,    0.5, 0.5, 0.5,
		1.0, 1.0, 1.0,     0.5, 0.5, 0.5,
		1.0, 1.0, -1.0,    0.5, 0.5, 0.5,

		// Left
		-1.0, 1.0, 1.0,    0.75, 0.25, 0.5,
		-1.0, -1.0, 1.0,   0.75, 0.25, 0.5,
		-1.0, -1.0, -1.0,  0.75, 0.25, 0.5,
		-1.0, 1.0, -1.0,   0.75, 0.25, 0.5,

		// Right
		1.0, 1.0, 1.0,    0.25, 0.25, 0.75,
		1.0, -1.0, 1.0,   0.25, 0.25, 0.75,
		1.0, -1.0, -1.0,  0.25, 0.25, 0.75,
		1.0, 1.0, -1.0,   0.25, 0.25, 0.75,

		// Front
		1.0, 1.0, 1.0,    1.0, 0.0, 0.15,
		1.0, -1.0, 1.0,    1.0, 0.0, 0.15,
		-1.0, -1.0, 1.0,    1.0, 0.0, 0.15,
		-1.0, 1.0, 1.0,    1.0, 0.0, 0.15,

		// Back
		1.0, 1.0, -1.0,    0.0, 1.0, 0.15,
		1.0, -1.0, -1.0,    0.0, 1.0, 0.15,
		-1.0, -1.0, -1.0,    0.0, 1.0, 0.15,
		-1.0, 1.0, -1.0,    0.0, 1.0, 0.15,

		// Bottom
		-1.0, -1.0, -1.0,   0.5, 0.5, 1.0,
		-1.0, -1.0, 1.0,    0.5, 0.5, 1.0,
		1.0, -1.0, 1.0,     0.5, 0.5, 1.0,
		1.0, -1.0, -1.0,    0.5, 0.5, 1.0,
	];

  const halfSize = size/10;
  const skipSide = 4*6;
  const skipCorner = 6;
  var out = new Array(6*4*6)
  for(var side = 0; side < 6; side++) {
    for(var corner = 0; corner < 4; corner++) {
      out[side*skipSide+corner*skipCorner] = oldVertices[side*skipSide+corner*skipCorner]*halfSize;
      out[side*skipSide+corner*skipCorner+1] = oldVertices[side*skipSide+corner*skipCorner+1]*halfSize;
      out[side*skipSide+corner*skipCorner+2] = oldVertices[side*skipSide+corner*skipCorner+2]*halfSize;
      out[side*skipSide+corner*skipCorner+3] = colors[side][0];
      out[side*skipSide+corner*skipCorner+4] = colors[side][1];
      out[side*skipSide+corner*skipCorner+5] = colors[side][2];
    }
  }
  return out;
}

const InitDemo = function() {
  //Initialize WebGL
  const canvas = document.getElementById('game-surface');
  const gl = canvas.getContext('webgl');
  if(!gl)
    alert('Your browser does not support WebGL');
  //maximize size
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  //update gl -1 to 1 coordinates
  gl.viewport(0, 0, window.innerWidth, window.innerHeight);
  //set clear color
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  gl.frontFace(gl.CCW);
  gl.cullFace(gl.BACK);

  //setting up the entire graphics pipeline program
  //create Shader Object
  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  //set shader source
  gl.shaderSource(vertexShader, vertexShaderText);
  gl.shaderSource(fragmentShader, fragmentShaderText)
  //compile code after loading it
  gl.compileShader(vertexShader);
  //check for compilation errors in shaders
  if(!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    console.error('ERROR compiling vertex shader:', gl.getShaderInfoLog(vertexShader));
    return;
  }
  gl.compileShader(fragmentShader);
  if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    console.error('ERROR compiling fragment shader:', gl.getShaderInfoLog(fragmentShader));
    return;
  }
  //set entire program and attach small pieces to it
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  //compiled already and now link
  gl.linkProgram(program);
  //check for linking errors
  if(!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('ERROR linking program', gl.getProgramInfoLog(program));
    return;
  }
  //(optional) catch additional potential issues
  gl.validateProgram(program);
  if(!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
    console.error('ERROR validating program', gl.getProgramInfoLog(program));
    return;
  }
  //buffers for vertex and fragment shaders
  //step 1: it sits in RAM
  var boxVertices = 
	[ // X, Y, Z           R, G, B
		// Top
		-1.0, 1.0, -1.0,   0.5, 0.5, 0.5,
		-1.0, 1.0, 1.0,    0.5, 0.5, 0.5,
		1.0, 1.0, 1.0,     0.5, 0.5, 0.5,
		1.0, 1.0, -1.0,    0.5, 0.5, 0.5,

		// Left
		-1.0, 1.0, 1.0,    0.75, 0.25, 0.5,
		-1.0, -1.0, 1.0,   0.75, 0.25, 0.5,
		-1.0, -1.0, -1.0,  0.75, 0.25, 0.5,
		-1.0, 1.0, -1.0,   0.75, 0.25, 0.5,

		// Right
		1.0, 1.0, 1.0,    0.25, 0.25, 0.75,
		1.0, -1.0, 1.0,   0.25, 0.25, 0.75,
		1.0, -1.0, -1.0,  0.25, 0.25, 0.75,
		1.0, 1.0, -1.0,   0.25, 0.25, 0.75,

		// Front
		1.0, 1.0, 1.0,    1.0, 0.0, 0.15,
		1.0, -1.0, 1.0,    1.0, 0.0, 0.15,
		-1.0, -1.0, 1.0,    1.0, 0.0, 0.15,
		-1.0, 1.0, 1.0,    1.0, 0.0, 0.15,

		// Back
		1.0, 1.0, -1.0,    0.0, 1.0, 0.15,
		1.0, -1.0, -1.0,    0.0, 1.0, 0.15,
		-1.0, -1.0, -1.0,    0.0, 1.0, 0.15,
		-1.0, 1.0, -1.0,    0.0, 1.0, 0.15,

		// Bottom
		-1.0, -1.0, -1.0,   0.5, 0.5, 1.0,
		-1.0, -1.0, 1.0,    0.5, 0.5, 1.0,
		1.0, -1.0, 1.0,     0.5, 0.5, 1.0,
		1.0, -1.0, -1.0,    0.5, 0.5, 1.0,
	];
	var boxIndices =
	[
		// Top
		0, 1, 2,
		0, 2, 3,

		// Left
		5, 4, 6,
		6, 4, 7,

		// Right
		8, 9, 10,
		8, 10, 11,

		// Front
		13, 12, 14,
		15, 14, 12,

		// Back
		16, 17, 18,
		16, 18, 19,

		// Bottom
		21, 20, 22,
		22, 20, 23
	];
  //step 2: chunk of memory on the GPU
  const boxVertexBufferObject = gl.createBuffer();
  //step 3: bind buffers to shaders
  gl.bindBuffer(gl.ARRAY_BUFFER, boxVertexBufferObject);
  //step 4: specify the data on the active buffer
  //(gl.STATIC_DRAW means CPU memory sends to GPU memory once)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(generateCubeEdges(15, [[1, 0, 0], [0, 1, 0], [0, 0, 1], [1, 1, 0], [0, 0, 0], [0, 1, 1]])), gl.STATIC_DRAW);
  const boxIndexBufferObject = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, boxIndexBufferObject);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(boxIndices), gl.STATIC_DRAW);
  //inform the vertex shader that vertPosition is vertexes in triangleVertices
  //step 1: get a handle to attribute
  const positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
  const colorAttribLocation = gl.getAttribLocation(program, 'vertColor');
  //step 2: specify the layout of that attribute
  gl.vertexAttribPointer(positionAttribLocation, 3, gl.FLOAT, gl.FALSE,
    6 * Float32Array.BYTES_PER_ELEMENT, 0);
  gl.vertexAttribPointer(colorAttribLocation, 3, gl.FLOAT, gl.FALSE,
    6 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);
  //step 3: enable attribute for use
  gl.enableVertexAttribArray(positionAttribLocation);
  gl.enableVertexAttribArray(colorAttribLocation);
  //set matrices
  gl.useProgram(program);
  var matWorldUniformLocation = gl.getUniformLocation(program, 'mWorld');
  var matViewUniformLocation = gl.getUniformLocation(program, 'mView');
  var matProjUniformLocation = gl.getUniformLocation(program, 'mProj');
  var worldMatrix = new Float32Array(16);
  var viewMatrix = new Float32Array(16);
  var projMatrix = new Float32Array(16);
  mat4.identity(worldMatrix);
  mat4.lookAt(viewMatrix, [0, 0, -8], [0, 0, 0], [0, 1, 0]);
  mat4.perspective(projMatrix, glMatrix.toRadian(45), canvas.width/canvas.height, 0.1, 1000.0); 
  //send from CPU to GPU shader
  gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
  gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
  gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);

  //main render loop
  const xRotationMatrix = new Float32Array(16);
  const yRotationMatrix = new Float32Array(16);
  var angle = 0;
  var identityMatrix = new Float32Array(16)
  mat4.identity(identityMatrix);
  const loop = function() {
    angle = performance.now()/1000/6*2*Math.PI;
    mat4.rotate(yRotationMatrix, identityMatrix, angle, [0, 1, 0]);
    mat4.rotate(xRotationMatrix, identityMatrix, angle, [1, 0, 0]);
    mat4.mul(worldMatrix, xRotationMatrix, yRotationMatrix);
    gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0)
    requestAnimationFrame(loop) 
  };
  requestAnimationFrame(loop)
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}