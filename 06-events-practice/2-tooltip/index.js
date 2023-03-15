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
    this.element.style.top = `${e.y + 10}px`;
  };

  initialize () {
    document.addEventListener('pointerover', e => {
      if ( e.target.dataset.tooltip != undefined) {
        this.render(e.target.dataset.tooltip);
        e.target.addEventListener('pointermove', this.pointerMove )
      }
    });

    document.addEventListener('pointerout', e => {
      if ( e.target.dataset.tooltip != undefined) {
        e.target.removeEventListener('pointermove', this.pointerMove )
        this.destroy();
      }
    });

  }

  remove() {
    if (this.element) this.element.remove();
  }

  destroy() {
    this.remove();
    Tooltip.self = null;
  }
  
}

export default Tooltip;
