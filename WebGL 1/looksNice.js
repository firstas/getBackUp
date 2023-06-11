const vertexShaderText = `
  precision mediump float;

  attribute vec2 vertPosition;
  attribute vec3 vertColor;
  varying vec3 fragColor;

  void main() {
    fragColor = vertColor;
    gl_Position = vec4(vertPosition, 0.0, 1.0);
  }
`

const fragmentShaderText = `
  precision mediump float;

  varying vec3 fragColor;

  void main() {
    gl_FragColor = vec4(fragColor, 1.0);
  }
`

const InitDemo = function() {
  //Initialize WebGL
  const canvas = document.getElementById('game-surface');
  const gl = canvas.getContext('webgl');
  if(!gl)
    alert('Your browser does not support WebGL');
  //maximize size
  // canvas.width = window.innerWidth;
  // canvas.height = window.innerHeight;
  //update gl -1 to 1 coordinates
  // gl.viewport(0, 0, window.innerWidth, window.innerHeight);
  //set clear color
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

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
  const triangleVertices = [
    // X, Y     R, G, B
    0.0, 0.0,   1.0, 0.0, 0.0,
    -0.5, 0.5,  0.0, 1.0, 0.0,
    -0.3,  0.7,  0.0, 0.0, 1.0,

    0.0, 1.0,   1.0, 0.0, 0.0,
    0.3,  0.7, 0.0, 1.0, 0.0,
    0.5,  0.5,  0.0, 0.0, 1.0
  ];
  //step 2: chunk of memory on the GPU
  const triangleVertexBufferObject = gl.createBuffer();
  //step 3: bind buffers to shaders
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBufferObject);
  //step 4: specify the data on the active buffer
  //(gl.STATIC_DRAW means CPU memory sends to GPU memory once)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.STATIC_DRAW);
  //inform the vertex shader that vertPosition is vertexes in triangleVertices
  //step 1: get a handle to attribute
  const positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
  const colorAttribLocation = gl.getAttribLocation(program, 'vertColor');
  //step 2: specify the layout of that attribute
  gl.vertexAttribPointer(positionAttribLocation, 2, gl.FLOAT, gl.FALSE,
    5 * Float32Array.BYTES_PER_ELEMENT, 0);
  gl.vertexAttribPointer(colorAttribLocation, 3, gl.FLOAT, gl.FALSE,
    5 * Float32Array.BYTES_PER_ELEMENT, 2 * Float32Array.BYTES_PER_ELEMENT);
  //step 3: enable attribute for use
  gl.enableVertexAttribArray(positionAttribLocation);
  gl.enableVertexAttribArray(colorAttribLocation);
  //main render loop
  gl.useProgram(program);
  gl.drawArrays(gl.TRIANGLE_FAN, 0, 6);
}