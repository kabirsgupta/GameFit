var app = angular.module('main', ['ngRoute', 'demo']);

app.config(function($routeProvider) {
	$routeProvider
		.when('/', {
			templateUrl: 'app/templates/main.html',
		})
		.when('/about', {
			templateUrl: 'app/templates/about.html',
		})
		.when('/docs', {
			templateUrl: 'app/templates/docs.html',
			// controller: 'DemoController'
		})
		.when('/contact', {
			templateUrl: 'app/templates/contact.html',
		})
		.when('/signup', {
			templateUrl: 'app/templates/signup.html'
		})
		.when('/demo', {
			templateUrl: 'app/templates/demo.html',
			controller: 'gamefitController'
		})
		.otherwise({
			redirectTo: '/'
		});
});