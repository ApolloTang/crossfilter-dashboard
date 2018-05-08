
function formatTime(date) {
  return d3.timeFormat('%d, %H:%I:%M:%S')(date)
}

export default class ClassTable {
  constructor({
    dataKeys,
    selector
  }) {
    this.selector = selector
    this.dataKeys = dataKeys || []
    this._init()
    this._hasInitialized = false
  }

  _init () {
    this._setupStage()
  }

  update(dimension) {
    if (!this.hasInitialized) {
      this.hasInitialized = true
    }
    this._renderRow(dimension)
  }

  _setupStage () {
    const table = d3
      .select(this.selector).append('table')

    const tableHead = table.append('thead')
    const tableHeadRow = tableHead.append('tr')
    this.dataKeys.forEach(d=>{
      tableHeadRow.append('th').text(d)
    })

    this.tableBody = table.append('tbody')
  }

  _renderRow(dimension) {
    //* http://bl.ocks.org/jfreels/6734025
    const join = this.tableBody
      .selectAll('tr')
      .data(dimension.top(Infinity), d=>d.id)

    const rows = join.enter()
      .append('tr')

    const cells = rows.selectAll('td')
      .data(row=>{
        return this.dataKeys.map(key=>{
          return {key, value:row[key]}
        })
      })
      .enter()
      .append('td')
      .attr('data-key', d=>d.key)
      .text(d=>{
        let out = d.value
        if (d.key === 'date') {
          const dateObj = new Date(d.value)
          out = formatTime(dateObj)
        }
        return out
      })

    join.exit().remove()
  }

  destroy() {
    // @TODO
  }
}

