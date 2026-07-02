// ==========================================================================
// MMA TOURNAMENT & FIGHTER MANAGER - LOGIC MODULE
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
  // --- STATE VARIABLES ---
  let fighters = [];
  let bracket = [];
  let history = [];
  let champion = null;
  let activeMatchIndex = null;
  let selectedWinnerSide = null; // 'red' or 'blue'
  let currentRole = "admin"; // 'admin' or 'judge'

  // --- DOM ELEMENTS ---
  const tabLinks = document.querySelectorAll(".nav-item");
  const tabContents = document.querySelectorAll(".page");
  
  // Role switcher
  const btnRoleAdmin = document.querySelector(".role-btn[data-role='admin']");
  const btnRoleJudge = document.querySelector(".role-btn[data-role='judge']");

  // Presenter TV Mode - In the original single page app style we had specific bindings. Let's make sure they work with index.html.
  // We'll see how we can bind elements in index.html.

  // Stats
  const statTotalFighters = document.getElementById("s-fighters");
  const statMatchesPlayed = document.getElementById("s-matches");
  const statCurrentChampion = document.getElementById("s-champ");

  // Roster Screen
  const fightersContainer = document.getElementById("fighters-grid");
  
  // Fighter skill ranges display update
  const skillsToTrack = ["str", "grp", "sub", "stm"];
  skillsToTrack.forEach(skill => {
    const input = document.getElementById(`r-${skill}`);
    const display = document.getElementById(`rv-${skill}`);
    if (input && display) {
      input.addEventListener("input", (e) => {
        display.textContent = e.target.value;
      });
    }
  });

  // Tournament Reset Buttons
  const btnInitTournament = document.querySelector(".btn-red[onclick='confirmReset()']");

  // Bracket Match Logger
  const logMatchModal = document.getElementById("log-modal");
  const logMatchForm = logMatchModal.querySelector("form");
  
  const logRedCard = document.getElementById("cc-red");
  const logBlueCard = document.getElementById("cc-blue");
  const logRedAvatar = document.getElementById("log-red-img");
  const logBlueAvatar = document.getElementById("log-blue-img");
  const logRedName = document.getElementById("log-red-name");
  const logBlueName = document.getElementById("log-blue-name");
  const btnSubmitLog = document.getElementById("log-submit");

  // Dashboard Section
  const dashNextMatchDetails = document.getElementById("dash-next");
  const dashRosterList = document.getElementById("dash-top");

  // History Section
  const historyItemsContainer = document.getElementById("hist-list");
  const chartKoFill = document.getElementById("ko-bar");
  const chartSubFill = document.getElementById("sub-bar");
  const chartDecFill = document.getElementById("dec-bar");
  const chartKoPct = document.getElementById("ko-pct");
  const chartSubPct = document.getElementById("sub-pct");
  const chartDecPct = document.getElementById("dec-pct");

  // Champion Display elements in bracket
  const champAvatar = document.querySelector(".champ-avatar");
  const champName = document.querySelector(".champ-name");

  // --- INITIALIZE APPLICATION ---
  function init() {
    loadStateFromStorage();
    setupNavigation();
    setupFightersForm();
    setupMatchLogger();
    setupRolesAndPresenter();
    renderAll();
    
    // Bind reset buttons manually to override old inline event listeners
    const resetBtn = document.querySelector(".btn-red[onclick='confirmReset()']");
    if (resetBtn) {
      resetBtn.removeAttribute("onclick");
      resetBtn.addEventListener("click", () => {
        confirmReset();
      });
    }

    const simBtn = document.getElementById("dash-sim-btn");
    if (simBtn) {
      simBtn.removeAttribute("onclick");
      simBtn.addEventListener("click", () => {
        runSim();
      });
    }
    
    const bracketSimBtn = document.querySelector("#page-bracket .btn-cyan");
    if (bracketSimBtn) {
      bracketSimBtn.removeAttribute("onclick");
      bracketSimBtn.addEventListener("click", () => {
        runSim();
      });
    }

    // Check if the page is loaded in TV mode
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('mode') === 'tv') {
      toggleTV(true);
    }
  }

  // --- STATE PERSISTENCE ---
  function loadStateFromStorage() {
    const storedFighters = localStorage.getItem("mma_fighters");
    const storedBracket = localStorage.getItem("mma_bracket");
    const storedHistory = localStorage.getItem("mma_history");
    const storedChampion = localStorage.getItem("mma_champion");
    const storedRole = localStorage.getItem("mma_role");

    if (storedFighters) {
      fighters = JSON.parse(storedFighters);
    } else {
      fighters = [...defaultFighters];
      localStorage.setItem("mma_fighters", JSON.stringify(fighters));
    }

    if (storedBracket) {
      bracket = JSON.parse(storedBracket);
    } else {
      setupTournamentBracket(false);
    }

    if (storedHistory) {
      history = JSON.parse(storedHistory);
    } else {
      history = [];
    }

    if (storedChampion) {
      champion = JSON.parse(storedChampion);
    } else {
      champion = null;
    }

    if (storedRole) {
      currentRole = storedRole;
    } else {
      currentRole = "admin";
    }
  }

  function saveStateToStorage() {
    localStorage.setItem("mma_fighters", JSON.stringify(fighters));
    localStorage.setItem("mma_bracket", JSON.stringify(bracket));
    localStorage.setItem("mma_history", JSON.stringify(history));
    localStorage.setItem("mma_champion", JSON.stringify(champion));
    localStorage.setItem("mma_role", currentRole);
  }

  // --- TOURNAMENT BRACKET GENERATOR ---
  function setupTournamentBracket(forceReset = false) {
    if (fighters.length < 8) {
      toast("මචන්, Tournament එකක් පටන් ගන්න අඩුම තරමින් ක්‍රීඩකයන් 8 දෙනෙක්වත් ඉන්න ඕනේ!", "warn");
      return;
    }

    bracket = [
      // Round 1 (Quarterfinals)
      { id: 0, round: 1, red: fighters[0], blue: fighters[1], winner: null, method: "", roundEnded: null, timeEnded: "", status: "playable" },
      { id: 1, round: 1, red: fighters[2], blue: fighters[3], winner: null, method: "", roundEnded: null, timeEnded: "", status: "playable" },
      { id: 2, round: 1, red: fighters[4], blue: fighters[5], winner: null, method: "", roundEnded: null, timeEnded: "", status: "playable" },
      { id: 3, round: 1, red: fighters[6], blue: fighters[7], winner: null, method: "", roundEnded: null, timeEnded: "", status: "playable" },
      // Round 2 (Semifinals)
      { id: 4, round: 2, red: null, blue: null, winner: null, method: "", roundEnded: null, timeEnded: "", status: "pending" },
      { id: 5, round: 2, red: null, blue: null, winner: null, method: "", roundEnded: null, timeEnded: "", status: "pending" },
      // Round 3 (Finals)
      { id: 6, round: 3, red: null, blue: null, winner: null, method: "", roundEnded: null, timeEnded: "", status: "pending" }
    ];

    history = [];
    champion = null;
    
    saveStateToStorage();
    if (forceReset) {
      renderAll();
      toast("තරඟාවලිය සාර්ථකව reset කරන ලදී!", "success");
    }
  }

  // --- NAVIGATION TAB SWITCHER ---
  function setupNavigation() {
    tabLinks.forEach(link => {
      link.addEventListener("click", () => {
        // extract page ID from onclick attribute or data-page
        let pageId = "";
        const onclickText = link.getAttribute("onclick");
        if (onclickText && onclickText.includes("showPage")) {
          pageId = onclickText.split("'")[1];
        }
        
        if (pageId) {
          switchTab(pageId);
        }
      });
    });
  }

  window.showPage = function(pageId) {
    switchTab(pageId);
  };

  function switchTab(tabId) {
    tabLinks.forEach(link => {
      const onclickText = link.getAttribute("onclick");
      if (onclickText && onclickText.includes(tabId)) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });

    tabContents.forEach(content => {
      if (content.id === "page-" + tabId) {
        content.classList.add("active");
      } else {
        content.classList.remove("active");
      }
    });

    // Draw connectors if bracket page loaded
    if (tabId === "bracket") {
      setTimeout(drawConnectors, 50);
    }
  }

  // --- ROLES & PRESENTER MODE SETUP ---
  function setupRolesAndPresenter() {
    updateRoleUI();

    // Bind roles switcher manually
    const roleBtns = document.querySelectorAll(".role-btn");
    roleBtns.forEach(btn => {
      btn.removeAttribute("onclick");
      btn.addEventListener("click", () => {
        const role = btn.getAttribute("data-role") || (btn.textContent.trim().toLowerCase() === "admin" ? "admin" : "judge");
        setRole(role);
      });
    });
  }

  window.setRole = function(role) {
    currentRole = role;
    saveStateToStorage();
    updateRoleUI();
    renderAll();
    
    const roleSinhala = role === "admin" ? "Admin (පරිපාලක)" : "Judge (විනිසුරු)";
    toast(`ඔබ දැන් ${roleSinhala} ලෙස ඇතුළු වී ඇත.`, "info");
  };

  function updateRoleUI() {
    const adminBtn = document.querySelector(".role-btn[data-role='admin']");
    const judgeBtn = document.querySelector(".role-btn[data-role='judge']");
    
    if (currentRole === "admin") {
      document.body.classList.remove("role-judge");
      if (adminBtn) adminBtn.classList.add("active");
      if (judgeBtn) judgeBtn.classList.remove("active");
    } else {
      document.body.classList.add("role-judge");
      if (judgeBtn) judgeBtn.classList.add("active");
      if (adminBtn) adminBtn.classList.remove("active");
    }
  }

  window.toggleTV = function(on) {
    const urlParams = new URLSearchParams(window.location.search);
    const isTvModeUrl = urlParams.get('mode') === 'tv';

    if (on) {
      if (isTvModeUrl) {
        document.body.classList.add('tv-mode');
        switchTab('bracket');
      } else {
        // Open TV/Presenter Mode in a new window/popup
        const tvUrl = window.location.href.split('?')[0] + '?mode=tv';
        window.open(tvUrl, 'MMA_Presenter_Mode', 'width=1280,height=720,resizable=yes,scrollbars=yes');
      }
    } else {
      if (isTvModeUrl) {
        // Close the TV window if it was opened programmatically
        window.close();
        // Fallback for safety if close is blocked
        setTimeout(() => {
          document.body.classList.remove('tv-mode');
          window.location.search = '';
        }, 100);
      } else {
        document.body.classList.remove('tv-mode');
      }
    }
  };

  // --- FIGHTERS ROSTER OPERATIONS ---
  function setupFightersForm() {
    const addFighterForm = document.querySelector("#add-modal form");
    if (addFighterForm) {
      addFighterForm.removeAttribute("onsubmit");
      addFighterForm.addEventListener("submit", (e) => {
        e.preventDefault();
        submitAddFighter();
      });
    }
  }

  window.openAddFighter = function() {
    const addModal = document.getElementById("add-modal");
    if (addModal) addModal.classList.add("open");
  };

  window.closeModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove("open");
      if (modalId === "add-modal") {
        const addFighterForm = modal.querySelector("form");
        if (addFighterForm) addFighterForm.reset();
        skillsToTrack.forEach(skill => {
          const display = document.getElementById(`rv-${skill}`);
          if (display) display.textContent = "80";
        });
      }
    }
  };

  function submitAddFighter() {
    const nameInput = document.getElementById("f-name");
    const ageInput = document.getElementById("f-age");
    const heightInput = document.getElementById("f-height");
    const weightInput = document.getElementById("f-weight");
    const styleSelect = document.getElementById("f-style");
    const gymInput = document.getElementById("f-gym");
    
    const winsInput = document.getElementById("f-wins");
    const lossesInput = document.getElementById("f-losses");

    const strInput = document.getElementById("r-str");
    const grpInput = document.getElementById("r-grp");
    const subInput = document.getElementById("r-sub");
    const stmInput = document.getElementById("r-stm");

    const newFighter = {
      id: "f_" + Date.now(),
      name: nameInput.value,
      age: parseInt(ageInput.value) || 26,
      height: heightInput.value || "5'10\"",
      weight: parseInt(weightInput.value) || 155,
      weightClass: "Lightweight",
      style: styleSelect.value,
      record: {
        wins: parseInt(winsInput.value) || 0,
        losses: parseInt(lossesInput.value) || 0,
        draws: 0
      },
      stats: {
        striking: parseInt(strInput.value) || 80,
        grappling: parseInt(grpInput.value) || 80,
        submission: parseInt(subInput.value) || 80,
        stamina: parseInt(stmInput.value) || 80
      },
      gym: gymInput.value,
      avatar: `https://images.unsplash.com/photo-${getRandomAvatarId()}?auto=format&fit=crop&w=200&q=80`,
      color: getRandomHexColor()
    };

    fighters.push(newFighter);
    saveStateToStorage();
    closeModal('add-modal');
    renderAll();
    
    toast(`${newFighter.name} ක්‍රීඩක ලැයිස්තුවට සාර්ථකව එකතු කරන ලදී!`, "success");
  }

  window.deleteFighter = function(id) {
    const inUse = bracket.some(match => 
      (match.red && match.red.id === id) || (match.blue && match.blue.id === id)
    );

    if (inUse) {
      toast("මචන්, මේ ක්‍රීඩකයා දැනට ක්‍රියාත්මක වන තරඟාවලියේ ඉන්නවා. ඔයාට එයාව ඉවත් කරන්න බැහැ. ඉවත් කරන්න ඕනෙ නම් තරඟාවලිය Reset කරන්න.", "warn");
      return;
    }

    fighters = fighters.filter(f => f.id !== id);
    saveStateToStorage();
    renderAll();
    toast("Fighter removed from pool.", "success");
  };

  function getRandomAvatarId() {
    const ids = [
      "1507003211169-0a1dd7228f2d",
      "1620122303020-43ec4b6cf7f8",
      "1500648767791-00dcc994a43e",
      "1534528741775-53994a69daeb",
      "1539571696357-5a69c17a67c6",
      "1501196354995-cbb51c65aaea",
      "1492562080023-ab3db95bfbce",
      "1517841905240-472988babdf9"
    ];
    return ids[Math.floor(Math.random() * ids.length)];
  }

  function getRandomHexColor() {
    const colors = ["#ff2a5f", "#00f0ff", "#ff9f43", "#a55eea", "#20bf6b", "#eb3b5a", "#f7b731", "#2bcbba"];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // --- MANUAL MATCH LOGGER OPERATIONS ---
  function setupMatchLogger() {
    if (logMatchForm) {
      logMatchForm.removeAttribute("onsubmit");
      logMatchForm.addEventListener("submit", (e) => {
        e.preventDefault();
        submitLog();
      });
    }

    if (logRedCard) {
      logRedCard.removeAttribute("onclick");
      logRedCard.addEventListener("click", () => selectCorner('red'));
    }

    if (logBlueCard) {
      logBlueCard.removeAttribute("onclick");
      logBlueCard.addEventListener("click", () => selectCorner('blue'));
    }
  }

  window.openMatchLogger = function(matchIndex) {
    const match = bracket[matchIndex];
    if (match.status !== "playable") return;

    activeMatchIndex = matchIndex;
    selectedWinnerSide = null;
    
    // Set text and avatars
    logRedName.textContent = match.red.name;
    logRedAvatar.src = match.red.avatar;
    logBlueName.textContent = match.blue.name;
    logBlueAvatar.src = match.blue.avatar;

    logRedCard.classList.remove("sel-red");
    logBlueCard.classList.remove("sel-cyan");
    btnSubmitLog.disabled = true;

    logMatchModal.classList.add("open");
  };

  window.selectCorner = function(side) {
    selectedWinnerSide = side;
    if (side === "red") {
      logRedCard.classList.add("sel-red");
      logBlueCard.classList.remove("sel-cyan");
    } else {
      logBlueCard.classList.add("sel-cyan");
      logRedCard.classList.remove("sel-red");
    }
    btnSubmitLog.disabled = false;
  };

  function submitLog() {
    if (activeMatchIndex === null || !selectedWinnerSide) return;

    const method = document.getElementById("log-method").value;
    const round = parseInt(document.getElementById("log-round").value) || 1;
    const time = document.getElementById("log-time").value || "1:30";

    resolveMatch(activeMatchIndex, selectedWinnerSide, method, round, time);
    closeModal('log-modal');
  }

  // --- RESOLVE & ADVANCE FIGHTER ---
  function resolveMatch(matchIndex, winnerSide, method, round, time) {
    const match = bracket[matchIndex];
    const winner = winnerSide === "red" ? match.red : match.blue;
    const loser = winnerSide === "red" ? match.blue : match.red;

    match.winner = winner;
    match.method = method;
    match.roundEnded = round;
    match.timeEnded = time;
    match.status = "completed";

    const historyItem = {
      matchId: match.id,
      roundName: getRoundName(match.round),
      red: match.red,
      blue: match.blue,
      winner: winner,
      loser: loser,
      method: method,
      roundEnded: round,
      timeEnded: time
    };
    
    history.unshift(historyItem);
    advanceWinner(matchIndex, winner);
    updateBracketPlayableStates();
    checkChampionStatus();

    saveStateToStorage();
    renderAll();
  }

  function getRoundName(roundNum) {
    if (roundNum === 1) return "Quarterfinals";
    if (roundNum === 2) return "Semifinals";
    return "Finals";
  }

  function advanceWinner(matchIndex, winner) {
    if (matchIndex === 0) bracket[4].red = winner;
    if (matchIndex === 1) bracket[4].blue = winner;
    if (matchIndex === 2) bracket[5].red = winner;
    if (matchIndex === 3) bracket[5].blue = winner;
    
    if (matchIndex === 4) bracket[6].red = winner;
    if (matchIndex === 5) bracket[6].blue = winner;

    if (matchIndex === 6) {
      champion = winner;
    }
  }

  function updateBracketPlayableStates() {
    bracket.forEach(match => {
      if (match.status === "completed") return;
      if (match.red && match.blue) {
        match.status = "playable";
      } else {
        match.status = "pending";
      }
    });
  }

  function checkChampionStatus() {
    if (bracket[6].status === "completed" && bracket[6].winner) {
      champion = bracket[6].winner;
    }
  }

  // --- AUTOMATIC FIGHT SIMULATION ENGINE ---
  window.runSim = function() {
    const playableIndex = bracket.findIndex(m => m.status === "playable");
    
    if (playableIndex === -1) {
      if (champion) {
        toast("මචන්, Tournament එක දැනටමත් ඉවරයි! අලුත් එකක් පටන් ගන්න reset කරන්න.", "warn");
      } else {
        toast("සෙල්ලම් කරන්න පුළුවන් තරඟයක් මේ වෙලාවේ නැහැ!", "warn");
      }
      return;
    }

    const match = bracket[playableIndex];
    const red = match.red;
    const blue = match.blue;

    const redScore = (red.stats.striking + red.stats.grappling + red.stats.submission + red.stats.stamina) / 4;
    const blueScore = (blue.stats.striking + blue.stats.grappling + blue.stats.submission + blue.stats.stamina) / 4;

    const redRoll = redScore + (Math.random() * 16 - 8);
    const blueRoll = blueScore + (Math.random() * 16 - 8);

    const winnerSide = redRoll >= blueRoll ? "red" : "blue";
    const winner = winnerSide === "red" ? red : blue;

    let method = "Unanimous Decision";
    const rand = Math.random();

    if (winner.style === "Brazilian Jiu-Jitsu") {
      method = rand < 0.65 ? "Submission" : (rand < 0.85 ? "Unanimous Decision" : "Split Decision");
    } else if (winner.style === "Muay Thai / Kickboxing" || winner.style === "Boxing" || winner.style === "Karate" || winner.style === "Muay Thai") {
      method = rand < 0.70 ? "KO/TKO" : (rand < 0.90 ? "Unanimous Decision" : "Doctor Stoppage");
    } else if (winner.style === "Wrestling / Ground & Pound" || winner.style === "Wrestling") {
      method = rand < 0.40 ? "KO/TKO" : (rand < 0.70 ? "Unanimous Decision" : "Submission");
    } else {
      method = rand < 0.35 ? "KO/TKO" : (rand < 0.70 ? "Submission" : "Unanimous Decision");
    }

    const round = Math.floor(Math.random() * 3) + 1;
    const minutes = Math.floor(Math.random() * 5);
    const seconds = Math.floor(Math.random() * 60).toString().padStart(2, '0');
    const time = `${minutes}:${seconds}`;

    resolveMatch(playableIndex, winnerSide, method, round, time);
    switchTab("bracket");
    toast(`${winner.name} won the fight via ${method}!`, "success");
  };

  // --- RESET TOURNAMENT ---
  window.confirmReset = function() {
    const overlay = document.getElementById("confirm-overlay");
    if (overlay) {
      overlay.classList.add("open");
      
      const okBtn = document.getElementById("confirm-ok");
      okBtn.removeAttribute("onclick");
      okBtn.addEventListener("click", () => {
        setupTournamentBracket(true);
        closeConfirm(true);
      });
    }
  };

  window.closeConfirm = function(approved) {
    const overlay = document.getElementById("confirm-overlay");
    if (overlay) overlay.classList.remove("open");
  };

  // --- TOAST NOTIFICATIONS ---
  function toast(msg, type = "success") {
    const container = document.getElementById("toast");
    if (!container) return;

    const item = document.createElement("div");
    item.className = `toast-item t-${type}`;
    
    let icon = "fa-check";
    if (type === "warn") icon = "fa-triangle-exclamation";
    if (type === "info") icon = "fa-circle-info";
    
    item.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${msg}</span>`;
    container.appendChild(item);

    setTimeout(() => {
      item.style.animation = "toastIn 0.3s ease reverse forwards";
      setTimeout(() => item.remove(), 300);
    }, 3000);
  }

  // --- RENDERING ENGINE ---
  function renderAll() {
    renderRosterCount();
    renderFightersList();
    renderBracketTree();
    renderHistoryAndStats();
    renderDashboardWidgets();

    // Redraw connectors in bracket view if active
    if (document.getElementById("page-bracket").classList.contains("active")) {
      setTimeout(drawConnectors, 50);
    }
  }

  function renderRosterCount() {
    statTotalFighters.textContent = fighters.length;
    
    const completedCount = bracket.filter(m => m.status === "completed").length;
    statMatchesPlayed.textContent = `${completedCount} / 7`;

    if (champion) {
      statCurrentChampion.textContent = champion.name.split("'")[0].trim().split(" ")[0];
      statCurrentChampion.style.color = "var(--gold)";
    } else {
      statCurrentChampion.textContent = "TBD";
      statCurrentChampion.style.color = "";
    }
  }

  function renderFightersList() {
    fightersContainer.innerHTML = "";
    if (fighters.length === 0) {
      fightersContainer.innerHTML = `
        <div class="empty" style="grid-column: 1/-1;">
          <i class="fa-solid fa-people-group"></i>
          <p>No fighters in the roster pool.</p>
        </div>
      `;
      return;
    }

    fighters.forEach(fighter => {
      const card = document.createElement("div");
      card.className = "f-card";
      card.style.setProperty("--c", fighter.color);

      const wins = fighter.record.wins || fighter.record.w || 0;
      const losses = fighter.record.losses || fighter.record.l || 0;

      card.innerHTML = `
        <div class="f-head">
          <img src="${fighter.avatar}" class="f-avatar" alt="${fighter.name}">
          <div>
            <h4 class="f-name">${fighter.name}</h4>
            <div class="f-style">${fighter.style}</div>
            <div class="f-wc">Lightweight</div>
          </div>
        </div>
        <div class="f-body">
          <div class="f-record">
            ${wins} - ${losses}
            <small>Professional Record</small>
          </div>
          <div class="f-bio">
            <div><div class="bio-v">${fighter.age || 26}</div><div class="bio-l">Age</div></div>
            <div><div class="bio-v">${fighter.height || "5'10\""}</div><div class="bio-l">Height</div></div>
            <div><div class="bio-v">${fighter.weight || 155} <small style="font-size:0.55rem">lbs</small></div><div class="bio-l">Weight</div></div>
          </div>
          <div class="f-bars">
            <div>
              <div class="bar-row"><span class="bar-lbl">Striking</span><span class="bar-val">${fighter.stats.striking}</span></div>
              <div class="bar-bg"><div class="bar-fill" style="width: ${fighter.stats.striking}%"></div></div>
            </div>
            <div>
              <div class="bar-row"><span class="bar-lbl">Grappling</span><span class="bar-val">${fighter.stats.grappling}</span></div>
              <div class="bar-bg"><div class="bar-fill" style="width: ${fighter.stats.grappling}%"></div></div>
            </div>
            <div>
              <div class="bar-row"><span class="bar-lbl">Submissions</span><span class="bar-val">${fighter.stats.submission}</span></div>
              <div class="bar-bg"><div class="bar-fill" style="width: ${fighter.stats.submission}%"></div></div>
            </div>
            <div>
              <div class="bar-row"><span class="bar-lbl">Stamina</span><span class="bar-val">${fighter.stats.stamina}</span></div>
              <div class="bar-bg"><div class="bar-fill" style="width: ${fighter.stats.stamina}%"></div></div>
            </div>
          </div>
        </div>
        <div class="f-foot">
          <span><i class="fa-solid fa-hotel"></i> ${fighter.gym}</span>
          <button class="btn-del" onclick="deleteFighter('${fighter.id}')" title="Delete Fighter"><i class="fa-solid fa-trash-can"></i></button>
        </div>
      `;

      card.querySelector(".btn-del").removeAttribute("onclick");
      card.querySelector(".btn-del").addEventListener("click", (e) => {
        e.stopPropagation();
        if (confirm(`මචන්, ඔයාට ${fighter.name} ක්‍රීඩකයාව ලැයිස්තුවෙන් ඉවත් කරන්න ඕනෙද?`)) {
          deleteFighter(fighter.id);
        }
      });

      fightersContainer.appendChild(card);
    });
  }

  function renderBracketTree() {
    const colsContainer = document.getElementById("bracket-cols");
    colsContainer.innerHTML = "";

    // Create 3 rounds columns + champion column
    const round1Col = createRoundCol(1, "Quarterfinals");
    const round2Col = createRoundCol(2, "Semifinals");
    const round3Col = createRoundCol(3, "Championship");
    const champCol = document.createElement("div");
    champCol.className = "champ-col";

    if (champion) {
      champCol.innerHTML = `
        <div class="champ-box">
          <i class="fa-solid fa-trophy champ-trophy"></i>
          <span class="champ-lbl">Champion</span>
          <img src="${champion.avatar}" class="champ-avatar" alt="${champion.name}">
          <div class="champ-name">${champion.name}</div>
        </div>
      `;
    } else {
      champCol.innerHTML = `
        <div class="champ-box" style="border-color: var(--border); box-shadow: none;">
          <i class="fa-solid fa-trophy champ-trophy" style="color: var(--dim);"></i>
          <span class="champ-lbl" style="color: var(--dim);">Undecided</span>
          <div class="champ-name" style="color: var(--dim); margin-top: 10px;">TBD</div>
        </div>
      `;
    }

    // Populate matches into round columns
    bracket.forEach((match, idx) => {
      const box = document.createElement("div");
      box.className = `match-box ${match.status}`;
      box.id = `match-${idx}`;

      const redName = match.red ? match.red.name : "TBD";
      const blueName = match.blue ? match.blue.name : "TBD";
      
      const redWinnerClass = match.winner && match.red && match.winner.id === match.red.id ? "winner" : (match.winner ? "loser" : "");
      const blueWinnerClass = match.winner && match.blue && match.winner.id === match.blue.id ? "winner" : (match.winner ? "loser" : "");

      const redScore = match.winner && match.red && match.winner.id === match.red.id ? "W" : "-";
      const blueScore = match.winner && match.blue && match.winner.id === match.blue.id ? "W" : "-";

      box.innerHTML = `
        <div class="match-hdr">
          <span>Match #${idx + 1}</span>
          <span class="m-badge">${match.status}</span>
        </div>
        <div class="match-fighters">
          <div class="m-row r-red ${redWinnerClass}">
            <div class="m-dot"></div>
            <span class="m-name">${redName}</span>
            <span class="m-score">${redScore}</span>
          </div>
          <div class="m-row r-blue ${blueWinnerClass}">
            <div class="m-dot"></div>
            <span class="m-name">${blueName}</span>
            <span class="m-score">${blueScore}</span>
          </div>
        </div>
        ${match.status === "completed" ? `<div class="match-footer">${match.method} (R${match.roundEnded} ${match.timeEnded})</div>` : ""}
      `;

      if (match.status === "playable") {
        box.addEventListener("click", () => {
          openMatchLogger(idx);
        });
      }

      if (match.round === 1) round1Col.appendChild(box);
      if (match.round === 2) round2Col.appendChild(box);
      if (match.round === 3) round3Col.appendChild(box);
    });

    colsContainer.appendChild(round1Col);
    colsContainer.appendChild(round2Col);
    colsContainer.appendChild(round3Col);
    colsContainer.appendChild(champCol);

    // Create SVG Overlay for lines (replacing any existing one to prevent duplicates)
    let svgOverlay = document.querySelector(".connector-svg");
    if (svgOverlay) {
      svgOverlay.remove();
    }
    svgOverlay = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svgOverlay.className = "connector-svg";
    document.getElementById("bracket-scroll").appendChild(svgOverlay);
  }

  function createRoundCol(roundNum, name) {
    const col = document.createElement("div");
    col.className = "round-col";
    col.style.height = "520px";
    col.innerHTML = `<div class="round-label">${name}</div>`;
    return col;
  }

  // Draw lines connecting matches
  function drawConnectors() {
    const svg = document.querySelector(".connector-svg");
    if (!svg) return;
    svg.innerHTML = "";

    const drawLine = (x1, y1, x2, y2, stateClass) => {
      const line = document.createElementNS("http://www.w3.org/2000/svg", "path");
      const midX = (x1 + x2) / 2;
      // Drawing horizontal-vertical-horizontal path
      line.setAttribute("d", `M ${x1} ${y1} H ${midX} V ${y2} H ${x2}`);
      line.setAttribute("class", `svg-line ${stateClass}`);
      svg.appendChild(line);
    };

    // Connect matches
    const getBoxMidRight = (id) => {
      const el = document.getElementById(id);
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      const parentRect = el.offsetParent.getBoundingClientRect();
      return {
        x: rect.right - parentRect.left,
        y: rect.top - parentRect.top + rect.height / 2
      };
    };

    const getBoxMidLeft = (id) => {
      const el = document.getElementById(id);
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      const parentRect = el.offsetParent.getBoundingClientRect();
      return {
        x: rect.left - parentRect.left,
        y: rect.top - parentRect.top + rect.height / 2
      };
    };

    const connections = [
      { from: "match-0", to: "match-4", side: "red" },
      { from: "match-1", to: "match-4", side: "blue" },
      { from: "match-2", to: "match-5", side: "red" },
      { from: "match-3", to: "match-5", side: "blue" },
      { from: "match-4", to: "match-6", side: "red" },
      { from: "match-5", to: "match-6", side: "blue" }
    ];

    connections.forEach(conn => {
      const p1 = getBoxMidRight(conn.from);
      const p2 = getBoxMidLeft(conn.to);
      
      if (p1 && p2) {
        const fromMatch = bracket[parseInt(conn.from.split("-")[1])];
        const toMatch = bracket[parseInt(conn.to.split("-")[1])];
        
        let stateClass = "";
        if (fromMatch.status === "completed" && fromMatch.winner) {
          stateClass = fromMatch.winner.id === fromMatch.red?.id ? "active-red" : "active-cyan";
        }
        
        // Adjust left connection point vertically depending on red/blue side input
        const yOffset = conn.side === "red" ? -18 : 18;
        drawLine(p1.x, p1.y, p2.x, p2.y + yOffset, stateClass);
      }
    });

    // Connect final to champ
    const pFinal = getBoxMidRight("match-6");
    const elChamp = document.querySelector(".champ-box");
    if (pFinal && elChamp) {
      const rectChamp = elChamp.getBoundingClientRect();
      const parentRect = elChamp.offsetParent.getBoundingClientRect();
      const pChamp = {
        x: rectChamp.left - parentRect.left,
        y: rectChamp.top - parentRect.top + rectChamp.height / 2
      };
      
      const finalMatch = bracket[6];
      let stateClass = "";
      if (finalMatch.status === "completed" && finalMatch.winner) {
        stateClass = "active-green";
      }
      drawLine(pFinal.x, pFinal.y, pChamp.x, pChamp.y, stateClass);
    }
  }

  // Monitor resize to redraw lines
  window.addEventListener("resize", () => {
    if (document.getElementById("page-bracket").classList.contains("active")) {
      drawConnectors();
    }
  });

  function renderHistoryAndStats() {
    historyItemsContainer.innerHTML = "";

    if (history.length === 0) {
      historyItemsContainer.innerHTML = `
        <div class="empty">
          <i class="fa-solid fa-calendar-minus"></i>
          <p>No fights completed yet.</p>
        </div>
      `;
      chartKoFill.style.width = "0%";
      chartSubFill.style.width = "0%";
      chartDecFill.style.width = "0%";
      chartKoPct.textContent = "0%";
      chartSubPct.textContent = "0%";
      chartDecPct.textContent = "0%";
      return;
    }

    history.forEach(item => {
      const itemEl = document.createElement("div");
      itemEl.className = "hist-item";

      const methodClass = getMethodClass(item.method);
      
      itemEl.innerHTML = `
        <div>
          <div class="h-vs">
            <span class="rn">${item.red.name.split(" ")[0]}</span>
            <span class="vs">vs</span>
            <span class="bn">${item.blue.name.split(" ")[0]}</span>
          </div>
          <div class="h-detail">
            ${item.roundName}: <strong>${item.winner.name}</strong> wins via ${item.method} in R${item.roundEnded} @ ${item.timeEnded}.
          </div>
        </div>
        <span class="h-badge ${methodClass}">${item.method}</span>
      `;

      historyItemsContainer.appendChild(itemEl);
    });

    const total = history.length;
    let koCount = 0;
    let subCount = 0;
    let decCount = 0;

    history.forEach(item => {
      if (item.method === "KO/TKO" || item.method === "Doctor Stoppage") koCount++;
      if (item.method === "Submission") subCount++;
      if (item.method.includes("Decision")) decCount++;
    });

    const koPct = total > 0 ? Math.round((koCount / total) * 100) : 0;
    const subPct = total > 0 ? Math.round((subCount / total) * 100) : 0;
    const decPct = total > 0 ? Math.round((decCount / total) * 100) : 0;

    chartKoPct.textContent = `${koPct}%`;
    chartSubPct.textContent = `${subPct}%`;
    chartDecPct.textContent = `${decPct}%`;

    chartKoFill.style.width = `${koPct}%`;
    chartSubFill.style.width = `${subPct}%`;
    chartDecFill.style.width = `${decPct}%`;
  }

  function renderDashboardWidgets() {
    // Next Matchup
    const nextPlayableIndex = bracket.findIndex(m => m.status === "playable");
    if (nextPlayableIndex !== -1) {
      const match = bracket[nextPlayableIndex];
      dashNextMatchDetails.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:16px; align-items:center; width:100%;">
          <div style="display:flex; gap:20px; align-items:center; justify-content:center;">
            <div style="text-align:center;">
              <img src="${match.red.avatar}" style="width:50px; height:50px; border-radius:50%; border:2px solid var(--red);">
              <div style="font-size:0.8rem; font-weight:700; margin-top:5px; max-width:80px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${match.red.name.split(" ")[0]}</div>
            </div>
            <div style="font-family:var(--font-d); font-weight:900; color:var(--dim);">VS</div>
            <div style="text-align:center;">
              <img src="${match.blue.avatar}" style="width:50px; height:50px; border-radius:50%; border:2px solid var(--cyan);">
              <div style="font-size:0.8rem; font-weight:700; margin-top:5px; max-width:80px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${match.blue.name.split(" ")[0]}</div>
            </div>
          </div>
          <button class="btn btn-cyan btn-sm" style="width:100%; justify-content:center;" onclick="openMatchLogger(${nextPlayableIndex})">Log Fight Outcome</button>
        </div>
      `;
    } else {
      dashNextMatchDetails.innerHTML = `
        <div class="empty" style="padding:10px;">
          <i class="fa-solid fa-flag-checkered" style="font-size:1.8rem;"></i>
          <p>Grand Prix Tournament complete!</p>
        </div>
      `;
    }

    // Top Contenders
    const sortedFighters = [...fighters].sort((a, b) => {
      const aScore = (a.stats.striking + a.stats.grappling + a.stats.submission + a.stats.stamina) / 4;
      const bScore = (b.stats.striking + b.stats.grappling + b.stats.submission + b.stats.stamina) / 4;
      return bScore - aScore;
    }).slice(0, 4);

    dashRosterList.innerHTML = "";
    sortedFighters.forEach((f, idx) => {
      const rating = Math.round((f.stats.striking + f.stats.grappling + f.stats.submission + f.stats.stamina) / 4);
      const row = document.createElement("div");
      row.style = "display:flex; align-items:center; gap:12px; padding:10px; background:rgba(0,0,0,0.2); border-radius:8px; border:1px solid var(--border);";
      row.innerHTML = `
        <span style="font-family:var(--font-d); font-weight:800; font-size:1rem; color:var(--red);">#${idx + 1}</span>
        <img src="${f.avatar}" style="width:36px; height:36px; border-radius:50%; border:1px solid var(--border);">
        <div style="flex:1;">
          <div style="font-size:0.85rem; font-weight:700; color:#fff;">${f.name.split("'")[0]}</div>
          <div style="font-size:0.68rem; color:var(--muted);">${f.style}</div>
        </div>
        <span style="font-family:var(--font-d); font-weight:700; font-size:0.8rem; background:rgba(255,255,255,0.05); padding:3px 8px; border-radius:12px;">${rating} OVR</span>
      `;
      dashRosterList.appendChild(row);
    });
  }

  function getMethodClass(method) {
    if (method === "KO/TKO" || method === "Doctor Stoppage") return "ko-badge";
    if (method === "Submission") return "sub-badge";
    return "dec-badge";
  }

  // Sync state across multiple windows/tabs via localStorage
  window.addEventListener('storage', (e) => {
    const keysToSync = ["mma_fighters", "mma_bracket", "mma_history", "mma_champion", "mma_role"];
    if (keysToSync.includes(e.key)) {
      loadStateFromStorage();
      if (e.key === "mma_role") {
        updateRoleUI();
      }
      renderAll();
    }
  });

  // Run initial setup
  init();
});
