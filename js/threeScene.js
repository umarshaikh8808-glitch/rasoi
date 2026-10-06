/**
* RASOI 3D — Three.js Interactive 3D Canvas
* Renders floating spices, saffron particles, and ambient culinary embers with mouse parallax
*/

(function () {
  const canvas = document.getElementById('hero-3d-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  let scene, camera, renderer;
  let particlesMesh, floatingSpiceGroup;
  let mouseX = 0, mouseY = 0;
  let targetX = 0, targetY = 0;
  const windowHalfX = window.innerWidth / 2;
  const windowHalfY = window.innerHeight / 2;

  function init() {
    // 1. Scene Setup
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0c10, 0.0018);

    // 2. Camera Setup
    camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 1, 2000);
    camera.position.z = 600;

    // 3. Renderer Setup
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffeedd, 0.6);
    scene.add(ambientLight);

    const goldPointLight = new THREE.PointLight(0xf59e0b, 2.5, 900);
    goldPointLight.position.set(200, 300, 200);
    scene.add(goldPointLight);

    const rubyPointLight = new THREE.PointLight(0xef4444, 2.0, 900);
    rubyPointLight.position.set(-200, -200, 300);
    scene.add(rubyPointLight);

    // 5. Create Floating Spice Geometries & Saffron Gold Dust
    createSpiceParticles();
    createFloatingGeometries();

    // 6. Event Listeners
    window.addEventListener('resize', onWindowResize, { passive: true });
    window.addEventListener('mousemove', onDocumentMouseMove, { passive: true });

    // 7. Animation Loop
    animate();
  }

  // Floating Saffron Dust Particles
  function createSpiceParticles() {
    const particleCount = 180;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const colorSaffron = new THREE.Color(0xfbbf24);
    const colorFlame = new THREE.Color(0xf97316);
    const colorGold = new THREE.Color(0xf59e0b);

    for (let i = 0; i < particleCount * 3; i += 3) {
      // Distribute in a 3D cylindrical cloud around viewport
      positions[i] = (Math.random() - 0.5) * 1200;
      positions[i + 1] = (Math.random() - 0.5) * 900;
      positions[i + 2] = (Math.random() - 0.5) * 700;

      // Color variation between saffron gold and warm flame
      const mixRatio = Math.random();
      const chosenColor = mixRatio < 0.6 ? colorGold : (mixRatio < 0.85 ? colorSaffron : colorFlame);
      colors[i] = chosenColor.r;
      colors[i + 1] = chosenColor.g;
      colors[i + 2] = chosenColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Custom circular soft particle texture via canvas
    const canvasTexture = createParticleTexture();
    const material = new THREE.PointsMaterial({
      size: 7,
      map: canvasTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    particlesMesh = new THREE.Points(geometry, material);
    scene.add(particlesMesh);
  }

  // Procedural glowing particle texture
  function createParticleTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.3, 'rgba(251, 191, 36, 0.8)');
    gradient.addColorStop(0.7, 'rgba(245, 158, 11, 0.2)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 32, 32);

    return new THREE.CanvasTexture(canvas);
  }

  // Floating 3D Spice Elements (Cardamom, Star Anise crystals, Royal Cloves)
  function createFloatingGeometries() {
    floatingSpiceGroup = new THREE.Group();

    // Geometric representations of spices with metallic saffron sheen
    const materials = [
      new THREE.MeshStandardMaterial({
        color: 0xd97706,
        roughness: 0.35,
        metalness: 0.65,
        wireframe: false
      }),
      new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        roughness: 0.25,
        metalness: 0.8,
        wireframe: false
      }),
      new THREE.MeshStandardMaterial({
        color: 0xb45309,
        roughness: 0.4,
        metalness: 0.5,
        wireframe: false
      })
    ];

    const geometries = [
      new THREE.IcosahedronGeometry(12, 0),     // Star spice crystal
      new THREE.OctahedronGeometry(10, 0),       // Cardamom diamond
      new THREE.DodecahedronGeometry(8, 0),      // Peppercorn / spice pod
      new THREE.TorusGeometry(8, 3, 8, 16)       // Ring of clove / aroma
    ];

    // Create 22 floating 3D spice meshes
    for (let i = 0; i < 24; i++) {
      const geom = geometries[i % geometries.length];
      const mat = materials[i % materials.length];
      const mesh = new THREE.Mesh(geom, mat);

      mesh.position.set(
        (Math.random() - 0.5) * 1100,
        (Math.random() - 0.5) * 800,
        (Math.random() - 0.5) * 450
      );

      mesh.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );

      const scale = 0.8 + Math.random() * 0.9;
      mesh.scale.set(scale, scale, scale);

      mesh.userData = {
        rotSpeedX: (Math.random() - 0.5) * 0.015,
        rotSpeedY: (Math.random() - 0.5) * 0.018,
        floatSpeed: 0.001 + Math.random() * 0.002,
        initialY: mesh.position.y
      };

      floatingSpiceGroup.add(mesh);
    }

    scene.add(floatingSpiceGroup);
  }

  function onDocumentMouseMove(event) {
    mouseX = (event.clientX - windowHalfX);
    mouseY = (event.clientY - windowHalfY);
  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function animate() {
    requestAnimationFrame(animate);

    // Smooth camera mouse parallax tracking
    targetX = mouseX * 0.0006;
    targetY = mouseY * 0.0006;

    camera.position.x += (targetX * 250 - camera.position.x) * 0.04;
    camera.position.y += (-targetY * 200 - camera.position.y) * 0.04;
    camera.lookAt(scene.position);

    // Rotate particles slowly
    if (particlesMesh) {
      particlesMesh.rotation.y += 0.0008;
      particlesMesh.rotation.x += 0.0004;
    }

    // Animate each floating spice piece
    if (floatingSpiceGroup) {
      floatingSpiceGroup.rotation.y += 0.0005;
      const time = Date.now() * 0.001;

      floatingSpiceGroup.children.forEach(mesh => {
        mesh.rotation.x += mesh.userData.rotSpeedX;
        mesh.rotation.y += mesh.userData.rotSpeedY;
        mesh.position.y = mesh.userData.initialY + Math.sin(time + mesh.position.x) * 12;
      });
    }

    renderer.render(scene, camera);
  }

  // Initialize once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
