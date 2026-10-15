const KEY='gastos_v1', TKEY='gastos_theme';
const CG=['Comida','Transporte','Vivienda','Servicios','Salud','Educación','Ocio','Otros'];
const CI=['Salario','Ventas','Otros ingresos'];
const COL=['#6366f1','#ec4899','#f59e0b','#10b981','#ef4444','#06b6d4','#8b5cf6','#84cc16','#f97316','#14b8a6','#a855f7'];
const ALL=[...CG,...CI];
const fmt=n=>new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0}).format(n);
const $=id=>document.getElementById(id);
const esc=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let mem=[];
function load(){try{const d=JSON.parse(localStorage.getItem(KEY));return Array.isArray(d)?d:[]}catch(e){return mem}}
function persist(){mem=data;try{localStorage.setItem(KEY,JSON.stringify(data))}catch(e){}}
let data=load(), type='gasto', editId=null;

// tema
try{const t=localStorage.getItem(TKEY);if(t)document.documentElement.dataset.theme=t}catch(e){}
$('theme').onclick=()=>{const d=document.documentElement;const dark=getComputedStyle(d).colorScheme==='dark';d.dataset.theme=dark?'light':'dark';try{localStorage.setItem(TKEY,d.dataset.theme)}catch(e){}};

function today(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function fillCats(){const l=type==='gasto'?CG:CI;$('cat').innerHTML=l.map(c=>`<option>${c}</option>`).join('')}
function setType(t){type=t;document.querySelectorAll('#seg button').forEach(b=>b.classList.toggle('on',b.dataset.t===t));fillCats()}
document.querySelectorAll('#seg button').forEach(b=>b.onclick=()=>setType(b.dataset.t));

function resetForm(){editId=null;$('desc').value='';$('amt').value='';$('date').value=today();setType('gasto');$('save').textContent='Agregar';$('fTitle').textContent='Nuevo movimiento';$('cancel').hidden=true}
$('cancel').onclick=resetForm;

$('save').onclick=()=>{
  const desc=$('desc').value.trim(), amt=parseFloat($('amt').value), date=$('date').value;
  if(!desc||!(amt>0)||!date){alert('Completa descripción, un monto mayor a 0 y la fecha.');return}
  const item={id:editId||Date.now().toString(36),type,desc,amt,cat:$('cat').value,date};
  if(editId)data=data.map(x=>x.id===editId?item:x);else data.push(item);
  persist();resetForm();render();
};

function edit(id){
  const x=data.find(i=>i.id===id);if(!x)return;
  editId=id;setType(x.type);$('desc').value=x.desc;$('amt').value=x.amt;$('cat').value=x.cat;$('date').value=x.date;
  $('save').textContent='Guardar cambios';$('fTitle').textContent='Editar movimiento';$('cancel').hidden=false;
  $('desc').focus();window.scrollTo({top:0,behavior:'smooth'});
}
function del(id){if(confirm('¿Eliminar este movimiento?')){data=data.filter(x=>x.id!==id);persist();render()}}
$('clear').onclick=()=>{if(data.length&&confirm('Esto borra TODOS tus movimientos. ¿Continuar?')){data=[];persist();render()}};
$('list').onclick=e=>{const b=e.target.closest('button');if(!b)return;b.dataset.a==='e'?edit(b.dataset.id):del(b.dataset.id)};
['q','fMonth','fCat'].forEach(id=>$(id).oninput=render);

function monthName(m){const [y,mo]=m.split('-');return new Date(y,mo-1,1).toLocaleDateString('es-CO',{month:'long',year:'numeric'})}
function filters(){
  const months=[...new Set(data.map(x=>x.date.slice(0,7)))].sort().reverse();
  const cm=$('fMonth').value||'', cc=$('fCat').value||'';
  $('fMonth').innerHTML='<option value="">Todos los meses</option>'+months.map(m=>`<option value="${m}">${monthName(m)}</option>`).join('');
  $('fMonth').value=months.includes(cm)?cm:'';
  $('fCat').innerHTML='<option value="">Todas las categorías</option>'+ALL.map(c=>`<option>${c}</option>`).join('');
  $('fCat').value=cc;
}

function render(){
  filters();
  const q=$('q').value.toLowerCase(), m=$('fMonth').value, c=$('fCat').value;
  const rows=data.filter(x=>(!m||x.date.startsWith(m))&&(!c||x.cat===c)&&(!q||x.desc.toLowerCase().includes(q)||x.cat.toLowerCase().includes(q)))
    .sort((a,b)=>b.date.localeCompare(a.date)||b.id.localeCompare(a.id));
  const inc=rows.filter(x=>x.type==='ingreso').reduce((s,x)=>s+x.amt,0);
  const out=rows.filter(x=>x.type==='gasto').reduce((s,x)=>s+x.amt,0);
  $('sIn').textContent=fmt(inc);$('sOut').textContent=fmt(out);
  $('sBal').textContent=fmt(inc-out);$('sBal').className=inc-out>=0?'g':'r';

  $('list').innerHTML=rows.length?rows.map(x=>`
    <div class="row"><span class="dot" style="background:${COL[ALL.indexOf(x.cat)%COL.length]}"></span>
    <div class="inf"><b>${esc(x.desc)}</b><small>${x.cat} · ${new Date(x.date+'T00:00').toLocaleDateString('es-CO',{day:'numeric',month:'short',year:'numeric'})}</small></div>
    <span class="amt ${x.type==='gasto'?'r':'g'}">${x.type==='gasto'?'−':'+'}${fmt(x.amt)}</span>
    <button class="ic" data-a="e" data-id="${x.id}" title="Editar">✏️</button>
    <button class="ic" data-a="d" data-id="${x.id}" title="Eliminar">🗑️</button></div>`).join('')
    :'<div class="empty">Aún no hay movimientos. ¡Agrega el primero! 👈</div>';

  const by={};rows.filter(x=>x.type==='gasto').forEach(x=>by[x.cat]=(by[x.cat]||0)+x.amt);
  const ent=Object.entries(by).sort((a,b)=>b[1]-a[1]);
  $('cats').innerHTML=ent.length?ent.map(([k,v])=>`<div class="bar"><div><span>${k}</span><span>${fmt(v)} · ${Math.round(v/out*100)}%</span></div><div class="track"><i style="width:${v/out*100}%;background:${COL[ALL.indexOf(k)%COL.length]}"></i></div></div>`).join('')
    :'<div class="empty">Sin gastos para mostrar</div>';
}
resetForm();render();
