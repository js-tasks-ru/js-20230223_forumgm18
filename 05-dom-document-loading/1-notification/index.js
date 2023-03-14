export default class NotificationMessage {
  static currentNM;
  subElem = {};
  constructor(message = '', {
    duration = 2000,
    type = 'success',
    title = 'Notification'
  } = {}) {
    this.duration = duration;
    this.type = type;
    this.message = message;
    this.title = title;
    this.render();
  }
  get template() { return `
    <div class="notification ${this.type}" style="--value:${this.duration}ms">
      <div class="timer" data-elem="timer"></div>
      <div class="inner-wrapper">
        <div class="notification-header" data-elem="header">${this.title}</div>
        <div class="notification-body" data-elem="body">
        ${this.message}
        </div>
      </div>
    </div>
  `
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.template; 
    this.element = wrapper.firstElementChild;
    this.setSubElems();
  }
  setSubElems() {
    this.element
      .querySelectorAll('[data-elem]')
      .forEach(el => this.subElem[el.dataset.elem] = el);
  }
  show(node = document.body) {
    if ( NotificationMessage.currentNM) 
      this.destroy.call(NotificationMessage.currentNM);
    
    NotificationMessage.currentNM = this; 
    node.append(this.element);
    setTimeout(() => this.remove(), this.duration);
  }
  remove(){
    if (this.element ) this.element.remove();
  }
  destroy(){
    this.remove();
    NotificationMessage.currentNM = null; 
  }
}
