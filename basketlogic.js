$(document).ready(console.log("JQuery ready"));
// CREATE A REFERENCE TO FIREBASE
var fireRef = new Firebase("https://fbs3.firebaseio.com/");
var userId = localStorage.localUserId;
var userPassword;
//var userLeaguePromise = userPromiseData();
var userTeam;

function userPromiseData(){
  var userDeferred = $.Deferred();
  fireRef.child('userArray').child(userId).once('value',
    function (snap) {
      var snapPassVal = snap.child("password").val();
      if(snapPassVal === userPassword){
          userDeferred.resolve(snap.child("league").val());
          userTeam = snap.child("team").val();
      }
    });
  console.log("userPromiseData ran: "+userId);
  return userDeferred.promise();
}


//CHECK FOR LOCAL STORAGE
if(typeof(Storage) !== "undefined") {
    // Code for localStorage/sessionStorage.
    console.log ("Yes!  Web Storage support..");
} else {
    console.log ("Sorry! No Web Storage support..");
}

//CHECK FOR USER DUPLICATION/ SIGN IN
function go() {
  userId = $('#userNameInput');
  userPassword = $('#passwordInput');
  tryCreateUser(userId.val(), userPassword.val());
}
// Tries to set /users/<userId> to the specified data
function tryCreateUser(userId, userData) {
  //var userDeferred = $.Deferred();
  fireRef.child('userArray').child(userId).once('value',
    function (snap) {
      var snapVal = snap.val();
      var snapPassVal = snap.child("password").val();
      if (snapPassVal != null) {
        console.log("user already exists.")
        if(snapPassVal === userData){
          console.log("password matches");
          localStorage.localUserId = userId;
          localStorage.localUserPassword = userData;
          window.location.assign("fbs3.html");
        } else {
          alert("password doesn't match");
        }
      } else {
        console.log("user snap is undefined.")
        fireRef.child('userArray').child(userId).set({password : userData});
        window.location.assign("fbs3.html");
      }
  });
}

function teamSnapshotFunction (tempLeague, tempTeam){
  var teamDeferred = $.Deferred();
  fireRef.child("leagueArray").child(tempLeague).child("teamArray").child(tempTeam).once('value', function (snap){
    teamDeferred.resolve(snap);
  });
  return teamDeferred.promise();
}

//FILL TEAM INFO PAGE
function teamGlanceFill(teamName){
    console.log ("teamGlanceFill initiated: " +userLeaguePromise);
    var playerInfo;
    var playerPoint;
    var userLeaguePromise = userPromiseData();
    console.log("pending leaguePromise: " + userLeaguePromise);
    userLeaguePromise.done(function(n){
      console.log("leaguePromise ran");
      // var teamSnapshot = teamSnapshotFunction(userLeaguePromise,userTeam);
      // teamSnapshot.done(function(snap){
      //   console.log("teamPromise ran: ");
      //   // The callback function will get called twice, once for each child
      //   snap.forEach(function(childSnap) {
      //     console.log("for each child")
      //     // childData will be the actual contents of the child
      //     $('#tdName1').text(childSnap.key());
      //     $('#tdHeight1').text(childSnap.height.val() + " inches");
      //     $('#tdContract1').text(childSnap.contract.amount.val());
      //   });
      // });
    }).fail(function () {
            console.log("failed leaguePromise");
      });
}

function addPlayer(){
  var currentLeague = $('#leagueName').val();
  console.log("run add player");
  var teamId = $('#playerTeamInput').val();
  var playerId = $('#playerNameInput').val();
  var heightId = $('#playerHeightInput').val();
  var contractId = $('#playerContractInput').val();
  fireRef.child("leagueArray").child(currentLeague).child(teamId).child(playerId).set({injury:"true", height : heightId, contract: {amount:contractId}});
}

function simGames(){
// determine day of season
// getTeamMatchups - begin matchup loop
// get team 1 roster - pull from team array - check injury
// get team 2 roster
// start game loop

// post stats to matchup
// post stats to players
// back to matchup loop
// end
var currentLeague = $('#leagueInput').val();
console.log(currentLeague);
var currentYear = 0;
var currentDay = 0;
var firstTeam = "0";
var secondTeam = "0";

//CREATE DEFFERED LEAGUE DATA
function leaguePromiseData(){
  var leagueDeferred = $.Deferred();
  fireRef.child("leagueArray").child(currentLeague).once('value',
  function (snap) {leagueDeferred.resolve(snap);});
  return leagueDeferred.promise();
}
var leaguePromise = leaguePromiseData();

// GET LEAGUE, YEAR, day
leaguePromise.done(function(league){
  currentYear  = league.child("year").val();
  console.log(currentYear);
  currentDate = league.child("currentDay").val();
  console.log("currently day "+currentDate);
  // FIND MATCHUPS
  league.child("day"+currentDate).forEach(function(teamMatch) {
      console.log(teamMatch.key());//child("match1").child("Giraffes").val()
      teamMatch.forEach(function(teamName) {
          console.log("ran teamName child");
          firstTeam = teamName.key();
          secondTeam = teamName.val();
      });

    console.log("the two teams are "+firstTeam+secondTeam);

      // league.child(firstTeam).forEach(function(childLeague){

      // });

    });

  });


}