# Canopy Run

A momentum-driven, endless jungle game. Hold to catch a branch, release to fly, and find a rhythm through the canopy. All jungle, monkey, branch, and banana art is drawn procedurally; sounds are synthesized with Web Audio.

## Play locally

Requires Node.js 22.12+ (or Node.js 20.19+) and npm.

```sh
npm install
npm run dev
```

Open the address printed by Vite. To make a production build:

```sh
npm run build
npm run preview
```

## Controls

| Action                  | Desktop                   | Mobile                  |
| ----------------------- | ------------------------- | ----------------------- |
| Grab a reachable branch | Hold Space or left mouse  | Touch and hold the game |
| Release into flight     | Release all held controls | Lift your finger        |
| Pause / resume          | Escape or pause button    | Pause / resume button   |
| Toggle sound            | Sound button              | Sound button            |

Start holding early on your first leap. Release near the bottom of the swing for forward speed, or slightly later for more height. Staying attached too long carries you back. Only an attached vine is drawn: there are no target markers, aim lines, highlights, or trajectory previews. Switching away from the browser pauses the run.

## Stack and structure

TypeScript, Phaser 3, Phaser's bundled Matter physics engine, Vite, and HTML/CSS.

- `src/scenes/BootScene.ts`: creates procedural textures.
- `src/scenes/GameScene.ts`: coordinates input, run state, camera, and HTML overlays.
- `src/entities/Monkey.ts`: player body, speed limit, and visual rotation.
- `src/systems/SwingSystem.ts`: attach/release lifecycle and attached vine rendering.
- `src/systems/rules.ts`: pure candidate selection and seeded layout rules.
- `src/systems/LevelGenerator.ts`: generation, collectibles, and world cleanup.
- `src/systems/ScoreSystem.ts`: run metrics and scoring.
- `src/systems/JungleBackdrop.ts`: parallax jungle rendering.
- `src/systems/SoundSystem.ts`: optional synthesized feedback.
- `src/config/gameConfig.ts`: tunable physics and generation values.

## Swinging physics

A Matter distance constraint joins the monkey's center to a stationary branch anchor. Its length starts at the current distance, avoiding an attachment teleport. High stiffness and low damping keep the rope taut while gravity produces pendulum motion. Attaching does not overwrite velocity; the solver redirects motion onto the constrained arc. A grab with a large radial velocity can still lose speed, as expected from catching a taut rope. Releasing removes the constraint without changing the body's velocity. A small, capped tangential assist offsets catch losses during forward swings; set `swingAssist` to zero for an unassisted pendulum.

Selection checks radius, minimum length, height, and direction. Forward branches are preferred; a slightly trailing branch is allowed as a fallback. Holding creates at most one constraint. A release cooldown prevents instant recatching, and the just-released branch is excluded. Air drag, constraint damping, radius, cooldowns, velocity ceiling, and gravity are exposed in the configuration module. Phaser/Matter uses velocity per nominal simulation tick; the HUD converts world units to meters using ten pixels per meter.

## Endless generation

Seed 42 produces a repeatable sequence. Branches are placed 175–225 world units apart, with small, clamped vertical changes. Difficulty reaches its cap after 22,000 world units. The bounded gaps stay inside the grab radius, though successful traversal still requires managing height and momentum. Layout is deterministic; real-time input and physics are not a replay protocol.

Generation runs ahead of the player and removes branches and bananas more than 650 units behind. Banana arcs reward passes below branches. Falling is the MVP's main hazard; lethal obstacles are deliberately deferred. The run ends below the canopy or after falling far behind the scrolling camera.

## Scoring

One point per meter plus 25 points per banana. Each run tracks distance, maximum speed, bananas, total successful grabs, longest sequence of forward grabs, and duration. Game Over displays the main metrics and restarts immediately with fresh state and the same seed. A chain counts successive grabs of increasingly forward branches within one run.

## Verification

```sh
npm test
npm run build
```

The tests use Phaser's bundled Matter engine and cover momentum at release, attachment without velocity resets, range selection, single-constraint holding, release cleanup, cooldowns, maximum-speed rope stability, 10,000 deterministic branch placements, bounded object counts, scoring resets, free fall, and a sustained sequence of timed swings. Browser interaction and subjective swing feel should also be checked on target devices; engine tests alone do not certify all browsers.

