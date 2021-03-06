import ClassPiePlotter  from './class-pie-plotter.js'
import ClassTimeSeriesFilter from './class-barchart-timeseries-filter.js'
import ClassTable from './class-table.js'
import ClassPieLegend from './class-pie-legend.js'

function formatTime(date) {
  return d3.timeFormat('%H:%M:%S')(date)
}

function getFullDateRangeFormat_fromDimension(dimension) {
  const bottom = formatTime(new Date(dimension.bottom(1)[0].date))
  const top = formatTime(new Date(dimension.top(1)[0].date))
  return `${bottom} - ${top}`
}
function getFullDateRangeFormat_fromFilterRangeInDateString(filterRangeInDateString) {
  const bottom = formatTime(new Date(filterRangeInDateString[0]))
  const top = formatTime(new Date(filterRangeInDateString[1]))
  return `${bottom} - ${top}`
}

const dispatch = d3.dispatch('filterChanged')

const setupTable = (facts, opts={container:'#table'}) => {
  const container = d3.select(opts.container)
  const displayArea = container.append('div').classed('data-table', true)

  const dimension = facts.dimension(d=>d.id)
  const dimensionGroup = dimension.group()

  const dataTable = new ClassTable({
    dataKeys: ['id', 'date', 'quantity', 'total', 'tip', 'type'],
    selector: `${opts.container} div.data-table`,
  })

  const update = () =>{
    console.table(dimension.top(Infinity))
    dataTable.update(dimension)
  }
  return { update }
}



const setupPie = (facts, opts) => {
  const dimensionName = opts.dimensionName
  const dimension = facts.dimension(d=>d[dimensionName])
  const dimensionGroup = dimension.group()

  const groups = dimensionGroup.all().map(d=>d.key)
  let filter = d3.set(groups)

  const container = d3.select(opts.container)

  const total = dimensionGroup.all()
  const container_chart = container.append('div').classed('container-chart', true)
  const container_legend = container.append('div').classed('container-legend', true)
  const resetButton = container_legend.append('div').classed('reset-button', true).text('reset')

  const reset = () =>{
    console.log('reset click')
    filter = d3.set(groups)
    dimension.filterAll()
    dispatch.call('filterChanged', {}, facts)
  }
  resetButton.on('click', reset)

  console.log('initial filter:', filter.values())
  const onClickCallback = (datum, index, currentNode, d3SelectPaths) => {
    const groupClicked = datum.data
    if (filter.has(groupClicked)) {
      if (filter.values().length === groups.length) {
        filter.clear()
        filter.add(groupClicked)
        // d3.select(currentNode).style('stroke', '#F00')
      } else {
        filter.remove(groupClicked)
        // d3.select(currentNode).style('stroke', null)
      }
      if (filter.values().length === 0) {
        filter = d3.set(groups)
      }
    } else {
      filter.add(groupClicked)
      if (filter.values().length === groups.length) {
        // d3SelectPaths.style('stroke', null)
      } else {
        // d3.select(currentNode).style('stroke', '#F00')
      }
    }
    console.log('after click filter:', filter.values())

    dimension.filterFunction(g=>{
      return filter.has(g+'')
    })

    dispatch.call('filterChanged', {}, facts)
  }

  const onLegendClickCallback = groupClicked => {
    console.log('group changed: ', groupClicked)
    if (filter.has(groupClicked)) {
      if (filter.values().length === groups.length) {
        filter.clear()
        filter.add(groupClicked)
      } else {
        filter.remove(groupClicked)
      }
      if (filter.values().length === 0) {
        filter = d3.set(groups)
      }
    } else {
      filter.add(groupClicked)
    }
    console.log('after click filter', filter.values())

    dimension.filterFunction(g=>{
      return filter.has(g+'')
    })

    dispatch.call('filterChanged', {}, facts)
  }

  const piePlotter = new ClassPiePlotter({
    groups,
    selector: `${opts.container} div.container-chart`,
    onClickCallback,
    dimensionName
  })

  const pieLegend = new ClassPieLegend({
    groups,
    selector: `${opts.container} div.container-legend`,
    onLegendClickCallback
  })

  const update = () =>{
    const data = total.reduce((acc, d)=>{
      acc[d.key] = d.value
      return acc
    }, {})

    piePlotter.update(data)
    pieLegend.update(groups, filter)
  }
  return { update, reset }
}



const setupTimeSeriesFilter = (data, facts, opts) => {
  const container = d3.select(opts.container)

  const componentName = 'component-time-series'
  const componentWrapper = container.append('div').classed(componentName, true)

  const dimension = facts.dimension( d=>d.date )
  const onDateRangeChangeCallBack = filterRange => {
    // _.debounce(()=>{  //@TODO why decounce does not work ????
      const filterRangeInDateString = filterRange.map(d=>d.toISOString())
      console.log('filterRange: ', filterRangeInDateString)
      dimension.filterRange(filterRangeInDateString)
      dispatch.call('filterChanged', {}, facts)
      componentWrapper
        .select('.filter-range')
        .text(`Filtered date range: ${getFullDateRangeFormat_fromFilterRangeInDateString(filterRangeInDateString)}`)
    // },300)
  }

  const controlWrapper = componentWrapper.append('div').classed('control', true)
  const displayFilterRangeWrapper = controlWrapper.append('div').classed('filter-range', true)
    .text(`Filtered date range: ${ getFullDateRangeFormat_fromDimension(dimension) } `)
  const resetButton = controlWrapper.append('div').classed('reset-button', true).text('reset')

  const _timeSeriesFilter = new ClassTimeSeriesFilter({
    selector: `${opts.container} div.${componentName}`,
    onDateRangeChangeCallBack
  })


  resetButton.on('click', ()=>{
    _timeSeriesFilter.resetFilter(data,dimension)
  })
  const update = () =>{
    _timeSeriesFilter.update(data, dimension)
  }
  return {
    update,
    reset: ()=>{_timeSeriesFilter.resetFilter(data, dimension)}
  }
}


d3.json('./data.json', (er, data)=>{
  if (er) throw er

  const dateName = '_date'
  data.forEach(d=>{
    d[dateName] = new Date(d.date)
    d.date = d[dateName].toISOString() // make sure date is in same formate as _date
  })

  const facts = crossfilter(data)

  const timeSeriesfilter = setupTimeSeriesFilter(data, facts, {
    container:'#time-series-total',
    dimensionName:'total',
    dateName
  })
  dispatch.on('filterChanged.renderTimeSeries', () => {
     timeSeriesfilter.update()
  })

  const table = setupTable(facts)
  dispatch.on('filterChanged.renderTable', () => {
    table.update()
  })

  const type = setupPie(facts, {
    container:'#type',
    dimensionName:'type'
  })
  dispatch.on('filterChanged.renderType', () => {
    type.update()
  })

  const total = setupPie(facts, {
    container:'#total',
    dimensionName:'total'
  })
  dispatch.on('filterChanged.renderTotal', () => {
    total.update()
  })

  const quantity = setupPie(facts, {
    container:'#quantity',
    dimensionName:'quantity'
  })
  dispatch.on('filterChanged.renderQuantity', () => {
    quantity.update()
  })

  dispatch.call('filterChanged', {}, facts)

  const resetAll = window.reset = () => {
    total.reset()
    type.reset()
    quantity.reset()
    timeSeriesfilter.reset()
  }

  const resetAllButton = d3.select('.global-control').append('div')
    .classed('reset-all reset-button', true).text('reset all')
  resetAllButton.on('click', resetAll)


})



