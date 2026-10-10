/* ==========================================================================
   Echou — 100% Native iPhone Sonar Interactive 3D Architecture & Engine
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // ----------------------------------------------------------------------
    // 1. Web Audio API Sonar Synth Engine
    // ----------------------------------------------------------------------
    let audioCtx = null;
    let audioActive = false;
    let audioPingTimer = null;
    let audioFrequencyMode = 'near-ultrasound'; // 'near-ultrasound' vs 'audible-demo'

    const audioToggleBtn = document.getElementById('audioToggleBtn');
    const audioLed = document.getElementById('audioLed');
    const audioLabel = document.getElementById('audioLabel');

    function initAudioContext() {
        if (!audioCtx) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            audioCtx = new AudioContextClass();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    }

    function emitAudioPing(frequency = 19000, duration = 0.08) {
        if (!audioActive || !audioCtx) return;
        try {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.type = 'sine';
            const baseFreq = audioFrequencyMode === 'near-ultrasound' ? 19000 : frequency;
            
            // Linear frequency sweep (chirp)
            osc.frequency.setValueAtTime(baseFreq, audioCtx.currentTime);
            osc.frequency.linearRampToValueAtTime(baseFreq + 3500, audioCtx.currentTime + duration);

            // Hann-style smooth envelope to prevent speaker pop
            gain.gain.setValueAtTime(0.001, audioCtx.currentTime);
            gain.gain.linearRampToValueAtTime(0.18, audioCtx.currentTime + duration * 0.2);
            gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            osc.start();
            osc.stop(audioCtx.currentTime + duration);
        } catch (e) {
            console.warn('Audio error:', e);
        }
    }

    if (audioToggleBtn) {
        audioToggleBtn.addEventListener('click', () => {
            initAudioContext();
            audioActive = !audioActive;
            if (audioActive) {
                audioToggleBtn.classList.add('active');
                audioLabel.textContent = audioFrequencyMode === 'near-ultrasound' ? 'Chirp Emitting (18-22kHz)' : 'Audible Demo Active';
                scheduleAudioCadence();
            } else {
                audioToggleBtn.classList.remove('active');
                audioLabel.textContent = 'Demo Audio Muted';
                if (audioPingTimer) clearInterval(audioPingTimer);
            }
        });
    }

    function scheduleAudioCadence() {
        if (audioPingTimer) clearInterval(audioPingTimer);
        if (!audioActive) return;

        const d = simState.distanceMeters || 2.1;
        const audiblePitch = Math.round(440 + Math.max(0, (1 - d / 4.2)) * 600);
        const intervalMs = Math.round(180 + (d / 4.2) * 1100);

        audioPingTimer = setInterval(() => {
            emitAudioPing(audiblePitch, 0.08);
            scheduleAudioCadence();
        }, intervalMs);
    }

    // ----------------------------------------------------------------------
    // 2. Three.js 3D WebGL iPhone Model Showcase
    // ----------------------------------------------------------------------
    const threeContainer = document.getElementById('threeContainer');
    const loadingOverlay = document.getElementById('loadingOverlay');

    let scene, camera, renderer, controls;
    let iphoneRoot, internalXrayGroup, screenMesh, screenMaterial;
    let sonicRings = [];
    let autoRotate = true;
    let isXrayMode = false;
    let xrayProgress = 0;

    function init3DiPhoneShowcase() {
        if (!threeContainer || typeof THREE === 'undefined') {
            if (loadingOverlay) loadingOverlay.innerHTML = '<span>3D Library unavailable.</span>';
            return;
        }

        const width = threeContainer.clientWidth;
        const height = threeContainer.clientHeight;

        scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x060609, 0.06);

        camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
        camera.position.set(3.4, 1.4, 4.2);

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.2;
        threeContainer.appendChild(renderer.domElement);

        if (typeof THREE.OrbitControls !== 'undefined') {
            controls = new THREE.OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.05;
            controls.maxDistance = 8.5;
            controls.minDistance = 2.0;
            controls.target.set(0, 0, 0);
        }

        // Apple Studio Lighting
        const keyLight = new THREE.DirectionalLight(0xFFFFFF, 2.4);
        keyLight.position.set(4, 7, 5);
        keyLight.castShadow = true;
        scene.add(keyLight);

        const fillLight = new THREE.DirectionalLight(0x8095B5, 1.3);
        fillLight.position.set(-5, 2, -3);
        scene.add(fillLight);

        const rimLight = new THREE.DirectionalLight(0x00F0FF, 1.6);
        rimLight.position.set(0, -4, -4);
        scene.add(rimLight);

        const ambientLight = new THREE.AmbientLight(0x282A32, 1.6);
        scene.add(ambientLight);

        // Build procedural iPhone 15/16 Pro
        buildIPhoneModel();

        if (loadingOverlay) {
            loadingOverlay.style.opacity = '0';
            setTimeout(() => loadingOverlay.style.display = 'none', 500);
        }

        window.addEventListener('resize', onWindowResize3D);
        animate3D();
    }

    function buildIPhoneModel() {
        iphoneRoot = new THREE.Group();
        scene.add(iphoneRoot);

        internalXrayGroup = new THREE.Group();
        iphoneRoot.add(internalXrayGroup);

        // Realistic iPhone Dimensions (Pro proportions: ~2.1 x 4.3 x 0.28)
        const W = 2.15;
        const H = 4.35;
        const D = 0.28;

        // Titanium Frame Material
        const titaniumFrameMat = new THREE.MeshStandardMaterial({
            color: 0x3E3F44, // Natural Titanium
            metalness: 0.92,
            roughness: 0.22,
        });

        // Matte Ceramic Back Glass
        const rearGlassMat = new THREE.MeshStandardMaterial({
            color: 0x2C2D32,
            metalness: 0.4,
            roughness: 0.35,
        });

        // Glossy Front Display Glass
        screenMaterial = new THREE.MeshStandardMaterial({
            color: 0x07080B,
            metalness: 0.2,
            roughness: 0.05,
            transparent: true,
            opacity: 0.98,
        });

        // Machined Speaker Holes & Camera Metal
        const metalChromeMat = new THREE.MeshStandardMaterial({
            color: 0xC8CCD4,
            metalness: 0.98,
            roughness: 0.12,
        });

        // 1. Titanium Chassis Outer Body
        const bodyGeo = new THREE.BoxGeometry(W, H, D);
        const bodyMesh = new THREE.Mesh(bodyGeo, titaniumFrameMat);
        iphoneRoot.add(bodyMesh);

        // 2. Rear Glass Plate
        const rearGlassGeo = new THREE.BoxGeometry(W * 0.96, H * 0.96, 0.02);
        const rearGlass = new THREE.Mesh(rearGlassGeo, rearGlassMat);
        rearGlass.position.z = -D / 2 - 0.005;
        iphoneRoot.add(rearGlass);

        // 3. Apple Logo Subtle Emboss on Rear
        const logoGeo = new THREE.CircleGeometry(0.18, 32);
        const logoMesh = new THREE.Mesh(logoGeo, new THREE.MeshStandardMaterial({ color: 0x4A4B50, metalness: 0.8, roughness: 0.2 }));
        logoMesh.position.set(0, 0.2, -D / 2 - 0.016);
        logoMesh.rotation.y = Math.PI;
        iphoneRoot.add(logoMesh);

        // 4. Rear Triple Camera Plateau (Houses Mic 3)
        const camPlateauGeo = new THREE.BoxGeometry(1.0, 1.05, 0.12);
        const camPlateau = new THREE.Mesh(camPlateauGeo, titaniumFrameMat);
        camPlateau.position.set(-0.46, 1.35, -D / 2 - 0.06);
        iphoneRoot.add(camPlateau);

        // Triple Camera Lenses
        const lensPositions = [
            [-0.68, 1.58],
            [-0.68, 1.12],
            [-0.26, 1.35]
        ];
        lensPositions.forEach(([x, y]) => {
            const lensRing = new THREE.Mesh(
                new THREE.CylinderGeometry(0.22, 0.22, 0.12, 32),
                metalChromeMat
            );
            lensRing.rotateX(Math.PI / 2);
            lensRing.position.set(x, y, -D / 2 - 0.12);
            iphoneRoot.add(lensRing);

            const glassLens = new THREE.Mesh(
                new THREE.CircleGeometry(0.18, 32),
                new THREE.MeshStandardMaterial({ color: 0x0A0F1E, metalness: 0.9, roughness: 0.05 })
            );
            glassLens.position.set(x, y, -D / 2 - 0.185);
            glassLens.rotation.y = Math.PI;
            iphoneRoot.add(glassLens);
        });

        // MIC 3: Rear Camera Microphone Port (Pinhole next to flash)
        const rearMicHole = new THREE.Mesh(
            new THREE.CircleGeometry(0.035, 16),
            new THREE.MeshBasicMaterial({ color: 0x00F0FF })
        );
        rearMicHole.position.set(-0.26, 1.62, -D / 2 - 0.125);
        rearMicHole.rotation.y = Math.PI;
        iphoneRoot.add(rearMicHole);

        // True Tone Flash
        const flashMesh = new THREE.Mesh(
            new THREE.CircleGeometry(0.08, 16),
            new THREE.MeshStandardMaterial({ color: 0xFFF2D0, roughness: 0.3 })
        );
        flashMesh.position.set(-0.26, 1.62, -D / 2 - 0.125);
        flashMesh.rotation.y = Math.PI;
        iphoneRoot.add(flashMesh);

        // iPhone Pro Built-in LiDAR Scanner (Dark optical dToF circle on camera plateau)
        const lidarScannerMesh = new THREE.Mesh(
            new THREE.CylinderGeometry(0.14, 0.14, 0.12, 32),
            new THREE.MeshStandardMaterial({ color: 0x181024, metalness: 0.85, roughness: 0.1 })
        );
        lidarScannerMesh.rotateX(Math.PI / 2);
        lidarScannerMesh.position.set(-0.26, 1.08, -D / 2 - 0.115);
        iphoneRoot.add(lidarScannerMesh);

        // LiDAR Sensor Optical Core Ring
        const lidarCoreRing = new THREE.Mesh(
            new THREE.RingGeometry(0.06, 0.12, 24),
            new THREE.MeshBasicMaterial({ color: 0xBF5AF2, side: THREE.DoubleSide })
        );
        lidarCoreRing.position.set(-0.26, 1.08, -D / 2 - 0.176);
        lidarCoreRing.rotation.y = Math.PI;
        iphoneRoot.add(lidarCoreRing);

        // 5. Front Display Screen Glass
        const screenGeo = new THREE.BoxGeometry(W * 0.95, H * 0.96, 0.015);
        screenMesh = new THREE.Mesh(screenGeo, screenMaterial);
        screenMesh.position.z = D / 2 + 0.008;
        iphoneRoot.add(screenMesh);

        // Dynamic Island Cutout (Houses Top Earpiece Speaker + MIC 2)
        const islandGeo = new THREE.BoxGeometry(0.58, 0.15, 0.02);
        const islandMesh = new THREE.Mesh(islandGeo, new THREE.MeshBasicMaterial({ color: 0x000000 }));
        islandMesh.position.set(0, 1.76, D / 2 + 0.018);
        iphoneRoot.add(islandMesh);

        // Top Front Microphone Dot (Inside Dynamic Island)
        const topMicDot = new THREE.Mesh(new THREE.CircleGeometry(0.025, 16), new THREE.MeshBasicMaterial({ color: 0x00F0FF }));
        topMicDot.position.set(0.16, 1.76, D / 2 + 0.029);
        iphoneRoot.add(topMicDot);

        // Top Front Earpiece Speaker Slit (Primary Top Chirp Emitter)
        const earpieceSlit = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.02, 0.01), new THREE.MeshBasicMaterial({ color: 0x30D158 }));
        earpieceSlit.position.set(-0.06, 1.76, D / 2 + 0.029);
        iphoneRoot.add(earpieceSlit);

        // Echou UI Overlay Glowing on Screen
        const uiLineGeo = new THREE.BoxGeometry(0.8, 0.015, 0.005);
        const uiLine = new THREE.Mesh(uiLineGeo, new THREE.MeshBasicMaterial({ color: 0x00F0FF }));
        uiLine.position.set(0, 0.2, D / 2 + 0.02);
        iphoneRoot.add(uiLine);

        // 6. Bottom Edge: USB-C Port, Bottom Mics, & Bottom Stereo Speaker
        // USB-C Center Port
        const usbcHole = new THREE.Mesh(
            new THREE.BoxGeometry(0.42, 0.09, 0.12),
            new THREE.MeshStandardMaterial({ color: 0x08080C, roughness: 0.9 })
        );
        usbcHole.position.set(0, -H / 2 - 0.01, 0);
        iphoneRoot.add(usbcHole);

        // MIC 1: Bottom Microphone Holes (Left of USB-C)
        for (let i = -0.55; i >= -0.75; i -= 0.1) {
            const micDot = new THREE.Mesh(
                new THREE.CylinderGeometry(0.025, 0.025, 0.06, 16),
                new THREE.MeshBasicMaterial({ color: 0x00F0FF })
            );
            micDot.position.set(i, -H / 2 - 0.01, 0);
            iphoneRoot.add(micDot);
        }

        // Bottom Stereo Speaker Grille Holes (Right of USB-C - Primary Chirp Emitter)
        for (let i = 0.45; i <= 0.85; i += 0.1) {
            const spkDot = new THREE.Mesh(
                new THREE.CylinderGeometry(0.025, 0.025, 0.06, 16),
                new THREE.MeshBasicMaterial({ color: 0x30D158 }) // Green indicates chirp speaker
            );
            spkDot.position.set(i, -H / 2 - 0.01, 0);
            iphoneRoot.add(spkDot);
        }

        // Side Buttons (Action button, Volume, Power)
        const actionBtn = new THREE.Mesh(
            new THREE.BoxGeometry(0.04, 0.32, 0.09),
            new THREE.MeshStandardMaterial({ color: 0x50525A, metalness: 0.9 })
        );
        actionBtn.position.set(-W / 2 - 0.015, 1.25, 0);
        iphoneRoot.add(actionBtn);

        // -------------------------------------------------------------
        // 7. Internal X-Ray Components (Revealed when X-Ray is toggled)
        // -------------------------------------------------------------
        // Apple Taptic Engine (Bottom Right)
        const tapticGeo = new THREE.BoxGeometry(0.75, 0.45, 0.12);
        const tapticMat = new THREE.MeshStandardMaterial({ color: 0xC4C8D0, metalness: 0.8, roughness: 0.2 });
        const tapticMesh = new THREE.Mesh(tapticGeo, tapticMat);
        tapticMesh.position.set(0.48, -1.65, 0);
        internalXrayGroup.add(tapticMesh);

        // Apple Silicon A-Series SoC Chip
        const socGeo = new THREE.BoxGeometry(0.72, 0.72, 0.06);
        const socMat = new THREE.MeshStandardMaterial({ color: 0x1A1A1E, roughness: 0.4 });
        const socMesh = new THREE.Mesh(socGeo, socMat);
        socMesh.position.set(-0.25, 0.55, 0);
        internalXrayGroup.add(socMesh);

        // Internal Li-Ion Battery Cell
        const battGeo = new THREE.BoxGeometry(0.95, 2.3, 0.14);
        const battMat = new THREE.MeshStandardMaterial({ color: 0x222328, roughness: 0.6 });
        const battMesh = new THREE.Mesh(battGeo, battMat);
        battMesh.position.set(0.28, -0.3, 0);
        internalXrayGroup.add(battMesh);

        // Start with internal components hidden
        internalXrayGroup.visible = false;
    }

    function fire3DIPhoneChirp() {
        if (!iphoneRoot) return;

        // 1. Emit Sonar Chirp Wave from Bottom Stereo Speaker
        const bottomWave = new THREE.Mesh(
            new THREE.TorusGeometry(0.4, 0.03, 16, 40),
            new THREE.MeshBasicMaterial({ color: 0x30D158, transparent: true, opacity: 0.95 })
        );
        bottomWave.position.set(0.65, -2.25, 0.4);
        scene.add(bottomWave);

        sonicRings.push({
            mesh: bottomWave,
            zSpeed: 0.15,
            scaleSpeed: 0.08,
            opacity: 0.95
        });

        // 2. Emit Secondary Chirp from Dynamic Island Earpiece
        const topWave = new THREE.Mesh(
            new THREE.TorusGeometry(0.35, 0.025, 16, 40),
            new THREE.MeshBasicMaterial({ color: 0x00F0FF, transparent: true, opacity: 0.95 })
        );
        topWave.position.set(-0.06, 1.8, 0.4);
        scene.add(topWave);

        sonicRings.push({
            mesh: topWave,
            zSpeed: 0.14,
            scaleSpeed: 0.07,
            opacity: 0.95
        });

        // 3. Emit Optical LiDAR Pulse from Built-in iPhone Pro LiDAR Scanner
        const lidarWave = new THREE.Mesh(
            new THREE.TorusGeometry(0.25, 0.02, 16, 32),
            new THREE.MeshBasicMaterial({ color: 0xBF5AF2, transparent: true, opacity: 0.9 })
        );
        lidarWave.position.set(-0.26, 1.08, 0.4);
        scene.add(lidarWave);

        sonicRings.push({
            mesh: lidarWave,
            zSpeed: 0.16,
            scaleSpeed: 0.06,
            opacity: 0.9
        });

        // Trigger Audio ping
        emitAudioPing(simState.distanceMeters ? Math.round(440 + (1 - simState.distanceMeters / 4.2) * 500) : 620, 0.09);
    }

    function animate3D() {
        requestAnimationFrame(animate3D);

        // Idle showroom rotation
        if (autoRotate && iphoneRoot && !isXrayMode) {
            iphoneRoot.rotation.y += 0.007;
        }

        // X-Ray transition
        const targetXray = isXrayMode ? 1.0 : 0.0;
        xrayProgress += (targetXray - xrayProgress) * 0.1;

        if (screenMesh && internalXrayGroup) {
            screenMesh.material.opacity = 0.98 - xrayProgress * 0.72;
            internalXrayGroup.visible = xrayProgress > 0.05;
        }

        // Animate traveling 3D sonic wave rings
        for (let i = sonicRings.length - 1; i >= 0; i--) {
            const r = sonicRings[i];
            r.mesh.position.z += r.zSpeed;
            r.mesh.scale.x += r.scaleSpeed;
            r.mesh.scale.y += r.scaleSpeed;
            r.opacity -= 0.016;
            r.mesh.material.opacity = Math.max(0, r.opacity);

            if (r.opacity <= 0) {
                scene.remove(r.mesh);
                sonicRings.splice(i, 1);
            }
        }

        if (controls) controls.update();
        renderer.render(scene, camera);
    }

    function onWindowResize3D() {
        if (!threeContainer || !camera || !renderer) return;
        const width = threeContainer.clientWidth;
        const height = threeContainer.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    }

    // 3D UI Controls & Callouts
    const btn3dRotate = document.getElementById('btn3dRotate');
    const btn3dChirp = document.getElementById('btn3dChirp');
    const btn3dXray = document.getElementById('btn3dXray');
    const btn3dWireframe = document.getElementById('btn3dWireframe');

    const inspectBadge = document.getElementById('inspectBadge');
    const inspectTitle = document.getElementById('inspectTitle');
    const inspectText = document.getElementById('inspectText');
    const inspectSpecs = document.getElementById('inspectSpecs');

    if (btn3dRotate) {
        btn3dRotate.addEventListener('click', () => {
            autoRotate = !autoRotate;
            btn3dRotate.classList.toggle('active', autoRotate);
        });
    }

    if (btn3dChirp) {
        btn3dChirp.addEventListener('click', fire3DIPhoneChirp);
    }

    if (btn3dXray) {
        btn3dXray.addEventListener('click', () => {
            isXrayMode = !isXrayMode;
            btn3dXray.classList.toggle('active', isXrayMode);
            if (isXrayMode) {
                autoRotate = false;
                if (btn3dRotate) btn3dRotate.classList.remove('active');
                updateInspectionCard('xray');
            } else {
                updateInspectionCard('speakers');
            }
        });
    }

    let wireframeState = false;
    if (btn3dWireframe) {
        btn3dWireframe.addEventListener('click', () => {
            wireframeState = !wireframeState;
            btn3dWireframe.classList.toggle('active', wireframeState);
            if (iphoneRoot) {
                iphoneRoot.traverse((child) => {
                    if (child.isMesh && child.material) {
                        child.material.wireframe = wireframeState;
                    }
                });
            }
        });
    }

    // Preset Views for iPhone Hardware Callouts
    const presetTags = document.querySelectorAll('.preset-tag');
    presetTags.forEach(btn => {
        btn.addEventListener('click', () => {
            presetTags.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const view = btn.dataset.view;

            autoRotate = false;
            if (btn3dRotate) btn3dRotate.classList.remove('active');

            if (view === 'hero') {
                camera.position.set(3.4, 1.4, 4.2);
                updateInspectionCard('overview');
            } else if (view === 'speakers') {
                camera.position.set(0, -3.2, 3.4);
                updateInspectionCard('speakers');
            } else if (view === 'island') {
                camera.position.set(0, 2.8, 3.2);
                updateInspectionCard('island');
            } else if (view === 'camera') {
                camera.position.set(-1.8, 2.2, -4.0);
                updateInspectionCard('camera');
            } else if (view === 'lidar') {
                camera.position.set(-1.2, 1.8, -3.8);
                updateInspectionCard('lidar');
            }
        });
    });

    const COMPONENT_CARD_INFO = {
        overview: {
            badge: 'BUILT-IN HARDWARE ONLY',
            title: '100% Commodity iPhone Hardware',
            text: 'Zero extra sensors, dongles, or accessories. Echou turns the built-in speaker and microphones already in your iPhone into a real-time spatial sonar.',
            specs: [
                { k: 'Hardware Cost', v: '$0 Extra' },
                { k: 'Required Device', v: 'Any standard iPhone' },
                { k: 'Accessories', v: 'None' }
            ]
        },
        speakers: {
            badge: 'PRIMARY ACOUSTIC TRANSMITTER',
            title: 'Bottom Stereo Speaker & Mic 1',
            text: 'Fires 18–22 kHz near-ultrasonic linear frequency sweeps (Hann-tapered). The bottom microphone directly captures immediate ground and forward acoustic reflections.',
            specs: [
                { k: 'Emission Frequency', v: '18,000 – 22,000 Hz' },
                { k: 'Chirp Length', v: '3 – 10 ms Burst' },
                { k: 'Update Rate', v: '20 FPS Continuous' }
            ]
        },
        island: {
            badge: 'DYNAMIC ISLAND APERTURE',
            title: 'Top Earpiece Speaker & Mic 2',
            text: 'Houses the top front microphone and receiver speaker. Emits secondary upper acoustic waves and measures vertical and frontal echo delay differences.',
            specs: [
                { k: 'Sampling Clock', v: '48,000 Hz Native' },
                { k: 'Audio Engine', v: 'AVAudioEngine (.measurement)' },
                { k: 'OS Processing', v: 'Zero AGC / No Filter' }
            ]
        },
        camera: {
            badge: 'SPATIAL DEPTH MULTILATERATION',
            title: 'Rear Camera Microphone (Mic 3)',
            text: 'Positioned on the rear camera plateau. Working with the bottom and top mics, it establishes a 3-point acoustic baseline to calculate Time Difference of Arrival (TDOA).',
            specs: [
                { k: 'Acoustic Baseline', v: '~145 mm Mic Spacing' },
                { k: 'Directional Triangulation', v: 'Left / Center / Right' },
                { k: 'TDOA Precision', v: '~20.8 &mu;s per sample' }
            ]
        },
        xray: {
            badge: 'ON-DEVICE APPLE SILICON',
            title: 'Taptic Engine & Accelerate DSP',
            text: 'Inside the iPhone, the A-Series/M-Series processor runs vDSP FFT cross-correlations in under 12ms. The Apple Taptic Engine delivers private directional vibration pulses directly to the user.',
            specs: [
                { k: 'Processing Core', v: 'Apple Silicon vDSP' },
                { k: 'Tactile Engine', v: 'CoreHaptics Taptic' },
                { k: 'Cloud Dependency', v: '0% (100% Offline)' }
            ]
        },
        lidar: {
            badge: 'BUILT-IN iPHONE PRO SENSOR',
            title: 'iPhone Pro Built-in LiDAR Scanner',
            text: 'Integrated on the camera plateau of iPhone 12 Pro through 16 Pro models. Emits pulsed 940nm near-infrared photons to build a dense 3D point cloud, fusing with acoustic sonar to eliminate single-sensor blind spots.',
            specs: [
                { k: 'Technology', v: 'Direct Time-of-Flight (dToF)' },
                { k: 'Detection Range', v: 'Up to 5.0 meters' },
                { k: 'Hardware Cost', v: '$0 Extra (iPhone Pro Native)' }
            ]
        }
    };

    function updateInspectionCard(key) {
        const info = COMPONENT_CARD_INFO[key] || COMPONENT_CARD_INFO.overview;
        if (inspectBadge) inspectBadge.textContent = info.badge;
        if (inspectTitle) inspectTitle.textContent = info.title;
        if (inspectText) inspectText.textContent = info.text;
        if (inspectSpecs) {
            inspectSpecs.innerHTML = info.specs.map(s => `
                <div class="spec-row">
                    <span class="sk">${s.k}</span>
                    <span class="sv">${s.v}</span>
                </div>
            `).join('');
        }
    }

    init3DiPhoneShowcase();

    // ----------------------------------------------------------------------
    // 3. High-Resolution Spatial Radar Simulator
    // ----------------------------------------------------------------------
    const radarCanvas = document.getElementById('spatialRadarCanvas');
    const radarCtx = radarCanvas.getContext('2d');

    const simState = {
        mode: 'fusion', // 'fusion', 'sonar', 'lidar'
        material: 'concrete',
        temperature: 20,
        obsX: 420,
        obsY: 200,
        obsRadius: 26,
        isDragging: false,
        pulseWaves: [],
        particles: [],
        distanceMeters: 2.10,
    };

    const MATERIAL_DATA = {
        concrete: { name: 'Concrete Wall', sonar: 0.95, lidar: 0.90, color: '#A0A0B0', desc: 'Concrete Wall: Dense acoustic barrier and specular optical target. 95% sonar bounce, 90% LiDAR return.' },
        glass: { name: 'Plate Glass', sonar: 0.94, lidar: 0.04, color: '#64D2FF', desc: 'Plate Glass: 94% ultrasonic echo, 4% optical return! Lasers pass straight through; acoustic sonar prevents hazard!' },
        curtain: { name: 'Velvet Curtain', sonar: 0.12, lidar: 0.88, color: '#BF5AF2', desc: 'Velvet Curtain: 12% acoustic bounce (absorbed), 88% optical return. Sonar is silenced; LiDAR saves the user!' },
        person: { name: 'Pedestrian', sonar: 0.72, lidar: 0.78, color: '#FF9F0A', desc: 'Pedestrian: 72% acoustic scatter, 78% optical return. Multi-zone beam profiles moving human profile.' }
    };

    function resizeRadar() {
        if (!radarCanvas) return;
        const rect = radarCanvas.getBoundingClientRect();
        radarCanvas.width = rect.width * window.devicePixelRatio;
        radarCanvas.height = rect.height * window.devicePixelRatio;
        radarCtx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
    }
    resizeRadar();
    window.addEventListener('resize', resizeRadar);

    simState.obsX = (radarCanvas.offsetWidth || 700) * 0.62;
    simState.obsY = (radarCanvas.offsetHeight || 400) * 0.5;

    // Draggable obstacle
    radarCanvas.addEventListener('mousedown', (e) => {
        const rect = radarCanvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        if (Math.hypot(mx - simState.obsX, my - simState.obsY) < simState.obsRadius + 15) {
            simState.isDragging = true;
        } else if (mx > 120 && mx < radarCanvas.offsetWidth - 20) {
            simState.obsX = mx;
            simState.obsY = my;
            triggerRadarSweep();
        }
    });

    window.addEventListener('mousemove', (e) => {
        if (!simState.isDragging) return;
        const rect = radarCanvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        simState.obsX = Math.max(120, Math.min(radarCanvas.offsetWidth - 35, mx));
        simState.obsY = Math.max(35, Math.min(radarCanvas.offsetHeight - 35, my));
    });

    window.addEventListener('mouseup', () => simState.isDragging = false);

    // Touch
    radarCanvas.addEventListener('touchstart', (e) => {
        const rect = radarCanvas.getBoundingClientRect();
        const t = e.touches[0];
        const mx = t.clientX - rect.left;
        const my = t.clientY - rect.top;
        if (Math.hypot(mx - simState.obsX, my - simState.obsY) < simState.obsRadius + 20) {
            simState.isDragging = true;
            e.preventDefault();
        }
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
        if (!simState.isDragging) return;
        const rect = radarCanvas.getBoundingClientRect();
        const t = e.touches[0];
        simState.obsX = Math.max(120, Math.min(radarCanvas.offsetWidth - 35, t.clientX - rect.left));
        simState.obsY = Math.max(35, Math.min(radarCanvas.offsetHeight - 35, t.clientY - rect.top));
    });

    window.addEventListener('touchend', () => simState.isDragging = false);

    function triggerRadarSweep() {
        const deviceX = 75;
        const deviceY = radarCanvas.offsetHeight / 2;

        simState.pulseWaves.push({
            x: deviceX,
            y: deviceY,
            radius: 8,
            maxRadius: radarCanvas.offsetWidth * 1.1,
            speed: 13,
            hasCollided: false
        });

        // Trigger Audio ping
        const distM = simState.distanceMeters;
        const audibleFreq = Math.round(440 + Math.max(0, (1 - distM / 4.2)) * 600);
        emitAudioPing(audibleFreq, 0.08);

        // Also trigger 3D iPhone chirp wave!
        if (iphoneRoot) fire3DIPhoneChirp();
    }

    const fireSweepBtn = document.getElementById('fireSweepBtn');
    if (fireSweepBtn) fireSweepBtn.addEventListener('click', triggerRadarSweep);

    // Modes & Materials buttons
    const segButtons = document.querySelectorAll('.seg-btn');
    segButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            segButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            simState.mode = btn.dataset.mode;
            audioFrequencyMode = simState.mode;
            if (audioLabel) {
                audioLabel.textContent = audioActive ? (audioFrequencyMode === 'near-ultrasound' ? 'Chirp Emitting (18-22kHz)' : 'Audible Demo Active') : 'Demo Audio Muted';
            }
            triggerRadarSweep();
        });
    });

    const matCards = document.querySelectorAll('.mat-card');
    const materialExplanation = document.getElementById('materialExplanation');
    matCards.forEach(card => {
        card.addEventListener('click', () => {
            matCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            simState.material = card.dataset.mat;
            const mat = MATERIAL_DATA[simState.material];
            if (materialExplanation) materialExplanation.textContent = mat.desc;
            triggerRadarSweep();
        });
    });

    const tempSliderInput = document.getElementById('tempSliderInput');
    const tempValText = document.getElementById('tempValText');
    if (tempSliderInput) {
        tempSliderInput.addEventListener('input', (e) => {
            simState.temperature = parseInt(e.target.value);
            const speed = (331.3 + 0.606 * simState.temperature).toFixed(1);
            if (tempValText) tempValText.textContent = `${simState.temperature}°C (${speed} m/s)`;
        });
    }

    setInterval(() => {
        if (!simState.pulseWaves.length) triggerRadarSweep();
    }, 2500);

    // Telemetry DOM elements
    const coordReadout = document.getElementById('coordReadout');
    const dispDistance = document.getElementById('dispDistance');
    const dispDistBar = document.getElementById('dispDistBar');
    const dispTime = document.getElementById('dispTime');
    const dispFormula = document.getElementById('dispFormula');
    const dispSector = document.getElementById('dispSector');
    const dispHaptic = document.getElementById('dispHaptic');
    const dispConfidence = document.getElementById('dispConfidence');
    const dispValidation = document.getElementById('dispValidation');

    function renderRadarCanvas() {
        const W = radarCanvas.offsetWidth;
        const H = radarCanvas.offsetHeight;
        radarCtx.clearRect(0, 0, W, H);

        const deviceX = 75;
        const deviceY = H / 2;
        const maxRangePx = W - 90;
        const mat = MATERIAL_DATA[simState.material];

        // Range Arcs
        radarCtx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        radarCtx.lineWidth = 1;
        for (let r = 90; r <= maxRangePx; r += 90) {
            radarCtx.beginPath();
            radarCtx.arc(deviceX, deviceY, r, -Math.PI / 3, Math.PI / 3);
            radarCtx.stroke();

            const distLabel = ((r / maxRangePx) * 4.2).toFixed(1);
            radarCtx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            radarCtx.font = '10px JetBrains Mono';
            radarCtx.fillText(`${distLabel}m`, deviceX + r * Math.cos(Math.PI / 3) - 10, deviceY + r * Math.sin(Math.PI / 3) + 12);
        }

        // Radar Scanning Cones
        radarCtx.strokeStyle = 'rgba(0, 240, 255, 0.12)';
        radarCtx.beginPath();
        radarCtx.moveTo(deviceX, deviceY);
        radarCtx.lineTo(deviceX + maxRangePx * Math.cos(-Math.PI / 4), deviceY + maxRangePx * Math.sin(-Math.PI / 4));
        radarCtx.moveTo(deviceX, deviceY);
        radarCtx.lineTo(deviceX + maxRangePx * Math.cos(Math.PI / 4), deviceY + maxRangePx * Math.sin(Math.PI / 4));
        radarCtx.stroke();

        // Telemetry Math
        const dx = simState.obsX - deviceX;
        const dy = simState.obsY - deviceY;
        const pixelDist = Math.hypot(dx, dy);
        const distanceM = Math.max(0.15, (pixelDist / maxRangePx) * 4.2);
        simState.distanceMeters = distanceM;
        const angleDeg = ((Math.atan2(dy, dx) * 180) / Math.PI).toFixed(1);

        const c = 331.3 + (0.606 * simState.temperature);
        const roundTripMs = ((2 * distanceM) / c) * 1000;
        
        let confidence = 0;
        if (simState.mode === 'sonar') {
            confidence = Math.round(mat.sonar * 100);
        } else if (simState.mode === 'lidar') {
            confidence = Math.round(mat.lidar * 100);
        } else {
            confidence = Math.min(99, Math.round(Math.max(mat.sonar, mat.lidar) * 100 + 4));
        }

        // Update DOM
        if (coordReadout) coordReadout.textContent = `Range: ${distanceM.toFixed(2)}m • Direction: ${angleDeg}°`;
        if (dispDistance) dispDistance.textContent = distanceM.toFixed(2);
        if (dispDistBar) dispDistBar.style.width = `${Math.min(100, (distanceM / 4.2) * 100)}%`;
        if (dispTime) dispTime.textContent = roundTripMs.toFixed(1);
        if (dispFormula) dispFormula.textContent = `d = (${c.toFixed(1)} × ${(roundTripMs / 1000).toFixed(4)}) ÷ 2`;
        if (dispConfidence) dispConfidence.textContent = `${confidence}%`;

        // TDOA Sector Triangulation
        if (dispSector && dispHaptic) {
            const numAngle = parseFloat(angleDeg);
            if (numAngle < -12) {
                dispSector.className = 'zone-pill pill-caution';
                dispSector.textContent = `LEFT SECTOR (${Math.abs(numAngle)}° Port)`;
                dispHaptic.textContent = 'Taptic Engine: Left-panned vibration pulse';
            } else if (numAngle > 12) {
                dispSector.className = 'zone-pill pill-caution';
                dispSector.textContent = `RIGHT SECTOR (${numAngle}° Starboard)`;
                dispHaptic.textContent = 'Taptic Engine: Right-panned vibration pulse';
            } else {
                dispSector.className = 'zone-pill pill-safe';
                dispSector.textContent = 'CENTER SECTOR (Directly Ahead)';
                dispHaptic.textContent = 'Taptic Engine: Balanced center vibration pulse';
            }
        }

        if (dispValidation) {
            if (simState.mode === 'fusion') {
                dispValidation.textContent = confidence > 80 ? 'Dual-sensor validated' : 'Low confidence fallback';
            } else if (simState.mode === 'sonar') {
                dispValidation.textContent = confidence > 70 ? 'Ultrasonic echo locked' : 'Acoustic absorption warning!';
            } else {
                dispValidation.textContent = confidence > 70 ? 'LiDAR photons locked' : 'Optical pass-through failure!';
            }
        }

        // Draw Optical LiDAR Laser Beam (if in fusion or lidar mode)
        if (simState.mode === 'lidar' || simState.mode === 'fusion') {
            const beamAlpha = (simState.mode === 'fusion' ? 0.6 : 0.9) * (mat.lidar > 0.2 ? 1 : 0.25);
            radarCtx.strokeStyle = `rgba(0, 240, 255, ${beamAlpha})`;
            radarCtx.lineWidth = 2;
            radarCtx.setLineDash([6, 4]);
            radarCtx.beginPath();
            radarCtx.moveTo(deviceX, deviceY);
            radarCtx.lineTo(simState.obsX, simState.obsY);
            radarCtx.stroke();
            radarCtx.setLineDash([]);

            // If glass door in LiDAR mode: show laser pass-through blindspot warning!
            if (mat.lidar < 0.2) {
                radarCtx.strokeStyle = 'rgba(0, 240, 255, 0.2)';
                radarCtx.beginPath();
                radarCtx.moveTo(simState.obsX, simState.obsY);
                radarCtx.lineTo(simState.obsX + dx * 0.7, simState.obsY + dy * 0.7);
                radarCtx.stroke();

                radarCtx.fillStyle = '#FF453A';
                radarCtx.font = '10px JetBrains Mono';
                radarCtx.fillText('⚡ LiDAR Optical Pass-Through (Blind) - Sonar saves user!', simState.obsX + 35, simState.obsY);
            }
        }

        // Draw Ultrasonic Waves from iPhone
        for (let i = simState.pulseWaves.length - 1; i >= 0; i--) {
            const wave = simState.pulseWaves[i];
            wave.radius += wave.speed;
            const waveAlpha = Math.max(0, 1 - wave.radius / wave.maxRadius);

            radarCtx.strokeStyle = `rgba(48, 209, 88, ${waveAlpha * 0.8})`;
            radarCtx.lineWidth = 2.5;
            radarCtx.beginPath();
            radarCtx.arc(deviceX, deviceY, wave.radius, -Math.PI / 4, Math.PI / 4);
            radarCtx.stroke();

            // Collision
            if (!wave.hasCollided && Math.abs(wave.radius - pixelDist) < simState.obsRadius) {
                wave.hasCollided = true;
                const count = Math.round(15 * (mat.sonar || 0.8));
                for (let p = 0; p < count; p++) {
                    simState.particles.push({
                        x: simState.obsX,
                        y: simState.obsY,
                        vx: -((dx / pixelDist) * (4 + Math.random() * 4)) + (Math.random() - 0.5) * 2,
                        vy: -((dy / pixelDist) * (4 + Math.random() * 4)) + (Math.random() - 0.5) * 2,
                        life: 1.0,
                        color: (mat.sonar || 0.8) > 0.3 ? '#30D158' : '#FF453A'
                    });
                }
            }

            if (wave.radius > wave.maxRadius) simState.pulseWaves.splice(i, 1);
        }

        // Draw Echo Return Particles to iPhone
        for (let p = simState.particles.length - 1; p >= 0; p--) {
            const part = simState.particles[p];
            part.x += part.vx;
            part.y += part.vy;
            part.life -= 0.035;

            radarCtx.fillStyle = part.color;
            radarCtx.globalAlpha = Math.max(0, part.life);
            radarCtx.beginPath();
            radarCtx.arc(part.x, part.y, 3, 0, Math.PI * 2);
            radarCtx.fill();
            radarCtx.globalAlpha = 1.0;

            if (part.life <= 0) simState.particles.splice(p, 1);
        }

        // Draw iPhone Graphic in 2D Canvas
        radarCtx.save();
        radarCtx.translate(deviceX, deviceY);
        radarCtx.fillStyle = '#1D1E22';
        radarCtx.strokeStyle = '#30D158';
        radarCtx.lineWidth = 2;
        radarCtx.beginPath();
        radarCtx.roundRect(-16, -32, 32, 64, 8);
        radarCtx.fill();
        radarCtx.stroke();

        // Screen bezel
        radarCtx.fillStyle = '#060609';
        radarCtx.beginPath();
        radarCtx.roundRect(-13, -29, 26, 58, 6);
        radarCtx.fill();

        // Dynamic island dot
        radarCtx.fillStyle = '#000';
        radarCtx.beginPath();
        radarCtx.roundRect(-6, -26, 12, 4, 2);
        radarCtx.fill();

        // Speaker chirp green indicator dot
        radarCtx.fillStyle = '#30D158';
        radarCtx.beginPath();
        radarCtx.arc(0, 29, 2, 0, Math.PI * 2);
        radarCtx.fill();

        radarCtx.fillStyle = '#FFF';
        radarCtx.font = '8px JetBrains Mono';
        radarCtx.textAlign = 'center';
        radarCtx.fillText('iPHONE', 0, 42);
        radarCtx.restore();

        // Draw Draggable Obstacle
        radarCtx.save();
        radarCtx.translate(simState.obsX, simState.obsY);

        radarCtx.fillStyle = mat.color;
        radarCtx.strokeStyle = '#FFFFFF';
        radarCtx.lineWidth = simState.isDragging ? 3 : 1.5;
        radarCtx.beginPath();
        radarCtx.arc(0, 0, simState.obsRadius, 0, Math.PI * 2);
        radarCtx.fill();
        radarCtx.stroke();

        radarCtx.fillStyle = '#000';
        radarCtx.font = '10px Inter';
        radarCtx.fontWeight = '700';
        radarCtx.textAlign = 'center';
        radarCtx.textBaseline = 'middle';
        radarCtx.fillText(mat.name.split(' ')[0], 0, 0);

        radarCtx.restore();

        requestAnimationFrame(renderRadarCanvas);
    }
    renderRadarCanvas();
});
