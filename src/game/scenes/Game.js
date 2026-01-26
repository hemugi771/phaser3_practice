import { Scene } from 'phaser';

/*
let character;
let cursors;
let platform;
*/

//this.-> 씬 내에서 전역변수로 사용 가능.
//let / const -> 함수 내에서만 유효한 지역변수.
//this.registry->씬 간에 공유 가능한 전역변수.
//vite 같은 모듈 번들러 환경에서는 전역변수를 쓰지 않는 것이 좋음.
//대신 자바스크립트의 export/import 기능을 활용하는 것이 좋음.
//아니면 최상위 게임 객체에 this.로 변수를 담아놓고 꺼내 쓰는 법도 있음.

export class Game extends Scene
//phaser의 장면은 Phaser.scene을 상속받아 만들어짐.
{
    constructor ()
    {
        super('Game');//key라 함. 씬을 식별하기 위한 값
    }
    preload(){
         this.load.spritesheet("character",'assets/character.png',{
            frameWidth:32,
            frameHeight:50
        });
        this.load.spritesheet("byul",'assets/byul.png',{
            frameWidth:32,
            frameHeight:32
        });
        this.load.image("hemug", "assets/hemug.png");
        this.load.image("platform",'assets/platform.png');
        //외부 파일 혹은 에셋을 미리 불러오기 위한 작업 처리.
        //this.load.image("이름", "assets/name.png") 이런 식.
    }

    create ()
    {
        // 1. 애니메이션 설정 (300ms 간격 ≈ frameRate 3.3)
        this.anims.create({
            key: 'rabbit',
            frames: this.anims.generateFrameNumbers('character', { start: 0, end:1}),
            frameRate: 3.3, repeat: -1
        });
        this.anims.create({
            key: 'byul',
            frames: this.anims.generateFrameNumbers('byul', { start: 0, end:1}),
            frameRate: 2, repeat: -1
        });
        // 2. 캐릭터 생성 및 물리 설정
        this.character = this.physics.add.sprite(100, 700, 'character');//이미지를 추가해요.
        this.character.play('rabbit');
        this.character.setBodySize(35,50);//충돌 박스 크기 설정
        this.character.setBounce(0);//캐릭터의 탄성 설정

        //별 생성
        this.byul = this.physics.add.group();
        
        this.createByul(100, 400, 'byul1');
        this.createByul(400, 100, 'byul2');
        this.createByul(800, 250, 'byul3');
        this.physics.add.overlap(this.character, this.byul, this.collectByul, null, this);

        //적 생성
        this.hemug = this.physics.add.sprite(500, 400, 'hemug');
        this.hemug.setBodySize(50,32);
        this.hemug.setBounce(0);



        // 3. 바닥(플랫폼) 생성 및 물리 설정
        this.platforms = this.physics.add.staticGroup();
        for(let i=0;i<10;i+=1){
            this.platforms.create(i*20+10, 750, 'platform');
        }
        for(let i=0;i<10;i+=1){
            this.platforms.create(1024-(i*20+10), 750, 'platform');
        }
        for(let i=0;i<20;i+=1){
            this.platforms.create(240+(i*20+10), 650, 'platform');
        }
        for(let i=0;i<10;i+=1){
            this.platforms.create(650, 650-(i*20), 'platform');
        }
        for(let i=0;i<10;i+=1){
            this.platforms.create(240+(i*20+10), 160, 'platform');
        }
        for(let i=0;i<15;i+=1){
            this.platforms.create(540+(i*20+10), 300, 'platform');
        }

        this.movingplatforms = this.physics.add.group();

        for(let i=0;i<10;i+=1){
            const movplatform = this.movingplatforms.create(i*20+10, 550, 'platform');
            movplatform.setImmovable(true);
            movplatform.body.allowGravity = false;// 반복문 안에서 각각의 플랫폼에 대해 중력 비활성화
            movplatform.body.friction.x = 1; 
            movplatform.body.friction.y = 1;
        }

        
        this.tweens.add({
            targets: this.movingplatforms.getChildren(),
            y: '-=300', // Move to the up
            duration: 3000,
            ease:'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });

        // 4. 캐릭터와 바닥(플랫폼) 간의 충돌 처리 설정
        this.physics.add.collider(this.character, this.platforms);
        this.physics.add.collider(this.hemug, this.platforms);
        this.physics.add.collider(this.character, this.hemug, this.takeDamage, null, this);
        this.physics.add.collider(this.character, this.movingplatforms);

        this.hemug.direction = -1; // -1은 왼쪽, 1은 오른쪽
        // 5. 키보드 입력 도구 생성
        this.keys = this.input.keyboard.addKeys('W,A,S,D,SPACE');//키보드 입력을 받기 위한 도구 생성
        this.cameras.main.setBackgroundColor('#2d2d2d'); // 진한 회색으로 변경


        this.input.once('pointerdown', () => {

            this.scene.start('MainMenu');

        });
        const instructions = [
        '조작법:',
        'A / D : 좌우이동',
        'SPACE 홀드 : 점프',
        'W : 내려찍기'
        ];

    // 2. 텍스트 생성
    // x: 1000 (우측 끝 1024에서 24px 여백), y: 20 (상단에서 20px 여백)
     const infoText = this.add.text(1000, 20, instructions, {
        fontFamily: 'Arial',
        fontSize: '12pt', // 요청하신 12포인트
        color: '#ffffff',
        align: 'center',   // 텍스트 정렬 방향
       
        padding: { x: 10, y: 5 },     // 배경과 글자 사이의 여백
     });

     // 3. 우측 상단 정렬을 위한 기준점(Origin) 설정
     // x축을 1로 잡으면 (1000, 20) 좌표가 텍스트 박스의 우측 상단 끝이 됩니다.
        infoText.setOrigin(1, 0);

     // 4. [중요] 카메라가 움직여도 텍스트는 화면에 고정되게 함
        infoText.setScrollFactor(0);
        
     this.hemug.direction = -1;
     this.hemug.isTurning = false; // 방향 전환 중인지 체크하는 플래그
       this.scene.launch('DataScene');
        this.scene.launch('UIScene');
    }

    takeDamage(){
        let currentData = this.registry.get('playerData');
    
        // 2. 목숨 깎기
         currentData.lives -= 1;
    
        // 3. 바뀐 데이터 저장 (이때 UIScene의 리스너가 반응해서 화면을 바꿉니다)
        this.registry.set('playerData', currentData);

        if (currentData.lives <= 0) {
            // 목숨이 0이면 완전 초기화 (처음부터 다시 시작하고 싶을 때)
            // 이때는 registry를 지우거나, 아예 'MainMenu'로 보냅니다.
            this.registry.remove('playerData'); 
            this.registry.set('collectedStars', []);
            this.scene.start('MainMenu'); // 혹은 게임오버 씬
        } else {
            // 목숨이 남았으면 현재 맵만 재시작
            // registry는 유지되므로 BaseScene의 create문 내 'if' 덕분에 리셋되지 않습니다.
            this.scene.restart();
        }
    }

    createByul(x, y, byulname) {
        const collectedStars = this.registry.get('collectedStars') || [];
        const star = this.byul.create(x, y, byulname);
        star.starID = byulname; // 별의 고유 ID 설정
        star.play('byul');
        star.setBodySize(32, 32);
        star.body.allowGravity = false;
        if (collectedStars.includes(star.starID)) {
            star.disableBody(true, true); // 생성하자마자 없앱니다.
        }
    }

    collectByul(_, star) {
    // 먹은 별을 화면에서 제거 (물리 판정도 사라짐)
    star.disableBody(true, true);
        star.disableBody(true, true);

    // 현재까지 먹은 별들의 ID 목록을 가져옵니다. (없으면 빈 배열)
    let collectedStars = this.registry.get('collectedStars') || [];
    
    // 이 별의 ID를 목록에 추가 (star.starID는 아래 2번 단계에서 부여합니다)
    if (!collectedStars.includes(star.starID)) {
        collectedStars.push(star.starID);
    }
    
    // 다시 사물함(registry)에 저장
    this.registry.set('collectedStars', collectedStars);
    // Registry에서 점수 데이터 가져오기
    let data = this.registry.get('playerData');
    data.score += 100; // 별 하나당 100점

    // 바뀐 점수 저장 (저장하는 순간 UIScene의 텍스트가 바뀝니다)
    this.registry.set('playerData', data);

}


    update() {
            const {JustDown} = Phaser.Input.Keyboard;
        //함수 상단에 변수로 줄여서 사용하기도 함
        if (!this.character) return;

        if(!this.character.body.touching.down && JustDown(this.keys.S)){
            this.isSlamming = true; // 공격 상태 시작
            this.character.setVelocity(0, 0);      // 속도 0으로 고정
            this.character.body.allowGravity = false; // 중력 일시 정지

        // 2. 점멸 효과 (Tween 사용)
        // 0.2초 동안 캐릭터의 투명도(alpha)를 빠르게 조절하여 번쩍이는 효과를 줍니다.
            this.tweens.add({
            targets: this.character,
            alpha: 0,          
            duration: 50,        
            yoyo: true,          // 다시 원래대로
            repeat: 2            
        });

        // 3. 짧은 대기 후 아래로 발사!
        // 300ms(0.3초) 후에 실행될 함수를 예약합니다.
        this.time.delayedCall(200, () => {
            if (!this.character) return;
            
            this.character.body.allowGravity = true; // 중력 다시 켜기
            this.character.setVelocityY(1200);       // 더 강하게 내리꽂기

        });
        }

        if(this.character.body.touching.down && this.isSlamming){

            this.isSlamming = false;
            this.character.alpha = 1; // 투명도 원래대로 복구
            this.cameras.main.shake(100, 0.01);

        }
        if(!this.isSlamming){
          if (this.keys.A.isDown) {
            this.character.setVelocityX(-160);
           this.character.anims.play('rabbit', true);
           this.character.flipX = true;
       } 
       else if (this.keys.D.isDown) {
           this.character.setVelocityX(160);
           this.character.anims.play('rabbit', true);
              this.character.flipX = false;
       } 
       else {
          this.character.setVelocityX(0);
     }
    }
    
    // 1. 적이 움직일 속도 설정 (처음에는 왼쪽으로)
    
   const isOnGround = this.hemug.body.blocked.down || this.hemug.body.touching.down;
/*
    if (isOnGround) {
        // 앞쪽 바닥 체크 지점 (거리를 35로 넉넉히 벌립니다)
        const forwardX = this.hemug.x + (this.hemug.direction * 35);
        const belowY = this.hemug.y + 32;

        const bodies = this.physics.overlapRect(forwardX, belowY, 32, 32);
        const isFloorAhead = bodies.some(b => b.gameObject && 
            (b.gameObject === this.platforms || this.platforms.contains(b.gameObject)));

        // 낭떠러지/벽 감지 + "지금 방향 전환 중이 아닐 때만" 실행
        if ((this.hemug.body.blocked.left || this.hemug.body.blocked.right || !isFloorAhead) && !this.hemug.isTurning) {
            
            this.hemug.isTurning = true; // 잠금 시작
            this.hemug.direction *= -1;
            this.hemug.setFlipX(this.hemug.direction > 0);

            // 0.2초(200ms) 후에 다시 방향을 바꿀 수 있게 잠금 해제
            this.time.delayedCall(3000, () => {
                if (this.hemug) this.hemug.isTurning = false;
            });
        }

        this.hemug.setVelocityX(100 * this.hemug.direction);
    } else {
        this.hemug.setVelocityX(0);
    }
*/
    // 2. 벽에 부딪히면 반대 방향으로 전환
    if (this.hemug.body.blocked.left || this.hemug.body.touching.left) {
        this.hemug.direction = 1; // 오른쪽으로
        this.hemug.setFlipX(true);
    } else if (this.hemug.body.blocked.right || this.hemug.body.touching.right) {
        this.hemug.direction = -1; // 왼쪽으로
        this.hemug.setFlipX(false);
    }
    

        // 2. 점프 시작 (바닥에 닿아 있을 때 스페이스바를 누르면)
        /*JustDown은 눌렀을 때 한 번만 반응하게 하는 함수입니다.
        isDown은 누르고 있는 동안 계속 반응합니다.
         */
        if (JustDown(this.keys.SPACE) && this.character.body.touching.down) {
        // 일단 최대 점프 힘으로 솟구칩니다.
        this.character.setVelocityY(-350); 
       }

        // 3. 가변 점프의 핵심: 스페이스바를 뗐을 때 처리
        // 캐릭터가 위로 상승 중인데(velocity < 0) 스페이스바를 떼면(Up)
        if (this.keys.SPACE.isUp && this.character.body.velocity.y < 0) {
        // 위로 올라가는 속도를 빠르게 줄입니다. (0에 가깝게 만들거나 기존 속도의 50%로 감속)
        // 이 수치를 조절해서 점프의 감도를 정할 수 있습니다.
        this.character.setVelocityY(this.character.body.velocity.y * 0.35);
        }

        if (this.character.y > 768) {
            this.takeDamage();
         
        }
        
    }


}
