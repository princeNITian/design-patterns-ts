/* Prototype Design Pattern */
/* Without Prottype */

type Enemy = {
  name: string;
  health: number;
  speed: number;
  abilities: string[];
};

function createEnemy(): Enemy {
  return {
    name: "Goblin",
    health: 100,
    speed: 5,
    abilities: ["slash", "dodge"],
  };
}

const enemyA = createEnemy();
const enemyB = createEnemy();