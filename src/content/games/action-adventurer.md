---
title: Action Adventurer
cover: /uploads/Copy of Untitled Design.png
pitch: None
description: 'I wrote the gameplay code for this game in late 2024 and came back in 2026 to rebuild movement, combat and the camera. I wanted hits that feel heavy, a parry that rewards timing and a camera the player never notices. It has three spells and three enemy families: orcs, a skeleton archer and a werebear.'
type: personal
status: prototype
period: Nov–Dec 2024, Oct 2026
role: Gameplay Programmer, Game Designer
teamSize: 1
genre: 2D action platformer RPG
platforms:
  - PC
engine: Unity 6 (URP 2D)
credits: []
links: null
gallery: []
featured: true
order: 100
production: null
narrative: null
programming:
  contribution: 'I wrote the gameplay code: player movement, combat, spells and enemy behavior, plus the camera and the impact feedback.'
  responsibilities:
    - Player movement and combat
    - Enemy behavior and attack patterns
    - Camera and impact feedback
  highlights:
    - One screen impact per swing, tuned attack by attack
    - A perfect parry with a 0.2 second window that deflects arrows
    - A room-based camera with no jump between rooms
  tools:
    - Unity
    - Cinemachine 3
    - Input System
    - URP 2D
    - Pixel Perfect Camera
  evidence: []
  systems:
    - Impact channel driving hit stop, shake, rumble and zoom
    - Parry, posture and knockback pipeline
    - Enemy AI built from chained states
    - Room-based camera rig
    - Equippable spells paid with three mana types
  languages:
    - C#
  challenge: 'Switching camera rooms made the camera jump: the confiner corrects the position all at once when its bounds change, and its own easing did not cover that change. I wrote a Cinemachine pipeline extension that measures the jump on the switch frame and dissolves it over a short time, cutting straight through on teleports.'
  codeSnippet: |-
    // Every target a swing catches in one physics step is queued, then raised here as a
    // single impact: the screen shakes once, time stops once, the pad buzzes once.
    private void RaisePendingImpact()
    {
        if (!_hasPendingImpact) return;

        bool killed = _pendingImpactKilled;
        HitWindow window = _pendingWindow;
        _hasPendingImpact = false;
        _pendingImpactKilled = false;
        _pendingWindow = null;

        // Once the window has raised its hit, only a kill is still news.
        if (window.HasRaisedKill || (window.HasRaisedHit && !killed)) return;

        window.HasRaisedHit = true;
        window.HasRaisedKill = killed;

        ImpactChannel.RaiseDefault(new ImpactReport(
            _pendingStrength,
            killed,
            _pendingHitStop,
            _pendingHitPoint,
            _pendingHitDirection,
            _player.transform));
    }
  codeLanguage: csharp
---

## Highlights

### Who owns the camera shake?
- **Goal:** Every hit should feel as heavy as it is, and one swing through a group should feel like one blow.
- **Process:** Shake and freeze frames lived on each enemy prefab, so one swing through three enemies shook the screen three times. I moved them to one impact channel with four responders: hit stop, shake, rumble, zoom.
- **Why:** The effect belongs to the spectator, not the attacker. Strength is set per attack, not derived from damage, or growing stats would make every hit the heaviest.
- **Result:** One impact per swing, plus one for a kill, however many enemies it catches. New feedback is a new component, with no prefab to edit.

### A parry worth the risk
- **Goal:** Blocking at the right moment should turn the fight; holding the button should not.
- **Process:** The block records when it started, and a hit within 0.2 seconds is a perfect parry. Arrows broke it: damage assumed a melee attacker, so hits now say whether they are deflectable and report whether they landed.
- **Why:** Timing from the press, not the held state, rewards only a deliberate parry. I tightened the window from 0.25 after researching the genre: 12 frames at 60 fps, as in Sekiro.
- **Result:** A perfect parry drains the attacker's posture, the bar that stuns it when emptied, returns arrows to the archer and earns the longest freeze frame, 0.15 seconds.

### A camera that knows the room
- **Goal:** The camera should frame one room at a time and glide between rooms.
- **Process:** Polygon rooms replaced fixed limits per area and brought two bugs: a jump on every room change, and flicker when the player stood on a doorway.
- **Why:** I fixed the jump at the end of Cinemachine's pipeline instead of replacing its confiner, so the rest stayed untouched.
- **Result:** The camera glides between rooms, cuts instantly on teleports, and an exit margin ends the doorway flicker.

### Enemies assembled, not coded
- **Goal:** Each enemy should fight in its own way and telegraph every attack, so a parry is always fair.
- **Process:** Enemy behavior is a chain of states set in the Inspector: patrol, chase, wind-up, attack, recover. Variety comes from swapping links: a sequence of blows, a loop repeated two to six times, keeping distance for the archer.
- **Why:** A new enemy should be a prefab and a few references, so tuning a fight never waits on code.
- **Result:** Orcs, a skeleton archer and a werebear share the same states, with special attacks on their own cooldowns and a posture stun capped so they always recover.

### Spells you equip, mana you earn
- **Goal:** Spells should be a loadout choice, and using them should send the player back into melee.
- **Process:** Up to four equipped spells sit on four buttons, each paying in one of three mana types. Each spell is a prefab with cast, loop and end states, and effects such as pull or push plug in as components.
- **Why:** Spells should reward aggression, not replace it, so mana returns only through sword hits. Mana and cooldown are spent when the spell leaves, so an interrupted cast costs nothing.
- **Result:** Three spells share one base, so a new spell is a prefab plus an effect.

## Decisions
- **Dash on a distance curve:** a curve shapes the burst while the total distance stays fixed, because level gaps are built around its reach.
- **Knockback resistance shortens the push:** the hit carries the force and a sturdy character recovers sooner instead of being pushed less, so every blow lands at full strength.
- **Jump defined by height and time:** the arc comes from jump height and time to apex, not raw force and gravity, in a component with no input code that enemy AI can drive too.
- **Cancel only by jump or dash:** a held direction never cancels an attack early, so attacking while running does not abort the swing.

## Skills
- Cinemachine 3 extensions
- Gameplay state machines
- ScriptableObject event channels
- Data-driven enemy AI
- Platformer jump physics
- Data-driven spell system

