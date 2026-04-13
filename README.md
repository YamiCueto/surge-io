# ARAISE

A 2D side-scrolling action platformer with RPG progression mechanics, inspired by Solo Leveling. The core mechanic revolves around **Shadow Extraction** — defeating enemies and converting them into shadow allies that fight alongside you.

---

## Technologies

- **Phaser 3** (loaded via CDN — no install required)
- **JavaScript** (ES Modules)
- No bundlers, no npm, no build tools

---

## How to Run

1. Clone or download this repository
2. Start a local HTTP server in the project root:

```bash
# Python
python -m http.server 8080

# Node.js (npx)
npx serve .
```

3. Open `http://localhost:8080` in your browser

> `index.html` must be served via HTTP (not `file://`) because it uses ES Modules.

---

## Controls

| Key | Action |
|-----|--------|
| `A` / `D` | Move left / right |
| `SPACE` | Jump |
| `J` | Attack |
| `K` | Skill (reserved) |
| `E` | Extract Shadow |

---

## Project Structure

```
/
├── index.html              # Entry point — loads Phaser via CDN
└── src/
    ├── main.js             # Phaser game config and scene bootstrap
    ├── scenes/
    │   └── GameScene.js    # Main game scene — orchestrates all systems
    ├── entities/
    │   ├── Player.js       # Player movement, attack, HP/MP state
    │   ├── Enemy.js        # Enemy patrol, detection, combat, death
    │   └── Shadow.js       # Shadow ally — auto-attacks, expires over time
    ├── systems/
    │   └── ManaSystem.js   # MP regeneration and consumption logic
    └── ui/
        └── HUD.js          # HP/MP bars, shadow counter, extraction hint
```

### Responsibilities

- **GameScene** — wires entities and systems together, handles input routing
- **Player** — self-contained movement and combat state, exposes HP/MP
- **Enemy** — independent AI (patrol → chase → attack), extractable flag
- **Shadow** — finds closest living enemy, attacks autonomously, expires
- **ManaSystem** — single source of truth for MP changes
- **HUD** — pure display layer, reads from player state each frame

---

## Shadow Extraction Flow

```
Enemy dies
    └── 25% chance → enemy.extractable = true
          └── Player presses E within range
                ├── Enough MP? → Shadow spawned, MP consumed
                └── Not enough MP → Floating "NOT ENOUGH MP!" text
```

- Max 2 active shadows at once
- Each shadow lasts 12 seconds then fades out
- Shadows attack the nearest living enemy automatically

---

## Roadmap

### Phase 1 — Movement & Physics ✅
- Player movement, jump, gravity
- Platform collisions
- Camera follow

### Phase 2 — Basic Combat ✅
- Attack hitbox
- Enemy takes damage and dies
- Enemy HP bar

### Phase 3 — Mana System ✅
- MP regeneration
- MP consumption on abilities
- ManaSystem decoupled from Player

### Phase 4 — Enemies ✅
- Patrol behavior
- Player detection and chase
- Contact damage with cooldown

### Phase 5 — Shadow Extraction ✅
- 25% extractable chance on death
- E key triggers extraction
- Shadow AI auto-targets enemies
- 12s lifetime with fade out
- Max 2 shadow limit

### Phase 6 — Items & Chests
- Chest objects in the world
- HP potions (restore health)
- MP potions (restore mana)
- Interaction prompt

### Phase 7 — Checkpoints
- Checkpoint objects
- Save player position
- Respawn on death

### Phase 8 — Advanced UI
- Skill cooldown indicators
- Shadow lifetime bars
- Damage numbers floating
- Screen flash on hit

### Phase 9 — Polish & Optimization
- Sprite animations (walk, jump, attack)
- Sound effects
- Particle effects on extraction
- Enemy variety

---

## Future Ideas

- **Level system** — XP gain, stat upgrades on level up
- **Skill tree** — unlock new abilities with skill points
- **Shadow types** — tank, ranged, mage shadows with unique AI
- **Boss fights** — large enemies with phases and special attacks
- **Inventory** — item slots, equippable gear
- **Multiple levels** — different biomes and enemy sets
- **Save system** — localStorage persistence

---

## Scaling Guidelines

### Adding a new enemy type
1. Extend `Enemy.js` or create `BossEnemy.js` extending `Phaser.Physics.Arcade.Sprite`
2. Override `patrol()`, `chasePlayer()`, or add new behavior methods
3. Register in `GameScene` the same way existing enemies are added

### Adding a new system
1. Create `src/systems/NewSystem.js` as a plain class
2. Instantiate it in `GameScene.create()`
3. Call `newSystem.update(delta)` in `GameScene.update()`
4. Never import `GameScene` into a system — pass what it needs via constructor or method args

### Avoiding spaghetti code
- Entities own their own state (HP, MP, flags)
- Systems own logic that operates on state
- Scenes own wiring — they connect entities to systems, nothing more
- UI only reads state, never writes it
