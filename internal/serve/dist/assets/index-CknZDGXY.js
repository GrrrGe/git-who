(function(){const a=document.createElement("link").relList;if(a&&a.supports&&a.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))l(n);new MutationObserver(n=>{for(const r of n)if(r.type==="childList")for(const i of r.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&l(i)}).observe(document,{childList:!0,subtree:!0});function s(n){const r={};return n.integrity&&(r.integrity=n.integrity),n.referrerPolicy&&(r.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?r.credentials="include":n.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function l(n){if(n.ep)return;n.ep=!0;const r=s(n);fetch(n.href,r)}})();const t={repo:"",repoName:"",rev:"HEAD",path:"",mode:"commits",view:"table",since:"",until:"",author:"",nauthor:"",email:!1,merges:!1,hidden:!1,tableSort:"",tableSortDir:-1,tableFilter:"",collapsed:new Set,filtersOpen:!1,screen:"landing",guideFrom:"landing",landingInput:"",analyzing:!1,analyzeError:""};function p(e){return e.replace(/[&<>"']/g,a=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[a])}function x(e){let a=0;for(let s=0;s<e.length;s++)a=a*31+e.charCodeAt(s)>>>0;return`hsl(${a%360} 65% 50%)`}function _(e){if(!e||e.startsWith("0001-"))return"-";const a=new Date(e);return isNaN(a.getTime())?e:a.toLocaleDateString()}function Z(){let e=0;return t.rev&&t.rev!=="HEAD"&&e++,t.path&&e++,t.since&&e++,t.until&&e++,t.author&&e++,t.nauthor&&e++,t.email&&e++,t.merges&&e++,t.hidden&&e++,e}function I(){const e=new URLSearchParams;return t.repo&&e.set("repo",t.repo),t.rev&&e.set("rev",t.rev),t.path&&e.set("path",t.path),e.set("mode",t.mode),t.since&&e.set("since",t.since),t.until&&e.set("until",t.until),t.author&&e.set("author",t.author),t.nauthor&&e.set("nauthor",t.nauthor),t.email&&e.set("email","1"),t.merges&&e.set("merges","1"),t.hidden&&e.set("hidden","1"),e}async function A(e,a){const s=await fetch(`/api/${e}?${a}`),l=await s.json();if(!s.ok)throw new Error(l.error||`HTTP ${s.status}`);return l}function ee(){return A("table",I())}function te(){return A("tree",I())}function ae(){return A("hist",I())}function re(e){const a=new URLSearchParams;return a.set("repo",e),A("resolve",a)}function se(){return t.since||t.until?`${t.since||"…"} → ${t.until||"…"}`:"All time 📅"}function C(e){return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,"0")}-${String(e.getDate()).padStart(2,"0")}`}const ne=["January","February","March","April","May","June","July","August","September","October","November","December"],ie=["Su","Mo","Tu","We","Th","Fr","Sa"];function le(){const e=Z(),a=e?` <span class="badge" aria-label="${e} active filters">${e}</span>`:"";return`<button id="filters-btn" class="btn btn-secondary" aria-expanded="${t.filtersOpen}" aria-haspopup="dialog">Filters${a}</button>`}function oe(){if(!t.filtersOpen)return"";const e=a=>a?"checked":"";return`
  <div class="popover" role="dialog" aria-label="Analysis filters">
    <div class="grid grid-2">
      <label class="field">Revision / branch <input id="f-rev" class="input" value="${p(t.rev)}" /></label>
      <label class="field">Path filter <input id="f-path" class="input" value="${p(t.path)}" placeholder="subdir/" /></label>
      <label class="field">Date range
        <button id="f-dates" class="input" style="text-align:left;cursor:pointer" aria-haspopup="dialog">${p(se())}</button>
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
  </div>`}function O(e){return new Date(e.getFullYear(),e.getMonth(),1)}function ce(e){const a=/^(\d{4})-(\d{2})-(\d{2})/.exec(e);if(!a)return null;const s=new Date(Number(a[1]),Number(a[2])-1,Number(a[3]));return isNaN(s.getTime())?null:s}function de(e,a){var D,F,w,S,q,o,u;const s=e.querySelector("#filters-btn");s==null||s.addEventListener("click",c=>{c.stopPropagation(),t.filtersOpen=!t.filtersOpen,a()});const l=c=>{var v;return((v=e.querySelector(`#${c}`))==null?void 0:v.value)??""},n=c=>{var v;return((v=e.querySelector(`#${c}`))==null?void 0:v.checked)??!1},r=e.querySelector("#date-dialog");let i=O(new Date),f="",d="";const h=()=>{const c=r==null?void 0:r.querySelector("#d-summary");c&&(c.textContent=f||d?`${f||"…"} → ${d||"…"}`:"All time. Click a day for start, again for end.")},m=()=>{const c=r==null?void 0:r.querySelector("#cal-grid"),v=r==null?void 0:r.querySelector("#cal-title");if(!c||!v||!r)return;v.textContent=`${ne[i.getMonth()]} ${i.getFullYear()}`;const k=C(new Date),K=new Date(i.getFullYear(),i.getMonth(),1).getDay(),V=new Date(i.getFullYear(),i.getMonth()+1,0).getDate();let H=ie.map(y=>`<span class="cal-dow">${y}</span>`).join("");for(let y=0;y<K;y++)H+="<span></span>";for(let y=1;y<=V;y++){const $=C(new Date(i.getFullYear(),i.getMonth(),y)),L=$===f,R=$===d&&d!==f,Q=f&&d&&$>f&&$<d,X=["cal-day",L||R?"endpoint":"",Q?"in-range":"",$===k?"today":""].filter(Boolean).join(" ");H+=`<button class="${X}" data-day="${$}" role="gridcell" aria-label="${$}${L?", range start":R?", range end":""}">${y}</button>`}c.innerHTML=H,c.querySelectorAll("button[data-day]").forEach(y=>{y.addEventListener("click",$=>{$.preventDefault();const L=y.dataset.day;!f||f&&d?(f=L,d=""):L<f?(d=f,f=L):d=L,m()})}),h()},g=()=>{if(!r)return;f=/^\d{4}-\d{2}-\d{2}/.test(t.since)?t.since.slice(0,10):"",d=/^\d{4}-\d{2}-\d{2}/.test(t.until)?t.until.slice(0,10):"";const c=ce(f)??new Date;i=O(c),m(),r.showModal()};(D=e.querySelector("#f-dates"))==null||D.addEventListener("click",g),(F=r==null?void 0:r.querySelector("#cal-prev"))==null||F.addEventListener("click",c=>{c.preventDefault(),i=new Date(i.getFullYear(),i.getMonth()-1,1),m()}),(w=r==null?void 0:r.querySelector("#cal-next"))==null||w.addEventListener("click",c=>{c.preventDefault(),i=new Date(i.getFullYear(),i.getMonth()+1,1),m()}),r==null||r.querySelectorAll("button[data-preset]").forEach(c=>{c.addEventListener("click",v=>{if(v.preventDefault(),c.dataset.preset==="all")f="",d="";else{const k=new Date;k.setDate(k.getDate()-Number(c.dataset.preset)),f=C(k),d="",i=O(k)}m()})});const T=()=>{const c=e.querySelector("#f-dates");c&&(c.textContent=t.since||t.until?`${t.since||"…"} → ${t.until||"…"}`:"All time 📅")};(S=e.querySelector("#d-apply"))==null||S.addEventListener("click",c=>{c.preventDefault(),t.since=f,t.until=d,r==null||r.close(),T()}),(q=e.querySelector("#d-cancel"))==null||q.addEventListener("click",c=>{c.preventDefault(),r==null||r.close()}),(o=e.querySelector("#f-apply"))==null||o.addEventListener("click",()=>{t.rev=l("f-rev")||"HEAD",t.path=l("f-path"),t.author=l("f-author"),t.nauthor=l("f-nauthor"),t.email=n("f-email"),t.merges=n("f-merges"),t.hidden=n("f-hidden"),t.filtersOpen=!1,a()}),(u=e.querySelector("#f-clear"))==null||u.addEventListener("click",()=>{t.rev="HEAD",t.path="",t.since="",t.until="",t.author="",t.nauthor="",t.email=!1,t.merges=!1,t.hidden=!1,t.filtersOpen=!1,a()})}function ue(){return`
  <div class="guide">
    <button id="guide-back" class="btn btn-secondary">← Back</button>
    <p class="caption" style="color:var(--muted);margin:32px 0 8px">Guide</p>
    <h1 class="display-lg">What can GitWho do?</h1>
    <p class="body-lg" style="color:var(--muted)">Three views over your git history, plus the CLI behind them.</p>

    <section class="grid grid-3">
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

    <section>
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
  </div>`}function pe(e,a){var s;(s=e.querySelector("#guide-back"))==null||s.addEventListener("click",a)}const fe='<span class="t-git">Git</span><span class="t-who">Who</span><a id="brand-q" class="t-q" href="#" aria-label="Open the guide: what can GitWho do?">?</a>';function me(){const e=t.analyzing,a=t.analyzeError?`<p class="error" role="alert">${p(t.analyzeError)}</p>`:"";return`
  <div class="landing">
    <h1 id="wordmark" class="display-xxl brand-title" aria-label="GitWho?">${fe}</h1>
    <p class="subhead sub">Who wrote this code?!</p>
    <form id="landing-form" class="landing-form">
      <div class="input-group level-2">
        <input id="landing-input" type="text" value="${p(t.landingInput)}"
          placeholder="Paste a GitHub link or local path…"
          aria-label="GitHub link or local repo path" ${e?"disabled":""} />
        <button class="btn btn-primary" type="submit" ${e?"disabled":""}>${e?"Opening…":"Analyze"}</button>
      </div>
    </form>
    ${a}
    <button id="howto" class="howto-link">How to use GitWho →</button>
  </div>`}function he(e,a,s){var r,i;(r=e.querySelector("#brand-q"))==null||r.addEventListener("click",f=>{f.preventDefault(),s()});const l=e.querySelector("#landing-form"),n=e.querySelector("#landing-input");t.analyzing||n==null||n.focus(),l==null||l.addEventListener("submit",f=>{f.preventDefault();const d=((n==null?void 0:n.value)??"").trim();d&&a(d)}),(i=e.querySelector("#howto"))==null||i.addEventListener("click",s)}function M(e,a,s){return`<button class="tab" data-mode="${e}" aria-pressed="${t.mode===e}" title="${s}">${a}</button>`}function be(){const e=(a,s)=>`<button class="tab" data-view="${a}" aria-pressed="${t.view===a}">${s}</button>`;return`
  <div class="topbar">
    <div class="nav-wordmark"><button class="brand btn-translucent brand-title" id="brand-home" aria-label="Back to home" style="border:none;cursor:pointer;font-size:22px"><span class="t-git">Git</span><span class="t-who">Who</span></button>
    <button id="brand-q" class="t-q btn-translucent" aria-label="Open the guide" style="border:none;cursor:pointer;font-size:22px;font-family:var(--font-display)">?</button></div>
    <span class="body-sm" style="color:var(--muted)" title="${p(t.repo)}">${p(t.repoName||t.repo)}</span>
    <span class="spacer"></span>
    <span class="popover-wrap">${le()}${oe()}</span>
    <button id="new-repo" class="btn btn-secondary">Change repo</button>
    <button id="theme" class="btn-icon" aria-label="Toggle theme">◐</button>
  </div>
  <div class="wrap">
    <div class="toolbar view-navigation">
      <div class="tabs" role="group" aria-label="Views">
      ${e("table","Table")} ${e("tree","Tree")} ${e("hist","History")}
      </div>
      <div class="tabs mode-tabs" role="group" aria-label="Rank by">
      ${M("commits","Commits","default")} ${M("lines","Lines","-l")}
      ${M("files","Files","-f")} ${M("last_modified","Last edit","-m")}
      ${M("first_modified","First edit","-c")}
      </div>
    </div>
    <div id="view" role="region" aria-label="Repository results"></div>
  </div>`}function ge(e,a){const s=a.buckets,l=Math.max(1,...s.map(i=>i.total)),n=a.buckets.reduce((i,f)=>f.value>((i==null?void 0:i.value)??-1)?f:i,a.buckets[0]),r=s.map(i=>{const f=i.value/l*100,d=(i.total-i.value)/l*100,h=`${i.period}: ${i.author.name||"(no commits)"} ${i.value}/${i.total}`,m=i.author.name?`<span class="dot" style="background:${x(i.author.name)}" aria-hidden="true"></span>${p(i.author.name)} (${i.value}/${i.total})`:'<span style="color:var(--muted)">no commits</span>';return`<div class="hist-row" role="img" aria-label="${p(h)}">
      <span>${p(i.period)}</span>
      <span class="hist-bar" aria-hidden="true"><span class="win" style="width:${f}%"></span><span class="rest" style="width:${d}%"></span></span>
      <span class="who">${m}</span>
    </div>`}).join("");e.innerHTML=`
    ${n?`<div class="card spotlight spotlight-coral" style="margin-bottom:16px">
      <p class="caption">Peak period · ${p(n.period)}</p>
      <h3>${p(n.author.name||"-")}</h3>
      <p class="body">${n.value.toLocaleString()} of ${n.total.toLocaleString()} in ${p(n.period)}</p>
    </div>`:""}
    <p class="legend">Solid bar: winner share. Faint bar: period total.</p>
    <div class="card" aria-label="History bar chart">${r||"<p>No history.</p>"}</div>`}function P(e,a){return a==="lines"?e.lines_added+e.lines_removed:a==="files"?e.files:e.commits}function N(e){const a=e.authors.filter(l=>{const n=t.tableFilter.toLowerCase();return!n||l.name.toLowerCase().includes(n)||l.email.toLowerCase().includes(n)}),s=t.tableSort||t.mode;return a.sort((l,n)=>{let r=0;return s==="name"?r=l.name.localeCompare(n.name):s==="commits"?r=l.commits-n.commits:s==="files"?r=l.files-n.files:s==="lines"?r=l.lines_added+l.lines_removed-(n.lines_added+n.lines_removed):s==="last_edit"?r=+new Date(l.last_edit)-+new Date(n.last_edit):s==="first_edit"?r=+new Date(l.first_edit)-+new Date(n.first_edit):r=P(l,t.mode)-P(n,t.mode),r*t.tableSortDir}),a}function z(e){return e.length?e.map(a=>`
    <tr>
      <td><span class="dot" style="background:${x(a.name)}" aria-hidden="true"></span>${p(a.name)}<br/><small style="color:var(--muted)">${p(a.email)}</small></td>
      <td>${a.commits.toLocaleString()}</td>
      <td>${a.files.toLocaleString()}</td>
      <td><span class="check">+${a.lines_added.toLocaleString()}</span> / <span style="color:var(--danger)">-${a.lines_removed.toLocaleString()}</span></td>
      <td>${_(a.last_edit)}</td>
      <td>${_(a.first_edit)}</td>
    </tr>`).join(""):'<tr><td colspan="6">No authors.</td></tr>'}function ve(e,a,s){const l=N(a),n=l.slice(0,3),r=n.length?`<div class="grid grid-3" style="margin-bottom:16px">
        ${n.map((o,u)=>`
          <div class="card ${u===0?"card-featured level-2":""}">
            <p class="caption" style="color:var(--muted)">#${u+1} · ${P(o,t.mode).toLocaleString()}</p>
            <p class="headline"><span class="dot" style="background:${x(o.name)}" aria-hidden="true"></span>${p(o.name)}</p>
            <p class="body-sm" style="color:var(--muted)">${o.commits.toLocaleString()} commits · ${o.files.toLocaleString()} files · +${o.lines_added.toLocaleString()} / -${o.lines_removed.toLocaleString()}</p>
          </div>`).join("")}
      </div>`:"",f=[["name","Author"],["commits","Commits"],["files","Files"],["lines","Lines (+/-)"],["last_edit","Last edit"],["first_edit","First edit"]].map(([o,u])=>{const v=(t.tableSort||t.mode)===o?t.tableSortDir===-1?" ▼":" ▲":"";return`<th><button data-sort="${o}" aria-label="Sort by ${u}">${u}${v}</button></th>`}).join("");e.innerHTML=`
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
      <thead><tr>${f}</tr></thead>
      <tbody id="author-rows">${z(l)}</tbody>
    </table></div>`,e.querySelectorAll("button[data-sort]").forEach(o=>{o.onclick=()=>{const u=o.dataset.sort;(t.tableSort||t.mode)===u?t.tableSortDir*=-1:(t.tableSort=u,t.tableSortDir=-1),s()}});const d=e.querySelector("#tf"),h=e.querySelector("#author-rows"),m=e.querySelector("#suggest");let g=-1;const T=()=>{const o=t.tableFilter.toLowerCase().trim();return o?a.authors.filter(u=>u.name.toLowerCase().includes(o)||u.email.toLowerCase().includes(o)).sort((u,c)=>D(u)-D(c)).slice(0,8):a.authors.slice(0,8)},D=o=>{const u=t.tableFilter.toLowerCase().trim();return o.name.toLowerCase().startsWith(u)?0:o.email.toLowerCase().startsWith(u)?1:2},F=o=>{const u=t.tableFilter.trim();if(!u)return p(o);const c=o.toLowerCase().indexOf(u.toLowerCase());return c<0?p(o):p(o.slice(0,c))+'<b class="hl">'+p(o.slice(c,c+u.length))+"</b>"+p(o.slice(c+u.length))},w=()=>{if(!m||!d)return;const o=T();o.length?(m.innerHTML=o.map((u,c)=>`
        <button class="suggest-item${c===g?" active":""}" role="option"
          aria-selected="${c===g}" data-i="${c}">
          <span class="dot" style="background:${x(u.name)}" aria-hidden="true"></span>
          <span>${F(u.name)}</span>
          <small style="color:var(--muted)">${p(u.email)}</small>
        </button>`).join(""),m.querySelectorAll(".suggest-item").forEach(u=>{u.addEventListener("mousedown",c=>{c.preventDefault(),q(o[Number(u.dataset.i)])})})):m.innerHTML='<div class="suggest-empty">No matching authors.</div>',m.hidden=!1,d.setAttribute("aria-expanded","true")},S=()=>{!m||!d||(m.hidden=!0,d.setAttribute("aria-expanded","false"),g=-1)},q=o=>{t.tableFilter=o.name,d&&(d.value=o.name),h&&(h.innerHTML=z(N(a))),S()};d==null||d.addEventListener("input",()=>{t.tableFilter=d.value,g=-1,h&&(h.innerHTML=z(N(a))),w()}),d==null||d.addEventListener("focus",()=>{g=-1,w()}),d==null||d.addEventListener("keydown",o=>{if(m!=null&&m.hidden)return;const u=T();o.key==="ArrowDown"?(o.preventDefault(),g=Math.min(g+1,u.length-1),w()):o.key==="ArrowUp"?(o.preventDefault(),g=Math.max(g-1,-1),w()):o.key==="Enter"&&g>=0&&u[g]?(o.preventDefault(),q(u[g])):o.key==="Escape"&&S()}),d==null||d.addEventListener("blur",()=>S())}const E=new Set;let G="";function Y(e){return t.mode==="lines"?`+${e.metrics.lines_added.toLocaleString()} / −${e.metrics.lines_removed.toLocaleString()}`:t.mode==="files"?e.metrics.files.toLocaleString():t.mode==="last_modified"?_(e.metrics.last_edit):t.mode==="first_modified"?_(e.metrics.first_edit):e.metrics.commits.toLocaleString()}function j(e){return(e.children||[]).filter(a=>t.hidden||a.in_work_tree)}function W(e,a,s){const l=e.is_dir?'<path d="M2 5h5l2 2h13v12H2z"/>':'<path d="M5 2h9l5 5v15H5z"/><path d="M14 2v6h5"/>';return`<span class="tree-name" style="--depth:${a}" title="${p(e.path)}">
    <span class="tree-chevron ${s?"":"tree-chevron-empty"}" aria-hidden="true">›</span>
    <svg class="tree-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true">${l}</svg>
    <span class="path">${p(e.name)}${e.is_dir?"/":""}</span>
    ${e.in_work_tree?"":'<span class="tree-deleted">deleted</span>'}
    </span>
    <span class="tree-author" title="${p(e.author.name)}"><span class="dot" style="background:${x(e.author.name)}" aria-hidden="true"></span>${p(e.author.name||"No author")}</span>
    <span class="tree-metric">${p(Y(e))}</span>`}function U(e,a){const s=j(e);return!e.is_dir||!s.length?`<div class="tree-row">${W(e,a,!1)}</div>`:`<details class="tree-dir" data-path="${p(e.path)}" ${E.has(e.path)?"open":""}>
    <summary class="tree-row">${W(e,a,!0)}</summary>
    <div class="tree-kids">${s.map(l=>U(l,a+1)).join("")}</div>
  </details>`}function ye(e,a,s){var f,d;G!==t.repo&&(E.clear(),G=t.repo);const l=a.root;if(!l||!j(l).length){e.innerHTML='<p class="legend">No files match the current filters.</p>';return}const n={commits:"Commits",lines:"Lines (+ / −)",files:"Files",last_modified:"Last edit",first_modified:"First edit"}[t.mode];e.innerHTML=`
    <section class="tree-browser" aria-label="Files by top contributor">
      <div class="tree-toolbar">
        <div class="tree-root"><strong>${p(l.name==="."?t.repoName||"repo":l.name)}/</strong>
          <span>${p(l.author.name)} <span class="tree-root-metric">${p(Y(l))}</span></span></div>
        <div class="tree-actions"><button id="expand" class="btn btn-secondary">Expand all</button>
          <button id="collapse" class="btn btn-secondary">Collapse all</button></div>
      </div>
      <div class="tree-scroll">
        <div class="tree-content">
          <div class="tree-head"><span>File</span><span>Top contributor</span><span>${n}</span></div>
          ${j(l).map(h=>U(h,0)).join("")}
        </div>
      </div>
    </section>`;const r=e.querySelectorAll("details.tree-dir");r.forEach(h=>h.addEventListener("toggle",()=>{h.open?E.add(h.dataset.path):E.delete(h.dataset.path)}));const i=h=>r.forEach(m=>{m.open=h,h?E.add(m.dataset.path):E.delete(m.dataset.path)});(f=e.querySelector("#expand"))==null||f.addEventListener("click",()=>i(!0)),(d=e.querySelector("#collapse"))==null||d.addEventListener("click",()=>i(!1))}function $e(e){const a=window.setTimeout(()=>{e.innerHTML=`<div class="indexing" role="status">
      <span class="loading-spinner" aria-hidden="true"></span>
      <span>Reading repository history…</span>
    </div>`},180);return()=>window.clearTimeout(a)}async function we(e){const a=$e(e);try{t.view==="table"?ve(e,await ee(),b):t.view==="tree"?ye(e,await te(),b):ge(e,await ae())}catch(s){e.innerHTML=`<p class="error" role="alert">Error: ${p(s.message)}</p>`}finally{a()}}function B(e){t.guideFrom=e,t.screen="guide",b()}function Le(){t.screen=t.guideFrom==="app"&&t.repo?"app":"landing",b()}function b(){var a,s,l,n;const e=document.getElementById("app");if(t.screen==="guide"){e.innerHTML=ue(),pe(e,Le);return}if(!t.repo){t.screen="landing",e.innerHTML=me(),he(e,J,()=>B("landing"));return}t.screen="app",e.innerHTML=be(),(a=e.querySelector("#brand-home"))==null||a.addEventListener("click",()=>{t.repo="",t.repoName="",t.analyzeError="",b()}),(s=e.querySelector("#brand-q"))==null||s.addEventListener("click",()=>B("app")),(l=e.querySelector("#new-repo"))==null||l.addEventListener("click",()=>{t.repo="",t.repoName="",t.analyzeError="",b()}),(n=e.querySelector("#theme"))==null||n.addEventListener("click",()=>{const r=document.documentElement,f=(r.getAttribute("data-theme")?r.getAttribute("data-theme")==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches)?"light":"dark";r.setAttribute("data-theme",f),localStorage.setItem("git-who-theme",f)}),e.querySelectorAll("button[data-view]").forEach(r=>{r.onclick=()=>{t.view=r.dataset.view,b()}}),e.querySelectorAll("button[data-mode]").forEach(r=>{r.onclick=()=>{t.mode=r.dataset.mode,t.tableSort="",b()}}),de(e,b),document.onpointerdown=r=>{t.filtersOpen&&!r.target.closest(".popover-wrap")&&(t.filtersOpen=!1,b())},document.onkeydown=r=>{r.key==="Escape"&&t.filtersOpen&&(t.filtersOpen=!1,b())},we(e.querySelector("#view"))}async function J(e){t.analyzing=!0,t.analyzeError="",t.landingInput=e,b();try{const a=await re(e);t.repo=a.repo,t.repoName=a.name,t.collapsed.clear(),t.analyzing=!1;const s=new URL(location.href);s.searchParams.set("repo",e),history.replaceState(null,"",s),b()}catch(a){t.analyzing=!1,t.analyzeError=a.message,b()}}function Se(){const e=localStorage.getItem("git-who-theme");e&&document.documentElement.setAttribute("data-theme",e);const s=new URLSearchParams(location.search).get("repo");if(s){t.landingInput=s,J(s);return}b()}Se();
