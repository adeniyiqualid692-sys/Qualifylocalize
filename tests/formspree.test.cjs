const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const candidate = path.resolve(__dirname, '../dist/forms.js');
const source = fs.readFileSync(fs.existsSync(candidate) ? candidate : path.resolve(__dirname, '../public/forms.js'), 'utf8');
function fixture(kind, fetchImpl) {
  const attrs = {};
  const status = { dataset: {}, setAttribute(k,v){this[k]=v}, textContent:'' };
  const button = { disabled:false, innerHTML:'Send request', textContent:'Send request' };
  const fields = new Map(Object.entries({request_type:kind,email:'visitor@example.com',service:'Website Localization',source:'English',target:'Japanese',words:'1000',timeline:'standard',notes:'Product site',_gotcha:'',message:'An enquiry'}));
  const invalidFields = {};
  const form = {id:kind==='quote'?'quote-form':kind==='contact'?'contact-form':'newsletter',action:'https://formspree.io/f/xwlvgeae',valid:true,
    elements:{namedItem(name){ return invalidFields[name] ||= {setAttribute(k,v){this[k]=v}}; }},
    reportValidity(){return this.valid}, querySelector(){return status},querySelectorAll(s){return s.includes('button')?[button]:[]},setAttribute(k,v){attrs[k]=v},removeAttribute(k){delete attrs[k]}
  };
  const calls=[];
  const context={WeakSet,AbortController,setTimeout,clearTimeout,TypeError,Error,document:{querySelectorAll:()=>[],querySelector:()=>({textContent:'£100–£160'})},window:{location:{href:'https://example.com/quote.html'}},FormData:class{constructor(){this.map=new Map(fields)}get(k){return this.map.get(k)}set(k,v){this.map.set(k,v)}},fetch:async(...args)=>{calls.push(args);return fetchImpl(...args)}};
  vm.createContext(context);vm.runInContext(source,context);
  return {form,status,button,attrs,calls,invalidFields,send:()=>context.submitToFormspree(form)};
}
(async()=>{
 for(const kind of ['quote','contact','newsletter']){
  const f=fixture(kind,async()=>({ok:true,json:async()=>({ok:true})}));await f.send();
  assert.equal(f.calls.length,1);assert.equal(f.calls[0][0],f.form.action);assert.equal(f.calls[0][1].method,'POST');assert.equal(f.calls[0][1].headers.Accept,'application/json');assert.equal(f.calls[0][1].body.get('email'),'visitor@example.com');assert.equal(f.calls[0][1].body.get('request_type'),kind);assert.equal(f.status.dataset.state,'success');assert.equal(f.button.disabled,false);assert.equal(f.attrs['aria-busy'],undefined);
  if(kind==='quote'){assert(f.calls[0][1].body.get('message').includes('English → Japanese'));assert.equal(f.calls[0][1].body.get('indicative_budget_gbp'),'£100–£160');}
 }
 let finish;const f=fixture('quote',()=>new Promise(r=>finish=r));const first=f.send();await f.send();assert.equal(f.calls.length,1);assert.equal(f.button.disabled,true);finish({ok:true,json:async()=>({})});await first;assert.equal(f.button.disabled,false);
 const invalid=fixture('contact',async()=>({ok:false,status:422,json:async()=>({errors:[{field:'email',message:'Please provide a valid email.'}]})}));await invalid.send();assert.equal(invalid.status.dataset.state,'error');assert.equal(invalid.invalidFields.email['aria-invalid'],'true');assert(invalid.status.textContent.includes('valid email'));assert.equal(invalid.button.disabled,false);
 for(const error of [new TypeError('Failed to fetch'),Object.assign(new Error('timeout'),{name:'AbortError'})]){const f=fixture('contact',async()=>{throw error});await f.send();assert.equal(f.status.dataset.state,'error');assert(f.status.textContent.includes('couldn’t confirm'));assert.equal(f.calls.length,1);assert.equal(f.button.disabled,false);}
 const limited=fixture('newsletter',async()=>({ok:false,status:429,json:async()=>({})}));await limited.send();assert(limited.status.textContent.includes('wait'));
 const malformed=fixture('contact',async()=>({ok:false,status:500,json:async()=>{throw new SyntaxError()}}));await malformed.send();assert.equal(malformed.status.dataset.state,'error');
 const blocked=fixture('quote',async()=>{throw Error('must not send')});blocked.form.valid=false;await blocked.send();assert.equal(blocked.calls.length,0);
 console.log('PASS: 3 form payloads; success; HTTP/validation/network/timeout errors; submit locking; button recovery; invalid-form blocking. No live submissions.');
})().catch(e=>{console.error(e);process.exitCode=1});
