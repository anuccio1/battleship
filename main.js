var battleShipApp = angular.module('battleShipApp', []);

battleShipApp.controller('battleController', ['$scope', function ($scope) {

	$scope.isPlayerOnesTurn = true;

	//ship placement
	$scope.isSetupMode = true;
	$scope.currentShip = 'Aircraft';

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

	$scope.allShips = [];

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

	//ships placed 
	var playerOneShipsPlaced = [];
	var playerTwoShipsPlaced = [];

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

	function resetAllShipsButtons() {
		$scope.allShips = [ 
			{ name: 'Aircraft',enabled: true },
			{ name: 'BattleShip', enabled: true },
			{ name: 'Submarine', enabled: true },
			{ name: 'Destroyer', enabled: true },
			{ name: 'Patrol Boat', enabled: true }
		];
		$scope.currentShip = 'Aircraft';
	}

	function emptyArray(arr) {
		while(arr.length > 0) {
			arr.pop();
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
		clearArray(playerOneShipsPlaced);
		clearArray(playerTwoShipsPlaced);
		clearArray(playerOneQueue);
		clearArray(playerTwoQueue);

		resetAllShipsButtons();
	};

	//this is when user is placing boats
	$scope.addSquareToPlacementQueue = function (player) {
		var row = this.$parent.$index;	//grab index from first ng-repeat
		var col = this.$index;
		var currSquare = new BattleSquare(row, col);

		//declare variables for current queue and defense board
		var currPlayerQueue = (player === 'one') ? playerOneQueue : playerTwoQueue;
		var currDefenseBoard = (player === 'one') ? $scope.playerOneDefenseBoard : $scope.playerTwoDefenseBoard;
	
		var currentShipLength = shipMap[$scope.currentShip];
		var currentQueueLength = currPlayerQueue.length;

		//check validity of the square the user clicked on
		if (currDefenseBoard[currSquare.row][currSquare.col] === '') {	//only allow to click on empty square
			if(currentQueueLength < currentShipLength) {
				currPlayerQueue.push(currSquare);
				currDefenseBoard[currSquare.row][currSquare.col] = '+';
			}
		} else {	//remove clicked box from queue
			if (currDefenseBoard[currSquare.row][currSquare.col] === '+') {	//can't remove 'x'
				//remove from queue
				for (var i=currentQueueLength-1; i>=0; i--) {
					if (currPlayerQueue[i].row === currSquare.row && currPlayerQueue[i].col === currSquare.col) {
						currPlayerQueue.splice(i,1);	//remove
						break;
					}
				}
				currDefenseBoard[currSquare.row][currSquare.col] = '';
			}
		}
	};

	function shipIsVertical (sq1, sq2) {
		return sq1.col === sq2.col;
	}

	//Take two squares. if row's are equal, sort by col, otherwise, sort by row
	function shipSort(byRow) {
		return function(sq1, sq2) {
			if (byRow) {
				return sq1.row - sq2.row;
			} else {
				return sq1.col - sq2.col;
			}
		}
	}

	function clearArray(currPlayerQueue) {
		while (currPlayerQueue.length > 0) {
			currPlayerQueue.pop();
		}
	}

	function changeShipSelected() {
		var firstNonPlacedShip;
		for (var i=0; i<$scope.allShips.length; i++) {
			var currShip = $scope.allShips[i];
			if ($scope.currentShip === currShip.name) {
				currShip.enabled = false;
			} else {
				if (!firstNonPlacedShip) {
					if (currShip.enabled) {
						firstNonPlacedShip = currShip.name;		//get the ship to change to in the radio buttons
					}
				}
			}
		}

		$scope.currentShip = firstNonPlacedShip;
	}

	//call this after a ship has been placed to check on any state changes i.e. players turn being over, or setup mode being over
	function shipHasBeenPlaced() {
		if ($scope.isPlayerOnesTurn) {
			if (playerOneShipsPlaced.length === 5) {	//change to player two's turn
				alert("All Ships have been placed");
				$scope.isPlayerOnesTurn = false;
				alert("Player Two's Turn");
				resetAllShipsButtons();
			} else {
				changeShipSelected();
			}
		} else {
			if (playerTwoShipsPlaced.length === 5) {
				alert("All Ships for Player two have been placed.");
				$scope.isPlayerOnesTurn = true;
				$scope.isSetupMode = false;	//end the setup mode
			} else {
				changeShipSelected();
			}
		}
	}

	$scope.submitShipPlacement = function () {
		//declare variables for current queue and defense board
		var currPlayerQueue  = ($scope.isPlayerOnesTurn) ? playerOneQueue : playerTwoQueue;
		var currDefenseBoard = ($scope.isPlayerOnesTurn) ? $scope.playerOneDefenseBoard : $scope.playerTwoDefenseBoard;
		
		var currentShipLength = shipMap[$scope.currentShip];
		var currentQueueLength = currPlayerQueue.length;
		var shipsPlacedArr = $scope.isPlayerOnesTurn ? playerOneShipsPlaced : playerTwoShipsPlaced;

		//if they have already placed this ship, ignore submission and return
		if (shipsPlacedArr.indexOf($scope.currentShip) >= 0) {
			alert("You have already placed your " + $scope.currentShip);
			for (var i=0; i<currPlayerQueue.length; i++) {
				currDefenseBoard[currPlayerQueue[i].row][currPlayerQueue[i].col] = '';
			}
			clearArray(currPlayerQueue);
			return;
		}

		if (currentShipLength !== currentQueueLength) {
			alert("You haven't placed enough squares for your " + $scope.currentShip);
		} else {
			//sort queue. If first two values have same column value, sort by row, otherwise sort by col
			var sortByRow = (currPlayerQueue[0].col === currPlayerQueue[1].col);	
			currPlayerQueue = currPlayerQueue.sort(shipSort(sortByRow));

			//now that it is sorted, make sure it is a valid ship
			var isVert = shipIsVertical(currPlayerQueue[0],currPlayerQueue[1]);		//check if Vertical

			var row = currPlayerQueue[0].row;
			var col = currPlayerQueue[0].col;

			var isValid = true;
			for (var i = 1; i < currentShipLength; i++) {
				//this is whether the ship is being placed vertically or horizontally
				if (isVert) {
					if (currPlayerQueue[i].col === col && currPlayerQueue[i].row === ++row) {	//increment row
						continue;
					} else {
						isValid = false;
						break;
					}
				} else {
					if (currPlayerQueue[i].row === row && currPlayerQueue[i].col === ++col) {	//increment col
						continue;
					} else {
						isValid = false;
						break;
					}
				}
			}

			//ship is valid. Lock it in
			if (isValid) {
				placeShips($scope.isPlayerOnesTurn, $scope.currentShip, isVert, currPlayerQueue[0].row, currPlayerQueue[0].col);
				clearArray(currPlayerQueue);
				alert("Your " + $scope.currentShip + " has been placed");
				shipsPlacedArr.push($scope.currentShip);
				shipHasBeenPlaced();
			} else {
				alert("Ship is Invalid! All Squares must be bordering one another");
			}

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