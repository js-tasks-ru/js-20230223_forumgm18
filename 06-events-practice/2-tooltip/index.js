class Tooltip {
  static self;
  
  constructor() {
    if (Tooltip.self) return Tooltip.self; 
    Tooltip.self = this;
  }

  render(text) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `<div class="tooltip">${text}</div>`;
    this.element = wrapper.firstElementChild;
    document.body.append(this.element);
  }
  
  pointerMove = (e) => {
    this.element.textContent = e.target.dataset.tooltip;
    this.element.style.left = `${e.x}px`;
    this.element.style.top = `${e.y + 15}px`;
  };

  pointerOver = (e) => {
    if ( e.target.dataset.tooltip != undefined) {
      this.render(e.target.dataset.tooltip);
      e.target.addEventListener('pointermove', this.pointerMove )
    }
  };

  pointerOut = (e) => {
    if ( e.target.dataset.tooltip != undefined) {
      e.target.removeEventListener('pointermove', this.pointerMove )
      this.destroy();
    }
  };

  initialize () {
    document.addEventListener('pointerover', this.pointerOver);
    document.addEventListener('pointerout', this.pointerOut);
  }

  remove() {
    if (this.element) this.element.remove();
  }

  destroy() {
    // document.removeEventListener('pointerover', this.pointerOver);
    // document.removeEventListener('pointerout', this.pointerOut);
    this.remove();
    Tooltip.self = null;
  }
  
}

export default Tooltip;
