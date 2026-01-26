import { Scene } from 'phaser';

export class DataScene extends Scene {
    constructor() {
        super('DataScene');
    }


    create() {
        // Initialize player data
        if (!this.registry.has('playerData')) {
        this.registry.set('playerData', {
            score: 0,
            lives: 3,
            level: 1
        });
        }
    }

    getScore() {
        const playerData = this.registry.get('playerData');
        playerData.score += 1;
        this.registry.set('playerData', playerData);
        return playerData.score;
    }
    loseLife() {
        const playerData = this.registry.get('playerData');
        playerData.lives -= 1;
        this.registry.set('playerData', playerData);
        return playerData.lives;
    }
}