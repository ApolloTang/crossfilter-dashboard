export default class ClassPiePlotter {
  constructor({
    size, donutHoleSize,
    groups, selector, color,
    onClickCallback,
    dimensionName
  }) {
    this.size = size || 110
    this.donutHoleSize = donutHoleSize || 0.5
    this.radius = this.size/2
    this.innerRadius = this.radius * this.donutHoleSize
    this.groups = groups
    this.selector = selector
    this.color = color || d3.schemeCategory10

    this.onClickCallback = onClickCallback || function(datum, index, nodes) { d3.select(nodes[0]).style('stroke', '#F00') }
    this.dimensionName = dimensionName

    this._initPie()
  }

  _getColor(groups) {
    const _groups = groups || this.groups
    var color = d3.scaleOrdinal(this.color).domain(_groups)
    return color
  }

  _getArc() {
    return d3.arc()
      .outerRadius(this.radius)
      .innerRadius(this.innerRadius)
  }

  _getPieLayout () {
    return d3.pie().sort(null)
  }

  _initPie () {
    const that = this
    const width = this.size
    const height = this.size
    const groups = this.groups
    const color = this._getColor(groups)
    const selector =this.selector

    const svg = d3
      .select(selector).append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width/2}, ${height/2})`)

    this.paths =  svg.selectAll('path')
      .data(groups, (group)=>{
        return group  // group is use as id key
      })
      .enter().append('path')

    this.paths
      .style('fill', color)
      .attr('data-group', group=>group)
      .each(function() {
        this._current = {startAngle: 0, endAngle: 0} // initial tweening angle
        d3.select(this).on('click', that._handlePieSectionClick(that.paths) )
      })

    svg.append('text').classed('pie-name', true)
      .attr('transform', `translate(0, 4)`)
      .style('text-anchor', 'middle')
      .text(`${this.dimensionName}`)
  }

  _handlePieSectionClick(paths) {
    return (datum, index, nodes) => {
      const currentPath = nodes[0]
      this.onClickCallback(datum, index, currentPath, paths)
    }
  }

  update(data) {
    const pie = this._getPieLayout()
    const arc = this._getArc()

    const groups = this.groups

    const arcsLayout = pie.value(
      function(g) {
        const out = data[g]
        return out
      }
    )(groups)

    this.paths
      .data(arcsLayout)
      .transition().duration(1000)
      .attrTween('d', function(d) {
        var interpolate = d3.interpolate(this._current, d)
        this._current = interpolate(0)
        return step => {
          const out = arc(interpolate(step))
          return out
        }
      })
  }

  destroy() {

  }
}



