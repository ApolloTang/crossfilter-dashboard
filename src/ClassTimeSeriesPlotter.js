export default class ClassTimeSeriesPlotter {
  constructor({
    width, aspectRatio,
    groups, selector
  }) {
    this.width = width || 600
    this.aspectRatio = aspectRatio || 0.5
    this.height = this.width * this.aspectRatio
    this.groups = groups
    this.selector = selector

    this._initPlot()
  }

  _initPlot () {
    const that = this
    const width = this.width
    const height = this.height
    const groups = this.groups
    const selector =this.selector

    const svg = d3
      .select(selector).append('svg')
      .attr('width', width)
      .attr('height', height)

    const margin = {top: 20, right: 20, bottom: 30, left: 50}
    const stage_w = +svg.attr("width") - margin.left - margin.right
    const stage_h = +svg.attr("height") - margin.top - margin.bottom
    const area = svg
      .append("g")
      .attr('transform', `translate(${margin.left}, ${margin.top})`)

    const scale_x = d3.scaleTime().rangeRound([0, stage_w]);
    const scale_y = d3.scaleLinear().rangeRound([stage_h, 0]);

  }

  _handleBruchChange(paths) {
    // return (datum, index, nodes) => {
    //   const currentPath = nodes[0]
    //   this.onClickCallback(datum, index, currentPath, paths)
    // }
  }

  update(data) {
  }

  destroy() {
    // @TODO
  }
}



