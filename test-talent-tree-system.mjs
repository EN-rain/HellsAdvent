import assert from 'node:assert';
import { Player } from './src/game/Player.js';
import { CLASS_TREES, getSpecTree } from './src/data/talentTreeData.js';
import { CHARACTERS, SPECIALIZATIONS } from './src/data/classChangeData.js';

console.log('================================================================');
console.log('HELL\'S ADVENT: DUAL TALENT TREE & STATS TEST SUITE');
console.log('================================================================\n');

// 1. DATA MODEL INTEGRITY
console.log('--- 1. DATA MODEL INTEGRITY ---');
const characterIds = ['sena', 'rook', 'ines', 'kaelen', 'vespera'];
for (const cid of characterIds) {
  const tree = CLASS_TREES[cid];
  assert.ok(tree, `Class tree exists for ${cid}`);
  assert.ok(tree.nodes.length >= 6, `${cid} class tree has at least 6 nodes`);

  // Ensure every node has id, name, type, shape, col, row, maxRank
  for (const n of tree.nodes) {
    assert.ok(n.id, `Node has ID: ${JSON.stringify(n)}`);
    assert.ok(n.name, `Node has name: ${n.id}`);
    assert.ok(['active', 'passive', 'choice'].includes(n.type), `Valid node type: ${n.type}`);
    assert.ok(['square', 'circle', 'octagon'].includes(n.shape), `Valid node shape: ${n.shape}`);
    assert.ok(n.col >= 0 && n.col <= 6, `Col within 0..6: ${n.col}`);
    assert.ok(n.row >= 0 && n.row <= 6, `Row within 0..6: ${n.row}`);
  }
}
console.log('  [PASS] All 5 characters have comprehensive Class Trees');

// Spec Trees
for (const [specId, specDef] of Object.entries(SPECIALIZATIONS)) {
  const specTree = getSpecTree(specId);
  assert.ok(specTree, `Spec tree exists for ${specId}`);
  assert.ok(specTree.nodes.length >= 8, `Spec tree has at least 8 nodes`);

  // Check awakening ultimate
  const ultNode = specTree.nodes.find(n => n.row === 6 && n.type === 'active');
  assert.ok(ultNode, `Spec ${specId} has Awakening Ultimate on row 6`);
}
console.log('  [PASS] All 15 Specializations have authentic Spec Trees');

// 2. TALENT INVESTMENT & STAT RECALCULATION
console.log('\n--- 2. TALENT INVESTMENT & STAT RECALCULATION ---');
const player = new Player('sena');
player.level = 45; // 44 available points
player.recalculateStats(false);

const initialAtk = player.atk;
const initialHp = player.maxHp;
const initialPoints = player.getAvailableTreePoints();
assert.strictEqual(initialPoints, 44);

// Invest in Row 0 Starter Active: Lunge
const lungeRes = player.investTalent('sena:base:lunge', 1, undefined, 'active');
assert.strictEqual(lungeRes.success, true);
assert.strictEqual(player.getAvailableTreePoints(), 43);

// Invest in Row 1 Passive: Iron Grip (+6 ATK per rank, max 2)
const ironGrip1 = player.investTalent('sena:class:iron-grip', 2, undefined, 'passive');
assert.strictEqual(ironGrip1.success, true);
assert.strictEqual(player.getAvailableTreePoints(), 42);
assert.strictEqual(player.atk, initialAtk + 6, 'Attack increased by +6 from Rank 1 Iron Grip');

// Rank 2 Iron Grip
const ironGrip2 = player.investTalent('sena:class:iron-grip', 2, undefined, 'passive');
assert.strictEqual(ironGrip2.success, true);
assert.strictEqual(player.getAvailableTreePoints(), 41);
assert.strictEqual(player.atk, initialAtk + 12, 'Attack increased by +12 from Rank 2 Iron Grip');

// Cannot exceed maxRank 2
const ironGrip3 = player.investTalent('sena:class:iron-grip', 2, undefined, 'passive');
assert.strictEqual(ironGrip3.maxed, true);
assert.strictEqual(player.getAvailableTreePoints(), 41, 'Max rank consumes no points');

console.log('  [PASS] Multi-rank passives scale stats and respect maxRank');

// 3. CHOICE NODES (VARIANT FORKS)
console.log('\n--- 3. CHOICE NODES (MUTUALLY EXCLUSIVE FORKS) ---');
// Invest in Tactical Stride choice node (choice 0: Momentum Rush)
const choice1 = player.investTalent('sena:class:choice-mobility', 1, 0, 'choice');
assert.strictEqual(choice1.success, true);
assert.strictEqual(player.getAvailableTreePoints(), 40);
assert.strictEqual(player.getSkillFork('sena:class:choice-mobility'), 0);

// Switch to Variant 1 (Ghost Step)
const choice2 = player.investTalent('sena:class:choice-mobility', 1, 1, 'choice');
assert.strictEqual(choice2.success, true);
assert.strictEqual(choice2.switched, true);
assert.strictEqual(player.getAvailableTreePoints(), 40, 'Switching fork costs 0 points');
assert.strictEqual(player.getSkillFork('sena:class:choice-mobility'), 1);

console.log('  [PASS] Choice nodes support initial investment & free fork switching');

// 4. REFUNDING TALENTS
console.log('\n--- 4. REFUNDING TALENTS ---');
// Refund Rank 2 of Iron Grip -> drops to Rank 1
const ref1 = player.refundTalent('sena:class:iron-grip');
assert.strictEqual(ref1.success, true);
assert.strictEqual(player.getAvailableTreePoints(), 41);
assert.strictEqual(player.atk, initialAtk + 6, 'ATK accurately decreased by 6 on partial refund');

// Refund choice node
const refChoice = player.refundTalent('sena:class:choice-mobility');
assert.strictEqual(refChoice.success, true);
assert.strictEqual(player.getAvailableTreePoints(), 42);
assert.strictEqual(player.treeNodes['sena:class:choice-mobility'], undefined);

console.log('  [PASS] Talent refunds restore points and recalculate stats');

// 5. FREE RESPEC
console.log('\n--- 5. FULL FREE RESPEC ---');
player.respecTree();
assert.deepStrictEqual(player.treeNodes, {});
assert.strictEqual(player.getAvailableTreePoints(), 44);
assert.strictEqual(player.atk, initialAtk, 'Stats fully restored to base on respec');

console.log('  [PASS] Full Free Respec cleanly resets all tree nodes and stats');

console.log('\n================================================================');
console.log('ALL DUAL TALENT TREE TESTS PASSED! (5/5)');
console.log('================================================================');
