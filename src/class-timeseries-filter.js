export default class ClassTimeSeriesPlotter {
  constructor({
    width, height,
    groups, selector
  }) {
    this.width_container = width || 600
    this.height_container = height || 200
    this.groups = groups
    this.selector = selector

    this._initPlot()
  }

  _initPlot () {
    const that = this
    const groups = this.groups
    const selector =this.selector

    this._setupStage()
    this._setupFilter()

    // inject data from group
    // this._calculateScalesDomain(this.group)
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
      .attr('class', 'focus')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
      .append('rect')
      .attr('class', 'plot-area-background')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'blue');
  }

  _setupFilter() {
    this.brush = d3.brushX()
      .extent([[0, 0], [this.width, this.height]])
      .on("brush end", this._handleBrushed);
  }

  _calculateScalesRange() {
    this.x = d3.scaleTime().range([0, this.width]),
    this.y_focus = d3.scaleLinear().range([this.height_focus, 0]),
    this.y_context = d3.scaleLinear().range([this.height_context, 0]);
  }

  update() {
    this._calculateScalesRange()

  }

  _calculateScalesDomain() {
  }

  _handleBrushed() {
    // if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
    // const s = d3.event.selection || this.width.range();
    // x.domain(s.map(x2.invert, x2));
    // focus.select(".area").attr("d", area);
    // focus.select(".axis--x").call(xAxis);
    // svg.select(".zoom").call(zoom.transform, d3.zoomIdentity
    //     .scale(width / (s[1] - s[0]))
    //     .translate(-s[0], 0));
  }



  destroy() {
    // @TODO
  }
}


