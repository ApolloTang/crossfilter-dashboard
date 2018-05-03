var dispatch = d3.dispatch('load', 'filterChanged');


const setupTotal = (facts, opts={container:'#total'}) => {
  const d_total = facts.dimension(d=>d.total)
  const g_total = d_total.group()

  const groups = g_total.all().map(d=>d.key)
  const filter = d3.set(groups)

  const container = d3.select(opts.container)
  groups.forEach(k=>{
    container.append('button').text(k).on('click', ()=>{
      filter.has(k) ? filter.remove(k) : filter.add(k)
      d_total.filterFunction(g=>filter.has(g+""))
      dispatch.call('filterChanged', {}, facts)
    })
  })
  const total = g_total.all()
  const display = container.append('div')

  const piePlotter = new ClassPiePlotter({
    groups,
    selector: '#total div'
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

const setupQuantity = (facts, opts={container:'#quantity'}) => {
  const d_quantity = facts.dimension(d=>d.quantity)
  const g_quantity = d_quantity.group()

  const groups = g_quantity.all().map(d=>d.key)
  const filter = d3.set(groups)

  const container = d3.select(opts.container)
  groups.forEach(k=>{
    container.append('button').text(k).on('click', ()=>{
      filter.has(k) ? filter.remove(k) : filter.add(k)
      d_quantity.filterFunction(g=>filter.has(g+""))
      dispatch.call('filterChanged', {}, facts)
    })
  })
  const quantities = g_quantity.all()
  const display = container.append('div')

  const piePlotter = new ClassPiePlotter({
    groups,
    selector: '#quantity div'
  })

  const update = () =>{
    const data = quantities.reduce((acc, d)=>{
      acc[d.key] = d.value
      return acc;
    }, {})
    piePlotter.update( data)
  };
  return { update }
}

const setupTable = (facts, opts={container:'#table'}) => {
  const d_table = facts.dimension(d=>d.id)
  const g_table = d_table.group()

  const container = d3.select(opts.container)
  const table = g_table.all()
  const displayArea = container.append('div')

  const update = () =>{
    displayArea.text(JSON.stringify(table))
  };
  return { update }
}

d3.json('./data.json', (er, data)=>{
  if (er) throw er;
  const facts = crossfilter(data)

  const table = setupTable(facts)
  dispatch.on('filterChanged.rendTable', () => {
    table.update()
  })

  const total = setupTotal(facts);
  dispatch.on('filterChanged.renderTotal', () => {
    total.update()
  })

  const quantity = setupQuantity(facts);
  dispatch.on('filterChanged.renderQuantity', () => {
    quantity.update()
  })

  dispatch.call('filterChanged', {}, facts)
})



