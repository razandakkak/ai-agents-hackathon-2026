const fs = require("fs/promises");
const path = require("path");

const signupsPath = path.join(__dirname, "..", "data", "volunteerSignups.json");

async function readSignups() {
  try {
    const content = await fs.readFile(signupsPath, "utf8");
    return JSON.parse(content);
  } catch (error) {
    if (error.code === "ENOENT") {
      return [];
    }

    throw error;
  }
}

async function writeSignups(signups) {
  await fs.writeFile(signupsPath, JSON.stringify(signups, null, 2));
}

function validateSignup(payload) {
  const name = String(payload.name || "").trim();
  const bloodType = String(payload.bloodType || "").trim();
  const city = String(payload.city || "").trim();
  const contact = String(payload.contact || "").trim();
  const contactPreference = String(payload.contactPreference || "").trim();
  const availability = String(payload.availability || "").trim();

  if (!name || !bloodType || !city || !contact) {
    const error = new Error("Missing required volunteer signup fields");
    error.status = 400;
    throw error;
  }

  return {
    id: `vol-${Date.now()}`,
    name,
    bloodType,
    city,
    contact,
    contactPreference: contactPreference || "phone",
    availability: availability || "Not specified",
    createdAt: new Date().toISOString()
  };
}

async function addVolunteerSignup(payload) {
  const signup = validateSignup(payload);
  const signups = await readSignups();
  signups.push(signup);
  await writeSignups(signups);
  return signup;
}

module.exports = {
  addVolunteerSignup,
  readSignups
};
