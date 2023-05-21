$(document).ready(function() {
    // global game variables
    var canJump = false;
    var gameIsInProgress = false;
    var catJumpedOverCurrentBlock = false;
    var catIsOnHisWayDown = false;
    var score = 0;
    var highscore = 0;
    var popupShownBefore = null;

    //initialize Mixpanel
    mixpanel.init('7fb9a4b04570113d479ec0c7fea0b8e3', {debug: true});

    // start (or restart) the game
    function startGame() {
        canJump = false;
        gameIsInProgress = false;
        catJumpedOverCurrentBlock = false;
        catIsOnHisWayDown = false;
        score = 0;
        $('#score #value').text(score);
        $('.brickContainer').html('<div class="brick original landed"></div>');
        $('.catContainer').removeClass('dead left right').css('top', 0);
        $('.catStanding').css('opacity', 1);
        $('.catJumping').css('opacity', 0);
        $('#gameOverContent').fadeOut();
        $('#jumpButton').fadeIn();
        $('#startButton').off('click', startGame);
        $('#startButton, #instructions').hide();       


        $('h2').css('visibility', 'hidden');
        $('.catContainer').removeClass('homeScreen');
        $('.catContainerOuter, .brickContainer').animate({
            top: 40,
        }, function() {
            if (!gameIsInProgress) {
                canJump = true;
                gameIsInProgress = true;
                mainLoop();
                setTimeout(sendBrick, 2000);
            }
        });
    }

    function startGameMixpanel() {
    //Mixpanel Event Tracked
    mixpanel.track("Game Started");
    }
  
    // click handler to start the game
    $('#startButton').on('click', startGame);
    $('#startButton').on('click', startGameMixpanel);


    // jump (or start game if first key press)
    function handleKeyPress() {
        if (!gameIsInProgress) {
            startGame();
        }
        if (canJump) {
            canJump = false;
            $('.catStanding').css('opacity', 0);
            $('.catJumping').css('opacity', 1);
            $('.catContainer').animate({ top: '-=80px' }, 250, function() {
                catIsOnHisWayDown = true;
                $('.catContainer').animate({ top: '+=80px' }, 300, function() {
                    canJump = true;
                    catIsOnHisWayDown = false;
                    $('.catStanding').css('opacity', 1);
                    $('.catJumping').css('opacity', 0);
                });
            });
        }
    }

    // keypress handler to jump
    $(document).on('keydown', handleKeyPress);
  
    // add an event listener to the jump button to handle the jump action - Guro!
    $('#jumpButton').on('click', handleKeyPress);

    function hidepopupContainer() 
  {
    //console.log("hidepopupContainer function está corriendo");
    var name = $('#nameInput').val();
    // Store the entered name in cookies or local storage
    localStorage.setItem('playerName', name);
    // Hide the pop-up
    $('#popupContainer').fadeOut();
    // Set to a value other than null
    popupShownBefore = true; 
    
    //Mixpanel Identify
    mixpanel.identify(name);
    //Mixpanel Event Tracked
    mixpanel.track("Name Entered");
    mixpanel.people.set({ $name: name });
  }

     $('#enterNameButton').on('click', hidepopupContainer);
  
  
  
  
  
    // send a new brick from the left or right of the screen and move the stack down
    function sendBrick() {
        // move the stack down
        $('.catContainerOuter, .brick').animate({ top: '+=20' });

        // create a new brick
        var startingSide = Math.random() > 0.5 ? '-' : '';
        var speed = Math.max(1000, Math.floor(Math.random() * 2000) + 2000 - (score * 20));
        var additionalColorClass = (score + 1) % 10 === 0 ? 'ten' : (score + 1) % 5 === 0 ? 'five' : '';
        $('.brickContainer').prepend('<div class="brick ' + additionalColorClass + '" style="left: ' + startingSide + '700px;"></div>');
        $('.brick').eq(0).animate({ left: '50%' }, speed);
    }

    // increment the score and send a new brick
    function incrementScoreAndSendNewBrick() {
        score++;
        $('#score #value').text(score);
        catJumpedOverCurrentBlock = false;
        sendBrick();
        
    }

    // check if you've been hit by a brick
    function hitCheck() {
        var $bricks = $('.brick');
        var brickLeftPosition = parseInt($bricks.eq(0).css('left'));
        var $catContainer = $('.catContainer').eq(0);
        var $catContainerOuter = $('.catContainerOuter').eq(0);
        
        // cat was hit
        if (!catJumpedOverCurrentBlock && $bricks.length > 1 && brickLeftPosition >= 75 && brickLeftPosition <= 205 && parseInt($catContainer.css('top')) > -20) {
            $bricks.eq(0).stop(true, false);
            $catContainer.stop(true, false);
            canJump = false;
            gameIsInProgress = false;
            $(document).off('keydown', handleKeyPress);
            $('#jumpButton').hide();
            $('.brick').eq(0).addClass('hit');

            var brickWasComingFromLeft = brickLeftPosition <= 90 && brickLeftPosition >= 75;
            brickWasComingFromLeft ? $catContainer.addClass('dead right') : $catContainer.addClass('dead left')

        // cat is on top of the brick
        } else if (parseInt($catContainerOuter.css('top')) === 60 && !catJumpedOverCurrentBlock && $bricks.length > 1 && brickLeftPosition >= 75 && brickLeftPosition <= 205 && parseInt($catContainer.css('top')) <= -20 && parseInt($catContainer.css('top')) >= -30 && catIsOnHisWayDown) {
            $bricks.eq(0).stop(true, false);
            $catContainer.stop(true, false);
            $catContainer.css('top', 0);
            $catContainerOuter.css('top', '-=20');
            canJump = true;
            catJumpedOverCurrentBlock = true;
            catIsOnHisWayDown = false;
            $('.catStanding').css('opacity', 1);
            $('.catJumping').css('opacity', 0);
            $('.brick').eq(0).addClass('landed');
            incrementScoreAndSendNewBrick();
        }
    }
  
  
    // Function to handle the share button click event
    function shareOnWhatsApp() {
        var gameURL = 'https://bildung-data.github.io/save-nieri/';
        var whatsappURL = 'https://api.whatsapp.com/send?text=' + encodeURIComponent(gameURL);
        window.open(whatsappURL);
    }
  
  
    // end the game
    function endGame() {
        setTimeout(function() {
            $('#gameOverContent').fadeIn();
             //New!
            if (score > highscore) {
                highscore = score;
                $('#highscore #value').text(score);
                $('#mainContent h3').text('Wow, nuevo highscore: ' + highscore + '!');
                $('#mainContent #shareWhatsapp').fadeIn();
                
                //Event Tracked Mixpanel
                mixpanel.track('Game Played', {
                'Score': highscore,
                'New Highscore': true
                });
            } else {
            $('#mainContent h3').text('Do it for '+'\u{1F63F}'+'¡probá de nuevo!');
            $('#shareWhatsapp').hide();
                //Event Tracked Mixpanel
                mixpanel.track('Game Played', {
                'Score': score,
                'New Highscore': false
                });
            }
            $(document).on('keydown', handleKeyPress);
        }, 1500);
    }
  
    // Add click event listener to the shareButton
    $('#shareWhatsapp').on('click', shareOnWhatsApp);
  
    // click handler to restart the game
    $('#restartButton').on('click', startGame);
    $('#restartButton').on('click', startGameMixpanel);

    // main loop
    function mainLoop() {           
        if (gameIsInProgress) {
            hitCheck();
            window.requestAnimationFrame(mainLoop);
        } else {
            endGame();
        }
    }
});
