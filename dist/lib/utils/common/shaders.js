"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fullscreenVertShader = "\nprecision highp float;\n\nattribute vec3 position;\n\nuniform vec2 px;\n\nvarying vec2 vUv;\n\nvoid main(){\n    vUv = vec2(0.5)+(position.xy)*0.5;\n    gl_Position = vec4(position, 1.0);\n}\n";
exports.fillFragShader = "\nprecision highp float;\n\nvarying vec2 vUv;\n\nvoid main(){\n    gl_FragColor = vec4(vUv, 0.0, 1.0);\n}\n";
exports.texFragShader = "\nprecision highp float;\n\nuniform sampler2D uTexture;\n\nvarying vec2 vUv;\n\nvoid main(){\n    vec4 texColor = texture2D(uTexture, vUv);\n    gl_FragColor = texColor;\n}\n";
//# sourceMappingURL=shaders.js.map