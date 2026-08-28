import { useEffect, useRef, useState } from 'react';

const VERT_SHADER = `
  attribute vec2 position;
  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const FRAG_SHADER = `
  precision highp float;
  uniform vec2 u_resolution;
  uniform float u_time;
  uniform vec2 u_mouse;
  uniform vec3 u_color1;
  uniform vec3 u_color2;
  uniform vec3 u_color3;
  uniform float u_hover;

  void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    vec2 mouse = u_mouse / u_resolution.xy;
    
    // Correct aspect ratio
    st.x *= u_resolution.x / u_resolution.y;
    mouse.x *= u_resolution.x / u_resolution.y;

    float t = u_time * 0.45;

    // Organic fluid warp
    vec2 p = st * 2.5;
    float w1 = sin(p.x * 1.4 + t * 0.8);
    float w2 = cos(p.y * 1.4 - t * 0.6);
    float w3 = sin((p.x + p.y) * 1.2 + t);
    
    // Mouse distance glow
    float mDist = length(st - mouse);
    float mGlow = (1.0 - smoothstep(0.0, 0.45, mDist)) * u_hover * 1.2;

    float wave = sin(w1 + w2 + w3 + mGlow * 2.0);
    float normWave = wave * 0.5 + 0.5;

    // Emerald / Cyber gradient blending
    vec3 color = mix(u_color3, u_color1, pow(normWave, 1.8));
    color = mix(color, u_color2, pow(normWave, 3.5) * (0.6 + u_hover * 0.4));
    color += u_color2 * mGlow * 0.4;

    // Vignette
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    float vignette = uv.x * uv.y * (1.0 - uv.x) * (1.0 - uv.y);
    vignette = clamp(pow(16.0 * vignette, 0.25), 0.0, 1.0);

    gl_FragColor = vec4(color * vignette, 0.92);
  }
`;

function hexToRgb(hex) {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map((x) => x + x).join('');
  const num = parseInt(c, 16);
  return [(num >> 16) / 255, ((num >> 8) & 255) / 255, (num & 255) / 255];
}

export default function ShaderCard({
  children,
  color1 = '#00a83b',
  color2 = '#39ff88',
  color3 = '#050a07',
  speed = 1.0,
  className = '',
  onClick,
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const hoverRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return;

    function createShader(gl, type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vertShader = createShader(gl, gl.VERTEX_SHADER, VERT_SHADER);
    const fragShader = createShader(gl, gl.FRAGMENT_SHADER, FRAG_SHADER);
    if (!vertShader || !fragShader) return;

    const program = gl.createProgram();
    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const positionLocation = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const uResolution = gl.getUniformLocation(program, 'u_resolution');
    const uTime = gl.getUniformLocation(program, 'u_time');
    const uMouse = gl.getUniformLocation(program, 'u_mouse');
    const uHover = gl.getUniformLocation(program, 'u_hover');
    const uColor1 = gl.getUniformLocation(program, 'u_color1');
    const uColor2 = gl.getUniformLocation(program, 'u_color2');
    const uColor3 = gl.getUniformLocation(program, 'u_color3');

    const c1 = hexToRgb(color1);
    const c2 = hexToRgb(color2);
    const c3 = hexToRgb(color3);

    gl.uniform3f(uColor1, c1[0], c1[1], c1[2]);
    gl.uniform3f(uColor2, c2[0], c2[1], c2[2]);
    gl.uniform3f(uColor3, c3[0], c3[1], c3[2]);

    let animationFrameId;
    let startTime = performance.now();

    function resize() {
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
    }

    function render(now) {
      resize();

      const elapsed = (now - startTime) * 0.001 * speed;
      gl.uniform1f(uTime, elapsed);
      gl.uniform2f(uResolution, canvas.width, canvas.height);

      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.1;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.1;
      gl.uniform2f(uMouse, mouseRef.current.x, canvas.height - mouseRef.current.y);

      const targetHover = isHovered ? 1.0 : 0.0;
      hoverRef.current += (targetHover - hoverRef.current) * 0.08;
      gl.uniform1f(uHover, hoverRef.current);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animationFrameId = requestAnimationFrame(render);
    }

    render(performance.now());

    return () => {
      cancelAnimationFrame(animationFrameId);
      gl.deleteProgram(program);
      gl.deleteShader(vertShader);
      gl.deleteShader(fragShader);
    };
  }, [color1, color2, color3, speed, isHovered]);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseRef.current.targetX = e.clientX - rect.left;
    mouseRef.current.targetY = e.clientY - rect.top;
  };

  return (
    <div
      ref={containerRef}
      className={`shader-card-wrapper ${isHovered ? 'shader-card-hovered' : ''} ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        mouseRef.current.targetX = containerRef.current ? containerRef.current.clientWidth / 2 : 0;
        mouseRef.current.targetY = containerRef.current ? containerRef.current.clientHeight / 2 : 0;
      }}
      onMouseMove={handleMouseMove}
      onClick={onClick}
    >
      <canvas ref={canvasRef} className="shader-card-canvas" />
      <div className="shader-card-glass-glow" />
      <div className="shader-card-content">{children}</div>
    </div>
  );
}
