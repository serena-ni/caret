const output = document.getElementById("output");
const input = document.getElementById("command");
const form = document.getElementById("input-form");

const SAVE_KEY = "caret-save";

let pet = {
  name: "caret",
  hunger: 20,
  energy: 80,
  happiness: 60,
  trust: 0,
  level: 0,
  lastSeen: Date.now(),
  startTime: Date.now(),
  history: []
};

// helpers

function print(text, cls = "line") {
  const div = document.createElement("div");
  div.className = `line ${cls}`;
  div.textContent = text;
  output.appendChild(div);
  output.scrollTop = output.scrollHeight;
}

function getFace() {
  if (pet.energy < 20) return "(– –)";
  if (pet.happiness > 70) return "(^_^)";
  if (pet.hunger > 70) return "(._.)";
  return "(•_•)";
}

function save() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(pet));
}

function load() {
  const data = localStorage.getItem(SAVE_KEY);
  if (data) {
    pet = JSON.parse(data);
    gainTrust(1);
  } else {
    print("(caret wakes quietly.)", "system");
  }
}

function gainTrust(amount = 1) {
  pet.trust += amount;

  if (pet.trust >= 5 && pet.level === 0) {
    pet.level = 1;
    print(`${getFace()} you type like you belong here.`, "pet");
  }

  if (pet.trust >= 12 && pet.level === 1) {
    pet.level = 2;
    unlockBanner();
    print(`${getFace()} i will stay.`, "pet");
  }
}

function unlockBanner() {
  print("^ caret", "secret");
}

// command handling

function handleCommand(raw) {
  if (!raw) return;

  pet.history.push(raw);
  if (pet.history.length > 25) pet.history.shift();

  const cmd = raw.toLowerCase().trim();
  const args = cmd.split(" ");

  print(`caret ❯ ${raw}`, "system");

  if (/^(hi|hello|hey|yo|sup|hiya)/.test(cmd)) {
    gainTrust();
    print(pet.level >= 2 ? "(^_^) hello again." : "(•_•) hello.", "pet");
    save();
    return;
  }

  switch (args[0]) {
    case "help":
      print("help status feed play sleep pet rename clear", "system");
      print("ls pwd man history env uptime exit", "system");
      break;

    case "status":
      print(
        `name: ${pet.name}
mood: ${getFace()}
energy: ${pet.energy}
hunger: ${pet.hunger}`,
        "system"
      );
      break;

    case "feed":
      pet.hunger = Math.max(0, pet.hunger - 15);
      pet.happiness += 5;
      gainTrust();
      print(`${getFace()} thank you.`, "pet");
      break;

    case "play":
      pet.energy -= 10;
      pet.happiness += 10;
      gainTrust();
      print(`${getFace()} that was nice.`, "pet");
      break;

    case "sleep":
      pet.energy = 100;
      print("(caret goes quiet.)", "pet");
      break;

    case "pet":
      pet.happiness += 3;
      gainTrust();
      print(`${getFace()} ...`, "pet");
      break;

    case "rename":
      if (args[1]) {
        pet.name = args[1];
        gainTrust(2);
        print(`name set to ${pet.name}.`, "system");
      } else {
        print("rename <name>", "system");
      }
      break;

    case "ls":
      gainTrust();
      print("caret  memories  silence", "system");
      break;

    case "pwd":
      gainTrust();
      print("/home/caret", "system");
      break;

    case "cd":
      gainTrust();
      print("permission denied.", "system");
      break;

    case "man":
      if (args[1] === "caret") {
        gainTrust(2);
        print(
`caret

a quiet terminal companion.
not all commands are documented.`,
          "system"
        );
      } else {
        print("no manual entry.", "system");
      }
      break;

    case "history":
      pet.history.forEach((c, i) => print(`${i + 1}  ${c}`, "system"));
      break;

    case "env":
      pet.level >= 2
        ? print("CARET=awake\nSILENCE=true\nINPUT=observed", "secret")
        : print("environment unavailable.", "system");
      break;

    case "uptime":
      const mins = Math.floor((Date.now() - pet.startTime) / 60000);
      print(`up ${mins} minute${mins === 1 ? "" : "s"}`, "system");
      break;

    case "exit":
      print("caret does not close.", "secret");
      break;

    case "clear":
      output.innerHTML = "";
      break;

    default:
      print("command not found.", "system");
  }

  pet.lastSeen = Date.now();
  save();
}

// form submit

form.addEventListener("submit", (e) => {
  e.preventDefault();
  handleCommand(input.value);
  input.value = "";
});

// start

load();
input.focus();
