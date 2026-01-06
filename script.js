const output = document.getElementById("output");
const input = document.getElementById("command");

const SAVE_KEY = "caret-save";

let pet = {
  name: "caret",
  hunger: 20,
  energy: 80,
  happiness: 60,
  lastSeen: Date.now(),
  startTime: Date.now()
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

  // simulate time passing while away
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
- clear
- time
- about
- version
- inspire`,
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

/* conversation phrases */
const greetings = ["hi","hello","hey","hiya","heyo","yo","sup"];
const farewells = ["bye","goodbye","see ya","goodnight"];
const thanks = ["thanks","thank you","ty"];
const smallTalk = ["how are you","what's up","whats up","how's it going","sup"];

const greetingResponses = ["…hello.","hi.","you’re here.","i noticed.","hello again."];
const farewellResponses = ["bye.","…see you.","goodnight.","…"];
const thanksResponses = ["…","you're welcome.","okay.","hm."];
const smallTalkResponses = ["…","fine.","quiet.","observing."];

/* easter eggs */
const hiddenCommands = ["sudo","whoami","uptime","reset","echo","matrix","star"];

/* input */
input.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;

  const raw = input.value.trim();
  const lower = raw.toLowerCase();
  const args = lower.split(" ");
  const command = args[0];

  print(`> ${raw}`, "system");
  input.value = "";

  // conversational phrases first
  if (greetings.includes(command)) {
    pet.happiness = Math.min(100, pet.happiness + 3);
    print(`${getFace()} ${greetingResponses[Math.floor(Math.random()*greetingResponses.length)]}`,"pet");
  } else if (farewells.includes(command)) {
    print(`${getFace()} ${farewellResponses[Math.floor(Math.random()*farewellResponses.length)]}`,"pet");
  } else if (thanks.includes(command)) {
    pet.happiness = Math.min(100, pet.happiness + 2);
    print(`${getFace()} ${thanksResponses[Math.floor(Math.random()*thanksResponses.length)]}`,"pet");
  } else if (smallTalk.some(p => lower.includes(p))) {
    pet.happiness = Math.min(100, pet.happiness + 2);
    print(`${getFace()} ${smallTalkResponses[Math.floor(Math.random()*smallTalkResponses.length)]}`,"pet");
  } 
  // commands
  else switch (command) {
    case "help": help(); break;
    case "status": status(); break;
    case "feed":
      pet.hunger = Math.max(0, pet.hunger - 30);
      pet.happiness = Math.min(100, pet.happiness + 10);
      print(`${getFace()} accepted.`, "pet"); break;
    case "play":
      if(pet.energy<20){print(`${getFace()} not now.`,"pet");}
      else{pet.energy-=20;pet.happiness=Math.min(100,pet.happiness+25);print(`${getFace()} that was… nice.`,"pet");} break;
    case "sleep":
      pet.energy = Math.min(100,pet.energy+40);
      pet.hunger = Math.min(100,pet.hunger+10);
      print(`${getFace()} …`,"pet"); break;
    case "pet":
      pet.happiness = Math.min(100, pet.happiness + 5);
      print(`${getFace()} i noticed.`, "pet"); break;
    case "rename":
      if(args[1]){pet.name=args[1]; print(`${getFace()} acknowledged.`,"pet");}
      else{print("rename requires a name.","system");} break;
    case "clear": output.innerHTML=""; break;
    case "time": print(`local time: ${new Date().toLocaleTimeString()}`,"system"); break;
    case "about": print("caret is a quiet terminal companion that reacts subtly to you.","system"); break;
    case "version": print("caret v1.0","system"); break;
    case "inspire":
      const quotes=["…","keep typing.","the cursor waits.","silence is a friend."];
      print(quotes[Math.floor(Math.random()*quotes.length)],"system"); break;

    /* secret commands */
    case "sudo": print("permission denied.","secret"); break;
    case "whoami": print("a cursor between thoughts.","secret"); break;
    case "uptime":
      const minutes=Math.floor((Date.now()-pet.startTime)/60000);
      print(`caret has been alive for ${minutes} min.`,"secret"); break;
    case "reset":
      localStorage.removeItem(SAVE_KEY);
      location.reload(); break;
    case "echo":
      if(args[1]) print(args.slice(1).join(" "),"secret");
      else print("echo what?","secret"); break;
    case "matrix":
      print("scrolling...","secret");
      break;
    case "star":
      print("* ✦ ✧ ★ ✩ ✫ ✬ ✭ *","secret"); break;

    default: print("unknown command.","system");
  }

  pet.lastSeen = Date.now();
  save();
});
