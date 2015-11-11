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


//CHECK FOR LOCAL STORAGE
if(window.location.origin == "file://"){
    var isChromium = window.chrome;
    var vendorName = window.navigator.vendor;
    var isOpera = window.navigator.userAgent.indexOf("OPR") > -1;
    var isIEedge = window.navigator.userAgent.indexOf("Edge") > -1;
    if(isChromium !== null && isChromium !== undefined && vendorName === "Google Inc." && isOpera == false && isIEedge == false) {
       console.log("its a local server, and chrome browser. cookies may not be available.");
        storageType = "file";
    } else {
       console.log("its a local server, but does not register as chrome browser.");
    }
}
if(navigator.cookieEnabled && storageType != "file") {
    storageType ="cookie";
    userId = Cookies.get('userIdCookie');
    userPassword =Cookies.get('userPasswordCookie');
    //leagueArrayComplete = Cookies.get('leagueArrayCookie');
    userArrayComplete = Cookies.get('userArrayCookie');
    console.log("cookies enabled: "+userId);
}else if(typeof(Storage) !== "undefined") {
    storageType = "local";
    userId = localStorage.localUserId;
    userPassword = localStorage.localUserPassword;
    userLeagueName = localStorage.localUserLeague;
    userTeamName = localStorage.localUserTeam;
    // leagueArrayComplete = localStorage.localLeagueArray;
    // var retrievedObject = localStorage.getItem('localUserArray');
    // userArrayComplete = JSON.parse(retrievedObject);
    // console.log(userArrayComplete);
    //userArrayComplete = localStorage.localUserArray;
    console.log("user variables taken from localStorage: "+userId);
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
  console.log("user id is: "+userId);
  var userIdPromise = userPromiseData(userId);
  userIdPromise.done(function(userSnap){
    if(!userSnap.child("password").val()){
      console.log("userId did not exist on firebase.");
      if (origin === "createUser"){
        console.log("created new user.")
        var d = new Date();
        fireRef.child('userArray').child(userId).set({password : userPassword, login: d});
        localStorage.localUserId = userId;
        localStorage.localUserPassword = userPassword;
        window.location.assign("fbs3.html");
        return true;
      }
    }
    if (userPassword == userSnap.child("password").val()){
      userArrayComplete = userSnap;
      console.log("userArrayComplete: " + userArrayComplete.key());
      localStorage.localUserId = userSnap.key();
      localStorage.localUserPassword = userSnap.child("password").val();
      console.log("password matches");
      Cookies.set('userArrayCookie', userArrayComplete);
      Cookies.set('userPasswordCookie', userPassword);
      Cookies.set('userIdCookie', userId);
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
  localStorage.localUserId = undefined;
  localStorage.localUserPassword = undefined;
  localStorage.localUserLeague=undefined;
  localStorage.localUserTeam = undefined;
  Cookies.remove('userIdCookie');
  Cookies.remove('userPasswordCookie');
  Cookies.remove('userArrayCookie');
  console.log("reset local storage. userID now: " + localStorage.localUserId);
  window.location.assign("index.html");
}