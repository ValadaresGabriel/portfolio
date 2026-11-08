---
title: Action Adventurer
cover: /uploads/Copy of Untitled Design.png
pitch: None
description: It started as a team project in 2024 and I picked it back up on my own in 2026. In the restart I rebuilt movement, combat and the camera, reusing systems from my other game, Tales of the Dark Abyss. Highlights include a room-based Cinemachine 3 camera, an event-driven impact feedback pipeline and a parry that deflects projectiles.
type: personal
status: prototype
period: Nov 2024 – Oct 2026
role: Game Programming
teamSize: 4
genre: 2D action platformer RPG
platforms:
  - PC
engine: Unity 6 (URP 2D)
credits:
  - name: Gabriel Ferreira Carrijo
    role: Scenes and level design
  - name: Bruno Lima
    role: Maps
  - name: heyset
    role: Main menu, scene transitions and the first version of the camera limits
links: null
gallery: []
featured: true
order: 100
production: null
narrative: null
programming:
  contribution: I built the player, combat, spells and enemy AI, and later rebuilt the camera and the game feel on top of Cinemachine 3.
  responsibilities:
    - 'Gameplay programming: player, combat and spells'
    - Enemy AI
    - Camera and game feel
    - Editor tooling
    - Engine upgrade and project maintenance
  highlights:
    - Room-based Cinemachine 3 camera with smooth transitions between areas
    - One impact channel driving hit stop, camera shake, rumble and zoom
    - A single knockback component tuned per hit, shared by the player and every enemy
    - A parry that deflects arrows back at enemies
  tools:
    - Unity
    - Cinemachine 3
    - Input System
    - URP 2D
    - Pixel Perfect Camera
    - Shader Graph
  evidence: []
  systems:
    - Player and enemy state machines
    - Combat pipeline with hit windows, posture, parry and knockback
    - Spells with typed mana
    - Camera rig with bounds, rooms and framing
    - Impact feedback channel
    - Platforming movement and ground sensing
    - Lens flare shader with collider occlusion
    - Editor tools for camera rooms and prefab migration
  languages:
    - C#
    - HLSL
  challenge: 'Switching camera rooms made the camera jump: the confiner corrects the position all at once when the bounds change, and its own easing did not cover that change. I wrote a Cinemachine pipeline extension that measures the jump on the switch frame and dissolves it over a short time, cutting straight through on teleports.'
  codeSnippet: |-
    protected override void PostPipelineStageCallback(
        CinemachineVirtualCameraBase vcam, CinemachineCore.Stage stage, ref CameraState state, float deltaTime)
    {
        if (stage != CinemachineCore.Stage.Finalize)
        {
            return;
        }
        if (deltaTime < 0f || !vcam.PreviousStateIsValid)
        {
            Cancel();
        }
        else if (_isPending && _hasShownPosition)
        {
            _startOffset = _shownPosition - state.GetCorrectedPosition();
            _elapsed = 0f;
        }
        _isPending = false;
        GiveBackConfinerEasing();
        if (_elapsed < _duration)
        {
            _elapsed += Mathf.Max(deltaTime, 0f);
            float remaining = 1f - Mathf.SmoothStep(0f, 1f, _elapsed / _duration);
            state.PositionCorrection += _startOffset * remaining;
        }
        _shownPosition = state.GetCorrectedPosition();
        _hasShownPosition = true;
    }
  codeLanguage: csharp
---

## Timeline
- **Combat prototype** (Nov 2024): combo, perfect parry, enemy posture bar, the first spell and attribute-based progression
- **Enemies and spells** (Nov 2024): an archer whose arrows the parry can deflect, orcs with several attacks and an equippable spell system
- **Team version** (Nov–Dec 2024): typed mana, portals between scenes, checkpoints and respawn; the team built the scenes and areas
- **Restart** (Oct 2026): upgrade to Unity 6; movement and combat rebuilt from *Tales of the Dark Abyss*
- **Camera and game feel** (Oct 2026): room-based Cinemachine 3 camera, impact pipeline (hit stop, shake, rumble), Pixel Perfect and simpler progression
- **Polish** (Oct 2026): a single hit pipeline, per-spell cooldowns, unified knockback and a custom lens flare

## Architecture
- **Characters by composition:** a shared character base plus one component per responsibility (health, attack, animation, physics, detection, feedback, VFX, death), specialized for the player and for enemies
  - Movement, jumping, ground sensing and knockback are input-independent components, used by both the player and the AI
- **Custom state machines:** every player action is a state (jump, dash, parry, ground, air and upward attacks, dialogue, resting), and so is every enemy behavior (patrol, chase, wind-up, attack sequences, keep distance, broken posture)
  - Combos and attack sequences are assembled in the Inspector by chaining states, with no new code
  - Each state declares what it allows (turning around, jumping) instead of checks scattered through the code
- **Combat:** every hit is an object with damage, posture damage, knockback, stun, hit stop and flags (melee, projectile, deflectable). Every player hit, sword or spell, goes through a single entry point, with one hit window per swing
- **Spells and mana:** each spell is a prefab with its own state machine (cast, loop, end) and pluggable effects (pull, push). Mana comes in types and refills on sword hits
- **Data in ScriptableObjects:** enemies, spells, projectiles, mana and the codex are design assets; runtime state lives in components
- **Event-driven game feel:** an impact channel (`ImpactChannel`) receives every impact in the game, and independent responders react to it: hit stop, camera shake, controller rumble and zoom
- **Camera:** Cinemachine 3 with polygonal bounds per scene and nested rooms, smooth room transitions, a custom framing target, Pixel Perfect at 320x180 and parallax
- **World:** portals between scenes with fades, checkpoints with respawn, dialogue, quests, a creature and item codex, achievements and an inventory
- **Editor tools:** automatic camera rig setup, room creation, scene references by asset and automatic prefab migration

## Decisions
- **Room-based camera on Cinemachine 3**
  - What changed: the first camera was limited by points spread through each scene, four per area. I replaced them with polygonal bounds per scene and nested rooms that only confine the camera while the player is inside.
  - Why: smooth transitions between areas, correct snapping on teleports and a quick way to draw rooms in the editor.
- **Framing on a dedicated target**
  - What changed: the camera follows an invisible target that leads in the direction of movement, ignores regular jumps and only looks down on real falls.
  - Why: turning around to parry or attack should not move the screen, and jumping on the same level should not bob the camera.
- **Game feel centralized in an event channel**
  - What changed: camera shake and freeze frames lived on the enemy prefabs. I created a ScriptableObject channel that receives each impact once, with the strength of the hit, and independent responders that react to it.
  - Why: an enemy should not know about the camera, feedback should scale with the hit without editing prefabs, and one swing through several enemies should shake the screen only once.
- **Knockback force comes from the hit**
  - What changed: each character type had its own push logic with fixed values. I unified it in one component: force and duration come from the hit, and the receiver only has a resistance per kind of hit.
  - Why: tuning hit by hit. A heavy enemy can shrug off the sword and still be thrown by a perfect parry.
- **A single path for every hit**
  - What changed: sword and spells now land through the same entry point, each swing or cast with its own window of targets.
  - Why: a sword swing and a spell no longer block each other's targets, and each spell deals its own damage.
- **Design data separate from game state**
  - What changed: current mana and cooldowns moved out of the ScriptableObjects and into the components, at runtime.
  - Why: an asset changed during play keeps the value into the next editor session, mixing design data with game state.
- **Mana fed by combat**
  - What changed: landing sword hits on enemies refills the equipped mana crystals.
  - Why: a loop where melee combat fuels the spells.
- **Simpler progression**
  - What changed: the game had seven attributes, each with its own experience. I simplified it to a single level and then removed the attributes, leaving the values on the components.
  - Why: making room for progression through currency and purchased upgrades, which is easier to balance.
- **Movement as reusable components**
  - What changed: I ported jumping and ground sensing from *Tales of the Dark Abyss* as components that do not depend on input.
  - Why: reusing a system already proven in another game, and letting enemy AI use the same API as the player.
- **Combat driven by the animation**
  - What changed: the combo went through waiting states between hits. Now each animation says when the hitbox opens, when the hit can be cancelled and when it ends, and the input waits in a buffer for the next window. Dashes and attack lunges follow distance curves.
  - Why: more responsive controls, and tuning how a move feels without changing how far it travels.

## Challenges
- **The camera jumped when switching rooms**
  - Cause: the confiner corrects the position all at once when the bounds change, and its own easing did not cover that change.
  - Solution: a Cinemachine pipeline extension that measures the jump on the switch frame and dissolves it over a short time; on teleports it cuts straight through.
- **The camera flickered at room doorways**
  - Cause: the player stood on the boundary, entering and leaving the room every frame.
  - Solution: an exit margin (hysteresis) and a point-in-polygon test that supports rooms with holes; with nested rooms, the smallest one wins.
- **Camera shake froze during hit stop**
  - Cause: hit stop slows down game time, and shake and rumble ran on that same clock. Overlapping hit stops also restored normal time too early.
  - Solution: shake and rumble on unscaled time, and an async hit stop that handles overlaps and always restores time when it ends.
- **One swing through a group shook the screen once per enemy**
  - Cause: every body hit raised its own impact.
  - Solution: hits accumulate per swing window and raise a single impact; a kill still raises its own.
- **Knockback vanished right after the hit**
  - Cause: the states rewrite the character's velocity on every physics step, erasing the push.
  - Solution: while a push runs, the states' physics step is suspended but input is still read. The rule applies to every character.
- **Phantom double jumps and false landings**
  - Cause: the ground sensor still detected the ground for one or two frames after the jump, which refilled coyote time.
  - Solution: the sensor ignores the ground while the character is rising, and coyote time only applies while falling.
- **The player was duplicated when changing scenes**
  - Cause: the player persists between scenes, and the copy in the new scene took its place before being destroyed. Both copies answered input and listeners piled up.
  - Solution: an instance guard across the whole lifecycle, and event subscriptions that can be repeated without duplicating, cleaned up on disable.
- **Arrows disappeared before the parry could deflect them**
  - Cause: the projectile destroyed itself on any contact, and the damage system assumed every attacker was a melee enemy.
  - Solution: damage now receives who attacked and reports whether it was accepted. The projectile is only destroyed on a real hit; on a parry it flies back and starts hitting enemies.
- **The lens flare lagged one frame behind**
  - Cause: the camera and parallax move after the flare's logic, and 2D physics still held the old positions during the occlusion test.
  - Solution: placing the flare right before the camera renders, and syncing 2D physics before the test.
- **State leaking between play sessions in the editor**
  - Cause: with domain reload turned off for faster play mode, static fields and ScriptableObject events kept values from the previous run.
  - Solution: explicit cleanup on runtime initialization and whenever each asset loads.

## Code evolution
- **Knockback:** from an abstract class with a player variant and an enemy variant, using fixed values, to one component driven by the hit's data
- **Combat:** from intermediate waiting states to attacks driven by the animation, with buffering and cancelling
- **Spells:** hit logic that was duplicated in every spell moved up to the base class, and each spell now defines only what is unique to it
- **Mana:** from fixed fields per type with repeated conditionals to a per-type structure with equippable slots
- **Progression:** from seven attributes with their own experience to values tuned directly on the components
- **Engine:** upgrade from Unity 2022 to Unity 6, including URP and the Input System

## Skills
- **Gameplay state machines:** player, enemy AI and spells
- **Platforming game feel:** coyote time, jump buffering, variable jump height, apex hang and gravity derived from jump height and time
- **Combat design:** posture, a timed parry that deflects projectiles, input buffering and cancel windows
- **Event-driven architecture:** a ScriptableObject channel with independent responders, and a C# event lifecycle with no leaks
- **Cinemachine 3 in depth:** pipeline extensions, confiners, impulse and a rig built by an editor tool
- **2D geometry:** point-in-polygon, polygon area and point-to-segment distance
- **Shaders:** an HLSL lens flare for URP 2D with ghosts, rays and pixel-grid snapping; occlusion by sampling colliders
- **Time control:** async hit stop and unscaled time for effects that must not freeze
- **Performance:** object pooling for damage numbers and afterimage trails
- **Editor tooling:** property drawers, automatic scene setup, menus and prefab migration
- **Project maintenance:** a major engine upgrade and porting systems between projects without breaking existing prefabs

## Highlights

### Room-based camera on Cinemachine 3
- **Problem:** the camera was limited by points spread through the scene, had no transition between areas and flickered at room doorways.
- **Solution:** polygonal bounds with nested rooms, an exit margin and a Cinemachine extension that dissolves the jump when the room changes. Framing moved to a dedicated target that leads the movement.
- **Result:** smooth transitions, teleports with no drag and an editor tool to draw a room in seconds.

### Who owns the camera shake?
- **Problem:** the shake lived on the enemy prefab. It fired once per body hit, did not scale with the hit and played even with the player far away.
- **Solution:** a ScriptableObject impact channel that receives one event per hit, with independent responders for hit stop, shake, rumble and zoom.
- **Result:** one impact per hit, fine tuning per attack and no enemy depending on the camera.

### The knockback bug that kept coming back
- **Problem:** the push disappeared because the states rewrote velocity on every physics step. Local fixes solved one case and the bug came back in another.
- **Solution:** moving the rule to the base of every character and unifying knockback in one component, with the force coming from the hit. The switch kept every prefab's references intact.
- **Result:** the same behavior for the player and enemies, less code and per-hit balancing: a heavy enemy resists the sword but not the parry.

### Knowing what to cut: attribute progression
- **Problem:** seven attributes with their own experience spread formulas through the whole codebase and made balancing hard.
- **Solution:** simplifying to a single level and then removing the attributes, with a tool that cleaned up the prefabs automatically.
- **Result:** values tuned directly on the components, and room for progression through currency and upgrades.

### Parrying arrows
- **Problem:** the damage system assumed every attacker was a melee enemy, so the parry did not work against projectiles.
- **Solution:** damage now receives who attacked and reports whether it was accepted, and hits gained projectile and deflectable flags.
- **Result:** the parry deflects arrows, which fly back and start hitting enemies.
