(function(){const r=document.createElement("link").relList;if(r&&r.supports&&r.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))i(s);new MutationObserver(s=>{for(const a of s)if(a.type==="childList")for(const l of a.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&i(l)}).observe(document,{childList:!0,subtree:!0});function n(s){const a={};return s.integrity&&(a.integrity=s.integrity),s.referrerPolicy&&(a.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?a.credentials="include":s.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function i(s){if(s.ep)return;s.ep=!0;const a=n(s);fetch(s.href,a)}})();const O=()=>window.matchMedia("(prefers-reduced-motion: reduce)").matches;let F=!1;function Q(){F||!window.AOS||O()||(window.AOS.init({duration:600,easing:"ease-out",once:!0,offset:40}),F=!0)}function _(){F&&window.AOS&&!O()&&window.AOS.refresh()}function X(){const e=()=>{document.querySelectorAll(".topbar").forEach(r=>{r.classList.toggle("scrolled",window.scrollY>8)})};window.addEventListener("scroll",e,{passive:!0}),e()}function Z(e,r,n,i){if(O()){i();return}e.classList.add("typing");let s=0;const a=()=>{s++,e.textContent=r.slice(0,s),s<r.length?window.setTimeout(a,n):(e.classList.remove("typing"),i())};a()}const t={repo:"",repoName:"",rev:"HEAD",path:"",mode:"commits",view:"table",since:"",until:"",author:"",nauthor:"",email:!1,merges:!1,hidden:!1,tableSort:"",tableSortDir:-1,tableFilter:"",collapsed:new Set,treePath:"",filtersOpen:!1,screen:"landing",guideFrom:"landing",landingInput:"",analyzing:!1,analyzeError:""};function c(e){return e.replace(/[&<>"']/g,r=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[r])}function E(e){let r=0;for(let n=0;n<e.length;n++)r=r*31+e.charCodeAt(n)>>>0;return`hsl(${r%360} 65% 50%)`}function L(e){if(!e||e.startsWith("0001-"))return"-";const r=new Date(e);return isNaN(r.getTime())?e:r.toLocaleDateString()}function ee(){let e=0;return t.rev&&t.rev!=="HEAD"&&e++,t.path&&e++,t.since&&e++,t.until&&e++,t.author&&e++,t.nauthor&&e++,t.email&&e++,t.merges&&e++,t.hidden&&e++,e}function N(){const e=new URLSearchParams;return t.repo&&e.set("repo",t.repo),t.rev&&e.set("rev",t.rev),t.path&&e.set("path",t.path),e.set("mode",t.mode),t.since&&e.set("since",t.since),t.until&&e.set("until",t.until),t.author&&e.set("author",t.author),t.nauthor&&e.set("nauthor",t.nauthor),t.email&&e.set("email","1"),t.merges&&e.set("merges","1"),t.hidden&&e.set("hidden","1"),e}async function D(e,r){const n=await fetch(`/api/${e}?${r}`),i=await n.json();if(!n.ok)throw new Error(i.error||`HTTP ${n.status}`);return i}function te(){return D("table",N())}function ae(){return D("tree",N())}function re(){return D("hist",N())}function ne(e){const r=new URLSearchParams;return r.set("repo",e),D("resolve",r)}function se(){return t.since||t.until?`${t.since||"…"} → ${t.until||"…"}`:"All time 📅"}function A(e){return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,"0")}-${String(e.getDate()).padStart(2,"0")}`}const ie=["January","February","March","April","May","June","July","August","September","October","November","December"],oe=["Su","Mo","Tu","We","Th","Fr","Sa"];function le(){const e=ee(),r=e?` <span class="badge" aria-label="${e} active filters">${e}</span>`:"";return`<button id="filters-btn" class="btn btn-secondary" aria-expanded="${t.filtersOpen}" aria-haspopup="dialog">Filters${r}</button>`}function ce(){if(!t.filtersOpen)return"";const e=r=>r?"checked":"";return`
  <div class="popover" role="dialog" aria-label="Analysis filters">
    <div class="grid grid-2">
      <label class="field">Revision / branch <input id="f-rev" class="input" value="${c(t.rev)}" /></label>
      <label class="field">Path filter <input id="f-path" class="input" value="${c(t.path)}" placeholder="subdir/" /></label>
      <label class="field">Date range
        <button id="f-dates" class="input" style="text-align:left;cursor:pointer" aria-haspopup="dialog">${c(se())}</button>
      </label>
      <label class="field">Author <input id="f-author" class="input" value="${c(t.author)}" placeholder="--author" /></label>
      <label class="field">Exclude author <input id="f-nauthor" class="input" value="${c(t.nauthor)}" placeholder="--nauthor" /></label>
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
  </div>`}function M(e){return new Date(e.getFullYear(),e.getMonth(),1)}function de(e){const r=/^(\d{4})-(\d{2})-(\d{2})/.exec(e);if(!r)return null;const n=new Date(Number(r[1]),Number(r[2])-1,Number(r[3]));return isNaN(n.getTime())?null:n}function ue(e,r){var q,k,x,P,C,j,z;const n=e.querySelector("#filters-btn");n==null||n.addEventListener("click",d=>{d.stopPropagation(),t.filtersOpen=!t.filtersOpen,r()});const i=d=>{var y;return((y=e.querySelector(`#${d}`))==null?void 0:y.value)??""},s=d=>{var y;return((y=e.querySelector(`#${d}`))==null?void 0:y.checked)??!1},a=e.querySelector("#date-dialog");let l=M(new Date),u="",o="";const m=()=>{const d=a==null?void 0:a.querySelector("#d-summary");d&&(d.textContent=u||o?`${u||"…"} → ${o||"…"}`:"All time. Click a day for start, again for end.")},h=()=>{const d=a==null?void 0:a.querySelector("#cal-grid"),y=a==null?void 0:a.querySelector("#cal-title");if(!d||!y||!a)return;y.textContent=`${ie[l.getMonth()]} ${l.getFullYear()}`;const w=A(new Date),U=new Date(l.getFullYear(),l.getMonth(),1).getDay(),J=new Date(l.getFullYear(),l.getMonth()+1,0).getDate();let T=oe.map(b=>`<span class="cal-dow">${b}</span>`).join("");for(let b=0;b<U;b++)T+="<span></span>";for(let b=1;b<=J;b++){const v=A(new Date(l.getFullYear(),l.getMonth(),b)),$=v===u,G=v===o&&o!==u,K=u&&o&&v>u&&v<o,V=["cal-day",$||G?"endpoint":"",K?"in-range":"",v===w?"today":""].filter(Boolean).join(" ");T+=`<button class="${V}" data-day="${v}" role="gridcell" aria-label="${v}${$?", range start":G?", range end":""}">${b}</button>`}d.innerHTML=T,d.querySelectorAll("button[data-day]").forEach(b=>{b.addEventListener("click",v=>{v.preventDefault();const $=b.dataset.day;!u||u&&o?(u=$,o=""):$<u?(o=u,u=$):o=$,h()})}),m()},p=()=>{if(!a)return;u=/^\d{4}-\d{2}-\d{2}/.test(t.since)?t.since.slice(0,10):"",o=/^\d{4}-\d{2}-\d{2}/.test(t.until)?t.until.slice(0,10):"";const d=de(u)??new Date;l=M(d),h(),a.showModal()};(q=e.querySelector("#f-dates"))==null||q.addEventListener("click",p),(k=a==null?void 0:a.querySelector("#cal-prev"))==null||k.addEventListener("click",d=>{d.preventDefault(),l=new Date(l.getFullYear(),l.getMonth()-1,1),h()}),(x=a==null?void 0:a.querySelector("#cal-next"))==null||x.addEventListener("click",d=>{d.preventDefault(),l=new Date(l.getFullYear(),l.getMonth()+1,1),h()}),a==null||a.querySelectorAll("button[data-preset]").forEach(d=>{d.addEventListener("click",y=>{if(y.preventDefault(),d.dataset.preset==="all")u="",o="";else{const w=new Date;w.setDate(w.getDate()-Number(d.dataset.preset)),u=A(w),o="",l=M(w)}h()})});const g=()=>{const d=e.querySelector("#f-dates");d&&(d.textContent=t.since||t.until?`${t.since||"…"} → ${t.until||"…"}`:"All time 📅")};(P=e.querySelector("#d-apply"))==null||P.addEventListener("click",d=>{d.preventDefault(),t.since=u,t.until=o,a==null||a.close(),g()}),(C=e.querySelector("#d-cancel"))==null||C.addEventListener("click",d=>{d.preventDefault(),a==null||a.close()}),(j=e.querySelector("#f-apply"))==null||j.addEventListener("click",()=>{t.rev=i("f-rev")||"HEAD",t.path=i("f-path"),t.author=i("f-author"),t.nauthor=i("f-nauthor"),t.email=s("f-email"),t.merges=s("f-merges"),t.hidden=s("f-hidden"),t.filtersOpen=!1,r()}),(z=e.querySelector("#f-clear"))==null||z.addEventListener("click",()=>{t.rev="HEAD",t.path="",t.since="",t.until="",t.author="",t.nauthor="",t.email=!1,t.merges=!1,t.hidden=!1,t.filtersOpen=!1,r()})}function pe(){return`
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
  </div>`}function fe(e,r){var n;(n=e.querySelector("#guide-back"))==null||n.addEventListener("click",r)}const me='<span class="t-git">Git</span><span class="t-who">Who</span><a id="brand-q" class="t-q" href="#" aria-label="Open the guide: what can GitWho do?">?</a>';function I(e,r){var i;const n=e.querySelector("#wordmark");n&&(n.innerHTML=me,(i=n.querySelector("#brand-q"))==null||i.addEventListener("click",s=>{s.preventDefault(),r()}))}function he(){const e=t.analyzing,r=t.analyzeError?`<p class="error" role="alert">${c(t.analyzeError)}</p>`:"";return`
  <div class="landing">
    <h1 id="wordmark" class="display-xxl brand-title" aria-label="GitWho?"></h1>
    <p class="subhead sub" data-aos="fade-up" data-aos-delay="150">Who wrote this code?!</p>
    <form id="landing-form" class="landing-form" data-aos="fade-up" data-aos-delay="250">
      <div class="input-group level-2">
        <input id="landing-input" type="text" value="${c(t.landingInput)}"
          placeholder="Paste a GitHub link or local path…"
          aria-label="GitHub link or local repo path" ${e?"disabled":""} />
        <button class="btn btn-primary" type="submit" ${e?"disabled":""}>${e?"Cloning…":"Analyze"}</button>
      </div>
    </form>
    ${r}
    <button id="howto" class="howto-link" data-aos="fade-up" data-aos-delay="350">How to use GitWho →</button>
  </div>`}function be(e,r,n){var l;const i=e.querySelector("#wordmark");i&&!t.analyzing?Z(i,"GitWho?",110,()=>I(e,n)):i&&I(e,n);const s=e.querySelector("#landing-form"),a=e.querySelector("#landing-input");t.analyzing||a==null||a.focus(),s==null||s.addEventListener("submit",u=>{u.preventDefault();const o=((a==null?void 0:a.value)??"").trim();o&&r(o)}),(l=e.querySelector("#howto"))==null||l.addEventListener("click",n)}function S(e,r,n){return`<button class="tab" data-mode="${e}" aria-pressed="${t.mode===e}" title="${n}">${r}</button>`}function ge(){const e=(r,n)=>`<button class="tab" data-view="${r}" aria-pressed="${t.view===r}">${n}</button>`;return`
  <div class="topbar">
    <button class="brand btn-translucent brand-title" id="brand-home" aria-label="Back to home" style="border:none;cursor:pointer;font-size:22px"><span class="t-git">Git</span><span class="t-who">Who</span></button>
    <button id="brand-q" class="t-q btn-translucent" aria-label="Open the guide" style="border:none;cursor:pointer;font-size:22px;font-family:var(--font-display)">?</button>
    <span class="body-sm" style="color:var(--muted)" title="${c(t.repo)}">${c(t.repoName||t.repo)}</span>
    <span class="spacer"></span>
    <span class="popover-wrap">${le()}${ce()}</span>
    <button id="new-repo" class="btn btn-secondary">New</button>
    <button id="theme" class="btn-icon" aria-label="Toggle theme">◐</button>
  </div>
  <div class="wrap">
    <div class="toolbar" role="tablist" aria-label="Views">
      ${e("table","Table")} ${e("tree","Tree")} ${e("hist","History")}
      <span class="spacer"></span>
      ${S("commits","Commits","default")} ${S("lines","Lines","-l")}
      ${S("files","Files","-f")} ${S("last_modified","Last edit","-m")}
      ${S("first_modified","First edit","-c")}
    </div>
    <div id="view" role="tabpanel"><p class="legend">Loading…</p></div>
  </div>`}function ye(e,r){const n=Math.max(1,...r.buckets.map(a=>a.total)),i=r.buckets.reduce((a,l)=>l.value>((a==null?void 0:a.value)??-1)?l:a,r.buckets[0]),s=r.buckets.map(a=>{const l=a.value/n*100,u=(a.total-a.value)/n*100,o=`${a.period}: ${a.author.name||"(no commits)"} ${a.value}/${a.total}`;return`<div class="hist-row" role="img" aria-label="${c(o)}">
      <span>${c(a.period)}</span>
      <span class="hist-bar" aria-hidden="true"><span class="win" style="width:${l}%"></span><span class="rest" style="width:${u}%"></span></span>
      <span class="who"><span class="dot" style="background:${E(a.author.name||"?")}" aria-hidden="true"></span>${c(a.author.name||"-")} (${a.value}/${a.total})</span>
    </div>`}).join("");e.innerHTML=`
    ${i?`<div class="card spotlight spotlight-coral" style="margin-bottom:16px">
      <p class="caption">Peak period · ${c(i.period)}</p>
      <h3>${c(i.author.name||"-")}</h3>
      <p class="body">${i.value.toLocaleString()} of ${i.total.toLocaleString()} in ${c(i.period)}</p>
    </div>`:""}
    <p class="legend">Solid bar: winner share. Faint bar: period total.</p>
    <div class="card" aria-label="History bar chart">${s||"<p>No history.</p>"}</div>`}function H(e,r){return r==="lines"?e.lines_added+e.lines_removed:r==="files"?e.files:e.commits}function W(e){const r=e.authors.filter(i=>{const s=t.tableFilter.toLowerCase();return!s||i.name.toLowerCase().includes(s)||i.email.toLowerCase().includes(s)}),n=t.tableSort||t.mode;return r.sort((i,s)=>{let a=0;return n==="name"?a=i.name.localeCompare(s.name):n==="commits"?a=i.commits-s.commits:n==="files"?a=i.files-s.files:n==="lines"?a=i.lines_added+i.lines_removed-(s.lines_added+s.lines_removed):n==="last_edit"?a=+new Date(i.last_edit)-+new Date(s.last_edit):n==="first_edit"?a=+new Date(i.first_edit)-+new Date(s.first_edit):a=H(i,t.mode)-H(s,t.mode),a*t.tableSortDir}),r}function R(e){return e.length?e.map(r=>`
    <tr>
      <td><span class="dot" style="background:${E(r.name)}" aria-hidden="true"></span>${c(r.name)}<br/><small style="color:var(--muted)">${c(r.email)}</small></td>
      <td>${r.commits.toLocaleString()}</td>
      <td>${r.files.toLocaleString()}</td>
      <td><span class="check">+${r.lines_added.toLocaleString()}</span> / <span style="color:var(--danger)">-${r.lines_removed.toLocaleString()}</span></td>
      <td>${L(r.last_edit)}</td>
      <td>${L(r.first_edit)}</td>
    </tr>`).join(""):'<tr><td colspan="6">No authors.</td></tr>'}function ve(e,r,n){const i=W(r),s=i.slice(0,3),a=s.length?`<div class="grid grid-3" style="margin-bottom:16px">
        ${s.map((p,g)=>`
          <div class="card ${g===0?"card-featured level-2":""}">
            <p class="caption" style="color:var(--muted)">#${g+1} · ${H(p,t.mode).toLocaleString()}</p>
            <p class="headline"><span class="dot" style="background:${E(p.name)}" aria-hidden="true"></span>${c(p.name)}</p>
            <p class="body-sm" style="color:var(--muted)">${p.commits.toLocaleString()} commits · ${p.files.toLocaleString()} files · +${p.lines_added.toLocaleString()} / -${p.lines_removed.toLocaleString()}</p>
          </div>`).join("")}
      </div>`:"",u=[["name","Author"],["commits","Commits"],["files","Files"],["lines","Lines (+/-)"],["last_edit","Last edit"],["first_edit","First edit"]].map(([p,g])=>{const k=(t.tableSort||t.mode)===p?t.tableSortDir===-1?" ▼":" ▲":"";return`<th><button data-sort="${p}" aria-label="Sort by ${g}">${g}${k}</button></th>`}).join(""),o=r.authors.map(p=>`<option value="${c(p.name)}">${c(p.email)}</option>`).join("");e.innerHTML=`
    ${a}
    <div class="toolbar">
      <label class="field">Filter authors
        <input id="tf" class="input" type="search" list="author-suggest"
          value="${c(t.tableFilter)}" placeholder="name or email"
          aria-label="Filter authors" autocomplete="off" />
      </label>
      <datalist id="author-suggest">${o}</datalist>
    </div>
    <div class="card" style="padding:0;overflow:auto">
    <table class="data" aria-label="Contributions by author">
      <thead><tr>${u}</tr></thead>
      <tbody id="author-rows">${R(i)}</tbody>
    </table></div>`,e.querySelectorAll("button[data-sort]").forEach(p=>{p.onclick=()=>{const g=p.dataset.sort;(t.tableSort||t.mode)===g?t.tableSortDir*=-1:(t.tableSort=g,t.tableSortDir=-1),n()}});const m=e.querySelector("#tf"),h=e.querySelector("#author-rows");m==null||m.addEventListener("input",()=>{t.tableFilter=m.value,h&&(h.innerHTML=R(W(r)))})}function $e(e,r){if(!r)return e;let n=e;for(const i of r.split("/")){const s=(n.children||[]).find(a=>a.name===i&&a.is_dir);if(!s)return null;n=s}return n}function we(){return t.mode==="lines"?"Lines":t.mode==="files"?"Files":t.mode==="last_modified"?"Last edit":t.mode==="first_modified"?"First edit":"Commits"}function Se(e){return t.mode==="lines"?`+${e.metrics.lines_added.toLocaleString()} / -${e.metrics.lines_removed.toLocaleString()}`:t.mode==="files"?e.metrics.files.toLocaleString():t.mode==="last_modified"?L(e.metrics.last_edit):t.mode==="first_modified"?L(e.metrics.first_edit):e.metrics.commits.toLocaleString()}function Le(e,r,n){if(!r.root){e.innerHTML="<p>No commits; tree is empty.</p>";return}const s=(($e(r.root,t.treePath)??r.root).children||[]).filter(o=>o.in_work_tree).sort((o,m)=>Number(m.is_dir)-Number(o.is_dir)||o.name.localeCompare(m.name)),a=t.treePath?t.treePath.split("/"):[],l=[`<button data-crumb="" class="crumb" aria-label="Repository root">${c(r.root.name==="."?t.repoName||"repo":r.root.name)}</button>`];a.forEach((o,m)=>{const h=a.slice(0,m+1).join("/");l.push(`<span aria-hidden="true">/</span> <button data-crumb="${c(h)}" class="crumb">${c(o)}</button>`)});const u=s.map(o=>{const m=o.is_dir?"📁":"📄",h=o.is_dir?`<button data-enter="${c(o.is_dir?t.treePath?t.treePath+"/"+o.name:o.name:"")}" class="linklike">${c(o.name)}</button>`:`<span>${c(o.name)}</span>`;return`<tr>
      <td><span aria-hidden="true">${m}</span> ${h}</td>
      <td><span class="dot" style="background:${E(o.author.name)}" aria-hidden="true"></span>${c(o.author.name)}</td>
      <td>${c(Se(o))}</td>
      <td style="color:var(--muted)">${L(o.metrics.last_edit)}</td>
    </tr>`}).join("");e.innerHTML=`
    <div class="toolbar">
      <nav class="body" aria-label="Breadcrumb">${l.join(" ")}</nav>
      <span class="spacer"></span>
      <span class="legend">Top contributor per node.</span>
    </div>
    <div class="card" style="padding:0;overflow:auto">
    <table class="data" aria-label="Files by top contributor">
      <thead><tr><th>Name</th><th>Top contributor</th><th>${we()}</th><th>Last edit</th></tr></thead>
      <tbody>${u||'<tr><td colspan="4">Empty directory.</td></tr>'}</tbody>
    </table></div>`,e.querySelectorAll("button[data-crumb]").forEach(o=>{o.onclick=()=>{t.treePath=o.dataset.crumb??"",n()}}),e.querySelectorAll("button[data-enter]").forEach(o=>{o.onclick=()=>{t.treePath=o.dataset.enter??"",n()}})}async function ke(e){try{t.view==="table"?ve(e,await te(),f):t.view==="tree"?Le(e,await ae(),f):ye(e,await re())}catch(r){e.innerHTML=`<p class="error" role="alert">Error: ${c(r.message)}</p>`}}function B(e){t.guideFrom=e,t.screen="guide",f()}function Ee(){t.screen=t.guideFrom==="app"&&t.repo?"app":"landing",f()}function f(){var r,n,i,s;const e=document.getElementById("app");if(t.screen==="guide"){e.innerHTML=pe(),fe(e,Ee),_();return}if(!t.repo){t.screen="landing",e.innerHTML=he(),be(e,Y,()=>B("landing")),_();return}t.screen="app",e.innerHTML=ge(),(r=e.querySelector("#brand-home"))==null||r.addEventListener("click",()=>{t.repo="",t.repoName="",t.analyzeError="",f()}),(n=e.querySelector("#brand-q"))==null||n.addEventListener("click",()=>B("app")),(i=e.querySelector("#new-repo"))==null||i.addEventListener("click",()=>{t.repo="",t.repoName="",t.analyzeError="",f()}),(s=e.querySelector("#theme"))==null||s.addEventListener("click",()=>{const a=document.documentElement,l=a.getAttribute("data-theme")==="dark"?"light":"dark";a.setAttribute("data-theme",l),localStorage.setItem("git-who-theme",l)}),e.querySelectorAll("button[data-view]").forEach(a=>{a.onclick=()=>{t.view=a.dataset.view,f()}}),e.querySelectorAll("button[data-mode]").forEach(a=>{a.onclick=()=>{t.mode=a.dataset.mode,t.tableSort="",f()}}),ue(e,f),document.onpointerdown=a=>{t.filtersOpen&&!a.target.closest(".popover-wrap")&&(t.filtersOpen=!1,f())},document.onkeydown=a=>{a.key==="Escape"&&t.filtersOpen&&(t.filtersOpen=!1,f())},ke(e.querySelector("#view")),_()}async function Y(e){t.analyzing=!0,t.analyzeError="",t.landingInput=e,f();try{const r=await ne(e);t.repo=r.repo,t.repoName=r.name,t.treePath="",t.collapsed.clear(),t.analyzing=!1;const n=new URL(location.href);n.searchParams.set("repo",e),history.replaceState(null,"",n),f()}catch(r){t.analyzing=!1,t.analyzeError=r.message,f()}}function De(){Q(),X();const e=localStorage.getItem("git-who-theme");e&&document.documentElement.setAttribute("data-theme",e);const n=new URLSearchParams(location.search).get("repo");if(n){t.landingInput=n,Y(n);return}f()}De();
