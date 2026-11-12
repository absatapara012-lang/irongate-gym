const API_URL = "";

async function loadMembers() {
  const listBox = document.getElementById("memberList");

  try {
    const response = await fetch(`${API_URL}/members`);

    if (!response.ok) {
      throw new Error("Unable to fetch members");
    }

    const members = await response.json();

    if (!Array.isArray(members) || members.length === 0) {
      listBox.innerHTML = `<p style="color:#94a3b8;">No members registered yet. Add your first member above!</p>`;
      return;
    }

    listBox.innerHTML = "";

    members.forEach((member) => {
      const name = member.member_name;
      const plan = member.plan;
      const days = member.days_remaining;

      listBox.innerHTML += `
        <div class="member-item">
          <div class="member-info">
            <strong>${name}</strong>
            <span>Plan: ${plan} • Days Left: <b>${days}</b></span>
          </div>
          <div class="member-actions">
            <button class="gate-btn" onclick="checkGate('${member.member_name}', ${member.days_remaining})">
              Test Gate Pass
            </button>
            <button class="renew-btn" onclick="renewMember(${member.id}, ${member.days_remaining})">
              +30d Renew
            </button>
            <button class="delete-btn" onclick="deleteMember(${member.id})">
              Remove
            </button>
          </div>
        </div>
      `;
    });
  } catch (err) {
    listBox.innerHTML = `<p style="color:#f87171;">Cannot reach Referee! Make sure node server.js is running on Port 3000.</p>`;
  }
}

async function addMember() {
  const name = document.getElementById("nameInput").value.trim();
  const plan = document.getElementById("planInput").value;
  const days = document.getElementById("daysInput").value;

  if (!name || days === "") {
    alert("Please enter a member name and days remaining!");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/add-member`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        member_name: name,
        plan: plan,
        days_remaining: Number(days)
      })
    });

    const result = await response.json();

    if (!response.ok) {
      alert(result.error || "Failed to register member.");
      return;
    }

    document.getElementById("nameInput").value = "";
    document.getElementById("daysInput").value = "";
    loadMembers();
  } catch (error) {
    alert(error.message || "Unable to add member.");
  }
}

async function renewMember(id, currentDays) {
  try {
    const response = await fetch(`${API_URL}/renew/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ current_days: currentDays })
    });

    const result = await response.json();

    if (!response.ok) {
      alert(result.error || "Renewal failed.");
      return;
    }

    loadMembers();
  } catch (error) {
    alert(error.message || "Unable to renew membership.");
  }
}

async function deleteMember(id) {
  try {
    const response = await fetch(`${API_URL}/delete-member/${id}`, {
      method: "DELETE"
    });

    const result = await response.json();

    if (!response.ok) {
      alert(result.error || "Delete failed.");
      return;
    }

    loadMembers();
  } catch (error) {
    alert(error.message || "Unable to delete member.");
  }
}

async function checkGate(memberName, daysRemaining) {
  const response = await fetch(`${API_URL}/check-in`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      member_name: memberName,
      days_remaining: Number(daysRemaining)
    })
  });

  const result = await response.json();
  const banner = document.getElementById("gateBanner");

  banner.classList.remove("hidden", "gate-open", "gate-locked");
  banner.classList.add(result.allowed ? "gate-open" : "gate-locked");
  banner.textContent = result.message;
}

loadMembers();