/**
 * RASOI 3D — 3D Card Tilt & Specular Lighting Engine
 * Adds realistic 3D perspective tilt and dynamic mouse glare to recipe cards
 */

class Tilt3DController {
  constructor(options = {}) {
    this.maxTilt = options.maxTilt || 14;      // Max tilt rotation degrees
    this.perspective = options.perspective || 1000;
    this.scale = options.scale || 1.025;      // Slight lift scale on hover
    this.speed = options.speed || 300;        // Transition speed ms
    this.glare = options.glare !== false;     // Enable specular glare
  }

  // Bind tilt physics to an element
  bind(element) {
    if (!element || element._tiltBound) return;
    element._tiltBound = true;

    // Ensure card has tilt class
    element.classList.add('tilt-card');

    // Create glare layer if enabled and not already present
    if (this.glare && !element.querySelector('.card-glare')) {
      const glareEl = document.createElement('div');
      glareEl.className = 'card-glare';
      element.appendChild(glareEl);
    }

    let isHovering = false;
    let transitionTimeout = null;

    const onMouseEnter = () => {
      isHovering = true;
      element.style.transition = 'none';
      if (window.SoundEngine) {
        // Optional subtle hover interaction
      }
    };

    const onMouseMove = (e) => {
      if (!isHovering) return;
      const rect = element.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;

      const percentX = clientX / rect.width;
      const percentY = clientY / rect.height;

      // Calculate tilt angles (-max to +max)
      const tiltX = (this.maxTilt / 2 - percentY * this.maxTilt).toFixed(2);
      const tiltY = (percentX * this.maxTilt - this.maxTilt / 2).toFixed(2);

      // Apply 3D transform with depth lift
      element.style.transform = `perspective(${this.perspective}px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(${this.scale}, ${this.scale}, ${this.scale})`;

      // Update glare position CSS variables
      element.style.setProperty('--mouse-x', `${(percentX * 100).toFixed(1)}%`);
      element.style.setProperty('--mouse-y', `${(percentY * 100).toFixed(1)}%`);
    };

    const onMouseLeave = () => {
      isHovering = false;
      element.style.transition = `transform ${this.speed}ms cubic-bezier(0.16, 1, 0.3, 1)`;
      element.style.transform = `perspective(${this.perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;

      clearTimeout(transitionTimeout);
      transitionTimeout = setTimeout(() => {
        element.style.transition = '';
      }, this.speed);
    };

    element.addEventListener('mouseenter', onMouseEnter, { passive: true });
    element.addEventListener('mousemove', onMouseMove, { passive: true });
    element.addEventListener('mouseleave', onMouseLeave, { passive: true });
  }

  // Auto bind all cards in container
  bindAll(selector = '.recipe-card-3d') {
    const cards = document.querySelectorAll(selector);
    cards.forEach(card => this.bind(card));
  }
}

// Global Tilt Instance
window.TiltEngine = new Tilt3DController();
