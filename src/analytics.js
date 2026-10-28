// Consent-gated business and editorial measurement. Never send form text or contact data.
const consented = () => { try { return JSON.parse(localStorage.getItem('fr-cookie-consent'))?.analytics === true } catch { return false } }
let visit
let lastActivity = performance.now()
let lastTick = performance.now()
const clamp = value => Math.max(0, Math.min(100, value))
const visible = element => { const r=element.getBoundingClientRect(); return r.bottom>0 && r.top<innerHeight && r.width>0 && r.height>0 }
const publicPath = () => location.pathname.replace(/\/$/,'') || '/'

export function trackEvent(name, parameters = {}) {
  if (!consented() || /^\/admin(?:\/|$)/.test(location.pathname)) return
  const params = { page_path: publicPath(), site_section: location.pathname.startsWith('/partners') ? 'partners' : location.pathname.startsWith('/channel') ? 'channel' : 'studio', ...parameters }
  window.gtag?.('event', name, params)
  window.clarity?.('event', name)
  // Only allow the low-cardinality, explicitly supplied context into Clarity tags.
  for (const key of ['site_section','article_slug','article_category','case_study','inquiry_type','service_id','step','milestone']) {
    if (params[key] !== undefined) window.clarity?.('set', key, String(params[key]))
  }
}

function once(key, name, params={}) {
  if (!visit || visit.sent.has(key)) return
  visit.sent.add(key); trackEvent(name,params)
}
function articleParams() { return { article_slug:visit.path.split('/')[2],article_category:document.querySelector('.channel-article>header>p')?.textContent?.slice(0,60) || 'unknown' } }
function summary() {
  if (!visit?.article || !visit.seconds) return
  trackEvent('channel_read_summary',{...articleParams(),page_path:visit.path,active_seconds:Math.round(visit.seconds),max_depth:Math.round(visit.depth),estimated_read_seconds:visit.estimate})
  visit.seconds=0 // A visibility boundary starts a new time segment; milestones remain per visit.
}
function inspect() {
  const now=performance.now(), delta=Math.min((now-lastTick)/1000,2); lastTick=now
  if (!consented()) {visit=undefined; return}
  if (/^\/admin(?:\/|$)/.test(location.pathname)) {visit=undefined; return}
  const root=document.querySelector('#app')?.firstElementChild, path=publicPath()
  if (!root) return
  if (!visit || visit.root!==root || visit.path!==path) {
    summary()
    visit={root,path,sent:new Set(),seconds:0,totalSeconds:0,depth:0,article:false,sections:new Set()}
    trackEvent('site_route_view')
    if(path.startsWith('/partners')) trackEvent('partners_page_view')
    if(/^\/partners\/case-studies\/.+/.test(path)) trackEvent('case_study_view',{case_study:path.split('/')[3]})
  }
  const formType=document.querySelector('[data-retainer-builder]')?'retainer_plus':document.querySelector('[data-inquiry-builder]')?'outsourcing':path.includes('/new-inquiry')?'outsourcing':null
  if(formType) {
    root.querySelectorAll('form').forEach(form=>form.setAttribute('data-clarity-mask','true'))
    const step=root.querySelector('[data-retainer-step]:not([hidden]),[data-inquiry-step]:not([hidden])')
    if(step && visible(step)) {
      once('inquiry_start','inquiry_start',{inquiry_type:formType})
      const number=Number(step.dataset.retainerStep||step.dataset.inquiryStep)
      once(`step_${number}`,'inquiry_step_view',{inquiry_type:formType,step:number})
    }
    const success=root.querySelector('.inquiry-success:not([hidden])')
    if(success) once('lead','generate_lead',{inquiry_type:formType,lead_source:'website'})
  }
  if(path.startsWith('/partners')) {
    root.querySelectorAll('main>section[id],main>section.outsourcing-section').forEach((section,index)=>{if(visible(section))once(`partners_section_${index}`,'partners_section_view',{section_id:section.id||`section_${index+1}`})})
  }
  const body=root.querySelector('.channel-article__body')
  if (!body || !body.textContent.trim()) return
  if(!visit.article) {
    visit.article=true;visit.estimate=Math.max(1,Math.ceil(body.textContent.trim().split(/\s+/).length/200*60))
    once('article','channel_article_view',{...articleParams(),estimated_read_seconds:visit.estimate})
  }
  if(document.visibilityState!=='visible'||!document.hasFocus()||now-lastActivity>60000||!visible(body))return
  visit.seconds+=delta; visit.totalSeconds+=delta
  const rect=body.getBoundingClientRect()
  visit.depth=Math.max(visit.depth,clamp((innerHeight-rect.top)/rect.height*100))
  for(const point of [25,50,75,100]) if(visit.depth>=point) once(`depth_${point}`,'channel_read_depth',{...articleParams(),milestone:point,active_seconds:Math.round(visit.totalSeconds)})
  for(const seconds of [15,30,60,120,300]) if(visit.totalSeconds>=seconds) once(`time_${seconds}`,'channel_read_time',{...articleParams(),milestone:seconds})
  if(visit.depth>=95 && visit.totalSeconds>=Math.max(5,Math.min(30,visit.estimate*.5))) once('complete','channel_read_complete',{...articleParams(),active_seconds:Math.round(visit.totalSeconds)})
  body.querySelectorAll('h2,h3,h4').forEach((heading,index)=>{if(visible(heading))once(`section_${index}`,'channel_section_view',{...articleParams(),section_index:index+1})})
}

export function initAnalytics() {
  document.addEventListener('change',event=>{
    const field=event.target
    if(field.matches('[data-retainer-quantity]'))trackEvent('catalog_quantity_select',{service_id:field.dataset.retainerQuantity,quantity:Number(field.value)})
    if(field.matches('[data-level-slider]'))trackEvent('inquiry_experience_select',{level_index:Number(field.value)})
    if(field.matches('.inquiry-builder [name="budgetIndex"]'))trackEvent('inquiry_budget_select',{budget_band:Number(field.value)})
  })
  document.addEventListener('invalid',event=>{if(event.target.closest('.inquiry-builder'))trackEvent('inquiry_validation_error',{field_type:event.target.type||'unknown'})},true)
  for(const name of ['pointerdown','keydown','scroll','touchstart']) addEventListener(name,()=>{lastActivity=performance.now()},{passive:true})
  document.addEventListener('visibilitychange',()=>{if(document.hidden)summary();else lastActivity=performance.now()})
  addEventListener('pagehide',summary)
  document.addEventListener('click',event=>{
    if(!consented())return
    const target=event.target.closest('a,button'); if(!target)return
    const d=target.dataset
    const service=d.toggleService||d.toggleRetainer||d.quickOffering
    if(service) trackEvent('partners_offer_toggle',{service_id:service,selection_action:target.classList.contains('selected')||target.getAttribute('aria-pressed')==='true'?'remove':'add'})
    if(d.retainerMode)trackEvent('inquiry_mode_select',{selection:d.retainerMode})
    if(d.retainerTab||d.retainerCategory)trackEvent('catalog_filter',{filter_type:d.retainerTab?'type':'category',selection:d.retainerTab||d.retainerCategory})
    if(d.retainerOption)trackEvent('inquiry_option_select',{option_group:d.retainerOption,selection:d.optionValue})
    if(d.serviceCard)trackEvent('partners_service_details',{service_id:d.serviceCard})
    if(target.matches('[data-next-step]'))trackEvent('inquiry_continue_click')
    if(target.matches('[type="submit"]')&&target.closest('.inquiry-builder'))trackEvent('inquiry_submit_click')
    if(target.tagName!=='A')return
    const url=new URL(target.href,location.origin)
    if(url.pathname.startsWith('/channel/')&&url.pathname!=='/channel/')trackEvent('channel_article_click',{article_slug:url.pathname.split('/')[2]})
    if(url.pathname.includes('/new-inquiry'))trackEvent('partners_inquiry_cta')
    if(url.protocol==='mailto:')trackEvent('contact_email_click')
    else if(url.origin!==location.origin)trackEvent('outbound_link',{link_domain:url.hostname,link_type:target.closest('.case-trailers')?'trailer':'external'})
    if(target.matches('[data-case-image]'))trackEvent('case_gallery_open')
  },true)
  setInterval(inspect,1000)
}
