export default class ColumnChart {
  defaultOpt = {
    data : [],
    label : '',
    link : null,
    value : 0,
    formatHeading : null,
    chartHeight : 50
  }

  constructor(opt) {
    this.setOptions(this.defaultOpt);
    if (opt) this.setOptions(opt);
    this.render();
    this.initEventListeners();
  }

  setOptions(opt) {
    Object.entries(opt).forEach(([key, val]) => this[key] = val);
  }

  get getLoadingClass() {
    return this.data && this.data.length ? '' : ' column-chart_loading';
  }

  getTplChartStr() {
    const arrData = this.getColumnProps(this.data);
    return arrData.reduce((s, el) => s + `<div style="--value: ${el.value}" data-tooltip="${el.percent}"></div>`, '');
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

    // NOTE: в этой строке мы избавляемся от обертки-пустышки в виде `div`
    // который мы создали на строке (*)
    this.element = element.firstElementChild;
  }

  update(data) {
    this.data = data;
    const chartBody = this.element.querySelector('[data-element="body"]');
    chartBody.innerHTML = this.getTplChartStr();
  }

  initEventListeners() {
    // NOTE: в данном методе добавляем обработчики событий, если они есть
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    // NOTE: удаляем обработчики событий, если они есть
  }

  getColumnProps(data) {
    const maxValue = Math.max(...data);
    const scale = 50 / maxValue;
  
    return data.map(item => {
      return {
        percent: (item / maxValue * 100).toFixed(0) + '%',
        value: String(Math.floor(item * scale))
      };
    });
  }
  
}
