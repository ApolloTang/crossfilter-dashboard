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
      // .each(d=>{
      //   const row = d3.select(this)
      //   // @TODO investigate this
      //   // what is 'this' ?
      //   this.dataKeys.forEach(key=>{
      //     // console.log(row)
      //     // row.append('td')//.append(d.key)
      //   })
      // })

    const cells = rows.selectAll('td')
      .data(row=>{
        return this.dataKeys.map(key=>{
          return {key, value:row[key]}
        })
      })
      .enter()
      .append('td')
      .text(d=>d.value)



    join.exit().remove()


  }

  destroy() {
    // @TODO
  }
}

