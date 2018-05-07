export default class ClassPieLegend {
  constructor({
    selector,
    color
  }) {
    this.selector = selector
    this._init()
    this._hasInitialized = false
    this.color = color || d3.schemeCategory10
  }

  _init () {
    this._setupStage()
  }

  update(groups) {
    if (!this.hasInitialized) {
      this.hasInitialized = true
    }
    this._renderRows(groups)
  }

  _setupStage () {
    this.rowsContainer = d3
      .select(this.selector)
      .append('div').classed('legend-rows', true)
  }

  _getColor(groups) {
    const _groups = groups || this.groups
    var color = d3.scaleOrdinal(this.color).domain(_groups)
    return color
  }

  _renderRows(groups) {
    const colors = this._getColor(groups)
    const join = this.rowsContainer
      .selectAll('div')
      .data(groups, d=>d)

    const rows = join.enter()
      .append('div')
      .classed('row', true)
      .on('click', d=>{console.log('click: ', d)})

    const cells = rows.selectAll('div')
      .data( cellData=>[
        {className: 'color', hexColor: colors(cellData)},
        {className: 'label', text: cellData}
      ])
      .enter()
      .append('div')
      .classed('color', d=>d.className === 'color')
      .classed('label', d=>d.className === 'label')
      .style('background-color', d=>{
        if (d.hexColor) return d.hexColor
        return false
      })
      .text(d=>(d.text) ? d.text : '')
  }

  destroy() {
    // @TODO
  }
}

