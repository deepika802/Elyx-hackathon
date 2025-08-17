const socket = io();
// Profile handling 
const profileForm = document.getElementById("profileForm");
const userDisplay = document.querySelector(".user");
async function loadProfile() {
  const res = await fetch("/profile");
  const profile = await res.json();
  if (profile.name) {
    profileForm.name.value = profile.name;
    profileForm.age.value = profile.age || "";
    profileForm.disease.value = profile.disease || "";
    profileForm.goals.value = profile.goals || "";
    profileForm.commitments.value = profile.commitments || "";
    userDisplay.textContent = `${profile.name} — Age ${profile.age}`;
  }
}
loadProfile();
profileForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = {
    name: profileForm.name.value,
    age: profileForm.age.value,
    disease: profileForm.disease.value,
    goals: profileForm.goals.value,
    commitments: profileForm.commitments.value,
  };
  await fetch("/profile", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  userDisplay.textContent = `${data.name} — Age ${data.age}`;
});
// Chat handling 
const chatButton = document.getElementById("chat-button");
const chatBox = document.getElementById("chat-box");
const messagesDiv = document.getElementById("messages");
const chatForm = document.getElementById("chat-form");
const messageInput = document.getElementById("message-input");
chatBox.style.display = "none";
chatButton.addEventListener("click", () => { chatBox.style.display = chatBox.style.display === "none" ? "flex" : "none"; loadMessages(); });
async function loadMessages() {
  const res = await fetch("/messages"); const msgs = await res.json();
  messagesDiv.innerHTML = "";
  msgs.forEach(addMessage);
}
function addMessage(msg) {
  const div = document.createElement("div");
  div.className = msg.sender === "User" ? "msg me" : "msg bot";
  div.innerHTML = `<strong>${msg.sender}</strong>: ${msg.content} <small>${new Date(msg.created_at).toLocaleTimeString()}</small>`;
  messagesDiv.appendChild(div); messagesDiv.scrollTop = messagesDiv.scrollHeight;
}
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault(); const content = messageInput.value.trim();
  if (!content) return; const res = await fetch("/send", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sender: "User", content })
  });

  const newMsg = await res.json(); addMessage(newMsg); messageInput.value = "";
});
socket.on("message", (msg) => addMessage(msg));

// === LOAD PROGRESS & VISUALIZATION ===
async function loadProgress() {
  const res = await fetch("/progress");
  const data = await res.json();

  const labels = data.map(d => d.date);
  const scores = data.filter(d => d.metric === "healthScore").map(d => d.value);

  const ctx = document.getElementById("trendChart").getContext("2d");
  new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Health Score",
          data: scores,
          borderColor: "blue",
          fill: false
        }
      ]
    }
  });
}
loadProgress();

// === LOAD DECISIONS ===
async function loadDecisions() {
  const res = await fetch("/decisions");
  const data = await res.json();
  const list = document.getElementById("decisionsList");
  list.innerHTML = "";
  data.forEach(d => {
    const li = document.createElement("li");
    li.textContent = `${d.decision_type}: ${d.description} (Reason: ${d.reason})`;
    list.appendChild(li);
  });
}
loadDecisions();

// === LOAD INTERNAL METRICS ===
async function loadMetrics() {
  const res = await fetch("/metrics");
  const data = await res.json();
  const labsList = document.getElementById("labsList");
  labsList.innerHTML = "";
  data.forEach(m => {
    const li = document.createElement("li");
    li.textContent = `${m.metric_type}: ${m.hours} hrs (${m.date})`;
    labsList.appendChild(li);
  });
}
loadMetrics();

// === LOAD PERSONA ===
async function loadPersona() {
  const res = await fetch("/persona");
  const persona = await res.json();
  if (persona.analysis) {
    const div = document.createElement("div");
    div.className = "persona-box";
    div.innerHTML = `<h3>Persona Analysis</h3><p>${persona.analysis}</p>`;
    document.querySelector(".main").appendChild(div);
  }
}
loadPersona();
