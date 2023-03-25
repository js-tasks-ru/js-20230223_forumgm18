import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart {
  subElements = {};
  url = '';
  range = {};
  data  = {};
  label = '';
  link = null;
  value = 0;
  formatHeading = null;
  chartHeight = 50;

  constructor(opt) {
    if (opt) this.setOptions(opt);
    this.render();
    this.getSubElements();
    this.initEventListeners();
    const {from, to} = this.range;
    this.update(from, to);
  }

  setOptions(opt) {
    Object.entries(opt).forEach(([key, val]) => this[key] = val);
    this.url = new URL(this.url, BACKEND_URL);
  }

  get getLoadingClass() {
    return this.data && this.data.length ? '' : ' column-chart_loading';
  }

  getTplChartStr() {
    const arrData = this.getColumnProps();
    return arrData.map(el => `<div style="--value: ${el.value}" data-tooltip="${el.percent}"></div>`).join('');
  }

  getTplTitleLink() {
    return (this.link && this.link.length) ? `<a href="${this.link}" class="column-chart__link">View all</a>` : '';
  }

  getTplFormatValue() {
    if (typeof this.formatHeading === 'function') return this.formatHeading(this.value);
    return this.value;
  }


  getTemplate() {
    return `
        <div class="dashboard__chart_orders${this.getLoadingClass}">
          <div class="column-chart" style="--chart-height: 50">
            <div class="column-chart__title">
              ${this.label}
              ${this.getTplTitleLink()}
            </div>
            <div class="column-chart__container">
              <div data-element="header" class="column-chart__header">${this.getTplFormatValue()}</div>
              <div data-element="body" class="column-chart__chart">
                ${this.getTplChartStr()}
              </div>
            </div>
          </div>
        </div>
        `;
  }

  render() {
    const element = document.createElement("div"); // (*)

    element.innerHTML = this.getTemplate();

    this.element = element.firstElementChild;
  }

  getSubElements(){
    this.element
      .querySelectorAll('[data-element]')
      .forEach(el => this.subElements[el.dataset.element] = el);
  }


  updateChartBody() {
    const {body} = this.subElements;
    body.innerHTML = this.getTplChartStr();
  }
  async update(from, to) {
    try {
      this.element.classList.add('column-chart_loading');

      this.url.searchParams.set('from', from.toISOString());
      this.url.searchParams.set('to', to.toISOString());

      const data = await fetchJson(this.url);
      this.data = data;

      this.updateChartBody()

      this.element.classList.remove('column-chart_loading');

      return data;

    } catch(e) {
      console.log(e);
    }
  }

  initEventListeners() {
    // NOTE: в данном методе добавляем обработчики событий, если они есть
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }

  getColumnProps() {
    const 
      data = Object.values(this.data),
      maxValue = data.length ? Math.max(...data) : 1,
      scale = 50 / maxValue;
  
    return data.map(item => {
      return {
        percent: (item / maxValue * 100).toFixed(0) + '%',
        value: String(Math.floor(item * scale))
      };
    });
  }
  
}
