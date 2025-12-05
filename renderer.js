const portInput = document.getElementById("portInput");
const scanBtn = document.getElementById("scanBtn");
const scanAllBtn = document.getElementById("scanAllBtn");
const result = document.getElementById("result");
const statsDiv = document.getElementById("stats");

let allPorts = [];

scanBtn.onclick = async () => {
  console.log('[renderer] Scan button clicked');
  const port = portInput.value.trim();

  if (!port) {
    showError("Please enter a port number");
    return;
  }

  console.log('[renderer] Scanning port:', port);
  showLoading();

  const data = await window.portAPI.findPort(port);
  console.log('[renderer] findPort result:', data);

  if (!data) {
    showEmpty(`No process found on port ${port}`);
    return;
  }

  allPorts = [{ port, ...data }];
  displayPorts();
};

scanAllBtn.onclick = async () => {
  console.log('[renderer] Scan All button clicked');
  showLoading("Scanning all active ports...");
  
  const ports = await window.portAPI.findAllPorts();
  console.log('[renderer] findAllPorts result:', ports);
  console.log('[renderer] Number of ports found:', ports ? ports.length : 0);
  
  if (!ports || ports.length === 0) {
    showEmpty("No active ports found");
    return;
  }

  allPorts = ports;
  console.log('[renderer] Displaying ports:', allPorts);
  displayPorts();
};

function showLoading(message = "Scanning...") {
  console.log('[renderer] showLoading:', message);
  statsDiv.style.display = "none";
  result.innerHTML = `
    <div class="loading">
      <div class="spinner"></div>
      <p>${message}</p>
    </div>
  `;
}

function showEmpty(message) {
  console.log('[renderer] showEmpty:', message);
  statsDiv.style.display = "none";
  result.innerHTML = `
    <div class="empty-state">
      <p>${message}</p>
    </div>
  `;
}

function showError(message) {
  console.log('[renderer] showError:', message);
  statsDiv.style.display = "none";
  result.innerHTML = `
    <div class="error-message">
      ${message}
    </div>
  `;
}

function displayPorts() {
  console.log('[renderer] displayPorts called with:', allPorts);
  
  if (allPorts.length === 0) {
    showEmpty("No ports to display");
    return;
  }

  // Show stats
  statsDiv.style.display = "flex";
  statsDiv.innerHTML = `
    <div class="stat-card">
      <div class="stat-number">${allPorts.length}</div>
      <div class="stat-label">Active Ports</div>
    </div>
  `;

  // Display port cards
  result.innerHTML = allPorts
    .map(
      (item) => `
    <div class="port-card" id="card-${item.port}">
      <div class="port-header">
        <div class="port-number">Port ${item.port}</div>
      </div>
      <div class="port-info">
        <div class="info-item">
          <div class="info-label">Process ID</div>
          <div class="info-value">${item.pid}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Process Name</div>
          <div class="info-value">${item.process}</div>
        </div>
        ${item.user ? `
        <div class="info-item">
          <div class="info-label">User</div>
          <div class="info-value">${item.user}</div>
        </div>
        ` : ''}
      </div>
      <button class="kill-btn" onclick="killPort('${item.port}', '${item.pid}')">
        Kill Process
      </button>
    </div>
  `
    )
    .join("");
    
  console.log('[renderer] Ports displayed successfully');
}

async function killPort(port, pid) {
  console.log('[renderer] killPort called:', { port, pid });
  const btn = event.target;
  btn.disabled = true;
  btn.textContent = "Killing...";

  const success = await window.portAPI.killPort(pid);
  console.log('[renderer] killPort result:', success);

  if (success) {
    const card = document.getElementById(`card-${port}`);
    card.style.transition = "all 0.5s";
    card.style.opacity = "0";
    card.style.transform = "scale(0.8)";

    setTimeout(() => {
      allPorts = allPorts.filter((p) => p.port !== port);
      displayPorts();
      
      if (allPorts.length === 0) {
        showEmpty("All processes have been killed");
      }
    }, 500);
  } else {
    btn.disabled = false;
    btn.textContent = "Failed - Try Again";
    setTimeout(() => {
      btn.textContent = "Kill Process";
    }, 2000);
  }
}

// Allow Enter key to scan
portInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    scanBtn.click();
  }
});

console.log('[renderer] Script loaded successfully');
