import { Boot } from './scenes/Boot';
import { Game as MainGame } from './scenes/Game';
import { MainMenu } from './scenes/MainMenu';
import { Preloader } from './scenes/Preloader';
import { AUTO, Game } from 'phaser';
import { UIScene } from './scenes/UIScene';
import { DataScene } from './scenes/DataScene';

//  Find out more information about the Game Config at:
//  https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const config = {
    type: AUTO,//렌더링 방식
    width: 1024,
    height: 786,//게임화면 크기
    parent: 'game-container',
    physics: {
        default: 'arcade', // 이게 있어야 this.physics를 쓸 수 있습니다!
        arcade: {
            gravity: { y: 500 }, // 탑다운 뷰라면 중력을 0으로 설정
            debug: true       // true로 바꾸면 캐릭터의 충돌 영역이 보입니다.
    }
},
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [// 배열의 0번째에 적힌 씬이 제일 먼저 실행됩니다.
        Boot,
        Preloader,
        MainMenu,
        MainGame,
        UIScene,
        DataScene,
    ]
   
};

const StartGame = (parent) => {

    return new Game({ ...config, parent });

}

export default StartGame;
