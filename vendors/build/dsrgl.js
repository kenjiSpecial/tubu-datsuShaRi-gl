(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.dsr = {})));
}(this, (function (exports) { 'use strict';

	var FLOAT = 0x1406;

	/**
	 * get uniform locations
	 *
	 * @param {WebGLRenderingContext} gl
	 * @param {WebGLProgram} program
	 * @param {Array} arr
	 *
	 * @returns {object} uniformLocation
	 */
	function getUniformLocations(gl, program, arr) {
		var locations = {};

		for (var ii = 0; ii < arr.length; ii++) {
			var name = arr[ii];
			var uniformLocation = gl.getUniformLocation(program, name);
			locations[name] = uniformLocation;
		}

		return locations;
	}

	/**
	 * compile shader based on three.js
	 */

	function addLineNumbers(string) {
		var lines = string.split('\n');

		for (var i = 0; i < lines.length; i++) {
			lines[i] = i + 1 + ': ' + lines[i];
		}

		return lines.join('\n');
	}

	/**
	 * compile webgl shader
	 *
	 * @param {WebGLRenderingContext} gl
	 * @param {*} type
	 * @param {*} shaderSource
	 */
	function compileGLShader(gl, type, shaderSource) {
		var shader = gl.createShader(type);

		gl.shaderSource(shader, shaderSource);
		gl.compileShader(shader);

		if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			return shader;
		} else {
			console.error("[WebGLShader]: Shader couldn't compile.");

			if (gl.getShaderInfoLog(shader) !== '') {
				console.warn('[WebGLShader]: gl.getShaderInfoLog()', type === gl.VERTEX_SHADER ? 'vertex' : 'fragment', gl.getShaderInfoLog(shader), addLineNumbers(shaderSource));

				return null;
			}
		}
	}

	/**
	 * create program
	 *
	 * @param {WebGLRenderingContext} gl
	 * @param {String} vertxShaderSrc
	 * @param {String} fragmentShaderSrc
	 *
	 * @returns {WebGLProgram} program
	 */
	function createPrgoram(gl, vertexShaderSrc, fragmentShaderSrc) {
		var program = gl.createProgram();

		var vertexShader = compileGLShader(gl, gl.VERTEX_SHADER, vertexShaderSrc);
		var fragmentShader = compileGLShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSrc);

		gl.attachShader(program, vertexShader);
		gl.attachShader(program, fragmentShader);
		gl.linkProgram(program);

		try {
			var success = gl.getProgramParameter(program, gl.LINK_STATUS);
			if (!success) throw gl.getProgramInfoLog(program);
		} catch (error) {
			console.error('WebGLProgram: ' + error);
		}

		return program;
	}

	/**
	 * get uniform locations
	 *
	 * @param {WebGLRenderingContext} gl
	 * @param {WebGLProgram} program
	 * @param {Float32Array} data
	 * @param {String} str
	 *
	 * @returns {object} uniformLocation
	 */
	function creteBuffer(gl, program, data, str) {
		var buffer = gl.createBuffer();
		var location = gl.getAttribLocation(program, str);

		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

		return { buffer: buffer, location: location };
	}

	/**
	 * create indexbuffer
	 *
	 * @param {WebGLRenderingContext} gl
	 * @param {WebGLProgram} program
	 * @param {Uint16Array | Uint32Array} data
	 * @param {String} str
	 *
	 * @returns {object} uniformLocation
	 */
	function createIndex(gl, indices) {
		var buffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

		var cnt = indices.length;
		return { cnt: cnt, buffer: buffer };
	}

	/**
	 *
	 * @param {WebGLRenderingContext} gl
	 * @param {WebGLBuffer} buffer
	 * @param {Number} location
	 * @param {Number} size
	 * @param {Boolean} normalized
	 * @param {Number} stride
	 * @param {Number} offset
	 */
	function bindBuffer(gl, buffer) {
		var location = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
		var size = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 1;
		var type = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : FLOAT;
		var normalized = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : false;
		var stride = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : 0;
		var offset = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : 0;

		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.vertexAttribPointer(location, size, type, normalized, stride, offset);
		gl.enableVertexAttribArray(location);
	}

	/**
	 * load json file
	 * @param {String} url
	 */
	function getAjaxJson(url) {
		var promiseObj = new Promise(function (resolve, reject) {
			var xhr = new XMLHttpRequest();
			xhr.open('GET', url, true);
			//    xhr.responseType = 'json';

			xhr.onreadystatechange = function () {
				if (xhr.readyState === 4) {
					if (xhr.status === 200) {
						// console.log('xhr done successfully');

						var resp = xhr.responseText;
						var respJson = JSON.parse(resp);
						resolve(respJson);
					} else {
						reject(xhr.status);
						// console.log('xhr failed');
					}
				}
			};

			xhr.send();
		});

		return promiseObj;
	}

	/**
	 * load json file
	 * @param {String} url
	 */

	/**
	 * load asset image
	 * @param {*} imageUrl
	 */
	function getImage(imageUrl) {
		var promise = new Promise(function (resolve, reject) {
			var image = new Image();
			image.onload = function () {
				resolve(image);
			};
			image.onerror = function () {
				reject('image is not loaded');
			};

			image.src = imageUrl;
		});

		return promise;
	}

	function getSphere() {
		var radius = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 2;
		var latitudeBands = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 64;
		var longitudeBands = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 64;

		var vertices = [];
		var textures = [];
		var normals = [];
		var indices = [];

		for (var latNumber = 0; latNumber <= latitudeBands; ++latNumber) {
			var theta = latNumber * Math.PI / latitudeBands;
			var sinTheta = Math.sin(theta);
			var cosTheta = Math.cos(theta);

			for (var longNumber = 0; longNumber <= longitudeBands; ++longNumber) {
				var phi = longNumber * 2 * Math.PI / longitudeBands;
				var sinPhi = Math.sin(phi);
				var cosPhi = Math.cos(phi);

				var x = cosPhi * sinTheta;
				var y = cosTheta;
				var z = sinPhi * sinTheta;
				var u = 1 - longNumber / longitudeBands;
				var v = 1 - latNumber / latitudeBands;

				normals.push(x, y, z);
				textures.push(u, v);
				vertices.push(radius * x, radius * y, radius * z);
			}
		}

		for (latNumber = 0; latNumber < latitudeBands; ++latNumber) {
			for (longNumber = 0; longNumber < longitudeBands; ++longNumber) {
				var first = latNumber * (longitudeBands + 1) + longNumber;
				var second = first + longitudeBands + 1;
				indices.push(second, first, first + 1, second + 1, second, first + 1);
			}
		}

		return {
			vertices: vertices,
			textures: textures,
			normals: normals,
			indices: indices
		};
	}

	var EPSILON = 0.000001;
	var ARRAY_TYPE = typeof Float32Array !== 'undefined' ? Float32Array : Array;
	var RANDOM = Math.random;

	var common = /*#__PURE__*/Object.freeze({
		EPSILON: EPSILON,
		ARRAY_TYPE: ARRAY_TYPE,
		RANDOM: RANDOM
	});

	function create() {
		var out = new ARRAY_TYPE(16);
		if (ARRAY_TYPE != Float32Array) {
			out[1] = 0;
			out[2] = 0;
			out[3] = 0;
			out[4] = 0;
			out[6] = 0;
			out[7] = 0;
			out[8] = 0;
			out[9] = 0;
			out[11] = 0;
			out[12] = 0;
			out[13] = 0;
			out[14] = 0;
		}
		out[0] = 1;
		out[5] = 1;
		out[10] = 1;
		out[15] = 1;
		return out;
	}

	function multiply(out, a, b) {
		var a00 = a[0],
		    a01 = a[1],
		    a02 = a[2],
		    a03 = a[3];
		var a10 = a[4],
		    a11 = a[5],
		    a12 = a[6],
		    a13 = a[7];
		var a20 = a[8],
		    a21 = a[9],
		    a22 = a[10],
		    a23 = a[11];
		var a30 = a[12],
		    a31 = a[13],
		    a32 = a[14],
		    a33 = a[15];
		// Cache only the current line of the second matrix
		var b0 = b[0],
		    b1 = b[1],
		    b2 = b[2],
		    b3 = b[3];
		out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
		out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
		out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
		out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
		b0 = b[4];
		b1 = b[5];
		b2 = b[6];
		b3 = b[7];
		out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
		out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
		out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
		out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
		b0 = b[8];
		b1 = b[9];
		b2 = b[10];
		b3 = b[11];
		out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
		out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
		out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
		out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
		b0 = b[12];
		b1 = b[13];
		b2 = b[14];
		b3 = b[15];
		out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
		out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
		out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
		out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
		return out;
	}

	function perspective(out, fovy, aspect, near, far) {
		var f = 1.0 / Math.tan(fovy / 2),
		    nf = void 0;
		out[0] = f / aspect;
		out[1] = 0;
		out[2] = 0;
		out[3] = 0;
		out[4] = 0;
		out[5] = f;
		out[6] = 0;
		out[7] = 0;
		out[8] = 0;
		out[9] = 0;
		out[11] = -1;
		out[12] = 0;
		out[13] = 0;
		out[15] = 0;
		if (far != null && far !== Infinity) {
			nf = 1 / (near - far);
			out[10] = (far + near) * nf;
			out[14] = 2 * far * near * nf;
		} else {
			out[10] = -1;
			out[14] = -2 * near;
		}
		return out;
	}

	function identity(out) {
		out[0] = 1;
		out[1] = 0;
		out[2] = 0;
		out[3] = 0;
		out[4] = 0;
		out[5] = 1;
		out[6] = 0;
		out[7] = 0;
		out[8] = 0;
		out[9] = 0;
		out[10] = 1;
		out[11] = 0;
		out[12] = 0;
		out[13] = 0;
		out[14] = 0;
		out[15] = 1;
		return out;
	}

	function clone(mat) {
		var out = new ARRAY_TYPE(16);
		for (var ii = 0; ii < out.length; ii++) {
			out[ii] = mat[ii];
		}

		return out;
	}

	function fromTranslation(out, v) {
		out[0] = 1;
		out[1] = 0;
		out[2] = 0;
		out[3] = 0;
		out[4] = 0;
		out[5] = 1;
		out[6] = 0;
		out[7] = 0;
		out[8] = 0;
		out[9] = 0;
		out[10] = 1;
		out[11] = 0;
		out[12] = v[0];
		out[13] = v[1];
		out[14] = v[2];
		out[15] = 1;
		return out;
	}

	function fromYRotation(out, rad) {
		var s = Math.sin(rad);
		var c = Math.cos(rad);
		// Perform axis-specific matrix multiplication

		out[0] = c;
		out[1] = 0;
		out[2] = -s;
		out[3] = 0;
		out[4] = 0;
		out[5] = 1;
		out[6] = 0;
		out[7] = 0;
		out[8] = s;
		out[9] = 0;
		out[10] = c;
		out[11] = 0;
		out[12] = 0;
		out[13] = 0;
		out[14] = 0;
		out[15] = 1;

		return out;
	}

	function lookAt(out, eye, center, up) {
		var x0 = void 0,
		    x1 = void 0,
		    x2 = void 0,
		    y0 = void 0,
		    y1 = void 0,
		    y2 = void 0,
		    z0 = void 0,
		    z1 = void 0,
		    z2 = void 0,
		    len = void 0;
		var eyex = eye[0];
		var eyey = eye[1];
		var eyez = eye[2];
		var upx = up[0];
		var upy = up[1];
		var upz = up[2];
		var centerx = center[0];
		var centery = center[1];
		var centerz = center[2];

		if (Math.abs(eyex - centerx) < EPSILON && Math.abs(eyey - centery) < EPSILON && Math.abs(eyez - centerz) < EPSILON) {
			return identity(out);
		}

		z0 = eyex - centerx;
		z1 = eyey - centery;
		z2 = eyez - centerz;

		len = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
		z0 *= len;
		z1 *= len;
		z2 *= len;

		x0 = upy * z2 - upz * z1;
		x1 = upz * z0 - upx * z2;
		x2 = upx * z1 - upy * z0;
		len = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
		if (!len) {
			x0 = 0;
			x1 = 0;
			x2 = 0;
		} else {
			len = 1 / len;
			x0 *= len;
			x1 *= len;
			x2 *= len;
		}

		y0 = z1 * x2 - z2 * x1;
		y1 = z2 * x0 - z0 * x2;
		y2 = z0 * x1 - z1 * x0;

		len = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
		if (!len) {
			y0 = 0;
			y1 = 0;
			y2 = 0;
		} else {
			len = 1 / len;
			y0 *= len;
			y1 *= len;
			y2 *= len;
		}

		out[0] = x0;
		out[1] = y0;
		out[2] = z0;
		out[3] = 0;
		out[4] = x1;
		out[5] = y1;
		out[6] = z1;
		out[7] = 0;
		out[8] = x2;
		out[9] = y2;
		out[10] = z2;
		out[11] = 0;
		out[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
		out[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
		out[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
		out[15] = 1;

		return out;
	}

	function fromRotationTranslationScale(out, q, v, s) {
		// Quaternion math
		var x = q[0],
		    y = q[1],
		    z = q[2],
		    w = q[3];
		var x2 = x + x;
		var y2 = y + y;
		var z2 = z + z;
		var xx = x * x2;
		var xy = x * y2;
		var xz = x * z2;
		var yy = y * y2;
		var yz = y * z2;
		var zz = z * z2;
		var wx = w * x2;
		var wy = w * y2;
		var wz = w * z2;
		var sx = s[0];
		var sy = s[1];
		var sz = s[2];
		out[0] = (1 - (yy + zz)) * sx;
		out[1] = (xy + wz) * sx;
		out[2] = (xz - wy) * sx;
		out[3] = 0;
		out[4] = (xy - wz) * sy;
		out[5] = (1 - (xx + zz)) * sy;
		out[6] = (yz + wx) * sy;
		out[7] = 0;
		out[8] = (xz + wy) * sz;
		out[9] = (yz - wx) * sz;
		out[10] = (1 - (xx + yy)) * sz;
		out[11] = 0;
		out[12] = v[0];
		out[13] = v[1];
		out[14] = v[2];
		out[15] = 1;
		return out;
	}

	function fromXRotation(out, rad) {
		var s = Math.sin(rad);
		var c = Math.cos(rad);
		// Perform axis-specific matrix multiplication
		out[0] = 1;
		out[1] = 0;
		out[2] = 0;
		out[3] = 0;
		out[4] = 0;
		out[5] = c;
		out[6] = s;
		out[7] = 0;
		out[8] = 0;
		out[9] = -s;
		out[10] = c;
		out[11] = 0;
		out[12] = 0;
		out[13] = 0;
		out[14] = 0;
		out[15] = 1;
		return out;
	}

	function targetTo(out, eye, target, up) {
		var eyex = eye[0],
		    eyey = eye[1],
		    eyez = eye[2],
		    upx = up[0],
		    upy = up[1],
		    upz = up[2];
		var z0 = eyex - target[0],
		    z1 = eyey - target[1],
		    z2 = eyez - target[2];
		var len = z0 * z0 + z1 * z1 + z2 * z2;
		if (len > 0) {
			len = 1 / Math.sqrt(len);
			z0 *= len;
			z1 *= len;
			z2 *= len;
		}
		var x0 = upy * z2 - upz * z1,
		    x1 = upz * z0 - upx * z2,
		    x2 = upx * z1 - upy * z0;
		len = x0 * x0 + x1 * x1 + x2 * x2;
		if (len > 0) {
			len = 1 / Math.sqrt(len);
			x0 *= len;
			x1 *= len;
			x2 *= len;
		}
		out[0] = x0;
		out[1] = x1;
		out[2] = x2;
		out[3] = 0;
		out[4] = z1 * x2 - z2 * x1;
		out[5] = z2 * x0 - z0 * x2;
		out[6] = z0 * x1 - z1 * x0;
		out[7] = 0;
		out[8] = z0;
		out[9] = z1;
		out[10] = z2;
		out[11] = 0;
		out[12] = eyex;
		out[13] = eyey;
		out[14] = eyez;
		out[15] = 1;
		return out;
	}

	/**
	 * Transpose the values of a mat4
	 *
	 * @param {mat4} out the receiving matrix
	 * @param {mat4} a the source matrix
	 * @returns {mat4} out
	 */
	function transpose(out, a) {
		// If we are transposing ourselves we can skip a few steps but have to cache some values
		if (out === a) {
			var a01 = a[1],
			    a02 = a[2],
			    a03 = a[3];
			var a12 = a[6],
			    a13 = a[7];
			var a23 = a[11];

			out[1] = a[4];
			out[2] = a[8];
			out[3] = a[12];
			out[4] = a01;
			out[6] = a[9];
			out[7] = a[13];
			out[8] = a02;
			out[9] = a12;
			out[11] = a[14];
			out[12] = a03;
			out[13] = a13;
			out[14] = a23;
		} else {
			out[0] = a[0];
			out[1] = a[4];
			out[2] = a[8];
			out[3] = a[12];
			out[4] = a[1];
			out[5] = a[5];
			out[6] = a[9];
			out[7] = a[13];
			out[8] = a[2];
			out[9] = a[6];
			out[10] = a[10];
			out[11] = a[14];
			out[12] = a[3];
			out[13] = a[7];
			out[14] = a[11];
			out[15] = a[15];
		}

		return out;
	}

	/**
	 * Inverts a mat4
	 *
	 * @param {mat4} out the receiving matrix
	 * @param {mat4} a the source matrix
	 * @returns {mat4} out
	 */
	function invert(out, a) {
		var a00 = a[0],
		    a01 = a[1],
		    a02 = a[2],
		    a03 = a[3];
		var a10 = a[4],
		    a11 = a[5],
		    a12 = a[6],
		    a13 = a[7];
		var a20 = a[8],
		    a21 = a[9],
		    a22 = a[10],
		    a23 = a[11];
		var a30 = a[12],
		    a31 = a[13],
		    a32 = a[14],
		    a33 = a[15];

		var b00 = a00 * a11 - a01 * a10;
		var b01 = a00 * a12 - a02 * a10;
		var b02 = a00 * a13 - a03 * a10;
		var b03 = a01 * a12 - a02 * a11;
		var b04 = a01 * a13 - a03 * a11;
		var b05 = a02 * a13 - a03 * a12;
		var b06 = a20 * a31 - a21 * a30;
		var b07 = a20 * a32 - a22 * a30;
		var b08 = a20 * a33 - a23 * a30;
		var b09 = a21 * a32 - a22 * a31;
		var b10 = a21 * a33 - a23 * a31;
		var b11 = a22 * a33 - a23 * a32;

		// Calculate the determinant
		var det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

		if (!det) {
			return null;
		}
		det = 1.0 / det;

		out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
		out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
		out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
		out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
		out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
		out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
		out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
		out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
		out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
		out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
		out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
		out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
		out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
		out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
		out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
		out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;

		return out;
	}

	var mat4 = /*#__PURE__*/Object.freeze({
		create: create,
		multiply: multiply,
		perspective: perspective,
		identity: identity,
		clone: clone,
		fromTranslation: fromTranslation,
		fromYRotation: fromYRotation,
		lookAt: lookAt,
		fromRotationTranslationScale: fromRotationTranslationScale,
		fromXRotation: fromXRotation,
		targetTo: targetTo,
		transpose: transpose,
		invert: invert
	});

	function create$1() {
		var out = new ARRAY_TYPE(4);
		if (ARRAY_TYPE != Float32Array) {
			out[0] = 0;
			out[1] = 0;
			out[2] = 0;
		}
		out[3] = 1;
		return out;
	}

	var quat = /*#__PURE__*/Object.freeze({
		create: create$1
	});

	function create$2() {
		var out = new ARRAY_TYPE(3);
		if (ARRAY_TYPE != Float32Array) {
			out[0] = 0;
			out[1] = 0;
			out[2] = 0;
		}
		return out;
	}

	function add(out, a, b) {
		out[0] = a[0] + b[0];
		out[1] = a[1] + b[1];
		out[2] = a[2] + b[2];
		return out;
	}

	function rotateZ(out, a, b, c) {
		var p = [],
		    r = [];
		//Translate point to the origin
		p[0] = a[0] - b[0];
		p[1] = a[1] - b[1];
		p[2] = a[2] - b[2];
		//perform rotation
		r[0] = p[0] * Math.cos(c) - p[1] * Math.sin(c);
		r[1] = p[0] * Math.sin(c) + p[1] * Math.cos(c);
		r[2] = p[2];
		//translate to correct position
		out[0] = r[0] + b[0];
		out[1] = r[1] + b[1];
		out[2] = r[2] + b[2];
		return out;
	}

	function rotateY(out, a, b, c) {
		var p = [],
		    r = [];
		//Translate point to the origin
		p[0] = a[0] - b[0];
		p[1] = a[1] - b[1];
		p[2] = a[2] - b[2];
		//perform rotation
		r[0] = p[2] * Math.sin(c) + p[0] * Math.cos(c);
		r[1] = p[1];
		r[2] = p[2] * Math.cos(c) - p[0] * Math.sin(c);
		//translate to correct position
		out[0] = r[0] + b[0];
		out[1] = r[1] + b[1];
		out[2] = r[2] + b[2];
		return out;
	}

	function transformMat4(out, a, m) {
		var x = a[0],
		    y = a[1],
		    z = a[2];
		var w = m[3] * x + m[7] * y + m[11] * z + m[15];
		w = w || 1.0;
		out[0] = (m[0] * x + m[4] * y + m[8] * z + m[12]) / w;
		out[1] = (m[1] * x + m[5] * y + m[9] * z + m[13]) / w;
		out[2] = (m[2] * x + m[6] * y + m[10] * z + m[14]) / w;
		return out;
	}

	/**
	 * Normalize a vec3
	 *
	 * @param {vec3} out the receiving vector
	 * @param {vec3} a vector to normalize
	 * @returns {vec3} out
	 */

	function normalize(out, a) {
		var x = a[0];
		var y = a[1];
		var z = a[2];
		var len = x * x + y * y + z * z;
		if (len > 0) {
			//TODO: evaluate use of glm_invsqrt here?
			len = 1 / Math.sqrt(len);
			out[0] = a[0] * len;
			out[1] = a[1] * len;
			out[2] = a[2] * len;
		}
		return out;
	}

	/**
	 * Computes the cross product of two vec3's
	 *
	 * @param {vec3} out the receiving vector
	 * @param {vec3} a the first operand
	 * @param {vec3} b the second operand
	 * @returns {vec3} out
	 */

	function cross(out, a, b) {
		var ax = a[0],
		    ay = a[1],
		    az = a[2];
		var bx = b[0],
		    by = b[1],
		    bz = b[2];
		out[0] = ay * bz - az * by;
		out[1] = az * bx - ax * bz;
		out[2] = ax * by - ay * bx;
		return out;
	}

	var vec3 = /*#__PURE__*/Object.freeze({
		create: create$2,
		add: add,
		rotateZ: rotateZ,
		rotateY: rotateY,
		transformMat4: transformMat4,
		normalize: normalize,
		cross: cross
	});

	function clamp(value, min, max) {
		return Math.min(Math.max(value, min), max);
	}

	function range(min, max) {
		return (max - min) * Math.random() + min;
	}

	// https://stackoverflow.com/questions/32861804/how-to-calculate-the-centre-point-of-a-circle-given-three-points
	function calculateCircleCenter(A, B, C) {
		var yDelta_a = B.y - A.y;
		var xDelta_a = B.x - A.x;
		var yDelta_b = C.y - B.y;
		var xDelta_b = C.x - B.x;

		var center = {};

		var aSlope = yDelta_a / xDelta_a;
		var bSlope = yDelta_b / xDelta_b;

		center.x = (aSlope * bSlope * (A.y - C.y) + bSlope * (A.x + B.x) - aSlope * (B.x + C.x)) / (2 * (bSlope - aSlope));
		center.y = -1 * (center.x - (A.x + B.x) / 2) / aSlope + (A.y + B.y) / 2;

		return center;
	}

	/**
	 * mix — linearly interpolate between two values
	 *
	 * @param {number} x
	 * @param {number} y
	 * @param {number} a
	 */
	function mix(x, y, a) {
		return x * (1 - a) + y * a;
	}

	function degToRad(value) {
		// Math.PI / 180 = 0.017453292519943295
		return value * 0.017453292519943295;
	}

	function radToDeg(value) {
		// 180 / Math.PI = 57.29577951308232
		return 57.29577951308232 * value;
	}

	var math = /*#__PURE__*/Object.freeze({
		clamp: clamp,
		range: range,
		calculateCircleCenter: calculateCircleCenter,
		mix: mix,
		degToRad: degToRad,
		radToDeg: radToDeg
	});

	// based on gl-matrix

	var classCallCheck = function (instance, Constructor) {
	  if (!(instance instanceof Constructor)) {
	    throw new TypeError("Cannot call a class as a function");
	  }
	};

	var createClass = function () {
	  function defineProperties(target, props) {
	    for (var i = 0; i < props.length; i++) {
	      var descriptor = props[i];
	      descriptor.enumerable = descriptor.enumerable || false;
	      descriptor.configurable = true;
	      if ("value" in descriptor) descriptor.writable = true;
	      Object.defineProperty(target, descriptor.key, descriptor);
	    }
	  }

	  return function (Constructor, protoProps, staticProps) {
	    if (protoProps) defineProperties(Constructor.prototype, protoProps);
	    if (staticProps) defineProperties(Constructor, staticProps);
	    return Constructor;
	  };
	}();

	var Camera = function () {
		function Camera(width, height) {
			var fov = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 45;
			var near = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0.1;
			var far = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 1000;
			classCallCheck(this, Camera);

			this.position = { x: 0, y: 0, z: 0 };
			this.lookAtPosition = { x: 0, y: 0, z: 0 };

			this._viewMatrix = create();
			this._projectionMatrix = create();

			this.updatePerspective(width, height, fov, near, far);
		}

		createClass(Camera, [{
			key: 'updatePerspective',
			value: function updatePerspective(width, height, fov, near, far) {
				perspective(this._projectionMatrix, fov / 180 * Math.PI, width / height, near, far);
			}
		}, {
			key: 'updatePosition',
			value: function updatePosition() {
				var xx = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
				var yy = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
				var zz = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

				this.position.x = xx;
				this.position.y = yy;
				this.position.z = zz;
			}
		}, {
			key: 'updateLookAtPosition',
			value: function updateLookAtPosition() {
				var xx = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
				var yy = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
				var zz = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : -100;

				this.lookAtPosition.x = xx;
				this.lookAtPosition.y = yy;
				this.lookAtPosition.z = zz;
			}
		}, {
			key: 'updateViewMatrix',
			value: function updateViewMatrix() {
				lookAt(this._viewMatrix, [this.position.x, this.position.y, this.position.z], [this.lookAtPosition.x, this.lookAtPosition.y, this.lookAtPosition.z], [0, 1, 0]);
			}
		}, {
			key: 'viewMatrix',
			get: function get$$1() {
				return this._viewMatrix;
			}
		}, {
			key: 'projectionMatrix',
			get: function get$$1() {
				return this._projectionMatrix;
			}
		}]);
		return Camera;
	}();

	console.log('[danshariGL] version: 0.1.0, %o', 'https://github.com/kenjiSpecial/tubugl');

	exports.getUniformLocations = getUniformLocations;
	exports.addLineNumbers = addLineNumbers;
	exports.compileGLShader = compileGLShader;
	exports.createPrgoram = createPrgoram;
	exports.creteBuffer = creteBuffer;
	exports.createIndex = createIndex;
	exports.bindBuffer = bindBuffer;
	exports.getAjaxJson = getAjaxJson;
	exports.getImage = getImage;
	exports.getSphere = getSphere;
	exports.Camera = Camera;
	exports.glMatrix = common;
	exports.mat4 = mat4;
	exports.quat = quat;
	exports.vec3 = vec3;
	exports.math = math;

	Object.defineProperty(exports, '__esModule', { value: true });

})));