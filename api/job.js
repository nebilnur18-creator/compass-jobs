module.exports = async (req, res) => {
  const { id } = req.query;
  const WEBSITE_URL = "https://compass-jobs.vercel.app";
  const DEFAULT_LOGO = `${WEBSITE_URL}/logo.png`;
  const JOBS_URL = `https://raw.githubusercontent.com/nebilnur18-creator/compass-jobs/main/jobs.json?t=${Date.now()}`;

  function escapeHtml(str) {
    return String(str || "").replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
  }

  function renderPage({ title, desc, image, applyUrl, company }) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(desc)}">
<meta property="og:image" content="${image}">
<meta name="twitter:card" content="summary_large_image">
<meta http-equiv="refresh" content="1;url=${escapeHtml(applyUrl)}">
<title>${escapeHtml(title)}</title>
<style>
body{font-family:-apple-system,sans-serif;background:#0b0b0d;color:#f2f2f4;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center;padding:20px}
a{color:#d21f2f;font-weight:700}
</style>
</head>
<body>
<div>
<p>Redirecting to ${escapeHtml(company)}'s application page…</p>
<p><a href="${escapeHtml(applyUrl)}">Click here if not redirected</a></p>
</div>
</body>
</html>`;
  }

  try {
    const dataRes = await fetch(JOBS_URL);
    const data = await dataRes.json();
    const job = (data.jobs || []).find((j) => j.id === id);

    if (!job) {
      res.setHeader("Content-Type", "text/html");
      res.status(404).send(renderPage({
        title: "Job not found — Compass Jobs",
        desc: "This job may have expired or been removed.",
        image: DEFAULT_LOGO,
        applyUrl: WEBSITE_URL,
        company: "Compass Jobs",
      }));
      return;
    }

    let applyUrl = WEBSITE_URL;
    if (job.link) {
      applyUrl = job.link;
    } else if (job.contact) {
      applyUrl = job.contact.includes("@")
        ? `mailto:${job.contact}`
        : `tel:${job.contact}`;
    }

    const image = job.image || DEFAULT_LOGO;
    const position = (job.positions || [])[0] || "Job Vacancy";

    res.setHeader("Content-Type", "text/html");
    res.status(200).send(renderPage({
      title: `${job.company} — ${position}`,
      desc: `${job.company} is hiring for ${position}. Deadline: ${job.deadline || "see post"}. Apply now via Compass Jobs.`,
      image,
      applyUrl,
      company: job.company,
    }));
  } catch (e) {
    res.setHeader("Content-Type", "text/html");
    res.status(500).send(renderPage({
      title: "Compass Jobs",
      desc: "Something went wrong loading this job.",
      image: DEFAULT_LOGO,
      applyUrl: WEBSITE_URL,
      company: "Compass Jobs",
    }));
  }
};
