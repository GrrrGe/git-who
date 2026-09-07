(function(){const r=document.createElement("link").relList;if(r&&r.supports&&r.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))l(i);new MutationObserver(i=>{for(const a of i)if(a.type==="childList")for(const d of a.addedNodes)d.tagName==="LINK"&&d.rel==="modulepreload"&&l(d)}).observe(document,{childList:!0,subtree:!0});function s(i){const a={};return i.integrity&&(a.integrity=i.integrity),i.referrerPolicy&&(a.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?a.credentials="include":i.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function l(i){if(i.ep)return;i.ep=!0;const a=s(i);fetch(i.href,a)}})();const W=()=>window.matchMedia("(prefers-reduced-motion: reduce)").matches;let j=!1;function Q(){j||!window.AOS||W()||(window.AOS.init({duration:600,easing:"ease-out",once:!0,offset:40}),j=!0)}function H(){j&&window.AOS&&!W()&&window.AOS.refresh()}function X(){const e=()=>{document.querySelectorAll(".topbar").forEach(r=>{r.classList.toggle("scrolled",window.scrollY>8)})};window.addEventListener("scroll",e,{passive:!0}),e()}function Z(e,r,s,l){if(W()){l();return}e.classList.add("typing");let i=0;const a=()=>{i++,e.textContent=r.slice(0,i),i<r.length?window.setTimeout(a,s):(e.classList.remove("typing"),l())};a()}const t={repo:"",repoName:"",rev:"HEAD",path:"",mode:"commits",view:"table",since:"",until:"",author:"",nauthor:"",email:!1,merges:!1,hidden:!1,tableSort:"",tableSortDir:-1,tableFilter:"",collapsed:new Set,treePath:"",filtersOpen:!1,screen:"landing",guideFrom:"landing",landingInput:"",analyzing:!1,analyzeError:""};function p(e){return e.replace(/[&<>"']/g,r=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[r])}function T(e){let r=0;for(let s=0;s<e.length;s++)r=r*31+e.charCodeAt(s)>>>0;return`hsl(${r%360} 65% 50%)`}function A(e){if(!e||e.startsWith("0001-"))return"-";const r=new Date(e);return isNaN(r.getTime())?e:r.toLocaleDateString()}function ee(){let e=0;return t.rev&&t.rev!=="HEAD"&&e++,t.path&&e++,t.since&&e++,t.until&&e++,t.author&&e++,t.nauthor&&e++,t.email&&e++,t.merges&&e++,t.hidden&&e++,e}function I(){const e=new URLSearchParams;return t.repo&&e.set("repo",t.repo),t.rev&&e.set("rev",t.rev),t.path&&e.set("path",t.path),e.set("mode",t.mode),t.since&&e.set("since",t.since),t.until&&e.set("until",t.until),t.author&&e.set("author",t.author),t.nauthor&&e.set("nauthor",t.nauthor),t.email&&e.set("email","1"),t.merges&&e.set("merges","1"),t.hidden&&e.set("hidden","1"),e}async function x(e,r){const s=await fetch(`/api/${e}?${r}`),l=await s.json();if(!s.ok)throw new Error(l.error||`HTTP ${s.status}`);return l}function te(){return x("table",I())}function ae(){return x("tree",I())}function re(){return x("hist",I())}function ne(e){const r=new URLSearchParams;return r.set("repo",e),x("resolve",r)}function se(){return t.since||t.until?`${t.since||"…"} → ${t.until||"…"}`:"All time 📅"}function C(e){return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,"0")}-${String(e.getDate()).padStart(2,"0")}`}const ie=["January","February","March","April","May","June","July","August","September","October","November","December"],le=["Su","Mo","Tu","We","Th","Fr","Sa"];function oe(){const e=ee(),r=e?` <span class="badge" aria-label="${e} active filters">${e}</span>`:"";return`<button id="filters-btn" class="btn btn-secondary" aria-expanded="${t.filtersOpen}" aria-haspopup="dialog">Filters${r}</button>`}function ce(){if(!t.filtersOpen)return"";const e=r=>r?"checked":"";return`
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
  </div>`}function N(e){return new Date(e.getFullYear(),e.getMonth(),1)}function de(e){const r=/^(\d{4})-(\d{2})-(\d{2})/.exec(e);if(!r)return null;const s=new Date(Number(r[1]),Number(r[2])-1,Number(r[3]));return isNaN(s.getTime())?null:s}function ue(e,r){var E,_,$,L,D,o,u;const s=e.querySelector("#filters-btn");s==null||s.addEventListener("click",c=>{c.stopPropagation(),t.filtersOpen=!t.filtersOpen,r()});const l=c=>{var y;return((y=e.querySelector(`#${c}`))==null?void 0:y.value)??""},i=c=>{var y;return((y=e.querySelector(`#${c}`))==null?void 0:y.checked)??!1},a=e.querySelector("#date-dialog");let d=N(new Date),f="",n="";const g=()=>{const c=a==null?void 0:a.querySelector("#d-summary");c&&(c.textContent=f||n?`${f||"…"} → ${n||"…"}`:"All time. Click a day for start, again for end.")},m=()=>{const c=a==null?void 0:a.querySelector("#cal-grid"),y=a==null?void 0:a.querySelector("#cal-title");if(!c||!y||!a)return;y.textContent=`${ie[d.getMonth()]} ${d.getFullYear()}`;const k=C(new Date),U=new Date(d.getFullYear(),d.getMonth(),1).getDay(),J=new Date(d.getFullYear(),d.getMonth()+1,0).getDate();let F=le.map(v=>`<span class="cal-dow">${v}</span>`).join("");for(let v=0;v<U;v++)F+="<span></span>";for(let v=1;v<=J;v++){const w=C(new Date(d.getFullYear(),d.getMonth(),v)),S=w===f,G=w===n&&n!==f,K=f&&n&&w>f&&w<n,V=["cal-day",S||G?"endpoint":"",K?"in-range":"",w===k?"today":""].filter(Boolean).join(" ");F+=`<button class="${V}" data-day="${w}" role="gridcell" aria-label="${w}${S?", range start":G?", range end":""}">${v}</button>`}c.innerHTML=F,c.querySelectorAll("button[data-day]").forEach(v=>{v.addEventListener("click",w=>{w.preventDefault();const S=v.dataset.day;!f||f&&n?(f=S,n=""):S<f?(n=f,f=S):n=S,m()})}),g()},b=()=>{if(!a)return;f=/^\d{4}-\d{2}-\d{2}/.test(t.since)?t.since.slice(0,10):"",n=/^\d{4}-\d{2}-\d{2}/.test(t.until)?t.until.slice(0,10):"";const c=de(f)??new Date;d=N(c),m(),a.showModal()};(E=e.querySelector("#f-dates"))==null||E.addEventListener("click",b),(_=a==null?void 0:a.querySelector("#cal-prev"))==null||_.addEventListener("click",c=>{c.preventDefault(),d=new Date(d.getFullYear(),d.getMonth()-1,1),m()}),($=a==null?void 0:a.querySelector("#cal-next"))==null||$.addEventListener("click",c=>{c.preventDefault(),d=new Date(d.getFullYear(),d.getMonth()+1,1),m()}),a==null||a.querySelectorAll("button[data-preset]").forEach(c=>{c.addEventListener("click",y=>{if(y.preventDefault(),c.dataset.preset==="all")f="",n="";else{const k=new Date;k.setDate(k.getDate()-Number(c.dataset.preset)),f=C(k),n="",d=N(k)}m()})});const M=()=>{const c=e.querySelector("#f-dates");c&&(c.textContent=t.since||t.until?`${t.since||"…"} → ${t.until||"…"}`:"All time 📅")};(L=e.querySelector("#d-apply"))==null||L.addEventListener("click",c=>{c.preventDefault(),t.since=f,t.until=n,a==null||a.close(),M()}),(D=e.querySelector("#d-cancel"))==null||D.addEventListener("click",c=>{c.preventDefault(),a==null||a.close()}),(o=e.querySelector("#f-apply"))==null||o.addEventListener("click",()=>{t.rev=l("f-rev")||"HEAD",t.path=l("f-path"),t.author=l("f-author"),t.nauthor=l("f-nauthor"),t.email=i("f-email"),t.merges=i("f-merges"),t.hidden=i("f-hidden"),t.filtersOpen=!1,r()}),(u=e.querySelector("#f-clear"))==null||u.addEventListener("click",()=>{t.rev="HEAD",t.path="",t.since="",t.until="",t.author="",t.nauthor="",t.email=!1,t.merges=!1,t.hidden=!1,t.filtersOpen=!1,r()})}function pe(){return`
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
  </div>`}function fe(e,r){var s;(s=e.querySelector("#guide-back"))==null||s.addEventListener("click",r)}const me='<span class="t-git">Git</span><span class="t-who">Who</span><a id="brand-q" class="t-q" href="#" aria-label="Open the guide: what can GitWho do?">?</a>';function R(e,r){var l;const s=e.querySelector("#wordmark");s&&(s.innerHTML=me,(l=s.querySelector("#brand-q"))==null||l.addEventListener("click",i=>{i.preventDefault(),r()}))}function he(){const e=t.analyzing,r=t.analyzeError?`<p class="error" role="alert">${p(t.analyzeError)}</p>`:"";return`
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
    ${r}
    <button id="howto" class="howto-link" data-aos="fade-up" data-aos-delay="350">How to use GitWho →</button>
  </div>`}function be(e,r,s){var d;const l=e.querySelector("#wordmark");l&&!t.analyzing?Z(l,"GitWho?",110,()=>R(e,s)):l&&R(e,s);const i=e.querySelector("#landing-form"),a=e.querySelector("#landing-input");t.analyzing||a==null||a.focus(),i==null||i.addEventListener("submit",f=>{f.preventDefault();const n=((a==null?void 0:a.value)??"").trim();n&&r(n)}),(d=e.querySelector("#howto"))==null||d.addEventListener("click",s)}function q(e,r,s){return`<button class="tab" data-mode="${e}" aria-pressed="${t.mode===e}" title="${s}">${r}</button>`}function ge(){const e=(r,s)=>`<button class="tab" data-view="${r}" aria-pressed="${t.view===r}">${s}</button>`;return`
  <div class="topbar">
    <button class="brand btn-translucent brand-title" id="brand-home" aria-label="Back to home" style="border:none;cursor:pointer;font-size:22px"><span class="t-git">Git</span><span class="t-who">Who</span></button>
    <button id="brand-q" class="t-q btn-translucent" aria-label="Open the guide" style="border:none;cursor:pointer;font-size:22px;font-family:var(--font-display)">?</button>
    <span class="body-sm" style="color:var(--muted)" title="${p(t.repo)}">${p(t.repoName||t.repo)}</span>
    <span class="spacer"></span>
    <span class="popover-wrap">${oe()}${ce()}</span>
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
  </div>`}function ye(e,r){const s=Math.max(1,...r.buckets.map(a=>a.total)),l=r.buckets.reduce((a,d)=>d.value>((a==null?void 0:a.value)??-1)?d:a,r.buckets[0]),i=r.buckets.map(a=>{const d=a.value/s*100,f=(a.total-a.value)/s*100,n=`${a.period}: ${a.author.name||"(no commits)"} ${a.value}/${a.total}`;return`<div class="hist-row" role="img" aria-label="${p(n)}">
      <span>${p(a.period)}</span>
      <span class="hist-bar" aria-hidden="true"><span class="win" style="width:${d}%"></span><span class="rest" style="width:${f}%"></span></span>
      <span class="who"><span class="dot" style="background:${T(a.author.name||"?")}" aria-hidden="true"></span>${p(a.author.name||"-")} (${a.value}/${a.total})</span>
    </div>`}).join("");e.innerHTML=`
    ${l?`<div class="card spotlight spotlight-coral" style="margin-bottom:16px">
      <p class="caption">Peak period · ${p(l.period)}</p>
      <h3>${p(l.author.name||"-")}</h3>
      <p class="body">${l.value.toLocaleString()} of ${l.total.toLocaleString()} in ${p(l.period)}</p>
    </div>`:""}
    <p class="legend">Solid bar: winner share. Faint bar: period total.</p>
    <div class="card" aria-label="History bar chart">${i||"<p>No history.</p>"}</div>`}function z(e,r){return r==="lines"?e.lines_added+e.lines_removed:r==="files"?e.files:e.commits}function O(e){const r=e.authors.filter(l=>{const i=t.tableFilter.toLowerCase();return!i||l.name.toLowerCase().includes(i)||l.email.toLowerCase().includes(i)}),s=t.tableSort||t.mode;return r.sort((l,i)=>{let a=0;return s==="name"?a=l.name.localeCompare(i.name):s==="commits"?a=l.commits-i.commits:s==="files"?a=l.files-i.files:s==="lines"?a=l.lines_added+l.lines_removed-(i.lines_added+i.lines_removed):s==="last_edit"?a=+new Date(l.last_edit)-+new Date(i.last_edit):s==="first_edit"?a=+new Date(l.first_edit)-+new Date(i.first_edit):a=z(l,t.mode)-z(i,t.mode),a*t.tableSortDir}),r}function P(e){return e.length?e.map(r=>`
    <tr>
      <td><span class="dot" style="background:${T(r.name)}" aria-hidden="true"></span>${p(r.name)}<br/><small style="color:var(--muted)">${p(r.email)}</small></td>
      <td>${r.commits.toLocaleString()}</td>
      <td>${r.files.toLocaleString()}</td>
      <td><span class="check">+${r.lines_added.toLocaleString()}</span> / <span style="color:var(--danger)">-${r.lines_removed.toLocaleString()}</span></td>
      <td>${A(r.last_edit)}</td>
      <td>${A(r.first_edit)}</td>
    </tr>`).join(""):'<tr><td colspan="6">No authors.</td></tr>'}function ve(e,r,s){const l=O(r),i=l.slice(0,3),a=i.length?`<div class="grid grid-3" style="margin-bottom:16px">
        ${i.map((o,u)=>`
          <div class="card ${u===0?"card-featured level-2":""}">
            <p class="caption" style="color:var(--muted)">#${u+1} · ${z(o,t.mode).toLocaleString()}</p>
            <p class="headline"><span class="dot" style="background:${T(o.name)}" aria-hidden="true"></span>${p(o.name)}</p>
            <p class="body-sm" style="color:var(--muted)">${o.commits.toLocaleString()} commits · ${o.files.toLocaleString()} files · +${o.lines_added.toLocaleString()} / -${o.lines_removed.toLocaleString()}</p>
          </div>`).join("")}
      </div>`:"",f=[["name","Author"],["commits","Commits"],["files","Files"],["lines","Lines (+/-)"],["last_edit","Last edit"],["first_edit","First edit"]].map(([o,u])=>{const y=(t.tableSort||t.mode)===o?t.tableSortDir===-1?" ▼":" ▲":"";return`<th><button data-sort="${o}" aria-label="Sort by ${u}">${u}${y}</button></th>`}).join("");e.innerHTML=`
    ${a}
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
    </table></div>`,e.querySelectorAll("button[data-sort]").forEach(o=>{o.onclick=()=>{const u=o.dataset.sort;(t.tableSort||t.mode)===u?t.tableSortDir*=-1:(t.tableSort=u,t.tableSortDir=-1),s()}});const n=e.querySelector("#tf"),g=e.querySelector("#author-rows"),m=e.querySelector("#suggest");let b=-1;const M=()=>{const o=t.tableFilter.toLowerCase().trim();return o?r.authors.filter(u=>u.name.toLowerCase().includes(o)||u.email.toLowerCase().includes(o)).sort((u,c)=>E(u)-E(c)).slice(0,8):r.authors.slice(0,8)},E=o=>{const u=t.tableFilter.toLowerCase().trim();return o.name.toLowerCase().startsWith(u)?0:o.email.toLowerCase().startsWith(u)?1:2},_=o=>{const u=t.tableFilter.trim();if(!u)return p(o);const c=o.toLowerCase().indexOf(u.toLowerCase());return c<0?p(o):p(o.slice(0,c))+'<b class="hl">'+p(o.slice(c,c+u.length))+"</b>"+p(o.slice(c+u.length))},$=()=>{if(!m||!n)return;const o=M();o.length?(m.innerHTML=o.map((u,c)=>`
        <button class="suggest-item${c===b?" active":""}" role="option"
          aria-selected="${c===b}" data-i="${c}">
          <span class="dot" style="background:${T(u.name)}" aria-hidden="true"></span>
          <span>${_(u.name)}</span>
          <small style="color:var(--muted)">${p(u.email)}</small>
        </button>`).join(""),m.querySelectorAll(".suggest-item").forEach(u=>{u.addEventListener("mousedown",c=>{c.preventDefault(),D(o[Number(u.dataset.i)])})})):m.innerHTML='<div class="suggest-empty">No matching authors.</div>',m.hidden=!1,n.setAttribute("aria-expanded","true")},L=()=>{!m||!n||(m.hidden=!0,n.setAttribute("aria-expanded","false"),b=-1)},D=o=>{t.tableFilter=o.name,n&&(n.value=o.name),g&&(g.innerHTML=P(O(r))),L()};n==null||n.addEventListener("input",()=>{t.tableFilter=n.value,b=-1,g&&(g.innerHTML=P(O(r))),$()}),n==null||n.addEventListener("focus",()=>{b=-1,$()}),n==null||n.addEventListener("keydown",o=>{if(m!=null&&m.hidden)return;const u=M();o.key==="ArrowDown"?(o.preventDefault(),b=Math.min(b+1,u.length-1),$()):o.key==="ArrowUp"?(o.preventDefault(),b=Math.max(b-1,-1),$()):o.key==="Enter"&&b>=0&&u[b]?(o.preventDefault(),D(u[b])):o.key==="Escape"&&L()}),n==null||n.addEventListener("blur",()=>L())}function we(e,r){if(!r)return e;let s=e;for(const l of r.split("/")){const i=(s.children||[]).find(a=>a.name===l&&a.is_dir);if(!i)return null;s=i}return s}function $e(){return t.mode==="lines"?"Lines":t.mode==="files"?"Files":t.mode==="last_modified"?"Last edit":t.mode==="first_modified"?"First edit":"Commits"}function Se(e){return t.mode==="lines"?`+${e.metrics.lines_added.toLocaleString()} / -${e.metrics.lines_removed.toLocaleString()}`:t.mode==="files"?e.metrics.files.toLocaleString():t.mode==="last_modified"?A(e.metrics.last_edit):t.mode==="first_modified"?A(e.metrics.first_edit):e.metrics.commits.toLocaleString()}function Le(e,r,s){if(!r.root){e.innerHTML="<p>No commits; tree is empty.</p>";return}const i=((we(r.root,t.treePath)??r.root).children||[]).filter(n=>n.in_work_tree).sort((n,g)=>Number(g.is_dir)-Number(n.is_dir)||n.name.localeCompare(g.name)),a=t.treePath?t.treePath.split("/"):[],d=[`<button data-crumb="" class="crumb" aria-label="Repository root">${p(r.root.name==="."?t.repoName||"repo":r.root.name)}</button>`];a.forEach((n,g)=>{const m=a.slice(0,g+1).join("/");d.push(`<span aria-hidden="true">/</span> <button data-crumb="${p(m)}" class="crumb">${p(n)}</button>`)});const f=i.map(n=>{const g=n.is_dir?"📁":"📄",m=n.is_dir?`<button data-enter="${p(n.is_dir?t.treePath?t.treePath+"/"+n.name:n.name:"")}" class="linklike">${p(n.name)}</button>`:`<span>${p(n.name)}</span>`;return`<tr>
      <td><span aria-hidden="true">${g}</span> ${m}</td>
      <td><span class="dot" style="background:${T(n.author.name)}" aria-hidden="true"></span>${p(n.author.name)}</td>
      <td>${p(Se(n))}</td>
      <td style="color:var(--muted)">${A(n.metrics.last_edit)}</td>
    </tr>`}).join("");e.innerHTML=`
    <div class="toolbar">
      <nav class="body" aria-label="Breadcrumb">${d.join(" ")}</nav>
      <span class="spacer"></span>
      <span class="legend">Top contributor per node.</span>
    </div>
    <div class="card" style="padding:0;overflow:auto">
    <table class="data" aria-label="Files by top contributor">
      <thead><tr><th>Name</th><th>Top contributor</th><th>${$e()}</th><th>Last edit</th></tr></thead>
      <tbody>${f||'<tr><td colspan="4">Empty directory.</td></tr>'}</tbody>
    </table></div>`,e.querySelectorAll("button[data-crumb]").forEach(n=>{n.onclick=()=>{t.treePath=n.dataset.crumb??"",s()}}),e.querySelectorAll("button[data-enter]").forEach(n=>{n.onclick=()=>{t.treePath=n.dataset.enter??"",s()}})}async function ke(e){try{t.view==="table"?ve(e,await te(),h):t.view==="tree"?Le(e,await ae(),h):ye(e,await re())}catch(r){e.innerHTML=`<p class="error" role="alert">Error: ${p(r.message)}</p>`}}function B(e){t.guideFrom=e,t.screen="guide",h()}function Ee(){t.screen=t.guideFrom==="app"&&t.repo?"app":"landing",h()}function h(){var r,s,l,i;const e=document.getElementById("app");if(t.screen==="guide"){e.innerHTML=pe(),fe(e,Ee),H();return}if(!t.repo){t.screen="landing",e.innerHTML=he(),be(e,Y,()=>B("landing")),H();return}t.screen="app",e.innerHTML=ge(),(r=e.querySelector("#brand-home"))==null||r.addEventListener("click",()=>{t.repo="",t.repoName="",t.analyzeError="",h()}),(s=e.querySelector("#brand-q"))==null||s.addEventListener("click",()=>B("app")),(l=e.querySelector("#new-repo"))==null||l.addEventListener("click",()=>{t.repo="",t.repoName="",t.analyzeError="",h()}),(i=e.querySelector("#theme"))==null||i.addEventListener("click",()=>{const a=document.documentElement,d=a.getAttribute("data-theme")==="dark"?"light":"dark";a.setAttribute("data-theme",d),localStorage.setItem("git-who-theme",d)}),e.querySelectorAll("button[data-view]").forEach(a=>{a.onclick=()=>{t.view=a.dataset.view,h()}}),e.querySelectorAll("button[data-mode]").forEach(a=>{a.onclick=()=>{t.mode=a.dataset.mode,t.tableSort="",h()}}),ue(e,h),document.onpointerdown=a=>{t.filtersOpen&&!a.target.closest(".popover-wrap")&&(t.filtersOpen=!1,h())},document.onkeydown=a=>{a.key==="Escape"&&t.filtersOpen&&(t.filtersOpen=!1,h())},ke(e.querySelector("#view")),H()}async function Y(e){t.analyzing=!0,t.analyzeError="",t.landingInput=e,h();try{const r=await ne(e);t.repo=r.repo,t.repoName=r.name,t.treePath="",t.collapsed.clear(),t.analyzing=!1;const s=new URL(location.href);s.searchParams.set("repo",e),history.replaceState(null,"",s),h()}catch(r){t.analyzing=!1,t.analyzeError=r.message,h()}}function De(){Q(),X();const e=localStorage.getItem("git-who-theme");e&&document.documentElement.setAttribute("data-theme",e);const s=new URLSearchParams(location.search).get("repo");if(s){t.landingInput=s,Y(s);return}h()}De();
