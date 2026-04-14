const scenarioInput = document.getElementById("scenarioInput");
const analyzeBtn = document.getElementById("analyzeBtn");
const formatBtn = document.getElementById("formatBtn");
const clearBtn = document.getElementById("clearBtn");
const jsonOutput = document.getElementById("jsonOutput");
const structuredOutput = document.getElementById("structuredOutput");
const statusDot = document.getElementById("statusDot");
const statusTitle = document.getElementById("statusTitle");
const statusText = document.getElementById("statusText");

let lastResponse = null;

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderList(items) {
  if (!items || !items.length) {
    return '<div class="muted">None</div>';
  }
  return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function renderCitations(citations) {
  if (!citations || !citations.length) {
    return '<div class="muted">No citations returned.</div>';
  }

  return `<ul>${citations
    .map(
      (citation) => `
        <li>
          <strong>${escapeHtml(citation.file_name)}</strong><br />
          ${escapeHtml(citation.title)}<br />
          <span class="muted">${escapeHtml(citation.date)} | ${escapeHtml(citation.chunk_id)}</span><br />
          ${escapeHtml(citation.excerpt)}
        </li>
      `,
    )
    .join("")}</ul>`;
}

function renderStructuredResponse(data) {
  structuredOutput.innerHTML = `
    <div class="response-block">
      <strong>Summary</strong>
      <div>${escapeHtml(data.summary || "")}</div>
    </div>
    <div class="response-block">
      <strong>Legal Basis</strong>
      ${renderList(data.legal_basis)}
    </div>
    <div class="response-block">
      <strong>Citations</strong>
      ${renderCitations(data.citations)}
    </div>
    <div class="response-block">
      <strong>Confidence</strong>
      <div>${escapeHtml(data.confidence || "")}</div>
    </div>
    <div class="response-block">
      <strong>Uncertainty</strong>
      <div>${escapeHtml(data.uncertainty || "")}</div>
    </div>
    <div class="response-block">
      <strong>Next Steps</strong>
      ${renderList(data.next_steps)}
    </div>
    <div class="response-block">
      <strong>Disclaimer</strong>
      <div>${escapeHtml(data.disclaimer || "")}</div>
    </div>
  `;
}

function renderJson(data) {
  jsonOutput.textContent = JSON.stringify(data, null, 2);
}

function setStatus(ok, title, message) {
  statusDot.classList.toggle("ok", ok);
  statusTitle.innerHTML = `<strong>${escapeHtml(title)}</strong>`;
  statusText.textContent = message;
}

async function checkHealth() {
  try {
    const response = await fetch("/health");
    const data = await response.json();

    if (data.agent_ready) {
      setStatus(true, "API ready", "The agent initialized successfully.");
    } else {
      setStatus(false, "API degraded", data.startup_error || "The agent did not initialize.");
    }
  } catch (error) {
    setStatus(false, "API unreachable", "Could not contact /health.");
  }
}

async function analyzeScenario() {
  const scenario = scenarioInput.value.trim();
  if (!scenario) {
    setStatus(false, "Missing scenario", "Enter a legal scenario before sending the request.");
    return;
  }

  analyzeBtn.disabled = true;
  analyzeBtn.textContent = "Analyzing...";
  jsonOutput.textContent = "Waiting for response...";
  structuredOutput.innerHTML = '<div class="muted">Waiting for response...</div>';

  try {
    const response = await fetch("/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scenario }),
    });

    const data = await response.json();
    lastResponse = data;

    if (!response.ok) {
      renderJson(data);
      structuredOutput.innerHTML = `<div class="error">${escapeHtml(data.detail || "Request failed.")}</div>`;
      setStatus(false, `Request failed (${response.status})`, data.detail || "The API returned an error.");
      return;
    }

    renderStructuredResponse(data);
    renderJson(data);
    setStatus(true, "Analysis complete", "The API returned a grounded legal response.");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    structuredOutput.innerHTML = `<div class="error">${escapeHtml(message)}</div>`;
    jsonOutput.textContent = message;
    setStatus(false, "Network error", message);
  } finally {
    analyzeBtn.disabled = false;
    analyzeBtn.textContent = "Analyze Scenario";
  }
}

analyzeBtn.addEventListener("click", analyzeScenario);

formatBtn.addEventListener("click", () => {
  if (lastResponse) {
    renderJson(lastResponse);
  }
});

clearBtn.addEventListener("click", () => {
  scenarioInput.value = "";
  lastResponse = null;
  structuredOutput.innerHTML = '<div class="muted">No response yet.</div>';
  jsonOutput.textContent = "No response yet.";
});

document.querySelectorAll("[data-sample]").forEach((button) => {
  button.addEventListener("click", () => {
    scenarioInput.value = button.dataset.sample || "";
    scenarioInput.focus();
  });
});

checkHealth();
