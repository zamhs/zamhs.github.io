/* Motor de negocio independiente de la interfaz.
   Proyecto académico para un micronegocio: datos completamente simulados. */
(function(root){
  'use strict';
  const VERSION=1;
  const CATEGORIES=['Básicos','Bebidas','Lácteos','Limpieza','Botanas','Higiene'];
  const initial=[
    ['AB-101','Arroz 1 kg','Básicos',16,5,24,37,'paquete'],
    ['AB-102','Frijol 900 g','Básicos',8,6,29,43,'bolsa'],
    ['AB-103','Azúcar 1 kg','Básicos',13,5,20,32,'bolsa'],
    ['AB-104','Aceite vegetal 900 ml','Básicos',5,5,34,49,'botella'],
    ['AB-105','Sal de mesa 1 kg','Básicos',20,5,12,19,'bolsa'],
    ['BE-201','Agua natural 1 L','Bebidas',24,8,11,19,'botella'],
    ['BE-202','Refresco cola 600 ml','Bebidas',7,8,16,25,'botella'],
    ['BE-203','Jugo de naranja 1 L','Bebidas',14,4,22,34,'caja'],
    ['LA-301','Leche entera 1 L','Lácteos',6,7,21,31,'caja'],
    ['LA-302','Yogur natural 1 L','Lácteos',9,5,28,42,'botella'],
    ['LI-401','Detergente 1 kg','Limpieza',12,4,29,45,'bolsa'],
    ['LI-402','Cloro 1 L','Limpieza',4,5,13,24,'botella'],
    ['BO-501','Papas sabor queso 45 g','Botanas',18,5,11,18,'bolsa'],
    ['BO-502','Galletas de vainilla','Botanas',3,6,15,23,'paquete'],
    ['HI-601','Papel higiénico 4 rollos','Higiene',11,4,30,47,'paquete'],
    ['HI-602','Jabón de tocador','Higiene',10,5,11,19,'pieza']
  ];
  const roundCents=n=>Math.round(Number(n)*100);
  const validPrice=n=>Number.isFinite(Number(n)) && Number(n)>0 && Number(n)<=1000000;
  const positiveInt=n=>Number.isInteger(Number(n))&& Number(n)>=0 && Number(n)<=999999;
  const todayKey=date=>new Date(date).toLocaleDateString('en-CA');
  const addDays=(date,n)=>new Date(new Date(date).getTime()+n*86400000).toISOString();
  function seed(now=new Date()){
    const date=new Date(now).toISOString();
    const items=initial.map((r,i)=>({id:'p'+(i+1),sku:r[0],name:r[1],category:r[2],stock:r[3],minimum:r[4],cost:roundCents(r[5]),price:roundCents(r[6]),unit:r[7],updatedAt:date}));
    const sales=[
      {id:'V-0001',createdAt:addDays(now,-2),method:'Efectivo',items:[{id:'p6',name:'Agua natural 1 L',qty:2,unitPrice:1900}],total:3800},
      {id:'V-0002',createdAt:addDays(now,-1),method:'Efectivo',items:[{id:'p1',name:'Arroz 1 kg',qty:1,unitPrice:3700},{id:'p13',name:'Papas sabor queso 45 g',qty:2,unitPrice:1800}],total:7300},
      {id:'V-0003',createdAt:date,method:'Efectivo',items:[{id:'p8',name:'Jugo de naranja 1 L',qty:1,unitPrice:3400},{id:'p6',name:'Agua natural 1 L',qty:1,unitPrice:1900}],total:5300},
    ];
    const moves=[
      {id:'M-0001',date:addDays(now,-2),type:'Venta',product:'Agua natural 1 L',quantity:-2,detail:'Ejemplo inicial V-0001'},
      {id:'M-0002',date:addDays(now,-1),type:'Venta',product:'Arroz 1 kg / Papas sabor queso 45 g',quantity:-3,detail:'Ejemplo inicial V-0002'},
      {id:'M-0003',date, type:'Venta',product:'Jugo de naranja 1 L / Agua natural 1 L',quantity:-2,detail:'Ejemplo inicial V-0003'}
    ];
    return {version:VERSION,products:items,sales,movements:moves,productSeq:items.length,saleSeq:3,movementSeq:3,lastSaved:date};
  }
  function validateProduct(p, products, exceptId=null){
    const errors=[];
    const sku=String(p.sku??'').trim().toUpperCase();
    const name=String(p.name??'').trim();
    if(!/^[A-Z0-9-]{3,20}$/.test(sku)) errors.push('El código debe tener entre 3 y 20 letras, números o guiones.');
    if(products.some(x=>x.sku.toUpperCase()===sku&&x.id!==exceptId))errors.push('Ese código ya pertenece a otro producto.');
    if(name.length<3||name.length>75)errors.push('El nombre debe tener de 3 a 75 caracteres.');
    if(!CATEGORIES.includes(p.category))errors.push('Selecciona una categoría válida.');
    if(!validPrice(p.cost))errors.push('Indica un costo mayor que cero.');
    if(!validPrice(p.price))errors.push('Indica un precio de venta mayor que cero.');
    if(validPrice(p.price)&&validPrice(p.cost)&&Number(p.price)<Number(p.cost))errors.push('El precio de venta no debe ser menor que el costo.');
    if(!positiveInt(p.stock))errors.push('La existencia debe ser un número entero no negativo.');
    if(!positiveInt(p.minimum))errors.push('El mínimo debe ser un número entero no negativo.');
    return errors;
  }
  function clone(s){return JSON.parse(JSON.stringify(s));}
  function addProduct(state, product, now=new Date()){
    const errors=validateProduct(product,state.products);
    if(errors.length)throw Error(errors.join(' '));
    const next=clone(state); next.productSeq++;
    next.products.unshift({id:'p'+next.productSeq,sku:product.sku.trim().toUpperCase(),name:product.name.trim(),category:product.category,stock:Number(product.stock),minimum:Number(product.minimum),cost:roundCents(product.cost),price:roundCents(product.price),unit:product.unit?.trim()||'pieza',updatedAt:new Date(now).toISOString()});
    next.lastSaved=new Date(now).toISOString();
    return next;
  }
  function updateProduct(state,id,product,now=new Date()){
    const old=state.products.find(x=>x.id===id);if(!old)throw Error('El producto no existe.');
    const input={...product,stock:old.stock};
    const errors=validateProduct(input,state.products,id);
    if(errors.length)throw Error(errors.join(' '));
    const next=clone(state);const p=next.products.find(x=>x.id===id);
    Object.assign(p,{sku:input.sku.trim().toUpperCase(),name:input.name.trim(),category:input.category,minimum:Number(input.minimum),cost:roundCents(input.cost),price:roundCents(input.price),unit:input.unit?.trim()||'pieza',updatedAt:new Date(now).toISOString()});
    next.lastSaved=new Date(now).toISOString();return next;
  }
  function restock(state,id,amount,reason='',now=new Date()){
    const qty=Number(amount);
    if(!Number.isInteger(qty)||qty<1||qty>999999)throw Error('La cantidad debe ser un entero mayor a cero.');
    const old=state.products.find(x=>x.id===id);if(!old)throw Error('Selecciona un producto válido.');
    const next=clone(state);const p=next.products.find(x=>x.id===id);
    p.stock+=qty;p.updatedAt=new Date(now).toISOString();
    next.movementSeq++;
    next.movements.unshift({id:'M-'+String(next.movementSeq).padStart(4,'0'),date:p.updatedAt,type:'Entrada',product:p.name,quantity:qty,detail:(reason||'Reposición de mercancía').trim().slice(0,100)});
    next.lastSaved=p.updatedAt;return next;
  }
  function sell(state,lines,method='Efectivo',now=new Date()){
    if(!Array.isArray(lines)||!lines.length)throw Error('Agrega por lo menos un producto a la venta.');
    if(!['Efectivo','Transferencia'].includes(method))throw Error('Forma de pago no válida.');
    const combined=new Map();
    for(const row of lines){
      if(!Number.isInteger(Number(row.qty))||Number(row.qty)<=0||Number(row.qty)>999999)throw Error('Cantidad de venta no válida.');
      combined.set(row.id,(combined.get(row.id)||0)+Number(row.qty));
    }
    const next=clone(state);const purchased=[];
    for(const [id,qty] of combined){
      const p=next.products.find(x=>x.id===id);
      if(!p)throw Error('Uno de los productos no existe.');
      if(qty>p.stock)throw Error('No hay suficientes unidades de '+p.name+'. Disponible: '+p.stock+'.');
      purchased.push({id,name:p.name,qty,unitPrice:p.price});
    }
    let total=0;
    for(const item of purchased){
      const p=next.products.find(x=>x.id===item.id);
      p.stock-=item.qty;p.updatedAt=new Date(now).toISOString();total+=item.qty*item.unitPrice;
    }
    next.saleSeq++;
    const folio='V-'+String(next.saleSeq).padStart(4,'0');
    next.sales.unshift({id:folio,createdAt:new Date(now).toISOString(),method,items:purchased,total});
    next.movementSeq++;
    next.movements.unshift({id:'M-'+String(next.movementSeq).padStart(4,'0'),date:new Date(now).toISOString(),type:'Venta',product:purchased.map(x=>x.name).join(' / '),quantity:-purchased.reduce((s,x)=>s+x.qty,0),detail:'Venta '+folio+' • '+method});
    next.lastSaved=new Date(now).toISOString();return {state:next,sale:next.sales[0]};
  }
  const lowStock=s=>s.products.filter(p=>p.stock<=p.minimum);
  function stats(s,now=new Date()){
    const day=todayKey(now);
    const same=s.sales.filter(x=>todayKey(x.createdAt)===day);
    return {productCount:s.products.length,units:s.products.reduce((v,x)=>v+x.stock,0),low:lowStock(s).length,stockValue:s.products.reduce((v,x)=>v+x.stock*x.cost,0),salesToday:same.reduce((v,x)=>v+x.total,0),ticketsToday:same.length};
  }
  function dailySales(s,now=new Date(),days=7){
    const out=[];for(let offset=days-1;offset>=0;offset--){const date=new Date(new Date(now).getTime()-offset*86400000);out.push({key:todayKey(date),value:s.sales.filter(x=>todayKey(x.createdAt)===todayKey(date)).reduce((a,x)=>a+x.total,0)});}return out;
  }
  function csv(s){
    const quote=v=>'"'+String(v??'').replaceAll('"','""')+'"';
    return '\uFEFF'+[['Código','Producto','Categoría','Existencia','Mínimo','Costo MXN','Precio MXN','Unidad'],...s.products.map(p=>[p.sku,p.name,p.category,p.stock,p.minimum,(p.cost/100).toFixed(2),(p.price/100).toFixed(2),p.unit])].map(row=>row.map(quote).join(',')).join('\r\n');
  }
  const money=cents=>new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN'}).format(cents/100);
  const API={VERSION,CATEGORIES,seed,validateProduct,addProduct,updateProduct,restock,sell,lowStock,stats,dailySales,csv,money,todayKey};
  if(typeof module!=='undefined'&&module.exports)module.exports=API;
  root.StoreCore=API;
})(typeof window!=='undefined'?window:globalThis);
