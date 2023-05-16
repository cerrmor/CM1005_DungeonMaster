/*I chose to add more then 2 of the possible extensions to my Game project. However, I am only going to talk about adding sound files and enemy’s. All sound and texture tiles were available via a creative commons licence.

Using available open source sound files with creative commons licences, I added background music, and sounds for when the character dies, collects a gem, falls in a hole, and when the level is completed. In adding music to my game, I found it difficult to place the music play logic in the correct locations. I also found it necessary to add some controlling logic to make sure the sound only played at the time it was supposed to and the number of times it was supposed to. I really enjoyed adding the sound files though, as it really made the game come together and feel more immersive when played I also struggle with an update to google crome that didnt allow sound file to play unless an interaction from the user was detected. It sometimes conflicted with my game loading properly.

Using the tutorial lecture I added an enemy constructor function to my game. Adding enemies to my game was a lot of fun, it added an extra dynamic risk that changed the game. I enjoyed adding logic to make the enemy’s jump over the pits, and it was good practice debugging this, when it didn't perform as expected. It was also good to practice the collision detection as it was necessary to change it as the shape of my enemy changed*/

//charicter location veriables
var gameChar_x;
var gameChar_y;
var floorPos_y;
var scrollPos;
var gameChar_world_x;

//bool veriables
var isLeft;
var isRight;
var isFalling;
var isPlummeting;

//array veriables
var clouds;
var mountains;
var trees;
var collectables;
var canyons;
var flagpole;
var platformTexture;
var platform
var enemies;

//object of basic game stats
var gameStats;

// global sound veriables
var jumpSound;
var fallingSound;
var collectItemSound;
var backgroundSound;
var backgroundSoundIsLooping = false;
var flagIsReached;
var flagIsReachedPlayed = false;
var failed;
var failedToLive = false;
var enemyDeath;
var enemyKilled = false;

//global image veriables
var background;
var groundTextures = [];
var ground;
var scenery = [];
var decorations;

function preload()
{
    //loads the background image and ground textures
    background = loadImage('assets/png/BG/BG.png');
    for(var i = 0; i < 6; i++)
    {
        groundTextures[i] = loadImage('assets/png/tiles/'+ i + '.png');
    }
    
    //adds scenery images
    for(var i = 0; i < 13; i++)
    {
        scenery[i] = loadImage('assets/png/Object/'+ i + '.png')
    }
    
    soundFormats('mp3','wav');
    
    //plays on loop for the game theam song
    backgroundSound = loadSound('assets/background.mp3')
    backgroundSound.setVolume(0.1);
    
    //the sound made when the charicter jumps
    jumpSound = loadSound('assets/Jump2.wav');
    jumpSound.setVolume(0.1);
    
    //only plays when the charicter falls in a canyon
    fallingSound = loadSound('assets/falling.wav');
    fallingSound.setVolume(0.1);
    
    //only plays when a gem is collected
    collectItemSound = loadSound('assets/collect.wav');
    collectItemSound.setVolume(0.05);
    
    //only plays when the castle is reached
    flagIsReached = loadSound('assets/endOfLevel.wav');
    flagIsReached.setVolume(0.1);
    
    //only plays when gameover happens
    failed = loadSound('assets/died.wav');
    failed.setVolume(0.1);
    
    //only plays when the charicter is killed by a spider
    enemyDeath = loadSound('assets/enemyDeath.wav');
    enemyDeath.setVolume(0.4);

}

function setup()
{
    
	createCanvas(1024, 576);
    floorPos_y = height * 3/4;
	
    //object containing charaicter stats
    gameStats = {lives: 3, maxLives: 3, gameScore:0};
    
    //builds the background arry only when the game starts
    backgroundArray();
    
    //start of game mechanics.
    startGame();
}

function startGame ()
{
    gameChar_x = width/2;
	gameChar_y = floorPos_y;
    
    //logic to reset the music veriables at the start of game call so they only play once 
    flagIsReachedPlayed = false;
    failedToLive = false;
    enemyKilled = false;
    
    //logic for resetting gems when the charicter has died
    if(gameStats.lives <= 2)
    {
        for(var i = 0; i < collectables.length; i++)
        {
            collectables[i].resetCollectable();
        }
    }
    
    //logic to start the background music after gameover
    if(!backgroundSoundIsLooping)
    {
        backgroundSound.loop();
        backgroundSoundIsLooping = true;
    }


	// Variable to control the background scrolling.
	scrollPos = 0;

	// Variable to store the real position of the gameChar in the game world. Needed for collision detection.
	gameChar_world_x = gameChar_x - scrollPos;

	// Boolean variables to control the movement of the game character.
	isLeft = false;
	isRight = false;
	isFalling = false;
	isPlummeting = false;
    
    //builds the arrays of level object.(enemies, platforms...)
    arrayBuilder();
}

function draw()
{
    //draws the background, platforms and collectables
    drawBackground();
    
    // Draw game character.
	drawGameChar();
    
    //draws some bushes and rocks to the front of the level to give a feeling of depth.
    push();
    translate(scrollPos,0);
    for(var i = 0; i < decorations.length; i++)
    {
        decorations[i].display();
    }
    pop();
    
    //draws the score counter on the screen
    push();
    fill(0);
    stroke(255);
    textSize(20);
    text("Score: " + gameStats.gameScore, 20,20);
    noStroke();
    pop();
  
    //checks if the charaicter dies
    for(var i = 0; i < canyons.length; i++)
    {
        if(isPlummeting)
        {
            canyons[i].checkPlayerDie(gameChar_world_x, gameChar_y);
                   
        }
    }
    
    //draws life tokens to the screen
    push();
    fill(0);
    stroke(255);
    textSize(20);
    text("lives: ", 770, 50);
    noStroke();
    
    for(var i = 0; i < gameStats.lives; i++)
    {
        lifeToken(i);
    }
    pop();
    
    //end of game logic
    //game over logic
    if(gameStats.lives <= -1)
    {
        backgroundSound.stop();
        backgroundSoundIsLooping = false;
        push();
        stroke(255);
        fill(0);
        textSize(50);
        textAlign(CENTER,CENTER);

        text("GAME OVER!!",512,288);
        text("Final Score =" + gameStats.gameScore + "/" + collectables.length, 512, 288 + 40);
        text("Press Space Bar to Continue",512, 288 + 80);
        noStroke();
        pop();
            
        if(!failedToLive)
        {
            failed.play();
            failedToLive = true;
        }
        return;
    }
    //reached the castle logic
    else if(flagpole[0].isReached)
    {
        push();
        stroke(255);
        fill(0);
        textSize(50);
        textAlign(CENTER,CENTER);

        text("Congratulations Level Complete!!",512,288);
        text("Final Score =" + gameStats.gameScore + "/" + collectables.length, 512, 288 + 40);
        text("Press Space Bar to Continue",512, 288 + 80);
        noStroke();
        pop();
        if(!flagIsReachedPlayed)
        {
            flagIsReached.play();
            flagIsReachedPlayed = true;
        }
           
        return; 
    }

	// Logic to make the game character move or the background scroll.
	if(isLeft)
	{
        if(gameChar_x > width * 0.2)
		{
			gameChar_x -= 5;
		}
		else
		{
			scrollPos += 5;
		}
	}

	if(isRight)
	{
		if(gameChar_x < width * 0.8)
		{
			gameChar_x  += 5;
		}
		else
		{
			scrollPos -= 5; // negative for moving against the background
		}
	}

	// Logic to make the game character rise and fall.
    //adds gravity
    //logic for platform behaviour
    
    if (gameChar_y < floorPos_y)
    {
        var isContact = false;
        for(var i = 0; i < platforms.length; i++)
        {
            if(platforms[i].checkContact(gameChar_world_x, gameChar_y) == true)
            {
                isContact = true;
                isFalling = false;
                break;
            }
        }
        if(isContact == false)
        {
            gameChar_y += 2.5;
            isFalling = true;
        }
    }
    else if (!isPlummeting)
    {
        isFalling = false;
        gameChar_y = floorPos_y;
    }
    
	// Update real position of gameChar for collision detection.
	gameChar_world_x = gameChar_x - scrollPos;
}


// ---------------------
// Key control functions
// ---------------------

function keyPressed()
{
    // if statements to control the animation of the character when
	// keys are pressed.

	//detects if the left arrow kep is pressed
    
    if(keyCode == 37)
    {
        isLeft = true;
    }
    
    //detects if the right arrow is pressed
    
    else if (keyCode == 39)
    {
        isRight = true;
    }
    
    //detects if the spacebar is pressed and if the charaicter is on the ground or a platform
    
    if (keyCode == 32 && gameChar_y == floorPos_y || keyCode == 32 && !isFalling && !isPlummeting)
    {
        jumpSound.play();
        isFalling = true;
        gameChar_y = gameChar_y - 100;
    }
    if (gameStats.lives <= -1 && keyCode == 32 ||flagpole[0].isReached && keyCode == 32)
    {
        gameStats.lives = 3;
        startGame();
    }

}

function keyReleased()
{
    //detects if the left arrow is released
    if (keyCode == 37)
    {
        isLeft = false;
    }
    //detects if the right arrow is released
    else if (keyCode == 39)
    {
        isRight = false;
    }

}


// ------------------------------
// Game character render function
// ------------------------------

// Function to draw the game character.
function drawGameChar()
{
	// draw game character
	
    //draws the charicter jumping to the left
    if(isLeft && isFalling)
	{
        //head
        fill(255, 205, 148);
        ellipse(gameChar_x, gameChar_y - 50, 20, 20);
        fill(0);
        ellipse(gameChar_x - 4, gameChar_y - 48, 5, 5);
    
    
        //explorer hat
        fill(210, 180, 40)
        ellipse(gameChar_x, gameChar_y - 62, 30, 5);
        arc(gameChar_x, gameChar_y - 62, 25, 25, -PI, 0, CHORD);
        noFill();
        stroke(180,160,20);
        arc(gameChar_x, gameChar_y - 62, 15, 25, -PI, 0, OPEN);
        line(gameChar_x, gameChar_y - 62 , gameChar_x, gameChar_y - 71);
        noStroke();
        
        //body
        fill(210, 180, 40);
        rect(gameChar_x - 10, gameChar_y - 40, 20, 25, 10, 10, 3, 10);
        ellipse(gameChar_x - 2, gameChar_y - 23, 20, 20);
        
        //arms
        noStroke();
        fill(180,160,20);
        rect(gameChar_x - 10, gameChar_y - 36, 15, 6, 0, 3, 3, 0);
        rect(gameChar_x - 12, gameChar_y - 40, 5, 10, 0, 0, 0, 3);
        fill(255, 205, 148);
        ellipse(gameChar_x - 9, gameChar_y - 41, 5, 5);
        
        //Legs/feet
        fill(139, 69, 19);
        rect(gameChar_x - 11, gameChar_y - 15, 20, 6, 0, 0, 3, 0);
        rect(gameChar_x - 12, gameChar_y - 15, 6, 10);
        rect(gameChar_x - 2, gameChar_y - 12, 7, 10);
        rect(gameChar_x, gameChar_y - 7, 10, 5);
        fill(0);
        rect(gameChar_x - 15, gameChar_y - 5, 9, 5);
        rect(gameChar_x + 7, gameChar_y - 7 , 5, 9);
        
    }
    //draws the charicter jumping to the right
    else if(isRight && isFalling)
    {
        //head
        fill(255, 205, 148);
        ellipse(gameChar_x, gameChar_y - 50, 20, 20);
        fill(0);
        ellipse(gameChar_x + 4, gameChar_y - 48, 5, 5);
        
        //explorer hat
        fill(210, 180, 40)
        ellipse(gameChar_x, gameChar_y - 62, 30, 5);
        arc(gameChar_x, gameChar_y - 62, 25, 25, -PI, 0, CHORD);
        noFill();
        stroke(180,160,20);
        arc(gameChar_x, gameChar_y - 62, 15, 25, -PI, 0, OPEN);
        line(gameChar_x, gameChar_y - 62 , gameChar_x, gameChar_y - 71);
        noStroke();
        
        //body
        fill(210, 180, 40);
        rect(gameChar_x - 10, gameChar_y - 40, 20, 25, 10, 10, 10, 3);
        ellipse(gameChar_x + 2, gameChar_y - 23, 20, 20);
        
        //arms
        noStroke();
        fill(180,160,20);
        rect(gameChar_x - 5, gameChar_y - 36, 15, 6, 3, 0, 0, 3);
        rect(gameChar_x + 8, gameChar_y - 40, 5, 10, 0, 0, 3, 0);
        fill(255, 205, 148);
        ellipse(gameChar_x + 10, gameChar_y - 41, 5, 5);
        
        //Legs/feet
        fill(139, 69, 19);
        rect(gameChar_x - 9, gameChar_y - 15, 20, 6, 0, 0, 0, 3);
        rect(gameChar_x + 5, gameChar_y - 15, 6, 10);
        rect(gameChar_x - 6, gameChar_y - 12, 7, 10);
        rect(gameChar_x - 10, gameChar_y - 7, 10, 5);
        fill(0);
        rect(gameChar_x + 5, gameChar_y - 5, 9, 5);
        rect(gameChar_x - 13, gameChar_y - 7, 5, 9);
        
    }
    //draws the charicter walking to the left
	else if(isLeft)
	{
        //Head
        fill(255, 205, 148);
        ellipse(gameChar_x, gameChar_y - 55, 20, 20);
        fill(0);
        ellipse(gameChar_x - 4, gameChar_y - 53, 3, 3);
        
        
        //explorer hat
        fill(210, 180, 40)
        ellipse(gameChar_x, gameChar_y - 60, 30, 5);
        arc(gameChar_x, gameChar_y - 60, 25, 25, -PI, 0, CHORD);
        noFill();
        stroke(180,160,20);
        arc(gameChar_x, gameChar_y - 60, 15, 25, -PI, 0, OPEN);
        line(gameChar_x, gameChar_y - 60, gameChar_x, gameChar_y - 71);
        
        //body
        noStroke();
        fill(210, 180, 40);
        rect(gameChar_x - 10, gameChar_y - 45, 20, 25, 10, 10, 3, 10);
        ellipse(gameChar_x - 2, gameChar_y - 28, 20, 20);
        
        //arms
        fill(180,160,20);
        rect(gameChar_x, gameChar_y - 42, 6, 10, 3, 3, 0, 0);
        rect(gameChar_x - 4, gameChar_y - 32, 10, 6);
        fill(255, 205, 148);
        ellipse(gameChar_x - 5, gameChar_y - 30, 5, 5);
        
        //Legs/feet
        fill(139, 69, 19);
        rect(gameChar_x - 11, gameChar_y - 20, 20, 6, 0, 0, 3, 0);
        rect(gameChar_x - 12, gameChar_y - 20, 6, 10);
        rect(gameChar_x - 2, gameChar_y - 17, 7, 15);
        fill(0);
        rect(gameChar_x - 15, gameChar_y - 10, 9, 5);
        rect(gameChar_x - 4, gameChar_y - 5, 9, 5);
        
        
    }
    //draws the charicter walking to the right
	else if(isRight)
	{
        //Head
        fill(255, 205, 148);
        ellipse(gameChar_x, gameChar_y - 55, 20, 20);
        fill(0);
        ellipse(gameChar_x + 4, gameChar_y - 53, 3, 3);
        
        //explorer hat
        fill(210, 180, 40)
        ellipse(gameChar_x, gameChar_y - 60, 30, 5);
        arc(gameChar_x, gameChar_y - 60, 25, 25, -PI, 0, CHORD);
        noFill();
        stroke(180,160,20);
        arc(gameChar_x, gameChar_y - 60, 15, 25, -PI, 0, OPEN);
        line(gameChar_x, gameChar_y - 60, gameChar_x, gameChar_y - 71);
        
        //body
        noStroke();
        fill(210, 180, 40);
        rect(gameChar_x - 10, gameChar_y - 45, 20, 25, 10, 10, 10, 3);
        ellipse(gameChar_x + 2, gameChar_y - 28, 20, 20);
        
        //arms
        fill(180,160,20);
        rect(gameChar_x - 5, gameChar_y - 42, 6, 10, 3, 3, 0, 0);
        rect(gameChar_x - 5, gameChar_y - 32, 10, 6);
        fill(255, 205, 148);
        ellipse(gameChar_x + 5, gameChar_y - 30, 5, 5);
    
        //Legs/feet
        fill(139, 69, 19);
        rect(gameChar_x - 9, gameChar_y - 20, 20, 6, 0, 0, 0, 3);
        rect(gameChar_x + 5, gameChar_y - 20, 6, 10);
        rect(gameChar_x - 6, gameChar_y - 17, 7, 15);
        fill(0);
        rect(gameChar_x + 5, gameChar_y - 10, 9, 5);
        rect(gameChar_x - 6, gameChar_y - 5, 9, 5);
        
        
	}
    //draws the charaicter jumping facing forward also used for falling
	else if(isFalling || isPlummeting)
	{
        //Head
        fill(255, 205, 148);
        ellipse(gameChar_x, gameChar_y - 50, 20, 20);
        fill(0);
        ellipse(gameChar_x - 3, gameChar_y - 48, 5, 5);
        ellipse(gameChar_x + 3, gameChar_y - 48, 5, 5);
        
        //body
        fill(210, 180, 40);
        rect(gameChar_x - 10, gameChar_y - 40, 20, 25, 10, 10, 10, 10);
        ellipse(gameChar_x, gameChar_y - 23, 22, 22);
        //buttons
        stroke(0);
        point(gameChar_x, gameChar_y - 35);
        point(gameChar_x, gameChar_y - 30);
        point(gameChar_x, gameChar_y - 25);
        point(gameChar_x, gameChar_y - 20);
        //arms
        noStroke();
        rect(gameChar_x - 13, gameChar_y - 43, 5, 10, 0, 0, 0, 3);
        rect(gameChar_x + 8, gameChar_y - 43, 5, 10, 0, 0, 3, 0);
        fill(255, 205, 148);
        ellipse(gameChar_x - 10, gameChar_y - 43, 5, 5);
        ellipse(gameChar_x + 10, gameChar_y - 43, 5, 5);
        
        //Legs/feet
        fill(139, 69, 19);
        rect(gameChar_x - 8, gameChar_y - 15, 16, 4);
        rect(gameChar_x - 8, gameChar_y - 12, 7, 5);
        rect(gameChar_x + 1, gameChar_y - 12, 7, 5);
        fill(0);
        rect(gameChar_x - 10, gameChar_y - 7, 9, 3);
        rect(gameChar_x + 1, gameChar_y - 7, 9, 7);
        
        //explorer hat
        fill(210, 180, 40)
        ellipse(gameChar_x, gameChar_y - 62, 30, 5);
        arc(gameChar_x, gameChar_y - 62, 25, 25, -PI, 0, CHORD);
        noFill();
        stroke(180,160,20);
        arc(gameChar_x, gameChar_y - 62, 15, 25, -PI, 0, OPEN);
        line(gameChar_x, gameChar_y - 62 , gameChar_x, gameChar_y - 71);
        
        
	}
    //draws the charicter standing facing forward
	else
	{
        //Head
        fill(255, 205, 148);
        ellipse(gameChar_x, gameChar_y - 55, 20, 20);
        fill(0);
        ellipse(gameChar_x - 2, gameChar_y - 53, 3, 3);
        ellipse(gameChar_x + 2, gameChar_y - 53, 3, 3);
        
        //body
        fill(210, 180, 40);
        rect(gameChar_x - 10, gameChar_y - 45, 20, 25, 10, 10, 10, 10);
        ellipse(gameChar_x, gameChar_y - 28, 22, 22);
        stroke(0);
        point(gameChar_x, gameChar_y - 40);
        point(gameChar_x, gameChar_y - 35);
        point(gameChar_x, gameChar_y - 30);
        point(gameChar_x, gameChar_y - 25);
        
        //arms
        noStroke();
        rect(gameChar_x - 13, gameChar_y - 42, 5, 10, 3, 0, 0, 0);
        rect(gameChar_x + 8, gameChar_y - 42, 5, 10, 0, 3, 0, 0);
        fill(255, 205, 148);
        ellipse(gameChar_x - 10, gameChar_y - 32, 5, 5);
        ellipse(gameChar_x + 10, gameChar_y - 32, 5, 5);
        
        //Legs/feet
        fill(139, 69, 19);
        rect(gameChar_x - 8, gameChar_y - 20, 16, 4);
        rect(gameChar_x - 8, gameChar_y - 17, 7, 15);
        rect(gameChar_x + 1, gameChar_y - 17, 7, 15);
        fill(0);
        rect(gameChar_x - 10, gameChar_y - 5, 9, 5);
        rect(gameChar_x + 1, gameChar_y - 5, 9, 5);
        
        //explorer hat
        fill(210, 180, 40)
        ellipse(gameChar_x, gameChar_y - 60, 30, 5);
        arc(gameChar_x, gameChar_y - 60, 25, 25, -PI, 0, CHORD);
        noFill();
        stroke(180,160,20);
        arc(gameChar_x, gameChar_y - 60, 15, 25, -PI, 0, OPEN);
        line(gameChar_x, gameChar_y - 60, gameChar_x, gameChar_y - 71);
        
    }
}

// ---------------------------
// Background render functions
// ---------------------------

function drawBackground()
{
    //a background image for depth of game.
    image(background,0,0,width,floorPos_y);
    
    //a tinted rectangle to lower the brightness of the background
    fill(200,200,200,150);
    rect(0,0,width,floorPos_y);

	noStroke();
    
    //a tinted rectangle to match the ground colour to the canyon colour
	fill(100,155,255);
	rect(0, floorPos_y, width, height/4); 
	fill(50,50,50,100)
    rect(0, floorPos_y, width, height/4); 
    
    

	//allows the background to scroll past giving the impreshion of movement
    push();
    translate(scrollPos,0);
    
    //draws the ground texture to the screen
    for(var i = 0; i < ground.length; i++)
    {
        ground[i].display();
    }
    
    // Draws the even numbers of the array of clouds to the background
    for(var i = 0; i < clouds.length; i+=2)
    {
        clouds[i].draw();
        
        //lets the clouds drift accross the sky
        clouds[i].update();
    }
	
    // Draws the even numbers of the array of mountains as a second background layer.
    for(var i = 0; i < mountains.length; i+=2)
    {
        mountains[i].draw();
    }
    
    //draws the odd numbers of the cloud array as a 3rd layer of background to give more depth.
    for(var i = 1; i < clouds.length; i+=2)
    {
        clouds[i].draw();
        
        //lets the clouds drift accross the sky
        clouds[i].update();
    }
    
    // Draws the odd numbers of the mountain array as a 4th layer of background.
    for(var i = 1; i < mountains.length; i+=2)
    {
        mountains[i].draw();
    }
	
    // Draw trees.
    for(var i = 0; i < trees.length; i++)
    {
        trees[i].display();
    }
            
    // Draw Platforms
    for(var i = 0; i < platforms.length; i++)
    {
       platforms[i].draw(); 
    }
    
    //draws the texture on the platforms
    for(var i = 0; i < platformTexture.length; i++)
    {
        platformTexture[i].display();
    }
	
    // Draw canyons.
    for (var i = 0; i < canyons.length; i++)
    {
        canyons[i].draw();
        
        //checks if the charaicter is over the canyon and falling
        canyons[i].checkCanyon (gameChar_world_x, gameChar_y);
    }
	
    // Draw collectable items.
    for (var i = 0; i < collectables.length; i++)
    {
        //only draws the gems if they havent been collected yet.
        if(!collectables[i].isFound)
        {
            collectables[i].draw();
            collectables[i].checkCollectable (gameChar_world_x, gameChar_y);
        }
    }
    
    //Draws the end point of the level
    
    //logic call to determin if the end of level has been reached
    if(!flagpole[0].isReached)
    {
        flagpole[0].checkFlagpole(gameChar_world_x);
    }
    flagpole[0].drawFlagpole();
    
    //Draws the enemy/enemies to the screen
    for(var i = 0; i < enemies.length; i++)
    {
        enemies[i].draw();
        
        var isContact = enemies[i].checkContact(gameChar_world_x, gameChar_y);
        
        //logic for touching an enemy
        if(isContact)
        {
            if(gameStats.lives > -1 && !enemyKilled && !flagpole[0].isReached)
            {
                enemyDeath.play();
                enemyKilled = true;
                gameStats.lives -= 1;
               if(gameStats.lives > -1)
                {
                    startGame();
                }
                break;
            }
        }
        
        //logic for an enemy reaching a canyon
        for(var j = 0; j < canyons.length; j++)
        {
            var shouldJump = enemies[i].checkCanyon(canyons[j],floorPos_y);
            if(shouldJump && enemies[i].currentY == enemies[i].y)
            {
                enemies[i].jump = true;
            }
            
        }
    }

    pop();
   
}

//builds the array of all the objects
function arrayBuilder()
{
//    //builds the array of decoritive objects
    if(gameStats.lives == gameStats.maxLives)
    {
        decorations = [];
        decorations.push(new CreateBackground(150, floorPos_y - 57, 0, 0, scenery[0]));
        decorations.push(new CreateBackground(-1100, floorPos_y - 57, 0, 0, scenery[1]));
        decorations.push(new CreateBackground(4880, floorPos_y - 57, 0, 0, scenery[1]));
        decorations.push(new CreateBackground(6282, floorPos_y - 57, 0, 0, scenery[0]));
        decorations.push(new CreateBackground(500, floorPos_y - 40, 0, 0, scenery[2]));
        decorations.push(new CreateBackground(7000, floorPos_y - 40, 0, 0, scenery[2]));
        decorations.push(new CreateBackground(1000, floorPos_y - 40, 0, 0, scenery[3]));
        decorations.push(new CreateBackground(-500, floorPos_y - 40, 0, 0, scenery[3]));
        decorations.push(new CreateBackground(2750, floorPos_y - 47, 0, 0, scenery[9]));
        decorations.push(new CreateBackground(6000, floorPos_y - 47, 0, 0, scenery[9]));
        
    }
  
    //build the array of trees only if the lives are = maxlives
    if(gameStats.lives == gameStats.maxLives)
    {
        trees = [];
        for(var i = 0; i < 27; i++)
        {
            if(i < 5)
            {
                trees.push(new CreateBackground(int(random(-1200,108)), floorPos_y - 230, 230, 230, scenery[11]));
                trees.push(new CreateBackground(int(random(-1200,108)), floorPos_y - 230, 230, 230, scenery[12]));
            }
            else if(i < 6)
            {
                trees.push(new CreateBackground(int(random(458,504)), floorPos_y - 230, 230, 230, scenery[11]));
                trees.push(new CreateBackground(int(random(308,504)), floorPos_y - 230, 230, 230, scenery[12]));
            }
            else if( i < 8)
            {
                trees.push(new CreateBackground(int(random(764,1000)), floorPos_y - 230, 230, 230, scenery[11]));
                trees.push(new CreateBackground(int(random(764,1148)), floorPos_y - 230, 230, 230, scenery[12]));
            }
            else if( i < 13)
            {
                trees.push(new CreateBackground(int(random(1300,2400)), floorPos_y - 230, 230, 230, scenery[11]));
                trees.push(new CreateBackground(int(random(1300,2400)), floorPos_y - 230, 230, 230, scenery[12]));
            }
            else if( i < 18)
            {
                trees.push(new CreateBackground(int(random(2400,3550)), floorPos_y - 230, 230, 230, scenery[11]));
                trees.push(new CreateBackground(int(random(2400,3550)), floorPos_y - 230, 230, 230, scenery[12]));
            }
            else if( i < 20)
            {
                trees.push(new CreateBackground(int(random(3850,4850)), floorPos_y - 230, 230, 230, scenery[11]));
                trees.push(new CreateBackground(int(random(3850,4850)), floorPos_y - 230, 230, 230, scenery[12]));
            }
            else if( i < 27)
            {
                trees.push(new CreateBackground(int(random(5150,7950)), floorPos_y - 230, 230, 230, scenery[11]));
                trees.push(new CreateBackground(int(random(5150,7950)), floorPos_y - 230, 230, 230, scenery[12])); 
            }
        }
    }
    
    //builds the cloud array 
    clouds =[];
    for(var i = 0; i < 50; i++)
    {
        clouds.push(createClouds(int(random(-2000,8000)),
                                 int(random(-50,70)),
                                 0));
    }
    
    //only builds the mountain array when the game has begun anew aka the lives are = to maxlives
    if(gameStats.lives == gameStats.maxLives)
    {
        mountains = [];
        for(var i = 0; i < 25; i++)
        {
            var placement = createMountains(int(random(-1200,8000)),
                                            floorPos_y,
                                            int(random(-50,50)));
            mountains.push(placement);
        }
    }
    
    //only builds the collectables array when the game starts or lives = maxlives
    if(gameStats.lives == gameStats.maxLives)
    {
        collectables = [];
        
        // builds random gems accross the level
        for(var i = 0; i < 25; i++)
        {
            collectables.push(new CreateCollectable(int(random(-1200, 7500) + random(10, 20)), floorPos_y - int(random(60, 100)), 30, false));
        }
        
        //builds 25 gems on the secret platform at the left side of the level
        for(var i = 0; i < 5; i++)
        {
            for(var j = 0; j < 5; j++)
            {
                collectables.push(new CreateCollectable(-1400 + 30 * i, floorPos_y - 30 * j, 30, false));
            }
        }
    }
    
    //builds the canyon array
    canyons = [];
    canyons.push(new Canyon(-1600,floorPos_y,500,false,));
    canyons.push(new Canyon(308,floorPos_y,150,false));
    canyons.push(new Canyon(714,floorPos_y,150,false));
    canyons.push(new Canyon(1248,floorPos_y,150,false));
    canyons.push(new Canyon(2550,floorPos_y,150,false));
    canyons.push(new Canyon(3852,floorPos_y,150,false));
    canyons.push(new Canyon(5026, floorPos_y, 300, false));
    
    //builds the platform array
    platforms = [];
    platforms.push(createPlatforms(-1400, floorPos_y - 10, 200,color(157, 193, 131)));
    platforms.push(createPlatforms(333, floorPos_y -75, 100, color(130)));
    platforms.push(createPlatforms(739, floorPos_y -75, 100, color(130)));
    platforms.push(createPlatforms(1273, floorPos_y -75, 100, color(130)));
    platforms.push(createPlatforms(5051, floorPos_y -75, 100, color(130)));
    platforms.push(createPlatforms(5201, floorPos_y -75, 100, color(130)));
    
    //builds the array of enemys
    enemies = [];
    enemies.push(new Enemy(-1000, floorPos_y - 10, 2200, color(255,0,0)));
    enemies.push(new Enemy(2000, floorPos_y - 10, 2200, color(0,0,255)));
    enemies.push(new Enemy(5000, floorPos_y - 10, 2000, color(0,255,255)));
    enemies.push(new Enemy(6000, floorPos_y - 10, 2200, color(255,0,255)));
    
    //allows the game score to reset whenever start game is called
    gameStats.gameScore = 0;
    
    //end of level object
    flagpole = []
    flagpole.push(buildEndOfLevel(8000,floorPos_y,false));
}

//builds the array of the ground texture
function backgroundArray ()
{
    //stors the platform textures to an array
    platformTexture = [];
    
    //platform 1 skin
    platformTexture.push(new CreateBackground(329, floorPos_y - 75, 55, 37.2,groundTextures[3]));
    platformTexture.push(new CreateBackground(384, floorPos_y - 75, 55, 37.2,groundTextures[5]));
    
    //platform 2 skin
    platformTexture.push(new CreateBackground(735, floorPos_y - 75, 55, 37.2,groundTextures[3]));
    platformTexture.push(new CreateBackground(790, floorPos_y - 75, 55, 37.2,groundTextures[5]));
    
    //platform 3 skin
    platformTexture.push(new CreateBackground(1269, floorPos_y - 75, 55, 37.2,groundTextures[3]));
    platformTexture.push(new CreateBackground(1324, floorPos_y - 75, 55, 37.2,groundTextures[5]));
    
    //platform 4 skin
    platformTexture.push(new CreateBackground(5047, floorPos_y - 75, 55, 37.2,groundTextures[3]));
    platformTexture.push(new CreateBackground(5102, floorPos_y - 75, 55, 37.2,groundTextures[5]));
    
    //platform 5 skin
    platformTexture.push(new CreateBackground(5197, floorPos_y - 75, 55, 37.2,groundTextures[3]));
    platformTexture.push(new CreateBackground(5252, floorPos_y - 75, 55, 37.2,groundTextures[5]));
    
    
    //stors the ground texture to an array
    ground = [];
    var x = -1100
    for (var i = 0;i < 59; i++)
    {
        var d = i * 128;
        if(x + d == -1100)
        {
            ground.push(new CreateBackground(x + d, floorPos_y, 0, height/4, groundTextures[0]));
        }
        else if (-1100 < (x + d) && (x + d) < 180)
        {
            ground.push(new CreateBackground(x + d, floorPos_y, 0, height/4, groundTextures[1]));
        }
        else if (x + d == 180)
        {
            ground.push(new CreateBackground(x + d, floorPos_y, 0, height/4, groundTextures[2])); 
        }
        else if(x + d == 308)
        {
            ground.push(new CreateBackground(458, floorPos_y, 0, height/4, groundTextures[0]));
            ground.push(new CreateBackground(x + d + 556, floorPos_y, 0, height/4, groundTextures[0]));
            ground.push(new CreateBackground(x + d + 278, floorPos_y, 0, height/4, groundTextures[2]));
        }
        else if(308 < x + d && x + d < 564)
        {
            ground.push(new CreateBackground(x + d + 556, floorPos_y, 0, height/4, groundTextures[1]));
            
        }
        else if(x + d == 564)
        {
            ground.push(new CreateBackground(x + d + 556, floorPos_y, 0, height/4, groundTextures[2]));
            ground.push(new CreateBackground(x + d + 834, floorPos_y, 0, height/4, groundTextures[0]));
        }
        else if(564 < x + d && x + d < 1588)
        {
            ground.push(new CreateBackground(x + d + 834, floorPos_y, 0, height/4, groundTextures[1]));
        }
        else if(x + d == 1588)
        {
            ground.push(new CreateBackground(x + d + 1112, floorPos_y, 0, height/4, groundTextures[0]));
            ground.push(new CreateBackground(x + d + 834, floorPos_y, 0, height/4, groundTextures[2]));
        }
        else if(1588 < x + d && x + d < 2612)
        {
            ground.push(new CreateBackground(x + d + 1112, floorPos_y, 0, height/4, groundTextures[1]));
        }
        else if( x + d == 2612)
        {
            ground.push(new CreateBackground(x + d + 1112, floorPos_y, 0, height/4, groundTextures[2]));
            ground.push(new CreateBackground(x + d + 1390, floorPos_y, 0, height/4, groundTextures[0]));
        }
        else if(2612 < x + d && x + d < 3508)
        {
            ground.push(new CreateBackground(x + d + 1390, floorPos_y, 0, height/4, groundTextures[1]));
        }
        else if(x + d == 3508)
        {
            ground.push(new CreateBackground(x + d + 1390, floorPos_y, 0, height/4, groundTextures[2]));
            ground.push(new CreateBackground(x + d + 1818, floorPos_y, 0, height/4, groundTextures[0]));
        }
        else if(3508 < x + d && x + d < 8000)
        {
            ground.push(new CreateBackground(x + d + 1818, floorPos_y, 0, height/4, groundTextures[1]));
        }    
    }
}

//used for drawing background images to the screen
function CreateBackground (x, y, width, height, img)
{
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.img = img;
    
    this.display = function()
    {
        image(this.img, this.x, this.y,this.width, this.height);
    }
}

// Factory function to draw cloud objects.
function createClouds(xPos,yPos,size)
{
    var c = {
        
        x: xPos,
        y: yPos,
        size: size,
    
        draw: function()
        {
            fill(255);
            
            ellipse(this.x + 200, 
                    this.y + 170, 
                    this.size + 80, 
                    this.size + 80);
            
            ellipse(this.x + 230, 
                    this.y + 150, 
                    this.size + 100, 
                    this.size + 90);
            
            ellipse(this.x + 260, 
                    this.y + 170, 
                    this.size + 80, 
                    this.size + 80);
            
            ellipse(this.x + 230, 
                    this.y + 180, 
                    this.size + 80, 
                    this.size + 80);
            
            ellipse(this.x + 270, 
                    this.y + 175, 
                    this.size + 80, 
                    this.size + 80);
            
            ellipse(this.x + 275, 
                    this.y + 160, 
                    this.size + 80, 
                    this.size + 80);
            
            ellipse(this.x + 285, 
                    this.y + 170, 
                    this.size + 80, 
                    this.size + 80);
            
        },
                
        update: function()
        {
            this.x += 0.5;
            if(this.x == 8200)
            {
                this.x = -2000;
            }
        }
    }
    return c;
}
// factory function to draw mountains objects.
function createMountains(xPos,yPos,mountainSize)
{
    var m = 
    {
        x: xPos,
        y: yPos,
        size: mountainSize,
        
        draw: function ()
        {
            //tall mountain
            fill(150,150,150);
            triangle((this.x + 500) - this.size,
                     this.y,
                     (this.x + 650),
                     (this.y - 332) - this.size,
                     (this.x + 800) + this.size,
                     this.y);

            //snow cap tall mountain
            fill(245);
            triangle((this.x + 627) - this.size/1.7,
                     (this.y - 282),
                     (this.x + 650),
                     (this.y - 332) - this.size,
                     (this.x + 673) + this.size/1.7,
                     (this.y - 282));
            //medium mountain
            fill(200,200,200);
            triangle((this.x + 350) - this.size,
                     this.y,
                     (this.x + 500),
                     (this.y - 182) - this.size,
                     (this.x + 800) + this.size,
                     this.y);
            //small mountain
            fill(220,220,220);
            triangle((this.x + 300) - this.size,
                     this.y,
                     (this.x + 400),
                     (this.y - 82) - this.size,
                     (this.x + 450) + this.size,
                     this.y);
        }
    }
    
    return m;
}

// Factory function to draw trees objects.
function createTrees(xPos,yPos)
{
    var t ={
        x: xPos,
        y: yPos,
        draw: function ()
        {
            //Tree trunk
            fill(120,100,40);
            stroke(80);

            quad(this.x,this.y, this.x + 20, this.y - 150, this.x + 35, this.y - 150, this.x + 55, this.y);
            fill(100,80,20);

            //shadow on the trunk to give the appearance of 3d pollygon
            quad(this.x,this.y, this.x + 20, this.y - 150, this.x + 15, this.y - 150, this.x + 20, this.y);

            //Tree Branches
            fill(0,155,0);
            stroke(130);

            //lower branches of the tree
            triangle(this.x + 20, -200/2 + this.y + 50,
                    this.x + 20, -200/2 + this.y - 112,
                    this.x + 130, -200/2 + this.y + 50);

            //upper branches of the tree
            triangle(this.x + 25, -200/2 + this.y - 32,
                    this.x + 25, -200/2 + this.y - 200,
                    this.x + 110, -200/2 + this.y - 32);

            //shadowed branches to give 3d appearance
            fill(0,135,0);

            //lower branches
            triangle(this.x - 70, -200/2 + this.y + 50,
                    this.x + 20, -200/2 + this.y - 112,
                    this.x + 20, -200/2 + this.y + 50);

            //upper branches
            triangle(this.x - 50, -200/2 + this.y - 32,
                    this.x + 25, -200/2 + this.y - 200,
                    this.x + 25, -200/2 + this.y - 32);
            noStroke();
            
        }
    }
    
    return t;
}
// ---------------------------------
// Canyon render and check functions
// ---------------------------------

// Constructor function to draw canyon objects.
function Canyon(x, y, width, died)
{
    this.x = x;
    this.y = y;
    this.width = width;
    this.died = died;
    
    this.draw = function()
    {
        //canyon blue fill
        fill(100,155,255);
        rect(this.x, this.y, this.width, 144);

        //canyon rocks
        fill(120,100,40);
        triangle(this.x, 576,
                 this.x + 30, 500,
                 this.x + 40, 576);
        triangle(this.x + 30, 576,
                 this.x + 50, 520,
                 this.x + 70, 576);
        triangle((this.width - 40) + this.x, 576,
                 (this.width - 30) + this.x, 480,
                 this.width + this.x, 576);
        triangle((this.width - 100) + this.x, 576,
                 (this.width - 60) + this.x, 540,
                 this.width + this.x, 576);

        //canyon shadow
        fill(50,50,50,100);
        rect(this.x, this.y, this.width, 144);
        
        
    }

    // Function to check character is over a canyon.

    this.checkCanyon = function(gc_x,gc_y)
    {
        if (gc_x > this.x 
            && gc_x < this.x + this.width 
            && gc_y >= this.y)
        {
            isPlummeting = true;
            gameChar_y += 5;

            //restricts motion when falling in pit
            isLeft = false;
            isRight = false;

        }
    }
    
    //function to check if the player has died in a canyon
    this.checkPlayerDie = function(gc_x, gc_y)
    {
        if(gameStats.lives >= 0 && this.died == true && gc_y >= 576)
        {
            startGame();
        }
        else if(gc_x > this.x 
                && gc_x < this.x + this.width 
                && gc_y >= this.y 
                && this.died == false)
        {
            gameStats.lives -= 1;
            fallingSound.play();
            this.died = true;
        }
    }
}
// ----------------------------------
// Collectable items render and check functions
// ----------------------------------

//Constructor function to draw collectable objects.
function CreateCollectable(xPos,yPos,size,isFound)
{
    this.x = xPos;
    this.y = yPos;
    this.size = size;
    this.isFound = isFound;
    
    this.draw = function()
    {
        stroke(0);
        fill(255, 0, 0);
        ellipse(this.x,
                this.y,
                this.size,
                this.size);

        fill(207,181,59);
        stroke(255,233,0);
        ellipse(this.x,
                this.y,
                this.size*(2/3),
                this.size*(2/3));

        fill(255,233,0);
        ellipse(this.x,
                this.y,
                this.size*(1/6),
                this.size/2);
        noStroke();
    }

    // Function to check character has collected an item.

    this.checkCollectable = function(gc_x,gc_y)
    {
        if(dist(gc_x, 
                gc_y, 
                this.x, 
                this.y) <= this.size)
        {
            this.isFound = true;
            gameStats.gameScore += 1;
            collectItemSound.play();
        }
        else if(dist(gc_x, 
                gc_y - 20, 
                this.x, 
                this.y) <= this.size)
        {
            this.isFound = true;
            gameStats.gameScore += 1;
            collectItemSound.play();
        }
        else if(dist(gc_x, 
                gc_y - 40, 
                this.x, 
                this.y) <= this.size)
        {
            this.isFound = true;
            gameStats.gameScore += 1;
            collectItemSound.play();
        }
    }
    
    this.resetCollectable = function()
    {
        this.isFound = false;
    }
}

//the function that builds what the end point of the level looks like
function buildEndOfLevel(xPos, yPos, isReached)
{
    var f ={
        x: xPos,
        y: yPos,
        isReached: isReached,
        
        drawFlagpole: function()
        {
            push();

            fill(0);

            stroke(12);

            arc(this.x, this.y - 215, 25, 25, 0, PI, CHORD);
            fill(126,132,133);
            rect(this.x - 150 + 37.5,this.y - 135,225,35);
            rect(this.x - 150 + 37.5 + 28.125,this.y - 170,168.75,35);
            rect(this.x - 150 + 37.5 +28.125 + 21.1,this.y - 205, 126.56,35);
            rect(this.x - 150,this.y - 100,300,100);
            fill(0);
            rect(this.x - 37.5, this.y - 90, 75,90);

            if(this.isReached)
            {          
                noStroke();
                fill(255, 150, 0);
                beginShape();
                    vertex(this.x - 12, this.y - 215);
                    vertex(this.x - 3, this.y - 235);
                    vertex(this.x, this.y - 230);
                    vertex(this.x + 3, this.y - 220);
                    vertex(this.x + 5, this.y - 230);
                    vertex(this.x + 8, this.y - 220 );
                    vertex(this.x + 10, this.y - 225);
                    vertex(this.x + 12, this.y - 215);
                endShape(CLOSE);

                backgroundSound.stop();
                backgroundSoundIsLooping = false;

            }

            pop();
        },

        checkFlagpole: function(gc_x)
        {
            var d = abs(gc_x - this.x);

            if (d < 15)
            {
                this.isReached = true;   
            }
        }
    }
    
    return f;
}

//the function that draws the life token to the screen
function lifeToken(livesDisplayed)
{
    
	//this function draws a charaicter image as a life token
    noStroke();
    //Head
    fill(255, 205, 148);
    ellipse(850 + 40 * livesDisplayed, 80 - 50, 20, 20);
    fill(0);
    ellipse(850 + 40 * livesDisplayed - 3, 80 - 48, 5, 5);
    ellipse(850 + 40 * livesDisplayed + 3, 80 - 48, 5, 5);
    
    //body
    fill(210, 180, 40);
    rect(850 + 40 * livesDisplayed - 10, 80 - 40, 20, 25, 10, 10, 10, 10);
    ellipse(850 + 40 * livesDisplayed, 80 - 23, 22, 22);
    //buttons
    stroke(0);
    point(850 + 40 * livesDisplayed, 80 - 35);
    point(850 + 40 * livesDisplayed, 80 - 30);
    point(850 + 40 * livesDisplayed, 80 - 25);
    point(850 + 40 * livesDisplayed, 80 - 20);
    //arms
    noStroke();
    rect(850 + 40 * livesDisplayed - 13, 80 - 43, 5, 10, 0, 0, 0, 3);
    rect(850 + 40 * livesDisplayed + 8, 80 - 43, 5, 10, 0, 0, 3, 0);
    fill(255, 205, 148);
    ellipse(850 + 40 * livesDisplayed - 10, 80 - 43, 5, 5);
    ellipse(850 + 40 * livesDisplayed + 10, 80 - 43, 5, 5);
    
    //Legs/feet
    fill(139, 69, 19);
    rect(850 + 40 * livesDisplayed - 8, 80 - 15, 16, 4);
    rect(850 + 40 * livesDisplayed - 8, 80 - 12, 7, 5);
    rect(850 + 40 * livesDisplayed + 1, 80 - 12, 7, 5);
    fill(0);
    rect(850 + 40 * livesDisplayed - 10, 80 - 7, 9, 3);
    rect(850 + 40 * livesDisplayed + 1, 80 - 7, 9, 7);
    
    //explorer hat
    fill(210, 180, 40)
    ellipse(850 + 40 * livesDisplayed, 80 - 62, 30, 5);
    arc(850 + 40 * livesDisplayed, 80 - 62, 25, 25, -PI, 0, CHORD);
    noFill();
    stroke(180,160,20);
    arc(850 + 40 * livesDisplayed, 80 - 62, 15, 25, -PI, 0, OPEN);
    line(850 + 40 * livesDisplayed, 80 - 62 , 850 + 40 * livesDisplayed, 80 - 71);

}

// Factory function for constructing platforms
function createPlatforms(x,y,length,colour)
{
    var p = {
        x: x,
        y: y,
        length: length,
        colour: colour,
        draw: function()
        {
            fill(colour);
            rect(this.x, this.y, this.length, 20);
        },
        //checks if the charicter is on the platform
        checkContact: function(gc_x, gc_y)
        {
            if(gc_x > this.x && gc_x < this.x + this.length)
            {
                var d = this.y - gc_y;
                if(d >= 0 && d <= 2)
                {
                    return true;
                }
            }
            
            return false;
        }
    }
    
    return p;
}

//function for creating enemies
function Enemy (x, y, range,colour)
{
    this.x = x;
    this.y = y;
    this.range = range;
    this.jump = false;
    this.colour = colour;
    
    this.currentX = x;
    this.currentY = y;
    this.inc = 2;
    //logic for enemy movement
    this.update = function ()
    {
        this.currentX += this.inc;
        
        if(this.currentX >= this.x + this.range)
        {
            this.inc = -2;
        }
        else if(this.currentX < this.x)
        {
            this.inc = 2; 
        }
        else if(this.jump)
        {
            this.currentY = this.currentY - 100;
            this.jump = false;
        }
        else if(!this.jump && this.currentY < this.y)
        {
            this.currentY += 1;
        }
    }
    //draws the enemys
    this.draw = function()
    {
        this.update();
        
        //draws the enemy going right
        if(this.inc == 2)
        {
            noStroke();
            //body of the spider
            fill(this.colour);
            ellipse(this.currentX, this.currentY, 30, 20);
            ellipse(this.currentX + 15,this.currentY,15,15);
            stroke(10);

            //back spider leg
            line(this.currentX,this.currentY,this.currentX - 10,this.currentY - 5);
            line(this.currentX - 10, this.currentY - 5, this.currentX - random(8,10), this.currentY + random(8,10));

            //2nd from the back spider leg
            line(this.currentX,this.currentY,this.currentX - 5,this.currentY - 5);
            line(this.currentX - 5, this.currentY - 5, this.currentX - random(3,5), this.currentY + random(8,10));

            //2ndfrom the front spider leg
            line(this.currentX,this.currentY,this.currentX,this.currentY - 5);
            line(this.currentX, this.currentY - 5, this.currentX + random(0,2), this.currentY + random(8,10));

            //front spider leg
            line(this.currentX,this.currentY,this.currentX + 5,this.currentY - 5);
            line(this.currentX + 5, this.currentY - 5, this.currentX + random(5,7), this.currentY + random(8,10));
        }
        //draws the enemy going left
        else if(this.inc == -2)
        {
            noStroke();
            //body of the spider
            fill(this.colour);
            ellipse(this.currentX, this.currentY, 30, 20);
            ellipse(this.currentX + 15* -1,this.currentY,15,15);
            stroke(10);

            //back spider leg
            line(this.currentX,this.currentY,this.currentX - 10,this.currentY - 5);
            line(this.currentX - 10, this.currentY - 5, this.currentX - random(8,10), this.currentY + random(8,10));

            //2nd from the back spider leg
            line(this.currentX,this.currentY,this.currentX - 5,this.currentY - 5);
            line(this.currentX - 5, this.currentY - 5, this.currentX - random(3,5), this.currentY + random(8,10));

            //2ndfrom the front spider leg
            line(this.currentX,this.currentY,this.currentX,this.currentY - 5);
            line(this.currentX, this.currentY - 5, this.currentX + random(0,2), this.currentY + random(8,10));

            //front spider leg
            line(this.currentX,this.currentY,this.currentX + 5,this.currentY - 5);
            line(this.currentX + 5, this.currentY - 5, this.currentX + random(5,7), this.currentY + random(8,10));
        }

    }
    //checks if the charicter has made contact with an enemy
    this.checkContact = function(gc_x, gc_y)
    {
            var d = dist(gc_x, gc_y, this.currentX, this.currentY);
            
            if(d <= 28)
            {
                return true;
            }
            else
            {
                return false;
            }
            
    }
    //checks if the enemy is at the edge of a canyon
    this.checkCanyon = function(t_canyon, yPos)
    {
        if(this.currentX + 15 >= t_canyon.x && this.currentX - 15 <= t_canyon.x + t_canyon.width)
        {
            return true;
        }
        else
        {
            return false;
        }
    }
}

