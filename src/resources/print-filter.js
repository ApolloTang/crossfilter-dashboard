function print_filter(filter) {
    var f=eval(filter);
    if (typeof(f.length) != "undefined") {}else{}
    if (typeof(f.top) != "undefined") {f=f.top(Infinity);}else{}
    if (typeof(f.dimension) != "undefined") {f=f.dimension(function(d) { return "";}).top(Infinity);}else{}
    console.log(filter+"("+f.length+") = "+JSON.stringify(f).replace("[","[\n\t").replace(/}\,/g,"},\n\t").replace("]","\n]"));
}

function pObj (o) {
  console.log(
    JSON.stringify(o)
    .replace("[","[\n\t")
    .replace(/}\,/g,"},\n\t")
    .replace("]","\n]"));
  return'---'
}

function pObjT (o) {
  console.table(o)
  return'---'
}

const l = console.log
const pT = pt = pObjT
const po = pObj

