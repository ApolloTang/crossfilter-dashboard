class ClassPiePlotter {
  constructor({size, donutHoleSize, groups, selector}) {
    this.size = size || 180
    this.donutHoleSize = donutHoleSize || 0.5
    this.radius = this.size/2
    this.innerRadius = this.radius * this.donutHoleSize
    this.groups = groups
    this.selector = selector

    this._initPie()
  }

  _getColor(groups) {
    const color = d3.scaleOrdinal()
      .domain(groups)
      .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);
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
    const width = this.size
    const height = this.size
    const groups = this.groups
    const color = this._getColor(groups)
    const selector =this.selector

    const svg = d3
      .select(selector).append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    this.path =  svg.selectAll("path")
      .data(groups, (group)=>{
        // console.log(group)
        return group  // group is use as id key
      })
      .enter().append("path")
      .style("fill", color)
      .attr('data-group', d=>d)
      .each(function() {
        this._current = {startAngle: 0, endAngle: 0};
        // console.log(this)
      })
      .on('click', (d)=>console.log('click', d));  //@Todo need to unmount event in destructor
  }

  update(data) {
    const d = data;
    const pie = this._getPieLayout()
    const arc = this._getArc()

    const groups = this.groups

    const arcsLayout = pie.value(
      function(g) {
        // console.log(d, data)
        const out = d[g];
        // console.log(g, out)
        return out
      }
    )(groups)
    // console.log('arcs: ', arcsLayout)

    this.path
      .data(arcsLayout)
      .transition().duration(2000)
      .attrTween("d", function(d) {
        var interpolate = d3.interpolate(this._current, d);
        this._current = interpolate(0);
        return step => {
          const out = arc(interpolate(step));
          // console.log(step, out)
          return out
        }
      });
  }

  destroy() {

  }
}



