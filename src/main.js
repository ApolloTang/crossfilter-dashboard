import ClassPiePlotter  from './ClassPiePlotter.js'
import ClassTimeSeriesFilter from './class-timeseries-filter.js'


var dispatch = d3.dispatch('load', 'filterChanged');


const setupTable = (facts, opts={container:'#table'}) => {
  const d_table = facts.dimension(d=>d.id)
  const g_table = d_table.group()

  const container = d3.select(opts.container)
  const table = d_table.top(Infinity)
  const displayArea = container.append('div')

  const update = () =>{
    console.table(d_table.top(Infinity))
    displayArea.text(JSON.stringify(table))
  };
  return { update }
}

const setupPie = (facts, opts) => {
  const dimension = facts.dimension(d=>d[opts.dimensionName])
  const dimensionGroup = dimension.group()

  const groups = dimensionGroup.all().map(d=>d.key)
  let filter = d3.set(groups)

  const container = d3.select(opts.container)
  groups.forEach(k=>{
    container.append('button').text(k).on('click', ()=>{
      filter.has(k) ? filter.remove(k) : filter.add(k)
      dimension.filterFunction(g=>filter.has(g+""))
      dispatch.call('filterChanged', {}, facts)
    })
  })
  const total = dimensionGroup.all()
  const display = container.append('div')

  console.log('xxxx initial filter', filter.values())
  const onClickCallback = (datum, index, currentNode, d3SelectPaths) => {
    const groupClicked = datum.data
    if (filter.has(groupClicked)) {
      if (filter.values().length === groups.length) {
        filter.clear()
        filter.add(groupClicked)
        d3.select(currentNode).style('stroke', '#F00')
      } else {
        filter.remove(groupClicked)
        d3.select(currentNode).style('stroke', null)
      }
      if (filter.values().length === 0) {
        filter = d3.set(groups)
      }
    } else {
      filter.add(groupClicked)
      if (filter.values().length === groups.length) {
        d3SelectPaths.style('stroke', null)
      } else {
        d3.select(currentNode).style('stroke', '#F00')
      }
    }
    console.log('xxxx after click filter', filter.values())

    dimension.filterFunction(g=>{
      return filter.has(g+"")
    })

    dispatch.call('filterChanged', {}, facts)
  }

  const piePlotter = new ClassPiePlotter({
    groups,
    selector: `${opts.container} div`,
    onClickCallback
  })

  const update = () =>{
    const data = total.reduce((acc, d)=>{
      acc[d.key] = d.value
      return acc;
    }, {})

    piePlotter.update( data)
  };
  return { update }
}


const setupTimeSeriesFilter = (data, facts, opts) => {
  const dimension = facts.dimension(d=>d[opts.dimensionName])
  const dimensionGroup = dimension.group()

  const groups = dimensionGroup.all().map(d=>d.key)
  let filter = d3.set(groups)

  const container = d3.select(opts.container)
  const displayArea = container.append('div').classed('chart', true)

  const timeSeriesFilter = new ClassTimeSeriesFilter({
    data,
    selector: `${opts.container} div.chart`,
  })

  const update = () =>{
    console.table(dimension.top(Infinity))
    // displayArea.text(JSON.stringify(dimension.top(Infinity)))
  };
  return { update }
}


d3.json('./data.json', (er, data)=>{
  if (er) throw er;

  data.forEach(d=>d.date = new Date(d.date))

  const facts = crossfilter(data)

  const timeSeriesfilter = setupTimeSeriesFilter(data, facts, {
    container:'#time-series',
  });

  const table = setupTable(facts)
  dispatch.on('filterChanged.renderTable', () => {
    table.update()
  })

  const total = setupPie(facts, {
    container:'#total',
    dimensionName:'total'
  });
  dispatch.on('filterChanged.renderTotal', () => {
    total.update()
  })

  const quantity = setupPie(facts, {
    container:'#quantity',
    dimensionName:'quantity'
  });
  dispatch.on('filterChanged.renderQuantity', () => {
    quantity.update()
  })

  dispatch.call('filterChanged', {}, facts)
})



