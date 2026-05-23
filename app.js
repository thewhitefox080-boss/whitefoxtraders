let cart=[],ab='all',ac='all',ap=null,sm='def',sq='',sp='esewa';
const fmt=n=>'Rs '+n.toLocaleString();

function getFilt(){
  let d=[...products];
  if(ab!=='all')d=d.filter(x=>x.b===ab);
  if(ac!=='all')d=d.filter(x=>x.c===ac);
  if(ap)d=d.filter(x=>x.p>=ap[0]&&x.p<=ap[1]);
  if(sq)d=d.filter(x=>x.n.toLowerCase().includes(sq)||x.b.toLowerCase().includes(sq));
  if(sm==='asc')d.sort((a,b)=>a.p-b.p);
  else if(sm==='desc')d.sort((a,b)=>b.p-a.p);
  else if(sm==='az')d.sort((a,b)=>a.n.localeCompare(b.n));
  return d;
}

function render(){
  const d=getFilt();
  document.getElementById('prod-meta').textContent=d.length+' products';
  const g=document.getElementById('pgrid');
  if(!d.length){g.innerHTML='<div class="no-res">No products found.</div>';return;}
  g.innerHTML=d.map(x=>`
    <div class="pcard">
      <div class="pcard-img">
        ${x.img?`<img src="${x.img}" alt="${x.n}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/><span style="display:none;font-size:52px;width:100%;height:100%;align-items:center;justify-content:center">${x.i}</span>`:`<span style="font-size:52px">${x.i}</span>`}
        <span class="pbrand pb-${x.b.toLowerCase()}">${x.b}</span>
      </div>
      <div class="pcard-body">
        <div class="pcard-name">${x.n}</div>
        <div class="pcard-foot">
          <span class="pcard-price">${fmt(x.p)}</span>
          <button class="add-circle" onclick="addCart(${products.indexOf(x)},this)" aria-label="Add to bag">+</button>
        </div>
      </div>
    </div>`).join('');
}

function filterBrand(brand,btn){
  ab=brand;ap=null;
  document.querySelectorAll('.sidebar-item').forEach(b=>{if(b.id&&b.id.startsWith('b-'))b.classList.remove('active');});
  (btn||document.getElementById('b-all')).classList.add('active');
  render();
  document.querySelector('.shop-layout').scrollIntoView({behavior:'smooth'});
}

function filterCat(cat,btn){
  ac=cat;ap=null;
  document.querySelectorAll('.cat-btn').forEach(b=>b.classList.remove('active'));
  if(btn)btn.classList.add('active');
  else{const btns=document.querySelectorAll('.cat-btn');btns.forEach(b=>{if(b.textContent.toLowerCase().includes(cat)||cat==='all'&&b.textContent==='All')b.classList.add('active');});}
  render();
  document.querySelector('.shop-layout').scrollIntoView({behavior:'smooth'});
}

function filterPrice(mn,mx,btn){
  ap=[mn,mx];
  document.querySelectorAll('.sidebar-item').forEach(b=>{if(!b.id)b.classList.remove('active');});
  btn.classList.add('active');render();
}

function doSort(v){sm=v;render();}
function doSearch(v){sq=v.toLowerCase();render();}

function addCart(idx,btn){
  const x=products[idx];
  const ex=cart.find(c=>c.n===x.n);
  if(ex)ex.qty++;else cart.push({...x,qty:1});
  updateCount();
  btn.textContent='✓';btn.classList.add('done');
  setTimeout(()=>{btn.textContent='+';btn.classList.remove('done');},900);
}

function updateCount(){
  document.getElementById('cart-count').textContent=cart.reduce((s,c)=>s+c.qty,0);
}

function openCart(){
  document.getElementById('cart-overlay').classList.add('open');
  document.getElementById('cart-panel').classList.add('open');
  renderCart();
}

function closeCart(){
  document.getElementById('cart-overlay').classList.remove('open');
  document.getElementById('cart-panel').classList.remove('open');
}

function renderCart(){
  const b=document.getElementById('cart-body'),f=document.getElementById('cart-foot');
  if(!cart.length){b.innerHTML='<div class="cart-empty-msg">Your bag is empty.</div>';f.style.display='none';return;}
  f.style.display='block';
  b.innerHTML=cart.map((c,i)=>`
    <div class="cart-line">
      <div class="cart-icon-box">${c.i}</div>
      <div class="cart-line-info">
        <div class="cart-line-name">${c.n}</div>
        <div class="cart-line-price">${fmt(c.p)}</div>
        <div class="cart-qty">
          <button class="qty-b" onclick="chQty(${i},-1)">&#8722;</button>
          <span class="qty-n">${c.qty}</span>
          <button class="qty-b" onclick="chQty(${i},1)">+</button>
        </div>
      </div>
      <button class="cart-del" onclick="delItem(${i})">&#x2715;</button>
    </div>`).join('');
  document.getElementById('cart-total').textContent=fmt(cart.reduce((s,c)=>s+(c.p*c.qty),0));
}

function chQty(i,d){cart[i].qty+=d;if(cart[i].qty<=0)cart.splice(i,1);updateCount();renderCart();}
function delItem(i){cart.splice(i,1);updateCount();renderCart();}

function openCheckout(){
  closeCart();
  document.getElementById('co-wrap').classList.add('open');
  renderSummary();
}

function closeCheckout(){
  document.getElementById('co-wrap').classList.remove('open');
  openCart();
}

function renderSummary(){
  const t=cart.reduce((s,c)=>s+(c.p*c.qty),0);
  document.getElementById('ord-sum').innerHTML=
    cart.map(c=>`<div class="sum-line"><span>${c.n} &times;${c.qty}</span><span>${fmt(c.p*c.qty)}</span></div>`).join('')+
    `<div class="sum-total"><span>Total</span><span>${fmt(t)}</span></div>`;
}

function selPay(m){
  sp=m;
  document.getElementById('po-esewa').classList.toggle('sel',m==='esewa');
  document.getElementById('po-fonepay').classList.toggle('sel',m==='fonepay');
}

function placeOrder(){
  document.getElementById('co-wrap').classList.remove('open');
  document.getElementById('succ-wrap').classList.add('open');
}

function resetAll(){
  cart=[];updateCount();
  document.getElementById('succ-wrap').classList.remove('open');
  render();
}

render();
