import { Scene } from 'phaser';

export class UIScene extends Scene {
    constructor() {
        super('UIScene');
    }

    create() {
        // 1. 초기 데이터 가져오기
        const data = this.registry.get('playerData');

        // 2. 텍스트 배치 (좌측 상단)
        this.scoreText = this.add.text(20, 20, `점수: ${data.score}`, {
            fontFamily: 'Arial', fontSize: 24, color: '#ffffff'
        });

        this.livesText = this.add.text(20, 50, `목숨: ${data.lives}`, {
            fontFamily: 'Arial', fontSize: 24, color: '#ffffff'
        });

        // 3. [핵심] Registry 감시하기
        // playerData가 바뀔 때마다 자동으로 텍스트를 업데이트합니다.
        this.registry.events.on('changedata-playerData', (parent, value) => {
            this.scoreText.setText(`점수: ${value.score}`);
            this.livesText.setText(`목숨: ${value.lives}`);
        });
    }
}