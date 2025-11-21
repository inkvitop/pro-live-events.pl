const { execSync } = require("child_process");

const args = process.argv.slice(2);
const pad = (n) => (n < 10 ? "0" + n : n);
const now = new Date();
const date =
  now.getFullYear() +
  "-" +
  pad(now.getMonth() + 1) +
  "-" +
  pad(now.getDate()) +
  " " +
  pad(now.getHours()) +
  ":" +
  pad(now.getMinutes());

// Если аргументы есть → добавляем их к дате
const message = args.length > 0 ? `${date} — ${args.join(" ")}` : `${date} — auto`;

console.log("📌 Commit message:", message);

try {
  const status = execSync("git status --porcelain").toString().trim();
  if (!status) {
    console.log("ℹ️  Нет изменений для коммита.");
    process.exit(0);
  }

  execSync("git add .", { stdio: "inherit" });
  execSync(`git commit -m "${message}"`, { stdio: "inherit" });
  execSync("git push", { stdio: "inherit" });

  console.log("✔️  Saved to Git");
} catch (err) {
  console.error("❌ Ошибка git:", err.message || err);
  process.exit(1);
}
