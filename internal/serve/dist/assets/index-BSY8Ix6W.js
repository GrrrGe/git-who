(function(){const a=document.createElement("link").relList;if(a&&a.supports&&a.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))i(s);new MutationObserver(s=>{for(const n of s)if(n.type==="childList")for(const l of n.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&i(l)}).observe(document,{childList:!0,subtree:!0});function r(s){const n={};return s.integrity&&(n.integrity=s.integrity),s.referrerPolicy&&(n.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?n.credentials="include":s.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function i(s){if(s.ep)return;s.ep=!0;const n=r(s);fetch(s.href,n)}})();const z=()=>window.matchMedia("(prefers-reduced-motion: reduce)").matches;let P=!1;function ae(){P||!window.AOS||z()||(window.AOS.init({duration:600,easing:"ease-out",once:!0,offset:40}),P=!0)}function _(){P&&window.AOS&&!z()&&window.AOS.refresh()}function ne(){const e=()=>{document.querySelectorAll(".topbar").forEach(a=>{a.classList.toggle("scrolled",window.scrollY>8)})};window.addEventListener("scroll",e,{passive:!0}),e()}function re(e,a,r,i){if(z()){i();return}e.classList.add("typing");let s=0;const n=()=>{s++,e.textContent=a.slice(0,s),s<a.length?window.setTimeout(n,r):(e.classList.remove("typing"),i())};n()}const t={repo:"",repoName:"",rev:"HEAD",path:"",mode:"commits",view:"table",since:"",until:"",author:"",nauthor:"",email:!1,merges:!1,hidden:!1,tableSort:"",tableSortDir:-1,tableFilter:"",collapsed:new Set,filtersOpen:!1,screen:"landing",guideFrom:"landing",landingInput:"",analyzing:!1,analyzeError:""};function f(e){return e.replace(/[&<>"']/g,a=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[a])}function x(e){let a=0;for(let r=0;r<e.length;r++)a=a*31+e.charCodeAt(r)>>>0;return`hsl(${a%360} 65% 50%)`}function A(e){if(!e||e.startsWith("0001-"))return"-";const a=new Date(e);return isNaN(a.getTime())?e:a.toLocaleDateString()}function se(){let e=0;return t.rev&&t.rev!=="HEAD"&&e++,t.path&&e++,t.since&&e++,t.until&&e++,t.author&&e++,t.nauthor&&e++,t.email&&e++,t.merges&&e++,t.hidden&&e++,e}function j(){const e=new URLSearchParams;return t.repo&&e.set("repo",t.repo),t.rev&&e.set("rev",t.rev),t.path&&e.set("path",t.path),e.set("mode",t.mode),t.since&&e.set("since",t.since),t.until&&e.set("until",t.until),t.author&&e.set("author",t.author),t.nauthor&&e.set("nauthor",t.nauthor),t.email&&e.set("email","1"),t.merges&&e.set("merges","1"),t.hidden&&e.set("hidden","1"),e}async function H(e,a){const r=await fetch(`/api/${e}?${a}`),i=await r.json();if(!r.ok)throw new Error(i.error||`HTTP ${r.status}`);return i}function ie(){return H("table",j())}function le(){return H("tree",j())}function oe(){return H("hist",j())}function ce(e){const a=new URLSearchParams;return a.set("repo",e),H("resolve",a)}function de(){return t.since||t.until?`${t.since||"…"} → ${t.until||"…"}`:"All time 📅"}function C(e){return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,"0")}-${String(e.getDate()).padStart(2,"0")}`}const ue=["January","February","March","April","May","June","July","August","September","October","November","December"],pe=["Su","Mo","Tu","We","Th","Fr","Sa"];function fe(){const e=se(),a=e?` <span class="badge" aria-label="${e} active filters">${e}</span>`:"";return`<button id="filters-btn" class="btn btn-secondary" aria-expanded="${t.filtersOpen}" aria-haspopup="dialog">Filters${a}</button>`}function me(){if(!t.filtersOpen)return"";const e=a=>a?"checked":"";return`
  <div class="popover" role="dialog" aria-label="Analysis filters">
    <div class="grid grid-2">
      <label class="field">Revision / branch <input id="f-rev" class="input" value="${f(t.rev)}" /></label>
      <label class="field">Path filter <input id="f-path" class="input" value="${f(t.path)}" placeholder="subdir/" /></label>
      <label class="field">Date range
        <button id="f-dates" class="input" style="text-align:left;cursor:pointer" aria-haspopup="dialog">${f(de())}</button>
      </label>
      <label class="field">Author <input id="f-author" class="input" value="${f(t.author)}" placeholder="--author" /></label>
      <label class="field">Exclude author <input id="f-nauthor" class="input" value="${f(t.nauthor)}" placeholder="--nauthor" /></label>
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
  </div>`}function N(e){return new Date(e.getFullYear(),e.getMonth(),1)}function he(e){const a=/^(\d{4})-(\d{2})-(\d{2})/.exec(e);if(!a)return null;const r=new Date(Number(a[1]),Number(a[2])-1,Number(a[3]));return isNaN(r.getTime())?null:r}function be(e,a){var E,M,$,L,D,o,p;const r=e.querySelector("#filters-btn");r==null||r.addEventListener("click",c=>{c.stopPropagation(),t.filtersOpen=!t.filtersOpen,a()});const i=c=>{var g;return((g=e.querySelector(`#${c}`))==null?void 0:g.value)??""},s=c=>{var g;return((g=e.querySelector(`#${c}`))==null?void 0:g.checked)??!1},n=e.querySelector("#date-dialog");let l=N(new Date),u="",d="";const w=()=>{const c=n==null?void 0:n.querySelector("#d-summary");c&&(c.textContent=u||d?`${u||"…"} → ${d||"…"}`:"All time. Click a day for start, again for end.")},m=()=>{const c=n==null?void 0:n.querySelector("#cal-grid"),g=n==null?void 0:n.querySelector("#cal-title");if(!c||!g||!n)return;g.textContent=`${ue[l.getMonth()]} ${l.getFullYear()}`;const k=C(new Date),Q=new Date(l.getFullYear(),l.getMonth(),1).getDay(),Z=new Date(l.getFullYear(),l.getMonth()+1,0).getDate();let F=pe.map(y=>`<span class="cal-dow">${y}</span>`).join("");for(let y=0;y<Q;y++)F+="<span></span>";for(let y=1;y<=Z;y++){const v=C(new Date(l.getFullYear(),l.getMonth(),y)),S=v===u,R=v===d&&d!==u,ee=u&&d&&v>u&&v<d,te=["cal-day",S||R?"endpoint":"",ee?"in-range":"",v===k?"today":""].filter(Boolean).join(" ");F+=`<button class="${te}" data-day="${v}" role="gridcell" aria-label="${v}${S?", range start":R?", range end":""}">${y}</button>`}c.innerHTML=F,c.querySelectorAll("button[data-day]").forEach(y=>{y.addEventListener("click",v=>{v.preventDefault();const S=y.dataset.day;!u||u&&d?(u=S,d=""):S<u?(d=u,u=S):d=S,m()})}),w()},b=()=>{if(!n)return;u=/^\d{4}-\d{2}-\d{2}/.test(t.since)?t.since.slice(0,10):"",d=/^\d{4}-\d{2}-\d{2}/.test(t.until)?t.until.slice(0,10):"";const c=he(u)??new Date;l=N(c),m(),n.showModal()};(E=e.querySelector("#f-dates"))==null||E.addEventListener("click",b),(M=n==null?void 0:n.querySelector("#cal-prev"))==null||M.addEventListener("click",c=>{c.preventDefault(),l=new Date(l.getFullYear(),l.getMonth()-1,1),m()}),($=n==null?void 0:n.querySelector("#cal-next"))==null||$.addEventListener("click",c=>{c.preventDefault(),l=new Date(l.getFullYear(),l.getMonth()+1,1),m()}),n==null||n.querySelectorAll("button[data-preset]").forEach(c=>{c.addEventListener("click",g=>{if(g.preventDefault(),c.dataset.preset==="all")u="",d="";else{const k=new Date;k.setDate(k.getDate()-Number(c.dataset.preset)),u=C(k),d="",l=N(k)}m()})});const T=()=>{const c=e.querySelector("#f-dates");c&&(c.textContent=t.since||t.until?`${t.since||"…"} → ${t.until||"…"}`:"All time 📅")};(L=e.querySelector("#d-apply"))==null||L.addEventListener("click",c=>{c.preventDefault(),t.since=u,t.until=d,n==null||n.close(),T()}),(D=e.querySelector("#d-cancel"))==null||D.addEventListener("click",c=>{c.preventDefault(),n==null||n.close()}),(o=e.querySelector("#f-apply"))==null||o.addEventListener("click",()=>{t.rev=i("f-rev")||"HEAD",t.path=i("f-path"),t.author=i("f-author"),t.nauthor=i("f-nauthor"),t.email=s("f-email"),t.merges=s("f-merges"),t.hidden=s("f-hidden"),t.filtersOpen=!1,a()}),(p=e.querySelector("#f-clear"))==null||p.addEventListener("click",()=>{t.rev="HEAD",t.path="",t.since="",t.until="",t.author="",t.nauthor="",t.email=!1,t.merges=!1,t.hidden=!1,t.filtersOpen=!1,a()})}function ge(){return`
  <div class="guide">
    <button id="guide-back" class="btn btn-secondary">← Back</button>
    <p class="caption" style="color:var(--muted);margin:32px 0 8px">Guide</p>
    <h1 class="display-lg">What can GitWho do?</h1>
    <p class="body-lg" style="color:var(--muted)">Three views over your git history, plus the CLI behind them.</p>

    <section data-aos="fade-up">
      <div class="spotlight">
        <p class="caption">Table</p>
        <h3>Every author, ranked</h3>
        <p class="body">Commits, files, lines (+/-) per author. Sortable and filterable.</p>
      </div>
    </section>

    <section data-aos="fade-up">
      <div class="spotlight spotlight-orange">
        <p class="caption">Tree &amp; History</p>
        <h3>Own every directory</h3>
        <p class="body">Top contributor per node, color-coded. Bar-chart timeline included.</p>
      </div>
    </section>

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
  </div>`}function ye(e,a){var r;(r=e.querySelector("#guide-back"))==null||r.addEventListener("click",a)}const ve='<span class="t-git">Git</span><span class="t-who">Who</span><a id="brand-q" class="t-q" href="#" aria-label="Open the guide: what can GitWho do?">?</a>';function G(e,a){var i;const r=e.querySelector("#wordmark");r&&(r.innerHTML=ve,(i=r.querySelector("#brand-q"))==null||i.addEventListener("click",s=>{s.preventDefault(),a()}))}function we(){const e=t.analyzing,a=t.analyzeError?`<p class="error" role="alert">${f(t.analyzeError)}</p>`:"";return`
  <div class="landing">
    <h1 id="wordmark" class="display-xxl brand-title" aria-label="GitWho?"></h1>
    <p class="subhead sub" data-aos="fade-up" data-aos-delay="150">Who wrote this code?!</p>
    <form id="landing-form" class="landing-form" data-aos="fade-up" data-aos-delay="250">
      <div class="input-group level-2">
        <input id="landing-input" type="text" value="${f(t.landingInput)}"
          placeholder="Paste a GitHub link or local path…"
          aria-label="GitHub link or local repo path" ${e?"disabled":""} />
        <button class="btn btn-primary" type="submit" ${e?"disabled":""}>${e?"Cloning…":"Analyze"}</button>
      </div>
    </form>
    ${a}
    <button id="howto" class="howto-link" data-aos="fade-up" data-aos-delay="350">How to use GitWho →</button>
  </div>`}function $e(e,a,r){var l;const i=e.querySelector("#wordmark");i&&!t.analyzing?re(i,"GitWho?",110,()=>G(e,r)):i&&G(e,r);const s=e.querySelector("#landing-form"),n=e.querySelector("#landing-input");t.analyzing||n==null||n.focus(),s==null||s.addEventListener("submit",u=>{u.preventDefault();const d=((n==null?void 0:n.value)??"").trim();d&&a(d)}),(l=e.querySelector("#howto"))==null||l.addEventListener("click",r)}function q(e,a,r){return`<button class="tab" data-mode="${e}" aria-pressed="${t.mode===e}" title="${r}">${a}</button>`}function Se(){const e=(a,r)=>`<button class="tab" data-view="${a}" aria-pressed="${t.view===a}">${r}</button>`;return`
  <div class="topbar">
    <button class="brand btn-translucent brand-title" id="brand-home" aria-label="Back to home" style="border:none;cursor:pointer;font-size:22px"><span class="t-git">Git</span><span class="t-who">Who</span></button>
    <button id="brand-q" class="t-q btn-translucent" aria-label="Open the guide" style="border:none;cursor:pointer;font-size:22px;font-family:var(--font-display)">?</button>
    <span class="body-sm" style="color:var(--muted)" title="${f(t.repo)}">${f(t.repoName||t.repo)}</span>
    <span class="spacer"></span>
    <span class="popover-wrap">${fe()}${me()}</span>
    <button id="new-repo" class="btn btn-secondary">New</button>
    <button id="theme" class="btn-icon" aria-label="Toggle theme">◐</button>
  </div>
  <div class="wrap">
    <div class="toolbar" role="tablist" aria-label="Views">
      ${e("table","Table")} ${e("tree","Tree")} ${e("hist","History")}
      <span class="spacer"></span>
      ${q("commits","Commits","default")} ${q("lines","Lines","-l")}
      ${q("files","Files","-f")} ${q("last_modified","Last edit","-m")}
      ${q("first_modified","First edit","-c")}
    </div>
    <div id="view" role="tabpanel"><p class="legend">Loading…</p></div>
  </div>`}function Le(e,a){const r=a.buckets,i=Math.max(1,...r.map(l=>l.total)),s=a.buckets.reduce((l,u)=>u.value>((l==null?void 0:l.value)??-1)?u:l,a.buckets[0]),n=r.map(l=>{const u=l.value/i*100,d=(l.total-l.value)/i*100,w=`${l.period}: ${l.author.name||"(no commits)"} ${l.value}/${l.total}`,m=l.author.name?`<span class="dot" style="background:${x(l.author.name)}" aria-hidden="true"></span>${f(l.author.name)} (${l.value}/${l.total})`:'<span style="color:var(--muted)">no commits</span>';return`<div class="hist-row" role="img" aria-label="${f(w)}">
      <span>${f(l.period)}</span>
      <span class="hist-bar" aria-hidden="true"><span class="win" style="width:${u}%"></span><span class="rest" style="width:${d}%"></span></span>
      <span class="who">${m}</span>
    </div>`}).join("");e.innerHTML=`
    ${s?`<div class="card spotlight spotlight-coral" style="margin-bottom:16px">
      <p class="caption">Peak period · ${f(s.period)}</p>
      <h3>${f(s.author.name||"-")}</h3>
      <p class="body">${s.value.toLocaleString()} of ${s.total.toLocaleString()} in ${f(s.period)}</p>
    </div>`:""}
    <p class="legend">Solid bar: winner share. Faint bar: period total.</p>
    <div class="card" aria-label="History bar chart">${n||"<p>No history.</p>"}</div>`}function W(e,a){return a==="lines"?e.lines_added+e.lines_removed:a==="files"?e.files:e.commits}function O(e){const a=e.authors.filter(i=>{const s=t.tableFilter.toLowerCase();return!s||i.name.toLowerCase().includes(s)||i.email.toLowerCase().includes(s)}),r=t.tableSort||t.mode;return a.sort((i,s)=>{let n=0;return r==="name"?n=i.name.localeCompare(s.name):r==="commits"?n=i.commits-s.commits:r==="files"?n=i.files-s.files:r==="lines"?n=i.lines_added+i.lines_removed-(s.lines_added+s.lines_removed):r==="last_edit"?n=+new Date(i.last_edit)-+new Date(s.last_edit):r==="first_edit"?n=+new Date(i.first_edit)-+new Date(s.first_edit):n=W(i,t.mode)-W(s,t.mode),n*t.tableSortDir}),a}function I(e){return e.length?e.map(a=>`
    <tr>
      <td><span class="dot" style="background:${x(a.name)}" aria-hidden="true"></span>${f(a.name)}<br/><small style="color:var(--muted)">${f(a.email)}</small></td>
      <td>${a.commits.toLocaleString()}</td>
      <td>${a.files.toLocaleString()}</td>
      <td><span class="check">+${a.lines_added.toLocaleString()}</span> / <span style="color:var(--danger)">-${a.lines_removed.toLocaleString()}</span></td>
      <td>${A(a.last_edit)}</td>
      <td>${A(a.first_edit)}</td>
    </tr>`).join(""):'<tr><td colspan="6">No authors.</td></tr>'}function ke(e,a,r){const i=O(a),s=i.slice(0,3),n=s.length?`<div class="grid grid-3" style="margin-bottom:16px">
        ${s.map((o,p)=>`
          <div class="card ${p===0?"card-featured level-2":""}">
            <p class="caption" style="color:var(--muted)">#${p+1} · ${W(o,t.mode).toLocaleString()}</p>
            <p class="headline"><span class="dot" style="background:${x(o.name)}" aria-hidden="true"></span>${f(o.name)}</p>
            <p class="body-sm" style="color:var(--muted)">${o.commits.toLocaleString()} commits · ${o.files.toLocaleString()} files · +${o.lines_added.toLocaleString()} / -${o.lines_removed.toLocaleString()}</p>
          </div>`).join("")}
      </div>`:"",u=[["name","Author"],["commits","Commits"],["files","Files"],["lines","Lines (+/-)"],["last_edit","Last edit"],["first_edit","First edit"]].map(([o,p])=>{const g=(t.tableSort||t.mode)===o?t.tableSortDir===-1?" ▼":" ▲":"";return`<th><button data-sort="${o}" aria-label="Sort by ${p}">${p}${g}</button></th>`}).join("");e.innerHTML=`
    ${n}
    <div class="toolbar">
      <div class="field suggest-wrap grow">Filter authors
        <input id="tf" class="input search-lg" type="search"
          value="${f(t.tableFilter)}" placeholder="name or email"
          role="combobox" aria-expanded="false" aria-controls="suggest"
          aria-label="Filter authors" autocomplete="off" />
        <div id="suggest" class="suggest" role="listbox" aria-label="Author suggestions" hidden></div>
      </div>
    </div>
    <div class="card" style="padding:0;overflow:auto">
    <table class="data" aria-label="Contributions by author">
      <thead><tr>${u}</tr></thead>
      <tbody id="author-rows">${I(i)}</tbody>
    </table></div>`,e.querySelectorAll("button[data-sort]").forEach(o=>{o.onclick=()=>{const p=o.dataset.sort;(t.tableSort||t.mode)===p?t.tableSortDir*=-1:(t.tableSort=p,t.tableSortDir=-1),r()}});const d=e.querySelector("#tf"),w=e.querySelector("#author-rows"),m=e.querySelector("#suggest");let b=-1;const T=()=>{const o=t.tableFilter.toLowerCase().trim();return o?a.authors.filter(p=>p.name.toLowerCase().includes(o)||p.email.toLowerCase().includes(o)).sort((p,c)=>E(p)-E(c)).slice(0,8):a.authors.slice(0,8)},E=o=>{const p=t.tableFilter.toLowerCase().trim();return o.name.toLowerCase().startsWith(p)?0:o.email.toLowerCase().startsWith(p)?1:2},M=o=>{const p=t.tableFilter.trim();if(!p)return f(o);const c=o.toLowerCase().indexOf(p.toLowerCase());return c<0?f(o):f(o.slice(0,c))+'<b class="hl">'+f(o.slice(c,c+p.length))+"</b>"+f(o.slice(c+p.length))},$=()=>{if(!m||!d)return;const o=T();o.length?(m.innerHTML=o.map((p,c)=>`
        <button class="suggest-item${c===b?" active":""}" role="option"
          aria-selected="${c===b}" data-i="${c}">
          <span class="dot" style="background:${x(p.name)}" aria-hidden="true"></span>
          <span>${M(p.name)}</span>
          <small style="color:var(--muted)">${f(p.email)}</small>
        </button>`).join(""),m.querySelectorAll(".suggest-item").forEach(p=>{p.addEventListener("mousedown",c=>{c.preventDefault(),D(o[Number(p.dataset.i)])})})):m.innerHTML='<div class="suggest-empty">No matching authors.</div>',m.hidden=!1,d.setAttribute("aria-expanded","true")},L=()=>{!m||!d||(m.hidden=!0,d.setAttribute("aria-expanded","false"),b=-1)},D=o=>{t.tableFilter=o.name,d&&(d.value=o.name),w&&(w.innerHTML=I(O(a))),L()};d==null||d.addEventListener("input",()=>{t.tableFilter=d.value,b=-1,w&&(w.innerHTML=I(O(a))),$()}),d==null||d.addEventListener("focus",()=>{b=-1,$()}),d==null||d.addEventListener("keydown",o=>{if(m!=null&&m.hidden)return;const p=T();o.key==="ArrowDown"?(o.preventDefault(),b=Math.min(b+1,p.length-1),$()):o.key==="ArrowUp"?(o.preventDefault(),b=Math.max(b-1,-1),$()):o.key==="Enter"&&b>=0&&p[b]?(o.preventDefault(),D(p[b])):o.key==="Escape"&&L()}),d==null||d.addEventListener("blur",()=>L())}function J(e){return t.mode==="lines"?`(+${e.metrics.lines_added.toLocaleString()} / -${e.metrics.lines_removed.toLocaleString()})`:t.mode==="files"?`(${e.metrics.files.toLocaleString()})`:t.mode==="last_modified"?`(${A(e.metrics.last_edit)})`:t.mode==="first_modified"?`(${A(e.metrics.first_edit)})`:`(${e.metrics.commits.toLocaleString()})`}function K(e){return(e.children||[]).filter(a=>t.hidden||a.in_work_tree)}function B(e,a){return`<span aria-hidden="true">${e.is_dir?"📁":"📄"}</span> <span class="path">${f(a)}</span>
    <span><span class="dot" style="background:${x(e.author.name)}" aria-hidden="true"></span>${f(e.author.name)}</span>
    <span class="metric">${f(J(e))}</span>`}function V(e,a){const r=K(e);if(!e.is_dir||!r.length)return`<div class="tree-row" role="treeitem">${B(e,e.name)}</div>`;const i=a<1?"open":"",s=r.map(n=>V(n,a+1)).join("");return`<details class="tree-dir" ${i}>
    <summary class="tree-row" role="treeitem" aria-expanded="${i?"true":"false"}">${B(e,e.name+"/")}</summary>
    <div class="tree-kids" role="group">${s}</div>
  </div>`}function Ee(e,a,r){var n,l;if(!a.root){e.innerHTML="<p>No commits; tree is empty.</p>";return}const i=a.root,s=K(i);if(!s.length){e.innerHTML="<p>No commits; tree is empty.</p>";return}e.innerHTML=`
    <div class="toolbar">
      <span class="body"><strong>${f(i.name==="."?t.repoName||"repo":i.name)}/</strong>
      <span style="color:var(--muted)">${f(i.author.name)} ${f(J(i))}</span></span>
      <span class="spacer"></span>
      <button id="expand" class="btn btn-secondary">Expand all</button>
      <button id="collapse" class="btn btn-secondary">Collapse all</button>
    </div>
    <div class="card" role="tree" aria-label="File tree by top contributor">
      ${s.map(u=>V(u,0)).join("")}
    </div>`,(n=e.querySelector("#expand"))==null||n.addEventListener("click",()=>{e.querySelectorAll("details.tree-dir").forEach(u=>{u.open=!0})}),(l=e.querySelector("#collapse"))==null||l.addEventListener("click",()=>{e.querySelectorAll("details.tree-dir").forEach(u=>{u.open=!1})})}const Y={table:["Reading commit history","Ranking authors"],tree:["Reading commit history","Building file tree","Ranking nodes"],hist:["Reading commit history","Bucketing periods"]},De={table:"Indexing authors",tree:"Indexing file tree",hist:"Indexing history"};function qe(e,a){var u;const r=f(t.repoName||t.repo);if(e.innerHTML=`
    <div class="indexing" role="status" aria-live="polite" data-aos="fade-up">
      <h2 class="display-md">${De[a]??"Indexing"}</h2>
      <p class="legend">${r}</p>
      <div class="index-bar" aria-hidden="true"><span></span></div>
      <p class="status body-sm" id="index-status">${((u=Y[a])==null?void 0:u[0])??"Working"}…</p>
      <div class="index-dots" aria-hidden="true"><span></span><span></span><span></span></div>
    </div>`,window.matchMedia("(prefers-reduced-motion: reduce)").matches)return()=>{};const i=Y[a]??["Working"];let s=0;const n=e.querySelector("#index-status"),l=window.setInterval(()=>{s=(s+1)%i.length,n&&(n.textContent=`${i[s]}…`)},900);return()=>window.clearInterval(l)}async function xe(e){const a=qe(e,t.view);try{t.view==="table"?ke(e,await ie(),h):t.view==="tree"?Ee(e,await le(),h):Le(e,await oe())}catch(r){e.innerHTML=`<p class="error" role="alert">Error: ${f(r.message)}</p>`}finally{a()}}function U(e){t.guideFrom=e,t.screen="guide",h()}function Te(){t.screen=t.guideFrom==="app"&&t.repo?"app":"landing",h()}function h(){var a,r,i,s;const e=document.getElementById("app");if(t.screen==="guide"){e.innerHTML=ge(),ye(e,Te),_();return}if(!t.repo){t.screen="landing",e.innerHTML=we(),$e(e,X,()=>U("landing")),_();return}t.screen="app",e.innerHTML=Se(),(a=e.querySelector("#brand-home"))==null||a.addEventListener("click",()=>{t.repo="",t.repoName="",t.analyzeError="",h()}),(r=e.querySelector("#brand-q"))==null||r.addEventListener("click",()=>U("app")),(i=e.querySelector("#new-repo"))==null||i.addEventListener("click",()=>{t.repo="",t.repoName="",t.analyzeError="",h()}),(s=e.querySelector("#theme"))==null||s.addEventListener("click",()=>{const n=document.documentElement,l=n.getAttribute("data-theme")==="dark"?"light":"dark";n.setAttribute("data-theme",l),localStorage.setItem("git-who-theme",l)}),e.querySelectorAll("button[data-view]").forEach(n=>{n.onclick=()=>{t.view=n.dataset.view,h()}}),e.querySelectorAll("button[data-mode]").forEach(n=>{n.onclick=()=>{t.mode=n.dataset.mode,t.tableSort="",h()}}),be(e,h),document.onpointerdown=n=>{t.filtersOpen&&!n.target.closest(".popover-wrap")&&(t.filtersOpen=!1,h())},document.onkeydown=n=>{n.key==="Escape"&&t.filtersOpen&&(t.filtersOpen=!1,h())},xe(e.querySelector("#view")),_()}async function X(e){t.analyzing=!0,t.analyzeError="",t.landingInput=e,h();try{const a=await ce(e);t.repo=a.repo,t.repoName=a.name,t.collapsed.clear(),t.analyzing=!1;const r=new URL(location.href);r.searchParams.set("repo",e),history.replaceState(null,"",r),h()}catch(a){t.analyzing=!1,t.analyzeError=a.message,h()}}function Me(){ae(),ne();const e=localStorage.getItem("git-who-theme");e&&document.documentElement.setAttribute("data-theme",e);const r=new URLSearchParams(location.search).get("repo");if(r){t.landingInput=r,X(r);return}h()}Me();
