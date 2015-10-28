$(document).ready(console.log("JQuery ready"));
// CREATE A REFERENCE TO FIREBASE
var fireRef = new Firebase("https://fbs3.firebaseio.com/");

//GLOBAL VARIABLES
var lastNameArray = [];
var firstNameArray = ["Quincy","Lavoy","Giannis","Jordan","Tony","Carmelo","Stevens","Arron","Pero","Dimetrios","Chris","Trevor","Alexis","Alan","Darrel","Furkan","James","Brandon","Cole","Justin","Omar","LaMarcus","Kyle","Augustin","Alexanders","Ayer"];
var userArrayComplete;
var leagueArrayComplete;
var leagueCreateName;
var teamCreateName;
var userId;
var userPassword;
console.log("variables reset to null state");

//AUTOMATIC SCRIPT RUN ON LOAD BELOW


//CHECK FOR LOCAL STORAGE
if(typeof(Storage) !== "undefined") {
    // Code for localStorage/sessionStorage.
    userId = localStorage.localUserId;
    userPassword = localStorage.localUserPassword;
    console.log("user variables taken from localStorage: "+userId);
} else {
    console.log ("Sorry! No Web Storage support..");
}
if (Cookies.get('userArrayCookie') != null) {
    userArrayComplete = Cookies.get('userArrayCookie');
    console.log("got user cookie: "+userArrayComplete);
}
if (Cookies.get('leagueArrayCookie') != null) {
    leagueArrayComplete = Cookies.get('leagueArrayCookie');
    console.log("got league cookie");
}


//CALLED FUNCTIONS BELOW


//RETRIEVE PROMISE USER DATA FROM FIREBASE ARRAY
function userPromiseData(user){
  var userDeferred = $.Deferred();
  fireRef.child('userArray').child(user).once('value',
    function (snap) {
        userDeferred.resolve(snap);
    }
  );
  console.log("userPromiseData ran");
  return userDeferred.promise();
}
//GRAB WHOLE LEAGUE ARRAY FOR USE THROUGHOUT GAME.
function leagueSnapshot (tempLeague){
  var leagueDeferred = $.Deferred();
  fireRef.child("leagueArray").child(tempLeague).once('value', function (snap){
    leagueDeferred.resolve(snap);
  });
  return leagueDeferred.promise();
}
//CHECK FOR LOCATION OF HOSTED PAGE DATA
function teamGlanceCheck(teamName){
  if(window.location.origin == "file://"){
    console.log("its a local host...");
    var userPromise = userPromiseData(userId);
    userPromise.done(function(userSnap){
      userArrayComplete = userSnap;
      console.log("userArrayComplete: " + userArrayComplete.key());
      teamGlanceFill(teamName);
    });
  }else{
    teamGlanceFill(teamName);
  }
}
//FILL TEAM INFO PAGE
function teamGlanceFill(teamName){
    console.log ("teamGlanceFill initiated: " +userArrayComplete.key());
    var playerInfo;
    var playerPoint;
    if (!leagueArrayComplete){
      console.log("league array did not exist");
      if (userArrayComplete.child("league").val()){
        leagueArrayCheck();
      }else{
        $('#buttonContain').css("display","inline-block");
      }
    }else{
      console.log("league array found locally. Name: "+leagueArrayComplete.key());
      $('#teamContain').css("display","inline-block");
    }

    //   userArrayComplete.forEach(function(childSnap) {}
      //$('#rookieList > tbody:last-child').append('<tr><td>'+tempAttribute[9]+'</td>');
}
//RETRIEVE LEAGUE ARRAY IF NOT AVAILABLE LOCALLY
function leagueArrayCheck(){
  var leaguePromise = leagueSnapshot(userArrayComplete.child("league").val());
  leaguePromise.fail(function(){
    alert("leaguePromise failed: did not exist on firebase.");
  });
  leaguePromise.done(function(snap){
    leagueArrayComplete = snap;
    $('#teamContain').css("display","inline-block");
    Cookies.set('leagueArrayCookie', leagueArrayComplete);
    console.log("retrieved league array. Name: "+leagueArrayComplete.key());
  });
}
//A NEW USER CALLS THIS FUNCTION WHEN JOINING A LEAGUE
function joinLeague(){
  console.log("join league run.");
  var leaguePromise = wholeLeagueDeferred();
  leaguePromise.fail(function(){
    alert("leaguePromise failed: did not exist on firebase.");
  });
  leaguePromise.done(function(snap){
    snap.forEach(function(leagueSnap) {
      leagueSnap.forEach(function(teamSnap){
        if(teamSnap.child("owner").val() == "compAI"){
          console.log("found available team");
          fireRef.child('userArray').child(userId).child("league").set(leagueSnap.key());
          fireRef.child('userArray').child(userId).child("team").set(teamSnap.key());
          fireRef.child('leagueArray').child("alphaLeague").child(teamSnap.key()).child("owner").set(userId);
          window.location.assign("fbs3.html");
          return true;
        }
      });
    });
    console.log("no compAI team could be found.");
  });
}
//Deferred FUNCTION FOR THE WHOLE LEAGUE ARRAY
function wholeLeagueDeferred(){
  var leagueDeferred = $.Deferred();
  fireRef.child("leagueArray").once('value', function (snap){
    leagueDeferred.resolve(snap);
  });
  return leagueDeferred.promise();
}

function randNum(min,max){
  adjMax = max-min;
  var tempNum = Math.floor((Math.random() * adjMax) + min);
  return tempNum;
}
//FIND A NUMBER NEAR THE APROXIMATE AVERAGE
function nearAverageRandom(startNum, min, max){
  // console.log ("nearAverageRandom run");
  var num = Math.floor((max-min)/15)+1;
  for (var i = 0; i < 10; i++) {
    var smallNum = randNum(-Math.abs(num),num);
    // console.log ("the small number is " +smallNum)
    startNum +=  smallNum;
    // console.log ("the start number is " +startNum);
    if (startNum >max){startNum = max;}
    if (startNum <min){startNum = min;}
  }
  return startNum;
}

function generateName(){
  var tempName = "";
  var length = (firstNameArray.length) - 1;
  tempName =  firstNameArray[randNum(0,length)] +" " + firstNameArray[randNum(0,length)];
  return tempName;
}

function addPlayer(source){
  console.log("run add player");
  var generatePlayer = [];
  //FILL GENPLAYER WITH [LEAGUE,TEAM,NAME,HEIGHT,CONTRACT,SPEED,SHOOTING,DEFENCE,POSTITION]
  // if (source == "form"){
  //   generatePlayer.push($('#leagueName').val());
  //   generatePlayer.push($('#playerTeamInput').val());
  //   generatePlayer.push($('#playerNameInput').val());
  //   generatePlayer.push($('#playerHeightInput').val());
  //   generatePlayer.push($('#playerContractInput').val());
  // }else{
  //   generatePlayer.push(userArrayComplete.child("league").val());
  //   generatePlayer.push(userArrayComplete.child("team").val());
  //   generatePlayer.push(generateName());
  //   generatePlayer.push(nearAverageRandom(72,60,84));
  //   generatePlayer.push(randNum(1,10));
  // }
  // generatePlayer.push("bench");
  // generatePlayer.push(150+nearAverageRandom(60,0,150));
  // generatePlayer.push(18+nearAverageRandom(3,0,7));
  // var skillId = randNum(30,60);
  // var potentialSkill = randNum(60,90);
  // var tempAverage = skillId;
  // var skillAverage = skillId;
  // var goalAverage = skillId;
  // var skillArray=[];
  // var totalAttribute = 3;
  // for (var y = 0; y < 2; y++) {
  //   for (var i = 0; i < totalAttribute; i++) {
  //     var tempMin = 10;
  //     var tempMax = 100;
  //     var tempSkill = nearAverageRandom(skillAverage, tempMin ,tempMax);
  //     skillArray.push(tempSkill);
  //     var tempNum = 0;
  //     var tempIndex = 0;
  //     $.each(skillArray, function( index, value ) {
  //       tempNum += value;
  //       tempIndex = index + 1;
  //     });
  //     tempAverage = Math.floor(tempNum / (tempIndex));
  //     var remainAttribute = totalAttribute - i -1;
  //     skillAverage = Math.floor(((goalAverage * totalAttribute ) - tempNum) / remainAttribute);
  //   };
  //   tempAverage = potentialSkill;
  //   skillAverage = potentialSkill;
  //   goalAverage = potentialSkill;
  // };

  // fireRef.child("leagueArray").child(generatePlayer[0]).child(generatePlayer[1]).child(generatePlayer[2]).set({injury:false, height : generatePlayer[3], contract: {amount:generatePlayer[4]}, position: generatePlayer[5], weight: generatePlayer[6], age: generatePlayer[7], speed: skillArray[0], shooting: skillArray[1], defence: skillArray[2], speedPot: skillArray[3], shootingPot: skillArray[4], defencePot: skillArray[5]});
  // console.log("created player: "+generatePlayer[2]);
}

function simGames(){
  console.log("sim Games run");
// determine day of season
// getTeamMatchups - begin matchup loop
// get team 1 roster - pull from team array - check injury
// get team 2 roster
// start game loop

// post stats to matchup
// post stats to players
// back to matchup loop
// end

}