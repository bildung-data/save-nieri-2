$(document).ready(function() {
	// globals
	var canJump = false;
	var gameIsInProgress = false;
	var catJumpedOverCurrentBlock = false;
	var catIsOnHisWayDown = false;
	var brickCreatorInterval;
	var score = 0;
	var highscore = 0;

	// start the game
	$('#startButton').on('click', function() {
		$('#startButton').off('click');
		$('#startButton, #instructions').hide();
		$('h2').css('visibility', 'hidden');
		$('.catContainer').removeClass('homeScreen');
		$('.catContainerOuter, .brickContainer').animate({
			top: 40,
		}, function() {
			canJump = true;
			gameIsInProgress = true;
			mainLoop();
			if (typeof brickCreatorInterval === 'undefined') {
				brickCreatorInterval = setInterval(function() {
					sendBrick();
				}, 4000);
			}
		});
	});

	// jump
	$(document).on('keyup', function() {
		if (!gameIsInProgress) {
			$('#startButton').click();
		}
		if (canJump) {
			canJump = false;
			$('.catStanding').css('opacity', 0);
			$('.catJumping').css('opacity', 1);
			$('.catContainer').animate({ top: '-=80px' }, 300, function() {
				catIsOnHisWayDown = true;
				$('.catContainer').animate({ top: '+=80px' }, 300, function() {
					canJump = true;
					catIsOnHisWayDown = false;
					$('.catStanding').css('opacity', 1);
					$('.catJumping').css('opacity', 0);
				});
			});
		}
	});

	// send a new brick from the left or right of the screen and move the stack down
	function sendBrick() {
		// move the stack down
		$('.catContainerOuter, .brick').animate({ top: '+=20' });

		// create a new brick
		var startingSide = Math.random() > 0.5 ? '-' : '';
		var speed = Math.floor(Math.random() * 500) + 3000;
		$('.brickContainer').prepend('<div class="brick" style="left: ' + startingSide + '700px;"></div>');
		$('.brick').eq(0).animate({
			left: '50%',
		}, speed, function() {
			score++;
			$('#score #value').text(score);
			catJumpedOverCurrentBlock = false;
		});
	}

	// check if you've been hit by a brick
	function hitCheck() {
		var $bricks = $('.brick');
		var brickLeftPosition = parseInt($bricks.eq(0).css('left'));
		var $catContainer = $('.catContainer').eq(0);
		var $catContainerOuter = $('.catContainerOuter').eq(0);
		
		// cat was hit
		if (!catJumpedOverCurrentBlock && $bricks.length > 1 && ((brickLeftPosition <= 90 && brickLeftPosition >= 75) || (brickLeftPosition <= 205 && brickLeftPosition >= 190)) && parseInt($catContainer.css('top')) > -20) {
			console.warn('game over!');
			console.log('brick left: ' + $('.brick').eq(0).css('left'));
			console.log('catContainer top: ' + $('.catContainer').eq(0).css('top'));
			console.log('catContainerOuter top: ' + $('.catContainerOuter').eq(0).css('top'));
			$bricks.eq(0).stop(true, false);
			$catContainer.stop(true, false);
			canJump = false;
			gameIsInProgress = false;
			clearInterval(brickCreatorInterval);

			var brickWasComingFromLeft = brickLeftPosition <= 90 && brickLeftPosition >= 75;
			brickWasComingFromLeft ? $catContainer.addClass('dead right') : $catContainer.addClass('dead left')
		}

		// cat is on top of the brick
		if ($catContainerOuter.css('top') === '60px' && !catJumpedOverCurrentBlock && $bricks.length > 1 && brickLeftPosition >= 75 && brickLeftPosition <= 205 && parseInt($catContainer.css('top')) <= -20 && parseInt($catContainer.css('top')) >= -30 && catIsOnHisWayDown) {
			console.warn('on top of brick!');
			console.log('brick left: ' + $('.brick').eq(0).css('left'));
			console.log('catContainer top: ' + $('.catContainer').eq(0).css('top'));
			console.log('catContainerOuter top: ' + $('.catContainerOuter').eq(0).css('top'));
			$catContainer.stop(false, false);
			$catContainer.css('top', 0);
			$catContainerOuter.css('top', '-=20');
			canJump = true;
			catJumpedOverCurrentBlock = true;
			$('.catStanding').css('opacity', 1);
			$('.catJumping').css('opacity', 0);
		}
	}

	// main loop
	function mainLoop() {			
			if (gameIsInProgress) {
				hitCheck();
				window.requestAnimationFrame(mainLoop);
			} else {
				// submit your score

			}
		};
});