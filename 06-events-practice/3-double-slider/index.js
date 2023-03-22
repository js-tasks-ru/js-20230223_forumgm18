export default class DoubleSlider {
  subElements = {};
  
  constructor({
    min = 0,
    max = 100,
    formatValue = value => value,
    selected = {
      from: min,
      to: max
    }
  }) {
  
    this.min = min;
    this.max = max;
    this.selected = {...selected};
    this.formatValue = formatValue;
    this.render();
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTemplate;
    this.element = wrapper.firstElementChild;
    this.getSubElements();
    this.addListeners();
    this.update();
  }

  get getTemplate() {
    const {from, to} = this.selected;
    return `
    <div class="range-slider">
      <span data-element="from">${this.formatValue(from)}</span>
      <div class="range-slider__inner" data-element="inner">
        <span class="range-slider__progress" data-element="progress"></span>
        <span class="range-slider__thumb-left" data-element="tLeft"></span>
        <span class="range-slider__thumb-right" data-element="tRight"></span>
      </div>
      <span data-element="to">${this.formatValue(to)}</span>
    </div>
    `;
  }

  getSubElements(){
    this.element
      .querySelectorAll('[data-element]')
      .forEach(el => this.subElements[el.dataset.element] = el);
  }

  getLeft() {
    const delta = this.delta > 0 ? this.delta : 1;
    return Math.floor(100 * (this.selected.from - this.min) / delta);
  }

  getRight() {
    const delta = this.delta > 0 ? this.delta : 1;
    return Math.floor(100 * (this.max - this.selected.to) / delta);
  }
  
  get delta() {return this.max - this.min}; 
  get selectedDelta() {return this.selected.to - this.selected.from}; 

  addListeners(){
    const {tLeft, tRight, inner} = this.subElements;
    tLeft.ondragstart = () => false;
    tRight.ondragstart = () => false;
    inner.ondragstart = () => false;

    inner.addEventListener('pointerdown', this.progressClick);
    tLeft.addEventListener('pointerdown', this.startDrag);
    tRight.addEventListener('pointerdown', this.startDrag);

  } 

  progressClick = (e) => {
    const curentSelected = this.curentSelectedValue(e.clientX);  
    this.updateSelected(curentSelected);
    this.update();
    this.dispatchRangeSelectEvent();

  }

  curentSelectedValue(mouseX) {
      const 
        inner = this.subElements.inner,
        {left, width} = inner.getBoundingClientRect(),
        tmpRes = (mouseX - left) * this.delta / width
      ;
        return  this.min +  Math.round(tmpRes);  
  }

  startDrag = (e) => {
    const 
      dragEl = e.target,
      x = e.clientX,
      {tLeft} = this.subElements;


    e.preventDefault();

    const {left, right} = dragEl.getBoundingClientRect();

    this.cursorShiftX = dragEl === tLeft ? right - x : left - x;
    this.dragginEl = dragEl;

    console.log (this);
    // this.update();
    document.addEventListener('pointermove', this.pointerMove);
    document.addEventListener('pointerup', this.stopDrag);

  }

  stopDrag = (e) => {
    this.dragginEl = null; 

    document.removeEventListener('pointermove', this.pointerMove);
    document.removeEventListener('pointerup', this.stopDrag);

    this.dispatchRangeSelectEvent();
  }
  
  pointerMove = (e) => {
    e.preventDefault();
    const 
      x = e.clientX,
      newVal = this.curentSelectedValue(x)
    ;

    if (this.dragginEl === this.subElements.tLeft) {
      this.updateSelectedLeft(newVal)
      this.moveLeftThumb(x)
    }

    if (this.dragginEl === this.subElements.tRight) {
      this.updateSelectedRigth(newVal)
      this.moveRigthThumb(x)
    }
  }

  updateSelected(val) {
    val = Math.round(val);

    if (val < this.min) val = this.min;
    if (val > this.max) val = this.max;
        
    if ((this.selectedDelta / 2) - ( val - this.selected.from) > 0 ) {
      this.selected.from = val
    } else  {
      this.selected.to = val
    }

  }

  updateSelectedLeft(val) {
    if (val < this.min) val = this.min;
    if (val > this.selected.to) val = this.selected.to;
    this.selected.from = val;
  }

  updateSelectedRigth(val) {
    if (val > this.max) val = this.max;
    if (val < this.selected.from) val = this.selected.from;
    this.selected.to = val;
  }

  moveLeftThumb(x) {
    const 
      {progress, from: fromEl, inner} = this.subElements,
      { left: innerLeft, width } = inner.getBoundingClientRect();

    let newLeft = (x - innerLeft + this.cursorShiftX) / width;

    if (newLeft < 0) newLeft = 0;
    newLeft *= 100;

    const right = parseFloat(this.subElements.tRight.style.right);
    
    if (newLeft + right > 100) newLeft = 100 - right;

    this.dragginEl.style.left = newLeft + '%';
    progress.style.left = newLeft + '%';
    fromEl.innerHTML = this.formatValue(this.selected.from);

  }
  
  moveRigthThumb(x) {
    const 
      { progress, to: toEl, inner } = this.subElements,
      { right: innerRight, width } = inner.getBoundingClientRect();

    let newRight = (innerRight - x - this.cursorShiftX) / width;

    if (newRight < 0) newRight = 0;
    
    newRight *= 100;

    const left = parseFloat(this.subElements.tLeft.style.left);

    if (left + newRight > 100) newRight = 100 - left;
    
    this.dragginEl.style.right = newRight + '%';
    progress.style.right = newRight + '%';
    toEl.innerHTML = this.formatValue(this.selected.to);
  }

  dispatchRangeSelectEvent() {
    const detail = {...this.selected}
    const rangeSelectEvent = new CustomEvent('range-select', {detail, bubbles: true})
    this.element.dispatchEvent(rangeSelectEvent);

  }

  update() {
    const 
      left = `${this.getLeft()}%`,
      right = `${this.getRight()}%`
    ;  
    this.subElements.from.innerHTML = this.formatValue(this.selected.from);
    this.subElements.to.innerHTML = this.formatValue(this.selected.to);

    this.subElements.progress.style.left = left;
    this.subElements.progress.style.right = right;

    this.subElements.tLeft.style.left = left;
    this.subElements.tRight.style.right = right;
  }

remove() {
  if (this.element) this.element.remove();
 }

 destroy() {
  document.removeEventListener('pointermove', this.pointerMove);
  document.removeEventListener('pointerup', this.stopDrag);

  this.remove();
  this.subElements = {}
 }

}
