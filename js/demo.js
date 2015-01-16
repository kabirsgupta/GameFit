// Style the select
$("select").select2();

//// Constants ////
// Consistency
var miliToDayConv = 86400000; // conversion 1000 * 60 * 60 * 24 for miliseconds to days
var activityDays = 3;
var consistencyPercentageLost = 0.1;
// Burst
var averageGlobalSpeed = 8; // min/mi
// Endurance
var averageGlobalDistance = 3; // mi
var averageGlobalTime = 24; // min