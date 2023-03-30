import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart {
  subElements = {};

  constructor({
    url = '',
    range = {},
    data  = {},
    label = '',
    link = '',
    value = 0,
    formatHeading = value => value,
    chartHeight = 50
  } = {}) {
    this.url = new URL(url, BACKEND_URL);
    this.range = range,
    this.data  = data,
    this.label = label,
    this.link = link,
    this.value = value,
    this.formatHeading = formatHeading,
    this.chartHeight = chartHeight

    this.render();
    this.getSubElements();

    const {from, to} = this.range;

    this.update(from, to);
  }


  get getLoadingClass() {
    return this.data.length ? '' : ' column-chart_loading';
  }

  getTplChartStr() {
    const arrData = this.getColumnProps();
    return arrData.map(el => `<div style="--value: ${el.value}" data-tooltip="${el.percent}"></div>`).join('');
  }

  getTplTitleLink() {
    return (this.link.length) ? `<a href="${this.link}" class="column-chart__link">View all</a>` : '';
  }


  getTemplate() {
    return `
        <div class="dashboard__chart_orders${this.getLoadingClass}">
          <div class="column-chart" style="--chart-height: ${this.chartHeight}">
            <div class="column-chart__title">
              ${this.label}
              ${this.getTplTitleLink()}
            </div>
            <div class="column-chart__container">
              <div data-element="header" class="column-chart__header">${this.formatHeading(this.value)}</div>
              <div data-element="body" class="column-chart__chart">
                ${this.getTplChartStr()}
              </div>
            </div>
          </div>
        </div>
        `;
  }

  render() {
    const element = document.createElement("div"); 
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
      const data = await this.loadData(from, to);
      this.data = data;
      this.updateChartBody()
      this.element.classList.remove('column-chart_loading');
      return data;

    } catch(err) {
      console.error(err);
    }
  }

  async loadData(from, to) {
    try {

      if ( from ) this.url.searchParams.set('from', from.toISOString());
      if (to ) this.url.searchParams.set('to', to.toISOString());
      return await fetchJson(this.url);

    } catch(err) {

      console.error(err);
      return Promise.reject(err);

    }
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
      scale = this.chartHeight / maxValue;
  
    return data.map(item => {
      return {
        percent: (item / maxValue * 100).toFixed(0) + '%',
        value: String(Math.floor(item * scale))
      };
    });
  }
  
}
