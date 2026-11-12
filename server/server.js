require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../client")));

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

app.get("/members", async (req, res) => {
  const { data, error } = await supabase
    .from("members")
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    console.error("Supabase GET Error:", error.message);
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

app.post("/add-member", async (req, res) => {
  const { member_name, plan, days_remaining } = req.body;

  const { data, error } = await supabase
    .from("members")
    .insert([{ member_name, plan, days_remaining: Number(days_remaining) }])
    .select();

  if (error) {
    console.error("Supabase INSERT Error:", error.message);
    return res.status(400).json({ error: error.message });
  }

  res.json({ message: "Member registered!", member: data[0] });
});

app.post("/check-in", (req, res) => {
  const { member_name, days_remaining } = req.body;

  if (Number(days_remaining) > 0) {
    return res.json({
      allowed: true,
      message: "OPEN GATE — Welcome to IronGate, " + member_name + "! (" + days_remaining + " days left)"
    });
  }

  return res.json({
    allowed: false,
    message: "LOCKED — " + member_name + "'s membership has expired! Please renew at reception."
  });
});

app.put("/renew/:id", async (req, res) => {
  const { id } = req.params;
  const { current_days } = req.body;
  const newDays = Number(current_days) + 30;

  const { data, error } = await supabase
    .from("members")
    .update({ days_remaining: newDays })
    .eq("id", id)
    .select();

  if (error) {
    console.error("Supabase PUT Error:", error.message);
    return res.status(400).json({ error: error.message });
  }

  res.json({ message: "Membership renewed!", member: data[0] });
});

app.delete("/delete-member/:id", async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase
    .from("members")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Supabase DELETE Error:", error.message);
    return res.status(400).json({ error: error.message });
  }

  res.json({ message: "Member removed!" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`IronGate Referee is awake at http://localhost:${PORT}`);
});