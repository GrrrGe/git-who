(function(){const r=document.createElement("link").relList;if(r&&r.supports&&r.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))l(i);new MutationObserver(i=>{for(const a of i)if(a.type==="childList")for(const c of a.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&l(c)}).observe(document,{childList:!0,subtree:!0});function s(i){const a={};return i.integrity&&(a.integrity=i.integrity),i.referrerPolicy&&(a.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?a.credentials="include":i.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function l(i){if(i.ep)return;i.ep=!0;const a=s(i);fetch(i.href,a)}})();const I=()=>window.matchMedia("(prefers-reduced-motion: reduce)").matches;let j=!1;function Q(){j||!window.AOS||I()||(window.AOS.init({duration:600,easing:"ease-out",once:!0,offset:40}),j=!0)}function H(){j&&window.AOS&&!I()&&window.AOS.refresh()}function X(){const e=()=>{document.querySelectorAll(".topbar").forEach(r=>{r.classList.toggle("scrolled",window.scrollY>8)})};window.addEventListener("scroll",e,{passive:!0}),e()}function Z(e,r,s,l){if(I()){l();return}e.classList.add("typing");let i=0;const a=()=>{i++,e.textContent=r.slice(0,i),i<r.length?window.setTimeout(a,s):(e.classList.remove("typing"),l())};a()}const t={repo:"",repoName:"",rev:"HEAD",path:"",mode:"commits",view:"table",since:"",until:"",author:"",nauthor:"",email:!1,merges:!1,hidden:!1,tableSort:"",tableSortDir:-1,tableFilter:"",collapsed:new Set,treePath:"",filtersOpen:!1,screen:"landing",guideFrom:"landing",landingInput:"",analyzing:!1,analyzeError:""};function d(e){return e.replace(/[&<>"']/g,r=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[r])}function T(e){let r=0;for(let s=0;s<e.length;s++)r=r*31+e.charCodeAt(s)>>>0;return`hsl(${r%360} 65% 50%)`}function A(e){if(!e||e.startsWith("0001-"))return"-";const r=new Date(e);return isNaN(r.getTime())?e:r.toLocaleDateString()}function ee(){let e=0;return t.rev&&t.rev!=="HEAD"&&e++,t.path&&e++,t.since&&e++,t.until&&e++,t.author&&e++,t.nauthor&&e++,t.email&&e++,t.merges&&e++,t.hidden&&e++,e}function G(){const e=new URLSearchParams;return t.repo&&e.set("repo",t.repo),t.rev&&e.set("rev",t.rev),t.path&&e.set("path",t.path),e.set("mode",t.mode),t.since&&e.set("since",t.since),t.until&&e.set("until",t.until),t.author&&e.set("author",t.author),t.nauthor&&e.set("nauthor",t.nauthor),t.email&&e.set("email","1"),t.merges&&e.set("merges","1"),t.hidden&&e.set("hidden","1"),e}async function x(e,r){const s=await fetch(`/api/${e}?${r}`),l=await s.json();if(!s.ok)throw new Error(l.error||`HTTP ${s.status}`);return l}function te(){return x("table",G())}function ae(){return x("tree",G())}function re(){return x("hist",G())}function ne(e){const r=new URLSearchParams;return r.set("repo",e),x("resolve",r)}function se(){return t.since||t.until?`${t.since||"…"} → ${t.until||"…"}`:"All time 📅"}function N(e){return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,"0")}-${String(e.getDate()).padStart(2,"0")}`}const ie=["January","February","March","April","May","June","July","August","September","October","November","December"],le=["Su","Mo","Tu","We","Th","Fr","Sa"];function oe(){const e=ee(),r=e?` <span class="badge" aria-label="${e} active filters">${e}</span>`:"";return`<button id="filters-btn" class="btn btn-secondary" aria-expanded="${t.filtersOpen}" aria-haspopup="dialog">Filters${r}</button>`}function ce(){if(!t.filtersOpen)return"";const e=r=>r?"checked":"";return`
  <div class="popover" role="dialog" aria-label="Analysis filters">
    <div class="grid grid-2">
      <label class="field">Revision / branch <input id="f-rev" class="input" value="${d(t.rev)}" /></label>
      <label class="field">Path filter <input id="f-path" class="input" value="${d(t.path)}" placeholder="subdir/" /></label>
      <label class="field">Date range
        <button id="f-dates" class="input" style="text-align:left;cursor:pointer" aria-haspopup="dialog">${d(se())}</button>
      </label>
      <label class="field">Author <input id="f-author" class="input" value="${d(t.author)}" placeholder="--author" /></label>
      <label class="field">Exclude author <input id="f-nauthor" class="input" value="${d(t.nauthor)}" placeholder="--nauthor" /></label>
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
  </div>`}function O(e){return new Date(e.getFullYear(),e.getMonth(),1)}function de(e){const r=/^(\d{4})-(\d{2})-(\d{2})/.exec(e);if(!r)return null;const s=new Date(Number(r[1]),Number(r[2])-1,Number(r[3]));return isNaN(s.getTime())?null:s}function ue(e,r){var _,S,k,D,o,p,h;const s=e.querySelector("#filters-btn");s==null||s.addEventListener("click",u=>{u.stopPropagation(),t.filtersOpen=!t.filtersOpen,r()});const l=u=>{var w;return((w=e.querySelector(`#${u}`))==null?void 0:w.value)??""},i=u=>{var w;return((w=e.querySelector(`#${u}`))==null?void 0:w.checked)??!1},a=e.querySelector("#date-dialog");let c=O(new Date),f="",n="";const y=()=>{const u=a==null?void 0:a.querySelector("#d-summary");u&&(u.textContent=f||n?`${f||"…"} → ${n||"…"}`:"All time. Click a day for start, again for end.")},m=()=>{const u=a==null?void 0:a.querySelector("#cal-grid"),w=a==null?void 0:a.querySelector("#cal-title");if(!u||!w||!a)return;w.textContent=`${ie[c.getMonth()]} ${c.getFullYear()}`;const E=N(new Date),U=new Date(c.getFullYear(),c.getMonth(),1).getDay(),J=new Date(c.getFullYear(),c.getMonth()+1,0).getDate();let F=le.map(v=>`<span class="cal-dow">${v}</span>`).join("");for(let v=0;v<U;v++)F+="<span></span>";for(let v=1;v<=J;v++){const $=N(new Date(c.getFullYear(),c.getMonth(),v)),L=$===f,W=$===n&&n!==f,K=f&&n&&$>f&&$<n,V=["cal-day",L||W?"endpoint":"",K?"in-range":"",$===E?"today":""].filter(Boolean).join(" ");F+=`<button class="${V}" data-day="${$}" role="gridcell" aria-label="${$}${L?", range start":W?", range end":""}">${v}</button>`}u.innerHTML=F,u.querySelectorAll("button[data-day]").forEach(v=>{v.addEventListener("click",$=>{$.preventDefault();const L=v.dataset.day;!f||f&&n?(f=L,n=""):L<f?(n=f,f=L):n=L,m()})}),y()},g=()=>{if(!a)return;f=/^\d{4}-\d{2}-\d{2}/.test(t.since)?t.since.slice(0,10):"",n=/^\d{4}-\d{2}-\d{2}/.test(t.until)?t.until.slice(0,10):"";const u=de(f)??new Date;c=O(u),m(),a.showModal()};(_=e.querySelector("#f-dates"))==null||_.addEventListener("click",g),(S=a==null?void 0:a.querySelector("#cal-prev"))==null||S.addEventListener("click",u=>{u.preventDefault(),c=new Date(c.getFullYear(),c.getMonth()-1,1),m()}),(k=a==null?void 0:a.querySelector("#cal-next"))==null||k.addEventListener("click",u=>{u.preventDefault(),c=new Date(c.getFullYear(),c.getMonth()+1,1),m()}),a==null||a.querySelectorAll("button[data-preset]").forEach(u=>{u.addEventListener("click",w=>{if(w.preventDefault(),u.dataset.preset==="all")f="",n="";else{const E=new Date;E.setDate(E.getDate()-Number(u.dataset.preset)),f=N(E),n="",c=O(E)}m()})});const M=()=>{const u=e.querySelector("#f-dates");u&&(u.textContent=t.since||t.until?`${t.since||"…"} → ${t.until||"…"}`:"All time 📅")};(D=e.querySelector("#d-apply"))==null||D.addEventListener("click",u=>{u.preventDefault(),t.since=f,t.until=n,a==null||a.close(),M()}),(o=e.querySelector("#d-cancel"))==null||o.addEventListener("click",u=>{u.preventDefault(),a==null||a.close()}),(p=e.querySelector("#f-apply"))==null||p.addEventListener("click",()=>{t.rev=l("f-rev")||"HEAD",t.path=l("f-path"),t.author=l("f-author"),t.nauthor=l("f-nauthor"),t.email=i("f-email"),t.merges=i("f-merges"),t.hidden=i("f-hidden"),t.filtersOpen=!1,r()}),(h=e.querySelector("#f-clear"))==null||h.addEventListener("click",()=>{t.rev="HEAD",t.path="",t.since="",t.until="",t.author="",t.nauthor="",t.email=!1,t.merges=!1,t.hidden=!1,t.filtersOpen=!1,r()})}function pe(){return`
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
  </div>`}function fe(e,r){var s;(s=e.querySelector("#guide-back"))==null||s.addEventListener("click",r)}const me='<span class="t-git">Git</span><span class="t-who">Who</span><a id="brand-q" class="t-q" href="#" aria-label="Open the guide: what can GitWho do?">?</a>';function R(e,r){var l;const s=e.querySelector("#wordmark");s&&(s.innerHTML=me,(l=s.querySelector("#brand-q"))==null||l.addEventListener("click",i=>{i.preventDefault(),r()}))}function he(){const e=t.analyzing,r=t.analyzeError?`<p class="error" role="alert">${d(t.analyzeError)}</p>`:"";return`
  <div class="landing">
    <h1 id="wordmark" class="display-xxl brand-title" aria-label="GitWho?"></h1>
    <p class="subhead sub" data-aos="fade-up" data-aos-delay="150">Who wrote this code?!</p>
    <form id="landing-form" class="landing-form" data-aos="fade-up" data-aos-delay="250">
      <div class="input-group level-2">
        <input id="landing-input" type="text" value="${d(t.landingInput)}"
          placeholder="Paste a GitHub link or local path…"
          aria-label="GitHub link or local repo path" ${e?"disabled":""} />
        <button class="btn btn-primary" type="submit" ${e?"disabled":""}>${e?"Cloning…":"Analyze"}</button>
      </div>
    </form>
    ${r}
    <button id="howto" class="howto-link" data-aos="fade-up" data-aos-delay="350">How to use GitWho →</button>
  </div>`}function be(e,r,s){var c;const l=e.querySelector("#wordmark");l&&!t.analyzing?Z(l,"GitWho?",110,()=>R(e,s)):l&&R(e,s);const i=e.querySelector("#landing-form"),a=e.querySelector("#landing-input");t.analyzing||a==null||a.focus(),i==null||i.addEventListener("submit",f=>{f.preventDefault();const n=((a==null?void 0:a.value)??"").trim();n&&r(n)}),(c=e.querySelector("#howto"))==null||c.addEventListener("click",s)}function q(e,r,s){return`<button class="tab" data-mode="${e}" aria-pressed="${t.mode===e}" title="${s}">${r}</button>`}function ge(){const e=(r,s)=>`<button class="tab" data-view="${r}" aria-pressed="${t.view===r}">${s}</button>`;return`
  <div class="topbar">
    <button class="brand btn-translucent brand-title" id="brand-home" aria-label="Back to home" style="border:none;cursor:pointer;font-size:22px"><span class="t-git">Git</span><span class="t-who">Who</span></button>
    <button id="brand-q" class="t-q btn-translucent" aria-label="Open the guide" style="border:none;cursor:pointer;font-size:22px;font-family:var(--font-display)">?</button>
    <span class="body-sm" style="color:var(--muted)" title="${d(t.repo)}">${d(t.repoName||t.repo)}</span>
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
  </div>`}function ye(e,r){const s=Math.max(1,...r.buckets.map(a=>a.total)),l=r.buckets.reduce((a,c)=>c.value>((a==null?void 0:a.value)??-1)?c:a,r.buckets[0]),i=r.buckets.map(a=>{const c=a.value/s*100,f=(a.total-a.value)/s*100,n=`${a.period}: ${a.author.name||"(no commits)"} ${a.value}/${a.total}`;return`<div class="hist-row" role="img" aria-label="${d(n)}">
      <span>${d(a.period)}</span>
      <span class="hist-bar" aria-hidden="true"><span class="win" style="width:${c}%"></span><span class="rest" style="width:${f}%"></span></span>
      <span class="who"><span class="dot" style="background:${T(a.author.name||"?")}" aria-hidden="true"></span>${d(a.author.name||"-")} (${a.value}/${a.total})</span>
    </div>`}).join("");e.innerHTML=`
    ${l?`<div class="card spotlight spotlight-coral" style="margin-bottom:16px">
      <p class="caption">Peak period · ${d(l.period)}</p>
      <h3>${d(l.author.name||"-")}</h3>
      <p class="body">${l.value.toLocaleString()} of ${l.total.toLocaleString()} in ${d(l.period)}</p>
    </div>`:""}
    <p class="legend">Solid bar: winner share. Faint bar: period total.</p>
    <div class="card" aria-label="History bar chart">${i||"<p>No history.</p>"}</div>`}function z(e,r){return r==="lines"?e.lines_added+e.lines_removed:r==="files"?e.files:e.commits}function C(e){const r=e.authors.filter(l=>{const i=t.tableFilter.toLowerCase();return!i||l.name.toLowerCase().includes(i)||l.email.toLowerCase().includes(i)}),s=t.tableSort||t.mode;return r.sort((l,i)=>{let a=0;return s==="name"?a=l.name.localeCompare(i.name):s==="commits"?a=l.commits-i.commits:s==="files"?a=l.files-i.files:s==="lines"?a=l.lines_added+l.lines_removed-(i.lines_added+i.lines_removed):s==="last_edit"?a=+new Date(l.last_edit)-+new Date(i.last_edit):s==="first_edit"?a=+new Date(l.first_edit)-+new Date(i.first_edit):a=z(l,t.mode)-z(i,t.mode),a*t.tableSortDir}),r}function P(e){return e.length?e.map(r=>`
    <tr>
      <td><span class="dot" style="background:${T(r.name)}" aria-hidden="true"></span>${d(r.name)}<br/><small style="color:var(--muted)">${d(r.email)}</small></td>
      <td>${r.commits.toLocaleString()}</td>
      <td>${r.files.toLocaleString()}</td>
      <td><span class="check">+${r.lines_added.toLocaleString()}</span> / <span style="color:var(--danger)">-${r.lines_removed.toLocaleString()}</span></td>
      <td>${A(r.last_edit)}</td>
      <td>${A(r.first_edit)}</td>
    </tr>`).join(""):'<tr><td colspan="6">No authors.</td></tr>'}function ve(e,r,s){const l=C(r),i=l.slice(0,3),a=i.length?`<div class="grid grid-3" style="margin-bottom:16px">
        ${i.map((o,p)=>`
          <div class="card ${p===0?"card-featured level-2":""}">
            <p class="caption" style="color:var(--muted)">#${p+1} · ${z(o,t.mode).toLocaleString()}</p>
            <p class="headline"><span class="dot" style="background:${T(o.name)}" aria-hidden="true"></span>${d(o.name)}</p>
            <p class="body-sm" style="color:var(--muted)">${o.commits.toLocaleString()} commits · ${o.files.toLocaleString()} files · +${o.lines_added.toLocaleString()} / -${o.lines_removed.toLocaleString()}</p>
          </div>`).join("")}
      </div>`:"",f=[["name","Author"],["commits","Commits"],["files","Files"],["lines","Lines (+/-)"],["last_edit","Last edit"],["first_edit","First edit"]].map(([o,p])=>{const u=(t.tableSort||t.mode)===o?t.tableSortDir===-1?" ▼":" ▲":"";return`<th><button data-sort="${o}" aria-label="Sort by ${p}">${p}${u}</button></th>`}).join("");e.innerHTML=`
    ${a}
    <div class="toolbar">
      <div class="field suggest-wrap">Filter authors
        <input id="tf" class="input" type="search"
          value="${d(t.tableFilter)}" placeholder="name or email"
          role="combobox" aria-expanded="false" aria-controls="suggest"
          aria-label="Filter authors" autocomplete="off" />
        <div id="suggest" class="suggest" role="listbox" aria-label="Author suggestions" hidden></div>
      </div>
    </div>
    <div class="card" style="padding:0;overflow:auto">
    <table class="data" aria-label="Contributions by author">
      <thead><tr>${f}</tr></thead>
      <tbody id="author-rows">${P(l)}</tbody>
    </table></div>`,e.querySelectorAll("button[data-sort]").forEach(o=>{o.onclick=()=>{const p=o.dataset.sort;(t.tableSort||t.mode)===p?t.tableSortDir*=-1:(t.tableSort=p,t.tableSortDir=-1),s()}});const n=e.querySelector("#tf"),y=e.querySelector("#author-rows"),m=e.querySelector("#suggest");let g=-1;const M=()=>{const o=t.tableFilter.toLowerCase().trim();return(o?r.authors.filter(h=>h.name.toLowerCase().includes(o)||h.email.toLowerCase().includes(o)):r.authors).slice(0,8)},_=o=>{const p=t.tableFilter.trim();if(!p)return d(o);const h=o.toLowerCase().indexOf(p.toLowerCase());return h<0?d(o):d(o.slice(0,h))+'<b class="hl">'+d(o.slice(h,h+p.length))+"</b>"+d(o.slice(h+p.length))},S=()=>{if(!m||!n)return;const o=M();o.length?(m.innerHTML=o.map((p,h)=>`
        <button class="suggest-item${h===g?" active":""}" role="option"
          aria-selected="${h===g}" data-i="${h}">
          <span class="dot" style="background:${T(p.name)}" aria-hidden="true"></span>
          <span>${_(p.name)}</span>
          <small style="color:var(--muted)">${d(p.email)}</small>
        </button>`).join(""),m.querySelectorAll(".suggest-item").forEach(p=>{p.addEventListener("mousedown",h=>{h.preventDefault(),D(o[Number(p.dataset.i)])})})):m.innerHTML='<div class="suggest-empty">No matching authors.</div>',m.hidden=!1,n.setAttribute("aria-expanded","true")},k=()=>{!m||!n||(m.hidden=!0,n.setAttribute("aria-expanded","false"),g=-1)},D=o=>{t.tableFilter=o.name,n&&(n.value=o.name),y&&(y.innerHTML=P(C(r))),k()};n==null||n.addEventListener("input",()=>{t.tableFilter=n.value,g=-1,y&&(y.innerHTML=P(C(r))),S()}),n==null||n.addEventListener("focus",()=>{g=-1,S()}),n==null||n.addEventListener("keydown",o=>{if(m!=null&&m.hidden)return;const p=M();o.key==="ArrowDown"?(o.preventDefault(),g=Math.min(g+1,p.length-1),S()):o.key==="ArrowUp"?(o.preventDefault(),g=Math.max(g-1,-1),S()):o.key==="Enter"&&g>=0&&p[g]?(o.preventDefault(),D(p[g])):o.key==="Escape"&&k()}),n==null||n.addEventListener("blur",()=>k())}function we(e,r){if(!r)return e;let s=e;for(const l of r.split("/")){const i=(s.children||[]).find(a=>a.name===l&&a.is_dir);if(!i)return null;s=i}return s}function $e(){return t.mode==="lines"?"Lines":t.mode==="files"?"Files":t.mode==="last_modified"?"Last edit":t.mode==="first_modified"?"First edit":"Commits"}function Se(e){return t.mode==="lines"?`+${e.metrics.lines_added.toLocaleString()} / -${e.metrics.lines_removed.toLocaleString()}`:t.mode==="files"?e.metrics.files.toLocaleString():t.mode==="last_modified"?A(e.metrics.last_edit):t.mode==="first_modified"?A(e.metrics.first_edit):e.metrics.commits.toLocaleString()}function Le(e,r,s){if(!r.root){e.innerHTML="<p>No commits; tree is empty.</p>";return}const i=((we(r.root,t.treePath)??r.root).children||[]).filter(n=>n.in_work_tree).sort((n,y)=>Number(y.is_dir)-Number(n.is_dir)||n.name.localeCompare(y.name)),a=t.treePath?t.treePath.split("/"):[],c=[`<button data-crumb="" class="crumb" aria-label="Repository root">${d(r.root.name==="."?t.repoName||"repo":r.root.name)}</button>`];a.forEach((n,y)=>{const m=a.slice(0,y+1).join("/");c.push(`<span aria-hidden="true">/</span> <button data-crumb="${d(m)}" class="crumb">${d(n)}</button>`)});const f=i.map(n=>{const y=n.is_dir?"📁":"📄",m=n.is_dir?`<button data-enter="${d(n.is_dir?t.treePath?t.treePath+"/"+n.name:n.name:"")}" class="linklike">${d(n.name)}</button>`:`<span>${d(n.name)}</span>`;return`<tr>
      <td><span aria-hidden="true">${y}</span> ${m}</td>
      <td><span class="dot" style="background:${T(n.author.name)}" aria-hidden="true"></span>${d(n.author.name)}</td>
      <td>${d(Se(n))}</td>
      <td style="color:var(--muted)">${A(n.metrics.last_edit)}</td>
    </tr>`}).join("");e.innerHTML=`
    <div class="toolbar">
      <nav class="body" aria-label="Breadcrumb">${c.join(" ")}</nav>
      <span class="spacer"></span>
      <span class="legend">Top contributor per node.</span>
    </div>
    <div class="card" style="padding:0;overflow:auto">
    <table class="data" aria-label="Files by top contributor">
      <thead><tr><th>Name</th><th>Top contributor</th><th>${$e()}</th><th>Last edit</th></tr></thead>
      <tbody>${f||'<tr><td colspan="4">Empty directory.</td></tr>'}</tbody>
    </table></div>`,e.querySelectorAll("button[data-crumb]").forEach(n=>{n.onclick=()=>{t.treePath=n.dataset.crumb??"",s()}}),e.querySelectorAll("button[data-enter]").forEach(n=>{n.onclick=()=>{t.treePath=n.dataset.enter??"",s()}})}async function ke(e){try{t.view==="table"?ve(e,await te(),b):t.view==="tree"?Le(e,await ae(),b):ye(e,await re())}catch(r){e.innerHTML=`<p class="error" role="alert">Error: ${d(r.message)}</p>`}}function B(e){t.guideFrom=e,t.screen="guide",b()}function Ee(){t.screen=t.guideFrom==="app"&&t.repo?"app":"landing",b()}function b(){var r,s,l,i;const e=document.getElementById("app");if(t.screen==="guide"){e.innerHTML=pe(),fe(e,Ee),H();return}if(!t.repo){t.screen="landing",e.innerHTML=he(),be(e,Y,()=>B("landing")),H();return}t.screen="app",e.innerHTML=ge(),(r=e.querySelector("#brand-home"))==null||r.addEventListener("click",()=>{t.repo="",t.repoName="",t.analyzeError="",b()}),(s=e.querySelector("#brand-q"))==null||s.addEventListener("click",()=>B("app")),(l=e.querySelector("#new-repo"))==null||l.addEventListener("click",()=>{t.repo="",t.repoName="",t.analyzeError="",b()}),(i=e.querySelector("#theme"))==null||i.addEventListener("click",()=>{const a=document.documentElement,c=a.getAttribute("data-theme")==="dark"?"light":"dark";a.setAttribute("data-theme",c),localStorage.setItem("git-who-theme",c)}),e.querySelectorAll("button[data-view]").forEach(a=>{a.onclick=()=>{t.view=a.dataset.view,b()}}),e.querySelectorAll("button[data-mode]").forEach(a=>{a.onclick=()=>{t.mode=a.dataset.mode,t.tableSort="",b()}}),ue(e,b),document.onpointerdown=a=>{t.filtersOpen&&!a.target.closest(".popover-wrap")&&(t.filtersOpen=!1,b())},document.onkeydown=a=>{a.key==="Escape"&&t.filtersOpen&&(t.filtersOpen=!1,b())},ke(e.querySelector("#view")),H()}async function Y(e){t.analyzing=!0,t.analyzeError="",t.landingInput=e,b();try{const r=await ne(e);t.repo=r.repo,t.repoName=r.name,t.treePath="",t.collapsed.clear(),t.analyzing=!1;const s=new URL(location.href);s.searchParams.set("repo",e),history.replaceState(null,"",s),b()}catch(r){t.analyzing=!1,t.analyzeError=r.message,b()}}function De(){Q(),X();const e=localStorage.getItem("git-who-theme");e&&document.documentElement.setAttribute("data-theme",e);const s=new URLSearchParams(location.search).get("repo");if(s){t.landingInput=s,Y(s);return}b()}De();
