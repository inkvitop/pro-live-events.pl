const { execSync } = require("child_process");

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

const message = `${date} — prebuild`;

console.log("📌 Pre-build commit message:", message);

try {
  const status = execSync("git status --porcelain").toString().trim();

  if (!status) {
    console.log("ℹ️  Нет изменений — пропускаем предсборочный коммит.");
    process.exit(0);
  }

  execSync("git add .", { stdio: "inherit" });
  execSync(`git commit -m "${message}"`, { stdio: "inherit" });
  execSync("git push", { stdio: "inherit" });

  console.log("✔️ Dev version saved before build");
} catch (err) {
  console.error("❌ Ошибка git в prebuild:", err.message || err);
  process.exit(1);
}
