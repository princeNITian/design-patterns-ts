"use strict";
/* Prototype Design Pattern */
/* Without Prottype

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

*/
Object.defineProperty(exports, "__esModule", { value: true });
class Enemy {
    name;
    health;
    speed;
    abilities;
    constructor(name, health, speed, abilities) {
        this.name = name;
        this.health = health;
        this.speed = speed;
        this.abilities = abilities;
    }
    clone() {
        return new Enemy(this.name, this.health, this.speed, [...this.abilities]);
    }
}
const goblinTemplate = new Enemy("Goblin", 100, 5, ["slash", "dodge"]);
const enemyA = goblinTemplate.clone();
const enemyB = goblinTemplate.clone();
enemyA.health = 40;
enemyA.abilities.push("poison");
console.log(enemyA.health); // 40
console.log(enemyB.health); // 100
console.log(enemyB.abilities); // ["slash", "dodge"]
