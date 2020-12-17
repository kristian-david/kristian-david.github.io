const code = document.querySelector('#code');

var xCoord = 0;
var yCoord = 0;

var xVal = 0;
var yVal = 0;

var eXVal = 0;
var eYVal = 0;

var matrix = [];
var playerMatrix = [];
var enemyMatrix = [];

//array of coordinates na natira na
var shotLocs = [];

// mga tinira na ng AI
var enemyShotLocs = [];
// if nakita na ni AI yung direction
var orientationFound = false;
var orientationPredicted = "";
var enemyFoundYourShip = false;
var enableAI = false;

var checkShipNumberChange = 5;
//irerecord yung first na tamang shot sa isang ship
var firstCorrectHitX = 0;
var firstCorrectHitY = 0;

var gameText = document.querySelector('#gameManager-text');
var gameBoard = document.querySelector('#grid-text');

var playerShip_text = document.querySelector('#playerShips-text');
var enemyShip_text = document.querySelector('#enemyShips-text');

var i = 0;
var announcement = '';
var speed = 50;

var canType = false;

var gameStart = false;
var setupStart = false;
var setupProgress = 0;
var gameEnd = false;

//number of ships created; s para maikli lang poh
var s = 0;
var eS = 0;

// fs = require('fs');

Initialize();

class Ship {
	constructor(length){
		this.length = length - 1;
		this.startLocX = 0;
		this.startLocY = 0;
		this.endLocX = 0;
		this.endLocY = 0;
		this.locX = [];
		this.locY = [];
		this.health = length;
		this.isDestroyed = false;
	}

	CalculateSpaceTaken(){

		if (this.startLocX < this.endLocX){
			for (let i = this.startLocX; i <= this.endLocX; i++){
				this.locX[i - this.startLocX] = i;
			}
		} else {
			for (let i = this.endLocX; i <= this.startLocX; i++){
				this.locX[i - this.endLocX] = i;
			}
		}

		if (this.startLocY < this.endLocY){
			for (let i = this.startLocY; i <= this.endLocY; i++){
				this.locY[i - this.startLocY] = i;
			}
		} else {
			for (let i = this.endLocY; i <= this.startLocY; i++){
				this.locY[i - this.endLocY] = i;
			}
		}
	}

	ResetSpaceTaken(){

		this.locX = [];
		this.locY = [];
	}

	TakeDamage(){
		if (this.health <= 1){
			this.isDestroyed = true;
		} else {
			this.health -= 1;
		}
	}

}

// Gawa poh tayo ng array of objects based sa Ship class. bale 10 lahat; 5 player ship at 5 enemy ship
var ships = [new Ship(5), new Ship(4), new Ship(3), new Ship(3), new Ship(2)];
var enemyShips = [new Ship(5), new Ship(4), new Ship(3), new Ship(3), new Ship(2)];

function Initialize(){
	Announce("WELCOME TO BATTLESHIP!", 50, 0);
	setTimeout(function() {
		Announce("Input X=0 Y=0 to Start Game!", 50, 0);
		canType = true;
	} , 2400);
}

function Confirm(){
	if (canType == true && gameEnd == false){

	xCoord = document.querySelector('#textX-input').value;
	yCoord = document.querySelector('#textY-input').value;

	document.querySelector('#textX-input').value = '';
	document.querySelector('#textY-input').value = '';

	xVal = xCoord - 1;

	// Icoconvert yung y from letter to numerical
	switch(yCoord) {
		case "A":
			yVal = 0;
			break;
		case "B":
			yVal = 1;
			break;
		case "C":
			yVal = 2;
			break;
		case "D":
			yVal = 3;
			break;
		case "E":
			yVal = 4;
			break;
		case "F":
			yVal = 5;
			break;
		case "G":
			yVal = 6;
			break;
		case "H":
			yVal = 7;
			break;
	}

	if (setupStart == false && gameStart == false){

		if (xCoord == 0 && yCoord == 0) {
			Announce("SET YOUR SHIPS!", 50, 0);
			CreateBoard();
			CreatePlayerBoard();
			canType = false;

			setTimeout(function() {
				Announce("POSITION MOTHERSHIP (5 units)", 50, 0);
				setupStart = true;
				canType = true;
			} , 2000);
		} else {
			alert("ERROR 000: PLEASE INPUT 0 TO X AND Y TO PROCEED. THANK YOU.");
		}
	}
	if (setupStart == true && gameStart == false){
		if (setupProgress % 2 == 0){
			ConfirmSetupPosition();
		} else {
			ConfirmSetupOrientation();
		}
	}
	if (gameStart == true){
		ConfirmShoot();
	}

}}

//FUNCTIONS NG SETUP

function AnnounceSetupProgression(){
	setupProgress += 1;

	switch(setupProgress){
		case 1:
			Announce("Set Orientation in X [↑(0),↓(1),←(2),→(3)]", 20, 0);
			break;
		case 2:
			Announce("POSITION SPACE LAB (4 units)", 50, 0);
			break;
		case 3:
			Announce("Set Orientation in X [↑(0),↓(1),←(2),→(3)]", 20, 0);
			break;
		case 4:
			Announce("POSITION FIGHTER SHIP (3 units)", 50, 0);
			break;
		case 5:
			Announce("Set Orientation in X [↑(0),↓(1),←(2),→(3)]", 20, 0);
			break;
		case 6:
			Announce("POSITION SPACE BUS (3 units)", 50, 0);
			break;
		case 7:
			Announce("Set Orientation in X [↑(0),↓(1),←(2),→(3)]", 20, 0);
			break;
		case 8:
			Announce("POSITION SPACE SATELLITE (2 units)", 50, 0);
			break;
		case 9:
			Announce("Set Orientation in X [↑(0),↓(1),←(2),→(3)]", 20, 0);
			break;
		case 10:
			Announce("PREPARE TO BATTLE!", 50, 0);
			canType = false;
			document.querySelector('.game-grid').style.backgroundImage="url(enemy-grid.png)";

			setTimeout(function() {
				Announce("First turn goes to you. Shoot your shot!", 50, 0);
				SetupEnemyBoard();
				eS = 5;
				gameStart = true;
				setupStart = false;
				canType = true;
			} , 2000);
			break;
	}
}

function ConfirmSetupPosition(){
	let yValues = ["A","B","C","D","E","F","G","H"];
	let xValid = (xCoord < 9 && xCoord > 0);
	let yValid = yValues.includes(yCoord);



	if (xValid && yValid) {
		if (CheckShipIntersection(false) == true){
			ships[s].startLocX = xVal;
			ships[s].startLocY = yVal;

			matrix[yVal] = placeMarker(matrix[yVal], '◼', xVal);
			LoadBoard();

			//ANNOUNCE YUNG PROGRESSION NG SETUP
			AnnounceSetupProgression();
		}

	} else {
		alert("ERROR 001: COORDINATES ENTERED IS TOO FAR. PLEASE RETURN TO THE PLAYING FIELD. THANK YOU.");
	}
}

function ConfirmSetupOrientation(){
	let xValid = (xCoord < 4 && xCoord >= 0);

	if (xValid) {

		//xCoord nakalagay kase sa x nilagay yung orientation
		switch(xCoord){
			case('0'):
				if (ships[s].startLocY - ships[s].length >= 0){
					ships[s].endLocX = ships[s].startLocX;
					ships[s].endLocY = ships[s].startLocY - ships[s].length;
					if (CheckShipIntersection(true,false) == true){
						PlaceFullShip(0);
					}
				} else {

					if(ships[s].startLocX - ships[s].length < 0){
						alert("ERROR 002: ORIENTATION ENTERED IS INVALID. POSSIBLE ORIENTATIONS ARE DOWN(1) OR RIGHT(3)");
					} else if (ships[s].startLocX + ships[s].length > 7) {
						alert("ERROR 002: ORIENTATION ENTERED IS INVALID. POSSIBLE ORIENTATIONS ARE DOWN(1) OR LEFT(2)");
					} else {
						alert("ERROR 002: ORIENTATION ENTERED IS INVALID. POSSIBLE ORIENTATIONS ARE DOWN(1), LEFT(2), RIGHT(3)");
					}
					break;
				}
				break;
			case('1'):
				if (ships[s].startLocY + ships[s].length <= 7){
					ships[s].endLocX = ships[s].startLocX;
					ships[s].endLocY = ships[s].startLocY + ships[s].length;
					if (CheckShipIntersection(true,false) == true){
						PlaceFullShip(1);
					}
				} else {
					if(ships[s].startLocX - ships[s].length < 0){
						alert("ERROR 002: ORIENTATION ENTERED IS INVALID. POSSIBLE ORIENTATIONS ARE UP(0) OR RIGHT(3)");
					} else if (ships[s].startLocX + ships[s].length > 7) {
						alert("ERROR 002: ORIENTATION ENTERED IS INVALID. POSSIBLE ORIENTATIONS ARE UP(0) OR LEFT(2)");
					} else {
						alert("ERROR 002: ORIENTATION ENTERED IS INVALID. POSSIBLE ORIENTATIONS ARE UP(0), LEFT(2), RIGHT(3)");
					}
					break;
				}
				break;
			case('2'):
				if (ships[s].startLocX - ships[s].length >= 0){
					ships[s].endLocX = ships[s].startLocX - ships[s].length;
					ships[s].endLocY = ships[s].startLocY;
					if (CheckShipIntersection(true,true) == true){
						PlaceFullShip(2);
					}
				} else {
					if(ships[s].startLocY - ships[s].length < 0){
						alert("ERROR 002: ORIENTATION ENTERED IS INVALID. POSSIBLE ORIENTATIONS ARE DOWN(1) OR RIGHT(3)");
					} else if (ships[s].startLocY + ships[s].length > 7) {
						alert("ERROR 002: ORIENTATION ENTERED IS INVALID. POSSIBLE ORIENTATIONS ARE UP(0) OR RIGHT(3)");
					} else {
						alert("ERROR 002: ORIENTATION ENTERED IS INVALID. POSSIBLE ORIENTATIONS ARE UP(0), DOWN(1), RIGHT(3)");
					}
					break;
				}
				break;
			case('3'):
				if (ships[s].startLocX + ships[s].length <= 7){
					ships[s].endLocX = ships[s].startLocX + ships[s].length;
					ships[s].endLocY = ships[s].startLocY;
					if (CheckShipIntersection(true,true) == true){
						PlaceFullShip(3);
					}
				} else {
					if(ships[s].startLocY - ships[s].length < 0){
						alert("ERROR 002: ORIENTATION ENTERED IS INVALID. POSSIBLE ORIENTATIONS ARE DOWN(1) OR LEFT(2)");
					} else if (ships[s].startLocY + ships[s].length > 7) {
						alert("ERROR 002: ORIENTATION ENTERED IS INVALID. POSSIBLE ORIENTATIONS ARE UP(0) OR LEFT(2)");
					} else {
						alert("ERROR 002: ORIENTATION ENTERED IS INVALID. POSSIBLE ORIENTATIONS ARE UP(0), DOWN(1), LEFT(2)");
					}
					break;
				}
				break;
		
	}
	} else {
		alert("ERROR 002: ORIENTATION ENTERED IS INVALID. POSSIBLE ORIENTATIONS ARE UP(0), DOWN(1), LEFT(2), RIGHT(3)");
	}
}

function CheckShipIntersection(isCheckingOrientation, isHorizontal){
	if (s > 0){
		if (isCheckingOrientation == false){
			var inelligble = false;

			for (let i = 0; i < s; i++){
				if (ships[i].locX.includes(xVal) && ships[i].locY.includes(yVal)){
					alert("ERROR 001: COORDINATES ENTERED COLLIDES WITH ANOTHER SHIP. PLEASE SELECT ANOTHER COORDINATE. THANK YOU.");
					inelligble = true;
				}
			}

			if (!inelligble){ return true;}
		} else {
			var inelligble = false;

			ships[s].CalculateSpaceTaken();
			for (let i = 0; i < s; i++){
				for (let j = 0; j <= ships[s].length; j++){
					if (isHorizontal == true){
						if (ships[i].locX.includes(ships[s].locX[j]) && ships[i].locY.includes(ships[s].locY[0])){
							alert("ERROR 002: ORIENTATION WILL CAUSE SHIP TO COLLIDE WITH ANOTHER SHIP. PLEASE SELECT ANOTHER ORIENTATION. THANK YOU.");
							inelligble = true;
							break;
						}
					} else {
						if (ships[i].locX.includes(ships[s].locX[0]) && ships[i].locY.includes(ships[s].locY[j])){
							alert("ERROR 002: ORIENTATION WILL CAUSE SHIP TO COLLIDE WITH ANOTHER SHIP. PLEASE SELECT ANOTHER ORIENTATION. THANK YOU.");
							inelligble = true;
							break;
						}
					}
				}
			}
			if (!inelligble){ return true;}

		}
	} else {
		return true;
	}
}

function SetupEnemyBoard(){
	for (let i = 0; i < 8;i++){
		enemyMatrix[i] = '';
		for (let j = 0; j < 8;j++){
			enemyMatrix[i] += '◎';
		}
	}

	RandomizeEnemyLocation();

	LoadEnemyBoard();

	eS = 5;
	enemyShip_text.textContent = "SHIPS: 0" + eS.toString();
}

function RandomizeEnemyLocation(){

	//setup mothership
	let mShipX = Math.floor(Math.random() * 3) + 0;
	let mShipY = Math.floor(Math.random() * 3) + 5;

	enemyShips[0].startLocX = mShipX;
	enemyShips[0].startLocY = mShipY;
	enemyShips[0].endLocX = mShipX + enemyShips[i].length + 1;
	enemyShips[0].endLocY = mShipY;
	enemyShips[0].CalculateSpaceTaken();


	//setup other ships
	let randX = Math.floor(Math.random() * 8);
	let randY = 0;

	let randomizedPos = []

	for (let i = 1; i < 5; i++){

		do {
			randX = Math.floor(Math.random() * 8);
		}
		while (randomizedPos.includes(randX));

		randomizedPos.push(randX);

		randY = Math.floor(Math.random() * (mShipY - enemyShips[i].length));

		enemyShips[i].startLocX = randX;
		enemyShips[i].startLocY = randY;
		enemyShips[i].endLocX = randX;
		enemyShips[i].endLocY = enemyShips[i].startLocY + enemyShips[i].length;
		enemyShips[i].CalculateSpaceTaken();
	}
}

//FUNCTIONS NG GAME


function ConfirmShoot(){
	let yValues = ["A","B","C","D","E","F","G","H"];
	let xValid = (xCoord < 9 && xCoord > 0);
	let yValid = yValues.includes(yCoord);

	selectedX = xVal.toString();
	selectedY = yVal.toString();
	selectedLoc = selectedX + selectedY;

	if (xValid && yValid && gameEnd == false) {
		if(!(shotLocs.includes(selectedLoc))){
			shotLocs.push(selectedLoc);
			canType = false;

			setTimeout(function() {
				EnemyTurn();
			} , 2000);

			if (CheckEnemyShip() == true){
				CheckAliveShips();

				enemyMatrix[yVal] = placeMarker(enemyMatrix[yVal], '◼', xVal);
				LoadEnemyBoard();

				AnnouncePlayerHit(true);
			} else {
				enemyMatrix[yVal] = placeMarker(enemyMatrix[yVal], '◉', xVal);
				LoadEnemyBoard();
				AnnouncePlayerHit(false);
			}
		} else {
			alert("ERROR 003: COORDINATES ENTERED IS ALREADY BLOWN TO PIECES. PLEASE ENTER ANOTHER LOCATION TO SHOOT. THANK YOU.");
		}

	} else {
		alert("ERROR 001: COORDINATES ENTERED IS TOO FAR. PLEASE RETURN TO THE PLAYING FIELD. THANK YOU.");
	}
}

function CheckEnemyShip(){
	var shipShot = false;

	for (let i = 0; i < 5; i++){

		if (enemyShips[i].locX.includes(xVal) && enemyShips[i].locY.includes(yVal)){
			enemyShips[i].TakeDamage();
			shipShot = true;
		} else {
			//alert("YOU MISSED!");
		}
	}

	if (shipShot){return true} else {return false}
}

function CheckAliveShips(){
	eS = 5;

	for (var i = 0; i < 5; i++){
		if (enemyShips[i].isDestroyed == true){
			eS -= 1;
		}
	}
	enemyShip_text.textContent = "SHIPS: 0" + eS.toString();

	EndGame();
}

function AnnouncePlayerHit(hit){

	if (gameEnd == false){
	if (hit == true){
		var randPhrase = Math.floor(Math.random() * 9); 

		switch(randPhrase){
		case 0:
			Announce("NICE SHOT!", 20, 0);
			break;
		case 1:
			Announce("RIGHT IN THE ENEMY SHIP!", 50, 0);
			break;
		case 2:
			Announce("SUCCESSFUL SHOT!", 20, 0);
			break;
		case 3:
			Announce("NICE HIT!", 50, 0);
			break;
		case 4:
			Announce("GOOD SHOT!", 20, 0);
			break;
		case 5:
			Announce("IT'S A HIT!", 20, 0);
			break;
		case 6:
			Announce("A SUCCESSFUL HIT!", 50, 0);
			break;
		case 7:
			Announce("SUCCESS!", 20, 0);
			break;
		}
	} else {
		var randPhrase = Math.floor(Math.random() * 6); 

		switch(randPhrase){
		case 0:
			Announce("YOU MISSED!", 20, 0);
			break;
		case 1:
			Announce("OOF!", 50, 0);
			break;
		case 2:
			Announce("YOU MISSED THE ENEMY SHIP!", 20, 0);
			break;
		case 3:
			Announce("YOU ALMOST GOT IT!", 50, 0);
			break;
		case 4:
			Announce("YOU MISSED! THAT'S SAD!", 20, 0);
			break;
		case 5:
			Announce("IT'S A MISS!", 50, 0);
			break;
	}
}
}

	
}

//FUNCTIONS NG ENEMY AI
function EnemyTurn(){

	if (gameEnd == false){
		canType = false;
		Announce("ENEMY'S TURN!", 10, 0);
		LoadPlayerBoard();

		setTimeout(function() {
			Announce("Enemy is guessing where your ships at", 50, 0);
		} , 1000);

		setTimeout(function() {
			if (enableAI == true){
				EnemyAI();
			} else {
				CreateRandomTarget();
			}
		} , 3250);
	}
}

function CreateRandomTarget(){

	let randX = Math.floor(Math.random() * 8) + 0;
	let randY = Math.floor(Math.random() * 8) + 0;

	let randXString = randX.toString();
	let randYString = randY.toString();

	let randTarget = randXString + randYString;

	do {
		randX = Math.floor(Math.random() * 8) + 0;
		randY = Math.floor(Math.random() * 8) + 0;

		randXString = randX.toString();
		randYString = randY.toString();

		randTarget = randXString + randYString;

	}
	while (enemyShotLocs.includes(randTarget));


	eXVal = randX;
	eYVal = randY;
	EnemyShoot(eXVal,eYVal);
	enemyShotLocs.push(randTarget);

	//if tumama ng hit ito, ireference natin kung ano yung una nyang tinamaan
	firstCorrectHitX = eXVal;
	firstCorrectHitY = eYVal;
}


function EnemyAI(){

	if (orientationFound == true){
		DetermineFullShipLocation();
	} else {
		DetermineOrientation();
	}
}

function DetermineOrientation(){

	let predictX = firstCorrectHitX;
	let predictY = firstCorrectHitY;

	let insideBoard = false;

	let decided = false;

	let combinedUp = "";
	let combinedDown = "";
	let combinedLeft = "";
	let combinedRight = "";

	let predictXString = predictX.toString();
	let predictYString = predictY.toString();

	let combinedPredict = "";
	
	if (decided == false){

		//create prediction if up chineck
		predictY = firstCorrectHitY - 1;
		predictYString = predictY.toString();
		combinedUp = predictXString + predictYString;
		//create prediction if down chineck
		predictY = firstCorrectHitY + 1;
		predictYString = predictY.toString();
		combinedDown = predictXString + predictYString;
		//create prediction if 
		predictYString = firstCorrectHitY.toString();
		//create prediction if left chineck
		predictX = firstCorrectHitX - 1;
		predictXString = predictX.toString();
		combinedLeft = predictXString + predictYString;
		//create prediction if right chineck
		predictX = firstCorrectHitX + 1;
		predictXString = predictX.toString();
		combinedRight = predictXString + predictYString;


		if (!(enemyShotLocs.includes(combinedUp)) && (firstCorrectHitY - 1) >= 0){	
			eXVal = firstCorrectHitX;
			eYVal = firstCorrectHitY - 1;

			EnemyShoot(eXVal,eYVal);
		} else if (!(enemyShotLocs.includes(combinedDown)) && (firstCorrectHitY + 1) <= 7) {
			eXVal = firstCorrectHitX;
			eYVal = firstCorrectHitY + 1;

			EnemyShoot(eXVal,eYVal);
		}  else if (!(enemyShotLocs.includes(combinedLeft)) && (firstCorrectHitX - 1) >= 0) {
			eXVal = firstCorrectHitX - 1;
			eYVal = firstCorrectHitY;

			EnemyShoot(eXVal,eYVal);
		}  else if (!(enemyShotLocs.includes(combinedRight)) && (firstCorrectHitX + 1) <= 7) {
			eXVal = firstCorrectHitX + 1;
			eYVal = firstCorrectHitY;

			EnemyShoot(eXVal,eYVal);
		} else {
			enableAI = false;
			CreateRandomTarget();
		}
	}

	predictXString = eXVal.toString();
	predictYString = eYVal.toString();

	combinedPredict = predictXString + predictYString;
	enemyShotLocs.push(combinedPredict);

	// if nakita yung succedding edi idetermine na naten orientation. kung pareho lang yung x nila edi vertical otherwise horizontal
	if (orientationFound == true){
		if (eXVal == firstCorrectHitX){
			orientationPredicted = "vertical";
		} else {
			orientationPredicted = "horizontal";
		}
	}

}

function DetermineFullShipLocation(){

	let predictX = firstCorrectHitX;
	let predictY = firstCorrectHitY;

	let predictXString = predictX.toString();
	let predictYString = predictY.toString();

	let combinedPredict = "";

	let giveUp = true;

	if (orientationPredicted == "horizontal"){

		for (let i = 0; i < 9; i++){

			predictX = (firstCorrectHitX - 4) + i;

			predictXString = predictX.toString();
			predictYString = predictY.toString();

			combinedPredict = predictXString + predictYString;

			if (enemyShotLocs.includes(combinedPredict) == false){
				if (predictX >= 0 && predictX <= 7){
					eXVal = predictX;
					eYVal = predictY;
					giveUp = false;

					break;
				}
			}
		}	
	} else if (orientationPredicted == "vertical"){
		for (let i = 0; i < 9; i++){

			predictY = (firstCorrectHitY - 4) + i;

			predictXString = predictX.toString();
			predictYString = predictY.toString();

			combinedPredict = predictXString + predictYString;

			if (enemyShotLocs.includes(combinedPredict) == false){
				if (predictY >= 0 && predictY <= 7){
					eXVal = predictX;
					eYVal = predictY;
					giveUp = false;

					break;
				}
			}
		}
	}

	if (giveUp == true){
		CreateRandomTarget();
		orientationFound = false;
		enableAI = false;
	} else {
		enemyShotLocs.push(combinedPredict);
		EnemyShoot(eXVal,eYVal);
	}
}

function EnemyShoot(x,y){
	if (CheckPlayerShip() == true){
		CheckEnemyAliveShips();

		playerMatrix[eYVal] = placeMarker(playerMatrix[eYVal], '◼', eXVal);
		LoadPlayerBoard();

		AnnounceEnemyHit(true);
		lastHitCorrect = true;

		//If AI is determining orientation tas nahit nya correctly, then AI needs to do next step.
		if (enableAI == true && orientationFound == false){
			orientationFound = true;
		} else {
			enableAI = true;
		}

		//If the ship counter decrease, then go back to random shooting
		if (enemyFoundYourShip == true){
			enableAI = false;
			enemyFoundYourShip = false;
		}
	} else {
		playerMatrix[eYVal] = placeMarker(playerMatrix[eYVal], '◉', eXVal);
		LoadPlayerBoard();
		AnnounceEnemyHit(false);
		lastHitCorrect = false;
	}

	if (gameEnd == false){
		setTimeout(function() {
			Announce("Now is your turn. Shoot your shot!", 50, 0);
			LoadEnemyBoard();
			canType = true;
		} , 2500);
	}
}

function CheckPlayerShip(){
	let shipShot = false;

	for (let i = 0; i < 5; i++){

		if (ships[i].locX.includes(eXVal) && ships[i].locY.includes(eYVal)){
			ships[i].TakeDamage();
			shipShot = true;
		}
	}

	if (shipShot == true){return true} else {return false}
}

function CheckEnemyAliveShips(){
	enemyFoundYourShip = false;
	s = 5;

	for (var i = 0; i < 5; i++){
		if (ships[i].isDestroyed == true){
			s -= 1;
		}
	}

	EndGame();
	//check if may nasirang ship si enemy
	if (s < checkShipNumberChange){
		enemyFoundYourShip = true;
	}

	checkShipNumberChange = s;
	playerShip_text.textContent = "SHIPS: 0" + s.toString();
}


function AnnounceEnemyHit(hit){

	if (gameEnd == false){
	if (hit == true){
		var randPhrase = Math.floor(Math.random() * 6); 

		switch(randPhrase){
		case 0:
			Announce("YOU GOT HIT!", 20, 0);
			break;
		case 1:
			Announce("ENEMY HITTED YOU!", 50, 0);
			break;
		case 2:
			Announce("THE ENEMY FOUND YOUR SHIP!", 20, 0);
			break;
		case 3:
			Announce("NICE SHOT BY THE ENEMY!", 50, 0);
			break;
		case 4:
			Announce("GOOD SHOT BY THE ENEMY!", 20, 0);
			break;
		case 5:
			Announce("IT'S A HIT!", 20, 0);
			break;
		}
	} else {
		var randPhrase = Math.floor(Math.random() * 6); 

		switch(randPhrase){
		case 0:
			Announce("ENEMY MISSED!", 20, 0);
			break;
		case 1:
			Announce("THE ENEMY MISSED YOU!", 50, 0);
			break;
		case 2:
			Announce("THE ENEMY MADE THE WRONG SHOT!", 20, 0);
			break;
		case 3:
			Announce("ENEMY FAILED TO SHOT YA!", 50, 0);
			break;
		case 4:
			Announce("ENEMY MISSED YOUR SHIP!", 20, 0);
			break;
		case 5:
			Announce("THE ENEMY MISSED!", 50, 0);
			break;
	}
}
}

	
}

//SCORING AND GAME MANAGER FUNCTIONS

function EndGame(){
	if (s == 0){
		gameEnd = true;
		Announce("ALL OF YOUR SHIPS ARE ANNIHILATED!", 20, 0);

		setTimeout(function() {
			Announce("TRY AGAIN NEXT TIME :(", 50, 0);
		} , 3200);
	} else if (eS == 0){
		gameEnd = true;
		Announce("ALL THE ENEMY SHIPS ARE ANNIHILATED!", 20, 0);

		setTimeout(function() {
			Announce("CONGRATULATIONS!", 50, 0);
		} , 3200);
	}
}

// EWAN FUNCTIONS

function Announce(text, typeSpeed, resetNum){
	announcement = text;
	speed = typeSpeed;
	i = resetNum;

	gameText.textContent = '';

	TypeWriter();
}

function TypeWriter(){
	if (i < announcement.length) {
		gameText.textContent += announcement.charAt(i);
		i++;
		setTimeout(TypeWriter, speed);
  }
}


function placeMarker(origString, replaceChar, index) {
    let firstPart = origString.substr(0, index);
    let lastPart = origString.substr(index + 1);
      
    let newString = firstPart + replaceChar + lastPart;
    return newString;
}

function placeMarkerHorizontally(origString, replaceChar, index1, index2, length) {
    let firstPart = origString.substr(0, index1);
    let lastPart = origString.substr(index2 + 1);

    var markers = '';
    for (let i = 0; i < length; i++){
    	markers += replaceChar;
    }

    let newString = firstPart + markers + lastPart;
    return newString;
}
// SET NA D2 YUNG FULL NA SHIP
function PlaceFullShip(direction) {
	switch(direction){
		case 0:
			for (let i = 0; i < ships[s].length; i++){
				matrix[ships[s].endLocY + i] = placeMarker(matrix[ships[s].endLocY + i], '◼', ships[s].startLocX);
			}
			break;
		case 1:
			for (let i = 0; i < ships[s].length; i++){
				matrix[ships[s].endLocY - i] = placeMarker(matrix[ships[s].endLocY - i], '◼', ships[s].startLocX);
			}
			break;
		case 2:
			matrix[ships[s].endLocY] = placeMarkerHorizontally(matrix[ships[s].endLocY], '◼', ships[s].endLocX, ships[s].startLocX - 1, ships[s].length);
			break;
		case 3:
			matrix[ships[s].endLocY] = placeMarkerHorizontally(matrix[ships[s].endLocY], '◼', ships[s].startLocX , ships[s].endLocX, ships[s].length + 1);
			break;
	}
	AnnounceSetupProgression();
	
	LoadBoard();

	// reset naten kasi ginamit naten for calculation yung locX at locY. nafifillup yung array na yon eh kaya magkakaerror
	ships[s].ResetSpaceTaken();
	ships[s].CalculateSpaceTaken();

	s += 1;
	playerShip_text.textContent = "SHIPS: 0" + s.toString();
}

//board for setup
function CreateBoard(){

	for (let i = 0; i < 8;i++){
		matrix[i] = '';
		for (let j = 0; j < 8;j++){
			matrix[i] += '◎';
		}
	}
	LoadBoard();
}

//board for actual game
function CreatePlayerBoard(){
	for (let i = 0; i < 8;i++){
		playerMatrix[i] = '';
		for (let j = 0; j < 8;j++){
			playerMatrix[i] += '◎';
		}
	}
}

function LoadBoard(){

	gameBoard.textContent = matrix.join('\n');

}

// pag e2 niload ibig sabihin player maglalaro
function LoadEnemyBoard(){

	document.querySelector('.game-grid').style.backgroundImage="url(game-grid.png)";
	gameBoard.textContent = enemyMatrix.join('\n');

}

// pag e2 niload edi ai na maglalaro
function LoadPlayerBoard(){

	document.querySelector('.game-grid').style.backgroundImage="url(enemy-grid.png)";
	gameBoard.textContent = playerMatrix.join('\n');

}


// NODE EWAN NA FUNCTIONS

function Restart(){
	xCoord = 0;
	yCoord = 0;

	xVal = 0;
	yVal = 0;

	eXVal = 0;
	eYVal = 0;

	matrix = [];
	playerMatrix = [];
	enemyMatrix = [];

	shotLocs = [];

	enemyShotLocs = [];

	orientationFound = false;
	orientationPredicted = "";
	enemyFoundYourShip = false;
	enableAI = false;

	checkShipNumberChange = 5;

	firstCorrectHitX = 0;
	firstCorrectHitY = 0;

	s = 0;
	eS = 0;

	i = 0;
	announcement = '';
	speed = 50;

	canType = false;

	gameStart = false;
	setupStart = false;
	setupProgress = 0;
	gameEnd = false;

	for (let i = 0; i < 5; i++){
		ships[i].startLocX = 0;
		ships[i].startLocY = 0;
		ships[i].endLocX = 0;
		ships[i].endLocY = 0;
		ships[i].locX = [];
		ships[i].locY = [];
		ships[i].health = ships[i].length;
		ships[i].isDestroyed = false;

		enemyShips[i].startLocX = 0;
		enemyShips[i].startLocY = 0;
		enemyShips[i].endLocX = 0;
		enemyShips[i].endLocY = 0;
		enemyShips[i].locX = [];
		enemyShips[i].locY = [];
		enemyShips[i].health = enemyShips[i].length;
		enemyShips[i].isDestroyed = false;
	}

	for (let i = 0; i < 8;i++){
		matrix[i] = '';
		for (let j = 0; j < 8;j++){
			matrix[i] += 'ⵘ';
		}
	}
	LoadBoard();

	playerShip_text.textContent = "SHIPS: 0" + s.toString();
	enemyShip_text.textContent = "SHIPS: 0" + eS.toString();

	Initialize();

	// ok may bug tayo. kapag nagposition, inde napoposition
}

function Save(){
	fs.writeFile('helloworld.txt', 'Hello World!', function (err) {
  		if (err) return console.log(err);
  		console.log('Hello World > helloworld.txt');
	});
}

form.addEventListener('submit', async function (event){
	event.preventDefault();

	
	alert("SAD");

	const response = await fetch(form.action, {
		method: form.method,
		body: JSON.stringify(body)
	});



})