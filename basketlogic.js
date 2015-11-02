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
var t1G;
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
  fireRef.child("leagueArray").child("league"+num).child("team16").update({owner:"rookies",nameAssign:"rookies"});
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

  fireRef.child("leagueArray").child(generatePlayer[0]).child(generatePlayer[1]).child(generatePlayer[2]).set({stats:{game:0,gameStart:0,play:0,point:0,fBPoint:0,pointer3:0,pointer2:0,dunk:0,freeThrow:0,miss:0,missFt:0,assist:0,board:0,steal:0,block:0,drive:0,turnOver:0,foul:0},injury:false,injuryLength:1, height : generatePlayer[3], contract: generatePlayer[4], position: generatePlayer[5], weight: generatePlayer[6], age: generatePlayer[7], speed: skillArray[0], shooting: skillArray[1], defence: skillArray[2], ballControl: skillArray[3], endurance: skillArray[4], vision: skillArray[5], clutch: skillArray[6], rebounding: skillArray[7], speedPot: skillArray[8], shootingPot: skillArray[9], defencePot: skillArray[10], ballConPot: skillArray[11], endurPot: skillArray[12], visionPot: skillArray[13], clutchPot: skillArray[14], reboundPot: skillArray[15], avgSkill: generatePlayer[8], avgPot: generatePlayer[9], seasons:1});
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
  //console.log("find position run");
  var benchObj = {};
  var posObj={};
  for(var pName in obj){
    //console.log("pName = "+pName);
    var posId = obj[pName].position;
    if (posId == "guard1"){posObj.g1 = obj[pName];console.log("g1 assigned");}
    else if (posId == "forward1"){posObj.f1[pName] = obj[pName];console.log("f1 assigned");}
    else if (posId == "center1"){posObj.c1[pName] = obj[pName];console.log("c1 assigned");}
    else if (posId == "guard2"){posObj.g2[pName] = obj[pName];console.log("g2 assigned");}
    else if (posId == "forward2"){posObj.f2[pName] = obj[pName];console.log("f2 assigned");}
    else if (posId == "center2"){posObj.c2[pName] = obj[pName];console.log("c2 assigned");}
    else if (posId == "guard3"){posObj.g3[pName] = obj[pName];console.log("g3 assigned");}
    else if (posId == "forward3"){posObj.f3[pName] = obj[pName];console.log("f3 assigned");}
    else if (posId == "center3"){posObj.c3[pName] = obj[pName];console.log("c3 assigned");}
    else if (posId == "bench1"){posObj.b1[pName] = obj[pName];console.log("b1 assigned");}
    else if (posId == "bench2"){posObj.b2[pName] = obj[pName];console.log("b2 assigned");}
    else if (posId == "bench3"){posObj.b3[pName] = obj[pName];console.log("b3 assigned");}
      else{
        //console.log(pName+" is not assigned to a position.");
        benchObj[pName] = obj[pName];
      }
  }
  // for(var y in benchObj){
  //   console.log("bench object item: " + y);
  // }
  //COMPILE POSITION OBJECT HERE
  var orderObj={};
  //orderObj.up1={man:{avgSkill: 3}};
  // for(var player in benchObj){
  //   var i=1;
    //console.log("player "+player);
    // var finished = false;
    // var tempSkill = benchObj[player].avgSkill;
    // while(!finished){
    //   for(var nameSkill in orderObj["up"+i]){
    //     var skill = orderObj["up"+i][nameSkill].avgSkill;
    //     //console.log("avg skill is: "+ skill);
    //     if(!skill){
    //       console.log("oops "+ skill);
    //       orderObj["up"+i][player] = benchObj[player];
    //       finished = "done";
    //       break;
    //     }
    //     if (tempSkill > skill){
    //       console.log("temp > skill "+ tempSkill);
    //       var nextUp = "up"+(i+1);
    //       //console.log(nextUp);
    //       orderObj[nextUp] = orderObj["up"+i];
    //       orderObj["up"+i]={};
    //       orderObj["up"+i][player] = benchObj[player];
    //       for(var x in orderObj["up"+i]){
    //         //console.log("current orderObj: " + x);
    //       }
    //       finished = "done";
    //       break;
    //     }else{
    //       console.log("temp < skill "+ tempSkill);
    //       i++;
    //       if(i>8){finished = "done";break;}
    //     }
    //   }
    // }
  //}
  orderObj = benchObj;// temp fix.
  // for(var y in orderObj){
  //   console.log("order object item: " + y);
  // }
  for(var y in posObj){
    console.log("possition object item: " + y);
  }
  var i = 1;
  if (!posObj.g1){posObj.g1 = placePosObj(orderObj, obj, i); i++;}
  if (!posObj.f1){posObj.f1 = placePosObj(orderObj, obj, i); i++;}
  if (!posObj.c1){posObj.c1 = placePosObj(orderObj, obj, i); i++;}
  if (!posObj.g2){posObj.g2 = placePosObj(orderObj, obj, i);}
  if (!posObj.f2){posObj.f2 = placePosObj(orderObj, obj, i);}
  if (!posObj.c2){posObj.c2 = placePosObj(orderObj, obj, i);}
  i++;
  if (!posObj.g3){posObj.g3 = placePosObj(orderObj, obj, i); }
  if (!posObj.f3){posObj.f3 = placePosObj(orderObj, obj, i); }
  if (!posObj.c3){posObj.c3 = placePosObj(orderObj, obj, i); }
  i++;
  if (!posObj.b1){posObj.b1 = placePosObj(orderObj, obj, i);i++;}
  if (!posObj.b2){posObj.b2 = placePosObj(orderObj, obj, i);i++;}
  if (!posObj.b3){posObj.b3 = placePosObj(orderObj, obj, i);i++;}
  for(var sStat in posObj){
    //console.log("set status: "+sStat);
  }
  // for(var y in posObj){
  //   console.log("possition object item: " + y);
  // }
  return posObj;
}
//USED TO FILL EMPTY TEAM POSITIONS.
function placePosObj(orderObj, obj,i){
  //console.log("place pos obj run");
  var tempObj={};
  var y = 1;
  for(var player in orderObj){
    //console.log ("orderObj for in: "+player);
    if(i==y){
      tempObj[player] = obj[player];
    }
    y++;
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
  //BEGIN MATCH LOOP
  leagueArrayComplete.child("matchUps").child(currentDaySim).forEach(function(matchSnap) {
    var team1Name = matchSnap.key();
    var team2Name = matchSnap.val();
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
    t2 = findPosition(t2);
    t1.score = 0;
    t2.score = 0;
    var t1G,t1F,t1C,t2G,t2F,t2C;
    var offencePlay ="t1";
    //BEGIN GAME LOOP
    for(var gameLength = 2; gameLength > 0; gameLength-- ){
      //CHECK EDURANCE ON STARTERS
      t1G = checkEndur(t1, "g1", t1G);
      // for(var y in t1G){
      //   console.log("t1G: play stat: " +t1G[y].stats.play);
      // }
      t1F = checkEndur(t1, "f1", t1F);
      t1C = checkEndur(t1, "c1", t1C);
      t2G = checkEndur(t2, "g1", t2G);
      t2F = checkEndur(t2, "f1", t2F);
      t2C = checkEndur(t2, "c1", t2C);
      //ADD ENDURANCE TO BENCH (ALTHOUGH TECHNICALY TO ALL PLAYERS SINCE I PLAN TO OVER WRITE STARTERS LATER)
      for(var pos in t1){
        for(var player in t1[pos]){
          //console.log("default endurance"+ leagueArrayComplete.child(team1Name).child(player).child("endurance").val());
          if(leagueArrayComplete.child(team1Name).child(player).child("endurance").val() > t1[pos][player].endurance){
            t1[pos][player].endurance +=2;
          }
        }
      }
      for(var pos in t2){
        for(var player in t2[pos]){
          if(leagueArrayComplete.child(team2Name).child(player).child("endurance").val() > t2[pos][player].endurance){
            t2[pos][player].endurance +=2;
          }
        }
      }
      //BALL IS PASSED INBOUNDS AND DRIBBLED TO POS 3
      if (offencePlay == "t1"){
        var playResult = runPlay(t1G,t1F,t1C,t2G,t2F,t2C);
        t1G =  playResult.oG;
        t1F =  playResult.oF;
        t1C = playResult.oC;
        t2G =  playResult.dG;
        t2F =  playResult.dF;
        t2C = playResult.dC;
        //console.log(t1G);
      }
      else if (offencePlay == "t2"){
        var playResult = runPlay(t2G,t2F,t2C,t1G,t1F,t1C);
        t1G =  playResult.dG;
        t1F =  playResult.dF;
        t1C = playResult.dC;
        t2G =  playResult.oG;
        t2F =  playResult.oF;
        t2C = playResult.oC;
      }else{
        console.log("!!! Warning, no team on offence!!!");
      }

    }
    console.log("completed game loop");
  });
  console.log("completed matchup loop");
  //fireRef.child("leagueArray").child(leagueArrayComplete.key()).set( i dont know yet);
}
//LOOP A PLAY UNTIL TURNOVER
function runPlay(offG, offF, offC, defG, defF, defC){
  //console.log(offG);
  var decision;
  var fastBreak=false;
  var ballPosition = 4;
  var finish={};
  var gameObj={};
  //HAVE GUARD DRIBLE ACROSS HALF COURT.
  var dribble = dribbleCheck(offG, defG);
  if (dribble) {
    console.log("drible true");
    for(var y in offG){
      offG[y].stats.drive += 1;
      ballPosition -=1;
      //console.log(offG[y].stats.drive);
    }
  }else if(!dribble){
    ///console.log("drible false");
      for(var y in offG){
        offG[y].stats.turnOver += 1;
      }
      for(var y in defG){
        defG[y].stats.steal += 1;
        console.log("defG stole the ball. start fast break.");
        defG[y] = runFastBreak(defG[y]);
      }
  }
  else{console.log("!!!warning. dribble function returned niether true nor false.");
  }
  //GUARD HAS MADE TO HALFCOURT, NOW VISION CHECK
  decision = runVisionCheck(offG,defG);

  gameObj = {oG:offG,oF:offF,oC:offC,dG:defG,dF:defF,dC:defC}
  return gameObj;
}
//CHECK ENDURANCE OF EACH STARTER
function checkEndur(team, startPos, curPlayer){
  //console.log("checkEndur run");
  var done = false;
  var tempPlayer={};
  if(typeof curPlayer !== 'undefined'){
    for(var player in curPlayer){
       //console.log("current player "+curPlayer[player]["endurance"]);
      if(curPlayer[player].endurance > 1){
        curPlayer[player].endurance -= 1;
        if(typeof curPlayer[player].stats == 'undefined'){
          curPlayer[player].stats={};
          console.log("constructed stats object1");
        }
        curPlayer[player].stats.play += 1;
        tempPlayer[player] = curPlayer[player];
        done = true;
      }
    }
  }
  if (!done){
    for(var target in team[startPos]){
      //console.log("first check"+ team[startPos][target]["endurance"]);
      if (team[startPos][target].endurance > 19){
        team[startPos][target].endurance -= 1;
        if(typeof team[startPos][target].stats == 'undefined'){
          team[startPos][target].stats={};
          console.log("constructed stats object2");
        }
        team[startPos][target].stats.play += 1;
        tempPlayer[target] = team[startPos][target];
        done = true;
      }
    }
  }
  if (!done){
    for(var position in team){
      //console.log("position" + position);
      if(position != "f1" && position != "f2" && position != "f3" && position != "c1" && position != "c2" && position != "c3"){
        //console.log("position not a forward or center");
        for(var target in team[position]){
          //console.log("second check"+ team[possition][target]["endurance"]);
          if (team[possition][target].endurance > 19){
            team[possition][target].endurance -= 1;
            if(typeof team[possition][target].stats == 'undefined'){
              team[possition][target].stats={};
              console.log("constructed stats object3");
            }
            team[possition][target].stats.play += 1;
            tempPlayer[target] = team[possition][target];
            done = true;
          }
        }
      }
    }
  }
  if (!done){
    console.log("major problem!! no position player started!!!!!!");
  }
  return tempPlayer;
}
//CHECK DRIBBLE PAST DEFENDER
function dribbleCheck(hasBall,defendBall){
  var noRepeat;
  //console.log("dribble check has run.");
  for(var has in hasBall){
    //console.log("has ball speed: "+ hasBall[has].speed);
    var hs = hasBall[has].speed;
    var hb = hasBall[has].ballControl;
    for(var defend in defendBall){
      if(!noRepeat){
        var ds = defendBall[defend].speed;
        var dd = defendBall[defend].defence;
        var chance = (((hs+hb)-(ds+dd))*.2)+80;
        //console.log("chance "+chance);
        var roll = randNum(0,100);
        if (roll < chance) {
          return true;
          noRepeat = 1;
        }else{
          return false;
          noRepeat = 1;
        }
      }
    }
  }
}
//FAST BREAK STATS. recieves player object not position.
function runFastBreak(player){
  player.stats.dunk += 1;
  player.stats.fBPoint += 2;
  player.stats.point += 2;
  return player;
}
//CHECK IF THE POSITION PLAYER PASSES HIS VISION CHECK
function runVisionCheck(offG,defG){
  var decision = "pass";
  var vision;
  for (x in offG){
    vision = offG[x].vision;
    var check = randNum(0,100);
    if (vision > check){
      //CHECK TO SEE IF THE OFF HAS A GOOD CHANCE TO SHOOT OR DRIVE. ELSE PASS

    } else{

    }
  }
  return decision;
}
//PASS THE BALL
//SHOOT THE BALL