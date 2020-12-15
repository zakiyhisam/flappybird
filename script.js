//Select Cvs evenys only work on 'mycanvas' id's.
const cvs= document.getElementById('mycanvas');
const ctx= cvs.getContext('2d');

//Game Var n Constant
let frames =0;
const DEGREE = Math.PI / 180;

//load sprite image from local file's image.
const sprite= new Image();
sprite.src= 'img/sprite.png';

//sound property
const SCORE_S = new Audio();
SCORE_S.src = "audio/sfx_point.wav";

const FLAP_S = new Audio();
FLAP_S.src = "audio/sfx_point.wav";

const HIT = new Audio();
HIT.src = "audio/sfx_hit.wav";

const SWOOSHING = new Audio();
SWOOSHING.src = "audio/sfx_swooshing.wav";

const DIE = new Audio();
DIE.src = "audio/sfx_die.wav";
//Game State object.
const state ={
    current : 0,
    getReady : 0,
    game : 1,
    over: 2,
}

//start button property
const startBtn = {
    x: 120,
    y: 263,
    w: 83,
    h: 29,
}

//game control function - to control the flow of the game state
cvs.addEventListener('click',function(evt){
    switch(state.current){
        case state.getReady:                            //onclick, current state=0 will change to 1
            state.current = state.game;
            SWOOSHING.play();
            break;
        case state.game:                                //game will run until finish. then break the state.
            bird.flap();
            FLAP_S.play();
            break;
        case state.over:
            let rect = cvs.getBoundingClientRect();
            let clickX = evt.clientX - rect.left;
            let clickY = evt.clientY - rect.top;

            //check on click start button
            if(clickX>= startBtn.x && clickX <= startBtn.x + startBtn.w && 
                clickY>= startBtn.y && clickY <= startBtn.y + startBtn.h){
                    pipes.reset();
                    bird.speedReset();
                    score.reset();
                    state.current = state.getReady;  //onclick, gameOver state will loop back to getReady state
                }
                       
            break;
    }
});

// generate lower Background object (building)
const bg={
    sX: 0,                                              //source image x position
    sY: 0,                                              //  "      "   y position
    w:  275,                                            //designated width of the local image that will be used
    h:  226,                                            //    "       height                "
    x:  0,                                              //desired x & y position to be place to the canvas. note that y= cvs.height - h is because cvs.height is the limit of the canvas. look from html id='mycanvas'.
    y:  cvs.height -226,
    //draw the image based on the position input above.
    draw: function(){                                               
        ctx.drawImage(sprite, this.sX,this.sY, this.w, this.h, this.x, this.y, this.w, this.h);                 //note that 2x code is written is because the image does not fit perfectly to the canvas(not enough width). this will add to the last postion of the width since (this.x+this.w).
        ctx.drawImage(sprite, this.sX,this.sY, this.w, this.h, this.x + this.w, this.y, this.w, this.h);

    }
}
//generate foreground object (brown ground)
const fg={
    sX: 276,
    sY: 0,
    w:  224,
    h:  112,
    x:  0,
    y:  cvs.height -112,

    dx:2,

    draw: function(){
        ctx.drawImage(sprite, this.sX,this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
        ctx.drawImage(sprite, this.sX,this.sY, this.w, this.h, this.x + this.w, this.y, this.w, this.h);

    },
    update: function(){
        if(state.current == state.game){
            this.x=(this.x -this.dx)%(this.w/2);
        }
    }
}
//create bird object
const bird={
    animation:[
        {sX: 276, sY: 112}, //the animation work as a looping birds position. e.g. pos 1,2,3. from pos 3 we have to go back to pos 2 first then pos 1 which why the pos 2 is written again after pos 3 is written.
        {sX: 276, sY: 139},
        {sX: 276, sY: 164},
        {sX: 276, sY: 139},
    ],
    x: 50,
    y: 150,
    w: 34,
    h:26,

    radius:12,
    frame : 0,

    gravity: 0.25,
    jump: 4.6,
    speed: 0,
    rotation: 0,

    draw : function(){
    
        let bird =this.animation[this.frame];  //this code will help changes the state of the birds according to frame of the birds.
        ctx.save();
        ctx.translate(this.x,this.y);
        ctx.rotate(this.rotation);
        ctx.drawImage(sprite, bird.sX, bird.sY, this.w, this.h, -this.w/2, -this.h/2, this.w, this.h);
        
        ctx.restore();
    },
    
    flap: function(){
        this.speed= -this.jump;
    },

    update: function(){
        //bird will flap slowly at the getReady state  #condition(?) (if yes):(if no).
        this.period = state.current == state.getReady ? 10 : 5;
        //increment frame by 1,each period
        this.frame += frames%this.period == 0? 1: 0;
        // the frame will go from 0 to 4 then we need to make it back to 0.
        this.frame = this.frame%this.animation.length;

        if(state.current== state.getReady){
                this.y =150; //reset position after the game is over and start again
                this.rotation = 0* DEGREE;
        
            }else{
            this.speed += this.gravity; //increase the birds fall speed to gravity
            this.y += this.speed; //this to make the birds fall 
            
            if(this.y + this.h/2 >= cvs.height -fg.h ){              //the bird will stop falling as hit hits the fg(foreground) and goes to gameOver state.
                this.y = cvs.height - fg.h - this.h/2;
                if(state.current == state.game){
                    state.current = state.over;
                    DIE.play();
                }
            }
            if(this.y + this.h/2 <= 12){              //the bird will stop falling as hit hits the fg(foreground) and goes to gameOver state.
                this.y = this.y+ this.h/2;
                if(state.current == state.game){
                    state.current = state.over;
                    DIE.play();
                }
            }

            //if the speed is greater than the jump, that mean the birds is falling down.
            if(this.speed>=this.jump){
                this.rotation = 90* DEGREE;
            }else{
                this.rotation = -25* DEGREE;
            }
        }

    },
    speedReset: function(){
        this.speed = 0;
    }

}

//create a get ready message
const getReady = {
    sX: 0,
    sY: 228,
    w: 173,
    h: 152,
    x: cvs.width/2 -173/2,
    y: 80,
    draw: function(){
        if(state.current == state.getReady){
        ctx.drawImage(sprite, this.sX,this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
        }
    }
}
//create a gameOver message
const gameOver = {
    sX: 175,
    sY: 228,
    w: 225,
    h: 202,
    x: cvs.width/2 -225/2,
    y: 90,
    draw: function(){
        if(state.current == state.over){
        ctx.drawImage(sprite, this.sX,this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
        }
    }
}

//pipes asset and movement
const pipes= {
    position:[],
    top: {
        sX: 553,
        sY: 0,
    },
    bottom:{
        sX: 502,
        sY: 0
    },
    
    w: 53,
    h: 400,
    gap: 85,
    maxYPos: -150,
    dx : 2,

    draw: function(){
        for(let i=0; i < this.position.length; i++){
            let p=this.position[i];

            let topYPos = p.y;
            let bottomYPos = p.y + this.h + this.gap;

            //top pipe
            ctx.drawImage(sprite, this.top.sX,this.top.sY, this.w, this.h, p.x, topYPos, this.w, this.h);

            //bottom pipe
            ctx.drawImage(sprite, this.bottom.sX,this.bottom.sY, this.w, this.h, p.x,bottomYPos, this.w, this.h);
            
        }
    },
    update: function(){
        if(state.current !== state.game)return;
        if(frames%100 == 0){
            this.position.push({
                x:cvs.width,
                y: this.maxYPos *(Math.random() + 1)
            });
        }
        for(let i = 0; i< this.position.length; i++){
            let p = this.position[i];

            
            let bottomPipeYPos = p.y + this.h + this.gap;

            //collision detection
            if(bird.x + bird.radius > p.x && bird.x - bird.radius < p.x+ this.w 
                && bird.y + bird.radius> p.y && bird.y -bird.radius< p.y + this.h){
                    state.current=state.over;
                    HIT.play();
                }
            if(bird.x + bird.radius > p.x && bird.x - bird.radius < p.x+ this.w 
                && bird.y + bird.radius> bottomPipeYPos && bird.y -bird.radius< bottomPipeYPos+ this.h){
                    state.current=state.over;
                    HIT.play();
                }
            p.x -= this.dx;
            //if the pipes go beyond the canvas, we remove from array
            if(p.x + this.w <= 0){
                this.position.shift();
                score.value += 1;
                SCORE_S.play();

                score.best = Math.max(score.value, score.best);
                localStorage.setItem("best",score.best);
            }
        }
    },
    reset : function(){
        this.position=[];
    }
}

//score 
const score= {
    best: parseInt(localStorage.getItem("best"))|| 0,
    value: 0,
    draw : function(){
        ctx.fillStyle = "#FFF";
        ctx.strokeStyle = "#000";

        if (state.current == state.game){
            ctx.lineWidth = 2;
            ctx.font ="35px Teko";
            ctx.fillText(this.value, cvs.width/2,50);
            ctx.strokeText(this.value,cvs.width/2, 50);

        }else if(state.current == state.over){
            //score value
           
            ctx.font ="25px Teko";
            ctx.fillText(this.value, 225,186);
            ctx.strokeText(this.value,225,186);
            //best score
            ctx.fillText(this.best, 225, 228);
            ctx.strokeText(this.best,225,228);
 
        
        }
    },
    reset: function(){
        this.value=0;
    }
}
//draw function
function draw(){
    ctx.fillStyle ="#70c5ce";
    ctx.fillRect(0,0,cvs.clientWidth,cvs.height);
    
    bg.draw();
    pipes.draw();
    fg.draw();
    bird.draw();
    getReady.draw();
    gameOver.draw();
    score.draw();
}

//update function
function update(){
    bird.update();
    fg.update();
    pipes.update();
}

//loop function
function loop(){
    update();
    draw();
    frames++;
    requestAnimationFrame(loop);
}
loop();