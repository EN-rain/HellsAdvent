import assert from 'node:assert';
import { Player } from './src/game/Player.js';
import { Enemy } from './src/game/Enemy.js';
import { World } from './src/game/World.js';
import { tacticalSystem } from './src/game/TacticalAI.js';
import { WORLD_CONFIG } from './src/data/config.js';

console.log('Testing Safe Zone Features: Enemy Vision Loss & Attack Prevention...');

const world = new World();
const player = new Player('sena');

// Kettle safe zone center is (3000, 3000), radius 430
player.x = 3000;
player.y = 3020;

// 1. Safe Zone Detection
console.log('1. Testing Safe Zone Detection...');
assert.strictEqual(player.isInSafeZone(world), true, 'Player at (3000, 3020) must be in safe zone');
assert.strictEqual(world.isInsideKettle(player.x, player.y), true);
player.update(0.016, {}, null, null, null, null, world);
assert.strictEqual(player.inSafeZone, true, 'player.inSafeZone must be true in Kettle');
console.log('   [PASS] Safe zone detection verified');

// 2. Attack Prevention in Safe Zone
console.log('2. Testing Attack & Skill Prevention in Safe Zone...');
const basicAtkResult = player.tryBasicAttack(3100, 3100);
assert.strictEqual(basicAtkResult, false, 'Basic attack MUST return false in safe zone');

const skill1Result = player.trySkill1(3100, 3100);
assert.strictEqual(skill1Result, false, 'Skill 1 MUST return false in safe zone');

const skill2Result = player.trySkill2(3100, 3100);
assert.strictEqual(skill2Result, false, 'Skill 2 MUST return false in safe zone');

const skill3Result = player.trySkill3(3100, 3100);
assert.strictEqual(skill3Result, false, 'Skill 3 MUST return false in safe zone');

const useSkill0Result = player.useSkillByIndex(0, 3100, 3100);
assert.strictEqual(useSkill0Result, false, 'useSkillByIndex(0) MUST return false in safe zone');

const ultResult = player.useUltimate(3100, 3100);
assert.strictEqual(ultResult, false, 'Ultimate MUST return false in safe zone');

const guardResult = player.toggleGuardStance();
assert.strictEqual(guardResult, false, 'Guard stance/secondary MUST return false in safe zone');

// Player should be immune to damage while in safe zone
const initialHp = player.hp;
const hitResult = player.takeDamage(100, 3000, 3000);
assert.strictEqual(hitResult, false, 'takeDamage MUST return false in safe zone');
assert.strictEqual(player.hp, initialHp, 'Player HP must not drop in safe zone');
console.log('   [PASS] All attacks and damage disabled in safe zone');

// 3. Enemy Vision & Unawareness
console.log('3. Testing Enemy Inability to See / Target Player in Safe Zone...');
const enemy = new Enemy();
enemy.active = true;
enemy.id = 'tinRat';
// Position enemy outside Kettle safe zone (e.g. at x: 3000, y: 2400 -> dist 600 from center)
enemy.x = 3000;
enemy.y = 2400;

const dirX = 0;
const dirY = 1;
const distToPlayer = 620;

// Test tactical steering with player in safe zone
const steering = tacticalSystem.computeSteering(enemy, player, dirX, dirY, distToPlayer, null, true);
assert.notStrictEqual(steering.role, 'CHASE', 'Enemy must NOT be in CHASE role when player is in safe zone');
assert(steering.role === 'UNAWARE' || steering.role === 'PATROL', `Expected UNAWARE or PATROL, got ${steering.role}`);
console.log(`   [PASS] Enemy steering role is '${steering.role}' instead of CHASE`);

// 4. Stepping Outside Safe Zone
console.log('4. Testing Transition Outside Safe Zone...');
// Move player outside Kettle (e.g. to Slab Town at 3000, 2000 -> dist 1000 from Kettle center)
player.x = 3000;
player.y = 2000;
assert.strictEqual(player.isInSafeZone(world), false, 'Player at (3000, 2000) is outside safe zone');
player.update(0.016, {}, null, null, null, null, world);
assert.strictEqual(player.inSafeZone, false, 'player.inSafeZone must be false outside Kettle');

// Attack works outside safe zone!
const outsideAtk = player.tryBasicAttack(3000, 1900);
assert.strictEqual(outsideAtk, true, 'Basic attack should be enabled outside safe zone');

// Enemy steering resumes chase when player is outside safe zone
const outsideSteering = tacticalSystem.computeSteering(enemy, player, 0, -1, 400, null, false);
assert.strictEqual(outsideSteering.role, 'CHASE', 'Enemy should resume CHASE when player is outside safe zone');
console.log('   [PASS] Attacks and enemy chase re-enabled outside safe zone');

console.log('\n======================================================');
console.log('ALL SAFE ZONE UNIT TESTS PASSED SUCCESSFULLY! (4/4)');
console.log('======================================================');
