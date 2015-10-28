$(document).ready(console.log("JQuery ready"));

// CREATE A REFERENCE TO FIREBASE
var fireRef = new Firebase("https://fbs3.firebaseio.com/");

//GLOBAL VARIABLES

// var Cookies2 = Cookies.noConflict();  //AN OPTION IF DOCUMENT COOKIES CONFLICTS.
var userArrayComplete;
var leagueArrayComplete;
var userId;
var userPassword;
console.log("variables reset to null !!!");


//AUTOMATIC SCRIPT RUN ON LOAD BELOW

if(window.location.origin != "file://"){console.log("browser cookies enabled? "+navigator.cookieEnabled);}

//CHECK FOR LOCAL STORAGE
if(typeof(Storage) !== "undefined") {
    // Code for localStorage/sessionStorage.
    console.log ("Yes!  Web Storage support..");
    userId = localStorage.localUserId;
    userPassword = localStorage.localUserPassword;
} else {
    console.log ("Sorry! No Web Storage support..");
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
//USERID AND PASSWORD INFO IS CHECKED AGAINST FIREBASE
function checkPassword(origin){
  var userIdPromise = userPromiseData(userId);
  userIdPromise.fail(function(){
    console.log("userId did not exist on firebase.");
    if (origin === "createUser"){
      console.log("created new user.")
      fireRef.child('userArray').child(userId).set({password : userData});
      window.location.assign("fbs3.html");
    }
  });
  userIdPromise.done(function(userSnap){
    if (userPassword == userSnap.child("password").val()){
      userArrayComplete = userSnap;
      console.log("userArrayComplete: " + userArrayComplete.key());
      localStorage.localUserId = userSnap.key();
      localStorage.localUserPassword = userSnap.child("password").val();
      console.log("password matches");
      Cookies.set('userArrayCookie', userArrayComplete);
      if(window.location.origin != "file://"){console.log("cookie written: "+Cookies.get('userArrayCookie'));}
      window.location.assign("fbs3.html");
    }
    else{
      alert("Sorry! wrong password..");
      if(origin === "indexCheck"){
        window.location.assign("index.html");
      }
    }
  });
}
//CHECK FOR USER DUPLICATION OR CORRECT ON SIGN IN
function go() {
  userId = $('#userNameInput').val();
  userPassword = $('#passwordInput').val();
  checkPassword("createUser");
}
//RESET USER STATE ON LOCAL STORAGE
function resetUser(){
  localStorage.localUserId = null;
  localStorage.localUserPassword = null;
  localStorage.localLeagueArray = null;
  console.log("reset local storage. userID now: " + localStorage.localUserId);
}