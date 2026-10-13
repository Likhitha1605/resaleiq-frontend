import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Home, Tag, Scale, Bookmark, ChartNoAxesColumnIncreasing, UserRound, CarFront, Bike, Smartphone, ArrowRight, CheckCircle2, Search, RotateCcw, LoaderCircle, AlertCircle, Moon, Sun, Info, Sparkles, Trash2, ChevronRight, ShieldCheck, TrendingUp } from 'lucide-react';
import './styles.css';

const API_URL = import.meta.env.VITE_API_URL || 'https://resaleiq-backend.onrender.com/predict';
const money = n => '₹' + Math.round(Number(n) || 0).toLocaleString('en-IN');
const categories = {
  Cars: {icon:CarFront, hint:'Hatchback, Sedan, SUV', fields:[
    {key:'name',label:'Exact car name',value:'Maruti Swift VXI',type:'text'},
    {key:'brand',label:'Brand',value:'Maruti',type:'select',options:['Maruti','Hyundai','Tata','Honda','Toyota','Kia','Mahindra','Renault','Volkswagen','Other']},
    {key:'year',label:'Manufacturing year',value:'2018',type:'number'},
    {key:'km_driven',label:'Kilometres driven (km)',value:'50000',type:'number'},
    {key:'mileage_num',label:'Mileage (km/l)',value:'18.0',type:'number'},
    {key:'engine_num',label:'Engine capacity (cc)',value:'1197',type:'number'},
    {key:'max_power_num',label:'Maximum power (bhp)',value:'82',type:'number'},
    {key:'seats',label:'Seats',value:'5',type:'number'},
    {key:'fuel',label:'Fuel',value:'Petrol',type:'select',options:['Petrol','Diesel','CNG','LPG','Electric']},
    {key:'transmission',label:'Transmission',value:'Manual',type:'select',options:['Manual','Automatic']},
    {key:'owner',label:'Ownership',value:'First Owner',type:'select',options:['First Owner','Second Owner','Third Owner','Fourth & Above Owner']},
    {key:'seller_type',label:'Seller type',value:'Individual',type:'select',options:['Individual','Dealer','Trustmark Dealer']}
  ]},
  Bikes: {icon:Bike, hint:'Sports, Commuter, Scooters', fields:[
    {key:'model_name',label:'Exact bike model',value:'TVS Apache RTR 160 4V',type:'text'},
    {key:'location',label:'Location',value:'Hyderabad',type:'text'},
    {key:'model_year',label:'Manufacturing year',value:'2021',type:'number'},
    {key:'kms_driven_num',label:'Kilometres driven (km)',value:'18000',type:'number'},
    {key:'mileage_num',label:'Mileage (km/l)',value:'40',type:'number'},
    {key:'power_num',label:'Power (bhp)',value:'16',type:'number'},
    {key:'owner',label:'Ownership',value:'First Owner',type:'select',options:['First Owner','Second Owner','Third Owner','Fourth & Above Owner']}
  ]},
  Phones: {icon:Smartphone, hint:'iPhone, Samsung, OnePlus', fields:[
    {key:'brand',label:'Brand',value:'Samsung',type:'select',options:['Samsung','Apple','OnePlus','Xiaomi','Vivo','Oppo','Realme','Google','Other']},
    {key:'model',label:'Phone model',value:'Galaxy S series',type:'text'},
    {key:'launch_price_inr',label:'Original launch price (₹)',value:'30000',type:'number'},
    {key:'launch_year',label:'Launch year',value:'2023',type:'number'},
    {key:'age_years',label:'Age (years)',value:'3',type:'number'},
    {key:'city',label:'City',value:'Hyderabad',type:'text'},
    {key:'seller_type',label:'Seller type',value:'Individual',type:'select',options:['Individual','Dealer']},
    {key:'ram_gb',label:'RAM (GB)',value:'8',type:'select',options:['4','6','8','12','16']},
    {key:'storage_gb',label:'Storage (GB)',value:'128',type:'select',options:['64','128','256','512','1024']},
    {key:'processor',label:'Processor',value:'Snapdragon',type:'text'},
    {key:'display_hz',label:'Display refresh rate (Hz)',value:'120',type:'number'},
    {key:'battery_health_pct',label:'Battery health (%)',value:'85',type:'number'},
    {key:'camera_mp',label:'Main camera (MP)',value:'50',type:'number'},
    {key:'condition',label:'Condition',value:'Good',type:'select',options:['Like New','Excellent','Good','Fair','Poor']},
    {key:'screen_crack',label:'Screen cracked?',value:'No',type:'select',options:['No','Yes']},
    {key:'scratches',label:'Scratches',value:'Minor',type:'select',options:['None','Minor','Moderate','Major']},
    {key:'box',label:'Original box available?',value:'Yes',type:'select',options:['Yes','No']},
    {key:'charger',label:'Charger available?',value:'Yes',type:'select',options:['Yes','No']},
    {key:'invoice',label:'Invoice available?',value:'Yes',type:'select',options:['Yes','No']},
    {key:'warranty',label:'Warranty available?',value:'No',type:'select',options:['Yes','No']},
    {key:'network',label:'Network',value:'5G',type:'select',options:['4G','5G']},
    {key:'repair_history',label:'Repair history',value:'None',type:'select',options:['None','Battery Replaced','Screen Replaced','Other']}
  ]}
};
const defaults = Object.fromEntries(Object.entries(categories).map(([c,v])=>[c,Object.fromEntries(v.fields.map(f=>[f.key,f.value]).concat([['asking_price',c==='Cars'?'450000':c==='Bikes'?'100000':'25000']]))]));
const navItems = [['Home',Home],['Price Predictor',Tag],['Smart Compare',Scale],['Saved Listings',Bookmark],['Insights',ChartNoAxesColumnIncreasing]];

function App(){
  const [page,setPage]=useState('Home');
  const [theme,setTheme]=useState('light');
  const [category,setCategory]=useState('Cars');
  const [mode,setMode]=useState('buyer');
  const [values,setValues]=useState({...defaults.Cars});
  const [result,setResult]=useState(null);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');
  const [saved,setSaved]=useState([]);
  const [compareCat,setCompareCat]=useState('Cars');
  const [compare,setCompare]=useState([{...defaults.Cars,name:'Maruti Swift VXI',asking_price:'450000'},{...defaults.Cars,name:'Hyundai i20 Sportz',brand:'Hyundai',year:'2019',asking_price:'500000'}]);
  const [compareResults,setCompareResults]=useState(null);
  const [compareLoading,setCompareLoading]=useState(false);
  const [compareError,setCompareError]=useState('');

  const setField=(key,value)=>setValues(v=>({...v,[key]:value}));
  const selectCategory=c=>{setCategory(c);setValues({...defaults[c]});setResult(null);setError('');};
  const clear=()=>{setValues(Object.fromEntries(Object.keys(values).map(k=>[k,''])));setResult(null);setError('');};
  const predict=async (cat=category, form=values)=>{
    const payload={category:cat.toLowerCase()==='phones'?'smartphones':cat.toLowerCase(),...form,asking_price:Number(form.asking_price||0)};
    const response=await fetch(API_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    const data=await response.json().catch(()=>({detail:'Backend returned an invalid response.'}));
    if(!response.ok) throw new Error(data.detail||data.error||`Prediction failed (${response.status}).`);
    const estimate=Number(data.estimated_price ?? data.predicted_price ?? data.estimate ?? data.price);
    if(!Number.isFinite(estimate)||estimate<=0) throw new Error('The backend response did not contain a valid estimated price.');
    const ask=Number(form.asking_price||0),pct=estimate?((ask-estimate)/estimate)*100:0;
    return {estimate,asking:ask,score:Math.max(0,Math.min(100,100-Math.abs(pct)*1.5)),pct,status:pct<0?'Below estimate':pct===0?'At estimate':'Above estimate',raw:data};
  };
  const runPrediction=async()=>{
    setLoading(true);setError('');
    try{const r=await predict();setResult(r);}
    catch(e){setError(`${e.message} Check that the Python API is running at ${API_URL}.`);}
    finally{setLoading(false);}
  };
  const runCompare=async()=>{
    setCompareLoading(true);setCompareError('');
    try{
      const [a,b]=await Promise.all(compare.map(form=>predict(compareCat,form)));
      setCompareResults([a,b]);
    }catch(e){setCompareError(`${e.message} Check that the Python API is running at ${API_URL}.`);}
    finally{setCompareLoading(false);}
  };
  const saveCurrent=()=>{
    if(!result){setError('Estimate a price before saving this listing.');return;}
    setSaved(s=>[{id:Date.now(),category,label:values.name||values.model_name||values.model||values.brand,asking:result.asking,estimate:result.estimate,values:{...values}},...s]);
  };
  const changeCompareCat=c=>{setCompareCat(c);setCompare([ {...defaults[c]}, {...defaults[c]} ]);setCompareResults(null);setCompareError('');};
  const updateCompare=(idx,key,val)=>setCompare(old=>old.map((x,i)=>i===idx?{...x,[key]:val}:x));

  return <div className="app" data-theme={theme}>
    <Navbar page={page} setPage={setPage} theme={theme} toggleTheme={()=>setTheme(t=>t==='light'?'dark':'light')}/>
    {page==='Home'&&<HomePage setPage={setPage}/>}
    {page==='Price Predictor'&&<PricePage {...{category,mode,setMode,values,setField,selectCategory,clear,runPrediction,loading,error,result,saveCurrent}}/>}
    {page==='Smart Compare'&&<ComparePage {...{compareCat,changeCompareCat,compare,updateCompare,runCompare,compareLoading,compareError,compareResults}}/>}
    {page==='Saved Listings'&&<SavedPage saved={saved} remove={id=>setSaved(s=>s.filter(x=>x.id!==id))} openPredictor={()=>setPage('Price Predictor')}/>}
    {page==='Insights'&&<InsightsPage setPage={setPage}/>}
    <footer className="footer"><div><b>₹ ResaleIQ</b><span>Know the Real Value</span></div><p>Estimate wisely. Compare carefully. Decide confidently.</p><small>© 2026 ResaleIQ</small></footer>
  </div>
}

function Navbar({page,setPage,theme,toggleTheme}){
 return <header className="navbar"><div className="nav-inner">
  <button className="logo" onClick={()=>setPage('Home')}><i>₹</i><span>ResaleIQ<small>Know the Real Value</small></span></button>
  <nav>{navItems.map(([n,I])=><button key={n} className={page===n?'nav-link on':'nav-link'} onClick={()=>setPage(n)}>{n}</button>)}</nav>
  <button className="iconbtn" aria-label="Toggle theme" onClick={toggleTheme}>{theme==='light'?<Moon size={18}/>:<Sun size={18}/>}</button>
 </div></header>
}

function Hero({title,subtitle,pill='● Model online'}){return <section className="hero"><div><h1>{title}</h1><p>{subtitle}</p></div><span className="pill">{pill}</span></section>}
function HomePage({setPage}){
 return <main className="wrap"><Hero title="Know the Real Value" subtitle="Make confident second-hand decisions with resale price estimates, fair-price comparisons and practical guidance." pill="● Your resale decision hub"/>
  <section className="home-hero card"><div><span className="eyebrow">BUY SMARTER. SELL WITH CONFIDENCE.</span><h2>Every used item has a story.<br/><em>Know what it’s worth.</em></h2><p>ResaleIQ helps you estimate the resale value of cars, bikes and smartphones, compare asking prices and plan your next move.</p><button className="cta home-cta" onClick={()=>setPage('Price Predictor')}>Estimate a resale price <ArrowRight size={17}/></button></div><div className="home-visual"><div className="visual-card"><TrendingUp size={30}/><span>Resale estimate</span><strong>Know before you buy</strong><div className="visual-bars"><i/><i/><i/><i/><i/><i/><i/></div></div><div className="visual-tags"><span>Cars</span><span>Bikes</span><span>Phones</span></div></div></section>
  <div className="section-head"><div><h2>What would you like to do?</h2><p>Choose a tool to get started.</p></div></div>
  <section className="tool-grid">
   <ToolCard icon={Tag} title="Price Predictor" desc="Estimate a resale price and see how the asking price compares." action="Estimate price" onClick={()=>setPage('Price Predictor')} tone="purple"/>
   <ToolCard icon={Scale} title="Smart Compare" desc="Compare two listings side by side before making a decision." action="Compare listings" onClick={()=>setPage('Smart Compare')} tone="green"/>
   <ToolCard icon={Bookmark} title="Saved Listings" desc="Keep your shortlisted items together for a later review." action="View saved items" onClick={()=>setPage('Saved Listings')} tone="amber"/>
  </section>
  <section className="how-card"><div><span className="eyebrow">HOW IT WORKS</span><h2>A clearer way to decide.</h2><p>Use a model estimate as one reference point, then verify condition, documents and current comparable listings.</p></div><div className="how-steps"><div><b>01</b><span><strong>Enter details</strong><small>Tell us about the item.</small></span></div><div><b>02</b><span><strong>Review the estimate</strong><small>Compare estimate and asking price.</small></span></div><div><b>03</b><span><strong>Decide with care</strong><small>Verify before buying or selling.</small></span></div></div></section>
 </main>
}
function ToolCard({icon:Icon,title,desc,action,onClick,tone}){return <button className="tool-card" onClick={onClick}><span className={`tool-icon ${tone}`}><Icon size={22}/></span><h3>{title}</h3><p>{desc}</p><strong>{action}<ArrowRight size={15}/></strong></button>}

function PricePage({category,mode,setMode,values,setField,selectCategory,clear,runPrediction,loading,error,result,saveCurrent}){
 return <main className="wrap"><Hero title="Price Predictor" subtitle="Estimate real resale prices and see how any asking price stacks up against the market."/>
  <div className="grid">
   <section className="card">
    <div className="seg"><button className={mode==='buyer'?'on':''} onClick={()=>setMode('buyer')}>🛒 Buyer</button><button className={mode==='seller'?'on':''} onClick={()=>setMode('seller')}>🏷️ Seller</button></div>
    <div className="note">{mode==='buyer'?"Buyer mode: compare the seller's asking price with the AI estimate before deciding whether to buy.":"Seller mode: see what your item is worth and price it to sell quickly."}</div>
    <div className="step"><b>1</b>Select category</div>
    <div className="cats">{Object.entries(categories).map(([name,c])=><button key={name} className={category===name?'cat on':'cat'} onClick={()=>selectCategory(name)}><span>{name==='Cars'?'🚗':name==='Bikes'?'🏍️':'📱'}</span><strong>{name}</strong><em>{c.hint}</em></button>)}</div>
    <div className="step"><b>2</b>Enter details<a onClick={clear}>Clear all</a></div>
    <div className="fields">{categories[category].fields.map(f=><Field key={f.key} field={f} value={values[f.key]??''} onChange={v=>setField(f.key,v)}/>)}<Field field={{key:'asking_price',label:mode==='buyer'?"Seller's asking price (₹)":"Your intended asking price (₹)",type:'number'}} value={values.asking_price??''} onChange={v=>setField('asking_price',v)} full/></div>
    <button className="cta" onClick={runPrediction} disabled={loading}>{loading?<><LoaderCircle className="spin" size={18}/> Estimating…</>:<>✨ Estimate Resale Price</>}</button>
    {error&&<div className="error"><AlertCircle size={17}/><span>{error}</span></div>}
   </section>
   <ResultsPanel result={result} mode={mode} category={category} saveCurrent={saveCurrent}/>
  </div>
 </main>
}
function Field({field,value,onChange,full=false}){return <div className={`f ${full?'full':''}`}><label>{field.label}</label>{field.options?<select value={value} onChange={e=>onChange(e.target.value)}><option value="">Select…</option>{field.options.map(o=><option key={o}>{o}</option>)}</select>:<input type={field.type==='number'?'number':'text'} value={value} onChange={e=>onChange(e.target.value)} placeholder={field.label}/>}</div>}
function ResultsPanel({result,mode,category,saveCurrent}){
 const est=result?.estimate||0,ask=result?.asking||0,pct=result?.pct||0,below=result?ask<=est:true;
 const lo=est*.82,hi=est*1.11,marker=est?Math.max(5,Math.min(95,(ask-lo)/(hi-lo)*100)):50;
 return <section className="card results">
  <div className="est"><div><small>Estimated resale price</small><h2>{result?money(est):'—'}</h2></div><p>Model estimate based on your inputs. Not a guaranteed selling price.</p></div>
  <div className="metrics"><div className="m a"><small>Your asking price</small><strong>{result?money(ask):'—'}</strong></div><div className="m b"><small>Price fairness score</small><strong>{result?result.score.toFixed(1)+' / 100':'—'}</strong></div><div className={`m c ${result&&!below?'bad':''}`}><small>Difference from estimate</small><strong>{result?(pct>0?'+':'')+pct.toFixed(1)+'%':'—'}</strong>{result&&<span className="badge">{result.status}</span>}</div></div>
  <div className={`guide ${result&&!below?'bad':''}`}><h4>{!result?'Your guidance will appear here':below?(mode==='buyer'?'The asking price is at or below the model estimate.':'Your price is below the model estimate.'):(mode==='buyer'?'The asking price is above the model estimate.':'Your price is above the model estimate.')}</h4><p>{!result?'Enter the item details and estimate a price to receive guidance.':below?(mode==='buyer'?'This may be worth investigating. Check condition, service history, documents and comparable listings before deciding.':'Consider whether a lower price is intentional for a faster sale. Verify comparable listings before deciding.'):(mode==='buyer'?'Consider negotiating or comparing similar listings before committing.':'Consider adjusting the asking price toward comparable listings to attract more buyers.')}</p></div>
  <div className="two"><MarketRange result={result} lo={lo} hi={hi} marker={marker}/><SellOptions/></div>
  <Checklist category={category} mode={mode}/>
  {result&&<button className="secondary-btn save-btn" onClick={saveCurrent}><Bookmark size={16}/> Save this listing</button>}
  <p className="disclaimer">Estimates are indicative only. Price fairness score is a project-defined heuristic. Verify current local listings and item condition before making a decision.</p>
 </section>
}
function MarketRange({result,lo,hi,marker}){return <div className="box"><h5>Market range · similar listings</h5><div className="track"><div className="fill"/><div className="dot" style={{left:result?marker+'%':'50%'}}/></div><div className="lbl"><span><b>{result?money(lo):'—'}</b>Lowest</span><span><b>{result?money(result.estimate*.94):'—'}</b>Average*</span><span><b>{result?money(hi):'—'}</b>Highest</span></div><small className="market-note">*Illustrative range based on the estimate, not live listing data.</small></div>}
function SellOptions(){return <div className="box sell"><h5>Where can you sell?</h5><div><span>🛍️</span><p>OLX / Marketplace<small>Higher price, direct buyers</small></p></div><div><span>⚡</span><p>Spinny / Cars24<small>Convenience, instant payment</small></p></div><div><span>🏪</span><p>Local dealers<small>Quick sale, lower quotes</small></p></div></div>}
function Checklist({category,mode}){const items=category==='Cars'?['Service history and maintenance records','Engine, transmission and test drive','Accident history and paint condition','Tyre and brake condition','RC, insurance and PUC certificate','Compare prices on OLX and local dealers']:category==='Bikes'?['Service history and maintenance records','Engine, clutch and test ride','Accident history and frame condition','Tyres, brakes and chain condition','RC, insurance and PUC certificate','Compare similar model listings']:['Screen, camera and body condition','Battery health and charging','Display touch and buttons','IMEI and ownership proof','Original bill and accessories','Compare same model and storage'];return <div className="box checklist"><h5>Things to check before {mode==='buyer'?'buying':'selling'}</h5><ul className="chk">{items.map(x=><li key={x}>{x}</li>)}</ul></div>}

function ComparePage({compareCat,changeCompareCat,compare,updateCompare,runCompare,compareLoading,compareError,compareResults}){
 return <main className="wrap"><Hero title="Smart Compare" subtitle="Compare two second-hand listings side by side and see which asking price is more favorable." pill="● Compare listings"/>
  <section className="card compare-page"><div className="step"><b>1</b>Select category</div><div className="cats">{Object.entries(categories).map(([n,c])=><button key={n} className={compareCat===n?'cat on':'cat'} onClick={()=>changeCompareCat(n)}><span>{n==='Cars'?'🚗':n==='Bikes'?'🏍️':'📱'}</span><strong>{n}</strong><em>{c.hint}</em></button>)}</div>
   <div className="compare-forms">{compare.map((item,idx)=><div className="compare-form" key={idx}><div className="compare-form-head"><span className="number-chip">{idx===0?'A':'B'}</span><div><h3>Listing {idx===0?'A':'B'}</h3><p>Enter details for this item</p></div></div><div className="fields">{categories[compareCat].fields.map(f=><Field key={f.key} field={f} value={item[f.key]??''} onChange={v=>updateCompare(idx,f.key,v)}/>)}<Field field={{key:'asking_price',label:"Seller's asking price (₹)",type:'number'}} value={item.asking_price??''} onChange={v=>updateCompare(idx,'asking_price',v)} full/></div>{compareResults&&<div className="compare-estimate"><small>Estimated resale price</small><strong>{money(compareResults[idx].estimate)}</strong><p>Asking: {money(compareResults[idx].asking)} · Difference: {compareResults[idx].pct.toFixed(1)}%</p></div>}</div>)}</div>
   <button className="cta compare-cta" onClick={runCompare} disabled={compareLoading}>{compareLoading?<><LoaderCircle className="spin" size={18}/> Comparing…</>:<>Compare Listings <ArrowRight size={17}/></>}</button>
   {compareError&&<div className="error"><AlertCircle size={17}/>{compareError}</div>}
   {compareResults&&<div className="comparison-summary"><div className="step"><b>✓</b>Comparison summary</div><h3>{Math.abs(compareResults[0].pct)<Math.abs(compareResults[1].pct)?'Listing A is closer to its model estimate.':Math.abs(compareResults[0].pct)>Math.abs(compareResults[1].pct)?'Listing B is closer to its model estimate.':'Both listings are equally close to their model estimates.'}</h3><p>This comparison uses the relative difference between each asking price and its model estimate. It does not guarantee item condition or market value.</p><div className="summary-grid">{compareResults.map((r,i)=><div className="m"><small>Listing {i===0?'A':'B'} · Fairness score</small><strong>{r.score.toFixed(1)} / 100</strong><p>Asking price {r.pct>0?'above':'below'} estimate by {Math.abs(r.pct).toFixed(1)}%</p></div>)}</div></div>}
  </section>
 </main>
}
function SavedPage({saved,remove,openPredictor}){return <main className="wrap"><Hero title="Saved Listings" subtitle="Keep your shortlisted items together and return to them when you're ready." pill={`${saved.length} saved`}/><section className="card saved-page">{saved.length===0?<div className="empty"><Bookmark size={30}/><h2>No saved listings yet</h2><p>Estimate a resale price, then save the listing to build your shortlist.</p><button className="cta" onClick={openPredictor}>Open Price Predictor <ArrowRight size={16}/></button></div>:<div className="saved-grid">{saved.map(s=><article className="saved-item" key={s.id}><span className="saved-category">{s.category}</span><h3>{s.label}</h3><div><small>Estimated resale price</small><strong>{money(s.estimate)}</strong></div><p>Asking price: {money(s.asking)}</p><button className="secondary-btn" onClick={()=>remove(s.id)}><Trash2 size={15}/> Remove</button></article>)}</div>}</section></main>}
function InsightsPage({setPage}){return <main className="wrap"><Hero title="Market Insights" subtitle="Use estimates thoughtfully and verify asking prices against comparable local listings." pill="● Decision guidance"/><section className="insight-grid"><article className="card"><TrendingUp/><h3>Compare like-for-like</h3><p>Match model, year, condition, usage and location when comparing listings.</p></article><article className="card"><ShieldCheck/><h3>Verify before buying</h3><p>Inspect condition, maintenance records and ownership documents before paying.</p></article><article className="card"><Info/><h3>Understand the estimate</h3><p>Model estimates are references, not guaranteed sale prices. Phone model results are experimental.</p></article></section><button className="cta insight-cta" onClick={()=>setPage('Price Predictor')}>Estimate a resale price <ArrowRight size={16}/></button></main>}
createRoot(document.getElementById('root')).render(<App/>);
