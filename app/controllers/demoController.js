angular.module('demo', [])

//// Controller ////
.controller('gamefitController', function($scope, $window, userApi, userStats, userModel) {
	// Data
	$scope.users = [];
	$scope.currUser = {};
	// response contains data, status, headers, config
	userApi.all().then(function(response) {
		$scope.users = response.data;
		$scope.currUser = $scope.users[0];
	});

	$scope.$watch('currUser', function() {
		if($scope.currUser) {
			// Summary Stats
			$scope.consistency = userStats.getConsistency($scope.currUser);
			$scope.burst = userStats.getBurst($scope.currUser);
			$scope.endurance = userStats.getEndurance($scope.currUser);
			$scope.fitPoints = userStats.getPoints($scope.currUser);
			$scope.fitScore = userStats.getScore($scope.currUser);

			// Draw the Model
			userModel.drawModel($scope.currUser, $scope.consistency, $scope.burst, $scope.endurance);
		}
	}, true);

	//Google Fit Call
	if($window.location.href == "http://kabirgupta.com/itp466/GameFit/de.html") {
		userApi.getCode();
	} else {
		var check = $window.location.search.split('&');
		if(check[0] == "?state=authCode") {
			var code = check[1].slice(5);
			console.log(code);
			userApi.getToken(code);
		}
	}
})

//// Services ////
.factory('userApi', function($http, $window) {
	function all() {
		return $http.get('js/data.json');
	}

	function getCode() {
		//oauth2callback
		$window.location.href ='https://accounts.google.com/o/oauth2/auth?scope=email%20profile&state=authCode&redirect_uri=http://kabirgupta.com/itp466/GameFit/demo.html&response_type=code&client_id=917701858932-q284ig8096qd2olu7ivuock67pr56u43.apps.googleusercontent.com&approval_prompt=force';
	}

	function getToken(token) {
		// $http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
		// var promise = $http({
		// 	method: "POST",
		// 	url: "https://accounts.google.com/o/oauth2/token",
		// 	data:{
		// 		code: token,
		// 		client_id: "917701858932-q284ig8096qd2olu7ivuock67pr56u43.apps.googleusercontent.com",
		// 		client_secret: "-wy2VclCbrWZASA4L-OdtiT2",
		// 		redirect_uri: "http://localhost:3000/gamefit.html",
		// 		grant_type: "authorization_code"
		// 	}
		// });
		// Having trouble here so I'm not going to do this next step. I do authenticate an authorization code, but I
		// was not able to solve the token issue alone, so I'm just goint to leave this here to show I tried.
		// I will still finisht his up on my own but not for this class assignment.
		var promise = $http({
			method: "GET",
			url: 'js/script.php',
			data:{
				code: token,
				client_id: "917701858932-q284ig8096qd2olu7ivuock67pr56u43.apps.googleusercontent.com",
				client_secret: "-wy2VclCbrWZASA4L-OdtiT2",
				redirect_uri: "http://localhost:3000/gamefit.html",
				grant_type: "authorization_code"
			}
		});

		promise.then(function(response) {
			console.log(response);
		});
	}

	return {
		all:all,
		getCode:getCode,
		getToken:getToken
	};
})

// Create the formulas and analyze the data to put into the summary and generate graph for user
// FOR ACTIVITIES THEY MUST BE SORTED nearest date to be last in array, farthest first
.factory('userStats', function() {
	function getConsistency(user) {
		var consistencyScore = 0;
		var consistency = 0;
		var longBreakPointer = 0;
		var date = Date.now();

		// Go through the activities starting with the latest (Most recent date, should be sorted)
		// Then check to see if it is consistent going backwards
		if(user.activity) {
			for(var i = user.activity.length - 1; i >= user.activity.length - activityDays; i--) {
			 	var tempDate = Date.parse(user.activity[i].date);
			 	var dateDiff = date.valueOf() - tempDate.valueOf();
			 	dateDiff /= miliToDayConv;
			 	dateDiff = Math.floor(dateDiff);

			 	if(dateDiff <= 1) {
			 		consistency++;
			 	} else if(dateDiff < 3) {
			 		consistency -= dateDiff;
			 	} else {
			 		longBreakPointer = user.activity.length - 1 - i;
			 		break;
			 	}
			 	date = tempDate;
			}
		}
		// if somewhat consistent then activityDays is most days looking at then
		if(consistency > 0 ) {
			consistencyScore = 200 - (activityDays - consistency) * consistencyPercentageLost;
		} else if(longBreakPointer < activityDays && longBreakPointer > 1) {
			// Within the test days but has long break then need to assign a so so level
			consistencyScore = 140;
		} else {
			consistencyScore = 0; // too many days of inactivity
			// Consider a decay algorithm here from the last active date
		}

		return Math.floor(consistencyScore);
	}

	function getBurst(user) {
		var burst = 0;
		var fastestMile = (user.activity !== undefined) ? (user.activity[0].runTime / user.activity[0].runDistance) : 0;
		//var avgOfLastFewRuns = 0;
		var isImproving = 0;

		// var totalD = user.activity[0].runDistance;
		// var totalT = user.activity[0].runTime;
		if(user.activity) {
			for(var i = 1; i < user.activity.length; i++) {
				var speed = user.activity[i].runTime / user.activity[i].runDistance;
				// totalD += user.activity[i].runDistance;
				// totalT += user.activity[i].runTime;
				if(fastestMile >= speed) {
					fastestMile = speed;
					isImproving++;
				}
				else {
					isImproving--;
				}
			}
		}
		// Personal Component
		if(isImproving > 0) {
			burst += 100;
		}
		// General Component
		burst += (averageGlobalSpeed - fastestMile) * 10;

		return Math.floor(burst);
	}

	function getEndurance(user) {
		var endurance = 0;
		var longestDistance = (user.activity !== undefined) ? user.activity[0].runDistance : 0;
		var longestTime = (user.activity !== undefined) ? user.activity[0].runTime : 0;
		var isImproving = 0;

		if(user.activity) {
			for(var i = 1; i < user.activity.length; i++) {
				var improved = false;
				if(user.activity[i].runTime >= longestTime) {
					longestTime = user.activity[i].runTime;
					improved = true;
				}
				if(user.activity[i].runDistance >= longestDistance) {
					longestDistance = user.activity[i].runDistance;
					improved = true;
				}
				if(improved) {
					isImproving++;
				} else{
					isImproving--;
				}
			}
		}
		// Personal Component
		if(isImproving > 0) {
			endurance +=100;
		}
		// General Component
		endurance += (longestTime - averageGlobalTime);
		endurance += (longestDistance - averageGlobalDistance);

		return Math.floor(endurance);
	}

	function getPoints(user) {
		var consistency = getConsistency(user);
		var burst = getBurst(user);
		var endurance = getEndurance(user);

		var points = consistency + burst + endurance;

		return points;
	}

	function getScore(user) {
		var points = getPoints(user);

		return Math.ceil(points/4);
	}

	return  {
		getConsistency: getConsistency,
		getBurst: getBurst,
		getEndurance: getEndurance,
		getPoints: getPoints,
		getScore: getScore
	};
})

.factory('userModel', function() {
	function drawModel(user, consistency, burst, endurance) {
		var canvas = document.getElementById('myCanvas');
	    var context = canvas.getContext('2d');
	    var centerX = canvas.width / 2;
	    var centerY = canvas.height / 2;
	    var radius = 150;
	    // arc
	    var start = 3/2 * Math.PI;
	    var end = 3/2 * Math.PI + (2/3) * Math.PI;

	    // Overall Circle
		context.beginPath();
	    context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
	    context.fillStyle = 'white';
	    context.fill();
	    context.lineWidth = 1;
	    context.strokeStyle = '#000000';
	    context.stroke();

	    // top right
	    context.beginPath();
	    context.arc(centerX, centerY, radius, start, end, false);
	    context.lineTo(centerX, centerY);
	    context.lineTo(centerX, 0);
	    context.fillStyle = '#FFFFFF';
	    context.fill();
	    context.lineWidth = 1;
	    context.strokeStyle = '#000000';
	    context.stroke();

	    // Bottom
	    start = end;
	    end = 3/2 * Math.PI+ 2*(2/3) * Math.PI;
	    context.beginPath();
	    context.arc(centerX, centerY, radius, start, end, false);
	    context.lineTo(centerX, centerY);
	    context.fillStyle = '#FFFFFF';
	    context.fill();
	    context.lineWidth = 1;
	    context.strokeStyle = '#000000';
	    context.stroke();

	    // top left
	    start = end;
	    end = 3/2 * Math.PI;
	    context.beginPath();
	    context.arc(centerX, centerY, radius, start, end, false);
	    context.fillStyle = '#FFFFFF';
	    context.fill();
	    context.lineWidth = 1;
	    context.strokeStyle = '#000000';
	    context.stroke();

	    if(user.activity) {
	    	var consistencyRadius = (consistency < 100) ? consistency * (150 / 100) : 150;
	    	var burstRadius = (burst < 100) ? burst * (150 / 100) : 150;
	    	var enduranceRadius = (endurance < 100) ? endurance * (150 / 100) : 150;

			// Inner top right
			start = 3/2 * Math.PI;
	    	end = 3/2 * Math.PI + (2/3) * Math.PI;
		    context.beginPath();
		    context.arc(centerX, centerY, consistencyRadius, start, end, false);
		    context.lineTo(centerX, centerY);
		    context.lineTo(centerX, 0);
		    context.fillStyle = '#e74c3c';
		    context.fill();
		    context.lineWidth = 1;
		    context.strokeStyle = '#000000';
		    context.stroke();

		    // Inner Bottom
		    start = end;
		    end = 3/2 * Math.PI + 2*(2/3) * Math.PI;
		    context.beginPath();
		    context.arc(centerX, centerY, burstRadius, start, end, false);
		    context.lineTo(centerX, centerY);
		    context.fillStyle = '#2ecc71';
		    context.fill();
		    context.lineWidth = 1;
		    context.strokeStyle = '#000000';
		    context.stroke();

		    // Inner top left
		    start = end;
		    end = 3/2 * Math.PI;
		    context.beginPath();
		    context.arc(centerX, centerY, enduranceRadius, start, end, false);
		    context.lineTo(centerX, centerY);
		    context.fillStyle = '#8e44ad';
		    context.fill();
		    context.lineWidth = 1;
		    context.strokeStyle = '#000000';
		    context.stroke();

		    // Text
		    var textX = 50;
		    var textY = 100;
		    context.beginPath();
		    context.fillStyle = '#222222';
		    context.font = "22px OpenSans-Light";
		    context.fillText(endurance, textX, textY);
		    textY += 25;
		    textX -= 20;
		    context.fillText('Endurance', textX, textY);
		    textX = 200;
		    textY -= 25;
		    context.fillText(consistency, textX, textY);
		    textY += 25;
		    textX -= 40;
		    context.fillText('Consistency', textX, textY);
		    textX = 125;
		    textY = 250;
		    context.fillText(burst, textX, textY);
		    textY += 25;
		    textX -= 5;
		    context.fillText('Burst', textX, textY);
		    context.stroke();
	    }
	}

	return {
		drawModel: drawModel
	};
});