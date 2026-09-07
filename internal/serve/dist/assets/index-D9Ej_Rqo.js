(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))o(i);new MutationObserver(i=>{for(const a of i)if(a.type==="childList")for(const d of a.addedNodes)d.tagName==="LINK"&&d.rel==="modulepreload"&&o(d)}).observe(document,{childList:!0,subtree:!0});function r(i){const a={};return i.integrity&&(a.integrity=i.integrity),i.referrerPolicy&&(a.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?a.credentials="include":i.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function o(i){if(i.ep)return;i.ep=!0;const a=r(i);fetch(i.href,a)}})();const j=()=>window.matchMedia("(prefers-reduced-motion: reduce)").matches;let I=!1;function Q(){I||!window.AOS||j()||(window.AOS.init({duration:600,easing:"ease-out",once:!0,offset:40}),I=!0)}function H(){I&&window.AOS&&!j()&&window.AOS.refresh()}function Z(){const e=()=>{document.querySelectorAll(".topbar").forEach(n=>{n.classList.toggle("scrolled",window.scrollY>8)})};window.addEventListener("scroll",e,{passive:!0}),e()}function ee(e,n,r,o){if(j()){o();return}e.classList.add("typing");let i=0;const a=()=>{i++,e.textContent=n.slice(0,i),i<n.length?window.setTimeout(a,r):(e.classList.remove("typing"),o())};a()}const t={repo:"",repoName:"",rev:"HEAD",path:"",mode:"commits",view:"table",since:"",until:"",author:"",nauthor:"",email:!1,merges:!1,hidden:!1,tableSort:"",tableSortDir:-1,tableFilter:"",collapsed:new Set,treePath:"",filtersOpen:!1,screen:"landing",guideFrom:"landing",landingInput:"",analyzing:!1,analyzeError:""};function p(e){return e.replace(/[&<>"']/g,n=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[n])}function T(e){let n=0;for(let r=0;r<e.length;r++)n=n*31+e.charCodeAt(r)>>>0;return`hsl(${n%360} 65% 50%)`}function x(e){if(!e||e.startsWith("0001-"))return"-";const n=new Date(e);return isNaN(n.getTime())?e:n.toLocaleDateString()}function te(){let e=0;return t.rev&&t.rev!=="HEAD"&&e++,t.path&&e++,t.since&&e++,t.until&&e++,t.author&&e++,t.nauthor&&e++,t.email&&e++,t.merges&&e++,t.hidden&&e++,e}function z(){const e=new URLSearchParams;return t.repo&&e.set("repo",t.repo),t.rev&&e.set("rev",t.rev),t.path&&e.set("path",t.path),e.set("mode",t.mode),t.since&&e.set("since",t.since),t.until&&e.set("until",t.until),t.author&&e.set("author",t.author),t.nauthor&&e.set("nauthor",t.nauthor),t.email&&e.set("email","1"),t.merges&&e.set("merges","1"),t.hidden&&e.set("hidden","1"),e}async function _(e,n){const r=await fetch(`/api/${e}?${n}`),o=await r.json();if(!r.ok)throw new Error(o.error||`HTTP ${r.status}`);return o}function ae(){return _("table",z())}function ne(){return _("tree",z())}function re(){return _("hist",z())}function se(e){const n=new URLSearchParams;return n.set("repo",e),_("resolve",n)}function ie(){return t.since||t.until?`${t.since||"…"} → ${t.until||"…"}`:"All time 📅"}function N(e){return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,"0")}-${String(e.getDate()).padStart(2,"0")}`}const oe=["January","February","March","April","May","June","July","August","September","October","November","December"],le=["Su","Mo","Tu","We","Th","Fr","Sa"];function ce(){const e=te(),n=e?` <span class="badge" aria-label="${e} active filters">${e}</span>`:"";return`<button id="filters-btn" class="btn btn-secondary" aria-expanded="${t.filtersOpen}" aria-haspopup="dialog">Filters${n}</button>`}function de(){if(!t.filtersOpen)return"";const e=n=>n?"checked":"";return`
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
  </div>`}function C(e){return new Date(e.getFullYear(),e.getMonth(),1)}function ue(e){const n=/^(\d{4})-(\d{2})-(\d{2})/.exec(e);if(!n)return null;const r=new Date(Number(n[1]),Number(n[2])-1,Number(n[3]));return isNaN(r.getTime())?null:r}function pe(e,n){var E,A,$,L,D,l,u;const r=e.querySelector("#filters-btn");r==null||r.addEventListener("click",c=>{c.stopPropagation(),t.filtersOpen=!t.filtersOpen,n()});const o=c=>{var y;return((y=e.querySelector(`#${c}`))==null?void 0:y.value)??""},i=c=>{var y;return((y=e.querySelector(`#${c}`))==null?void 0:y.checked)??!1},a=e.querySelector("#date-dialog");let d=C(new Date),f="",s="";const h=()=>{const c=a==null?void 0:a.querySelector("#d-summary");c&&(c.textContent=f||s?`${f||"…"} → ${s||"…"}`:"All time. Click a day for start, again for end.")},m=()=>{const c=a==null?void 0:a.querySelector("#cal-grid"),y=a==null?void 0:a.querySelector("#cal-title");if(!c||!y||!a)return;y.textContent=`${oe[d.getMonth()]} ${d.getFullYear()}`;const k=N(new Date),J=new Date(d.getFullYear(),d.getMonth(),1).getDay(),K=new Date(d.getFullYear(),d.getMonth()+1,0).getDate();let F=le.map(v=>`<span class="cal-dow">${v}</span>`).join("");for(let v=0;v<J;v++)F+="<span></span>";for(let v=1;v<=K;v++){const w=N(new Date(d.getFullYear(),d.getMonth(),v)),S=w===f,R=w===s&&s!==f,V=f&&s&&w>f&&w<s,X=["cal-day",S||R?"endpoint":"",V?"in-range":"",w===k?"today":""].filter(Boolean).join(" ");F+=`<button class="${X}" data-day="${w}" role="gridcell" aria-label="${w}${S?", range start":R?", range end":""}">${v}</button>`}c.innerHTML=F,c.querySelectorAll("button[data-day]").forEach(v=>{v.addEventListener("click",w=>{w.preventDefault();const S=v.dataset.day;!f||f&&s?(f=S,s=""):S<f?(s=f,f=S):s=S,m()})}),h()},g=()=>{if(!a)return;f=/^\d{4}-\d{2}-\d{2}/.test(t.since)?t.since.slice(0,10):"",s=/^\d{4}-\d{2}-\d{2}/.test(t.until)?t.until.slice(0,10):"";const c=ue(f)??new Date;d=C(c),m(),a.showModal()};(E=e.querySelector("#f-dates"))==null||E.addEventListener("click",g),(A=a==null?void 0:a.querySelector("#cal-prev"))==null||A.addEventListener("click",c=>{c.preventDefault(),d=new Date(d.getFullYear(),d.getMonth()-1,1),m()}),($=a==null?void 0:a.querySelector("#cal-next"))==null||$.addEventListener("click",c=>{c.preventDefault(),d=new Date(d.getFullYear(),d.getMonth()+1,1),m()}),a==null||a.querySelectorAll("button[data-preset]").forEach(c=>{c.addEventListener("click",y=>{if(y.preventDefault(),c.dataset.preset==="all")f="",s="";else{const k=new Date;k.setDate(k.getDate()-Number(c.dataset.preset)),f=N(k),s="",d=C(k)}m()})});const M=()=>{const c=e.querySelector("#f-dates");c&&(c.textContent=t.since||t.until?`${t.since||"…"} → ${t.until||"…"}`:"All time 📅")};(L=e.querySelector("#d-apply"))==null||L.addEventListener("click",c=>{c.preventDefault(),t.since=f,t.until=s,a==null||a.close(),M()}),(D=e.querySelector("#d-cancel"))==null||D.addEventListener("click",c=>{c.preventDefault(),a==null||a.close()}),(l=e.querySelector("#f-apply"))==null||l.addEventListener("click",()=>{t.rev=o("f-rev")||"HEAD",t.path=o("f-path"),t.author=o("f-author"),t.nauthor=o("f-nauthor"),t.email=i("f-email"),t.merges=i("f-merges"),t.hidden=i("f-hidden"),t.filtersOpen=!1,n()}),(u=e.querySelector("#f-clear"))==null||u.addEventListener("click",()=>{t.rev="HEAD",t.path="",t.since="",t.until="",t.author="",t.nauthor="",t.email=!1,t.merges=!1,t.hidden=!1,t.filtersOpen=!1,n()})}function fe(){return`
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
  </div>`}function me(e,n){var r;(r=e.querySelector("#guide-back"))==null||r.addEventListener("click",n)}const he='<span class="t-git">Git</span><span class="t-who">Who</span><a id="brand-q" class="t-q" href="#" aria-label="Open the guide: what can GitWho do?">?</a>';function G(e,n){var o;const r=e.querySelector("#wordmark");r&&(r.innerHTML=he,(o=r.querySelector("#brand-q"))==null||o.addEventListener("click",i=>{i.preventDefault(),n()}))}function be(){const e=t.analyzing,n=t.analyzeError?`<p class="error" role="alert">${p(t.analyzeError)}</p>`:"";return`
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
    ${n}
    <button id="howto" class="howto-link" data-aos="fade-up" data-aos-delay="350">How to use GitWho →</button>
  </div>`}function ge(e,n,r){var d;const o=e.querySelector("#wordmark");o&&!t.analyzing?ee(o,"GitWho?",110,()=>G(e,r)):o&&G(e,r);const i=e.querySelector("#landing-form"),a=e.querySelector("#landing-input");t.analyzing||a==null||a.focus(),i==null||i.addEventListener("submit",f=>{f.preventDefault();const s=((a==null?void 0:a.value)??"").trim();s&&n(s)}),(d=e.querySelector("#howto"))==null||d.addEventListener("click",r)}function q(e,n,r){return`<button class="tab" data-mode="${e}" aria-pressed="${t.mode===e}" title="${r}">${n}</button>`}function ye(){const e=(n,r)=>`<button class="tab" data-view="${n}" aria-pressed="${t.view===n}">${r}</button>`;return`
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
  </div>`}function ve(e,n){const r=Math.max(1,...n.buckets.map(a=>a.total)),o=n.buckets.reduce((a,d)=>d.value>((a==null?void 0:a.value)??-1)?d:a,n.buckets[0]),i=n.buckets.map(a=>{const d=a.value/r*100,f=(a.total-a.value)/r*100,s=`${a.period}: ${a.author.name||"(no commits)"} ${a.value}/${a.total}`,h=a.author.name?`<span class="dot" style="background:${T(a.author.name)}" aria-hidden="true"></span>${p(a.author.name)} (${a.value}/${a.total})`:'<span style="color:var(--muted)">no commits</span>';return`<div class="hist-row" role="img" aria-label="${p(s)}">
      <span>${p(a.period)}</span>
      <span class="hist-bar" aria-hidden="true"><span class="win" style="width:${d}%"></span><span class="rest" style="width:${f}%"></span></span>
      <span class="who">${h}</span>
    </div>`}).join("");e.innerHTML=`
    ${o?`<div class="card spotlight spotlight-coral" style="margin-bottom:16px">
      <p class="caption">Peak period · ${p(o.period)}</p>
      <h3>${p(o.author.name||"-")}</h3>
      <p class="body">${o.value.toLocaleString()} of ${o.total.toLocaleString()} in ${p(o.period)}</p>
    </div>`:""}
    <p class="legend">Solid bar: winner share. Faint bar: period total.</p>
    <div class="card" aria-label="History bar chart">${i||"<p>No history.</p>"}</div>`}function W(e,n){return n==="lines"?e.lines_added+e.lines_removed:n==="files"?e.files:e.commits}function O(e){const n=e.authors.filter(o=>{const i=t.tableFilter.toLowerCase();return!i||o.name.toLowerCase().includes(i)||o.email.toLowerCase().includes(i)}),r=t.tableSort||t.mode;return n.sort((o,i)=>{let a=0;return r==="name"?a=o.name.localeCompare(i.name):r==="commits"?a=o.commits-i.commits:r==="files"?a=o.files-i.files:r==="lines"?a=o.lines_added+o.lines_removed-(i.lines_added+i.lines_removed):r==="last_edit"?a=+new Date(o.last_edit)-+new Date(i.last_edit):r==="first_edit"?a=+new Date(o.first_edit)-+new Date(i.first_edit):a=W(o,t.mode)-W(i,t.mode),a*t.tableSortDir}),n}function P(e){return e.length?e.map(n=>`
    <tr>
      <td><span class="dot" style="background:${T(n.name)}" aria-hidden="true"></span>${p(n.name)}<br/><small style="color:var(--muted)">${p(n.email)}</small></td>
      <td>${n.commits.toLocaleString()}</td>
      <td>${n.files.toLocaleString()}</td>
      <td><span class="check">+${n.lines_added.toLocaleString()}</span> / <span style="color:var(--danger)">-${n.lines_removed.toLocaleString()}</span></td>
      <td>${x(n.last_edit)}</td>
      <td>${x(n.first_edit)}</td>
    </tr>`).join(""):'<tr><td colspan="6">No authors.</td></tr>'}function we(e,n,r){const o=O(n),i=o.slice(0,3),a=i.length?`<div class="grid grid-3" style="margin-bottom:16px">
        ${i.map((l,u)=>`
          <div class="card ${u===0?"card-featured level-2":""}">
            <p class="caption" style="color:var(--muted)">#${u+1} · ${W(l,t.mode).toLocaleString()}</p>
            <p class="headline"><span class="dot" style="background:${T(l.name)}" aria-hidden="true"></span>${p(l.name)}</p>
            <p class="body-sm" style="color:var(--muted)">${l.commits.toLocaleString()} commits · ${l.files.toLocaleString()} files · +${l.lines_added.toLocaleString()} / -${l.lines_removed.toLocaleString()}</p>
          </div>`).join("")}
      </div>`:"",f=[["name","Author"],["commits","Commits"],["files","Files"],["lines","Lines (+/-)"],["last_edit","Last edit"],["first_edit","First edit"]].map(([l,u])=>{const y=(t.tableSort||t.mode)===l?t.tableSortDir===-1?" ▼":" ▲":"";return`<th><button data-sort="${l}" aria-label="Sort by ${u}">${u}${y}</button></th>`}).join("");e.innerHTML=`
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
      <tbody id="author-rows">${P(o)}</tbody>
    </table></div>`,e.querySelectorAll("button[data-sort]").forEach(l=>{l.onclick=()=>{const u=l.dataset.sort;(t.tableSort||t.mode)===u?t.tableSortDir*=-1:(t.tableSort=u,t.tableSortDir=-1),r()}});const s=e.querySelector("#tf"),h=e.querySelector("#author-rows"),m=e.querySelector("#suggest");let g=-1;const M=()=>{const l=t.tableFilter.toLowerCase().trim();return l?n.authors.filter(u=>u.name.toLowerCase().includes(l)||u.email.toLowerCase().includes(l)).sort((u,c)=>E(u)-E(c)).slice(0,8):n.authors.slice(0,8)},E=l=>{const u=t.tableFilter.toLowerCase().trim();return l.name.toLowerCase().startsWith(u)?0:l.email.toLowerCase().startsWith(u)?1:2},A=l=>{const u=t.tableFilter.trim();if(!u)return p(l);const c=l.toLowerCase().indexOf(u.toLowerCase());return c<0?p(l):p(l.slice(0,c))+'<b class="hl">'+p(l.slice(c,c+u.length))+"</b>"+p(l.slice(c+u.length))},$=()=>{if(!m||!s)return;const l=M();l.length?(m.innerHTML=l.map((u,c)=>`
        <button class="suggest-item${c===g?" active":""}" role="option"
          aria-selected="${c===g}" data-i="${c}">
          <span class="dot" style="background:${T(u.name)}" aria-hidden="true"></span>
          <span>${A(u.name)}</span>
          <small style="color:var(--muted)">${p(u.email)}</small>
        </button>`).join(""),m.querySelectorAll(".suggest-item").forEach(u=>{u.addEventListener("mousedown",c=>{c.preventDefault(),D(l[Number(u.dataset.i)])})})):m.innerHTML='<div class="suggest-empty">No matching authors.</div>',m.hidden=!1,s.setAttribute("aria-expanded","true")},L=()=>{!m||!s||(m.hidden=!0,s.setAttribute("aria-expanded","false"),g=-1)},D=l=>{t.tableFilter=l.name,s&&(s.value=l.name),h&&(h.innerHTML=P(O(n))),L()};s==null||s.addEventListener("input",()=>{t.tableFilter=s.value,g=-1,h&&(h.innerHTML=P(O(n))),$()}),s==null||s.addEventListener("focus",()=>{g=-1,$()}),s==null||s.addEventListener("keydown",l=>{if(m!=null&&m.hidden)return;const u=M();l.key==="ArrowDown"?(l.preventDefault(),g=Math.min(g+1,u.length-1),$()):l.key==="ArrowUp"?(l.preventDefault(),g=Math.max(g-1,-1),$()):l.key==="Enter"&&g>=0&&u[g]?(l.preventDefault(),D(u[g])):l.key==="Escape"&&L()}),s==null||s.addEventListener("blur",()=>L())}function $e(e,n){if(!n)return e;let r=e;for(const o of n.split("/")){const i=(r.children||[]).find(a=>a.name===o&&a.is_dir);if(!i)return null;r=i}return r}function Se(){return t.mode==="lines"?"Lines":t.mode==="files"?"Files":t.mode==="last_modified"?"Last edit":t.mode==="first_modified"?"First edit":"Commits"}function Le(e){return t.mode==="lines"?`+${e.metrics.lines_added.toLocaleString()} / -${e.metrics.lines_removed.toLocaleString()}`:t.mode==="files"?e.metrics.files.toLocaleString():t.mode==="last_modified"?x(e.metrics.last_edit):t.mode==="first_modified"?x(e.metrics.first_edit):e.metrics.commits.toLocaleString()}function ke(e,n,r){if(!n.root){e.innerHTML="<p>No commits; tree is empty.</p>";return}const i=(($e(n.root,t.treePath)??n.root).children||[]).filter(s=>s.in_work_tree).sort((s,h)=>Number(h.is_dir)-Number(s.is_dir)||s.name.localeCompare(h.name)),a=t.treePath?t.treePath.split("/"):[],d=[`<button data-crumb="" class="crumb" aria-label="Repository root">${p(n.root.name==="."?t.repoName||"repo":n.root.name)}</button>`];a.forEach((s,h)=>{const m=a.slice(0,h+1).join("/");d.push(`<span aria-hidden="true">/</span> <button data-crumb="${p(m)}" class="crumb">${p(s)}</button>`)});const f=i.map(s=>{const h=s.is_dir?"📁":"📄",m=s.is_dir?`<button data-enter="${p(s.is_dir?t.treePath?t.treePath+"/"+s.name:s.name:"")}" class="linklike">${p(s.name)}</button>`:`<span>${p(s.name)}</span>`;return`<tr>
      <td><span aria-hidden="true">${h}</span> ${m}</td>
      <td><span class="dot" style="background:${T(s.author.name)}" aria-hidden="true"></span>${p(s.author.name)}</td>
      <td>${p(Le(s))}</td>
      <td style="color:var(--muted)">${x(s.metrics.last_edit)}</td>
    </tr>`}).join("");e.innerHTML=`
    <div class="toolbar">
      <nav class="body" aria-label="Breadcrumb">${d.join(" ")}</nav>
      <span class="spacer"></span>
      <span class="legend">Top contributor per node.</span>
    </div>
    <div class="card" style="padding:0;overflow:auto">
    <table class="data" aria-label="Files by top contributor">
      <thead><tr><th>Name</th><th>Top contributor</th><th>${Se()}</th><th>Last edit</th></tr></thead>
      <tbody>${f||'<tr><td colspan="4">Empty directory.</td></tr>'}</tbody>
    </table></div>`,e.querySelectorAll("button[data-crumb]").forEach(s=>{s.onclick=()=>{t.treePath=s.dataset.crumb??"",r()}}),e.querySelectorAll("button[data-enter]").forEach(s=>{s.onclick=()=>{t.treePath=s.dataset.enter??"",r()}})}const B={table:["Reading commit history","Ranking authors"],tree:["Reading commit history","Building file tree","Ranking nodes"],hist:["Reading commit history","Bucketing periods"]},Ee={table:"Indexing authors",tree:"Indexing file tree",hist:"Indexing history"};function De(e,n){var f;const r=p(t.repoName||t.repo);if(e.innerHTML=`
    <div class="indexing" role="status" aria-live="polite" data-aos="fade-up">
      <h2 class="display-md">${Ee[n]??"Indexing"}</h2>
      <p class="legend">${r}</p>
      <div class="index-bar" aria-hidden="true"><span></span></div>
      <p class="status body-sm" id="index-status">${((f=B[n])==null?void 0:f[0])??"Working"}…</p>
      <div class="index-dots" aria-hidden="true"><span></span><span></span><span></span></div>
    </div>`,window.matchMedia("(prefers-reduced-motion: reduce)").matches)return()=>{};const o=B[n]??["Working"];let i=0;const a=e.querySelector("#index-status"),d=window.setInterval(()=>{i=(i+1)%o.length,a&&(a.textContent=`${o[i]}…`)},900);return()=>window.clearInterval(d)}async function qe(e){const n=De(e,t.view);try{t.view==="table"?we(e,await ae(),b):t.view==="tree"?ke(e,await ne(),b):ve(e,await re())}catch(r){e.innerHTML=`<p class="error" role="alert">Error: ${p(r.message)}</p>`}finally{n()}}function Y(e){t.guideFrom=e,t.screen="guide",b()}function Te(){t.screen=t.guideFrom==="app"&&t.repo?"app":"landing",b()}function b(){var n,r,o,i;const e=document.getElementById("app");if(t.screen==="guide"){e.innerHTML=fe(),me(e,Te),H();return}if(!t.repo){t.screen="landing",e.innerHTML=be(),ge(e,U,()=>Y("landing")),H();return}t.screen="app",e.innerHTML=ye(),(n=e.querySelector("#brand-home"))==null||n.addEventListener("click",()=>{t.repo="",t.repoName="",t.analyzeError="",b()}),(r=e.querySelector("#brand-q"))==null||r.addEventListener("click",()=>Y("app")),(o=e.querySelector("#new-repo"))==null||o.addEventListener("click",()=>{t.repo="",t.repoName="",t.analyzeError="",b()}),(i=e.querySelector("#theme"))==null||i.addEventListener("click",()=>{const a=document.documentElement,d=a.getAttribute("data-theme")==="dark"?"light":"dark";a.setAttribute("data-theme",d),localStorage.setItem("git-who-theme",d)}),e.querySelectorAll("button[data-view]").forEach(a=>{a.onclick=()=>{t.view=a.dataset.view,b()}}),e.querySelectorAll("button[data-mode]").forEach(a=>{a.onclick=()=>{t.mode=a.dataset.mode,t.tableSort="",b()}}),pe(e,b),document.onpointerdown=a=>{t.filtersOpen&&!a.target.closest(".popover-wrap")&&(t.filtersOpen=!1,b())},document.onkeydown=a=>{a.key==="Escape"&&t.filtersOpen&&(t.filtersOpen=!1,b())},qe(e.querySelector("#view")),H()}async function U(e){t.analyzing=!0,t.analyzeError="",t.landingInput=e,b();try{const n=await se(e);t.repo=n.repo,t.repoName=n.name,t.treePath="",t.collapsed.clear(),t.analyzing=!1;const r=new URL(location.href);r.searchParams.set("repo",e),history.replaceState(null,"",r),b()}catch(n){t.analyzing=!1,t.analyzeError=n.message,b()}}function xe(){Q(),Z();const e=localStorage.getItem("git-who-theme");e&&document.documentElement.setAttribute("data-theme",e);const r=new URLSearchParams(location.search).get("repo");if(r){t.landingInput=r,U(r);return}b()}xe();
