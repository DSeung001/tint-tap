/**
 * 보스 캐릭터
 */
export class BossCharacter {
  constructor(container) {
    this.container = container;
    this.element = null;
    this.currentAnimation = null;
    this.isVisible = false;
    this.createCharacter();
  }

  createCharacter() {
    this.element = document.createElement('div');
    this.element.className = 'boss-character';
    this.element.style.cssText = `
      position: fixed;
      top: 60px;
      left: 50%;
      transform: translateX(-50%);
      width: 64px;
      height: 64px;
      image-rendering: pixelated;
      image-rendering: -moz-crisp-edges;
      image-rendering: crisp-edges;
      z-index: 1000;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.3s ease;
    `;
    
    this.element.innerHTML = this.getCharacterSprite();
    this.container.appendChild(this.element);
  }

  getCharacterSprite() {
    return `
      <img src="assets/img/boss.png" alt="Boss" style="
        width: 64px;
        height: 64px;
        display: block;
        image-rendering: pixelated;
        image-rendering: -moz-crisp-edges;
        image-rendering: crisp-edges;
      " />
    `;
  }

  show() {
    if (!this.element) return;
    this.isVisible = true;
    this.element.style.opacity = '1';
  }

  hide() {
    if (!this.element) return;
    this.isVisible = false;
    this.element.style.opacity = '0';
  }

  playAnimation(animationType) {
    if (!this.element) return;
    
    this.show();
    
    this.element.classList.remove('wave', 'laugh', 'point', 'rotate', 'bounce');
    this.element.classList.add(animationType);
    
    setTimeout(() => {
      this.element.classList.remove(animationType);
    }, 1000);
  }

  showImpact() {
    if (!this.element) return;
    
    const impact = document.createElement('div');
    impact.className = 'boss-impact';
    impact.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 80px;
      height: 80px;
      border: 3px solid #ff6f61;
      border-radius: 50%;
      animation: impactPulse 0.5s ease-out;
      pointer-events: none;
    `;
    
    this.element.appendChild(impact);
    
    setTimeout(() => {
      if (impact.parentNode) {
        impact.parentNode.removeChild(impact);
      }
    }, 500);
  }

  setPosition(x, y) {
    if (!this.element) return;
    this.element.style.left = `${x}px`;
    this.element.style.top = `${y}px`;
  }
}
