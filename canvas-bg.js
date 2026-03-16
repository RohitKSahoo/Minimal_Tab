const settingsStr = localStorage.getItem("settings");
const defaultAnimSettings = { bgAnimation: true, bgAnimationType: 'particles', bgAnimationSpeed: 50, bgAnimationDensity: 50 };
const settingsJSON = settingsStr ? Object.assign(defaultAnimSettings, JSON.parse(settingsStr)) : defaultAnimSettings;

if (settingsJSON.bgAnimation) {
    const canvas = document.createElement('canvas');
    canvas.id = 'interactive-canvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.zIndex = '-1';
    canvas.style.pointerEvents = 'none';
    document.body.prepend(canvas);

    const type = settingsJSON.bgAnimationType || 'particles';
    const isWebGL = type === 'fluid';
    const gl = isWebGL ? (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) : null;
    const ctx = isWebGL ? null : canvas.getContext('2d');

    let width, height;
    let particles = [];
    const mouse = { x: undefined, y: undefined, radius: 150, isLeftDown: false, isRightDown: false };

    const speedMult = settingsJSON.bgAnimationSpeed !== undefined ? settingsJSON.bgAnimationSpeed / 50 : 1;
    const densityMult = settingsJSON.bgAnimationDensity !== undefined ? settingsJSON.bgAnimationDensity / 50 : 1;
    let hue = 0;
    let lastPaintTime = Date.now();
    let totalPaintedArea = 0;

    let matrixColumns = [];
    let matrixFontSize = 16;
    // Create offscreen canvas for a petal to improve performance
    const petalCanvas = document.createElement('canvas');
    const pCtx = petalCanvas.getContext('2d');
    petalCanvas.width = 20;
    petalCanvas.height = 20;
    pCtx.fillStyle = '#ffb3c6';
    pCtx.beginPath();
    pCtx.ellipse(10, 10, 5, 8, Math.PI / 4, 0, Math.PI * 2);
    pCtx.fill();

    function init() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        particles = [];

        if (type === 'fluid') {
            initWebGL();
            return;
        }

        const btn = document.getElementById('clear-art-btn');
        if (btn) btn.remove();

        if (type === 'generative') {
            return;
        }

        if (type === 'particles') {
            const numberOfParticles = ((width * height) / 6500) * densityMult;
            const colors = ['14, 165, 233', '56, 189, 248', '129, 140, 248', '192, 132, 252', '244, 114, 182', '52, 211, 153', '251, 191, 36', '248, 113, 113'];
            for (let i = 0; i < numberOfParticles; i++) {
                const size = (Math.random() * 2.5) + 1.5;
                const x = (Math.random() * ((width - size * 2) - (size * 2)) + size * 2);
                const y = (Math.random() * ((height - size * 2) - (size * 2)) + size * 2);
                const directionX = (Math.random() * 2) - 1;
                const directionY = (Math.random() * 2) - 1;
                const color = colors[Math.floor(Math.random() * colors.length)];
                particles.push(new Particle(x, y, directionX, directionY, size, color));
            }
        } else if (type === 'gravity') {
            const numberOfParticles = ((width * height) / 4000) * densityMult;
            const colors = ['#0ea5e9', '#38bdf8', '#818cf8', '#c084fc', '#f472b6'];
            for (let i = 0; i < numberOfParticles; i++) {
                const size = (Math.random() * 2.5) + 0.5;
                const x = Math.random() * width;
                const y = Math.random() * height;
                const directionX = (Math.random() - 0.5) * 0.5 * speedMult;
                const directionY = (Math.random() - 0.5) * 0.5 * speedMult;
                const color = colors[Math.floor(Math.random() * colors.length)];
                particles.push({ x, y, vx: directionX, vy: directionY, size, color, history: [] });
            }
        } else if (type === 'rain') {
            const numberOfParticles = ((width * height) / 5000) * densityMult;
            for (let i = 0; i < numberOfParticles; i++) {
                const x = Math.random() * width;
                const y = Math.random() * height;
                const size = Math.random() * 1.5 + 1;
                const directionY = (Math.random() * 3 + 4) * speedMult;
                particles.push({ x, y, directionX: 0, directionY, size, length: Math.random() * 10 + 10 });
            }
        } else if (type === 'snow') {
            const numberOfParticles = ((width * height) / 6000) * densityMult;
            for (let i = 0; i < numberOfParticles; i++) {
                const x = Math.random() * width;
                const y = Math.random() * height;
                const size = Math.random() * 3 + 1.5;
                const directionX = (Math.random() * 2 - 1) * speedMult;
                const directionY = (Math.random() * 1.5 + 0.5) * speedMult;
                particles.push({ x, y, directionX, directionY, size, angle: Math.random() * Math.PI * 2 });
            }
        } else if (type === 'petals') {
            const numberOfParticles = ((width * height) / 8000) * densityMult;
            for (let i = 0; i < numberOfParticles; i++) {
                const x = Math.random() * width;
                const y = Math.random() * height;
                const size = Math.random() * 0.5 + 0.5;
                const directionX = (Math.random() * 2 - 1) * speedMult;
                const directionY = (Math.random() * 1 + 1.5) * speedMult;
                particles.push({ x, y, directionX, directionY, size, angle: Math.random() * 360, spin: Math.random() * 4 - 2 });
            }
        } else if (type === 'matrix') {
            matrixColumns = [];
            const cols = Math.floor(width / matrixFontSize);
            const numActiveCols = Math.floor(cols * densityMult);
            for (let i = 0; i < numActiveCols; i++) {
                matrixColumns.push({
                    x: Math.floor(Math.random() * cols) * matrixFontSize,
                    y: Math.random() * -height,
                    speed: (Math.random() * 2 + 2) * speedMult,
                    chars: [],
                    length: Math.floor(Math.random() * 10 + 10)
                });
            }
        }
    }

    class Particle {
        constructor(x, y, directionX, directionY, size, color) {
            this.x = x;
            this.y = y;
            this.directionX = directionX;
            this.directionY = directionY;
            this.size = size;
            this.color = color;
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
            ctx.fillStyle = this.color ? `rgba(${this.color}, 0.8)` : (document.body.classList.contains('dark') ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.5)');
            ctx.fill();
        }
        update() {
            if (this.x > width || this.x < 0) {
                this.directionX = -this.directionX;
            }
            if (this.y > height || this.y < 0) {
                this.directionY = -this.directionY;
            }

            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < mouse.radius) {
                const forceDirectionX = dx / distance;
                const forceDirectionY = dy / distance;
                const force = (mouse.radius - distance) / mouse.radius;

                const forceX = forceDirectionX * force * 5 * speedMult;
                const forceY = forceDirectionY * force * 5 * speedMult;

                this.x -= forceX;
                this.y -= forceY;
            }

            this.x += this.directionX * speedMult;
            this.y += this.directionY * speedMult;
            this.draw();
        }
    }

    function connect() {
        for (let a = 0; a < particles.length; a++) {
            for (let b = a + 1; b < particles.length; b++) {
                let distance = ((particles[a].x - particles[b].x) * (particles[a].x - particles[b].x)) +
                    ((particles[a].y - particles[b].y) * (particles[a].y - particles[b].y));
                if (distance < 15000) {
                    let opacityValue = 1 - (distance / 15000);
                    if (particles[a].color && particles[b].color) {
                        let gradient = ctx.createLinearGradient(particles[a].x, particles[a].y, particles[b].x, particles[b].y);
                        gradient.addColorStop(0, `rgba(${particles[a].color}, ${opacityValue * 0.5})`);
                        gradient.addColorStop(1, `rgba(${particles[b].color}, ${opacityValue * 0.5})`);
                        ctx.strokeStyle = gradient;
                    } else {
                        const isDark = document.body.classList.contains('dark');
                        ctx.strokeStyle = isDark ? `rgba(255, 255, 255, ${opacityValue * 0.4})` : `rgba(0, 0, 0, ${opacityValue * 0.4})`;
                    }
                    ctx.lineWidth = 1.2;
                    ctx.beginPath();
                    ctx.moveTo(particles[a].x, particles[a].y);
                    ctx.lineTo(particles[b].x, particles[b].y);
                    ctx.stroke();
                }
            }
        }
    }

    function applyMouseInteraction(p, multi = 1) {
        if (mouse.x !== undefined && mouse.y !== undefined) {
            let dx = mouse.x - p.x;
            let dy = mouse.y - p.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < mouse.radius) {
                const forceDirectionX = dx / distance;
                const forceDirectionY = dy / distance;
                const force = (mouse.radius - distance) / mouse.radius;
                const moveX = forceDirectionX * force * 5 * speedMult * multi;
                const moveY = forceDirectionY * force * 5 * speedMult * multi;
                p.x -= moveX;
                p.y -= moveY;
                if (type === 'rain') {
                    p.directionX -= moveX * 0.1;
                }
            }
        }
    }

    function drawRain() {
        const isDark = document.body.classList.contains('dark');
        ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';

        ctx.beginPath();
        for (let i = 0; i < particles.length; i++) {
            let p = particles[i];

            p.y += p.directionY;
            p.x += p.directionX;
            applyMouseInteraction(p, 0.5); // Rain is heavy, less interaction

            p.directionX *= 0.95; // Air friction to damp lateral motion

            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x - p.directionX * 3, p.y + p.length); // Slant rain slightly if pushed horizontally

            if (p.y > height) {
                p.y = 0 - p.length;
                p.x = Math.random() * width;
                p.directionX = 0;
            }
            if (p.x > width + Math.max(20, p.length)) p.x = -Math.max(20, p.length);
            if (p.x < -Math.max(20, p.length)) p.x = width + Math.max(20, p.length);
        }
        ctx.stroke();
    }

    function drawSnow() {
        const isDark = document.body.classList.contains('dark');
        ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.6)';
        ctx.shadowBlur = isDark ? 8 : 4;
        ctx.shadowColor = isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.4)';

        for (let i = 0; i < particles.length; i++) {
            let p = particles[i];
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2, false);
            ctx.fill();

            p.angle += 0.015 * speedMult;
            p.x += Math.sin(p.angle) * 0.8 + p.directionX;
            p.y += p.directionY;

            applyMouseInteraction(p, 1.2);

            if (p.y > height) {
                p.y = -10;
                p.x = Math.random() * width;
            }
            if (p.x > width + 10) p.x = -10;
            if (p.x < -10) p.x = width + 10;
        }
        ctx.shadowBlur = 0;
    }

    function drawPetals() {
        for (let i = 0; i < particles.length; i++) {
            let p = particles[i];

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.angle * Math.PI / 180);
            ctx.scale(p.size, p.size);
            ctx.drawImage(petalCanvas, -10, -10);
            ctx.restore();

            p.angle += p.spin * speedMult;
            p.x += Math.sin(p.angle * Math.PI / 180) + p.directionX;
            p.y += p.directionY;

            applyMouseInteraction(p, 1.5);

            if (p.y > height) {
                p.y = -20;
                p.x = Math.random() * width;
            }
            if (p.x > width + 20) p.x = -20;
            if (p.x < -20) p.x = width + 20;
        }
    }

    function drawGravityPlayground() {
        const isDark = document.body.classList.contains('dark');
        ctx.globalCompositeOperation = isDark ? 'lighter' : 'source-over';

        for (let i = 0; i < particles.length; i++) {
            let p = particles[i];

            // Interaction forces
            if (mouse.x !== undefined && mouse.y !== undefined) {
                let dx = mouse.x - p.x;
                let dy = mouse.y - p.y;
                let distance = Math.sqrt(dx * dx + dy * dy);

                let forceRadius = (mouse.isLeftDown || mouse.isRightDown) ? mouse.radius * 2 : mouse.radius;

                if (distance < forceRadius) {
                    let force = (forceRadius - distance) / forceRadius;

                    if (mouse.isLeftDown) {
                        // Repel (blast) particles away on left click
                        let repelStrength = 1.5;
                        p.vx -= (dx / distance) * force * repelStrength * speedMult;
                        p.vy -= (dy / distance) * force * repelStrength * speedMult;
                    } else if (mouse.isRightDown) {
                        // Attract (pull) particles heavily on right click
                        let pullStrength = 0.05;
                        p.vx += (dx / distance) * force * pullStrength * speedMult;
                        p.vy += (dy / distance) * force * pullStrength * speedMult;
                    } else {
                        // Attract particles normally, increased strength
                        let attractionStrength = 0.012;
                        p.vx += (dx / distance) * force * attractionStrength * speedMult;
                        p.vy += (dy / distance) * force * attractionStrength * speedMult;
                    }
                }
            }

            // Friction and max speed limits
            p.vx *= 0.98;
            p.vy *= 0.98;

            p.x += p.vx;
            p.y += p.vy;

            // Bounce off walls smoothly
            if (p.x < 0 || p.x > width) p.vx *= -1;
            if (p.y < 0 || p.y > height) p.vy *= -1;

            // Keep history for trails
            p.history.push({ x: p.x, y: p.y });
            if (p.history.length > 10) {
                p.history.shift();
            }

            // Draw Trails
            if (p.history.length > 1) {
                ctx.beginPath();
                ctx.moveTo(p.history[0].x, p.history[0].y);
                for (let j = 1; j < p.history.length; j++) {
                    ctx.lineTo(p.history[j].x, p.history[j].y);
                }
                ctx.strokeStyle = p.color;
                ctx.lineWidth = p.size;
                ctx.lineCap = 'round';

                // Trail fade effect based on theme
                if (isDark) {
                    ctx.globalAlpha = 0.5;
                }
                else {
                    ctx.globalAlpha = 0.8;
                }

                ctx.stroke();
            }

            // Draw glowing particle core
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 1.5, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = 1;
            ctx.fill();
        }
        ctx.globalCompositeOperation = 'source-over';
    }

    const matrixChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()";

    function drawMatrix() {
        const isDark = document.body.classList.contains('dark');
        ctx.textAlign = "center";

        for (let i = 0; i < matrixColumns.length; i++) {
            let col = matrixColumns[i];
            col.y += col.speed;

            // Mouse interaction: push columns horizontally
            if (mouse.x !== undefined && mouse.y !== undefined) {
                let dx = mouse.x - col.x;
                if (Math.abs(dx) < mouse.radius && col.y > 0 && col.y < height) {
                    let force = (mouse.radius - Math.abs(dx)) / mouse.radius;
                    col.x -= (dx > 0 ? 1 : -1) * force * 2 * speedMult;
                }
            }

            if (col.y > height && Math.random() > 0.98) {
                col.y = -col.length * matrixFontSize;
                col.x = Math.floor(Math.random() * (width / matrixFontSize)) * matrixFontSize;
            }

            for (let j = 0; j < col.length; j++) {
                let yPos = col.y - (j * matrixFontSize);
                if (yPos > 0 && yPos < height + matrixFontSize) {
                    if (Math.random() > 0.95 || !col.chars[j]) {
                        col.chars[j] = matrixChars.charAt(Math.floor(Math.random() * matrixChars.length));
                    }

                    let opacity = 1 - (j / col.length);
                    // Mouse interaction: increase opacity/brightness nearby
                    if (mouse.x !== undefined && mouse.y !== undefined) {
                        let dx = mouse.x - col.x;
                        let dy = mouse.y - yPos;
                        let dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist < mouse.radius) {
                            opacity = Math.min(1, opacity + 0.5 * (1 - dist / mouse.radius));
                        }
                    }

                    if (isDark) {
                        ctx.fillStyle = j === 0 ? 'rgba(255, 255, 255, 1)' : `rgba(0, 255, 70, ${opacity})`;
                    } else {
                        ctx.fillStyle = j === 0 ? 'rgba(0, 0, 0, 1)' : `rgba(0, 150, 50, ${opacity})`;
                    }

                    ctx.font = `${matrixFontSize}px monospace`;
                    ctx.fillText(col.chars[j], col.x, yPos);
                }
            }
        }
    }

    let fluidProgram, positionAttributeLocation, timeUniformLocation, resolutionUniformLocation, mouseUniformLocation, isDarkUniformLocation;
    let startTime = Date.now();
    let fluidMouse = { x: 0, y: 0 };

    function initWebGL() {
        if (!gl) return;
        const vertexShaderSource = `
            attribute vec2 a_position;
            varying vec2 v_uv;
            void main() {
                v_uv = a_position * 0.5 + 0.5;
                v_uv.y = 1.0 - v_uv.y;
                gl_Position = vec4(a_position, 0, 1);
            }
        `;
        const fragmentShaderSource = `
            precision mediump float;
            varying vec2 v_uv;
            uniform float u_time;
            uniform vec2 u_resolution;
            uniform vec2 u_mouse;
            uniform float u_is_dark;

            // Pseudo-random and noise functions
            vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

            float snoise(vec2 v) {
                const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
                vec2 i  = floor(v + dot(v, C.yy) );
                vec2 x0 = v -   i + dot(i, C.xx);
                vec2 i1;
                i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
                vec4 x12 = x0.xyxy + C.xxzz;
                x12.xy -= i1;
                i = mod289(i);
                vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
                vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
                m = m*m ;
                m = m*m ;
                vec3 x = 2.0 * fract(p * C.www) - 1.0;
                vec3 h = abs(x) - 0.5;
                vec3 ox = floor(x + 0.5);
                vec3 a0 = x - ox;
                m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
                vec3 g;
                g.x  = a0.x  * x0.x  + h.x  * x0.y;
                g.yz = a0.yz * x12.xz + h.yz * x12.yw;
                return 130.0 * dot(m, g);
            }

            void main() {
                vec2 st = gl_FragCoord.xy / u_resolution.xy;
                
                // Mouse distortion
                vec2 m = u_mouse.xy / u_resolution.xy;
                m.y = 1.0 - m.y;
                
                // Adjust for aspect ratio
                st.x *= u_resolution.x / u_resolution.y;
                m.x *= u_resolution.x / u_resolution.y;

                float dist = distance(st, m);
                float mouseEffect = smoothstep(0.4, 0.0, dist);
                
                vec2 pos = vec2(st * 3.0);
                pos -= mouseEffect * 0.4; // Fluid drag

                float n = snoise(pos + u_time * 0.2);
                float n2 = snoise(pos * 2.0 - u_time * 0.3);
                float finalNoise = snoise(vec2(n, n2) * 2.0 + u_time * 0.1);

                // Dark theme colors
                vec3 darkBase = vec3(0.05, 0.05, 0.1);    // Deep dark
                vec3 darkPrimary = vec3(0.3, 0.1, 0.5);   // Purple
                vec3 darkSecondary = vec3(0.1, 0.6, 0.8); // Cyan
                
                vec3 colorDark = mix(darkBase, darkPrimary, finalNoise * 0.8 + 0.2);
                colorDark = mix(colorDark, darkSecondary, mouseEffect * clamp(finalNoise, 0.0, 1.0));

                // Light theme colors
                vec3 lightBase = vec3(0.85, 0.9, 0.95);
                vec3 lightPrimary = vec3(0.95, 0.7, 0.9);
                vec3 lightSecondary = vec3(0.3, 0.6, 1.0);
                
                vec3 colorLight = mix(lightBase, lightPrimary, finalNoise * 0.8 + 0.2);
                colorLight = mix(colorLight, lightSecondary, mouseEffect * clamp(finalNoise, 0.0, 1.0));

                vec3 finalColor = mix(colorLight, colorDark, u_is_dark);

                gl_FragColor = vec4(finalColor, 1.0);
            }
        `;

        function createShader(type, source) {
            const shader = gl.createShader(type);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            return shader;
        }

        const vertexShader = createShader(gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);

        fluidProgram = gl.createProgram();
        gl.attachShader(fluidProgram, vertexShader);
        gl.attachShader(fluidProgram, fragmentShader);
        gl.linkProgram(fluidProgram);

        positionAttributeLocation = gl.getAttribLocation(fluidProgram, "a_position");
        timeUniformLocation = gl.getUniformLocation(fluidProgram, "u_time");
        resolutionUniformLocation = gl.getUniformLocation(fluidProgram, "u_resolution");
        mouseUniformLocation = gl.getUniformLocation(fluidProgram, "u_mouse");
        isDarkUniformLocation = gl.getUniformLocation(fluidProgram, "u_is_dark");

        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        const positions = [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    }

    function drawFluid() {
        if (!gl) return;
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        gl.useProgram(fluidProgram);

        gl.enableVertexAttribArray(positionAttributeLocation);
        gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

        const currentTime = (Date.now() - startTime) / 1000 * speedMult;
        gl.uniform1f(timeUniformLocation, currentTime);
        gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

        // Smooth mouse target trailing
        const targetX = mouse.x !== undefined ? mouse.x : -1000;
        const targetY = mouse.y !== undefined ? mouse.y : -1000;

        fluidMouse.x += (targetX - fluidMouse.x) * 0.1;
        fluidMouse.y += (targetY - fluidMouse.y) * 0.1;

        gl.uniform2f(mouseUniformLocation, fluidMouse.x, fluidMouse.y);

        const isDark = document.body.classList.contains('dark') ? 1.0 : 0.0;
        gl.uniform1f(isDarkUniformLocation, isDark);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    function animate() {
        requestAnimationFrame(animate);

        if (type === 'fluid') {
            drawFluid();
            return;
        }

        if (type === 'generative') {
            if (Date.now() - lastPaintTime > 15000 || totalPaintedArea > width * height * 0.8) {
                ctx.clearRect(0, 0, width, height);
                particles = [];
                totalPaintedArea = 0;
                lastPaintTime = Date.now();
            }

            const isDark = document.body.classList.contains('dark');
            ctx.globalCompositeOperation = 'source-over';
            ctx.fillStyle = isDark ? 'rgba(15, 23, 42, 0.05)' : 'rgba(255, 255, 255, 0.05)';
            ctx.fillRect(0, 0, width, height);

            ctx.globalCompositeOperation = isDark ? 'lighter' : 'source-over';
            for (let i = 0; i < particles.length; i++) {
                let p = particles[i];
                p.size *= 0.95;
                p.x += p.vx;
                p.y += p.vy;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.fill();

                if (p.size < 0.2) {
                    particles.splice(i, 1);
                    i--;
                }
            }
            ctx.globalCompositeOperation = 'source-over';
            hue += 2 * speedMult;
            if (hue >= 360) hue = 0;
            return;
        }

        ctx.clearRect(0, 0, width, height);

        if (type === 'particles') {
            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
            }
            connect();
        } else if (type === 'gravity') {
            drawGravityPlayground();
        } else if (type === 'rain') {
            drawRain();
        } else if (type === 'snow') {
            drawSnow();
        } else if (type === 'petals') {
            drawPetals();
        } else if (type === 'matrix') {
            drawMatrix();
        }
    }

    window.addEventListener('mousemove', function (event) {
        if (type === 'generative') {
            let dx = mouse.x !== undefined ? event.x - mouse.x : 0;
            let dy = mouse.y !== undefined ? event.y - mouse.y : 0;
            let dist = Math.sqrt(dx * dx + dy * dy);

            let size = Math.min(25, Math.max(2, dist * 0.2)) * speedMult;
            let color = `hsl(${hue}, 100%, 60%)`;

            particles.push({
                x: event.x,
                y: event.y,
                vx: dx * 0.05,
                vy: dy * 0.05,
                size: size,
                color: color
            });

            lastPaintTime = Date.now();
            totalPaintedArea += Math.PI * size * size;
        }

        mouse.x = event.x;
        mouse.y = event.y;
    });

    window.addEventListener('mouseout', function () {
        mouse.x = undefined;
        mouse.y = undefined;
        mouse.isLeftDown = false;
        mouse.isRightDown = false;
    });

    window.addEventListener('mousedown', (e) => {
        if (e.button === 0) mouse.isLeftDown = true;
        if (e.button === 2) mouse.isRightDown = true;

        if (type === 'particles' && e.button === 0) {
            const hue = Math.floor(Math.random() * 360);
            function hslToRgb(h, s, l) {
                s /= 100; l /= 100;
                const k = n => (n + h / 30) % 12;
                const a = s * Math.min(l, 1 - l);
                const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
                return `${Math.round(255 * f(0))}, ${Math.round(255 * f(8))}, ${Math.round(255 * f(4))}`;
            }
            for (let i = 0; i < particles.length; i++) {
                const h = (hue + Math.random() * 60 - 30 + 360) % 360; // Variations within this hue theme
                particles[i].color = hslToRgb(h, 85 + Math.random() * 15, 50 + Math.random() * 20);
            }
        }
    });

    window.addEventListener('mouseup', (e) => {
        if (e.button === 0) mouse.isLeftDown = false;
        if (e.button === 2) mouse.isRightDown = false;
    });

    window.addEventListener('contextmenu', (e) => {
        if (settingsJSON.bgAnimationType === 'gravity') {
            e.preventDefault();
        }
    });

    window.addEventListener('resize', function () {
        init();
    });

    init();
    animate();
}
