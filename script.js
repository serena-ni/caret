const output = document.getElementById("output");
const input = document.getElementById("command");

const SAVE_KEY = "caret-save";

let pet = {
  name: "caret",
  hunger: 20,
  energy: 80,
  happiness: 60,
  lastSeen: Date.now()
};

const faces = {
  happy: "(=^･ω･^=)",
  sleepy: "( - ω - ) zzz",
  grumpy: "( •̀ ω •́ )",
  neutral: "( o ω o )"
};

/* persistence */

function save() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(pet));
}

function load() {
  const data = localStorage.getItem(SAVE_KEY);
  if (!data) return false;

  pet = JSON.parse(data);

  const minutes = Math.floor((Date.now() - pet.lastSeen) / 60000);
  pet.hunger = Math.min(100, pet.hunger + minutes * 2);
  pet.energy = Math.max(0, pet.energy - minutes);
  pet.happiness = Math.max(0, pet.happiness - Math.floor(minutes / 2));

  return true;
}

/* helpers */

function getFace() {
  if (pet.energy < 25) return faces.sleepy;
  if (pet.hunger > 75) return faces.grumpy;
  if (pet.happiness > 70) return faces.happy;
  return faces.neutral;
}

function print(text, className = "") {
  const line = document.createElement("div");
  line.className = `line ${className}`;
  output.appendChild(line);

  let i = 0;
  const interval = setInterval(() => {
    line.textContent += text[i];
    i++;
    output.scrollTop = output.scrollHeight;
    if (i >= text.length) clearInterval(interval);
  }, 15);
}

/* commands */

function help() {
  print(
`commands:
- status
- feed
- play
- sleep
- pet
- rename <name>
- clear`,
    "system"
  );
}

function status() {
  print(
`${getFace()}
hunger: ${pet.hunger}
energy: ${pet.energy}
happiness: ${pet.happiness}`,
    "pet"
  );
}

/* idle decay */

function tick() {
  pet.hunger = Math.min(100, pet.hunger + 2);
  pet.energy = Math.max(0, pet.energy - 1);
  pet.happiness = Math.max(0, pet.happiness - 1);

  if (Math.random() < 0.15) {
    print(`${getFace()} the cursor blinks.`, "pet");
  }

  save();
}

setInterval(tick, 60000);

/* boot */

const restored = load();

print(`booting caret...
type "help" to begin.`, "system");

if (restored) {
  print(`${getFace()} you came back.`, "pet");
} else {
  print(`${getFace()} i am waiting.`, "pet");
}

save();

/* input */

const greetings = [
  "hi", "hello", "hey", "heyo", "hiya", "yo", "sup"
];

const greetingResponses = [
  "…hello.",
  "hi.",
  "you’re here.",
  "i noticed.",
  "hello again."
];

input.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;

  const raw = input.value.trim();
  const lower = raw.toLowerCase();
  const args = lower.split(" ");
  const command = args[0];

  print(`> ${raw}`, "system");
  input.value = "";

  /* natural language greetings */

  if (
    greetings.includes(command) ||
    greetings.some(g => lower === g + "!" || lower === g + "." || lower === g + "…")
  ) {
    pet.happiness = Math.min(100, pet.happiness + 3);
    const response =
      greetingResponses[Math.floor(Math.random() * greetingResponses.length)];
    print(`${getFace()} ${response}`, "pet");
    pet.lastSeen = Date.now();
    save();
    return;
  }

  /* commands */

  switch (command) {
    case "help":
      help();
      break;

    case "status":
      status();
      break;

    case "feed":
      pet.hunger = Math.max(0, pet.hunger - 30);
      pet.happiness = Math.min(100, pet.happiness + 10);
      print(`${getFace()} accepted.`, "pet");
      break;

    case "play":
      if (pet.energy < 20) {
        print(`${getFace()} not now.`, "pet");
      } else {
        pet.energy -= 20;
        pet.happiness = Math.min(100, pet.happiness + 25);
        print(`${getFace()} that was… nice.`, "pet");
      }
      break;

    case "sleep":
      pet.energy = Math.min(100, pet.energy + 40);
      pet.hunger = Math.min(100, pet.hunger + 10);
      print(`${getFace()} …`, "pet");
      break;

    case "pet":
      pet.happiness = Math.min(100, pet.happiness + 5);
      print(`${getFace()} i noticed.`, "pet");
      break;

    case "rename":
      if (args[1]) {
        pet.name = args[1];
        print(`${getFace()} acknowledged.`, "pet");
      } else {
        print("rename requires a name.", "system");
      }
      break;

    case "clear":
      output.innerHTML = "";
      break;

    /* secret commands */

    case "sudo":
      print("permission denied.", "secret");
      break;

    case "uptime":
      print("caret has been running quietly.", "secret");
      break;

    case "whoami":
      print("a cursor between thoughts.", "secret");
      break;

    case "reset":
      localStorage.removeItem(SAVE_KEY);
      location.reload();
      break;

    default:
      print("unknown command.", "system");
  }

  pet.lastSeen = Date.now();
  save();
});
