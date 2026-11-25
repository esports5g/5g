(() => {
  const narrow = matchMedia('(max-width: 999px)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const layer = document.createElement('div');
  layer.className = 'mascot-layer';
  layer.setAttribute('aria-hidden', 'true');

  const views = ['silver', 'navy'].map((name, index) => {
    const rail = document.createElement('div');
    rail.className = 'mascot-rail ' + (index === 0 ? 'mascot-left' : 'mascot-right');
    const image = new Image();
    image.alt = '';
    image.className = 'mascot-image';
    image.decoding = 'async';
    image.fetchPriority = 'low';
    image.src = '/assets/img/5g-mascot-' + name + '.webp';
    rail.append(image);
    layer.append(rail);
    return { rail, image };
  });
  const canvas = document.createElement('canvas');
  canvas.className = 'mascot-depth';
  layer.append(canvas);
  document.body.append(layer);

  let renderer, pending = false, depthAttempted = false;
  let frame = 0, arrived = performance.now(), lastY = scrollY;
  let follow = 0, pointer = 0;
  const clamp = (value, lo, hi) => Math.max(lo, Math.min(hi, value));

  function requestDraw() {
    if (!frame && !document.hidden) frame = requestAnimationFrame(draw);
  }
  function draw(now) {
    frame = 0;
    const elapsed = now - arrived;
    const compact = narrow.matches;
    const still = reduced.matches;
    const fade = compact ? clamp((2200 - elapsed) / 460, 0, 1) : 1;
    const useDepth = renderer && !compact && !still;
    follow *= .86;
    layer.classList.toggle('mascot-rendered', !!useDepth);
    const poses = views.map(({ image }, index) => {
      const side = index === 0 ? -1 : 1;
      const progress = still ? 1 : clamp((elapsed - 85 * index) / 535, 0, 1);
      const ease = 1 - (1 - progress) ** 3;
      const x = still ? 0 : side * ((1 - ease) * 34 + (1 - fade) * 15);
      const y = still ? 0 : follow * (compact ? .13 : .66) - Math.sin(ease * Math.PI) * (index ? 7 : 3);
      const yaw = still ? 0 : side * .13 * (1 - ease) + pointer * .085;
      const opacity = fade * ease;
      if (!useDepth) {
        image.style.opacity = opacity;
        image.style.transform = 'translate(' + x + 'px,' + y + 'px) rotateY(' + yaw + 'rad)';
      }
      return { x, y, yaw, opacity };
    });
    if (useDepth) renderer.draw(poses);
    const moving = !still && (elapsed < 665 || Math.abs(follow) > .15);
    if (moving || (compact && elapsed < 2210)) requestDraw();
  }

  async function startDepth() {
    if (depthAttempted || pending || narrow.matches || reduced.matches) return;
    pending = true;
    try {
      await Promise.all(views.map(({ image }) => image.decode()));
      if (narrow.matches || reduced.matches) return;
      depthAttempted = true;
      renderer = createRenderer(canvas, views);
      requestDraw();
    } catch {
      depthAttempted = true;
    } finally {
      pending = false;
    }
  }
  function resize() {
    renderer?.resize();
    if (!narrow.matches) startDepth();
    requestDraw();
  }

  window.addEventListener('scroll', () => {
    const delta = scrollY - lastY;
    lastY = scrollY;
    if (narrow.matches || reduced.matches || !delta) return;
    follow = clamp(follow - delta * .23, -22, 22);
    requestDraw();
  }, { passive: true });
  window.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' || narrow.matches || reduced.matches) return;
    pointer = event.clientX / innerWidth * 2 - 1;
    requestDraw();
  }, { passive: true });
  window.addEventListener('resize', resize, { passive: true });
  for (const preference of [narrow, reduced]) preference.addEventListener('change', resize);
  document.addEventListener('visibilitychange', requestDraw);
  window.addEventListener('pageshow', event => {
    if (event.persisted) {
      arrived = performance.now();
      follow = 0;
      lastY = scrollY;
      requestDraw();
    }
  });
  canvas.addEventListener('webglcontextlost', () => {
    renderer = null;
    requestDraw();
  });

  requestDraw();
  // Load the decorative depth effect after the browser has loaded the page.
  if (document.readyState === 'complete') startDepth();
  else window.addEventListener('load', startDepth, { once: true });

  function createRenderer(surface, characters) {
    const gl = surface.getContext('webgl', { alpha: true, antialias: true, powerPreference: 'low-power' });
    if (!gl) return null;
    const program = gl.createProgram();
    const stages = [
      [gl.VERTEX_SHADER, [
        'attribute vec3 shape; attribute vec2 uv; varying vec2 texcoord;',
        'uniform vec2 scale; uniform float yaw;',
        'void main(){ float c=cos(yaw),s=sin(yaw);',
        'vec2 point=vec2(shape.x*c+shape.z*s,shape.y);',
        'gl_Position=vec4(point*scale,0.0,1.0); texcoord=uv; }'
      ].join('\n')],
      [gl.FRAGMENT_SHADER, [
        'precision mediump float; varying vec2 texcoord;',
        'uniform sampler2D portrait; uniform float opacity;',
        'void main(){ vec4 color=texture2D(portrait,texcoord);',
        'gl_FragColor=vec4(color.rgb,color.a*opacity); }'
      ].join('\n')]
    ];
    for (const [type, code] of stages) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, code);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return null;
      gl.attachShader(program, shader);
      gl.deleteShader(shader);
    }
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
    gl.useProgram(program);
    const shape = gl.getAttribLocation(program, 'shape');
    const uv = gl.getAttribLocation(program, 'uv');
    const scale = gl.getUniformLocation(program, 'scale');
    const yaw = gl.getUniformLocation(program, 'yaw');
    const opacity = gl.getUniformLocation(program, 'opacity');
    gl.uniform1i(gl.getUniformLocation(program, 'portrait'), 0);
    gl.enableVertexAttribArray(shape);
    gl.enableVertexAttribArray(uv);
    gl.enable(gl.BLEND);
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);

    const meshes = characters.map(({ rail, image }) => {
      const portrait = trimPortrait(image);
      const { vertices, indices } = makeRelief(portrait);
      const vertex = gl.createBuffer();
      const index = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vertex);
      gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, portrait);
      return { rail, vertex, index, texture, count: indices.length, ratio: portrait.width / portrait.height };
    });

    let resolution;
    function resizeSurface() {
      resolution = Math.min(devicePixelRatio, 1.5);
      surface.width = Math.round(document.documentElement.clientWidth * resolution);
      surface.height = Math.round(innerHeight * resolution);
    }
    resizeSurface();
    return {
      resize: resizeSurface,
      draw(poses) {
        gl.clear(gl.COLOR_BUFFER_BIT);
        for (let i = 0; i < meshes.length; i++) {
          const model = meshes[i], pose = poses[i];
          if (pose.opacity < .01) continue;
          const rect = model.rail.getBoundingClientRect();
          const height = Math.max(1, model.ratio * rect.height / rect.width) + .15;
          gl.viewport(
            Math.round((rect.left + pose.x) * resolution),
            Math.round((innerHeight - rect.bottom - pose.y) * resolution),
            Math.round(rect.width * resolution),
            Math.round(rect.height * resolution)
          );
          gl.uniform2f(scale, rect.height / (rect.width * height), 1 / height);
          gl.uniform1f(yaw, pose.yaw);
          gl.uniform1f(opacity, pose.opacity);
          gl.bindTexture(gl.TEXTURE_2D, model.texture);
          gl.bindBuffer(gl.ARRAY_BUFFER, model.vertex);
          gl.vertexAttribPointer(shape, 3, gl.FLOAT, false, 20, 0);
          gl.vertexAttribPointer(uv, 2, gl.FLOAT, false, 20, 12);
          gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.index);
          gl.drawElements(gl.TRIANGLES, model.count, gl.UNSIGNED_SHORT, 0);
        }
      }
    };
  }

  function trimPortrait(image) {
    const source = document.createElement('canvas');
    source.width = image.naturalWidth;
    source.height = image.naturalHeight;
    const ctx = source.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(image, 0, 0);
    const { width, height } = source;
    const data = ctx.getImageData(0, 0, width, height).data;
    let left = width, right = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (data[(y * width + x) * 4 + 3] < 192) continue;
        left = Math.min(left, x);
        right = Math.max(right, x);
      }
    }
    if (right <= left) return source;
    left = Math.max(0, left - 8);
    right = Math.min(width, right + 9);
    const portrait = document.createElement('canvas');
    portrait.width = right - left;
    portrait.height = height;
    portrait.getContext('2d').drawImage(source, left, 0, portrait.width, height, 0, 0, portrait.width, height);
    return portrait;
  }

  function makeRelief(portrait) {
    const columns = 40, rows = 88, stride = columns + 1;
    const sample = document.createElement('canvas');
    sample.width = stride; sample.height = rows + 1;
    const ctx = sample.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(portrait, 0, 0, sample.width, sample.height);
    const rgba = ctx.getImageData(0, 0, sample.width, sample.height).data;
    const distance = new Float32Array(stride * (rows + 1));
    for (let i = 0; i < distance.length; i++) distance[i] = rgba[i * 4 + 3] > 32 ? 80 : 0;
    for (let y = 1; y <= rows; y++) {
      for (let x = 1; x <= columns; x++) {
        const k = y * stride + x;
        distance[k] = Math.min(distance[k], distance[k - 1] + 1, distance[k - stride] + 1);
      }
    }
    for (let y = rows - 1; y >= 0; y--) {
      for (let x = columns - 1; x >= 0; x--) {
        const k = y * stride + x;
        distance[k] = Math.min(distance[k], distance[k + 1] + 1, distance[k + stride] + 1);
      }
    }
    const vertices = [], indices = [];
    for (let y = 0; y <= rows; y++) {
      for (let x = 0; x <= columns; x++) {
        const u = x / columns, v = y / rows, k = y * stride + x;
        const volume = .07 + .14 * Math.exp(-(((v - .37) * 5) ** 2));
        const depth = (1 - Math.exp(-distance[k] / 4)) * volume;
        vertices.push((2 * u - 1) * (portrait.width / portrait.height), 1 - 2 * v, depth, u, v);
        if (x < columns && y < rows) indices.push(k, k + stride, k + 1, k + 1, k + stride, k + stride + 1);
      }
    }
    return { vertices: new Float32Array(vertices), indices: new Uint16Array(indices) };
  }
})();
