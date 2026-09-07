(function(){const a=document.createElement("link").relList;if(a&&a.supports&&a.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))i(s);new MutationObserver(s=>{for(const r of s)if(r.type==="childList")for(const l of r.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&i(l)}).observe(document,{childList:!0,subtree:!0});function n(s){const r={};return s.integrity&&(r.integrity=s.integrity),s.referrerPolicy&&(r.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?r.credentials="include":s.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function i(s){if(s.ep)return;s.ep=!0;const r=n(s);fetch(s.href,r)}})();const K=()=>window.matchMedia("(prefers-reduced-motion: reduce)").matches;let R=!1;function re(){R||!window.AOS||K()||(window.AOS.init({duration:600,easing:"ease-out",once:!0,offset:40}),R=!0)}function C(){R&&window.AOS&&!K()&&window.AOS.refresh()}function ne(){const e=()=>{document.querySelectorAll(".topbar").forEach(a=>{a.classList.toggle("scrolled",window.scrollY>8)})};window.addEventListener("scroll",e,{passive:!0}),e()}const t={repo:"",repoName:"",rev:"HEAD",path:"",mode:"commits",view:"table",since:"",until:"",author:"",nauthor:"",email:!1,merges:!1,hidden:!1,tableSort:"",tableSortDir:-1,tableFilter:"",collapsed:new Set,filtersOpen:!1,screen:"landing",guideFrom:"landing",landingInput:"",analyzing:!1,analyzeError:""};function p(e){return e.replace(/[&<>"']/g,a=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[a])}function M(e){let a=0;for(let n=0;n<e.length;n++)a=a*31+e.charCodeAt(n)>>>0;return`hsl(${a%360} 65% 50%)`}function _(e){if(!e||e.startsWith("0001-"))return"-";const a=new Date(e);return isNaN(a.getTime())?e:a.toLocaleDateString()}function se(){let e=0;return t.rev&&t.rev!=="HEAD"&&e++,t.path&&e++,t.since&&e++,t.until&&e++,t.author&&e++,t.nauthor&&e++,t.email&&e++,t.merges&&e++,t.hidden&&e++,e}function W(){const e=new URLSearchParams;return t.repo&&e.set("repo",t.repo),t.rev&&e.set("rev",t.rev),t.path&&e.set("path",t.path),e.set("mode",t.mode),t.since&&e.set("since",t.since),t.until&&e.set("until",t.until),t.author&&e.set("author",t.author),t.nauthor&&e.set("nauthor",t.nauthor),t.email&&e.set("email","1"),t.merges&&e.set("merges","1"),t.hidden&&e.set("hidden","1"),e}async function F(e,a){const n=await fetch(`/api/${e}?${a}`),i=await n.json();if(!n.ok)throw new Error(i.error||`HTTP ${n.status}`);return i}function ie(){return F("table",W())}function le(){return F("tree",W())}function oe(){return F("hist",W())}function ce(e){const a=new URLSearchParams;return a.set("repo",e),F("resolve",a)}function de(){return t.since||t.until?`${t.since||"…"} → ${t.until||"…"}`:"All time 📅"}function N(e){return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,"0")}-${String(e.getDate()).padStart(2,"0")}`}const ue=["January","February","March","April","May","June","July","August","September","October","November","December"],pe=["Su","Mo","Tu","We","Th","Fr","Sa"];function fe(){const e=se(),a=e?` <span class="badge" aria-label="${e} active filters">${e}</span>`:"";return`<button id="filters-btn" class="btn btn-secondary" aria-expanded="${t.filtersOpen}" aria-haspopup="dialog">Filters${a}</button>`}function me(){if(!t.filtersOpen)return"";const e=a=>a?"checked":"";return`
  <div class="popover" role="dialog" aria-label="Analysis filters">
    <div class="grid grid-2">
      <label class="field">Revision / branch <input id="f-rev" class="input" value="${p(t.rev)}" /></label>
      <label class="field">Path filter <input id="f-path" class="input" value="${p(t.path)}" placeholder="subdir/" /></label>
      <label class="field">Date range
        <button id="f-dates" class="input" style="text-align:left;cursor:pointer" aria-haspopup="dialog">${p(de())}</button>
      </label>
      <label class="field">Author <input id="f-author" class="input" value="${p(t.author)}" placeholder="--author" /></label>
      <label class="field">Exclude author <input id="f-nauthor" class="input" value="${p(t.nauthor)}" placeholder="--nauthor" /></label>
    </div>
    <div style="display:flex;gap:16px;flex-wrap:wrap">
      <label class="body-sm"><input type="checkbox" id="f-email" ${e(t.email)} /> Show email (-e)</label>
      <label class="body-sm"><input type="checkbox" id="f-merges" ${e(t.merges)} /> Count merges</label>
      <label class="body-sm"><input type="checkbox" id="f-hidden" ${e(t.hidden)} /> Show hidden files (-a)</label>
    </div>
    <div style="display:flex;gap:8px">
      <button id="f-apply" class="btn btn-primary">Apply</button>
      <button id="f-clear" class="btn btn-translucent">Clear</button>
    </div>
    <dialog id="date-dialog" class="date-dialog" aria-label="Select date range">
      <p class="headline" style="margin-top:0">Date range</p>
      <p class="legend" id="d-summary">All time</p>
      <div class="cal-nav">
        <button id="cal-prev" class="btn-icon" aria-label="Previous month">‹</button>
        <span id="cal-title" class="body-sm" aria-live="polite"></span>
        <button id="cal-next" class="btn-icon" aria-label="Next month">›</button>
      </div>
      <div class="cal-grid" id="cal-grid" role="grid" aria-label="Calendar: pick a start date, then an end date"></div>
      <div class="presets" style="margin:12px 0">
        <button class="btn btn-secondary" data-preset="30">Last 30 days</button>
        <button class="btn btn-secondary" data-preset="182">Last 6 months</button>
        <button class="btn btn-secondary" data-preset="365">Last year</button>
        <button class="btn btn-translucent" data-preset="all">All time</button>
      </div>
      <div style="display:flex;gap:8px;justify-content:flex-end">
        <button id="d-cancel" class="btn btn-translucent">Cancel</button>
        <button id="d-apply" class="btn btn-primary">Apply dates</button>
      </div>
    </dialog>
  </div>`}function O(e){return new Date(e.getFullYear(),e.getMonth(),1)}function he(e){const a=/^(\d{4})-(\d{2})-(\d{2})/.exec(e);if(!a)return null;const n=new Date(Number(a[1]),Number(a[2])-1,Number(a[3]));return isNaN(n.getTime())?null:n}function be(e,a){var D,T,$,L,q,o,f;const n=e.querySelector("#filters-btn");n==null||n.addEventListener("click",c=>{c.stopPropagation(),t.filtersOpen=!t.filtersOpen,a()});const i=c=>{var v;return((v=e.querySelector(`#${c}`))==null?void 0:v.value)??""},s=c=>{var v;return((v=e.querySelector(`#${c}`))==null?void 0:v.checked)??!1},r=e.querySelector("#date-dialog");let l=O(new Date),u="",d="";const h=()=>{const c=r==null?void 0:r.querySelector("#d-summary");c&&(c.textContent=u||d?`${u||"…"} → ${d||"…"}`:"All time. Click a day for start, again for end.")},m=()=>{const c=r==null?void 0:r.querySelector("#cal-grid"),v=r==null?void 0:r.querySelector("#cal-title");if(!c||!v||!r)return;v.textContent=`${ue[l.getMonth()]} ${l.getFullYear()}`;const k=N(new Date),Z=new Date(l.getFullYear(),l.getMonth(),1).getDay(),ee=new Date(l.getFullYear(),l.getMonth()+1,0).getDate();let H=pe.map(y=>`<span class="cal-dow">${y}</span>`).join("");for(let y=0;y<Z;y++)H+="<span></span>";for(let y=1;y<=ee;y++){const w=N(new Date(l.getFullYear(),l.getMonth(),y)),S=w===u,G=w===d&&d!==u,te=u&&d&&w>u&&w<d,ae=["cal-day",S||G?"endpoint":"",te?"in-range":"",w===k?"today":""].filter(Boolean).join(" ");H+=`<button class="${ae}" data-day="${w}" role="gridcell" aria-label="${w}${S?", range start":G?", range end":""}">${y}</button>`}c.innerHTML=H,c.querySelectorAll("button[data-day]").forEach(y=>{y.addEventListener("click",w=>{w.preventDefault();const S=y.dataset.day;!u||u&&d?(u=S,d=""):S<u?(d=u,u=S):d=S,m()})}),h()},g=()=>{if(!r)return;u=/^\d{4}-\d{2}-\d{2}/.test(t.since)?t.since.slice(0,10):"",d=/^\d{4}-\d{2}-\d{2}/.test(t.until)?t.until.slice(0,10):"";const c=he(u)??new Date;l=O(c),m(),r.showModal()};(D=e.querySelector("#f-dates"))==null||D.addEventListener("click",g),(T=r==null?void 0:r.querySelector("#cal-prev"))==null||T.addEventListener("click",c=>{c.preventDefault(),l=new Date(l.getFullYear(),l.getMonth()-1,1),m()}),($=r==null?void 0:r.querySelector("#cal-next"))==null||$.addEventListener("click",c=>{c.preventDefault(),l=new Date(l.getFullYear(),l.getMonth()+1,1),m()}),r==null||r.querySelectorAll("button[data-preset]").forEach(c=>{c.addEventListener("click",v=>{if(v.preventDefault(),c.dataset.preset==="all")u="",d="";else{const k=new Date;k.setDate(k.getDate()-Number(c.dataset.preset)),u=N(k),d="",l=O(k)}m()})});const A=()=>{const c=e.querySelector("#f-dates");c&&(c.textContent=t.since||t.until?`${t.since||"…"} → ${t.until||"…"}`:"All time 📅")};(L=e.querySelector("#d-apply"))==null||L.addEventListener("click",c=>{c.preventDefault(),t.since=u,t.until=d,r==null||r.close(),A()}),(q=e.querySelector("#d-cancel"))==null||q.addEventListener("click",c=>{c.preventDefault(),r==null||r.close()}),(o=e.querySelector("#f-apply"))==null||o.addEventListener("click",()=>{t.rev=i("f-rev")||"HEAD",t.path=i("f-path"),t.author=i("f-author"),t.nauthor=i("f-nauthor"),t.email=s("f-email"),t.merges=s("f-merges"),t.hidden=s("f-hidden"),t.filtersOpen=!1,a()}),(f=e.querySelector("#f-clear"))==null||f.addEventListener("click",()=>{t.rev="HEAD",t.path="",t.since="",t.until="",t.author="",t.nauthor="",t.email=!1,t.merges=!1,t.hidden=!1,t.filtersOpen=!1,a()})}function ge(){return`
  <div class="guide">
    <button id="guide-back" class="btn btn-secondary">← Back</button>
    <p class="caption" style="color:var(--muted);margin:32px 0 8px">Guide</p>
    <h1 class="display-lg">What can GitWho do?</h1>
    <p class="body-lg" style="color:var(--muted)">Three views over your git history, plus the CLI behind them.</p>

    <section class="grid grid-3" data-aos="fade-up">
      <div class="card">
        <p class="headline">Table</p>
        <p class="body-sm" style="color:var(--muted)">Sortable ledger of every author.</p>
      </div>
      <div class="card">
        <p class="headline">Tree</p>
        <p class="body-sm" style="color:var(--muted)">File browser. Top contributor per node.</p>
      </div>
      <div class="card">
        <p class="headline">History</p>
        <p class="body-sm" style="color:var(--muted)">Bar chart. Winner and totals per period.</p>
      </div>
    </section>

    <section data-aos="fade-up">
      <h2 class="display-md">Prefer the terminal?</h2>
      <p class="body" style="color:var(--muted)">Same analysis, no browser:</p>
      <pre class="code"><span class="c"># Install the CLI (Go, or from source)</span>
go install github.com/GrrrGe/git-who@latest
git clone https://github.com/GrrrGe/git-who.git && cd git-who && make build

<span class="c"># Rank authors by commits, lines, files, last/first edit</span>
git who table -l -n 10
git who tree --author "Jane Doe" --since "6 months ago"
git who hist --since 2024-01-01

<span class="c"># Machine-readable output for scripting</span>
git who table --json | jq '.authors[0]'
git who tree --json | jq '.root.children[].name'
git who hist --json | jq '.buckets[].period'

<span class="c"># Serve this UI locally</span>
git-who serve --repo /path/to/repo</pre>
    </section>
  </div>`}function ve(e,a){var n;(n=e.querySelector("#guide-back"))==null||n.addEventListener("click",a)}const ye='<span class="t-git">Git</span><span class="t-who">Who</span><a id="brand-q" class="t-q" href="#" aria-label="Open the guide: what can GitWho do?">?</a>';function we(e,a){var i;const n=e.querySelector("#wordmark");n&&(n.innerHTML=ye,(i=n.querySelector("#brand-q"))==null||i.addEventListener("click",s=>{s.preventDefault(),a()}))}function $e(){const e=t.analyzing,a=t.analyzeError?`<p class="error" role="alert">${p(t.analyzeError)}</p>`:"";return`
  <div class="landing">
    <h1 id="wordmark" class="display-xxl brand-title" aria-label="GitWho?"></h1>
    <p class="subhead sub" data-aos="fade-up" data-aos-delay="150">Who wrote this code?!</p>
    <form id="landing-form" class="landing-form" data-aos="fade-up" data-aos-delay="250">
      <div class="input-group level-2">
        <input id="landing-input" type="text" value="${p(t.landingInput)}"
          placeholder="Paste a GitHub link or local path…"
          aria-label="GitHub link or local repo path" ${e?"disabled":""} />
        <button class="btn btn-primary" type="submit" ${e?"disabled":""}>${e?"Cloning…":"Analyze"}</button>
      </div>
    </form>
    ${a}
    <button id="howto" class="howto-link" data-aos="fade-up" data-aos-delay="350">How to use GitWho →</button>
  </div>`}function Se(e,a,n){var r;we(e,n);const i=e.querySelector("#landing-form"),s=e.querySelector("#landing-input");t.analyzing||s==null||s.focus(),i==null||i.addEventListener("submit",l=>{l.preventDefault();const u=((s==null?void 0:s.value)??"").trim();u&&a(u)}),(r=e.querySelector("#howto"))==null||r.addEventListener("click",n)}function x(e,a,n){return`<button class="tab" data-mode="${e}" aria-pressed="${t.mode===e}" title="${n}">${a}</button>`}function Le(){const e=(a,n)=>`<button class="tab" data-view="${a}" aria-pressed="${t.view===a}">${n}</button>`;return`
  <div class="topbar">
    <button class="brand btn-translucent brand-title" id="brand-home" aria-label="Back to home" style="border:none;cursor:pointer;font-size:22px"><span class="t-git">Git</span><span class="t-who">Who</span></button>
    <button id="brand-q" class="t-q btn-translucent" aria-label="Open the guide" style="border:none;cursor:pointer;font-size:22px;font-family:var(--font-display)">?</button>
    <span class="body-sm" style="color:var(--muted)" title="${p(t.repo)}">${p(t.repoName||t.repo)}</span>
    <span class="spacer"></span>
    <span class="popover-wrap">${fe()}${me()}</span>
    <button id="new-repo" class="btn btn-secondary">Change repo</button>
    <button id="theme" class="btn-icon" aria-label="Toggle theme">◐</button>
  </div>
  <div class="wrap">
    <div class="toolbar view-navigation">
      <div class="tabs" role="group" aria-label="Views">
      ${e("table","Table")} ${e("tree","Tree")} ${e("hist","History")}
      </div>
      <div class="tabs mode-tabs" role="group" aria-label="Rank by">
      ${x("commits","Commits","default")} ${x("lines","Lines","-l")}
      ${x("files","Files","-f")} ${x("last_modified","Last edit","-m")}
      ${x("first_modified","First edit","-c")}
      </div>
    </div>
    <div id="view" role="region" aria-label="Repository results"><p class="legend">Loading…</p></div>
  </div>`}function ke(e,a){const n=a.buckets,i=Math.max(1,...n.map(l=>l.total)),s=a.buckets.reduce((l,u)=>u.value>((l==null?void 0:l.value)??-1)?u:l,a.buckets[0]),r=n.map(l=>{const u=l.value/i*100,d=(l.total-l.value)/i*100,h=`${l.period}: ${l.author.name||"(no commits)"} ${l.value}/${l.total}`,m=l.author.name?`<span class="dot" style="background:${M(l.author.name)}" aria-hidden="true"></span>${p(l.author.name)} (${l.value}/${l.total})`:'<span style="color:var(--muted)">no commits</span>';return`<div class="hist-row" role="img" aria-label="${p(h)}">
      <span>${p(l.period)}</span>
      <span class="hist-bar" aria-hidden="true"><span class="win" style="width:${u}%"></span><span class="rest" style="width:${d}%"></span></span>
      <span class="who">${m}</span>
    </div>`}).join("");e.innerHTML=`
    ${s?`<div class="card spotlight spotlight-coral" style="margin-bottom:16px">
      <p class="caption">Peak period · ${p(s.period)}</p>
      <h3>${p(s.author.name||"-")}</h3>
      <p class="body">${s.value.toLocaleString()} of ${s.total.toLocaleString()} in ${p(s.period)}</p>
    </div>`:""}
    <p class="legend">Solid bar: winner share. Faint bar: period total.</p>
    <div class="card" aria-label="History bar chart">${r||"<p>No history.</p>"}</div>`}function z(e,a){return a==="lines"?e.lines_added+e.lines_removed:a==="files"?e.files:e.commits}function I(e){const a=e.authors.filter(i=>{const s=t.tableFilter.toLowerCase();return!s||i.name.toLowerCase().includes(s)||i.email.toLowerCase().includes(s)}),n=t.tableSort||t.mode;return a.sort((i,s)=>{let r=0;return n==="name"?r=i.name.localeCompare(s.name):n==="commits"?r=i.commits-s.commits:n==="files"?r=i.files-s.files:n==="lines"?r=i.lines_added+i.lines_removed-(s.lines_added+s.lines_removed):n==="last_edit"?r=+new Date(i.last_edit)-+new Date(s.last_edit):n==="first_edit"?r=+new Date(i.first_edit)-+new Date(s.first_edit):r=z(i,t.mode)-z(s,t.mode),r*t.tableSortDir}),a}function P(e){return e.length?e.map(a=>`
    <tr>
      <td><span class="dot" style="background:${M(a.name)}" aria-hidden="true"></span>${p(a.name)}<br/><small style="color:var(--muted)">${p(a.email)}</small></td>
      <td>${a.commits.toLocaleString()}</td>
      <td>${a.files.toLocaleString()}</td>
      <td><span class="check">+${a.lines_added.toLocaleString()}</span> / <span style="color:var(--danger)">-${a.lines_removed.toLocaleString()}</span></td>
      <td>${_(a.last_edit)}</td>
      <td>${_(a.first_edit)}</td>
    </tr>`).join(""):'<tr><td colspan="6">No authors.</td></tr>'}function Ee(e,a,n){const i=I(a),s=i.slice(0,3),r=s.length?`<div class="grid grid-3" style="margin-bottom:16px">
        ${s.map((o,f)=>`
          <div class="card ${f===0?"card-featured level-2":""}">
            <p class="caption" style="color:var(--muted)">#${f+1} · ${z(o,t.mode).toLocaleString()}</p>
            <p class="headline"><span class="dot" style="background:${M(o.name)}" aria-hidden="true"></span>${p(o.name)}</p>
            <p class="body-sm" style="color:var(--muted)">${o.commits.toLocaleString()} commits · ${o.files.toLocaleString()} files · +${o.lines_added.toLocaleString()} / -${o.lines_removed.toLocaleString()}</p>
          </div>`).join("")}
      </div>`:"",u=[["name","Author"],["commits","Commits"],["files","Files"],["lines","Lines (+/-)"],["last_edit","Last edit"],["first_edit","First edit"]].map(([o,f])=>{const v=(t.tableSort||t.mode)===o?t.tableSortDir===-1?" ▼":" ▲":"";return`<th><button data-sort="${o}" aria-label="Sort by ${f}">${f}${v}</button></th>`}).join("");e.innerHTML=`
    ${r}
    <div class="toolbar">
      <div class="field suggest-wrap grow">Filter authors
        <input id="tf" class="input search-lg" type="search"
          value="${p(t.tableFilter)}" placeholder="name or email"
          role="combobox" aria-expanded="false" aria-controls="suggest"
          aria-label="Filter authors" autocomplete="off" />
        <div id="suggest" class="suggest" role="listbox" aria-label="Author suggestions" hidden></div>
      </div>
    </div>
    <div class="card" style="padding:0;overflow:auto">
    <table class="data" aria-label="Contributions by author">
      <thead><tr>${u}</tr></thead>
      <tbody id="author-rows">${P(i)}</tbody>
    </table></div>`,e.querySelectorAll("button[data-sort]").forEach(o=>{o.onclick=()=>{const f=o.dataset.sort;(t.tableSort||t.mode)===f?t.tableSortDir*=-1:(t.tableSort=f,t.tableSortDir=-1),n()}});const d=e.querySelector("#tf"),h=e.querySelector("#author-rows"),m=e.querySelector("#suggest");let g=-1;const A=()=>{const o=t.tableFilter.toLowerCase().trim();return o?a.authors.filter(f=>f.name.toLowerCase().includes(o)||f.email.toLowerCase().includes(o)).sort((f,c)=>D(f)-D(c)).slice(0,8):a.authors.slice(0,8)},D=o=>{const f=t.tableFilter.toLowerCase().trim();return o.name.toLowerCase().startsWith(f)?0:o.email.toLowerCase().startsWith(f)?1:2},T=o=>{const f=t.tableFilter.trim();if(!f)return p(o);const c=o.toLowerCase().indexOf(f.toLowerCase());return c<0?p(o):p(o.slice(0,c))+'<b class="hl">'+p(o.slice(c,c+f.length))+"</b>"+p(o.slice(c+f.length))},$=()=>{if(!m||!d)return;const o=A();o.length?(m.innerHTML=o.map((f,c)=>`
        <button class="suggest-item${c===g?" active":""}" role="option"
          aria-selected="${c===g}" data-i="${c}">
          <span class="dot" style="background:${M(f.name)}" aria-hidden="true"></span>
          <span>${T(f.name)}</span>
          <small style="color:var(--muted)">${p(f.email)}</small>
        </button>`).join(""),m.querySelectorAll(".suggest-item").forEach(f=>{f.addEventListener("mousedown",c=>{c.preventDefault(),q(o[Number(f.dataset.i)])})})):m.innerHTML='<div class="suggest-empty">No matching authors.</div>',m.hidden=!1,d.setAttribute("aria-expanded","true")},L=()=>{!m||!d||(m.hidden=!0,d.setAttribute("aria-expanded","false"),g=-1)},q=o=>{t.tableFilter=o.name,d&&(d.value=o.name),h&&(h.innerHTML=P(I(a))),L()};d==null||d.addEventListener("input",()=>{t.tableFilter=d.value,g=-1,h&&(h.innerHTML=P(I(a))),$()}),d==null||d.addEventListener("focus",()=>{g=-1,$()}),d==null||d.addEventListener("keydown",o=>{if(m!=null&&m.hidden)return;const f=A();o.key==="ArrowDown"?(o.preventDefault(),g=Math.min(g+1,f.length-1),$()):o.key==="ArrowUp"?(o.preventDefault(),g=Math.max(g-1,-1),$()):o.key==="Enter"&&g>=0&&f[g]?(o.preventDefault(),q(f[g])):o.key==="Escape"&&L()}),d==null||d.addEventListener("blur",()=>L())}const E=new Set;let B="";function V(e){return t.mode==="lines"?`+${e.metrics.lines_added.toLocaleString()} / −${e.metrics.lines_removed.toLocaleString()}`:t.mode==="files"?e.metrics.files.toLocaleString():t.mode==="last_modified"?_(e.metrics.last_edit):t.mode==="first_modified"?_(e.metrics.first_edit):e.metrics.commits.toLocaleString()}function j(e){return(e.children||[]).filter(a=>t.hidden||a.in_work_tree)}function Y(e,a,n){const i=e.is_dir?'<path d="M2 5h5l2 2h13v12H2z"/>':'<path d="M5 2h9l5 5v15H5z"/><path d="M14 2v6h5"/>';return`<span class="tree-name" style="--depth:${a}" title="${p(e.path)}">
    <span class="tree-chevron ${n?"":"tree-chevron-empty"}" aria-hidden="true">›</span>
    <svg class="tree-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true">${i}</svg>
    <span class="path">${p(e.name)}${e.is_dir?"/":""}</span>
    ${e.in_work_tree?"":'<span class="tree-deleted">deleted</span>'}
    </span>
    <span class="tree-author" title="${p(e.author.name)}"><span class="dot" style="background:${M(e.author.name)}" aria-hidden="true"></span>${p(e.author.name||"No author")}</span>
    <span class="tree-metric">${p(V(e))}</span>`}function X(e,a){const n=j(e);return!e.is_dir||!n.length?`<div class="tree-row">${Y(e,a,!1)}</div>`:`<details class="tree-dir" data-path="${p(e.path)}" ${E.has(e.path)?"open":""}>
    <summary class="tree-row">${Y(e,a,!0)}</summary>
    <div class="tree-kids">${n.map(i=>X(i,a+1)).join("")}</div>
  </details>`}function De(e,a,n){var u,d;B!==t.repo&&(E.clear(),B=t.repo);const i=a.root;if(!i||!j(i).length){e.innerHTML='<p class="legend">No files match the current filters.</p>';return}const s={commits:"Commits",lines:"Lines (+ / −)",files:"Files",last_modified:"Last edit",first_modified:"First edit"}[t.mode];e.innerHTML=`
    <section class="tree-browser" aria-label="Files by top contributor">
      <div class="tree-toolbar">
        <div class="tree-root"><strong>${p(i.name==="."?t.repoName||"repo":i.name)}/</strong>
          <span>${p(i.author.name)} <span class="tree-root-metric">${p(V(i))}</span></span></div>
        <div class="tree-actions"><button id="expand" class="btn btn-secondary">Expand all</button>
          <button id="collapse" class="btn btn-secondary">Collapse all</button></div>
      </div>
      <div class="tree-scroll">
        <div class="tree-content">
          <div class="tree-head"><span>File</span><span>Top contributor</span><span>${s}</span></div>
          ${j(i).map(h=>X(h,0)).join("")}
        </div>
      </div>
    </section>`;const r=e.querySelectorAll("details.tree-dir");r.forEach(h=>h.addEventListener("toggle",()=>{h.open?E.add(h.dataset.path):E.delete(h.dataset.path)}));const l=h=>r.forEach(m=>{m.open=h,h?E.add(m.dataset.path):E.delete(m.dataset.path)});(u=e.querySelector("#expand"))==null||u.addEventListener("click",()=>l(!0)),(d=e.querySelector("#collapse"))==null||d.addEventListener("click",()=>l(!1))}const U={table:["Reading commit history","Ranking authors"],tree:["Reading commit history","Building file tree","Ranking nodes"],hist:["Reading commit history","Bucketing periods"]},qe={table:"Indexing authors",tree:"Indexing file tree",hist:"Indexing history"};function xe(e,a){var u;const n=p(t.repoName||t.repo);if(e.innerHTML=`
    <div class="indexing" role="status" aria-live="polite" data-aos="fade-up">
      <h2 class="display-md">${qe[a]??"Indexing"}</h2>
      <p class="legend">${n}</p>
      <div class="index-bar" aria-hidden="true"><span></span></div>
      <p class="status body-sm" id="index-status">${((u=U[a])==null?void 0:u[0])??"Working"}…</p>
      <div class="index-dots" aria-hidden="true"><span></span><span></span><span></span></div>
    </div>`,window.matchMedia("(prefers-reduced-motion: reduce)").matches)return()=>{};const i=U[a]??["Working"];let s=0;const r=e.querySelector("#index-status"),l=window.setInterval(()=>{s=(s+1)%i.length,r&&(r.textContent=`${i[s]}…`)},900);return()=>window.clearInterval(l)}async function Me(e){const a=xe(e,t.view);try{t.view==="table"?Ee(e,await ie(),b):t.view==="tree"?De(e,await le(),b):ke(e,await oe())}catch(n){e.innerHTML=`<p class="error" role="alert">Error: ${p(n.message)}</p>`}finally{a()}}function J(e){t.guideFrom=e,t.screen="guide",b()}function Ae(){t.screen=t.guideFrom==="app"&&t.repo?"app":"landing",b()}function b(){var a,n,i,s;const e=document.getElementById("app");if(t.screen==="guide"){e.innerHTML=ge(),ve(e,Ae),C();return}if(!t.repo){t.screen="landing",e.innerHTML=$e(),Se(e,Q,()=>J("landing")),C();return}t.screen="app",e.innerHTML=Le(),(a=e.querySelector("#brand-home"))==null||a.addEventListener("click",()=>{t.repo="",t.repoName="",t.analyzeError="",b()}),(n=e.querySelector("#brand-q"))==null||n.addEventListener("click",()=>J("app")),(i=e.querySelector("#new-repo"))==null||i.addEventListener("click",()=>{t.repo="",t.repoName="",t.analyzeError="",b()}),(s=e.querySelector("#theme"))==null||s.addEventListener("click",()=>{const r=document.documentElement,u=(r.getAttribute("data-theme")?r.getAttribute("data-theme")==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches)?"light":"dark";r.setAttribute("data-theme",u),localStorage.setItem("git-who-theme",u)}),e.querySelectorAll("button[data-view]").forEach(r=>{r.onclick=()=>{t.view=r.dataset.view,b()}}),e.querySelectorAll("button[data-mode]").forEach(r=>{r.onclick=()=>{t.mode=r.dataset.mode,t.tableSort="",b()}}),be(e,b),document.onpointerdown=r=>{t.filtersOpen&&!r.target.closest(".popover-wrap")&&(t.filtersOpen=!1,b())},document.onkeydown=r=>{r.key==="Escape"&&t.filtersOpen&&(t.filtersOpen=!1,b())},Me(e.querySelector("#view")),C()}async function Q(e){t.analyzing=!0,t.analyzeError="",t.landingInput=e,b();try{const a=await ce(e);t.repo=a.repo,t.repoName=a.name,t.collapsed.clear(),t.analyzing=!1;const n=new URL(location.href);n.searchParams.set("repo",e),history.replaceState(null,"",n),b()}catch(a){t.analyzing=!1,t.analyzeError=a.message,b()}}function Te(){re(),ne();const e=localStorage.getItem("git-who-theme");e&&document.documentElement.setAttribute("data-theme",e);const n=new URLSearchParams(location.search).get("repo");if(n){t.landingInput=n,Q(n);return}b()}Te();
