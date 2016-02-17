var battleShipApp = angular.module('battleShipApp', []);

battleShipApp.controller('battleController', ['$scope', function ($scope) {

	$scope.isPlayerOnesTurn = true;
	$scope.playerOneDefenseBoard = [];
	$scope.playerTwoDefenseBoard = [];

	$scope.playerOneAttackBoard = [];
	$scope.playerTwoAttackBoard = [];

	var shipMap = {
		'Aircraft': 5,
		'BattleShip': 4,
		'Submarine': 3,
		'Destroyer': 3,
		'Patrol Boat': 2
	}

	$scope.playerOneShips = {
		'Aircraft': [],
		'BattleShip': [],
		'Submarine': [],
		'Destroyer': [],
		'Patrol Boat': []
	};

	$scope.playerTwoShips = {
		'Aircraft': [],
		'BattleShip': [],
		'Submarine': [],
		'Destroyer': [],
		'Patrol Boat': []
	};

	//selection queue
	var playerOneQueue = [];
	var playerTwoQueue = [];

	//square class
	function BattleSquare(row, col) {
		this.row = row;
		this.col = col;
	}

	//row and col are starting position of ship (top or left most depending on isVertical)
	function placeShips(isPlayerOne, shipName, isVertical, row, col) {
		var defenseBoard = isPlayerOne ? $scope.playerOneDefenseBoard : $scope.playerTwoDefenseBoard;
		var shipsBoard = isPlayerOne ? $scope.playerOneShips : $scope.playerTwoShips;
		var shipSize = shipMap[shipName];	//get size of ship

		for (var i = 0; i < shipSize; i++) {
			defenseBoard[row][col] = 'x';
			var currentSquare = new BattleSquare(row,col);
			shipsBoard[shipName].push(currentSquare);
			//this is whether the ship is being placed vertically or horizontally
			if (isVertical) {
				row++;
			} else {
				col++;
			}
		}
	}

	$scope.initializeBoards = function() {
		$scope.isPlayerOnesTurn = true;
		//initialize empty boards
		for (var i = 0; i < 10; i++) {
			$scope.playerOneDefenseBoard[i] = [];
			$scope.playerOneAttackBoard[i] = [];
			$scope.playerTwoDefenseBoard[i] = [];
			$scope.playerTwoAttackBoard[i] = [];
			for (var j=0; j < 10; j++) {
				$scope.playerOneDefenseBoard[i][j] = '';
				$scope.playerOneAttackBoard[i][j] = '';
				$scope.playerTwoDefenseBoard[i][j] = '';
				$scope.playerTwoAttackBoard[i][j] = '';
			}
		}

		//place the ships
		placeShips(true, 'Aircraft', true, 3, 2);
		placeShips(false, 'Aircraft', false, 5, 1);

		placeShips(true, 'BattleShip', false, 2, 6);
		placeShips(false, 'BattleShip', true, 0, 5);
		
		placeShips(true, 'Submarine', true, 1, 4);
		placeShips(false, 'Submarine', false, 1, 1);
		
		placeShips(true, 'Destroyer', true, 5, 8);
		placeShips(false, 'Destroyer', false, 0, 7);
		
		placeShips(true, 'Patrol Boat', false, 9,4);
		placeShips(false, 'Patrol Boat', false, 9, 2);
	};

	//Adds a pending state, before the user accepts the move
	$scope.addSquareToQueue = function (player) {
		var row = this.$parent.$index;	//grab index from first ng-repeat
		var col = this.$index;
		var currSquare = new BattleSquare(row, col);

		//declare variables for current queue and attack board
		var currPlayerQueue = (player === 'one') ? playerOneQueue : playerTwoQueue;
		var currAttackBoard = (player === 'one') ? $scope.playerOneAttackBoard : $scope.playerTwoAttackBoard;
	
		if (currAttackBoard[currSquare.row][currSquare.col] === '') {	//only allow to click on empty square
			//pop old selection and add new one to current queue
			var oldSelection = currPlayerQueue.pop();	
			currPlayerQueue.push(currSquare);

			//unmark old selection on attack board, and then mark new one
			if (oldSelection) {
				currAttackBoard[oldSelection.row][oldSelection.col] = '';
			}
			currAttackBoard[currSquare.row][currSquare.col] = '+';
		}
	};

	$scope.submitAttack = function () {
		var currentAttackBoard, opposingBoard, currentAttackSquare, currentQueue;
		if ($scope.isPlayerOnesTurn) {
			opposingBoard = $scope.playerTwoDefenseBoard;	//grab opposing players board
			currentAttackBoard = $scope.playerOneAttackBoard;
			currentAttackSquare = playerOneQueue.pop();		//grab pending attack square
		} else {
			opposingBoard = $scope.playerOneDefenseBoard;	//grab opposing players board
			currentAttackBoard = $scope.playerTwoAttackBoard;
			currentAttackSquare = playerTwoQueue.pop();		//grab pending attack square
		}
			

		if (opposingBoard[currentAttackSquare.row][currentAttackSquare.col] === 'x') {
			alert("HIT!");
			currentAttackBoard[currentAttackSquare.row][currentAttackSquare.col] = 'x';
			removeSquareFromShip(currentAttackSquare);
		} else {
			alert("Miss!");
			currentAttackBoard[currentAttackSquare.row][currentAttackSquare.col] = 'o';
		}


		$scope.isPlayerOnesTurn = !$scope.isPlayerOnesTurn;	//change turns
		checkIfGameOver();
	};

	//remove square from ship object
	function removeSquareFromShip(battleSquare) {
		var currShipObj = ($scope.isPlayerOnesTurn) ? $scope.playerTwoShips : $scope.playerOneShips;
		for (var ship in currShipObj) {
			var newShipArr = [];
			var currSquareArr = currShipObj[ship];	//grab array of squares
			for (var point in currSquareArr) {
				if (currSquareArr[point].row === battleSquare.row && currSquareArr[point].col === battleSquare.col) {	//push to arr if not a hit
					if (currSquareArr.length === 1) {
						alert('You sunk their ' + ship + "!!!");
						break;
					}
				} else {
					newShipArr.push(currSquareArr[point]);
				}
			}
			currShipObj[ship] = newShipArr;
		}
	}

	function checkIfGameOver () {
		var currPlayer = ($scope.isPlayerOnesTurn) ? "one" : "two";
		var currShipObj = ($scope.isPlayerOnesTurn) ? $scope.playerTwoShips : $scope.playerOneShips;
		var count = 0;
		for (var ship in currShipObj) {
			var currSquareArr = currShipObj[ship];	//grab array of squares
			if (currShipObj[ship].length === 0) {
				count++;
			}
		}
		if (count === 5) {
			alert("GAME OVER!\n Player " + currPlayer + " Wins!");
			$scope.initializeBoards();	//reset
		}
	}

	$scope.init = function () {
		$scope.initializeBoards();
	};

	$scope.init();



}]);