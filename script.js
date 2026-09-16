// --- Passcode for Admin Panel ---
const ADMIN_PASSCODE = "admin123";

// --- Initial Demo State ---
const DEFAULT_POLL = {
  title: "College Student Council Election 2026",
  description: "Select your preferred candidate for Class Representative. All votes are anonymous.",
  isOpen: true,
  candidates: [
    { id: "cand_1", name: "Rohan Patil", bio: "Tech & Coding Club Lead", symbol: "⚡", votes: 14 },
    { id: "cand_2", name: "Ananya Deshmukh", bio: "Cultural Committee Head", symbol: "🎨", votes: 19 },
    { id: "cand_3", name: "Sahil Kulkarni", bio: "Sports Captain & Athletics", symbol: "🏏", votes: 9 }
  ]
};

// --- Storage Keys ---
const STORAGE_KEYS = {
  POLL_DATA: "votevault_poll_data",
  HAS_VOTED: "votevault_user_has_voted"
};

// --- State Variables ---
let pollData = loadPollData();
let selectedCandidateId = null;

// --- Load / Save LocalStorage Functions ---
function loadPollData() {
  const saved = localStorage.getItem(STORAGE_KEYS.POLL_DATA);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to parse poll data, resetting to defaults", e);
    }
  }
  localStorage.setItem(STORAGE_KEYS.POLL_DATA, JSON.stringify(DEFAULT_POLL));
  return JSON.parse(JSON.stringify(DEFAULT_POLL));
}

function savePollData() {
  localStorage.setItem(STORAGE_KEYS.POLL_DATA, JSON.stringify(pollData));
}

function hasUserVoted() {
  return localStorage.getItem(STORAGE_KEYS.HAS_VOTED) === "true";
}

function markUserVoted() {
  localStorage.setItem(STORAGE_KEYS.HAS_VOTED, "true");
}

// --- DOM Elements ---
const electionTitle = document.getElementById("electionTitle");
const electionDescription = document.getElementById("electionDescription");
const pollStatusBadge = document.getElementById("pollStatusBadge");
const pollStatusText = document.getElementById("pollStatusText");
const voterBanner = document.getElementById("voterBanner");
const voterBannerText = document.getElementById("voterBannerText");
const candidateGrid = document.getElementById("candidateGrid");
const submitVoteBtn = document.getElementById("submitVoteBtn");
const totalVotesTop = document.getElementById("totalVotesTop");

// Results Elements
const resultsList = document.getElementById("resultsList");
const winnerBanner = document.getElementById("winnerBanner");
const winnerName = document.getElementById("winnerName");
const winnerStats = document.getElementById("winnerStats");
const summaryTotalVotes = document.getElementById("summaryTotalVotes");
const summaryTotalCandidates = document.getElementById("summaryTotalCandidates");
const summaryLeadingCandidate = document.getElementById("summaryLeadingCandidate");
const exportCsvBtn = document.getElementById("exportCsvBtn");

// Modal Elements
const openAdminModalBtn = document.getElementById("openAdminModalBtn");
const adminLoginModal = document.getElementById("adminLoginModal");
const closeLoginModalBtn = document.getElementById("closeLoginModalBtn");
const cancelLoginBtn = document.getElementById("cancelLoginBtn");
const adminLoginForm = document.getElementById("adminLoginForm");
const adminPassword = document.getElementById("adminPassword");
const loginErrorMsg = document.getElementById("loginErrorMsg");

const adminPanelModal = document.getElementById("adminPanelModal");
const closeAdminPanelBtn = document.getElementById("closeAdminPanelBtn");
const exitAdminBtn = document.getElementById("exitAdminBtn");
const editTitleInput = document.getElementById("editTitleInput");
const editDescInput = document.getElementById("editDescInput");
const togglePollStatusBtn = document.getElementById("togglePollStatusBtn");
const togglePollStatusLabel = document.getElementById("togglePollStatusLabel");
const saveGeneralSettingsBtn = document.getElementById("saveGeneralSettingsBtn");
const addCandidateForm = document.getElementById("addCandidateForm");
const adminCandidateTableBody = document.getElementById("adminCandidateTableBody");
const resetMyVoteStatusBtn = document.getElementById("resetMyVoteStatusBtn");
const resetAllVotesBtn = document.getElementById("resetAllVotesBtn");
const toast = document.getElementById("toast");

// --- Helper Functions ---
function showToast(message) {
  toast.textContent = message;
  toast.classList.remove("hidden");
  setTimeout(() => {
    toast.classList.add("hidden");
  }, 3000);
}

function calculateTotals() {
  const totalVotes = pollData.candidates.reduce((sum, c) => sum + c.votes, 0);
  let leadingCandidate = null;
  let maxVotes = -1;

  pollData.candidates.forEach(c => {
    if (c.votes > maxVotes && c.votes > 0) {
      maxVotes = c.votes;
      leadingCandidate = c;
    }
  });

  return { totalVotes, leadingCandidate, maxVotes };
}

// --- Render Main Voting UI ---
function renderVotingBooth() {
  electionTitle.textContent = pollData.title;
  electionDescription.textContent = pollData.description;

  const userVoted = hasUserVoted();
  const { totalVotes } = calculateTotals();
  totalVotesTop.textContent = `${totalVotes} Votes`;

  // Update Status Pill
  if (pollData.isOpen) {
    pollStatusBadge.classList.remove("closed");
    pollStatusText.textContent = "Poll Active";
  } else {
    pollStatusBadge.classList.add("closed");
    pollStatusText.textContent = "Poll Closed";
  }

  // Update Voter Message Banner
  if (userVoted) {
    voterBanner.className = "alert-banner voted";
    voterBanner.innerHTML = `<i class="fa-solid fa-circle-check"></i> <span>You have already cast your anonymous vote on this device.</span>`;
    submitVoteBtn.disabled = true;
    submitVoteBtn.innerHTML = `<i class="fa-solid fa-lock"></i> Vote Recorded`;
  } else if (!pollData.isOpen) {
    voterBanner.className = "alert-banner info";
    voterBanner.innerHTML = `<i class="fa-solid fa-circle-xmark"></i> <span>Voting is currently closed by the administrator.</span>`;
    submitVoteBtn.disabled = true;
    submitVoteBtn.innerHTML = `<i class="fa-solid fa-ban"></i> Voting Closed`;
  } else {
    voterBanner.className = "alert-banner info";
    voterBanner.innerHTML = `<i class="fa-solid fa-shield-halved"></i> <span>Your ballot is 100% anonymous. Single-vote rule applies on this browser.</span>`;
    submitVoteBtn.disabled = selectedCandidateId === null;
    submitVoteBtn.innerHTML = `<i class="fa-solid fa-paper-plane"></i> Cast Secure Ballot`;
  }

  // Render Candidate Options
  candidateGrid.innerHTML = "";
  pollData.candidates.forEach(candidate => {
    const card = document.createElement("div");
    card.className = "candidate-card";
    if (selectedCandidateId === candidate.id) card.classList.add("selected");
    if (userVoted || !pollData.isOpen) card.classList.add("disabled");

    card.innerHTML = `
      <div class="cand-top">
        <div class="cand-symbol">${candidate.symbol || "🗳️"}</div>
        <div class="cand-meta">
          <h3>${escapeHtml(candidate.name)}</h3>
          <span>${escapeHtml(candidate.bio)}</span>
        </div>
      </div>
      <i class="fa-solid ${selectedCandidateId === candidate.id ? "fa-circle-check" : "fa-circle"} select-indicator"></i>
    `;

    card.addEventListener("click", () => {
      if (userVoted || !pollData.isOpen) return;
      selectedCandidateId = candidate.id;
      renderVotingBooth();
    });

    candidateGrid.appendChild(card);
  });
}

// --- Render Results & Analytics ---
function renderResults() {
  const { totalVotes, leadingCandidate, maxVotes } = calculateTotals();

  summaryTotalVotes.textContent = totalVotes;
  summaryTotalCandidates.textContent = pollData.candidates.length;
  summaryLeadingCandidate.textContent = leadingCandidate ? leadingCandidate.name : "None yet";

  // Winner Box calculation (Only if poll is closed and votes exist)
  if (!pollData.isOpen && leadingCandidate && maxVotes > 0) {
    winnerBanner.classList.remove("hidden");
    winnerName.textContent = leadingCandidate.name;
    const winPercent = ((leadingCandidate.votes / totalVotes) * 100).toFixed(1);
    winnerStats.textContent = `${leadingCandidate.votes} votes (${winPercent}% of total)`;
  } else {
    winnerBanner.classList.add("hidden");
  }

  // Candidate Progress Bars
  resultsList.innerHTML = "";
  pollData.candidates.forEach(candidate => {
    const percentage = totalVotes > 0 ? ((candidate.votes / totalVotes) * 100).toFixed(1) : 0;
    const isLeader = leadingCandidate && candidate.id === leadingCandidate.id && candidate.votes > 0;

    const row = document.createElement("div");
    row.className = "result-row";
    row.innerHTML = `
      <div class="result-info">
        <div class="result-cand-name">
          <span>${candidate.symbol || "🗳️"}</span>
          <span>${escapeHtml(candidate.name)}</span>
        </div>
        <span>${candidate.votes} votes (${percentage}%)</span>
      </div>
      <div class="progress-track">
        <div class="progress-bar ${isLeader ? "leader" : ""}" style="width: ${percentage}%;"></div>
      </div>
    `;
    resultsList.appendChild(row);
  });
}

// --- Cast Vote Action ---
submitVoteBtn.addEventListener("click", () => {
  if (hasUserVoted() || !pollData.isOpen || !selectedCandidateId) return;

  const candidate = pollData.candidates.find(c => c.id === selectedCandidateId);
  if (!candidate) return;

  // Increment tally without storing user details
  candidate.votes += 1;
  savePollData();
  markUserVoted();
  selectedCandidateId = null;

  renderVotingBooth();
  renderResults();
  showToast("Your anonymous vote has been recorded successfully!");
});

// --- Export Results to CSV ---
exportCsvBtn.addEventListener("click", () => {
  const { totalVotes } = calculateTotals();
  let csv = `Election Title,${pollData.title}\n`;
  csv += `Status,${pollData.isOpen ? "Active" : "Closed"}\n`;
  csv += `Total Ballots Cast,${totalVotes}\n\n`;
  csv += `ID,Candidate Name,Symbol,Bio,Votes,Percentage\n`;

  pollData.candidates.forEach(c => {
    const percent = totalVotes > 0 ? ((c.votes / totalVotes) * 100).toFixed(2) : 0;
    csv += `"${c.id}","${c.name}","${c.symbol}","${c.bio}",${c.votes},"${percent}%"\n`;
  });

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `election_results_${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  showToast("CSV report generated and downloaded.");
});

// --- Admin Authentication Modal ---
openAdminModalBtn.addEventListener("click", () => {
  loginErrorMsg.textContent = "";
  adminPassword.value = "";
  adminLoginModal.classList.remove("hidden");
  adminPassword.focus();
});

closeLoginModalBtn.addEventListener("click", () => adminLoginModal.classList.add("hidden"));
cancelLoginBtn.addEventListener("click", () => adminLoginModal.classList.add("hidden"));

adminLoginForm.addEventListener("submit", e => {
  e.preventDefault();
  if (adminPassword.value.trim() === ADMIN_PASSCODE) {
    adminLoginModal.classList.add("hidden");
    openAdminDashboard();
  } else {
    loginErrorMsg.textContent = "Incorrect passcode. Please try again.";
  }
});

// --- Admin Dashboard Logic ---
function openAdminDashboard() {
  editTitleInput.value = pollData.title;
  editDescInput.value = pollData.description;
  updateTogglePollButton();
  renderAdminCandidatesTable();
  adminPanelModal.classList.remove("hidden");
}

function updateTogglePollButton() {
  if (pollData.isOpen) {
    togglePollStatusLabel.textContent = "Close Polling";
    togglePollStatusBtn.className = "btn btn-outline";
  } else {
    togglePollStatusLabel.textContent = "Re-Open Polling";
    togglePollStatusBtn.className = "btn btn-primary";
  }
}

togglePollStatusBtn.addEventListener("click", () => {
  pollData.isOpen = !pollData.isOpen;
  savePollData();
  updateTogglePollButton();
  renderVotingBooth();
  renderResults();
  showToast(pollData.isOpen ? "Poll reopened!" : "Poll closed!");
});

saveGeneralSettingsBtn.addEventListener("click", () => {
  const newTitle = editTitleInput.value.trim();
  const newDesc = editDescInput.value.trim();
  if (!newTitle) {
    showToast("Title cannot be empty.");
    return;
  }
  pollData.title = newTitle;
  pollData.description = newDesc;
  savePollData();
  renderVotingBooth();
  showToast("Election settings updated.");
});

// Render Candidates in Admin Table
function renderAdminCandidatesTable() {
  adminCandidateTableBody.innerHTML = "";
  pollData.candidates.forEach(cand => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${cand.symbol}</td>
      <td><strong>${escapeHtml(cand.name)}</strong></td>
      <td>${escapeHtml(cand.bio)}</td>
      <td><span class="badge">${cand.votes}</span></td>
      <td>
        <button class="btn btn-danger btn-sm" onclick="deleteCandidate('${cand.id}')">
          <i class="fa-solid fa-trash"></i>
        </button>
      </td>
    `;
    adminCandidateTableBody.appendChild(tr);
  });
}

// Add New Candidate
addCandidateForm.addEventListener("submit", e => {
  e.preventDefault();
  const name = document.getElementById("newCandName").value.trim();
  const bio = document.getElementById("newCandBio").value.trim();
  const symbol = document.getElementById("newCandSymbol").value.trim() || "🗳️";

  if (!name || !bio) return;

  const newCand = {
    id: "cand_" + Date.now(),
    name,
    bio,
    symbol,
    votes: 0
  };

  pollData.candidates.push(newCand);
  savePollData();
  renderAdminCandidatesTable();
  renderVotingBooth();
  renderResults();
  addCandidateForm.reset();
  showToast("Candidate added successfully.");
});

// Delete Candidate (exposed to window for onclick)
window.deleteCandidate = function(candidateId) {
  if (pollData.candidates.length <= 2) {
    alert("You must have at least two candidates in a poll.");
    return;
  }
  if (!confirm("Are you sure you want to remove this candidate?")) return;

  pollData.candidates = pollData.candidates.filter(c => c.id !== candidateId);
  savePollData();
  renderAdminCandidatesTable();
  renderVotingBooth();
  renderResults();
  showToast("Candidate removed.");
};

// Reset Local Device Voter Lock
resetMyVoteStatusBtn.addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEYS.HAS_VOTED);
  renderVotingBooth();
  showToast("This browser device can now vote again.");
});

// Zero All Votes
resetAllVotesBtn.addEventListener("click", () => {
  if (!confirm("Are you certain you want to zero all accumulated votes?")) return;
  pollData.candidates.forEach(c => (c.votes = 0));
  savePollData();
  renderAdminCandidatesTable();
  renderVotingBooth();
  renderResults();
  showToast("All vote counts have been reset to 0.");
});

closeAdminPanelBtn.addEventListener("click", () => adminPanelModal.classList.add("hidden"));
exitAdminBtn.addEventListener("click", () => adminPanelModal.classList.add("hidden"));

// Utility to avoid XSS
function escapeHtml(str) {
  return (str || "").replace(/[&<>"']/g, m => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[m]));
}

// --- Initial Render On Load ---
renderVotingBooth();
renderResults();