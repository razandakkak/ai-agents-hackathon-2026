function logSource(stage, payload) {
  console.info(`[live-sources] ${stage}`, JSON.stringify(payload));
}

function formatError(error) {
  return {
    message: error && error.message ? error.message : "Unknown error",
    code: error && error.code ? error.code : null,
    cause: error && error.cause && error.cause.message ? error.cause.message : null
  };
}

async function fetchText(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "PeopleInNeedHackathon/1.0"
      },
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status}`);
    }

    return response.text();
  } finally {
    clearTimeout(timeout);
  }
}

function extractFirstMatch(text, pattern) {
  const match = text.match(pattern);
  return match ? match[1].trim() : null;
}

async function fetchLebaneseRedCrossSnapshot() {
  const url = "https://www.redcross.org.lb/";
  const contactUrl = "https://www.redcross.org.lb/get-in-touch/";

  try {
    logSource("fetch-start", { source: "redcross", url, contactUrl });
    const [homeHtml, contactHtml] = await Promise.all([fetchText(url), fetchText(contactUrl)]);

    const bloodUnitsDelivered = extractFirstMatch(homeHtml, /([\d,]+)\s*Blood units delivered/i);
    const hotline = extractFirstMatch(contactHtml, /LRC hotline number[\s\S]*?\n\s*(\d{3,6})/i);
    const emergency = extractFirstMatch(contactHtml, /For Emergencies[\s\S]*?Call\s*(\d{3,6})/i);
    const headquartersPhone = extractFirstMatch(contactHtml, /(\+961\s*1\s*372802-\s*3-\s*4-\s*5)/i);
    const infoEmail = extractFirstMatch(contactHtml, /([a-z0-9._%+-]+@redcross\.org\.lb)/i);

    const result = {
      source: "Lebanese Red Cross",
      url,
      contactUrl,
      fetched: true,
      stats: {
        bloodUnitsDelivered
      },
      contacts: {
        hotline,
        emergency,
        headquartersPhone,
        infoEmail
      }
    };

    logSource("fetch-success", { source: "redcross", fetched: true, stats: result.stats, contacts: result.contacts });
    return result;
  } catch (error) {
    const details = formatError(error);
    logSource("fetch-failed", { source: "redcross", ...details });
    return {
      source: "Lebanese Red Cross",
      url,
      contactUrl,
      fetched: false,
      error: details.message,
      errorCode: details.code,
      errorCause: details.cause
    };
  }
}

async function fetchAubmcSnapshot() {
  const url = "https://aubmc.org.lb/aboutus/visiting/Pages/visiting.aspx";

  try {
    logSource("fetch-start", { source: "aubmc", url });
    const html = await fetchText(url);

    const mainPhone = extractFirstMatch(html, /Telephone:\s*(\+961-1-350000)/i);
    const email = extractFirstMatch(html, /Email:\s*([^<\s]+@aub\.edu\.lb)/i);
    const bloodBankPhone = extractFirstMatch(html, /For further information and guidance, please call\s*([^<\n]+)/i);
    const bloodBankRoom = extractFirstMatch(html, /Blood Bank is located on the\s*([^.<]+)/i);

    const result = {
      source: "AUBMC",
      url,
      fetched: true,
      contacts: {
        mainPhone,
        email,
        bloodBankPhone,
        bloodBankRoom
      }
    };

    logSource("fetch-success", { source: "aubmc", fetched: true, contacts: result.contacts });
    return result;
  } catch (error) {
    const details = formatError(error);
    logSource("fetch-failed", { source: "aubmc", ...details });
    return {
      source: "AUBMC",
      url,
      fetched: false,
      error: details.message,
      errorCode: details.code,
      errorCause: details.cause
    };
  }
}

async function fetchSaintGeorgeSnapshot() {
  const url = "https://www.stgeorgehospital.org/contact";

  try {
    logSource("fetch-start", { source: "saint-george", url });
    const html = await fetchText(url);

    const shortCode = extractFirstMatch(html, /call us on our abbreviated 4 digits number\s*(\d{4})/i);
    const mainPhone = extractFirstMatch(html, /OUTSIDE Lebanon, call us on\s*(\+961\s*1\s*441\s*000)/i);
    const secondaryPhone = extractFirstMatch(html, /or\s*(\+961\s*1\s*575\s*700)/i);
    const patientRelationsPhone = extractFirstMatch(html, /Patient Relations department on:\s*(\+961\s*70\s*536\s*090)/i);
    const patientRelationsEmail = extractFirstMatch(html, /-\s*([A-Z0-9._%+-]+@stgeorgehospital\.org)/i);

    const result = {
      source: "Saint George Hospital University Medical Center",
      url,
      fetched: true,
      contacts: {
        shortCode,
        mainPhone,
        secondaryPhone,
        patientRelationsPhone,
        patientRelationsEmail
      }
    };

    logSource("fetch-success", { source: "saint-george", fetched: true, contacts: result.contacts });
    return result;
  } catch (error) {
    const details = formatError(error);
    logSource("fetch-failed", { source: "saint-george", ...details });
    return {
      source: "Saint George Hospital University Medical Center",
      url,
      fetched: false,
      error: details.message,
      errorCode: details.code,
      errorCause: details.cause
    };
  }
}

async function fetchOfficialSourceContext() {
  const [redCross, aubmc] = await Promise.all([
    fetchLebaneseRedCrossSnapshot(),
    fetchAubmcSnapshot()
  ]);

  const saintGeorge = await fetchSaintGeorgeSnapshot();

  return {
    fetchedAt: new Date().toISOString(),
    redCross,
    aubmc,
    saintGeorge
  };
}

module.exports = {
  fetchOfficialSourceContext
};
