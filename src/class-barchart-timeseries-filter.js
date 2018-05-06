export default class ClassTimeSeriesPlotter {
  constructor({
    width, height,
    selector,
    data, dateName, dimensionName,
    onDateRangeChangeCallBack
  }) {
    this.width_container = width || 600
    this.height_container = height || 200
    this.selector = selector

    this.dateName = dateName || '_date'
    this.dimensionName = dimensionName || 'total'
    this.data = data

    this.onDateRangeChangeCallBack = onDateRangeChangeCallBack || function(selectedDomain) { console.log(selectedDomain) }

    this._initPlot()
  }

  _initPlot () {
    const that = this
    const selector =this.selector

    this._setupStage()

    this._calculateScales(this.data)
    this._drawBars(this.data)

    this._setupBrush()
  }

  _setupStage () {
    const margin = {top: 20, right: 20, bottom:20, left: 20}
    const svg = d3
      .select(this.selector).append('svg')
      .attr('width', this.width_container)
      .attr('height', this.height_container)
      .attr('style', 'outline: 1px solid red;')

    const width  = this.width  = +svg.attr('width')  - margin.left - margin.right
    const height = this.height = +svg.attr('height') - margin.top  - margin.bottom

    svg.append('defs').append('clipPath')
      .attr('id', 'clip')
      .append('rect')
      .attr('width', width)
      .attr('height', height);

    this.stage = svg.append('g')
      .attr('class', 'bar-chart')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

    this.stage
      .append('rect')
      .attr('class', 'plot-area-background')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'hsla(0, 50%, 90%, .4)');
  }

  _calculateScales(data) {
    const dateName = this.dateName
    const dimensionName = this.dimensionName

    this.x = d3.scaleTime()
      .range([0, this.width])
      .domain(d3.extent(data, function(d) { return d[dateName] }));

    this.y = d3.scaleLinear()
      .range([this.height, 0])
      .domain([0, d3.max(data, function(d) { return d[dimensionName] })]);
  }

  _drawBars(data) {
    const dateName = this.dateName
    const dimensionName = this.dimensionName
    const x = this.x
    const y = this.y

    const areaBars = this.stage
      .append('g')

    const bars = areaBars
      .selectAll('rect')
      .data(data)
      .enter()
      .append('rect')

    bars
      .attr('transform', d=>{
        const pt_x = x(d[dateName]);
        // const pt_y = 0;
        const pt_y = this.height - y( d[dimensionName]);
        return `translate(${pt_x}, ${pt_y})`;
      })
      .styles({
        // width: this.x.bandwidth(),
        width: 4,
        stroke: 'red',
        fill: 'hsl(4, 77%, 34%)'
      })
      .style('height', d=>y(d[dimensionName]))
  }

  _setupBrush() {
    const brush = this.brush = d3.brushX()
      .extent([[0, 0], [this.width, this.height]])
      .on("brush end", this._handleBrushed(this));

    const originName = this.originName = 'brush brush__time-filter'

    this.stage
      .append("g")
      .attr("class", originName)
      .call(brush)
      .call(brush.move, this.x.range());
  }

  _handleBrushed(self) {
    return (g) => {
      const fullRange = self.x.range();
      const selectedRange = d3.event.selection || fullRange
      const originName = _.get(d3.event.sourceEvent, `path[1].className.baseVal`, void 0)
      if (originName === self.originName) {
        const selectedDomain = selectedRange.map(self.x.invert)
        self.onDateRangeChangeCallBack(selectedDomain)
      }
    }
  }

  update(data) {
    // @TODO
  }

  destroy() {
    // @TODO
  }
}



