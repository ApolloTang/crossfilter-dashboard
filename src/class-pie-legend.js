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

  update(groups, filter) {
    if (!this.hasInitialized) {
      this.hasInitialized = true
    }
    this._renderRows(groups, filter)
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

  _renderRows(groups, filter) {
    const colors = this._getColor(groups)
    const join = this.rowsContainer
      .selectAll('div')
      .data(groups, d=>_.uniqueId())
    join.exit().remove()

    const rows = join.enter()
      .append('div')
      .classed('row', true)
      .on('click', d=>{console.log('click: ', d)})

    const cells = rows.selectAll('div')
      .data( cellData=>{
        const out = [
          {data: cellData, className: 'filter'},
          {data: cellData, className: 'color', hexColor: colors(cellData)},
          {data: cellData, className: 'label', text: cellData}
        ]
        out.data = cellData
        return out
      })
      .enter()
      .append('div')
      .classed('color', d=>d.className === 'color')
      .classed('label', d=>d.className === 'label')
      .style('background-color', d=>{
        if (d.hexColor) return d.hexColor
        return false
      })
      .html(d=>{
        switch(d.className) {
          case 'filter': {
            const checked = (filter.has(d.data+'')) ? 'checked' : ''
            return `<input type="checkbox" ${checked}>`
          }
          case 'color': {
            return ''
          }
          case 'label': {
            return d.text
          }
        }
      })
  }

  destroy() {
    // @TODO
  }
}

