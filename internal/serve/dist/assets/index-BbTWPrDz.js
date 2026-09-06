(function(){const r=document.createElement("link").relList;if(r&&r.supports&&r.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))o(s);new MutationObserver(s=>{for(const a of s)if(a.type==="childList")for(const c of a.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&o(c)}).observe(document,{childList:!0,subtree:!0});function n(s){const a={};return s.integrity&&(a.integrity=s.integrity),s.referrerPolicy&&(a.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?a.credentials="include":s.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function o(s){if(s.ep)return;s.ep=!0;const a=n(s);fetch(s.href,a)}})();const O=()=>window.matchMedia("(prefers-reduced-motion: reduce)").matches;let H=!1;function K(){H||!window.AOS||O()||(window.AOS.init({duration:600,easing:"ease-out",once:!0,offset:40}),H=!0)}function _(){H&&window.AOS&&!O()&&window.AOS.refresh()}function Q(){const e=()=>{document.querySelectorAll(".topbar").forEach(r=>{r.classList.toggle("scrolled",window.scrollY>8)})};window.addEventListener("scroll",e,{passive:!0}),e()}function X(e,r,n,o){if(O()){o();return}e.classList.add("typing");let s=0;const a=()=>{s++,e.textContent=r.slice(0,s),s<r.length?window.setTimeout(a,n):(e.classList.remove("typing"),o())};a()}const t={repo:"",repoName:"",rev:"HEAD",path:"",mode:"commits",view:"table",since:"",until:"",author:"",nauthor:"",email:!1,merges:!1,hidden:!1,tableSort:"",tableSortDir:-1,tableFilter:"",collapsed:new Set,treePath:"",filtersOpen:!1,screen:"landing",guideFrom:"landing",landingInput:"",analyzing:!1,analyzeError:""};function u(e){return e.replace(/[&<>"']/g,r=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[r])}function D(e){let r=0;for(let n=0;n<e.length;n++)r=r*31+e.charCodeAt(n)>>>0;return`hsl(${r%360} 65% 50%)`}function k(e){if(!e||e.startsWith("0001-"))return"—";const r=new Date(e);return isNaN(r.getTime())?e:r.toLocaleDateString()}function Z(){let e=0;return t.rev&&t.rev!=="HEAD"&&e++,t.path&&e++,t.since&&e++,t.until&&e++,t.author&&e++,t.nauthor&&e++,t.email&&e++,t.merges&&e++,t.hidden&&e++,e}function x(){const e=new URLSearchParams;return t.repo&&e.set("repo",t.repo),t.rev&&e.set("rev",t.rev),t.path&&e.set("path",t.path),e.set("mode",t.mode),t.since&&e.set("since",t.since),t.until&&e.set("until",t.until),t.author&&e.set("author",t.author),t.nauthor&&e.set("nauthor",t.nauthor),t.email&&e.set("email","1"),t.merges&&e.set("merges","1"),t.hidden&&e.set("hidden","1"),e}async function q(e,r){const n=await fetch(`/api/${e}?${r}`),o=await n.json();if(!n.ok)throw new Error(o.error||`HTTP ${n.status}`);return o}function ee(){return q("table",x())}function te(){return q("tree",x())}function ae(){return q("hist",x())}function re(e){const r=new URLSearchParams;return r.set("repo",e),q("resolve",r)}function ne(){return t.since||t.until?`${t.since||"…"} → ${t.until||"…"}`:"All time 📅"}function A(e){return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,"0")}-${String(e.getDate()).padStart(2,"0")}`}const se=["January","February","March","April","May","June","July","August","September","October","November","December"],ie=["Su","Mo","Tu","We","Th","Fr","Sa"];function oe(){const e=Z(),r=e?` <span class="badge" aria-label="${e} active filters">${e}</span>`:"";return`<button id="filters-btn" class="btn btn-secondary" aria-expanded="${t.filtersOpen}" aria-haspopup="dialog">Filters${r}</button>`}function le(){if(!t.filtersOpen)return"";const e=r=>r?"checked":"";return`
  <div class="popover" role="dialog" aria-label="Analysis filters">
    <div class="grid grid-2">
      <label class="field">Revision / branch <input id="f-rev" class="input" value="${u(t.rev)}" /></label>
      <label class="field">Path filter <input id="f-path" class="input" value="${u(t.path)}" placeholder="subdir/" /></label>
      <label class="field">Date range
        <button id="f-dates" class="input" style="text-align:left;cursor:pointer" aria-haspopup="dialog">${u(ne())}</button>
      </label>
      <label class="field">Author <input id="f-author" class="input" value="${u(t.author)}" placeholder="--author" /></label>
      <label class="field">Exclude author <input id="f-nauthor" class="input" value="${u(t.nauthor)}" placeholder="--nauthor" /></label>
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
  </div>`}function M(e){return new Date(e.getFullYear(),e.getMonth(),1)}function ce(e){const r=/^(\d{4})-(\d{2})-(\d{2})/.exec(e);if(!r)return null;const n=new Date(Number(r[1]),Number(r[2])-1,Number(r[3]));return isNaN(n.getTime())?null:n}function de(e,r){var b,E,N,P,C,z,j;const n=e.querySelector("#filters-btn");n==null||n.addEventListener("click",d=>{d.stopPropagation(),t.filtersOpen=!t.filtersOpen,r()});const o=d=>{var v;return((v=e.querySelector(`#${d}`))==null?void 0:v.value)??""},s=d=>{var v;return((v=e.querySelector(`#${d}`))==null?void 0:v.checked)??!1},a=e.querySelector("#date-dialog");let c=M(new Date),p="",i="";const g=()=>{const d=a==null?void 0:a.querySelector("#d-summary");d&&(d.textContent=p||i?`${p||"…"} → ${i||"…"}`:"All time — click a day to set the start, click again for the end.")},h=()=>{const d=a==null?void 0:a.querySelector("#cal-grid"),v=a==null?void 0:a.querySelector("#cal-title");if(!d||!v||!a)return;v.textContent=`${se[c.getMonth()]} ${c.getFullYear()}`;const S=A(new Date),Y=new Date(c.getFullYear(),c.getMonth(),1).getDay(),U=new Date(c.getFullYear(),c.getMonth()+1,0).getDate();let T=ie.map(y=>`<span class="cal-dow">${y}</span>`).join("");for(let y=0;y<Y;y++)T+="<span></span>";for(let y=1;y<=U;y++){const w=A(new Date(c.getFullYear(),c.getMonth(),y)),$=w===p,I=w===i&&i!==p,J=p&&i&&w>p&&w<i,V=["cal-day",$||I?"endpoint":"",J?"in-range":"",w===S?"today":""].filter(Boolean).join(" ");T+=`<button class="${V}" data-day="${w}" role="gridcell" aria-label="${w}${$?", range start":I?", range end":""}">${y}</button>`}d.innerHTML=T,d.querySelectorAll("button[data-day]").forEach(y=>{y.addEventListener("click",w=>{w.preventDefault();const $=y.dataset.day;!p||p&&i?(p=$,i=""):$<p?(i=p,p=$):i=$,h()})}),g()},l=()=>{if(!a)return;p=/^\d{4}-\d{2}-\d{2}/.test(t.since)?t.since.slice(0,10):"",i=/^\d{4}-\d{2}-\d{2}/.test(t.until)?t.until.slice(0,10):"";const d=ce(p)??new Date;c=M(d),h(),a.showModal()};(b=e.querySelector("#f-dates"))==null||b.addEventListener("click",l),(E=a==null?void 0:a.querySelector("#cal-prev"))==null||E.addEventListener("click",d=>{d.preventDefault(),c=new Date(c.getFullYear(),c.getMonth()-1,1),h()}),(N=a==null?void 0:a.querySelector("#cal-next"))==null||N.addEventListener("click",d=>{d.preventDefault(),c=new Date(c.getFullYear(),c.getMonth()+1,1),h()}),a==null||a.querySelectorAll("button[data-preset]").forEach(d=>{d.addEventListener("click",v=>{if(v.preventDefault(),d.dataset.preset==="all")p="",i="";else{const S=new Date;S.setDate(S.getDate()-Number(d.dataset.preset)),p=A(S),i="",c=M(S)}h()})});const f=()=>{const d=e.querySelector("#f-dates");d&&(d.textContent=t.since||t.until?`${t.since||"…"} → ${t.until||"…"}`:"All time 📅")};(P=e.querySelector("#d-apply"))==null||P.addEventListener("click",d=>{d.preventDefault(),t.since=p,t.until=i,a==null||a.close(),f()}),(C=e.querySelector("#d-cancel"))==null||C.addEventListener("click",d=>{d.preventDefault(),a==null||a.close()}),(z=e.querySelector("#f-apply"))==null||z.addEventListener("click",()=>{t.rev=o("f-rev")||"HEAD",t.path=o("f-path"),t.author=o("f-author"),t.nauthor=o("f-nauthor"),t.email=s("f-email"),t.merges=s("f-merges"),t.hidden=s("f-hidden"),t.filtersOpen=!1,r()}),(j=e.querySelector("#f-clear"))==null||j.addEventListener("click",()=>{t.rev="HEAD",t.path="",t.since="",t.until="",t.author="",t.nauthor="",t.email=!1,t.merges=!1,t.hidden=!1,t.filtersOpen=!1,r()})}function ue(){return`
  <div class="guide">
    <button id="guide-back" class="btn btn-secondary">← Back</button>
    <p class="caption" style="color:var(--muted);margin:32px 0 8px">Guide</p>
    <h1 class="display-lg">What can GitWho do?</h1>
    <p class="body-lg" style="color:var(--muted)">Three views over your full git history — plus the CLI they all run on.</p>

    <section data-aos="fade-up">
      <div class="spotlight">
        <p class="caption">Table</p>
        <h3>Every author, ranked</h3>
        <p class="body">Commits, files and lines (+/-) per author — sortable, filterable, mirrored from <code>git who table -l -f -m -c</code>.</p>
      </div>
    </section>

    <section data-aos="fade-up">
      <div class="spotlight spotlight-orange">
        <p class="caption">Tree &amp; History</p>
        <h3>Own every directory</h3>
        <p class="body">Top contributor per node, color-coded — plus a bar-chart timeline of winning authors per period.</p>
      </div>
    </section>

    <section class="grid grid-3" data-aos="fade-up">
      <div class="card">
        <p class="headline">Table</p>
        <p class="body-sm" style="color:var(--muted)">Sortable authorship ledger. Find your bus factor, top reviewers, and who to ask about any subsystem.</p>
      </div>
      <div class="card">
        <p class="headline">Tree</p>
        <p class="body-sm" style="color:var(--muted)">Collapsible file artboard. See who owns each directory at a glance, color-coded by author.</p>
      </div>
      <div class="card">
        <p class="headline">History</p>
        <p class="body-sm" style="color:var(--muted)">Activity atmosphere chart. Winning author per period, period totals, mode-aware bars.</p>
      </div>
    </section>

    <section data-aos="fade-up">
      <h2 class="display-md">Prefer the terminal?</h2>
      <p class="body" style="color:var(--muted)">The web UI runs the exact same analysis. Everything below works without a browser:</p>
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
  </div>`}function pe(e,r){var n;(n=e.querySelector("#guide-back"))==null||n.addEventListener("click",r)}const fe='<span class="t-git">Git</span><span class="t-who">Who</span><a id="brand-q" class="t-q" href="#" aria-label="Open the guide: what can GitWho do?">?</a>';function G(e,r){var o;const n=e.querySelector("#wordmark");n&&(n.innerHTML=fe,(o=n.querySelector("#brand-q"))==null||o.addEventListener("click",s=>{s.preventDefault(),r()}))}function me(){const e=t.analyzing,r=t.analyzeError?`<p class="error" role="alert">${u(t.analyzeError)}</p>`:"";return`
  <div class="landing">
    <h1 id="wordmark" class="display-xxl brand-title" aria-label="GitWho?"></h1>
    <p class="subhead sub" data-aos="fade-up" data-aos-delay="150">Who wrote this code?!</p>
    <form id="landing-form" class="landing-form" data-aos="fade-up" data-aos-delay="250">
      <div class="input-group level-2">
        <input id="landing-input" type="text" value="${u(t.landingInput)}"
          placeholder="Paste a GitHub link or local path…"
          aria-label="GitHub link or local repo path" ${e?"disabled":""} />
        <button class="btn btn-primary" type="submit" ${e?"disabled":""}>${e?"Cloning…":"Analyze"}</button>
      </div>
    </form>
    ${r}
    <button id="howto" class="howto-link" data-aos="fade-up" data-aos-delay="350">How to use GitWho →</button>
  </div>`}function he(e,r,n){var c;const o=e.querySelector("#wordmark");o&&!t.analyzing?X(o,"GitWho?",110,()=>G(e,n)):o&&G(e,n);const s=e.querySelector("#landing-form"),a=e.querySelector("#landing-input");t.analyzing||a==null||a.focus(),s==null||s.addEventListener("submit",p=>{p.preventDefault();const i=((a==null?void 0:a.value)??"").trim();i&&r(i)}),(c=e.querySelector("#howto"))==null||c.addEventListener("click",n)}function L(e,r,n){return`<button class="tab" data-mode="${e}" aria-pressed="${t.mode===e}" title="${n}">${r}</button>`}function be(){const e=(r,n)=>`<button class="tab" data-view="${r}" aria-pressed="${t.view===r}">${n}</button>`;return`
  <div class="topbar">
    <button class="brand btn-translucent brand-title" id="brand-home" aria-label="Back to home" style="border:none;cursor:pointer;font-size:22px"><span class="t-git">Git</span><span class="t-who">Who</span></button>
    <button id="brand-q" class="t-q btn-translucent" aria-label="Open the guide" style="border:none;cursor:pointer;font-size:22px;font-family:var(--font-display)">?</button>
    <span class="body-sm" style="color:var(--muted)" title="${u(t.repo)}">${u(t.repoName||t.repo)}</span>
    <span class="spacer"></span>
    <span class="popover-wrap">${oe()}${le()}</span>
    <button id="new-repo" class="btn btn-secondary">New</button>
    <button id="theme" class="btn-icon" aria-label="Toggle theme">◐</button>
  </div>
  <div class="wrap">
    <div class="toolbar" role="tablist" aria-label="Views">
      ${e("table","Table")} ${e("tree","Tree")} ${e("hist","History")}
      <span class="spacer"></span>
      ${L("commits","Commits","default")} ${L("lines","Lines","-l")}
      ${L("files","Files","-f")} ${L("last_modified","Last edit","-m")}
      ${L("first_modified","First edit","-c")}
    </div>
    <div id="view" role="tabpanel"><p class="legend">Loading…</p></div>
  </div>`}function ye(e,r){const n=Math.max(1,...r.buckets.map(a=>a.total)),o=r.buckets.reduce((a,c)=>c.value>((a==null?void 0:a.value)??-1)?c:a,r.buckets[0]),s=r.buckets.map(a=>{const c=a.value/n*100,p=(a.total-a.value)/n*100,i=`${a.period}: ${a.author.name||"(no commits)"} ${a.value}/${a.total}`;return`<div class="hist-row" role="img" aria-label="${u(i)}">
      <span>${u(a.period)}</span>
      <span class="hist-bar" aria-hidden="true"><span class="win" style="width:${c}%"></span><span class="rest" style="width:${p}%"></span></span>
      <span class="who"><span class="dot" style="background:${D(a.author.name||"?")}" aria-hidden="true"></span>${u(a.author.name||"—")} (${a.value}/${a.total})</span>
    </div>`}).join("");e.innerHTML=`
    ${o?`<div class="card spotlight spotlight-coral" style="margin-bottom:16px">
      <p class="caption">Peak period · ${u(o.period)}</p>
      <h3>${u(o.author.name||"—")}</h3>
      <p class="body">${o.value.toLocaleString()} of ${o.total.toLocaleString()} in ${u(o.period)}</p>
    </div>`:""}
    <p class="legend">Commit activity by period. Solid bar = winning author, faint bar = period total. Values follow the selected mode.</p>
    <div class="card" aria-label="History bar chart">${s||"<p>No history.</p>"}</div>`}function F(e,r){return r==="lines"?e.lines_added+e.lines_removed:r==="files"?e.files:e.commits}function R(e,r,n){const o=r.authors.filter(l=>{const f=t.tableFilter.toLowerCase();return!f||l.name.toLowerCase().includes(f)||l.email.toLowerCase().includes(f)}),s=t.tableSort||t.mode;o.sort((l,f)=>{let b=0;return s==="name"?b=l.name.localeCompare(f.name):s==="commits"?b=l.commits-f.commits:s==="files"?b=l.files-f.files:s==="lines"?b=l.lines_added+l.lines_removed-(f.lines_added+f.lines_removed):s==="last_edit"?b=+new Date(l.last_edit)-+new Date(f.last_edit):s==="first_edit"?b=+new Date(l.first_edit)-+new Date(f.first_edit):b=F(l,t.mode)-F(f,t.mode),b*t.tableSortDir});const a=o.slice(0,3),c=a.length?`<div class="grid grid-3" style="margin-bottom:16px">
        ${a.map((l,f)=>`
          <div class="card ${f===0?"card-featured level-2":""}">
            <p class="caption" style="color:var(--muted)">#${f+1} · ${F(l,t.mode).toLocaleString()}</p>
            <p class="headline"><span class="dot" style="background:${D(l.name)}" aria-hidden="true"></span>${u(l.name)}</p>
            <p class="body-sm" style="color:var(--muted)">${l.commits.toLocaleString()} commits · ${l.files.toLocaleString()} files · +${l.lines_added.toLocaleString()} / -${l.lines_removed.toLocaleString()}</p>
          </div>`).join("")}
      </div>`:"",i=[["name","Author"],["commits","Commits"],["files","Files"],["lines","Lines (+/-)"],["last_edit","Last edit"],["first_edit","First edit"]].map(([l,f])=>{const E=(t.tableSort||t.mode)===l?t.tableSortDir===-1?" ▼":" ▲":"";return`<th><button data-sort="${l}" aria-label="Sort by ${f}">${f}${E}</button></th>`}).join(""),g=o.map(l=>`
    <tr>
      <td><span class="dot" style="background:${D(l.name)}" aria-hidden="true"></span>${u(l.name)}<br/><small style="color:var(--muted)">${u(l.email)}</small></td>
      <td>${l.commits.toLocaleString()}</td>
      <td>${l.files.toLocaleString()}</td>
      <td><span class="check">+${l.lines_added.toLocaleString()}</span> / <span style="color:var(--danger)">-${l.lines_removed.toLocaleString()}</span></td>
      <td>${k(l.last_edit)}</td>
      <td>${k(l.first_edit)}</td>
    </tr>`).join("");e.innerHTML=`
    ${c}
    <div class="toolbar">
      <label class="field">Filter authors <input id="tf" class="input" type="search" value="${u(t.tableFilter)}" placeholder="name or email" /></label>
    </div>
    <div class="card" style="padding:0;overflow:auto">
    <table class="data" aria-label="Contributions by author">
      <thead><tr>${i}</tr></thead>
      <tbody>${g||'<tr><td colspan="6">No authors.</td></tr>'}</tbody>
    </table></div>`,e.querySelectorAll("button[data-sort]").forEach(l=>{l.onclick=()=>{const f=l.dataset.sort;(t.tableSort||t.mode)===f?t.tableSortDir*=-1:(t.tableSort=f,t.tableSortDir=-1),n()}});const h=e.querySelector("#tf");h==null||h.addEventListener("input",()=>{t.tableFilter=h.value,R(e,r,n)})}function ge(e,r){if(!r)return e;let n=e;for(const o of r.split("/")){const s=(n.children||[]).find(a=>a.name===o&&a.is_dir);if(!s)return null;n=s}return n}function ve(){return t.mode==="lines"?"Lines":t.mode==="files"?"Files":t.mode==="last_modified"?"Last edit":t.mode==="first_modified"?"First edit":"Commits"}function we(e){return t.mode==="lines"?`+${e.metrics.lines_added.toLocaleString()} / -${e.metrics.lines_removed.toLocaleString()}`:t.mode==="files"?e.metrics.files.toLocaleString():t.mode==="last_modified"?k(e.metrics.last_edit):t.mode==="first_modified"?k(e.metrics.first_edit):e.metrics.commits.toLocaleString()}function $e(e,r,n){if(!r.root){e.innerHTML="<p>No commits; tree is empty.</p>";return}const s=((ge(r.root,t.treePath)??r.root).children||[]).filter(i=>i.in_work_tree).sort((i,g)=>Number(g.is_dir)-Number(i.is_dir)||i.name.localeCompare(g.name)),a=t.treePath?t.treePath.split("/"):[],c=[`<button data-crumb="" class="crumb" aria-label="Repository root">${u(r.root.name==="."?t.repoName||"repo":r.root.name)}</button>`];a.forEach((i,g)=>{const h=a.slice(0,g+1).join("/");c.push(`<span aria-hidden="true">/</span> <button data-crumb="${u(h)}" class="crumb">${u(i)}</button>`)});const p=s.map(i=>{const g=i.is_dir?"📁":"📄",h=i.is_dir?`<button data-enter="${u(i.is_dir?t.treePath?t.treePath+"/"+i.name:i.name:"")}" class="linklike">${u(i.name)}</button>`:`<span>${u(i.name)}</span>`;return`<tr>
      <td><span aria-hidden="true">${g}</span> ${h}</td>
      <td><span class="dot" style="background:${D(i.author.name)}" aria-hidden="true"></span>${u(i.author.name)}</td>
      <td>${u(we(i))}</td>
      <td style="color:var(--muted)">${k(i.metrics.last_edit)}</td>
    </tr>`}).join("");e.innerHTML=`
    <div class="toolbar">
      <nav class="body" aria-label="Breadcrumb">${c.join(" ")}</nav>
      <span class="spacer"></span>
      <span class="legend">Top contributor per node, color-coded by author.</span>
    </div>
    <div class="card" style="padding:0;overflow:auto">
    <table class="data" aria-label="Files by top contributor">
      <thead><tr><th>Name</th><th>Top contributor</th><th>${ve()}</th><th>Last edit</th></tr></thead>
      <tbody>${p||'<tr><td colspan="4">Empty directory.</td></tr>'}</tbody>
    </table></div>`,e.querySelectorAll("button[data-crumb]").forEach(i=>{i.onclick=()=>{t.treePath=i.dataset.crumb??"",n()}}),e.querySelectorAll("button[data-enter]").forEach(i=>{i.onclick=()=>{t.treePath=i.dataset.enter??"",n()}})}async function Se(e){try{t.view==="table"?R(e,await ee(),m):t.view==="tree"?$e(e,await te(),m):ye(e,await ae())}catch(r){e.innerHTML=`<p class="error" role="alert">Error: ${u(r.message)}</p>`}}function W(e){t.guideFrom=e,t.screen="guide",m()}function Le(){t.screen=t.guideFrom==="app"&&t.repo?"app":"landing",m()}function m(){var r,n,o,s;const e=document.getElementById("app");if(t.screen==="guide"){e.innerHTML=ue(),pe(e,Le),_();return}if(!t.repo){t.screen="landing",e.innerHTML=me(),he(e,B,()=>W("landing")),_();return}t.screen="app",e.innerHTML=be(),(r=e.querySelector("#brand-home"))==null||r.addEventListener("click",()=>{t.repo="",t.repoName="",t.analyzeError="",m()}),(n=e.querySelector("#brand-q"))==null||n.addEventListener("click",()=>W("app")),(o=e.querySelector("#new-repo"))==null||o.addEventListener("click",()=>{t.repo="",t.repoName="",t.analyzeError="",m()}),(s=e.querySelector("#theme"))==null||s.addEventListener("click",()=>{const a=document.documentElement,c=a.getAttribute("data-theme")==="dark"?"light":"dark";a.setAttribute("data-theme",c),localStorage.setItem("git-who-theme",c)}),e.querySelectorAll("button[data-view]").forEach(a=>{a.onclick=()=>{t.view=a.dataset.view,m()}}),e.querySelectorAll("button[data-mode]").forEach(a=>{a.onclick=()=>{t.mode=a.dataset.mode,t.tableSort="",m()}}),de(e,m),document.onpointerdown=a=>{t.filtersOpen&&!a.target.closest(".popover-wrap")&&(t.filtersOpen=!1,m())},document.onkeydown=a=>{a.key==="Escape"&&t.filtersOpen&&(t.filtersOpen=!1,m())},Se(e.querySelector("#view")),_()}async function B(e){t.analyzing=!0,t.analyzeError="",t.landingInput=e,m();try{const r=await re(e);t.repo=r.repo,t.repoName=r.name,t.treePath="",t.collapsed.clear(),t.analyzing=!1;const n=new URL(location.href);n.searchParams.set("repo",e),history.replaceState(null,"",n),m()}catch(r){t.analyzing=!1,t.analyzeError=r.message,m()}}function ke(){K(),Q();const e=localStorage.getItem("git-who-theme");e&&document.documentElement.setAttribute("data-theme",e);const n=new URLSearchParams(location.search).get("repo");if(n){t.landingInput=n,B(n);return}m()}ke();
