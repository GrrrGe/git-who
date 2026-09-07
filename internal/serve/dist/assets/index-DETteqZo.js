(function(){const a=document.createElement("link").relList;if(a&&a.supports&&a.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))l(s);new MutationObserver(s=>{for(const n of s)if(n.type==="childList")for(const o of n.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&l(o)}).observe(document,{childList:!0,subtree:!0});function r(s){const n={};return s.integrity&&(n.integrity=s.integrity),s.referrerPolicy&&(n.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?n.credentials="include":s.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function l(s){if(s.ep)return;s.ep=!0;const n=r(s);fetch(s.href,n)}})();const j=()=>window.matchMedia("(prefers-reduced-motion: reduce)").matches;let I=!1;function Q(){I||!window.AOS||j()||(window.AOS.init({duration:600,easing:"ease-out",once:!0,offset:40}),I=!0)}function H(){I&&window.AOS&&!j()&&window.AOS.refresh()}function Z(){const e=()=>{document.querySelectorAll(".topbar").forEach(a=>{a.classList.toggle("scrolled",window.scrollY>8)})};window.addEventListener("scroll",e,{passive:!0}),e()}function ee(e,a,r,l){if(j()){l();return}e.classList.add("typing");let s=0;const n=()=>{s++,e.textContent=a.slice(0,s),s<a.length?window.setTimeout(n,r):(e.classList.remove("typing"),l())};n()}const t={repo:"",repoName:"",rev:"HEAD",path:"",mode:"commits",view:"table",since:"",until:"",author:"",nauthor:"",email:!1,merges:!1,hidden:!1,tableSort:"",tableSortDir:-1,tableFilter:"",collapsed:new Set,treePath:"",filtersOpen:!1,screen:"landing",guideFrom:"landing",landingInput:"",analyzing:!1,analyzeError:""};function p(e){return e.replace(/[&<>"']/g,a=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[a])}function T(e){let a=0;for(let r=0;r<e.length;r++)a=a*31+e.charCodeAt(r)>>>0;return`hsl(${a%360} 65% 50%)`}function x(e){if(!e||e.startsWith("0001-"))return"-";const a=new Date(e);return isNaN(a.getTime())?e:a.toLocaleDateString()}function te(){let e=0;return t.rev&&t.rev!=="HEAD"&&e++,t.path&&e++,t.since&&e++,t.until&&e++,t.author&&e++,t.nauthor&&e++,t.email&&e++,t.merges&&e++,t.hidden&&e++,e}function z(){const e=new URLSearchParams;return t.repo&&e.set("repo",t.repo),t.rev&&e.set("rev",t.rev),t.path&&e.set("path",t.path),e.set("mode",t.mode),t.since&&e.set("since",t.since),t.until&&e.set("until",t.until),t.author&&e.set("author",t.author),t.nauthor&&e.set("nauthor",t.nauthor),t.email&&e.set("email","1"),t.merges&&e.set("merges","1"),t.hidden&&e.set("hidden","1"),e}async function _(e,a){const r=await fetch(`/api/${e}?${a}`),l=await r.json();if(!r.ok)throw new Error(l.error||`HTTP ${r.status}`);return l}function ae(){return _("table",z())}function ne(){return _("tree",z())}function re(){return _("hist",z())}function se(e){const a=new URLSearchParams;return a.set("repo",e),_("resolve",a)}function ie(){return t.since||t.until?`${t.since||"…"} → ${t.until||"…"}`:"All time 📅"}function N(e){return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,"0")}-${String(e.getDate()).padStart(2,"0")}`}const oe=["January","February","March","April","May","June","July","August","September","October","November","December"],le=["Su","Mo","Tu","We","Th","Fr","Sa"];function ce(){const e=te(),a=e?` <span class="badge" aria-label="${e} active filters">${e}</span>`:"";return`<button id="filters-btn" class="btn btn-secondary" aria-expanded="${t.filtersOpen}" aria-haspopup="dialog">Filters${a}</button>`}function de(){if(!t.filtersOpen)return"";const e=a=>a?"checked":"";return`
  <div class="popover" role="dialog" aria-label="Analysis filters">
    <div class="grid grid-2">
      <label class="field">Revision / branch <input id="f-rev" class="input" value="${p(t.rev)}" /></label>
      <label class="field">Path filter <input id="f-path" class="input" value="${p(t.path)}" placeholder="subdir/" /></label>
      <label class="field">Date range
        <button id="f-dates" class="input" style="text-align:left;cursor:pointer" aria-haspopup="dialog">${p(ie())}</button>
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
  </div>`}function C(e){return new Date(e.getFullYear(),e.getMonth(),1)}function ue(e){const a=/^(\d{4})-(\d{2})-(\d{2})/.exec(e);if(!a)return null;const r=new Date(Number(a[1]),Number(a[2])-1,Number(a[3]));return isNaN(r.getTime())?null:r}function pe(e,a){var E,A,$,L,D,c,u;const r=e.querySelector("#filters-btn");r==null||r.addEventListener("click",d=>{d.stopPropagation(),t.filtersOpen=!t.filtersOpen,a()});const l=d=>{var y;return((y=e.querySelector(`#${d}`))==null?void 0:y.value)??""},s=d=>{var y;return((y=e.querySelector(`#${d}`))==null?void 0:y.checked)??!1},n=e.querySelector("#date-dialog");let o=C(new Date),f="",i="";const h=()=>{const d=n==null?void 0:n.querySelector("#d-summary");d&&(d.textContent=f||i?`${f||"…"} → ${i||"…"}`:"All time. Click a day for start, again for end.")},m=()=>{const d=n==null?void 0:n.querySelector("#cal-grid"),y=n==null?void 0:n.querySelector("#cal-title");if(!d||!y||!n)return;y.textContent=`${oe[o.getMonth()]} ${o.getFullYear()}`;const k=N(new Date),J=new Date(o.getFullYear(),o.getMonth(),1).getDay(),K=new Date(o.getFullYear(),o.getMonth()+1,0).getDate();let F=le.map(v=>`<span class="cal-dow">${v}</span>`).join("");for(let v=0;v<J;v++)F+="<span></span>";for(let v=1;v<=K;v++){const w=N(new Date(o.getFullYear(),o.getMonth(),v)),S=w===f,R=w===i&&i!==f,V=f&&i&&w>f&&w<i,X=["cal-day",S||R?"endpoint":"",V?"in-range":"",w===k?"today":""].filter(Boolean).join(" ");F+=`<button class="${X}" data-day="${w}" role="gridcell" aria-label="${w}${S?", range start":R?", range end":""}">${v}</button>`}d.innerHTML=F,d.querySelectorAll("button[data-day]").forEach(v=>{v.addEventListener("click",w=>{w.preventDefault();const S=v.dataset.day;!f||f&&i?(f=S,i=""):S<f?(i=f,f=S):i=S,m()})}),h()},g=()=>{if(!n)return;f=/^\d{4}-\d{2}-\d{2}/.test(t.since)?t.since.slice(0,10):"",i=/^\d{4}-\d{2}-\d{2}/.test(t.until)?t.until.slice(0,10):"";const d=ue(f)??new Date;o=C(d),m(),n.showModal()};(E=e.querySelector("#f-dates"))==null||E.addEventListener("click",g),(A=n==null?void 0:n.querySelector("#cal-prev"))==null||A.addEventListener("click",d=>{d.preventDefault(),o=new Date(o.getFullYear(),o.getMonth()-1,1),m()}),($=n==null?void 0:n.querySelector("#cal-next"))==null||$.addEventListener("click",d=>{d.preventDefault(),o=new Date(o.getFullYear(),o.getMonth()+1,1),m()}),n==null||n.querySelectorAll("button[data-preset]").forEach(d=>{d.addEventListener("click",y=>{if(y.preventDefault(),d.dataset.preset==="all")f="",i="";else{const k=new Date;k.setDate(k.getDate()-Number(d.dataset.preset)),f=N(k),i="",o=C(k)}m()})});const M=()=>{const d=e.querySelector("#f-dates");d&&(d.textContent=t.since||t.until?`${t.since||"…"} → ${t.until||"…"}`:"All time 📅")};(L=e.querySelector("#d-apply"))==null||L.addEventListener("click",d=>{d.preventDefault(),t.since=f,t.until=i,n==null||n.close(),M()}),(D=e.querySelector("#d-cancel"))==null||D.addEventListener("click",d=>{d.preventDefault(),n==null||n.close()}),(c=e.querySelector("#f-apply"))==null||c.addEventListener("click",()=>{t.rev=l("f-rev")||"HEAD",t.path=l("f-path"),t.author=l("f-author"),t.nauthor=l("f-nauthor"),t.email=s("f-email"),t.merges=s("f-merges"),t.hidden=s("f-hidden"),t.filtersOpen=!1,a()}),(u=e.querySelector("#f-clear"))==null||u.addEventListener("click",()=>{t.rev="HEAD",t.path="",t.since="",t.until="",t.author="",t.nauthor="",t.email=!1,t.merges=!1,t.hidden=!1,t.filtersOpen=!1,a()})}function fe(){return`
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
  </div>`}function me(e,a){var r;(r=e.querySelector("#guide-back"))==null||r.addEventListener("click",a)}const he='<span class="t-git">Git</span><span class="t-who">Who</span><a id="brand-q" class="t-q" href="#" aria-label="Open the guide: what can GitWho do?">?</a>';function G(e,a){var l;const r=e.querySelector("#wordmark");r&&(r.innerHTML=he,(l=r.querySelector("#brand-q"))==null||l.addEventListener("click",s=>{s.preventDefault(),a()}))}function be(){const e=t.analyzing,a=t.analyzeError?`<p class="error" role="alert">${p(t.analyzeError)}</p>`:"";return`
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
  </div>`}function ge(e,a,r){var o;const l=e.querySelector("#wordmark");l&&!t.analyzing?ee(l,"GitWho?",110,()=>G(e,r)):l&&G(e,r);const s=e.querySelector("#landing-form"),n=e.querySelector("#landing-input");t.analyzing||n==null||n.focus(),s==null||s.addEventListener("submit",f=>{f.preventDefault();const i=((n==null?void 0:n.value)??"").trim();i&&a(i)}),(o=e.querySelector("#howto"))==null||o.addEventListener("click",r)}function q(e,a,r){return`<button class="tab" data-mode="${e}" aria-pressed="${t.mode===e}" title="${r}">${a}</button>`}function ye(){const e=(a,r)=>`<button class="tab" data-view="${a}" aria-pressed="${t.view===a}">${r}</button>`;return`
  <div class="topbar">
    <button class="brand btn-translucent brand-title" id="brand-home" aria-label="Back to home" style="border:none;cursor:pointer;font-size:22px"><span class="t-git">Git</span><span class="t-who">Who</span></button>
    <button id="brand-q" class="t-q btn-translucent" aria-label="Open the guide" style="border:none;cursor:pointer;font-size:22px;font-family:var(--font-display)">?</button>
    <span class="body-sm" style="color:var(--muted)" title="${p(t.repo)}">${p(t.repoName||t.repo)}</span>
    <span class="spacer"></span>
    <span class="popover-wrap">${ce()}${de()}</span>
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
  </div>`}function ve(e,a){const r=[...a.buckets].reverse(),l=Math.max(1,...r.map(o=>o.total)),s=a.buckets.reduce((o,f)=>f.value>((o==null?void 0:o.value)??-1)?f:o,a.buckets[0]),n=r.map(o=>{const f=o.value/l*100,i=(o.total-o.value)/l*100,h=`${o.period}: ${o.author.name||"(no commits)"} ${o.value}/${o.total}`,m=o.author.name?`<span class="dot" style="background:${T(o.author.name)}" aria-hidden="true"></span>${p(o.author.name)} (${o.value}/${o.total})`:'<span style="color:var(--muted)">no commits</span>';return`<div class="hist-row" role="img" aria-label="${p(h)}">
      <span>${p(o.period)}</span>
      <span class="hist-bar" aria-hidden="true"><span class="win" style="width:${f}%"></span><span class="rest" style="width:${i}%"></span></span>
      <span class="who">${m}</span>
    </div>`}).join("");e.innerHTML=`
    ${s?`<div class="card spotlight spotlight-coral" style="margin-bottom:16px">
      <p class="caption">Peak period · ${p(s.period)}</p>
      <h3>${p(s.author.name||"-")}</h3>
      <p class="body">${s.value.toLocaleString()} of ${s.total.toLocaleString()} in ${p(s.period)}</p>
    </div>`:""}
    <p class="legend">Solid bar: winner share. Faint bar: period total.</p>
    <div class="card" aria-label="History bar chart">${n||"<p>No history.</p>"}</div>`}function W(e,a){return a==="lines"?e.lines_added+e.lines_removed:a==="files"?e.files:e.commits}function O(e){const a=e.authors.filter(l=>{const s=t.tableFilter.toLowerCase();return!s||l.name.toLowerCase().includes(s)||l.email.toLowerCase().includes(s)}),r=t.tableSort||t.mode;return a.sort((l,s)=>{let n=0;return r==="name"?n=l.name.localeCompare(s.name):r==="commits"?n=l.commits-s.commits:r==="files"?n=l.files-s.files:r==="lines"?n=l.lines_added+l.lines_removed-(s.lines_added+s.lines_removed):r==="last_edit"?n=+new Date(l.last_edit)-+new Date(s.last_edit):r==="first_edit"?n=+new Date(l.first_edit)-+new Date(s.first_edit):n=W(l,t.mode)-W(s,t.mode),n*t.tableSortDir}),a}function P(e){return e.length?e.map(a=>`
    <tr>
      <td><span class="dot" style="background:${T(a.name)}" aria-hidden="true"></span>${p(a.name)}<br/><small style="color:var(--muted)">${p(a.email)}</small></td>
      <td>${a.commits.toLocaleString()}</td>
      <td>${a.files.toLocaleString()}</td>
      <td><span class="check">+${a.lines_added.toLocaleString()}</span> / <span style="color:var(--danger)">-${a.lines_removed.toLocaleString()}</span></td>
      <td>${x(a.last_edit)}</td>
      <td>${x(a.first_edit)}</td>
    </tr>`).join(""):'<tr><td colspan="6">No authors.</td></tr>'}function we(e,a,r){const l=O(a),s=l.slice(0,3),n=s.length?`<div class="grid grid-3" style="margin-bottom:16px">
        ${s.map((c,u)=>`
          <div class="card ${u===0?"card-featured level-2":""}">
            <p class="caption" style="color:var(--muted)">#${u+1} · ${W(c,t.mode).toLocaleString()}</p>
            <p class="headline"><span class="dot" style="background:${T(c.name)}" aria-hidden="true"></span>${p(c.name)}</p>
            <p class="body-sm" style="color:var(--muted)">${c.commits.toLocaleString()} commits · ${c.files.toLocaleString()} files · +${c.lines_added.toLocaleString()} / -${c.lines_removed.toLocaleString()}</p>
          </div>`).join("")}
      </div>`:"",f=[["name","Author"],["commits","Commits"],["files","Files"],["lines","Lines (+/-)"],["last_edit","Last edit"],["first_edit","First edit"]].map(([c,u])=>{const y=(t.tableSort||t.mode)===c?t.tableSortDir===-1?" ▼":" ▲":"";return`<th><button data-sort="${c}" aria-label="Sort by ${u}">${u}${y}</button></th>`}).join("");e.innerHTML=`
    ${n}
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
      <tbody id="author-rows">${P(l)}</tbody>
    </table></div>`,e.querySelectorAll("button[data-sort]").forEach(c=>{c.onclick=()=>{const u=c.dataset.sort;(t.tableSort||t.mode)===u?t.tableSortDir*=-1:(t.tableSort=u,t.tableSortDir=-1),r()}});const i=e.querySelector("#tf"),h=e.querySelector("#author-rows"),m=e.querySelector("#suggest");let g=-1;const M=()=>{const c=t.tableFilter.toLowerCase().trim();return c?a.authors.filter(u=>u.name.toLowerCase().includes(c)||u.email.toLowerCase().includes(c)).sort((u,d)=>E(u)-E(d)).slice(0,8):a.authors.slice(0,8)},E=c=>{const u=t.tableFilter.toLowerCase().trim();return c.name.toLowerCase().startsWith(u)?0:c.email.toLowerCase().startsWith(u)?1:2},A=c=>{const u=t.tableFilter.trim();if(!u)return p(c);const d=c.toLowerCase().indexOf(u.toLowerCase());return d<0?p(c):p(c.slice(0,d))+'<b class="hl">'+p(c.slice(d,d+u.length))+"</b>"+p(c.slice(d+u.length))},$=()=>{if(!m||!i)return;const c=M();c.length?(m.innerHTML=c.map((u,d)=>`
        <button class="suggest-item${d===g?" active":""}" role="option"
          aria-selected="${d===g}" data-i="${d}">
          <span class="dot" style="background:${T(u.name)}" aria-hidden="true"></span>
          <span>${A(u.name)}</span>
          <small style="color:var(--muted)">${p(u.email)}</small>
        </button>`).join(""),m.querySelectorAll(".suggest-item").forEach(u=>{u.addEventListener("mousedown",d=>{d.preventDefault(),D(c[Number(u.dataset.i)])})})):m.innerHTML='<div class="suggest-empty">No matching authors.</div>',m.hidden=!1,i.setAttribute("aria-expanded","true")},L=()=>{!m||!i||(m.hidden=!0,i.setAttribute("aria-expanded","false"),g=-1)},D=c=>{t.tableFilter=c.name,i&&(i.value=c.name),h&&(h.innerHTML=P(O(a))),L()};i==null||i.addEventListener("input",()=>{t.tableFilter=i.value,g=-1,h&&(h.innerHTML=P(O(a))),$()}),i==null||i.addEventListener("focus",()=>{g=-1,$()}),i==null||i.addEventListener("keydown",c=>{if(m!=null&&m.hidden)return;const u=M();c.key==="ArrowDown"?(c.preventDefault(),g=Math.min(g+1,u.length-1),$()):c.key==="ArrowUp"?(c.preventDefault(),g=Math.max(g-1,-1),$()):c.key==="Enter"&&g>=0&&u[g]?(c.preventDefault(),D(u[g])):c.key==="Escape"&&L()}),i==null||i.addEventListener("blur",()=>L())}function $e(e,a){if(!a)return e;let r=e;for(const l of a.split("/")){const s=(r.children||[]).find(n=>n.name===l&&n.is_dir);if(!s)return null;r=s}return r}function Se(){return t.mode==="lines"?"Lines":t.mode==="files"?"Files":t.mode==="last_modified"?"Last edit":t.mode==="first_modified"?"First edit":"Commits"}function Le(e){return t.mode==="lines"?`+${e.metrics.lines_added.toLocaleString()} / -${e.metrics.lines_removed.toLocaleString()}`:t.mode==="files"?e.metrics.files.toLocaleString():t.mode==="last_modified"?x(e.metrics.last_edit):t.mode==="first_modified"?x(e.metrics.first_edit):e.metrics.commits.toLocaleString()}function ke(e,a,r){if(!a.root){e.innerHTML="<p>No commits; tree is empty.</p>";return}const s=(($e(a.root,t.treePath)??a.root).children||[]).filter(i=>i.in_work_tree).sort((i,h)=>Number(h.is_dir)-Number(i.is_dir)||i.name.localeCompare(h.name)),n=t.treePath?t.treePath.split("/"):[],o=[`<button data-crumb="" class="crumb" aria-label="Repository root">${p(a.root.name==="."?t.repoName||"repo":a.root.name)}</button>`];n.forEach((i,h)=>{const m=n.slice(0,h+1).join("/");o.push(`<span aria-hidden="true">/</span> <button data-crumb="${p(m)}" class="crumb">${p(i)}</button>`)});const f=s.map(i=>{const h=i.is_dir?"📁":"📄",m=i.is_dir?`<button data-enter="${p(i.is_dir?t.treePath?t.treePath+"/"+i.name:i.name:"")}" class="linklike">${p(i.name)}</button>`:`<span>${p(i.name)}</span>`;return`<tr>
      <td><span aria-hidden="true">${h}</span> ${m}</td>
      <td><span class="dot" style="background:${T(i.author.name)}" aria-hidden="true"></span>${p(i.author.name)}</td>
      <td>${p(Le(i))}</td>
      <td style="color:var(--muted)">${x(i.metrics.last_edit)}</td>
    </tr>`}).join("");e.innerHTML=`
    <div class="toolbar">
      <nav class="body" aria-label="Breadcrumb">${o.join(" ")}</nav>
      <span class="spacer"></span>
      <span class="legend">Top contributor per node.</span>
    </div>
    <div class="card" style="padding:0;overflow:auto">
    <table class="data" aria-label="Files by top contributor">
      <thead><tr><th>Name</th><th>Top contributor</th><th>${Se()}</th><th>Last edit</th></tr></thead>
      <tbody>${f||'<tr><td colspan="4">Empty directory.</td></tr>'}</tbody>
    </table></div>`,e.querySelectorAll("button[data-crumb]").forEach(i=>{i.onclick=()=>{t.treePath=i.dataset.crumb??"",r()}}),e.querySelectorAll("button[data-enter]").forEach(i=>{i.onclick=()=>{t.treePath=i.dataset.enter??"",r()}})}const B={table:["Reading commit history","Ranking authors"],tree:["Reading commit history","Building file tree","Ranking nodes"],hist:["Reading commit history","Bucketing periods"]},Ee={table:"Indexing authors",tree:"Indexing file tree",hist:"Indexing history"};function De(e,a){var f;const r=p(t.repoName||t.repo);if(e.innerHTML=`
    <div class="indexing" role="status" aria-live="polite" data-aos="fade-up">
      <h2 class="display-md">${Ee[a]??"Indexing"}</h2>
      <p class="legend">${r}</p>
      <div class="index-bar" aria-hidden="true"><span></span></div>
      <p class="status body-sm" id="index-status">${((f=B[a])==null?void 0:f[0])??"Working"}…</p>
      <div class="index-dots" aria-hidden="true"><span></span><span></span><span></span></div>
    </div>`,window.matchMedia("(prefers-reduced-motion: reduce)").matches)return()=>{};const l=B[a]??["Working"];let s=0;const n=e.querySelector("#index-status"),o=window.setInterval(()=>{s=(s+1)%l.length,n&&(n.textContent=`${l[s]}…`)},900);return()=>window.clearInterval(o)}async function qe(e){const a=De(e,t.view);try{t.view==="table"?we(e,await ae(),b):t.view==="tree"?ke(e,await ne(),b):ve(e,await re())}catch(r){e.innerHTML=`<p class="error" role="alert">Error: ${p(r.message)}</p>`}finally{a()}}function Y(e){t.guideFrom=e,t.screen="guide",b()}function Te(){t.screen=t.guideFrom==="app"&&t.repo?"app":"landing",b()}function b(){var a,r,l,s;const e=document.getElementById("app");if(t.screen==="guide"){e.innerHTML=fe(),me(e,Te),H();return}if(!t.repo){t.screen="landing",e.innerHTML=be(),ge(e,U,()=>Y("landing")),H();return}t.screen="app",e.innerHTML=ye(),(a=e.querySelector("#brand-home"))==null||a.addEventListener("click",()=>{t.repo="",t.repoName="",t.analyzeError="",b()}),(r=e.querySelector("#brand-q"))==null||r.addEventListener("click",()=>Y("app")),(l=e.querySelector("#new-repo"))==null||l.addEventListener("click",()=>{t.repo="",t.repoName="",t.analyzeError="",b()}),(s=e.querySelector("#theme"))==null||s.addEventListener("click",()=>{const n=document.documentElement,o=n.getAttribute("data-theme")==="dark"?"light":"dark";n.setAttribute("data-theme",o),localStorage.setItem("git-who-theme",o)}),e.querySelectorAll("button[data-view]").forEach(n=>{n.onclick=()=>{t.view=n.dataset.view,b()}}),e.querySelectorAll("button[data-mode]").forEach(n=>{n.onclick=()=>{t.mode=n.dataset.mode,t.tableSort="",b()}}),pe(e,b),document.onpointerdown=n=>{t.filtersOpen&&!n.target.closest(".popover-wrap")&&(t.filtersOpen=!1,b())},document.onkeydown=n=>{n.key==="Escape"&&t.filtersOpen&&(t.filtersOpen=!1,b())},qe(e.querySelector("#view")),H()}async function U(e){t.analyzing=!0,t.analyzeError="",t.landingInput=e,b();try{const a=await se(e);t.repo=a.repo,t.repoName=a.name,t.treePath="",t.collapsed.clear(),t.analyzing=!1;const r=new URL(location.href);r.searchParams.set("repo",e),history.replaceState(null,"",r),b()}catch(a){t.analyzing=!1,t.analyzeError=a.message,b()}}function xe(){Q(),Z();const e=localStorage.getItem("git-who-theme");e&&document.documentElement.setAttribute("data-theme",e);const r=new URLSearchParams(location.search).get("repo");if(r){t.landingInput=r,U(r);return}b()}xe();
