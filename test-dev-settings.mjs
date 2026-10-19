import assert from 'node:assert';
import { Player } from './src/game/Player.js';
import { GameEngine } from './src/game/Engine.js';

console.log('Testing Dev Settings & Cheats Methods in Player and Engine...');

const player = new Player('sena');

// Initial checks
assert.strictEqual(player.gold, 120);
assert.strictEqual(player.level, 1);
assert.strictEqual(player.godmode, false);
assert.strictEqual(player.infiniteStamina, false);
assert.strictEqual(player.noCooldowns, false);
assert.strictEqual(player.oneHitKill, false);
assert.strictEqual(player.speedBoost, false);

// 1. Gold controls
console.log('1. Testing Gold Controls...');
player.setGold(0);
assert.strictEqual(player.gold, 0, 'setGold(0) should reset gold to 0');
player.addGold(5000);
assert.strictEqual(player.gold, 5000, 'addGold(5000) should set gold to 5000');
player.addGold(10000);
assert.strictEqual(player.gold, 15000, 'addGold(10000) should increase gold to 15000');
player.setGold(99999);
assert.strictEqual(player.gold, 99999, 'setGold(99999) should set exact gold to 99999');
player.setGold(0);
assert.strictEqual(player.gold, 0, 'setGold(0) should reset gold to 0');
console.log('   [PASS] Gold add & set passed');

// 2. Level & XP controls
console.log('2. Testing Level & XP Controls...');
const startingSkillPoints = player.skillPoints;
player.setLevel(15);
assert.strictEqual(player.level, 15, 'setLevel(15) should set level to 15');
assert(player.skillPoints > startingSkillPoints, 'Leveling up should award skill points');
assert(player.maxHp > 100, 'Max HP should scale with level');
assert.strictEqual(player.hp, player.maxHp, 'Player should be fully healed upon setLevel');

player.addLevel(5);
assert.strictEqual(player.level, 20, 'addLevel(5) should increase level to 20');

player.setLevel(50);
assert.strictEqual(player.level, 50, 'setLevel(50) should set level to 50 cap');
player.addLevel(5);
assert.strictEqual(player.level, 50, 'Level should clamp at 50');
console.log('   [PASS] Level up & clamp passed');

// 3. Skill points
console.log('3. Testing Skill Points...');
const curSp = player.skillPoints;
player.addSkillPoints(10);
assert.strictEqual(player.skillPoints, curSp + 10, 'addSkillPoints(10) should add 10 SP');
player.setSkillPoints(99);
assert.strictEqual(player.skillPoints, 99, 'setSkillPoints(99) should set SP to 99');
console.log('   [PASS] Skill points passed');

// 4. Godmode & Combat Cheats
console.log('4. Testing Combat Cheats...');
player.x = 1000;
player.y = 1000;
player.inSafeZone = false;
player.godmode = true;
const hpBefore = player.hp;
player.takeDamage(500);
assert.strictEqual(player.hp, hpBefore, 'Godmode should prevent damage');
player.godmode = false;
player.takeDamage(10);
assert(player.hp < hpBefore, 'Normal damage when godmode is off (after defense mitigation)');

// One hit kill
const baseAtk = player.atk;
player.oneHitKill = true;
player.recalculateStats();
assert.strictEqual(player.atk, 99999, 'One hit kill should boost atk to 99999');
player.oneHitKill = false;
player.recalculateStats();
assert.strictEqual(player.atk, baseAtk, 'Attack power should return to normal when one-hit kill is off');

// Refill HP and Stamina
player.hp = 10;
player.stamina = 5;
player.refillHealthAndStamina();
assert.strictEqual(player.hp, player.maxHp, 'HP should be restored to max');
assert.strictEqual(player.stamina, player.maxStamina, 'Stamina should be restored to max');

// Unlock all specializations
console.log('5. Testing Unlock All Specializations...');
assert(player.unlockedClasses.length < 15, 'Not all classes should be unlocked initially');
player.unlockAllSpecializations();
assert.strictEqual(player.unlockedClasses.length, 15, 'All 15 specializations should be unlocked');
console.log('   [PASS] Unlock all specializations passed');

// Supplies max
console.log('6. Testing Max Supplies...');
player.setSuppliesMax(99);
assert.strictEqual(player.supplies.gauzeRoll, 99);
assert.strictEqual(player.supplies.sugarTin, 99);
assert.strictEqual(player.supplies.lyeWash, 99);
assert.strictEqual(player.supplies.hotStew, 99);
assert.strictEqual(player.supplies.stimStick, 99);
console.log('   [PASS] Max supplies passed');

console.log('\nALL DEV SETTINGS UNIT TESTS PASSED!');
