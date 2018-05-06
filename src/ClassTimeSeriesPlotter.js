export default class ClassTimeSeriesPlotter {
  constructor({
    width, height,
    groups, selector
  }) {
    this.width_container = width || 600
    this.height_container = height || 350
    this.groups = groups
    this.selector = selector

    this._initPlot()
  }

  _initPlot () {
    const that = this
    const groups = this.groups
    const selector =this.selector

    this._setupStage()
    this._calculateScalesRange()

    // inject data from group
    // this._calculateScalesDomain(this.group)
  }

  _setupStage () {
    const margin         = this.margin         = {right: 20 ,left: 20}
    const margin_focus   = this.margin_focus   = {top: 20   ,bottom: 150 }
    const margin_context = this.margin_context = {top: 220  ,bottom: 20  }
    const svg = d3
      .select(this.selector).append('svg')
      .attr('width', this.width_container)
      .attr('height', this.height_container)
      .attr('style', 'outline: 1px solid red;')

    const width          = this.width          = +svg.attr('width')  - margin.left       - margin.right
    const height_focus   = this.height_focus   = +svg.attr('height') - margin_focus.top  - margin_focus.bottom
    const height_context = this.height_context = +svg.attr('height') - margin_context.top - margin_context.bottom

    svg.append('defs').append('clipPath')
      .attr('id', 'clip')
      .append('rect')
      .attr('width', width)
      .attr('height', height_focus);

    this.stage_focus = svg.append('g')
      .attr('class', 'focus')
      .attr('transform', 'translate(' + margin.left + ',' + margin_focus.top + ')')
      .append('rect')
      .attr('class', 'plot-area-background')
      .attr('width', width)
      .attr('height', height_focus)
      .attr('fill', 'blue');

    this.stage_context = svg.append('g')
      .attr('class', 'context')
      .attr('transform', 'translate(' + margin.left + ',' + margin_context.top + ')')
      .append('rect')
      .attr('class', 'plot-area-background')
      .attr('width', width)
      .attr('height', height_context)
      .attr('fill', 'red');
  }

  _calculateScalesRange() {
    this.x = d3.scaleTime().range([0, this.width]),
    this.y_focus = d3.scaleLinear().range([this.height_focus, 0]),
    this.y_context = d3.scaleLinear().range([this.height_context, 0]);
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


  update(data) {
  }

  destroy() {
    // @TODO
  }
}



