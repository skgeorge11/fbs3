$(document).ready(console.log("JQuery ready"));
// CREATE A REFERENCE TO FIREBASE
var fireRef = new Firebase("https://fbs3.firebaseio.com/");
var playerRef = new Firebase("https://fbs3.firebaseio.com/playerArray/");
var teamRef = new Firebase("https://fbs3.firebaseio.com/teamArray/");
var userRef = new Firebase("https://fbs3.firebaseio.com/userArray/");
var seasonRef  = new Firebase("https://fbs3.firebaseio.com/seasonArray/");


//CHECK FOR LOCAL STORAGE
if(typeof(Storage) !== "undefined") {
    // Code for localStorage/sessionStorage.
    console.log ("Yes!  Web Storage support..");
} else {
    console.log ("Sorry! No Web Storage support..");
}

//CHECK FOR USER DUPLICATION/ SIGN IN
function go() {
  var userId = $('#userNameInput');
  var userPassword = $('#passwordInput');
  tryCreateUser(userId.val(), userPassword.val());
}

// Tries to set /users/<userId> to the specified data, but only
// if there's no data there already.
function tryCreateUser(userId, userData) {
  fireRef.child('userArray').child(userId).transaction(function(currentData) {
  if (currentData === null) {
    return (userId);
  } else {
    alert('User name already exists. Please choose a different user name.');
    return; // Abort the transaction.
  }
}, window.location.href = "fbs3.html"
    // function(error, committed, snapshot) {
    //    if (error) {
    //     console.log('Transaction failed abnormally!', error);
    //   } else if (!committed) {
    //     console.log('We aborted the transaction (because wilma already exists).');
    //   } else {
    //     console.log('User wilma added!');
    //   }
    // }
    );
}

//FILL TEAM INFO PAGE
function teamGlanceFill(teamName){
    var playerInfo;
    var playerPoint;
    teamRef.child(teamName).once('value', function (snapshot) {
        // The callback function will get called twice, once for "fred" and once for "barney"
        snapshot.forEach(function(childSnapshot) {
          // key will be "fred" the first time and "barney" the second time
          var childKey = childSnapshot.key();
          console.log(childKey);
          // childData will be the actual contents of the child
          var childData = childSnapshot.val();
          console.log(childData);
          playerRef.child(childKey).once('value', function (snapshot2){
            playerPoint = snapshot2.val();
            console.log(playerPoint.height);
            $('#tdOneName').text(snapshot2.key());
            $('#tdOneHeight').text(playerPoint.height + " inches");
            $('#tdOneContract').text(playerPoint.contract.amount);
          }, function (err) {
          console.log("team glance failed to find player list.");
          });
        });
      }, function (err) {
        console.log("team glance failed to find player list.");
    });

}

function addPlayer(){
  console.log("run add player");
  var teamId = $('#playerTeamInput').val();
  var playerId = $('#playerNameInput').val();
  var heightId = $('#playerHeightInput').val();
  var contractId = $('#playerContractInput').val();
  teamRef.child(teamId).child(playerId).set({injury:"true"});
  playerRef.child(playerId).set({"height":heightId, "contract":{amount:contractId}});
}