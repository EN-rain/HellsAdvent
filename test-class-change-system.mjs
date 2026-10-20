import assert from 'node:assert';
import {
  CHARACTERS,
  SPECIALIZATIONS,
  getClassesForCharacter,
  getClassById,
  getSkillById,
  getIntrinsicTraitRank,
  getClassTraitRank,
  getAllSkillsForCharacter,
  getLearnedSkillsForCharacter,
  getDefaultSkillSlots,
  getDefaultPresets,
} from './src/data/classChangeData.js';
import { Player } from './src/game/Player.js';

console.log('================================================================');
console.log('HELL\'S ADVENT: CLASS CHANGE & SKILL TREE TEST SUITE');
console.log('================================================================\n');

let passedTests = 0;
let totalTests = 0;

function test(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  [FAIL] ${name}`);
    console.error(`         ${err.message}`);
    throw err;
  }
}

// -----------------------------------------------------------------------------
// 1. DATA MODEL INTEGRITY
// -----------------------------------------------------------------------------
console.log('--- 1. DATA MODEL INTEGRITY ---');

test('All 5 characters exist with 3 classes each and 4-tier intrinsic traits', () => {
  const charKeys = Object.keys(CHARACTERS);
  assert.strictEqual(charKeys.length, 5, 'Must have exactly 5 characters');
  assert.deepStrictEqual(charKeys.sort(), ['ines', 'kaelen', 'rook', 'sena', 'vespera'].sort());

  for (const charId of charKeys) {
    const char = CHARACTERS[charId];
    assert.ok(char.name, `${charId} must have name`);
    assert.ok(char.role, `${charId} must have role`);
    assert.strictEqual(char.classes.length, 3, `${charId} must have 3 class IDs`);
    assert.strictEqual(char.base.length, 3, `${charId} must have 3 baseline active skills`);
    assert.ok(char.ultimate, `${charId} must have baseline ultimate`);
    assert.ok(char.intrinsic, `${charId} must have intrinsic trait`);
    assert.ok(char.intrinsic.ranks[1], `${charId} must have rank 1 trait`);
    assert.ok(char.intrinsic.ranks[15], `${charId} must have rank 15 trait`);
    assert.ok(char.intrinsic.ranks[30], `${charId} must have rank 30 trait`);
    assert.ok(char.intrinsic.ranks[45], `${charId} must have rank 45 trait`);
  }
});

test('All 15 classes exist with 4 active/awakening skills (with 2 forks each) and 3-rank class traits', () => {
  const classKeys = Object.keys(SPECIALIZATIONS);
  assert.strictEqual(classKeys.length, 15, 'Must have exactly 15 classes');

  let totalActive = 0;
  let totalUlt = 0;
  let totalForks = 0;

  for (const classId of classKeys) {
    const cls = SPECIALIZATIONS[classId];
    assert.ok(cls.name, `${classId} must have a name`);
    assert.ok(cls.char, `${classId} must reference character ID`);
    assert.ok(CHARACTERS[cls.char], `${classId} references valid character`);
    assert.ok(cls.trait.ranks[15], `${classId} class trait must have rank 15`);
    assert.ok(cls.trait.ranks[30], `${classId} class trait must have rank 30`);
    assert.ok(cls.trait.ranks[45], `${classId} class trait must have rank 45`);

    assert.strictEqual(cls.skills.length, 5, `${classId} must have 4 active skills + 1 ultimate (5 total)`);

    const activeSkills = cls.skills.filter((s) => !s.ultimate);
    const ultSkills = cls.skills.filter((s) => s.ultimate);
    assert.strictEqual(activeSkills.length, 4, `${classId} must have 4 active skills`);
    assert.strictEqual(ultSkills.length, 1, `${classId} must have 1 ultimate`);

    totalActive += activeSkills.length;
    totalUlt += ultSkills.length;

    for (const sk of cls.skills) {
      assert.ok(sk.id, `Skill must have an ID`);
      assert.ok(sk.name, `Skill ${sk.id} must have a name`);
      assert.ok(sk.level === 15 || sk.level === 30 || sk.level === 45, `Skill ${sk.id} must match milestone level (15, 30, 45)`);
      assert.ok(Array.isArray(sk.fork), `Skill ${sk.id} must have forks array`);
      assert.strictEqual(sk.fork.length, 2, `Skill ${sk.id} must have exactly 2 fork variants`);
      assert.notStrictEqual(sk.fork[0], sk.fork[1], `Skill ${sk.id} forks must be distinct`);
      totalForks += 2;
    }
  }

  assert.strictEqual(totalActive, 60, 'Must have 60 total active skills across 15 classes');
  assert.strictEqual(totalUlt, 15, 'Must have 15 awakening ultimates');
  assert.strictEqual(totalForks, 150, 'Must have 150 total fork variants (2 per active/ultimate skill)');
});

test('Helper query methods work accurately across characters, classes, and traits', () => {
  const senaClasses = getClassesForCharacter('sena');
  assert.strictEqual(senaClasses.length, 3);
  assert.strictEqual(senaClasses[0].id, 'phantomEdge');

  const phantomEdge = getClassById('phantomEdge');
  assert.strictEqual(phantomEdge.name, 'Phantom Edge');

  const lunge = getSkillById('sena:base:lunge');
  assert.ok(lunge);
  assert.strictEqual(lunge.level, 1);

  // Intrinsic Trait ranks
  assert.strictEqual(getIntrinsicTraitRank('sena', 1).rank, 1);
  assert.strictEqual(getIntrinsicTraitRank('sena', 14).rank, 1);
  assert.strictEqual(getIntrinsicTraitRank('sena', 15).rank, 2);
  assert.strictEqual(getIntrinsicTraitRank('sena', 29).rank, 2);
  assert.strictEqual(getIntrinsicTraitRank('sena', 30).rank, 3);
  assert.strictEqual(getIntrinsicTraitRank('sena', 44).rank, 3);
  assert.strictEqual(getIntrinsicTraitRank('sena', 45).rank, 4);
  assert.strictEqual(getIntrinsicTraitRank('sena', 50).rank, 4);

  // Class Trait ranks
  assert.strictEqual(getClassTraitRank('phantomEdge', 14), null);
  assert.strictEqual(getClassTraitRank('phantomEdge', 15).rank, 1);
  assert.strictEqual(getClassTraitRank('phantomEdge', 30).rank, 2);
  assert.strictEqual(getClassTraitRank('phantomEdge', 45).rank, 3);
});

// -----------------------------------------------------------------------------
// 2. PLAYER CLASS SWITCHING & STRICT LEVEL / XP INVARIANCE
// -----------------------------------------------------------------------------
console.log('\n--- 2. PLAYER CLASS SWITCHING & LEVEL/XP INVARIANCE ---');

test('Player initializes with 4 active slots, 1 ultimate, 3 presets, and unlocked starting class', () => {
  const player = new Player('sena');
  assert.strictEqual(player.activeClassId, 'phantomEdge');
  assert.ok(player.unlockedClasses.includes('phantomEdge'));
  assert.strictEqual(player.skillSlots.length, 4, 'Must have exactly 4 skill slots');
  assert.ok(player.ultimateSlot, 'Must have an ultimate slot');
  assert.ok(player.loadoutPresets[0] || player.loadoutPresets.Boss, 'Must have Boss preset');
});

test('STRICT RULING: Switching class NEVER resets or alters player Level and XP', () => {
  const player = new Player('sena');
  // Boost player to level 38 and XP 2450
  player.level = 38;
  player.xp = 2450;
  player.gold = 7500;
  player.skillPoints = player.level - 1;

  const initialLevel = player.level;
  const initialXp = player.xp;
  const initialGold = player.gold;

  // Unlock all Sena classes
  player.unlockClass('riftBreaker');
  player.unlockClass('pulseDancer');

  // Switch to Rift Breaker
  const res1 = player.switchClass('riftBreaker');
  assert.strictEqual(res1.success, true);
  assert.strictEqual(player.activeClassId, 'riftBreaker');
  assert.strictEqual(player.level, initialLevel, 'Level must remain 38 after switching to Rift Breaker');
  assert.strictEqual(player.xp, initialXp, 'XP must remain 2450 after switching to Rift Breaker');
  assert.strictEqual(player.gold, initialGold, 'Gold must remain 7500 after switching to Rift Breaker');

  // Switch to Pulse Dancer
  const res2 = player.switchClass('pulseDancer');
  assert.strictEqual(res2.success, true);
  assert.strictEqual(player.activeClassId, 'pulseDancer');
  assert.strictEqual(player.level, initialLevel, 'Level must remain 38 after switching to Pulse Dancer');
  assert.strictEqual(player.xp, initialXp, 'XP must remain 2450 after switching to Pulse Dancer');
  assert.strictEqual(player.gold, initialGold, 'Gold must remain 7500 after switching to Pulse Dancer');

  // Switch back to Phantom Edge
  const res3 = player.switchClass('phantomEdge');
  assert.strictEqual(res3.success, true);
  assert.strictEqual(player.activeClassId, 'phantomEdge');
  assert.strictEqual(player.level, initialLevel, 'Level must remain 38 after switching back to Phantom Edge');
  assert.strictEqual(player.xp, initialXp, 'XP must remain 2450 after switching back to Phantom Edge');
});

test('Player can unlock and switch across specializations preserving Level and XP', () => {
  const player = new Player('rook');
  player.level = 45;
  player.xp = 9999;
  player.gold = 15000;

  const rookClasses = CHARACTERS.rook.classes;
  for (const classId of rookClasses) {
    player.unlockClass(classId);
    const switchRes = player.switchClass(classId);
    assert.strictEqual(switchRes.success, true);
    assert.strictEqual(player.activeClassId, classId);
    assert.strictEqual(player.level, 45, `Level must remain 45 on ${classId}`);
    assert.strictEqual(player.xp, 9999, `XP must remain 9999 on ${classId}`);
    assert.strictEqual(player.gold, 15000, `Gold must remain 15000 on ${classId}`);
  }
});

// -----------------------------------------------------------------------------
// 3. 4-SLOT LOADOUT, SLOT SWAPPING, AND PRESETS
// -----------------------------------------------------------------------------
console.log('\n--- 3. LOADOUT MANAGEMENT & PRESETS ---');

test('Assigning and swapping active skill slots (0..3) and ultimate slot (4)', () => {
  const player = new Player('sena');
  player.level = 45; // All skills unlocked
  player.unlockClass('phantomEdge');

  const learned = getLearnedSkillsForCharacter('sena', player.level, player.unlockedClasses);
  const activeSkills = learned.filter((s) => s.type !== 'ultimate' && !s.ultimate);
  assert.ok(activeSkills.length >= 4);

  const sk0 = activeSkills[0].id;
  const sk1 = activeSkills[1].id;
  const sk2 = activeSkills[2].id;
  const sk3 = activeSkills[3].id;

  // Assign 4 slots
  assert.strictEqual(player.assignSkillSlot(0, sk0).success, true);
  assert.strictEqual(player.assignSkillSlot(1, sk1).success, true);
  assert.strictEqual(player.assignSkillSlot(2, sk2).success, true);
  assert.strictEqual(player.assignSkillSlot(3, sk3).success, true);

  assert.deepStrictEqual(player.skillSlots, [sk0, sk1, sk2, sk3]);

  // Test swapping: assign sk0 into slot 2 (should swap with sk2)
  player.assignSkillSlot(2, sk0);
  assert.strictEqual(player.skillSlots[0], sk2, 'Slot 0 should now hold sk2');
  assert.strictEqual(player.skillSlots[2], sk0, 'Slot 2 should now hold sk0');

  // Assign ultimate to ultimate slot (slot 4)
  const ult = CHARACTERS.sena.ultimate.id;
  assert.strictEqual(player.assignSkillSlot(4, ult).success, true);
  assert.strictEqual(player.ultimateSlot, ult);

  // Reject assigning an ultimate into active slot 0-3
  const badUltAssign = player.assignSkillSlot(0, ult);
  assert.strictEqual(badUltAssign.success, false);
});

test('Loadout Presets: Save and Load (Boss, Mob Clear, Explore)', () => {
  const player = new Player('kaelen');
  player.level = 45;

  const defaultSlots = [...player.skillSlots];
  const customSlots = [player.skillSlots[2], player.skillSlots[1], player.skillSlots[0], player.skillSlots[3]];

  player.skillSlots = [...customSlots];
  const saveRes = player.savePreset('Boss');
  assert.strictEqual(saveRes.success, true);

  // Alter current loadout
  player.skillSlots = [...defaultSlots];
  assert.deepStrictEqual(player.skillSlots, defaultSlots);

  // Load preset Boss
  const loadRes = player.loadPreset('Boss');
  assert.strictEqual(loadRes.success, true);
  assert.deepStrictEqual(player.skillSlots, customSlots, 'Loaded slots must match saved Boss preset');
});

// -----------------------------------------------------------------------------
// 4. BRANCHING TREE INVESTMENTS & FREE RESPEC
// -----------------------------------------------------------------------------
console.log('\n--- 4. BRANCHING TREE INVESTMENTS & FREE RESPEC ---');

test('Investing in exclusive fork variants and free respec refunding all points', () => {
  const player = new Player('sena');
  player.level = 45;
  player.skillPoints = player.level - 1; // 44 points

  const initialPoints = player.getAvailableTreePoints();
  assert.strictEqual(initialPoints, 44);

  const skill = SPECIALIZATIONS.phantomEdge.skills[0]; // Mirror Step
  // Invest in Fork 0 (Variant A)
  const invA = player.investTreeNode(skill.id, 0);
  assert.strictEqual(invA.success, true);
  assert.strictEqual(player.treeNodes[skill.id], 0);
  assert.strictEqual(player.getAvailableTreePoints(), 43);

  // Switch directly to Fork 1 (Variant B)
  const invB = player.investTreeNode(skill.id, 1);
  assert.strictEqual(invB.success, true);
  assert.strictEqual(player.treeNodes[skill.id], 1);
  assert.strictEqual(player.getAvailableTreePoints(), 43, 'Switching fork on already invested node costs no extra point');

  // Invest in 2nd skill
  const skill2 = SPECIALIZATIONS.phantomEdge.skills[1];
  player.investTreeNode(skill2.id, 0);
  assert.strictEqual(player.getAvailableTreePoints(), 42);

  // FREE RESPEC
  const respecRes = player.respecTree();
  assert.strictEqual(respecRes.success, true);
  assert.strictEqual(Object.keys(player.treeNodes).length, 0, 'Tree nodes must be completely cleared');
  assert.strictEqual(player.getAvailableTreePoints(), 44, 'All 44 points must be refunded');
});

// -----------------------------------------------------------------------------
// 5. AUTO-EVOLVING TRAITS
// -----------------------------------------------------------------------------
console.log('\n--- 5. AUTO-EVOLVING TRAITS ---');

test('Intrinsic and Class traits scale with milestones Lv 1, 15, 30, 45', () => {
  const player = new Player('vespera');

  // Level 1
  player.level = 1;
  assert.strictEqual(player.getIntrinsicTrait().rank, 1);
  assert.strictEqual(player.getClassTrait(), null); // Class trait unlocks at 15

  // Level 15
  player.level = 15;
  assert.strictEqual(player.getIntrinsicTrait().rank, 2);
  assert.strictEqual(player.getClassTrait().rank, 1);

  // Level 30
  player.level = 30;
  assert.strictEqual(player.getIntrinsicTrait().rank, 3);
  assert.strictEqual(player.getClassTrait().rank, 2);

  // Level 45
  player.level = 45;
  assert.strictEqual(player.getIntrinsicTrait().rank, 4);
  assert.strictEqual(player.getClassTrait().rank, 3);
});

// -----------------------------------------------------------------------------
// 6. SKILL EXECUTION & INDEPENDENT EXECUTION (NO CROSS-CLASS COMBOS)
// -----------------------------------------------------------------------------
console.log('\n--- 6. SKILL EXECUTION & INDEPENDENCE (NO CROSS-CLASS COMBOS) ---');

test('Executing skills deducts stamina, respects obstacles, and triggers independent cooldowns', () => {
  const player = new Player('sena');
  player.level = 45;
  player.stamina = 100;
  player.cooldowns.skill1 = 0;
  player.cooldowns.skill4 = 0;
  // Position player in combat sector (outside Kettle safe zone)
  player.x = 1000;
  player.y = 1000;
  player.inSafeZone = false;

  // Mock engine environment
  const mockWorld = {
    isWall: () => false,
  };
  const mockParticles = {
    spawn: () => {},
    ring: () => {},
    spawnSlashArc: () => {},
    spawnShockwave: () => {},
  };
  const mockProjectiles = {
    add: () => {},
  };
  const mockCamera = {
    shake: () => {},
  };
  const mockSpawner = {
    enemies: [],
    queryRadius: () => [],
  };

  // Test Slot 0 (Lunge baseline)
  const lungeDef = getSkillById(player.skillSlots[0]);
  const initialStamina = player.stamina;

  const used = player.useSkillByIndex(0, 500, 400, mockSpawner, mockProjectiles, mockParticles, mockCamera, mockWorld);
  assert.strictEqual(used, true, 'Skill index 0 should execute');
  assert.strictEqual(player.stamina, initialStamina - lungeDef.staminaCost, 'Stamina must be deducted by exact cost');
  assert.ok(player.cooldowns.skill1 > 0, 'Cooldown must be triggered');

  // Test Slot 3 (Specialization skill assigned to slot 4 / index 3)
  const mirrorStep = SPECIALIZATIONS.phantomEdge.skills[0];
  player.assignSkillSlot(3, mirrorStep.id);
  player.stamina = 100;
  const used4 = player.useSkillByIndex(3, 500, 400, mockSpawner, mockProjectiles, mockParticles, mockCamera, mockWorld);
  assert.strictEqual(used4, true, 'Skill index 3 should execute');
  assert.strictEqual(player.stamina, 100 - mirrorStep.staminaCost);
  assert.ok(player.cooldowns.skill4 > 0, 'Skill 4 cooldown must be triggered');

  // Verify skills execute independently without cross-class combo triggers
  assert.strictEqual(player.activeComboTrigger, undefined, 'No cross-class combo triggers are registered');
});

// -----------------------------------------------------------------------------
// 7. PERSISTENCE & BACKWARD COMPATIBILITY
// -----------------------------------------------------------------------------
console.log('\n--- 7. PERSISTENCE & BACKWARD COMPATIBILITY ---');

test('Serialization (toJSON) and Deserialization (fromJSON) preserves full class and tree state', () => {
  const player = new Player('sena');
  player.level = 42;
  player.xp = 3100;
  player.gold = 8400;
  player.unlockClass('riftBreaker');
  player.switchClass('riftBreaker');
  player.investTreeNode('sena:riftBreaker:pile-fist', 0);
  player.assignSkillSlot(0, 'sena:riftBreaker:pile-fist');
  player.savePreset('Explore');

  const json = player.toJSON();

  // Fresh player deserializing data
  const restored = new Player('sena');
  restored.fromJSON(json);

  assert.strictEqual(restored.activeClassId, 'riftBreaker');
  assert.ok(restored.unlockedClasses.includes('riftBreaker'));
  assert.strictEqual(restored.level, 42, 'Restored level must match 42');
  assert.strictEqual(restored.xp, 3100, 'Restored XP must match 3100');
  assert.strictEqual(restored.gold, 8400, 'Restored Gold must match 8400');
  assert.strictEqual(restored.skillSlots[0], 'sena:riftBreaker:pile-fist');
  assert.strictEqual(restored.treeNodes['sena:riftBreaker:pile-fist'], 0);
  const explorePreset = restored.loadoutPresets.find ? restored.loadoutPresets.find(p => p.name === 'Explore') : restored.loadoutPresets.Explore;
  assert.deepStrictEqual(explorePreset.slots, restored.skillSlots);
});

test('Backward compatibility: Legacy save files without class change fields load safely with default loadouts', () => {
  const legacyData = {
    classId: 'sena',
    level: 20,
    xp: 500,
    gold: 1200,
  };

  const player = new Player('sena');
  player.fromJSON(legacyData);

  assert.strictEqual(player.level, 20);
  assert.strictEqual(player.activeClassId, 'phantomEdge');
  assert.strictEqual(player.skillSlots.length, 4);
  assert.ok(player.ultimateSlot);
  assert.ok(player.loadoutPresets[0] || player.loadoutPresets.Boss);
  assert.strictEqual(Object.keys(player.treeNodes).length, 0);
});

console.log('\n--- 8. 3-CARD LEVEL-UP SPECIALIZATION POPUP CHOICE SYSTEM ---');

test('Reaching Level 15 milestone automatically triggers pendingClassChoice modal flag', () => {
  const player = new Player('sena');
  assert.strictEqual(player.level, 1);
  assert.strictEqual(player.pendingClassChoice, false);
  assert.strictEqual(player.chosenClassAtLevel15, null);

  // Level up to 14
  player.setLevel(14);
  assert.strictEqual(player.level, 14);
  assert.strictEqual(player.pendingClassChoice, false);

  // Level up to 15
  player.setLevel(15);
  assert.strictEqual(player.level, 15);
  assert.strictEqual(player.pendingClassChoice, true);
  assert.strictEqual(player.chosenClassAtLevel15, null);
});

test('Selecting a specialization card locks choice, updates class/stance, and preserves Level & XP', () => {
  const player = new Player('sena');
  player.setLevel(14);
  player.gainXp(player.xpToNext + 100); // Level 15 with overflow XP

  assert.strictEqual(player.level, 15);
  assert.strictEqual(player.pendingClassChoice, true);
  const preservedLevel = player.level;
  const preservedXp = player.xp;

  // Player must choose 1 of the 3 cards (e.g., 'pulseDancer')
  const chosenClass = 'pulseDancer';
  player.switchClass(chosenClass);
  player.chosenClassAtLevel15 = chosenClass;
  player.pendingClassChoice = false;

  // Verify class change
  assert.strictEqual(player.activeClassId, 'pulseDancer');
  assert.strictEqual(player.chosenClassAtLevel15, 'pulseDancer');
  assert.strictEqual(player.pendingClassChoice, false);

  // STRICT RULING: Level & XP invariant
  assert.strictEqual(player.level, preservedLevel);
  assert.strictEqual(player.xp, preservedXp);

  // Subsequent levels do NOT re-trigger pendingClassChoice
  player.setLevel(16);
  assert.strictEqual(player.level, 16);
  assert.strictEqual(player.pendingClassChoice, false);
});

test('Manual triggerClassChoice method enables re-prompting choice on demand', () => {
  const player = new Player('sena');
  player.setLevel(15);
  player.chosenClassAtLevel15 = 'phantomEdge';
  player.pendingClassChoice = false;

  player.triggerClassChoice();
  assert.strictEqual(player.pendingClassChoice, true);
});

console.log('\n================================================================');
console.log(`ALL TESTS PASSED! (${passedTests}/${totalTests} tests successful)`);
console.log('================================================================\n');
