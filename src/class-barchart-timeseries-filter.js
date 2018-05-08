function addSeconds(date, seconds) {
  // https://stackoverflow.com/questions/563406/add-days-to-javascript-date
  const result = new Date(date)
  result.setSeconds(result.getSeconds() + seconds)
  return result
}

export default class ClassTimeSeriesPlotter {
  constructor({
    width, height,
    selector,
    dateName, dimensionName,
    onDateRangeChangeCallBack
  }) {
    this.width_container = width || 600
    this.height_container = height || 200
    this.selector = selector

    this.dateName = dateName || '_date'
    this.dimensionName = dimensionName || 'total'

    this.onDateRangeChangeCallBack = onDateRangeChangeCallBack || function(selectedDomain) { console.log(selectedDomain) }

    this._initPlot()

    this._hasInitialized = false
    this.areaBars = void 0
  }

  _initPlot () {
    const that = this
    const selector =this.selector

    this._setupStage()
  }

  resetFilter(data, dimension) {
    this._calculateScales(data, dimension)

    const fullRange = this.x.range()
    const selectedDomain_full = fullRange.map(this.x.invert)
    this.onDateRangeChangeCallBack(selectedDomain_full)

    this.g_brush.call(this.brush.move, fullRange)
  }

  update(data, dimension) {
    this._calculateScales(data, dimension)

    if (!this.hasInitialized) {
      this._drawUnfilteredBars(data)
      this._setupAxes()
      this._setupBrush()
      this.hasInitialized = true
    }

    this._drawBars(data, dimension)
  }

  _setupStage () {
    const margin = {top: 15, right: 20, bottom:25, left: 40}
    const svg = d3
      .select(this.selector).append('svg')
      .attr('width', this.width_container)
      .attr('height', this.height_container)
      .attr('style', 'outline: 1px solid red;')

    const width  = this.width  = +svg.attr('width')  - margin.left - margin.right
    const height = this.height = +svg.attr('height') - margin.top  - margin.bottom

    this.stage = svg.append('g')
      .attr('class', 'bar-chart')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

    this.stage
      .append('rect')
      .attr('class', 'plot-area-background')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'hsla(0, 50%, 90%, .4)')
  }

  _calculateScales(data, dimension) {
    const dateName = this.dateName
    const dimensionName = this.dimensionName

    const extent = d3.extent(data, d=>d[dateName])

    // add temporal padding to time series
    extent[0] = addSeconds(extent[0], -30)
    extent[1] = addSeconds(extent[1], 30)
    const domain_maxY = d3.max(data, function(d) { return d[dimensionName] }) * 1.1

    this.x = d3.scaleTime()
      .range([0, this.width])
      .domain(extent)

    this.y = d3.scaleLinear()
      .range([0, this.height])
      .domain([0, domain_maxY])

    this.y_axis = d3.scaleLinear()
      .range([this.height, 0])
      .domain([0, domain_maxY])
  }

  _drawUnfilteredBars(data) {
    const dateName = this.dateName
    const dimensionName = this.dimensionName
    const x = this.x
    const y = this.y

    const isExmpty_barsArea = this.stage.select('g.bars-unfiltered').empty()

    let areaBars_unfiltered
    if (isExmpty_barsArea) {
      areaBars_unfiltered = this.stage
        .append('g')
        .classed('bars-unfiltered', true)
    }

    const joined = areaBars_unfiltered
      .selectAll('rect')
      .data(data, d=>d.id)

    const bars = joined.enter()
      .append('rect')
      .attr('data-id', d=>{
        const out = d.id
        return out
      })
      .attr('data-total', d=>{
        const out = d[dimensionName]
        return out
      })
      .attr('transform', d=>{
        const pt_x = x(d[dateName])
        const pt_y = this.height - y( d[dimensionName])
        return `translate(${pt_x}, ${pt_y})`
      })
      .styles({
        width: 1,
        stroke: 'hsla(0, 0%, 50%, .3)',
        fill: 'hsla(0, 0%, 50%, .3)'
      })
      .style('height', d=>y(d[dimensionName]))

    const exited = joined.exit().remove()
  }

  _drawBars(data, dimension) {
    const dateName = this.dateName
    const dimensionName = this.dimensionName
    const x = this.x
    const y = this.y

    const isExmpty_barsArea = this.stage.select('g.bars').empty()

    if (isExmpty_barsArea) {
      this.areaBars = this.stage
        .append('g')
        .classed('bars', true)
    }

    const filteredData = dimension.top(Infinity)

    const joined = this.areaBars
      .selectAll('rect')
      .data(filteredData, d=>d.id)


    const bars = joined.enter()
      .append('rect')
      .attr('data-id', d=>{
        const out = d.id
        return out
      })
      .attr('data-total', d=>{
        const out = d[dimensionName]
        return out
      })
      .attr('transform', d=>{
        const pt_x = x(d[dateName])
        const pt_y = this.height - y( d[dimensionName])
        return `translate(${pt_x}, ${pt_y})`
      })
      .styles({
        width: 1,
        stroke: 'red',
        fill: 'hsl(4, 77%, 34%)'
      })
      .style('height', d=>y(d[dimensionName]))

    const exited = joined.exit().remove()
  }

  _setupBrush() {
    const brush = this.brush = d3.brushX()
      .extent([[0, 0], [this.width, this.height]])
      .on('brush end', this._handleBrushed(this))

    const originName = this.originName = 'brush brush__time-filter'

    this.g_brush = this.stage
      .append('g')
      .attr('class', originName)

    this.g_brush.call(brush)
      .call(brush.move, this.x.range())
  }

  _setupAxes() {
    const xAxis = d3.axisBottom(this.x).ticks(10)
    const yAxis = d3.axisLeft(this.y_axis).ticks(5)

    this.stage
      .append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', 'translate(0,' + this.height + ')')
      .call(xAxis)

    this.stage
      .append('g')
      .attr('class', 'axis axis--y')
      .call(yAxis)
  }

  _handleBrushed(self) {
    return (g) => {
      const fullRange = self.x.range()
      const selectedRange = d3.event.selection || fullRange
      const originName = _.get(d3.event.sourceEvent, `path[1].className.baseVal`, void 0)
      if (originName === self.originName) {
        const selectedDomain = selectedRange.map(self.x.invert)
        self.onDateRangeChangeCallBack(selectedDomain)
      }
    }
  }

  destroy() {
    // @TODO
  }
}

