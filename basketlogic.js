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
var avoidBrokenLoop;
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
    teamGlanceFill(userArrayComplete.child("team").val());
  });
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
  var teamPoint = userArrayComplete.child("team").val();
  if(leagueArrayComplete){
    leagueArrayComplete.child(teamPoint).forEach(function(teamSnap) {
      var playerInfo=[];
      if(teamSnap.key() != "owner"){
        teamSnap.forEach(function(playerSnap) {
          playerInfo.push(playerSnap.val());
        });
      $('#teamGlance > tbody:last-child').append('<tr><td>'+teamSnap.key()+'</td><td>'+playerInfo[0]+'</td><td>'+playerInfo[1]+'</td><td>'+playerInfo[4]+'</td><td>'+playerInfo[11]+'</td><td>'+playerInfo[7]+'</td><td>'+playerInfo[2]+'</td><td>'+playerInfo[9]+'</td></tr>');
      }
    });
  }
}
//A NEW USER CALLS THIS FUNCTION WHEN JOINING A LEAGUE
function joinLeague(){
  console.log("join league run.");
  var leagueNumber=1;
  var foundLeague;
  var leaguePromise = wholeLeagueDeferred();
  leaguePromise.fail(function(){
    alert("leaguePromise failed: did not exist on firebase.");
  });
  leaguePromise.done(function(snap){
    snap.forEach(function(leagueSnap) {
      leagueNumber ++;
      leagueSnap.forEach(function(teamSnap){
        if(teamSnap.child("owner").val() == "compAI"){
          console.log("found available team");
          foundLeague = 1;
          fireRef.child('userArray').child(userId).child("league").set(leagueSnap.key());
          fireRef.child('userArray').child(userId).child("team").set(teamSnap.key());
          fireRef.child('leagueArray').child(leagueSnap.key()).child(teamSnap.key()).child("owner").set(userId);
          window.location.assign("fbs3.html");
          return true;
        }
      });
    });
    if(!foundLeague){
      console.log("no compAI team could be found.");
      if(avoidBrokenLoop != "leagueCreated"){createLeague(leagueNumber);}
    }
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
//RANDOM NUMBER
function randNum(min,max){
  adjMax = max-min;
  var tempNum = Math.floor((Math.random() * adjMax) + min);
  return tempNum;
}
//FIND A NUMBER NEAR THE APROXIMATE AVERAGE
function nearAverageRandom(startNum, min, max){
  // console.log ("nearAverageRandom run with: "+min+" "+max+" "+startNum);
  var num = Math.floor((max-min)/20)+1;
  for (var i = 0; i < 10; i++) {
    var smallNum = randNum(-Math.abs(num),num)+1;
    // console.log ("the small number is " +smallNum)
    startNum +=  smallNum;
    // console.log ("the nearAverageRandom numbers were: " +num+" "+smallNum+" "+startNum);
    if (startNum >max){startNum = max;}
    if (startNum <min){startNum = min;}
  }
  // console.log ("the nearAverageRandom numbers were: " +num+" "+smallNum+" "+startNum);
  return startNum;
}
//GENERATE PLAYER NAMES FROM GLOBAL NAME ARRAY
function generateName(){
  var tempName = "";
  var length = (firstNameArray.length) - 1;
  tempName =  firstNameArray[randNum(0,length)] +" " + firstNameArray[randNum(0,length)];
  return tempName;
}
//WHEN ALL AVAILABLE TEAMS ARE TAKEN BY PLAYERS CREATE A NEW LEAGUE
function createLeague(num){
  console.log("create league run");
  avoidBrokenLoop = "leagueCreated";''
  fireRef.child('leagueArray').child("league"+num).set({currentDay:1,year:2016,nameAssign:"FBS All-Stars"});
  for (var i = 16; i >= 0; i--) {
    // console.log("running team loop");
    createTeam("league"+num,"team"+i);
  };
  fireRef.child("leagueArray").child("league"+num).child("team16").child("").set({owner:"rookies",nameAssign:"rookies"});
  var tempMatchArray = createMatchups("league"+num);
  fireRef.child('leagueArray').child("league"+num).child("matchUps").set(tempMatchArray);
  joinLeague();
}
//CREATE TEAM
function createTeam(leagueName,teamName){
  // console.log("strings passed to create team: " +leagueName +teamName);
  var tempTeam;
  fireRef.child('leagueArray').child(leagueName).child(teamName).set({owner:"compAI",nameAssign:"BlueSocks"});
  for (var i = 7; i >= 0; i--) {
    // console.log("running player loop");
    addPlayer(0,leagueName,teamName);
  };
}
//CREATE PLAYER
function addPlayer(source,leagueName,teamName){
  var generatePlayer = [];
  //FILL GENPLAYER WITH [LEAGUE,TEAM,NAME,HEIGHT,CONTRACT,SPEED,SHOOTING,DEFENCE,POSTITION]
  if (source == "form"){
    generatePlayer.push($('#leagueName').val());
    generatePlayer.push($('#playerTeamInput').val());
    generatePlayer.push($('#playerNameInput').val());
    generatePlayer.push($('#playerHeightInput').val());
    generatePlayer.push($('#playerContractInput').val());
  }else{
    if(!leagueName){generatePlayer.push(userArrayComplete.child("league").val());}
    else{generatePlayer.push(leagueName)}
    if(!teamName){generatePlayer.push(userArrayComplete.child("team").val());}
    else{generatePlayer.push(teamName)}
    generatePlayer.push(generateName());
    generatePlayer.push(nearAverageRandom(72,60,84));
    generatePlayer.push(randNum(1,10));
  }
  // console.log("run add player" + generatePlayer[0]);
  generatePlayer.push("bench");
  generatePlayer.push(150+nearAverageRandom(60,0,150));
  generatePlayer.push(21+randNum(-4,5));
  var skillId = randNum(40,60);
  var potentialSkill = randNum(60,90);
  var tempAverage = skillId;
  var skillAverage = skillId;
  var goalAverage = skillId;
  var tempNum = 0;
  var switchPush;
  var skillArray=[];
  var totalAttribute = 8;
  for (var y = 0; y < 2; y++) {
    for (var i = 0; i < totalAttribute; i++) {
      var remainAttribute = totalAttribute - i;
      skillAverage = Math.floor(((goalAverage * totalAttribute ) - tempNum) / remainAttribute);
      var tempMin = 20;
      var tempMax = 100;
      var tempSkill = nearAverageRandom(skillAverage, tempMin ,tempMax);
      skillArray.push(tempSkill);
      tempNum = 0;
      var tempIndex = 0;
      $.each(skillArray, function( index, value ) {
        tempNum += value;
        tempIndex = index + 1;
      });
      tempAverage = Math.floor(tempNum / (tempIndex));
    };
    if(!switchPush){
      generatePlayer.push(skillAverage);
      tempAverage = potentialSkill;
      skillAverage = potentialSkill;
      goalAverage = potentialSkill;
      switchPush=1;
    }else{
      generatePlayer.push(skillAverage);
    }

    
  };
  for (var z = 0; z < totalAttribute; z++) {
    var adjNum = z+totalAttribute;
    if (skillArray[z]>skillArray[adjNum]) {
      // console.log("skill pot below current ability");
      skillArray[adjNum] = skillArray[z] + 5;
    };
  };

  fireRef.child("leagueArray").child(generatePlayer[0]).child(generatePlayer[1]).child(generatePlayer[2]).set({injury:false,injuryLength:1, height : generatePlayer[3], contract: generatePlayer[4], position: generatePlayer[5], weight: generatePlayer[6], age: generatePlayer[7], speed: skillArray[0], shooting: skillArray[1], defence: skillArray[2], ballControl: skillArray[3], endurance: skillArray[4], vision: skillArray[5], clutch: skillArray[6], rebounding: skillArray[7], speedPot: skillArray[8], shootingPot: skillArray[9], defencePot: skillArray[10], ballConPot: skillArray[11], endurPot: skillArray[12], visionPot: skillArray[13], clutchPot: skillArray[14], reboundPot: skillArray[15], avgSkill: generatePlayer[8], avgPot: generatePlayer[9], seasons:1});
  // console.log("created player: "+generatePlayer[2]);
}
//CHECK IF SIM IS DUE
function checkSim(){
  if(!leagueArrayComplete){console.log("league array not found locally.");}
  else{
    var nextDay = leagueArrayComplete.child('currentDay').val();
    nextDay++;
    if(Date.getDate()==1){nextDay=1;}
    fireRef.child('leagueArray').child(leagueArrayComplete.key()).child('currentDay').update(nextDay);
    // if(nextDay == 1){
    //   createMatchups(leagueArrayComplete.key());
    // }
    // else{simGames();}
  }
}
//SETUP MATCHUPS WHEN CREATING LEAGUE
function createMatchups(leagueName){
  var matchUpObject = {};
  for (var z = 1; z <83; z++) {
    matchUpObject[z]={team1:"team2"};
  };
  var tempTeam2;
  for (var x = 0; x <2; x++) {
    for (var y = 1; y <83; y++) {
      var dayRemain = (y%15)+1;
      tempTeam2=(x+dayRemain)%16;
      matchUpObject[y]["team"+x]="team"+tempTeam2;
    };
  };
  return matchUpObject;
}
//REMOVES NON-PLAYERS AND INJURED PLAYERS FROM GAME TEAM OBJECT
function onlyHealthy(obj, teamId){
  for(var playerSnap in obj){
    if(obj[playerSnap].hasOwnProperty("injury")){
        if (obj[playerSnap].injury){
          var changeVal =(leagueArrayComplete.child(teamId).child(playerSnap).child("injuryLength").val())-1;
          fireRef.child("leagueArray").child(leagueArrayComplete.key()).child(teamId).child(playerSnap).child("injuryLength").set(changeVal);
          if (changeVal <= 0){
            fireRef.child("leagueArray").child(leagueArrayComplete.key()).child(teamId).child(playerSnap).child("injury").set(false);
          }
          delete obj[playerSnap];
          console.log("removed injured player from team list and decreased injury length");
        }
    }else{
      delete obj[playerSnap];
      //console.log("removed non player from team list");
    }
  }
  return obj;
}
//SEARCH EACH OBJECT FOR EACH PLAYERS POSITION AND REPLACE IF NEEDED.
function findPosition(obj){
  var benchObj = {};
  var posObj={};
  for(var pName in obj){
    var posId = obj[pName].position;
    if (posId == "guard1"){posObj.g1 = obj[pName]}
    else if (posId == "forward1"){posObj.f1 = obj[pName]}
    else if (posId == "center1"){posObj.c1 = obj[pName]}
    else if (posId == "guard2"){posObj.g2 = obj[pName]}
    else if (posId == "forward2"){posObj.f2 = obj[pName]}
    else if (posId == "center2"){posObj.c2 = obj[pName]}
    else if (posId == "guard3"){posObj.g3 = obj[pName]}
    else if (posId == "forward3"){posObj.f3 = obj[pName]}
    else if (posId == "center3"){posObj.c3 = obj[pName]}
    else if (posId == "bench1"){posObj.b1 = obj[pName]}
    else if (posId == "bench2"){posObj.b2 = obj[pName]}
    else if (posId == "bench3"){posObj.b3 = obj[pName]}
      else{
        //console.log(pName+" is not assigned to a position.");
        benchObj[pName] = obj[pName];
      }
  }
  //COMPILE POSITION OBJECT HERE
  var orderObj={};
  orderObj.up1={man:{avgSkill: 3}};
  for(var player in benchObj){
    var i=1;
    console.log("player "+player);
    var finished = false;
    var tempSkill = benchObj[player].avgSkill;
    while(!finished){
      for(var nameSkill in orderObj["up"+i]){
        var skill = orderObj["up"+i][nameSkill].avgSkill;
        console.log("avg skill is: "+ skill);
        if(!skill){
          console.log("oops "+ skill);
          orderObj["up"+i][player] = benchObj[player];
          finished = "done";
          break;
        }
        if (tempSkill > skill){
          console.log("temp > skill "+ tempSkill);
          var nextUp = "up"+(i+1);
          console.log(nextUp);
          orderObj[nextUp] = orderObj["up"+i];
          orderObj["up"+i][player] = benchObj[player];
          for(var x in orderObj["up"+i]){
            console.log("current orderObj: " + x);
          }
          finished = "done";
          break;
        }else{
          console.log("temp < skill "+ tempSkill);
          i++;
          if(i>8){finished = "done";break;}
        }
      }
    }
  }
  var i = 1;
  if (!posObj.g1){posObj.g1 = placePosObj(orderObj, posObj, i); i++;}
  if (!posObj.f1){posObj.f1 = placePosObj(orderObj, posObj, i); i++;}
  if (!posObj.c1){posObj.c1 = placePosObj(orderObj, posObj, i); i++;}
  if (!posObj.g2){posObj.g2 = placePosObj(orderObj, posObj, i);}
  if (!posObj.f2){posObj.f2 = placePosObj(orderObj, posObj, i);}
  if (!posObj.c2){posObj.c2 = placePosObj(orderObj, posObj, i);}
  i++;
  if (!posObj.g3){posObj.g3 = placePosObj(orderObj, posObj, i); }
  if (!posObj.f3){posObj.f3 = placePosObj(orderObj, posObj, i); }
  if (!posObj.c3){posObj.c3 = placePosObj(orderObj, posObj, i); }
  i++;
  if (!posObj.b1){posObj.b1 = placePosObj(orderObj, posObj, i);i++;}
  if (!posObj.b2){posObj.b2 = placePosObj(orderObj, posObj, i);i++;}
  if (!posObj.b3){posObj.b3 = placePosObj(orderObj, posObj, i);i++;}
  for(var sStat in posObj){
    console.log("set status: "+sStat);
    posObj[sStat].curStatus = "bench";
  }
  for(var y in posObj){
    console.log("possition object item: " + y);
  }
  return posObj;
}
//USED TO FILL EMPTY TEAM POSITIONS.
function placePosObj(orderObj, obj,i){
  var tempObj={};
  for(skill in orderObj["up"+i]){
    console.log ("orderObj for in: "+skill)
    // var name = orderObj["up"+i][skill];
    tempObj[skill] = obj[skill];
  }
  return tempObj;
}
//ADVANCE DAY AND SIM GAMES.
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
  var currentDaySim = leagueArrayComplete.child("currentDay").val();
  var leagueObjectCopy = {currentDay: (currentDaySim+1)};
  leagueArrayComplete.child("matchUps").child(currentDaySim).forEach(function(matchSnap) {
    var team1Name = matchSnap.key();
    var team2Name = matchSnap.val();
    // leagueObjectCopy[team1Name] = leagueArrayComplete.child(team1Name).val();//CHANGED LOCATION OF RECORDING GAME
    //console.log("team1Players owner: "+leagueObjectCopy[team1Name].owner);
    var t1 = {}; 
    t1 = leagueArrayComplete.child(team1Name).val();
    var t2 = {}; 
    t2 = leagueArrayComplete.child(team2Name).val();
    t1 = onlyHealthy(t1, team1Name);
    t2 = onlyHealthy(t2, team2Name);
    // for(var y in t1){
    //   console.log("remaining object item: " + y);
    // }
    t1 = findPosition(t1);

  });
  console.log("completed matchup loop");
  //fireRef.child("leagueArray").child(leagueArrayComplete.key()).update(leagueObjectCopy);
}