const API_BASE = 'http://localhost:8000';

export async function analyzeScenario(scenario) {
    const res = await fetch(`${API_BASE}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'خطأ غير معروف' }));
        throw new Error(err.detail || `خطأ HTTP ${res.status}`);
    }
    return res.json();
}

export async function chatWithAssistant({ message, situation_summary, guidance_message, source_lines }) {
    const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, situation_summary, guidance_message, source_lines }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'خطأ غير معروف' }));
        throw new Error(err.detail || `خطأ HTTP ${res.status}`);
    }
    return res.json();
}

export async function checkHealth() {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
}
