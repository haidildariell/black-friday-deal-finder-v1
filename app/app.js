// DealSleuth app logic: render the deal grid, live search and filters,
// sorting, and a detail page per deal on hash routes.
// Routes: #/ (grid)  #/deal/<id>  #/cat/<Category>  #/search/<text>

(function () {
  var deals = window.DEALS || [];
  var root = document.getElementById("app");

  var CATEGORY_ICONS = {
    Audio: "🎧",
    Computing: "💻",
    TV: "📺",
    Gaming: "🎮",
    Home: "🏠",
    Wearables: "⌚",
    Streaming: "🎬"
  };

  var SIGNAL_LABELS = {
    "new-low": "NEW LOW",
    strong: "STRONG DEAL",
    routine: "ROUTINE SALE"
  };

  var state = {
    query: "",
    category: "All",
    store: "All",
    minDiscount: 0,
    sort: "discount"
  };

  function money(n) {
    var s = n % 1 === 0 ? String(n) : n.toFixed(2);
    return "$" + s.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  function pct(d) {
    return Math.round((1 - d.sale / d.usual) * 100);
  }

  function saved(d) {
    return Math.round((d.usual - d.sale) * 100) / 100;
  }

  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function tileClass(cat) {
    return "tile tile-" + cat.toLowerCase();
  }

  function signalChip(d) {
    return '<span class="signal signal-' + d.signal + '">' +
      SIGNAL_LABELS[d.signal] + "</span>";
  }

  function perUnit(d) {
    return d.category === "Streaming" ? "/mo" : "";
  }

  function cardHtml(d) {
    var p = pct(d);
    return '<article class="card">' +
      '<div class="card-top">' +
        '<div class="' + tileClass(d.category) + '" aria-hidden="true">' +
          (CATEGORY_ICONS[d.category] || "🏷️") + "</div>" +
        "<div>" +
          '<h2><a href="#/deal/' + d.id + '">' + esc(d.product) + "</a></h2>" +
          '<div class="meta"><span class="store-pill">' + esc(d.store) + "</span>" +
          esc(d.category) + "</div>" +
          signalChip(d) +
        "</div>" +
      "</div>" +
      '<div class="price-block">' +
        '<span class="sale-price">' + money(d.sale) + perUnit(d) + "</span>" +
        '<span class="usual-price">was ' + money(d.usual) + perUnit(d) + "</span>" +
        '<span class="save-badge">−' + p + "%</span>" +
      "</div>" +
      '<div class="save-bar"><i style="width:' + Math.min(p, 100) + '%"></i></div>' +
      '<div class="save-line">You save <b>' + money(saved(d)) + perUnit(d) + "</b></div>" +
      '<p class="evidence">' + esc(d.evidence) + "</p>" +
      '<p class="checked-line">Checked ' + esc(d.checked) + " · Source: " + esc(d.source) + "</p>" +
      '<div class="card-actions">' +
        '<a class="btn" href="' + esc(d.url) + '" target="_blank" rel="noopener">View at ' + esc(d.store) + " →</a>" +
        '<a class="btn btn-ghost" href="#/deal/' + d.id + '">Details</a>' +
      "</div>" +
    "</article>";
  }

  function filteredDeals() {
    var q = state.query.trim().toLowerCase();
    var list = deals.filter(function (d) {
      if (state.category !== "All" && d.category !== state.category) return false;
      if (state.store !== "All" && d.store !== state.store) return false;
      if (pct(d) < state.minDiscount) return false;
      if (q) {
        var hay = (d.product + " " + d.store + " " + d.category).toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });
    var by = {
      discount: function (a, b) { return pct(b) - pct(a); },
      savings: function (a, b) { return saved(b) - saved(a); },
      price: function (a, b) { return a.sale - b.sale; },
      name: function (a, b) { return a.product.localeCompare(b.product); }
    }[state.sort] || function () { return 0; };
    return list.slice().sort(by);
  }

  function optionList(values, current) {
    return values.map(function (v) {
      return '<option value="' + esc(v) + '"' +
        (v === current ? " selected" : "") + ">" + esc(v) + "</option>";
    }).join("");
  }

  function renderGrid() {
    var categories = ["All"].concat(
      Array.from(new Set(deals.map(function (d) { return d.category; }))).sort()
    );
    var stores = ["All"].concat(
      Array.from(new Set(deals.map(function (d) { return d.store; }))).sort()
    );
    var list = filteredDeals();
    var best = deals.slice().sort(function (a, b) { return pct(b) - pct(a); })[0];
    var totalSaved = deals.reduce(function (sum, d) { return sum + saved(d); }, 0);
    var newLows = deals.filter(function (d) { return d.signal === "new-low"; }).length;

    var html = '<header class="topbar"><div class="topbar-inner">' +
      '<div class="brand"><span class="brand-mark">◈</span>' +
      '<span class="brand-name">DealSleuth</span>' +
      '<span class="brand-tag">Black Friday 2026 · checked by hand, deal by deal</span></div>' +
      "<h1>Real Black Friday deals, checked today — no inflated “discounts”.</h1>" +
      "<p>Every price below was read from the named store or a deals source that names the store, " +
      "on 27 Nov 2026. Each deal carries an honest verdict: a true new low, a strong cut, or a routine sale.</p>" +
      '<div class="stats-strip">' +
        "<span class='stat'><b>" + deals.length + "</b> deals checked</span>" +
        "<span class='stat'><b>" + newLows + "</b> new lows</span>" +
        "<span class='stat'>Best cut <b>−" + pct(best) + "%</b> · " + esc(best.product) + "</span>" +
        "<span class='stat'>Total savings if you bought one of each: <b>" + money(Math.round(totalSaved)) + "</b></span>" +
      "</div></div></header>" +

      '<div class="controls">' +
        '<label class="search-box"><input id="q" type="search" placeholder="Search deals — try “airpods”, “TV”, “lego”…"' +
          ' value="' + esc(state.query) + '" aria-label="Search deals"></label>' +
        '<select id="store" aria-label="Filter by store">' + optionList(stores, state.store) + "</select>" +
        '<select id="mindisc" aria-label="Minimum discount">' +
          '<option value="0"' + (state.minDiscount === 0 ? " selected" : "") + ">Any discount</option>" +
          '<option value="25"' + (state.minDiscount === 25 ? " selected" : "") + ">25% off or more</option>" +
          '<option value="40"' + (state.minDiscount === 40 ? " selected" : "") + ">40% off or more</option>" +
          '<option value="50"' + (state.minDiscount === 50 ? " selected" : "") + ">50% off or more</option>" +
        "</select>" +
        '<select id="sort" aria-label="Sort deals">' +
          '<option value="discount"' + (state.sort === "discount" ? " selected" : "") + ">Biggest % off first</option>" +
          '<option value="savings"' + (state.sort === "savings" ? " selected" : "") + ">Biggest $ saving first</option>" +
          '<option value="price"' + (state.sort === "price" ? " selected" : "") + ">Lowest price first</option>" +
          '<option value="name"' + (state.sort === "name" ? " selected" : "") + ">Name A–Z</option>" +
        "</select>" +
      "</div>" +

      '<div class="chip-row" role="group" aria-label="Filter by category">' +
        categories.map(function (c) {
          return '<button class="chip" data-cat="' + esc(c) + '" aria-pressed="' +
            (state.category === c) + '">' + esc(c) + "</button>";
        }).join("") +
      "</div>" +

      '<div class="legend"><span class="legend-title">Verdict key:</span>' +
        '<span class="signal signal-new-low">NEW LOW</span> lowest price we could verify &nbsp;·&nbsp; ' +
        '<span class="signal signal-strong">STRONG DEAL</span> a real cut, well under list &nbsp;·&nbsp; ' +
        '<span class="signal signal-routine">ROUTINE SALE</span> a small cut — buy the bundle instead' +
      "</div>" +

      '<p class="result-line">Showing <b>' + list.length + "</b> of <b>" + deals.length +
        "</b> deals" + (state.category !== "All" ? " in <b>" + esc(state.category) + "</b>" : "") +
        (state.query ? ' matching “<b>' + esc(state.query) + "</b>”" : "") + ".</p>";

    if (list.length === 0) {
      html += '<p class="empty">No deals match that search. Try a different word, store or discount.</p>';
    } else {
      html += '<main class="grid">' + list.map(cardHtml).join("") + "</main>";
    }

    html += '<footer class="footer">' + esc(window.CHECKED_NOTE || "") +
      " Prices change fast during Black Friday week — open the store link to confirm before you buy. " +
      "DealSleuth is an independent finder; store names belong to their owners.</footer>";

    root.innerHTML = html;

    document.getElementById("q").addEventListener("input", function (e) {
      state.query = e.target.value;
      refreshGridOnly();
    });
    document.getElementById("store").addEventListener("change", function (e) {
      state.store = e.target.value;
      refreshGridOnly();
    });
    document.getElementById("mindisc").addEventListener("change", function (e) {
      state.minDiscount = parseInt(e.target.value, 10);
      refreshGridOnly();
    });
    document.getElementById("sort").addEventListener("change", function (e) {
      state.sort = e.target.value;
      refreshGridOnly();
    });
    root.querySelectorAll(".chip").forEach(function (btn) {
      btn.addEventListener("click", function () {
        state.category = btn.getAttribute("data-cat");
        renderGrid();
      });
    });
  }

  // Re-render only the result line and grid so the search box keeps focus.
  function refreshGridOnly() {
    var list = filteredDeals();
    var line = root.querySelector(".result-line");
    if (line) {
      line.innerHTML = "Showing <b>" + list.length + "</b> of <b>" + deals.length +
        "</b> deals" + (state.category !== "All" ? " in <b>" + esc(state.category) + "</b>" : "") +
        (state.query ? ' matching “<b>' + esc(state.query) + "</b>”" : "") + ".";
    }
    var old = root.querySelector(".grid");
    var empty = root.querySelector(".empty");
    if (empty) empty.remove();
    if (list.length === 0) {
      if (old) old.remove();
      root.insertAdjacentHTML("beforeend",
        '<p class="empty">No deals match that search. Try a different word, store or discount.</p>');
    } else {
      var grid = '<main class="grid">' + list.map(cardHtml).join("") + "</main>";
      if (old) { old.outerHTML = grid; }
      else { root.insertAdjacentHTML("beforeend", grid); }
    }
    var chips = root.querySelectorAll(".chip");
    chips.forEach(function (btn) {
      btn.setAttribute("aria-pressed", String(btn.getAttribute("data-cat") === state.category));
    });
  }

  function renderDetail(id) {
    var d = deals.find(function (x) { return x.id === id; });
    if (!d) { renderGrid(); return; }
    var p = pct(d);
    var html = '<div class="detail">' +
      '<a class="back-link" href="#/">← All deals</a>' +
      '<article class="detail-card">' +
        '<div class="' + tileClass(d.category) + '" aria-hidden="true">' +
          (CATEGORY_ICONS[d.category] || "🏷️") + "</div>" +
        "<h1>" + esc(d.product) + "</h1>" +
        '<div class="meta"><span class="store-pill">' + esc(d.store) + "</span>" +
          esc(d.category) + " · " + signalChip(d) + "</div>" +
        '<div class="detail-prices">' +
          '<span class="sale-price">' + money(d.sale) + perUnit(d) + "</span>" +
          '<span class="usual-price">usual ' + money(d.usual) + perUnit(d) + "</span>" +
          '<span class="save-badge">−' + p + "% · save " + money(saved(d)) + perUnit(d) + "</span>" +
        "</div>" +
        '<div class="save-bar"><i style="width:' + Math.min(p, 100) + '%"></i></div>' +
        '<div class="verdict-box"><b>Is it really a deal?</b> ' + esc(d.evidence) + "</div>" +
        "<dl class='detail-grid'>" +
          "<div><dt>Store</dt><dd>" + esc(d.store) + "</dd></div>" +
          "<div><dt>Category</dt><dd>" + esc(d.category) + "</dd></div>" +
          "<div><dt>Sale price</dt><dd>" + money(d.sale) + perUnit(d) + "</dd></div>" +
          "<div><dt>Usual price</dt><dd>" + money(d.usual) + perUnit(d) + "</dd></div>" +
          "<div><dt>Discount</dt><dd>" + p + "% off — you save " + money(saved(d)) + perUnit(d) + "</dd></div>" +
          "<div><dt>Price checked</dt><dd>" + esc(d.checked) + "</dd></div>" +
          "<div><dt>Source</dt><dd>" + esc(d.source) + "</dd></div>" +
          "<div><dt>Store link</dt><dd><a href='" + esc(d.url) + "' target='_blank' rel='noopener'>Open at " + esc(d.store) + " →</a></dd></div>" +
          (d.alsoAt ? "<div><dt>Also at</dt><dd>" + esc(d.alsoAt) + "</dd></div>" : "") +
        "</dl>" +
        '<div class="card-actions">' +
          '<a class="btn" href="' + esc(d.url) + '" target="_blank" rel="noopener">View at ' + esc(d.store) + " →</a>" +
          '<a class="btn btn-ghost" href="#/">← Back to all deals</a>' +
        "</div>" +
      "</article></div>" +
      '<footer class="footer">' + esc(window.CHECKED_NOTE || "") + "</footer>";
    root.innerHTML = html;
    window.scrollTo(0, 0);
  }

  function route() {
    var hash = window.location.hash || "#/";
    var parts = hash.replace(/^#\/?/, "").split("/");
    if (parts[0] === "deal" && parts[1]) {
      renderDetail(decodeURIComponent(parts[1]));
    } else if (parts[0] === "cat" && parts[1]) {
      state.category = decodeURIComponent(parts[1]);
      renderGrid();
    } else if (parts[0] === "search" && parts[1]) {
      state.query = decodeURIComponent(parts[1]);
      renderGrid();
    } else {
      renderGrid();
    }
  }

  window.addEventListener("hashchange", route);
  route();
})();
