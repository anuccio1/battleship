var battleShipApp = angular.module('battleShipApp', []);

battleShipApp.controller('battleController', ['$scope', function ($scope) {

	$scope.isPlayerOnesTurn = true;
	$scope.playerOneDefenseBoard = [];
	$scope.playerTwoDefenseBoard = [];

	$scope.playerOneAttackBoard = [];
	$scope.playerTwoAttackBoard = [];

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
		//Place the game pieces
		var counter = 0;
		
		//Aircraft Carrier (size 5)
		while (counter < 5) {
			$scope.playerOneDefenseBoard[3+counter][2] = 'x';
			var playerOneSquare = new BattleSquare(3+counter, 2);
			$scope.playerOneShips['Aircraft'].push(playerOneSquare);	//add to ships object (so we know if one was sunk)

			$scope.playerTwoDefenseBoard[5][1 + counter] = 'x';
			var playerTwoSquare = new BattleSquare(5, 1 + counter);
			$scope.playerTwoShips['Aircraft'].push(playerTwoSquare);	//add to ships object (so we know if one was sunk)

			counter++;
		}

		counter = 0;
		//BattleShip (size 4)
		while (counter < 4) {
			$scope.playerOneDefenseBoard[2][6+counter] = 'x';
			var playerOneSquare = new BattleSquare(2, 6+counter);
			$scope.playerOneShips['BattleShip'].push(playerOneSquare);	//add to ships object (so we know if one was sunk)

			$scope.playerTwoDefenseBoard[0 + counter][5] = 'x';
			var playerTwoSquare = new BattleSquare(0+counter,5);
			$scope.playerTwoShips['BattleShip'].push(playerTwoSquare);	//add to ships object (so we know if one was sunk)

			counter++;
		}
		counter = 0;
		//Submarine (size 3)
		while (counter < 3) {
			$scope.playerOneDefenseBoard[1+counter][4] = 'x';
			var playerOneSquare = new BattleSquare(1+counter, 4);
			$scope.playerOneShips['Submarine'].push(playerOneSquare);	//add to ships object (so we know if one was sunk)

			$scope.playerTwoDefenseBoard[1][1+counter] = 'x';
			var playerTwoSquare = new BattleSquare(1,1+counter);
			$scope.playerTwoShips['Submarine'].push(playerTwoSquare);	//add to ships object (so we know if one was sunk)

			counter++;
		}
		counter = 0;
		//Destroyer (size 3)
		while (counter < 3) {
			$scope.playerOneDefenseBoard[5+counter][8] = 'x';
			var playerOneSquare = new BattleSquare(5+counter, 8);
			$scope.playerOneShips['Destroyer'].push(playerOneSquare);	//add to ships object (so we know if one was sunk)

			$scope.playerTwoDefenseBoard[0][7+counter] = 'x';
			var playerTwoSquare = new BattleSquare(0,7+counter);
			$scope.playerTwoShips['Destroyer'].push(playerTwoSquare);	//add to ships object (so we know if one was sunk)

			counter++;
		}
		counter = 0;
		//Patrol Boat (size 2)
		while (counter < 2) {
			$scope.playerOneDefenseBoard[9][4+counter] = 'x';
			var playerOneSquare = new BattleSquare(9, 4+counter);
			$scope.playerOneShips['Patrol Boat'].push(playerOneSquare);	//add to ships object (so we know if one was sunk)

			$scope.playerTwoDefenseBoard[9][2+counter] = 'x';
			var playerTwoSquare = new BattleSquare(9,2+counter);
			$scope.playerTwoShips['Patrol Boat'].push(playerTwoSquare);	//add to ships object (so we know if one was sunk)

			counter++;
		}
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