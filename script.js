const output = document.getElementById("output");
const input = document.getElementById("command");

const SAVE_KEY = "caret-save";

// state

let pet = {
  name: "caret",

  hunger: 20,
  energy: 80,
  happiness: 60,

  level: 1,
  xp: 0,

  inventory: [],

  inGuessGame: false,
  guessNumber: null,

  lastSeen: Date.now(),
  startTime: Date.now()
};

const faces = {
  happy: "(=^･ω･^=)",
  sleepy: "( - ω - ) zzz",
  grumpy: "( •̀ ω •́ )",
  neutral: "( o ω o )"
};

// persistence

function applyDefaults() {
  pet.level ??= 1;
  pet.xp ??= 0;
  pet.inventory ??= [];
  pet.inGuessGame ??= false;
  pet.guessNumber ??= null;
}

function save() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(pet));
}

function load() {
  const data = localStorage.getItem(SAVE_KEY);
  if (!data) return false;

  pet = JSON.parse(data);
  applyDefaults();

  const minutes = Math.floor((Date.now() - pet.lastSeen) / 60000);
  pet.hunger += minutes * 2;
  pet.energy -= minutes;
  pet.happiness -= Math.floor(minutes / 2);

  clampStats();
  return true;
}

// helpers

function clampStats() {
  pet.hunger = Math.min(100, Math.max(0, pet.hunger));
  pet.energy = Math.min(100, Math.max(0, pet.energy));
  pet.happiness = Math.min(100, Math.max(0, pet.happiness));
}

function gainXp(amount) {
  pet.xp += amount;

  while (pet.xp >= pet.level * 50) {
    pet.xp -= pet.level * 50;
    pet.level++;
    print(`level up. (${pet.level})`, "system");

    // level-based item unlocks
    if (pet.level === 2) giveItem("ball");
    if (pet.level === 3) giveItem("key");
    if (pet.level === 4) giveItem("disk");
  }
}

function giveItem(item) {
  if (pet.inventory.includes(item)) return;
  pet.inventory.push(item);
  print(`obtained: ${item}`, "secret");
}

function hasItem(item) {
  return pet.inventory.includes(item);
}

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

// commands

function help() {
  let base = [
    "status",
    "feed",
    "play",
    "sleep",
    "pet",
    "guess",
    "rename <name>",
    "clear",
    "time",
    "about",
    "version",
    "inspire"
  ];

  if (pet.inventory.length > 0) base.push("inventory");
  if (hasItem("ball")) base.push("throw");
  if (hasItem("coin")) base.push("flip");
  if (hasItem("key")) base.push("unlock");
  if (hasItem("disk")) base.push("load");

  print("commands:\n- " + base.join("\n- "), "system");
}

function status() {
  print(
`${getFace()}
level: ${pet.level}
xp: ${pet.xp}
hunger: ${pet.hunger}
energy: ${pet.energy}
happiness: ${pet.happiness}`,
    "pet"
  );
}

// idle

function tick() {
  pet.hunger += 2;
  pet.energy -= 1;
  pet.happiness -= 1;

  clampStats();

  if (Math.random() < 0.15) {
    print(`${getFace()} the cursor blinks.`, "pet");
  }

  save();
}
setInterval(tick, 60000);

// boot

const restored = load();
print(`booting caret...
type "help" to begin.`, "system");

if (restored) print(`${getFace()} you came back.`, "pet");
else print(`${getFace()} i am waiting.`, "pet");

save();

// conversation

const greetings = ["hi", "hii", "hiii", "hello","hey","hiya","heyo","yo","sup"];
const greetingResponses = ["…hello.","hi.","you’re here.","i noticed.","hello again."];

// guess game

function startGuess() {
  pet.inGuessGame = true;
  pet.guessNumber = Math.floor(Math.random() * 10) + 1;
  print("pick a number between 1 and 10.", "system");
}

// input

input.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;

  const raw = input.value.trim();
  const lower = raw.toLowerCase();
  input.value = "";

  print(`> ${raw}`, "system");

  /* guess game intercept */
  if (pet.inGuessGame) {
    const num = Number(lower);

    if (Number.isNaN(num)) {
      print("that is not a number.", "system");
      return;
    }

    if (num === pet.guessNumber) {
      print("correct.", "pet");
      pet.happiness += 10;
      gainXp(20);

      if (Math.random() < 0.4) giveItem("coin");
    } else {
      print("wrong.", "pet");
      pet.happiness -= 5;
    }

    pet.inGuessGame = false;
    pet.guessNumber = null;
    clampStats();
    save();
    return;
  }

  const args = lower.split(" ");
  const command = args[0];

  /* conversation */
  if (greetings.includes(command)) {
    pet.happiness += 3;
    print(`${getFace()} ${greetingResponses[Math.floor(Math.random()*greetingResponses.length)]}`, "pet");
  }

  /* commands */
  else switch (command) {
    case "help": help(); break;
    case "status": status(); break;

    case "feed":
      pet.hunger -= 30;
      pet.happiness += 10;
      gainXp(5);
      print(`${getFace()} accepted.`, "pet");
      break;

    case "play":
      if (pet.energy < 20) {
        print(`${getFace()} not now.`, "pet");
      } else {
        pet.energy -= 20;
        pet.happiness += 25;
        gainXp(10);
        print(`${getFace()} that was… nice.`, "pet");

        if (Math.random() < 0.3) giveItem("ball");
      }
      break;

    case "sleep":
      pet.energy += 40;
      pet.hunger += 10;
      print(`${getFace()} …`, "pet");
      break;

    case "pet":
      pet.happiness += 5;
      print(`${getFace()} i noticed.`, "pet");
      break;

    case "guess":
      startGuess();
      break;

    case "inventory":
      if (pet.inventory.length === 0) {
        print("inventory empty.", "system");
      } else {
        print("inventory:\n- " + pet.inventory.join("\n- "), "system");
      }
      break;

    /* unlocked commands */
    case "throw":
      if (!hasItem("ball")) break;
      pet.happiness += 5;
      gainXp(5);
      print(`${getFace()} it rolls away.`, "pet");
      break;

    case "flip":
      if (!hasItem("coin")) break;
      print(Math.random() < 0.5 ? "heads." : "tails.", "system");
      break;

    case "unlock":
      if (!hasItem("key")) break;
      print("something opens. quietly.", "secret");
      break;

    case "load":
      if (!hasItem("disk")) break;
      print("reading disk...", "secret");
      break;

    case "rename":
      if (args[1]) {
        pet.name = args[1];
        print(`${getFace()} acknowledged.`, "pet");
      } else print("rename requires a name.", "system");
      break;

    case "clear":
      output.innerHTML = "";
      break;

    case "time":
      print(`local time: ${new Date().toLocaleTimeString()}`, "system");
      break;

    case "about":
      print("caret is a quiet terminal companion that changes as you stay.", "system");
      break;

    case "version":
      print("caret v1.2", "system");
      break;

    case "inspire":
      const quotes = ["…","keep typing.","the cursor waits.","silence is a friend."];
      print(quotes[Math.floor(Math.random()*quotes.length)], "system");
      break;

    default:
      print("unknown command.", "system");
  }

  clampStats();
  pet.lastSeen = Date.now();
  save();
});
