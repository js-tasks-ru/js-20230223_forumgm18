class Tooltip {
  static self;
  
  constructor() {
    if (Tooltip.self) return Tooltip.self; 
    Tooltip.self = this;
    this.element = document.createElement('div');
    this.element.classList.add('tooltip')
  }
  initialize () {
    document.body.append(this.element);
    document.addEventListener('pointerover', this.pointerOver);
    document.addEventListener('pointerout', this.pointerOut);
  }

  render(text) {
    if (this.element) this.element.textContent = text
  }
  
  pointerMove = (e) => {
    const shift = 10;
    this.element.style.left = `${Math.round(e.clientX + shift)}px`;
    this.element.style.top = `${e.clientY + shift}px`;
  };

  pointerOver = (e) => {
    const tooltip = e.target.dataset.tooltip;
    if ( tooltip ) {
      this.render(tooltip);
      this.initialize()
      e.target.addEventListener('pointermove', this.pointerMove )
    }
  };

  pointerOut = (e) => {
    if ( e.target.dataset.tooltip ) {
      e.target.removeEventListener('pointermove', this.pointerMove )
      this.remove();
    }
  };


  remove() {
    if (this.element) this.element.remove();
  }

  destroy() {
    document.removeEventListener('pointerover', this.pointerOver);
    document.removeEventListener('pointerout', this.pointerOut);
    document.removeEventListener('pointerout', this.pointerMove);
    this.remove();
    Tooltip.self = null;
  }
  
}

export default Tooltip;
