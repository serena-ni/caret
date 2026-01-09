const output = document.getElementById("output")
const input = document.getElementById("command")

const SAVE_KEY = "caret-save"

// items

const itemData = {
  ball: { symbol: "●", rarity: "common" },
  coin: { symbol: "◍", rarity: "uncommon" },
  key:  { symbol: "✦", rarity: "rare" },
  disk: { symbol: "▣", rarity: "special" }
}

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
  lastSeen: Date.now()
}

const faces = {
  happy: "(=^･ω･^=)",
  sleepy: "( - ω - ) zzz",
  grumpy: "( •̀ ω •́ )",
  neutral: "( o ω o )"
}

// persistence

function save() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(pet))
}

function load() {
  const data = localStorage.getItem(SAVE_KEY)
  if (!data) return false
  pet = JSON.parse(data)
  pet.level ??= 1
  pet.xp ??= 0
  pet.inventory ??= []
  pet.lastSeen ??= Date.now()
  return true
}

// helpers

function clampStats() {
  pet.hunger = Math.max(0, Math.min(100, pet.hunger))
  pet.energy = Math.max(0, Math.min(100, pet.energy))
  pet.happiness = Math.max(0, Math.min(100, pet.happiness))
}

function gainXp(amount) {
  pet.xp += amount
  while (pet.xp >= pet.level * 50) {
    pet.xp -= pet.level * 50
    pet.level++
    print(`level up (${pet.level})`, "system")

    if (pet.level === 2) giveItem("ball")
    if (pet.level === 3) giveItem("key")
    if (pet.level === 4) giveItem("disk")
  }
}

function giveItem(item) {
  if (pet.inventory.includes(item)) return
  pet.inventory.push(item)

  const data = itemData[item]
  const line = document.createElement("div")
  line.className = `line secret item ${data.rarity}`
  line.textContent = `obtained ${data.symbol} ${item}`
  output.appendChild(line)
  output.scrollTop = output.scrollHeight
}

function hasItem(item) {
  return pet.inventory.includes(item)
}

function getFace() {
  if (pet.energy < 25) return faces.sleepy
  if (pet.hunger > 75) return faces.grumpy
  if (pet.happiness > 70) return faces.happy
  return faces.neutral
}

function getMood() {
  if (pet.energy < 20) return "tired"
  if (pet.hunger > 75) return "hungry"
  if (pet.happiness < 30) return "low"
  if (pet.happiness > 70) return "happy"
  return "neutral"
}

function print(text, cls = "") {
  const line = document.createElement("div")
  line.className = `line ${cls}`
  output.appendChild(line)

  let i = 0
  const t = setInterval(() => {
    line.textContent += text[i++]
    output.scrollTop = output.scrollHeight
    if (i >= text.length) clearInterval(t)
  }, 15)
}

// commands

function help() {
  let text =
`commands
  status
  feed / play / sleep / pet
  guess
  rename <name>
  clear`

  if (pet.inventory.length) text += `\n  inventory`
  if (hasItem("ball")) text += `\n  throw`
  if (hasItem("coin")) text += `\n  flip`
  if (hasItem("key")) text += `\n  unlock`
  if (hasItem("disk")) text += `\n  load`

  print(text, "system")
}

function status() {
  print(
`${getFace()}
level: ${pet.level}
xp: ${pet.xp}/${pet.level * 50}
hunger: ${pet.hunger}
energy: ${pet.energy}
happiness: ${pet.happiness}`,
    "pet"
  )
}

// idle

setInterval(() => {
  pet.hunger += 2
  pet.energy -= 1
  pet.happiness -= 1
  clampStats()

  if (Math.random() < 0.15) {
    print(`${getFace()} the cursor blinks.`, "pet")
  }

  save()
}, 60000)

// boot

load()
print(`booting caret...\ntype "help" to begin.`, "system")
print(`${getFace()} ready.`, "pet")
save()

// input

input.addEventListener("keydown", e => {
  if (e.key !== "Enter") return
  const raw = input.value.trim()
  input.value = ""
  if (!raw) return

  print(`> ${raw}`, "system")
  const cmd = raw.toLowerCase().split(" ")[0]

  switch (cmd) {
    case "help": help(); break
    case "status": status(); break

    case "feed":
      pet.hunger -= 30
      pet.happiness += 10
      gainXp(5)
      print(`${getFace()} accepted.`, "pet")
      break

    case "play":
      if (pet.energy < 20) {
        print(`${getFace()} not now.`, "pet")
      } else {
        pet.energy -= 20
        pet.happiness += 25
        pet.hunger += 15
        gainXp(10)
        print(`${getFace()} that was nice.`, "pet")
        if (Math.random() < 0.3) giveItem("ball")
      }
      break

    case "sleep":
      pet.energy += 40
      pet.hunger += 10
      print(`${getFace()} resting...`, "pet")
      break

    case "pet":
      pet.happiness += 5
      print(`${getFace()} i noticed.`, "pet")
      break

    case "guess":
      pet.inGuessGame = true
      pet.guessNumber = Math.floor(Math.random() * 10) + 1
      print("pick a number between 1 and 10.", "system")
      break

    case "inventory":
      if (!pet.inventory.length) {
        print("inventory empty.", "system")
      } else {
        pet.inventory.forEach(item => {
          const d = itemData[item]
          const line = document.createElement("div")
          line.className = `line system item ${d.rarity}`
          line.textContent = `${d.symbol} ${item}`
          output.appendChild(line)
        })
        output.scrollTop = output.scrollHeight
      }
      break

    case "throw":
      if (!hasItem("ball")) break
      pet.happiness += 5
      gainXp(5)
      print(`${getFace()} it rolls away.`, "pet")
      break

    case "flip":
      if (!hasItem("coin")) break
      print(Math.random() < 0.5 ? "heads." : "tails.", "system")
      break

    case "unlock":
      if (!hasItem("key")) break
      print("✦ something opens.", "secret")
      break

    case "load":
      if (!hasItem("disk")) break
      print("▣ reading disk...", "secret")
      break

    case "rename":
      pet.name = raw.split(" ")[1] || pet.name
      print(`${getFace()} acknowledged.`, "pet")
      break

    case "clear":
      output.innerHTML = ""
      break

    default:
      print("unknown command.", "system")
  }

  clampStats()
  pet.lastSeen = Date.now()
  save()
})
