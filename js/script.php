<?php

$url = "https://accounts.google.com/o/oauth2/token";
$data = array(
	code => $_GET['code'],
	client_id => "917701858932-q284ig8096qd2olu7ivuock67pr56u43.apps.googleusercontent.com",
	client_secret => "-wy2VclCbrWZASA4L-OdtiT2",
	redirect_uri => "http://localhost:3000/gamefit.html",
	grant_type => "authorization_code"
);

$options = array(
	'http' => array(
		'header' => 'Content-Type: application/x-www-form-urlencoded',
		'method' => 'POST',
		'content' => http_build_query($data),
	)
);

$context = stream_context_create($options);
$result = file_get_contents($url, false, $context);

echo $result;