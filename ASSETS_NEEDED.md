# GRAVEL SKY — Asset Generation Prompts & Manifest Specification (`ASSETS_NEEDED.md`)

Drop raw generated images into `/assets-src/raw/<id>.png` on a flat `#FF00FF` magenta background and run:
```bash
node tools/process-assets.mjs
```

## Step 0: Global Style Lock (Prefixed to Every Prompt)
> 16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette.

## Step 0: Global Negative Prompt
> avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.

## Complete Asset List

### `sena_turnaround.png`
- **Category**: `player`
- **Frame Size**: `64x64` (4 frame(s), strip `256x64`, 2 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. character turnaround sheet, front view, back view, left side view, right side view, of Sena Ibuki, a young woman salvage runner, short uneven rust-red hair with one longer strand on the left held by a bent paper clip, cracked welding goggles pushed up on her forehead, black patched work coat with a frayed hem and a square rust patch on the back left shoulder, left sleeve torn off at the elbow with a grey bandaged forearm, right forearm wearing a brass pipe-clamp cuff, long bone-colored scarf with one stenciled rust stripe near the tail, holding a short sword made from a sawn-off length of train rail, cloth-wrapped flange as the hilt, only the sharpened edge glowing signal cyan, worn boots, determined expression, anime proportions, about 4 heads tall. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `sena_idle_down.png`
- **Category**: `player`
- **Frame Size**: `64x64` (2 frame(s), strip `128x64`, 4 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. same character Sena Ibuki, same palette, same proportions, same costume details, new pose: down view idle breathing pose, 2 frames, holding Railcut sword with signal cyan edge. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `sena_run_down.png`
- **Category**: `player`
- **Frame Size**: `64x64` (6 frame(s), strip `384x64`, 12 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. same character Sena Ibuki, same palette, same proportions, same costume details, new pose: down view 6-frame run cycle, scarf trailing, coat hem flaring. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `sena_attack1_down.png`
- **Category**: `player`
- **Frame Size**: `64x64` (3 frame(s), strip `192x64`, 14 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. same character Sena Ibuki, same palette, same proportions, same costume details, new pose: down view attack combo hit 1 horizontal forehand slash, 3 frames (anticipation, smear, recovery). avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `sena_attack2_down.png`
- **Category**: `player`
- **Frame Size**: `64x64` (3 frame(s), strip `192x64`, 14 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. same character Sena Ibuki, same palette, same proportions, same costume details, new pose: down view attack combo hit 2 reverse upward backhand slash, 3 frames (anticipation, smear, recovery). avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `sena_attack3_down.png`
- **Category**: `player`
- **Frame Size**: `64x64` (3 frame(s), strip `192x64`, 12 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. same character Sena Ibuki, same palette, same proportions, same costume details, new pose: down view attack combo hit 3 two-handed overhead rail cleave, 3 frames (anticipation, smear, recovery). avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `sena_hurt_down.png`
- **Category**: `player`
- **Frame Size**: `64x64` (1 frame(s), strip `64x64`, 8 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. same character Sena Ibuki, same palette, same proportions, same costume details, new pose: down view hurt recoil pose, 1 frame. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `sena_idle_up.png`
- **Category**: `player`
- **Frame Size**: `64x64` (2 frame(s), strip `128x64`, 4 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. same character Sena Ibuki, same palette, same proportions, same costume details, new pose: up view idle breathing pose, 2 frames, holding Railcut sword with signal cyan edge. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `sena_run_up.png`
- **Category**: `player`
- **Frame Size**: `64x64` (6 frame(s), strip `384x64`, 12 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. same character Sena Ibuki, same palette, same proportions, same costume details, new pose: up view 6-frame run cycle, scarf trailing, coat hem flaring. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `sena_attack1_up.png`
- **Category**: `player`
- **Frame Size**: `64x64` (3 frame(s), strip `192x64`, 14 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. same character Sena Ibuki, same palette, same proportions, same costume details, new pose: up view attack combo hit 1 horizontal forehand slash, 3 frames (anticipation, smear, recovery). avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `sena_attack2_up.png`
- **Category**: `player`
- **Frame Size**: `64x64` (3 frame(s), strip `192x64`, 14 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. same character Sena Ibuki, same palette, same proportions, same costume details, new pose: up view attack combo hit 2 reverse upward backhand slash, 3 frames (anticipation, smear, recovery). avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `sena_attack3_up.png`
- **Category**: `player`
- **Frame Size**: `64x64` (3 frame(s), strip `192x64`, 12 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. same character Sena Ibuki, same palette, same proportions, same costume details, new pose: up view attack combo hit 3 two-handed overhead rail cleave, 3 frames (anticipation, smear, recovery). avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `sena_hurt_up.png`
- **Category**: `player`
- **Frame Size**: `64x64` (1 frame(s), strip `64x64`, 8 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. same character Sena Ibuki, same palette, same proportions, same costume details, new pose: up view hurt recoil pose, 1 frame. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `sena_idle_side.png`
- **Category**: `player`
- **Frame Size**: `64x64` (2 frame(s), strip `128x64`, 4 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. same character Sena Ibuki, same palette, same proportions, same costume details, new pose: side view idle breathing pose, 2 frames, holding Railcut sword with signal cyan edge. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `sena_run_side.png`
- **Category**: `player`
- **Frame Size**: `64x64` (6 frame(s), strip `384x64`, 12 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. same character Sena Ibuki, same palette, same proportions, same costume details, new pose: side view 6-frame run cycle, scarf trailing, coat hem flaring. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `sena_attack1_side.png`
- **Category**: `player`
- **Frame Size**: `64x64` (3 frame(s), strip `192x64`, 14 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. same character Sena Ibuki, same palette, same proportions, same costume details, new pose: side view attack combo hit 1 horizontal forehand slash, 3 frames (anticipation, smear, recovery). avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `sena_attack2_side.png`
- **Category**: `player`
- **Frame Size**: `64x64` (3 frame(s), strip `192x64`, 14 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. same character Sena Ibuki, same palette, same proportions, same costume details, new pose: side view attack combo hit 2 reverse upward backhand slash, 3 frames (anticipation, smear, recovery). avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `sena_attack3_side.png`
- **Category**: `player`
- **Frame Size**: `64x64` (3 frame(s), strip `192x64`, 12 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. same character Sena Ibuki, same palette, same proportions, same costume details, new pose: side view attack combo hit 3 two-handed overhead rail cleave, 3 frames (anticipation, smear, recovery). avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `sena_hurt_side.png`
- **Category**: `player`
- **Frame Size**: `64x64` (1 frame(s), strip `64x64`, 8 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. same character Sena Ibuki, same palette, same proportions, same costume details, new pose: side view hurt recoil pose, 1 frame. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `sena_dodge_side.png`
- **Category**: `player`
- **Frame Size**: `64x64` (4 frame(s), strip `256x64`, 16 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. same character Sena Ibuki, same palette, same proportions, same costume details, new pose: side view low evasive dodge roll, 4 frames, bone scarf whipping forward. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `sena_death_side.png`
- **Category**: `player`
- **Frame Size**: `64x64` (4 frame(s), strip `256x64`, 6 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. same character Sena Ibuki, same palette, same proportions, same costume details, new pose: side view collapse to knees and planting Railcut sword in the ground, 4 frames. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `sena_neutral.png`
- **Category**: `portrait`
- **Frame Size**: `96x96` (1 frame(s), strip `96x96`, 1 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. anime bust portrait of Sena Ibuki, neutral calm expression, visual-novel framing, pixel art, same costume. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `sena_hurt.png`
- **Category**: `portrait`
- **Frame Size**: `96x96` (1 frame(s), strip `96x96`, 1 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. anime bust portrait of Sena Ibuki, hurt wincing expression with grit teeth, visual-novel framing, pixel art, same costume. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `sena_determined.png`
- **Category**: `portrait`
- **Frame Size**: `96x96` (1 frame(s), strip `96x96`, 1 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. anime bust portrait of Sena Ibuki, determined focused combat expression, visual-novel framing, pixel art, same costume. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `sena_ultimate.png`
- **Category**: `portrait`
- **Frame Size**: `96x96` (1 frame(s), strip `96x96`, 1 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. anime bust portrait of Sena Ibuki, ultimate expression with eyes glowing bright signal cyan, visual-novel framing, pixel art, same costume. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `tin_rat.png`
- **Category**: `enemy_common`
- **Frame Size**: `40x40` (5 frame(s), strip `200x40`, 8 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. scrawny rat with a rusted soup can fused over its back like a shell, lid flapping on a hinge, red pinprick eyes, matted grey fur, 5 frames (move 2, attack 1, hurt 1, dead 1 scattered parts). avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `dust_dog.png`
- **Category**: `enemy_common`
- **Frame Size**: `40x40` (5 frame(s), strip `200x40`, 8 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. starved hound, ribs showing, pale bone-colored fur with rust stains, a rag collar with a pair of dead person's welding goggles hanging from it, head carried low, 5 frames (move 2, attack 1, hurt 1, dead 1 scattered parts). avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `wire_kite.png`
- **Category**: `enemy_common`
- **Frame Size**: `40x40` (5 frame(s), strip `200x40`, 8 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. drone made from two crossed sticks and torn plastic sheet wings, one camera-lens eye glowing blood red, a long trailing wire tail, hovering, 5 frames (move 2, attack 1, hurt 1, dead 1 scattered parts). avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `lye_leech.png`
- **Category**: `enemy_common`
- **Frame Size**: `40x40` (5 frame(s), strip `200x40`, 8 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. fat half-translucent yellow-green slug with a ring mouth of tiny teeth, wet shine, stretched mid-crawl, 5 frames (move 2, attack 1, hurt 1, dead 1 scattered parts). avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `sump_bat.png`
- **Category**: `enemy_common`
- **Frame Size**: `40x40` (5 frame(s), strip `200x40`, 10 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. bat with wings made of torn hazmat plastic on bent umbrella ribs, swollen pale sac under its belly, wings spread, 5 frames (move 2, attack 1, hurt 1, dead 1 scattered parts). avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `cleaver_hauler.png`
- **Category**: `enemy_elite`
- **Frame Size**: `80x80` (7 frame(s), strip `560x80`, 8 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. hunched man-sized scavenger dragging a wheeled cart of scrap by a chain, a butcher's cleaver welded in place of his right hand, rag-wrapped face, 7 frames (move 2, tell 1, attack 2, hurt 1, dead 1). avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `lye_strider.png`
- **Category**: `enemy_elite`
- **Frame Size**: `80x80` (7 frame(s), strip `560x80`, 8 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. tall stilt-legged figure built from bent pipes, chemical tank on its back with a cracked pressure gauge, a funnel for a head, 7 frames (move 2, tell 1, attack 2, hurt 1, dead 1). avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `flats_harvester.png`
- **Category**: `enemy_elite`
- **Frame Size**: `80x80` (7 frame(s), strip `560x80`, 8 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. half-human operator fused into the front of a small harvester blade drum, red-stained blades, dust coating, 7 frames (move 2, tell 1, attack 2, hurt 1, dead 1). avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `the_foreman.png`
- **Category**: `boss`
- **Frame Size**: `192x192` (9 frame(s), strip `1728x192`, 6 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. excavator rig with a skeleton in a yellow hard hat in the cab, rusted bucket arm, dangling wrecking ball chain, 9 frames (idle 2, attack A 2, attack B 2, phase-change 1, dead 2). avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `big_axle.png`
- **Category**: `boss`
- **Frame Size**: `224x160` (9 frame(s), strip `2016x160`, 6 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. truck cab dragging two chained trailer sections, headlights glowing like eyes, dented grille like a jaw, 9 frames (idle 2, attack A 2, attack B 2, phase-change 1, dead 2). avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `mother_sump.png`
- **Category**: `boss`
- **Frame Size**: `192x192` (9 frame(s), strip `1728x192`, 6 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. heaving mass of rusted drums and torn tarp with a pulsing pale sac, leeches crawling out, half-sunk in toxic water, 9 frames (idle 2, attack A 2, attack B 2, phase-change 1, dead 2). avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `the_long_dry.png`
- **Category**: `boss`
- **Frame Size**: `256x192` (9 frame(s), strip `2304x192`, 6 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. giant worm built from stacked rusted pipe rings, mouth ringed with drill bits, bursting from red sand, 9 frames (idle 2, attack A 2, attack B 2, phase-change 1, dead 2). avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `fx_slash_smear.png`
- **Category**: `fx`
- **Frame Size**: `128x128` (5 frame(s), strip `640x128`, 24 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. crescent sword-slash smear, tapered, white core with a cyan edge, motion-blur-free pixel art, frame N of 5 growing then fading. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `fx_dash_streak.png`
- **Category**: `fx`
- **Frame Size**: `160x48` (4 frame(s), strip `640x48`, 24 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. horizontal speed streak lines, bone and cyan, 4 frames. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `fx_hit_cross.png`
- **Category**: `fx`
- **Frame Size**: `48x48` (3 frame(s), strip `144x48`, 24 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. white cross-shaped hit flash, 3 frames. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `fx_shards.png`
- **Category**: `fx`
- **Frame Size**: `64x64` (4 frame(s), strip `256x64`, 20 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. 6 small metal shards flying outward, bone and rust, 4 frames. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `fx_shock_ring.png`
- **Category**: `fx`
- **Frame Size**: `256x256` (6 frame(s), strip `1536x256`, 20 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. top-down expanding shockwave ring with cracked ground lines, signal cyan inner glow, soot cracks, dust, 6 frames. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `fx_ground_cracks.png`
- **Category**: `fx`
- **Frame Size**: `192x192` (3 frame(s), strip `576x192`, 1 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. top-down radial ground cracks glowing cyan inside, soot-colored rim, 3 variants. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `fx_dust_puff.png`
- **Category**: `fx`
- **Frame Size**: `48x48` (4 frame(s), strip `192x48`, 16 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. dust cloud puff in rust and slag, 4 frames. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `rail_spike.png`
- **Category**: `fx`
- **Frame Size**: `16x16` (4 frame(s), strip `64x16`, 1 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. short rail piece thrown like a spear, cyan tip, drawn at 4 angles (right, down-right, down, up-right). avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `fx_spark.png`
- **Category**: `fx`
- **Frame Size**: `24x24` (3 frame(s), strip `72x24`, 24 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. small metal spark burst, 3 frames. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `ultimate_cutin.png`
- **Category**: `fx`
- **Frame Size**: `480x120` (1 frame(s), strip `480x120`, 1 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. anime close-up strip of Sena's eyes, cyan glow, speed lines radiating from behind, bold ink style in pixel art. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `fx_ult_slash.png`
- **Category**: `fx`
- **Frame Size**: `320x40` (3 frame(s), strip `960x40`, 24 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. long tapered white slash line with signal cyan edge, 3 variants. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `tile_kettle.png`
- **Category**: `tile`
- **Frame Size**: `16x16` (3 frame(s), strip `48x16`, 1 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. top-down seamless ground texture tile, packed dirt with cracked concrete, 3 variants. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `tile_slab_town.png`
- **Category**: `tile`
- **Frame Size**: `16x16` (3 frame(s), strip `48x16`, 1 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. top-down seamless ground texture tile, broken concrete rubble, 3 variants. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `tile_route_9.png`
- **Category**: `tile`
- **Frame Size**: `16x16` (3 frame(s), strip `48x16`, 1 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. top-down seamless ground texture tile, cracked asphalt with faded lane paint, 3 variants. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `tile_lye_marsh.png`
- **Category**: `tile`
- **Frame Size**: `16x16` (3 frame(s), strip `48x16`, 1 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. top-down seamless ground texture tile, pale toxic mud with puddles, 3 variants. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `tile_copper_flats.png`
- **Category**: `tile`
- **Frame Size**: `16x16` (3 frame(s), strip `48x16`, 1 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. top-down seamless ground texture tile, rust-red sand, 3 variants. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `tile_transitions.png`
- **Category**: `tile`
- **Frame Size**: `16x16` (6 frame(s), strip `96x16`, 1 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. top-down seamless edge transition ground tiles between dirt, rubble, asphalt, toxic mud, and red sand, 6 variants. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `prop_kettle_boiler_tower.png`
- **Category**: `prop`
- **Frame Size**: `96x96` (1 frame(s), strip `96x96`, 1 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. rusted industrial boiler tower with warm furnace grate and pipes, baked ground shadow. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `prop_kettle_shack.png`
- **Category**: `prop`
- **Frame Size**: `80x64` (1 frame(s), strip `80x64`, 1 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. corrugated tin salvage shack with tarp roof, baked ground shadow. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `prop_kettle_campfire.png`
- **Category**: `prop`
- **Frame Size**: `32x32` (3 frame(s), strip `96x32`, 8 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. oil drum ring campfire with brass and rust flames, 3 frames, baked ground shadow. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `prop_kettle_signs.png`
- **Category**: `prop`
- **Frame Size**: `32x40` (1 frame(s), strip `32x40`, 1 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. wooden post with stenciled metal directional signs, baked ground shadow. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `prop_kettle_crates.png`
- **Category**: `prop`
- **Frame Size**: `40x32` (1 frame(s), strip `40x32`, 1 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. stacked wooden and stamped iron salvage crates, baked ground shadow. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `prop_kettle_barrels.png`
- **Category**: `prop`
- **Frame Size**: `32x32` (1 frame(s), strip `32x32`, 1 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. pair of dented water and fuel barrels, baked ground shadow. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `prop_kettle_tent.png`
- **Category**: `prop`
- **Frame Size**: `64x48` (1 frame(s), strip `64x48`, 1 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. patched canvas runner tent held up by rebar poles, baked ground shadow. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `prop_kettle_bench.png`
- **Category**: `prop`
- **Frame Size**: `48x32` (1 frame(s), strip `48x32`, 1 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. workbench built from railway sleepers and a vise, baked ground shadow. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `prop_slab_collapsed_wall.png`
- **Category**: `prop`
- **Frame Size**: `80x64` (1 frame(s), strip `80x64`, 1 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. collapsed concrete apartment wall with exposed rebar, baked ground shadow. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `prop_slab_rebar_pile.png`
- **Category**: `prop`
- **Frame Size**: `48x40` (1 frame(s), strip `48x40`, 1 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. tangled pile of rusted rebar rods and concrete chunks, baked ground shadow. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `prop_slab_dead_mall_sign.png`
- **Category**: `prop`
- **Frame Size**: `64x64` (1 frame(s), strip `64x64`, 1 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. fallen commercial mall pylon sign with broken casing, baked ground shadow. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `prop_slab_rubble_heap.png`
- **Category**: `prop`
- **Frame Size**: `56x40` (1 frame(s), strip `56x40`, 1 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. mound of broken concrete slabs and masonry dust, baked ground shadow. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `prop_slab_bent_streetlight.png`
- **Category**: `prop`
- **Frame Size**: `32x72` (1 frame(s), strip `32x72`, 1 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. bent steel streetlight pole with shattered lamp housing, baked ground shadow. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `prop_slab_shopping_cart.png`
- **Category**: `prop`
- **Frame Size**: `32x32` (1 frame(s), strip `32x32`, 1 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. rusted wire shopping cart tipped on its side, baked ground shadow. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `prop_slab_vending_machine.png`
- **Category**: `prop`
- **Frame Size**: `40x56` (1 frame(s), strip `40x56`, 1 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. gutted beverage vending machine with cracked front panel, baked ground shadow. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `prop_slab_broken_stairs.png`
- **Category**: `prop`
- **Frame Size**: `64x56` (1 frame(s), strip `64x56`, 1 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. freestanding concrete stairwell leading nowhere, baked ground shadow. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `prop_route9_burnt_car.png`
- **Category**: `prop`
- **Frame Size**: `72x48` (1 frame(s), strip `72x48`, 1 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. rusted burnt-out sedan chassis without wheels, baked ground shadow. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `prop_route9_overturned_truck.png`
- **Category**: `prop`
- **Frame Size**: `96x64` (1 frame(s), strip `96x64`, 1 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. overturned freight truck cab and axle on cracked highway, baked ground shadow. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `prop_route9_guardrail.png`
- **Category**: `prop`
- **Frame Size**: `64x32` (1 frame(s), strip `64x32`, 1 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. crumpled steel highway guardrail section, baked ground shadow. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `prop_route9_road_sign.png`
- **Category**: `prop`
- **Frame Size**: `32x56` (1 frame(s), strip `32x56`, 1 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. bullet-riddled highway exit sign on bent post, baked ground shadow. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `prop_route9_tire_stack.png`
- **Category**: `prop`
- **Frame Size**: `32x36` (1 frame(s), strip `32x36`, 1 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. stack of worn rubber truck tires, baked ground shadow. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `prop_route9_oil_drum.png`
- **Category**: `prop`
- **Frame Size**: `32x36` (1 frame(s), strip `32x36`, 1 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. corroded highway barrel drum, baked ground shadow. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `prop_route9_dead_tree.png`
- **Category**: `prop`
- **Frame Size**: `56x64` (1 frame(s), strip `56x64`, 1 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. leafless ash-white dead roadside tree, baked ground shadow. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `prop_route9_billboard_frame.png`
- **Category**: `prop`
- **Frame Size**: `88x72` (1 frame(s), strip `88x72`, 1 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. skeletal steel highway billboard lattice with torn metal strips, baked ground shadow. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `prop_marsh_rusted_drum_cluster.png`
- **Category**: `prop`
- **Frame Size**: `48x40` (1 frame(s), strip `48x40`, 1 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. cluster of leaking chemical drums half-sunk in lye mud, baked ground shadow. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `prop_marsh_dead_reed_clump.png`
- **Category**: `prop`
- **Frame Size**: `32x40` (1 frame(s), strip `32x40`, 1 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. clump of brittle bleached marsh reeds, baked ground shadow. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `prop_marsh_bone_pile.png`
- **Category**: `prop`
- **Frame Size**: `40x32` (1 frame(s), strip `40x32`, 1 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. ribcages and bleached animal bones in toxic mud, baked ground shadow. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `prop_marsh_sunken_car_roof.png`
- **Category**: `prop`
- **Frame Size**: `64x40` (1 frame(s), strip `64x40`, 1 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. car roof and pillars protruding from bog water, baked ground shadow. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `prop_marsh_glowing_spore_pods.png`
- **Category**: `prop`
- **Frame Size**: `40x40` (1 frame(s), strip `40x40`, 1 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette.  swollen bog fungal pods with faint cyan-teal pores, baked ground shadow. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `prop_marsh_pipe_outflow.png`
- **Category**: `prop`
- **Frame Size**: `56x48` (1 frame(s), strip `56x48`, 1 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. large corroded drainage pipe discharging green sludge, baked ground shadow. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `prop_marsh_tarp_shack.png`
- **Category**: `prop`
- **Frame Size**: `72x56` (1 frame(s), strip `72x56`, 1 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. stilted bog lean-to covered in yellow hazmat tarp, baked ground shadow. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `prop_marsh_fog_patch.png`
- **Category**: `prop`
- **Frame Size**: `64x32` (1 frame(s), strip `64x32`, 1 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. low hanging pixel-dithered bog vapor cloud over mud. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `prop_flats_wrecked_harvester.png`
- **Category**: `prop`
- **Frame Size**: `96x72` (1 frame(s), strip `96x72`, 1 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. hulking rusted strip-mine harvester chassis buried in red sand, baked ground shadow. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `prop_flats_sand_dune_crest.png`
- **Category**: `prop`
- **Frame Size**: `80x40` (1 frame(s), strip `80x40`, 1 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. wind-swept rust-red sand dune ridge with slag stones, baked ground shadow. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `prop_flats_machine_rib_cage.png`
- **Category**: `prop`
- **Frame Size**: `72x56` (1 frame(s), strip `72x56`, 1 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. arched iron hull ribs of a gutted turbine half-buried in sand, baked ground shadow. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `prop_flats_cactus_husk.png`
- **Category**: `prop`
- **Frame Size**: `32x48` (1 frame(s), strip `32x48`, 1 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. petrified woody desert cactus skeleton, baked ground shadow. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `prop_flats_buried_antenna.png`
- **Category**: `prop`
- **Frame Size**: `40x64` (1 frame(s), strip `40x64`, 1 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. tilted dish antenna mast protruding from red drift sand, baked ground shadow. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `prop_flats_tire_half_sunk.png`
- **Category**: `prop`
- **Frame Size**: `32x32` (1 frame(s), strip `32x32`, 1 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. massive haul-truck tire half-buried in red sand, baked ground shadow. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `prop_flats_bone_arch.png`
- **Category**: `prop`
- **Frame Size**: `72x64` (1 frame(s), strip `72x64`, 1 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. giant bleached vertebrae and scrap beam arch in the desert, baked ground shadow. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `prop_flats_rusted_silo.png`
- **Category**: `prop`
- **Frame Size**: `80x88` (1 frame(s), strip `80x88`, 1 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. collapsed cylindrical ore silo with riveted rust plates, baked ground shadow. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `ume.png`
- **Category**: `npc`
- **Frame Size**: `64x64` (2 frame(s), strip `128x64`, 2 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. older woman with a pawn counter, rolled sleeves, reading glasses on a chain, a crate of mixed junk beside her, idle 2 frames. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `ui_panel.png`
- **Category**: `ui`
- **Frame Size**: `48x48` (1 frame(s), strip `48x48`, 1 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. worn metal and wood 9-slice panel frame with rivets, rust and slag, pixel art. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `ui_bar_hp.png`
- **Category**: `ui`
- **Frame Size**: `128x12` (2 frame(s), strip `256x12`, 1 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. 128x12 pixel-bar frame and blood-red fill mask, rusted iron border. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `ui_bar_stamina.png`
- **Category**: `ui`
- **Frame Size**: `128x12` (2 frame(s), strip `256x12`, 1 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. 128x12 pixel-bar frame and signal-cyan fill mask, rusted iron border. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `ui_bar_xp.png`
- **Category**: `ui`
- **Frame Size**: `128x12` (2 frame(s), strip `256x12`, 1 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. 128x12 pixel-bar frame and brass-gold fill mask, rusted iron border. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `ui_button.png`
- **Category**: `ui`
- **Frame Size**: `96x24` (3 frame(s), strip `288x24`, 1 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. worn metal plate button normal, hover, and pressed states at 96x24. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `icon_skill_lunge.png`
- **Category**: `ui_icon`
- **Frame Size**: `32x32` (1 frame(s), strip `32x32`, 1 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. 32x32 skill icon for Lunge: forward rail-blade thrust with signal cyan streak on dark square. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `icon_skill_ground_break.png`
- **Category**: `ui_icon`
- **Frame Size**: `32x32` (1 frame(s), strip `32x32`, 1 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. 32x32 skill icon for Ground Break: rail sword slammed into cracked cyan earth on dark square. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `icon_skill_rail_spike.png`
- **Category**: `ui_icon`
- **Frame Size**: `32x32` (1 frame(s), strip `32x32`, 1 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. 32x32 skill icon for Rail Spike: sharpened iron rail spike flying with cyan tip on dark square. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `icon_skill_seven_cuts.png`
- **Category**: `ui_icon`
- **Frame Size**: `32x32` (1 frame(s), strip `32x32`, 1 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. 32x32 skill icon for Seven Cuts: seven intersecting signal-cyan and bone slash lines on dark square. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `icon_skill_locked.png`
- **Category**: `ui_icon`
- **Frame Size**: `32x32` (1 frame(s), strip `32x32`, 1 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. 32x32 locked skill icon: heavy rusted iron padlock and chain on dark square. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `icon_item_welding_goggles.png`
- **Category**: `ui_icon`
- **Frame Size**: `32x32` (1 frame(s), strip `32x32`, 1 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. 32x32 item icon: cracked brass welding goggles with leather strap on dark square. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `icon_item_surplus_respirator.png`
- **Category**: `ui_icon`
- **Frame Size**: `32x32` (1 frame(s), strip `32x32`, 1 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. 32x32 item icon: rubber surplus twin-canister respirator mask on dark square. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `icon_item_riders_helmet.png`
- **Category**: `ui_icon`
- **Frame Size**: `32x32` (1 frame(s), strip `32x32`, 1 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. 32x32 item icon: battered highway dispatch riders helmet with visor on dark square. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `icon_item_patched_vest.png`
- **Category**: `ui_icon`
- **Frame Size**: `32x32` (1 frame(s), strip `32x32`, 1 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. 32x32 item icon: heavy canvas work vest with tin scrap plates on dark square. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `icon_item_riot_jacket.png`
- **Category**: `ui_icon`
- **Frame Size**: `32x32` (1 frame(s), strip `32x32`, 1 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. 32x32 item icon: ribbed civil-defense riot jacket with shoulder pads on dark square. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `icon_item_plate_coat.png`
- **Category**: `ui_icon`
- **Frame Size**: `32x32` (1 frame(s), strip `32x32`, 1 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. 32x32 item icon: long Duster coat lined with boiler steel plates on dark square. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `icon_item_work_boots.png`
- **Category**: `ui_icon`
- **Frame Size**: `32x32` (1 frame(s), strip `32x32`, 1 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. 32x32 item icon: steel-toe leather salvage boots on dark square. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `icon_item_courier_leggings.png`
- **Category**: `ui_icon`
- **Frame Size**: `32x32` (1 frame(s), strip `32x32`, 1 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. 32x32 item icon: canvas courier trousers with knee braces on dark square. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `icon_item_hydraulic_shins.png`
- **Category**: `ui_icon`
- **Frame Size**: `32x32` (1 frame(s), strip `32x32`, 1 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. 32x32 item icon: brass-piston hydraulic leg greaves on dark square. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `icon_item_gauze_roll.png`
- **Category**: `ui_icon`
- **Frame Size**: `32x32` (1 frame(s), strip `32x32`, 1 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. 32x32 item icon: boiled bone-white bandage roll with red cross stitch on dark square. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `icon_item_sugar_tin.png`
- **Category**: `ui_icon`
- **Frame Size**: `32x32` (1 frame(s), strip `32x32`, 1 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. 32x32 item icon: dented pocket tin of hard brown sugar blocks on dark square. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `ui_minimap_frame.png`
- **Category**: `ui`
- **Frame Size**: `96x96` (1 frame(s), strip `96x96`, 1 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. 96x96 rusted iron compass-radar minimap bezel frame with rivets. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `ui_coin.png`
- **Category**: `ui`
- **Frame Size**: `16x16` (1 frame(s), strip `16x16`, 1 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. 16x16 stamped brass salvage token coin with square hole. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `ui_cursor.png`
- **Category**: `ui`
- **Frame Size**: `16x16` (1 frame(s), strip `16x16`, 1 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. 16x16 signal cyan and bone targeting crosshair cursor. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `title_logo.png`
- **Category**: `ui`
- **Frame Size**: `360x64` (1 frame(s), strip `360x64`, 1 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. GRAVEL SKY title lettering drawn in chunky pixel letters with a rust and bone worn-stencil look. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`

### `title_key_art.png`
- **Category**: `key_art`
- **Frame Size**: `480x270` (1 frame(s), strip `480x270`, 1 fps)
- **Full Prompt**: `16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette. wide pixel-art scene: Sena standing on a collapsed overpass, scarf blowing, Kettle's boiler glow far below, burnt sky. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.`
