$(document).ready(console.log("JQuery ready"));
// CREATE A REFERENCE TO FIREBASE
var fireRef = new Firebase("https://fbs3.firebaseio.com/");

//GLOBAL VARIABLES
var lastNameArray = [];
var firstNameArray = ["Quincy","Lavoy","Giannis","Jordan","Tony","Carmelo","Stevens","Arron","Pero","Dimetrios","Chris","Trevor","Alexis","Alan","Darrel","Furkan","James","Brandon","Cole","Justin","Omar","LaMarcus","Kyle","Augustin","Alexanders","Ayer"];
var simRate = 86400000;//6 HOURS PER SIM IS 21600000
var userArrayComplete;
var leagueArrayComplete;
var leagueCreateName;
var teamCreateName;
var userId;
var userPassword;
var userLeagueName;
var userTeamName;
var playerName ;
var userLoginDate;
var avoidBrokenLoop;
var avoidListenLoop=0;
var playerLinkName=[];
var storageType="url";
 console.log("variables reset to null state");

//AUTOMATIC SCRIPT RUN ON LOAD BELOW

//CHECK FOR LOCAL STORAGE
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
    userArrayComplete = Cookies.get('userArrayCookie');
    playerName = Cookies.get('playerNameCookie');
    console.log("cookies enabled: "+userId);
}else if(typeof(Storage) !== "undefined") {
    storageType = "local";
    userId = localStorage.localUserId;
    userPassword = localStorage.localUserPassword;
    userLeagueName = localStorage.localUserLeague;
    userTeamName = localStorage.localUserTeam;
    playerName = localStorage.localPlayerName;
    console.log("user variables taken from localStorage: "+userId);
  }

//LISTENER FOR ANY CHANGES IN LEAGUE INFO. HOPEFULLY WILL REDUCE OVERALL FIREBASE TRANSACTIONS.
var leagueListener = fireRef.on('child_changed', function(childSnap) {
  avoidListenLoop ++;
  if (avoidListenLoop == 1){
    console.log("league data changed per listener.");
    setTimeout(function(){
      leagueArrayComplete= 0;
      var path = window.location.pathname;
      var page = path.split("/").pop();
      console.log( page );
      if (page == 'freeagent.html'){teamName = "team16";}
      if (typeof teamName == 'undefined'){
        if(storageType =="local"){
          teamName = localStorage.localUserTeam;
        }
        else if(storageType=="cookie"){
          var tempCookie = Cookies.get('userArrayCookie');
          teamName = tempCookie.team;
        }
        else{window.location.assign("fbs3.html"); return true;}
      }
      avoidListenLoop = 0;
      leagueArrayCheck(teamName);
    }, 5000);
  }
});

//CALLED FUNCTIONS BELOW

function goAgents(){window.location.assign("freeagent.html");}
function goFbs3(){window.location.assign("fbs3.html");}
function goLeague(){window.location.assign("leaguepage.html");}

//QUICK DATE COMPARISION FUNCTION.
function compDate(){
  var oldDatePromise = datePromise();
  var nextDate = new Date();
  oldDatePromise.done(function(snap){
    if(+nextDate > snap.val()){console.log("worked");}
    else{console.log("didn't work. snap is "+snap.val()+ " and nextDate is "+(+nextDate));}
  });
}
function datePromise(){
  var dateDeferred = $.Deferred();
  fireRef.child('date').once('value', function (snap) {
       dateDeferred.resolve(snap);
    }
  );
  console.log("datePromiseData ran");
  return dateDeferred.promise();
}

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
function leagueArrayCheck(teamName){
  console.log("run league array check");
  if(typeof leagueArrayComplete != 'object'){
    if(userArrayComplete.child("league").val()){var leaguePromise = leagueSnapshot(userArrayComplete.child("league").val()); console.log("used userArrayComplete.child");}
    else if(userLeagueName){var leaguePromise = leagueSnapshot(userLeagueName); console.log("used userLeagueName");}
    else{alert("ERROR 79: league array check was run without a user league name.");}
    leaguePromise.fail(function(){
      alert("leaguePromise failed: did not exist on firebase.");
    });
    leaguePromise.done(function(snap){
      leagueArrayComplete = snap;
      $('#teamContain').css("display","inline-block");
      console.log("retrieved league array. Name: "+leagueArrayComplete.key());
      if(teamName){teamGlanceFill(teamName);}
      else if(userArrayComplete.child("team").val()){teamGlanceFill(userArrayComplete.child("team").val());}
      else if(userTeamName){teamGlanceFill(userTeamName);}
      else{alert("ERROR 95: attempted to run teamGlanceFill without team name.");}
    });
  }else{
    console.log("retrieved league array saved locally. Name: "+leagueArrayComplete.key());
    if(teamName){teamGlanceFill(teamName);}
    else if(userArrayComplete.child("team").val()){teamGlanceFill(userArrayComplete.child("team").val());}
    else if(userTeamName){teamGlanceFill(userTeamName);}
    else{alert("ERROR 95: attempted to run teamGlanceFill without team name.");}
  }
}
//GRAB LEAGUE ARRAY FOR USE THROUGHOUT GAME.
function leagueSnapshot (tempLeague){
  var leagueDeferred = $.Deferred();
  fireRef.child("leagueArray").child(tempLeague).once('value', function (snap){
    leagueDeferred.resolve(snap);
  });
  return leagueDeferred.promise();
}
//CHECK FOR LOCATION OF HOSTED PAGE DATA
function teamGlanceCheck(teamName){
  if(typeof userArrayComplete != 'object' || !userLeagueName){
    console.log("user array not available locally, should be undefined below: "); console.log(userArrayComplete);
    var userPromise = userPromiseData(userId);
    userPromise.done(function(userSnap){
      userArrayComplete = userSnap;
      if(storageType =="local"){
        //localStorage.setItem('localUserArray', JSON.stringify(userArrayComplete));
        //localStorage.localUserArray = userSnap;
        localStorage.localUserLeague = userSnap.child("league").val();
        localStorage.localUserTeam = userSnap.child("team").val();
        localStorage.localUserId = userSnap.key();
        localStorage.localUserPassword = userSnap.child("password").val();
      }
      if(storageType=="cookie"){
        Cookies.set('userArrayCookie', userSnap);
        Cookies.set('userIdCookie', userSnap.key());
        Cookies.set('userPasswordCookie', userSnap.child("password").val());
      }
      console.log("userArrayComplete: " + userArrayComplete.key());
      if(!userSnap.child("team").val()){$('#buttonContain').css("display","inline-block");}
      else{teamGlanceFill(teamName);}
    });
  }else{
    if (!teamName){
      if(userArrayComplete.child("team").val()){teamName = userArrayComplete.child("team").val();}
      else if (userTeamName){teamName = userTeamName;}
      else{alert("ERROR 135: team glance fill attempted to run without teamName being defined.");}
    }
    teamGlanceFill(teamName);
  }
}
//FILL TEAM INFO PAGE
function teamGlanceFill(teamName){
  console.log ("teamGlanceFill initiated: " +teamName);
  if (typeof leagueArrayComplete!= "object"){
    console.log("league array did not exist locally: ");
    console.log(typeof leagueArrayComplete);
    if (userArrayComplete.child("league").val() || userLeagueName){
      leagueArrayCheck(teamName);
      return true;
    }else{
      $('#buttonContain').css("display","inline-block");
      return true;
    }
  }else{
    console.log("league array saved locally. Name: "+leagueArrayComplete.key());
    checkSim();
    teamYearCheck(teamName);
    depthFill();
    var path = window.location.pathname;
    var page = path.split("/").pop();
    console.log( page );
    if (page == 'freeagent.html'){teamName = "team16";}
    $('#teamContain').css("display","inline-block");
    $('#teamGlance > tbody').html('');
    var i=0;
    leagueArrayComplete.child(teamName).forEach(function(teamSnap) {
      var playerInfo=[];
      var playerAge = 0;
      if(teamSnap.key() != "owner" && teamSnap.key() != "nameAssign" && teamSnap.key() != "tYear" && teamSnap.key() !=    "stats"){
        teamSnap.forEach(function(playerSnap) {
          if(typeof playerSnap.val() !="object"){playerInfo.push(playerSnap.val());}
          if(playerSnap.key() == "draft"){
            var tempNum = leagueArrayComplete.child("year").val()-playerSnap.val();
            playerAge=playerInfo[0]+tempNum;
          }
        });
        playerLinkName.push(teamSnap.key());
        $('#teamGlance > tbody:last-child').append('<tr id="member'+i+'"><td>'+teamSnap.key()+'</td><td>'+playerAge+'</td><td>'+playerInfo[13]+"in."+'</td><td>'+playerInfo[2]+"/"+playerInfo[1]+'</td><td>'+playerInfo[19]+"/"+playerInfo[20]+'</td><td>'+playerInfo[8]+"/"+playerInfo[9]+'</td><td>'+playerInfo[4]+"/"+playerInfo[3]+'</td><td>'+playerInfo[18]+"/"+playerInfo[17]+'</td><td>'+playerInfo[21]+"/"+playerInfo[22]+'</td><td>'+playerInfo[12]+"/"+playerInfo[11]+'</td><td>'+playerInfo[23]+"/"+playerInfo[24]+'</td><td>'+playerInfo[5]+"/"+playerInfo[6]+'</td><td>'+playerInfo[14]+'</td></tr>');
        i++;
      }
    });
  }
  for (var t = 0; t <i; t++) {
    (function(t){
      $('#member' + t).click(function() {
        console.log(playerLinkName[t]);
        if(storageType =="local"){
          localStorage.localPlayerName = playerLinkName[t];
        }
        else if(storageType=="cookie"){
          Cookies.set('playerNameCookie', playerLinkName[t]);
        }else{playerName = playerLinkName[t];}
        window.location.assign("playerpage.html");
      });
    })(t);
    if(t>100){break;}

  }
}
//CHECK THE TEAM YEAR WITH THE LEAGUE YEAR TO SEE IF THE TEAM IS CURRENT.
function teamYearCheck(teamName){
  console.log("comparing the tYear of "+teamName);
  var counter = 0;
  var leagueYear = leagueArrayComplete.child("year").val();
  var teamYear = leagueArrayComplete.child(teamName).child("tYear").val();
  console.log("The league year is: "+leagueYear+", and the team year is: "+teamYear);
  while(leagueYear>teamYear){
    counter++;
    if(counter>2){alert("ERRor 245: broken loop while updating team.");break;}
    leagueArrayComplete.child(teamName).forEach(function(playerSnap){
      if(typeof playerSnap.val() == 'object' && playerSnap.key() != "stats"){
        //NEEDED: CHANGE ALL PLAYERS AGING STATS AND UPDATE THEM IN FIREBASE.
        console.log("aging player "+playerSnap.key()+ " by one year");
        if(playerSnap.child("shootingPot").val() > playerSnap.child("shooting").val()){
          console.log(playerSnap.key() + " shooting has been increased.");
        }
      }else{console.log("player "+playerSnap.key()+ " found to not be a player object");}
    });
    teamYear ++;
    console.log("added one to the team year: "+teamYear);
    fireRef.child("leagueArray").child(leagueArrayComplete.key()).child(teamName).update({tYear:teamYear});
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
  adjMax = max-min+1;
  var tempNum = Math.floor((Math.random() * adjMax) + min);
  //console.log("randNum adjMax is:"+adjMax+". And the random number is: "+tempNum);
  return tempNum;
}
//FIND A NUMBER NEAR THE APROXIMATE AVERAGE
function nearAverageRandom(startNum, min, max){
  //console.log ("nearAverageRandom run with: "+min+" "+max+" "+startNum);
  var num = Math.floor(((max-min)/10)+1);
  for (var i = 0; i < 10; i++) {
    var negNum = -1*Math.abs(num);
    var smallNum = randNum(negNum,num);
    startNum +=  smallNum;
    // console.log ("the nearAverageRandom numbers were: " +num+" "+smallNum+" "+startNum);
    if (startNum >max){startNum = max;}
    if (startNum <min){startNum = min;}
  }
  //console.log ("the nearAverageRandom numbers were: " +num+" "+smallNum+" "+startNum);
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
  var dTime= new Date();
  fireRef.child('leagueArray').child("league"+num).set({currentDay:1,year:2016,nameAssign:"FBS All-Stars", lastSim: +dTime});
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
  fireRef.child('leagueArray').child(leagueName).child(teamName).set({owner:"compAI",nameAssign:"BlueSocks", tYear: 2016, stats:{game:0,gameStart:0,play:0,point:0,fBPoint:0,pointer3:0,pointer2:0,dunk:0,freeThrow:0,miss:0, miss3:0,missFt:0,assist:0,dBoard:0,oBoard:0,steal:0,block:0,drive:0,allow:0,turnOver:0,foul:0}});
  for (var t = 0; t < 8; t++) {
    // console.log("running player loop");

    addPlayer(0,leagueName,teamName,"2016");
  };
}
//CREATE PLAYER
function addPlayer(source,leagueName,teamName,year){
  console.log("run addPlayer: "+source+", "+leagueName+", "+teamName+", "+year);
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
    generatePlayer.push(nearAverageRandom(77,68,86));
    generatePlayer.push(randNum(1,10));
  }
  // console.log("run add player" + generatePlayer[0]);
  generatePlayer.push("bench");
  generatePlayer.push(150+nearAverageRandom(60,0,150));
  generatePlayer.push(21+randNum(-4,5));
  var skillId = randNum(40,60);
  var potentialSkill = randNum(60,90);
  var runningAverage = 0;
  console.log ("potential skill average should be: "+ potentialSkill);
  var skillAverage = skillId;
  var goalAverage = skillId;
  var switchPush;
  var skillArray=[];
  var totalAttribute = 8;
  for (var y = 0; y < 2; y++) {
    var tempNum = 0;
    for (var i = 0; i < totalAttribute; i++) {
      var remainAttribute = totalAttribute - i;
      skillAverage = Math.floor(((goalAverage * totalAttribute ) - tempNum) / remainAttribute);
      console.log("goal: " +goalAverage+", skill average: "+skillAverage);
      var tempMin = 20;
      var tempMax = 94;
      var tempSkill = nearAverageRandom(skillAverage, tempMin ,tempMax);
      console.log("random new skill: "+tempSkill);
      skillArray.push(tempSkill);
      tempNum = 0;
      var tempIndex = 0;
      if(y==0){
        $.each(skillArray, function( index, value ) {
          tempNum += value;
          tempIndex = index + 1;
          runningAverage = tempNum/tempIndex;
        });
      }else{
        var loopCrash = 0;
        for(z=totalAttribute; z< (totalAttribute*2); z++){
          loopCrash++; if(loopCrash >20){break;}
          if(skillArray[z]){
            tempNum += skillArray[z];
            runningAverage=tempNum/(i+1);
          }
        }
      }
      if(y==1){
        var adjNum = i+totalAttribute;
        if (skillArray[i]>skillArray[adjNum]) {
          console.log("skill pot below current ability found in loop: "+skillArray[i]+", "+skillArray[adjNum]);
          skillArray[adjNum] = skillArray[i] + 5;
          if(skillArray[adjNum]>99){skillArray[adjNum] = 99;}
        }
      }
    };
    console.log("average after skills loop "+y+": " +Math.floor(runningAverage));
    generatePlayer.push(Math.floor(runningAverage));
    skillAverage = potentialSkill;
    goalAverage = potentialSkill;
  };
  fireRef.child("leagueArray").child(generatePlayer[0]).child(generatePlayer[1]).child(generatePlayer[2]).set({stats:{game:0,gameStart:0,play:0,point:0,fBPoint:0,pointer3:0,pointer2:0,dunk:0,freeThrow:0,miss:0, miss3:0,missFt:0,assist:0,dBoard:0,oBoard:0,steal:0,block:0,drive:0,allow:0,turnOver:0,foul:0},injury:false,injuryLength:1, height : generatePlayer[3], contract: generatePlayer[4], position: generatePlayer[5], weight: generatePlayer[6], age: generatePlayer[7], speed: skillArray[0], shooting: skillArray[1], defence: skillArray[2], ballControl: skillArray[3], endurance: skillArray[4], vision: skillArray[5], clutch: skillArray[6], rebounding: skillArray[7], speedPot: skillArray[8], shootingPot: skillArray[9], defencePot: skillArray[10], ballConPot: skillArray[11], endurPot: skillArray[12], visionPot: skillArray[13], clutchPot: skillArray[14], reboundPot: skillArray[15], avgSkill: generatePlayer[8], avgPot: generatePlayer[9], draft: year});
  return generatePlayer[2];
}
//CHECK IF SIM IS DUE. CHANGE simRATE VARIABLE TO CHANGE HOW OFTEN SIM.
function checkSim(){
  if(typeof leagueArrayComplete != 'object'){alert("ERROR: 367. unable to check simulation.");}
  else{
    var curSim = leagueArrayComplete.child("currentDay").val();
    var nextDay = new Date();
    var oldDay = leagueArrayComplete.child('lastSim').val();
    console.log("nextDay is: "+(+nextDay)+". While the last sim was found to be: "+ oldDay);
    if(+nextDay%oldDay > simRate){
      console.log("worked. milliseconds show that it has been more than one simRate since sim."+(+nextDay%oldDay));
      var oneSim = oldDay +simRate;
      if (nextDay.getDate() == 1 || curSim > 130){
        console.log("found to be a new month. Created new season matchups and aged everything by 1 year. ");
        var nextYear = leagueArrayComplete.child("year").val() +1;
        var tempMatchArray = createMatchups();
        fireRef.child('leagueArray').child(leagueArrayComplete.key()).child("matchUps").set(tempMatchArray);
        for (var i = 16; i > 0; i--) {
          var tempPlayer = addPlayer(0, leagueArrayComplete.key(), "team16", nextYear);//source,leagueName,teamName,year
          console.log("added " +tempPlayer +" to free Agrents");
        };
        fireRef.child('leagueArray').child(leagueArrayComplete.key()).update({currentDay : 1, year: nextYear, lastSim: +nextDay});
      }else if(nextDay.getDate() >3){
        console.log("not the first day of the month, and time for season sim.: "+ nextDay.getDate());
        simGames();
      }

    }
    else{console.log("not yet time. Next sim at: " +new Date(oldDay+simRate).toString());}
  }
}
//SETUP MATCHUPS WHEN CREATING LEAGUE
function createMatchups(leagueName){
  var matchUpObject = {};
  for (var z = 1; z <83; z++) {
    matchUpObject[z]={team1:"team2"};
  };
  var tempTeam2;
  for (var x = 0; x <2; x++) {//  NEEDED: CHANGE X<2 TO  x<16 WHEN FULLY TESTED.
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
          console.log(playerSnap+" found to be injured, and has been removed from the game list. Recovery is now "+changeVal);
          fireRef.child("leagueArray").child(leagueArrayComplete.key()).child(teamId).child(playerSnap).child("injuryLength").set(changeVal);
          if (changeVal <= 0){
            console.log(playerSnap+ " will be healed from his injury after this game.");
            fireRef.child("leagueArray").child(leagueArrayComplete.key()).child(teamId).child(playerSnap).child("injury").set(false);
          }
          delete obj[playerSnap];
        }
    }else{
      delete obj[playerSnap];
      console.log("removed non player from team list");
    }
  }
  return obj;
}
//SEARCH EACH OBJECT FOR EACH PLAYERS POSITION AND REPLACE IF   REQUIRED.
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
    //       //break;
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
    //       //break;
    //     }else{
    //       console.log("temp < skill "+ tempSkill);
    //       i++;
    //       if(i>8){finished = "done";//break;}
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
function moveToBench(benchObj, teamObj){
  var finish =  false;
  var changedTeam = teamObj;
  for(var benchP in benchObj){
    for(var pos in team){
      for(var teamP in team[pos]){
        if (benchP == teamP){
          changedTeam[pos][teamP] = benchObj[benchP];
          console.log(benchP+" has been saved to the team possition "+pos);
          finish = true;
          return changedTeam;
        }
      }
    }
  }
  if (!finish){alert("ERROR: EXHAUSTED STARTER NOT SAVED TO TEAM ARRAY.");}
}
//ADVANCE DAY AND SIM GAMES.
function simGames(){//NEEDED: ADD INJURY CHANCE DURING GAME.
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
  console.log("simulating day: "+currentDaySim);
  //BEGIN MATCH LOOP
  if(currentDaySim <83){//NEEDED: CHANGE TO ALLOW FOR PLAYOFFS.
    leagueArrayComplete.child("matchUps").child(currentDaySim).forEach(function(matchSnap) {
      var team1Name = matchSnap.key();
      var team1Stats = {};
      var team2Name = matchSnap.val();
      var team2Stats = {};
      console.log(" matchup is "+team1Name+" vs. "+team2Name);
      var playResult;
      var startNameArray =[];
      var tempObj;
      var gameStats={t2Name:team2Name, t1Score:0,t2Score:0,}
      var t1 = {};
      t1 = leagueArrayComplete.child(team1Name).val();
      var t2 = {};
      t2 = leagueArrayComplete.child(team2Name).val();
      onlyHealthy(t1, team1Name);
      t2 = onlyHealthy(t2, team2Name);
      console.log("healthy t1 object below:");  console.log(t1);
      t1 = findPosition(t1);
      t2 = findPosition(t2);
      console.log("positions of t1 object below:");  console.log(t1);
      var t1G = t1.g1;
      var t1F=t1.f1;
      var t1C=t1.c1;
      var t2G = t2.g1;
      var t2F=t2.f2;
      var t2C=t2.c2;
      var offencePlay ="t1";
      //BEGIN GAME LOOP
      for(var gameLength = 5; gameLength > 0; gameLength-- ){
        //CHECK EDURANCE ON STARTERS
        for(var x in t2C){
          console.log("t2C before endurance check: "+ t2C[x]["endurance"]);
        }
        startNameArray[0]= checkEndur(t1, "g", t1G, startNameArray);//NEEDED: DOUBLE CHECK IF T1G IS BEING CHANGED.
        startNameArray[1] = checkEndur(t1, "f", t1F, startNameArray);
        startNameArray[2] = checkEndur(t1, "c", t1C, startNameArray);
        startNameArray[3] = checkEndur(t2, "g", t2G, startNameArray);
        startNameArray[4] = checkEndur(t2, "f", t2F, startNameArray);
        startNameArray[5] = checkEndur(t2, "c", t2C, startNameArray);
        console.log("startNameArray: "+ startNameArray);
        for(var x in t1G){
          console.log("t1G after endurance check: "+ t1G[x]["endurance"]);
        }
        for(var x in t1["g1"]){
          console.log("t1 guard1 after endurance check: "+ t1["g1"][x]["endurance"]);
        }
        //ADD ENDURANCE TO BENCH
        for(var pos in t1){
          for(var player in t1[pos]){
            //console.log("default endurance"+ leagueArrayComplete.child(team1Name).child(player).child("endurance").val());
            if(leagueArrayComplete.child(team1Name).child(player).child("endurance").val() > t1[pos][player].endurance){
              t1[pos][player].endurance +=2;
            }
          }
        }
        for(var x in t1G){
          console.log("t1G after endurance add to bench: "+ t1G[x]["endurance"]);
        }
        for(var pos in t2){
          for(var player in t2[pos]){
            if(leagueArrayComplete.child(team2Name).child(player).child("endurance").val() > t2[pos][player].endurance){
              t2[pos][player].endurance +=2;
            }
          }
        }
        //BALL IS PASSED INBOUNDS AND OFFENSE TRIES TO SCORE.
        console.log (offencePlay+" is on offence.");
        if (offencePlay == "t1"){
          playResult = runPlay(t1G,t1F,t1C,t2G,t2F,t2C,gameLength);
          t1G =  playResult.oG;
          t1F =  playResult.oF;
          t1C = playResult.oC;
          t2G =  playResult.dG;
          t2F =  playResult.dF;
          t2C = playResult.dC;
          if (playResult.side == "off") {offencePlay ="t1";}
          else{offencePlay ="t2";}
          //console.log(t1G);
          if (playResult.score < 0){gameStats.t2Score += Math.abs(playResult.score);}// NEGATIVE REPRESENTS DEF SCORE
          else{gameStats.t1Score += playResult.score;}
        }
        else if (offencePlay == "t2"){
          playResult = runPlay(t2G,t2F,t2C,t1G,t1F,t1C,gameLength);
          t1G =  playResult.dG;
          t1F =  playResult.dF;
          t1C = playResult.dC;
          t2G =  playResult.oG;
          t2F =  playResult.oF;
          t2C = playResult.oC;
          if (playResult.side == "off") {offencePlay ="t2";}
          else{offencePlay ="t1";}
          if (playResult.score < 0){gameStats.t1Score += Math.abs(playResult.score);}// NEGATIVE REPRESENTS DEF SCORE
          else{gameStats.t2Score += playResult.score;}
        }else{alert("ERROR 740: Warning, no team on offence.");}
        console.log("game stats obj below: "); console.log(gameStats);
      }
      console.log("state of t1 after game"+t1);console.log(t1);
      team1Stats = buildTeamStats (t1, team1Name);
      console.log("team1Stats below: "); console.log(team1Stats);
      // gameStats.stats =
      console.log("completed game loop. final game stats obj below saved to firebase:"); console.log(gameStats);
      fireRef.child("leagueArray").child(leagueArrayComplete.key()).child("matchUps").child(currentDaySim).child(team1Name).set(gameStats);
    });
    currentDaySim +=1;
    console.log("completed matchup loop. next day to be simulated will be "+currentDaySim);
    var oldDay = leagueArrayComplete.child('lastSim').val();
    var oneSim = oldDay +simRate;
    var dateCheck = new Date;
    if (oneSim>(+dateCheck)){oneSim = +dateCheck; console.log("calculated last sim date was greater than current.");}
    fireRef.child('leagueArray').child(leagueArrayComplete.key()).update({lastSim: oneSim, currentDay:currentDaySim});
  }
}
//ACCEPTS TEAM OBJECT AFTER GAME AND CREATES COMBINED STATS.
function buildTeamStats(obj,teamName){
  var totalStats = {};
  var playerStats = {};
  var nameArray=[];
  var checkName=false;
  for(var pos in obj){
    //POS NOW EQUAL TO THE POSITION OF EACH PLAYER
    for(var player in obj[pos]){
      //PLAYER IS NOW THE PLAYER NAME FOR EACH POSITION.
      //CHECK EACH PLAYER TO SEE IF THEIR STATS HAVE ALREADY BEEN ADDED
      checkName = false;
      for (var i = nameArray.length - 1; i >= 0; i--) {
        if (player == nameArray[i]){checkName=true; console.log(player+"player already existed in array");}
      };
      if(!checkName){
        console.log(player+ " player stats now being added to records.");
        nameArray.push(player);
        playerStats = leagueArrayComplete.child(teamName).child(player).child("stats").val();
        console.log("player's number of plays before the game." + playerStats.play);
        //NOW, ADD PLAYERS STATS TO TEAM TOTAL.
        for(var stat in obj[pos][player].stats){
          if(typeof totalStats[stat] == 'undefined'){totalStats[stat]=0;}
          totalStats[stat] += obj[pos][player].stats[stat];
          //UPDATE PLAYERS INDIV STATS IN FIREBASE
          playerStats[stat] += obj[pos][player].stats[stat];
        }
        console.log("player's number of plays after the game."+ playerStats.play); console.log(playerStats);
        fireRef.child('leagueArray').child(leagueArrayComplete.key()).child(teamName).child(player).child("stats").set(playerStats);
      }
    }
  }
  return totalStats;
}
// A SINGLE PLAY UNTIL TURNOVER(without fast break) OR SCORE.
function runPlay(offG, offF, offC, defG, defF, defC, gameLength){
  //console.log(offG);
  var visionResult={score:0};
  var fastBreak=false;
  var fastMod = 40;
  var ballPosition = 4;
  var gameObj={score:0};
  var fastResult ={};
  var playersInQ = {offP:offG, defP:defG,assist:false, pos:"G"};
  //HAVE GUARD DRIBLE ACROSS HALF COURT.
  var dribble = dribbleCheck(offG, defG,gameLength,80);
  if (dribble) {
    for(var y in offG){
      offG[y].stats.drive += 1;
      console.log( y+" dribbled the ball past halfcourt, now setting up off play. stats obj below:");
      console.log(offG[y]["stats"]);
    }
  }else if(!dribble){
      for(var x in offG){
        offG[x].stats.turnOver += 1;
      }
      for(var y in defG){
        defG[y].stats.steal += 1;
        console.log( y+" stole the ball.  and starts fast break.");
      }
      ballPosition -= 1;
      fastResult = runFastBreak(defG, offG, gameLength,40);
      defG = fastResult.offP;//REVERSED BECAUSE OF THE INTERACTION WITH FAST BREAK FUNCTION
      offG = fastResult.defP;
      if (typeof fastResult.side == 'undefined' && !fastResult.stay){
        gameObj = {oG:offG,oF:offF,oC:offC,dG:defG,dF:defF,dC:defC};
        gameObj.side = "off";
        gameObj.score = -2;
        console.log("Def scored "+gameObj.score+" points.");
        return gameObj;
      }
      else if(fastResult.stay){
        gameObj = {oG:offG,oF:offF,oC:offC,dG:defG,dF:defF,dC:defC};
        gameObj.side = "def";
        gameObj.score = 0;
        return gameObj;
      }
      else{console.log("Offense stole the ball back and is now beginning to run thier play.");}
  }else{alert("ERROR 826: warning. dribble function returned niether true nor false.");}
  ballPosition = 3;
  //GUARD HAS MADE TO HALFCOURT, NOW BEGIN OFFENSE LOOP
  for (var finish = 20; finish > 0; finish--) {
    if (ballPosition > 3){ballPosition = 3;alert("ERROR 832: BALLPOSTION failed");}
    visionResult = runVisionCheck(playersInQ.offP,playersInQ.defP, gameLength, ballPosition, playersInQ.assist);
    // GUARD HAS EITHER LOST THE BALL, DRIBBLED, PASSED OR SHOT
    playersInQ.offP = visionResult.offP;
    playersInQ.defP = visionResult.defP;
    if(visionResult.score){
      console.log("visionResult score ="+visionResult.score);
      gameObj.score += visionResult.score;
      for(var x in playersInQ.assist){
        playersInQ.assist[x].stats.assist +=1;
        console.log ("assist stat given to "+x+". He now has "+playersInQ.assist[x].stats.assist);
      }
    }
    console.log("score changed by "+gameObj.score+". Side:"+visionResult.side+". Fb:"+visionResult.fB+". Rebound:"+visionResult.rebound+". assist:"+visionResult.assist);
    //CHANGE OF POSSESION, WITH OR WITHOUT FAST BREAK
    if (visionResult.side){
      if(visionResult.fB){
          console.log("defense stole the ball and has a fast break.");
          fastResult = runFastBreak(playersInQ.defP, playersInQ.offP, gameLength,40);
          if(fastResult.score){
            console.log("fastResult score ="+fastResult.score);
            gameObj.score = -1*fastResult.score;
            for(var x in playersInQ.assist){
              playersInQ.assist[x].stats.assist +=1;
              console.log ("assist stat given to "+x+". He now has "+playersInQ.assist[x].stats.assist);
            }
          }
          playersInQ.defP = fastResult.offP;
          playersInQ.offP = fastResult.defP;
          if(fastResult.stay){
            gameObj.side = "def";
          }else{gameObj.side = "off";}
          if (!fastResult.side){
            if(typeof playersInQ.pos == 'undefined'){alert("ERROR 849: V.SIDE PLAYERSINQ.POS EMPTY");}
            if (playersInQ.pos == "G"){gameObj.oG = playersInQ.offP; gameObj.dG = playersInQ.defP;}
            else{gameObj.oG = offG; gameObj.dG = defG;}
            if (playersInQ.pos == "F"){gameObj.oF = playersInQ.offP; gameObj.dF = playersInQ.defP;}
            else{gameObj.oF = offF; gameObj.dF = defF;}
            if (playersInQ.pos == "C"){gameObj.oC = playersInQ.offP; gameObj.dC = playersInQ.defP;}
            else{gameObj.oC = offC; gameObj.dFC = defC;}
            return gameObj;
            //break;
          }
      }else{
        console.log("change of possesion without FB.");
        gameObj.side = "def"; //DEFENSE WILL HAVE THE BALL AND BECOME OFFENSE
        if(typeof playersInQ.pos == 'undefined'){alert("error 861, V.SIDE PLAYERSINQ.POS EMPTY!!!");}
        if (playersInQ.pos == "G"){gameObj.oG = playersInQ.offP; gameObj.dG = playersInQ.defP;}
        else{gameObj.oG = offG; gameObj.dG = defG;}
        if (playersInQ.pos == "F"){gameObj.oF = playersInQ.offP; gameObj.dF = playersInQ.defP;}
        else{gameObj.oF = offF; gameObj.dF = defF;}
        if (playersInQ.pos == "C"){gameObj.oC = playersInQ.offP; gameObj.dC = playersInQ.defP;}
        else{gameObj.oC = offC; gameObj.dFC = defC;}
        return gameObj;
        //break;
      }
    }
    //OFFENSE FAST BREAK
    else if(!visionResult.side && visionResult.fB){
      console.log("offence fast break");
      ballPosition -= 1;
      fastMod = 60-(10*ballPosition);
      fastResult = runFastBreak(playersInQ.offP, playersInQ.defP, gameLength, fastMod);
      if(fastResult.score){
        console.log("fastResult score ="+fastResult.score);
        gameObj.score += fastResult.score;
        for(var x in playersInQ.assist){
          playersInQ.assist[x].stats.assist +=1;
          console.log ("assist stat given to "+x+". He now has "+playersInQ.assist[x].stats.assist);
        }
      }
      if(!fastResult.stay){
        gameObj.side = "def"; //DEFENSE WILL HAVE THE BALL AND BECOME OFFENSE
      }
      playersInQ.offP = fastResult.offP;
      playersInQ.defP = fastResult.defP;
      if(typeof playersInQ.pos == 'undefined'){console.log("!!!!WARNING, V.SIDE PLAYERSINQ.POS EMPTY!!!");}
      if (playersInQ.pos == "G"){gameObj.oG = playersInQ.offP; gameObj.dG = playersInQ.defP;}
      else{gameObj.oG = offG; gameObj.dG = defG;}
      if (playersInQ.pos == "F"){gameObj.oF = playersInQ.offP; gameObj.dF = playersInQ.defP;}
      else{gameObj.oF = offF; gameObj.dF = defF;}
      if (playersInQ.pos == "C"){gameObj.oC = playersInQ.offP; gameObj.dC = playersInQ.defP;}
      else{gameObj.oC = offC; gameObj.dFC = defC;}
      return gameObj;
      //break;
    }
    //REBOUND TO DETERMINE POSSESION AND BALL POSITION.
    else if(visionResult.rebound){
      fastResult = runRebound(offG, offF, offC, defG, defF, defC, gameLength, ballPosition);
      if (fastResult.bP <= 1){playersInQ.offP=fastResult.oC; playersInQ.defP=fastResult.dC; playersInQ.pos="C";}
      else if (fastResult.bP == 2){playersInQ.offP=fastResult.oF; playersInQ.defP=fastResult.dF; playersInQ.pos="F";}
      else if (fastResult.bP == 3){playersInQ.offP=fastResult.oG; playersInQ.defP=fastResult.dG; playersInQ.pos="G";}
      else{alert("ERROR 898: REBOUND BALL POSTION NOT WITHIN RANGE");}
      gameObj.side = fastResult.side;
      gameObj.oG = fastResult.oG;
      gameObj.oF = fastResult.oF;
      gameObj.oC = fastResult.oC;
      gameObj.dG = fastResult.dG;
      gameObj.dF= fastResult.dF;
      gameObj.dC= fastResult.dC;
      if (fastResult.score){gameObj.score = fastResult.score;}
      if(gameObj.side =="def" && !fastResult.score) {
        console.log(" defence rebounded. gameObj being returned: "); console.log(gameObj);
        return gameObj;
      }
      else if(gameObj.side =="def" && fastResult.score) {
        console.log(" defence gets the ball after offense scores: "); console.log(gameObj);
        return gameObj;
      }else{
        console.log("offense gets back the ball after rebound... outside range 0 correct? "+ballPosition);
      }
    }
    //SUCCESFUL PASS, POSSIBLE ASSIST.
    else if(typeof visionResult.assist != 'undefined'){
      console.log("assist opportunity");
      fastResult = visionResult.assist;
      var randPos = randNum(1,3);
      if (randPos ==1 && playersInQ.pos != "C"){playersInQ={offP:offC,defP:defC, assist:fastResult , pos:"C"};}
      else if (randPos == 1 && playersInQ.pos != "F"){playersInQ={offP:offF,defP:defF, assist:fastResult , pos:"F"};}
      else if (randPos == 2 && playersInQ.pos != "F"){playersInQ={offP:offF,defP:defF, assist:fastResult , pos:"F"};}
      else if (randPos == 2 && playersInQ.pos != "G"){playersInQ={offP:offG,defP:defG, assist:fastResult , pos:"G"};}
      else if (randPos == 3 && playersInQ.pos != "G"){playersInQ={offP:offG,defP:defG, assist:fastResult , pos:"G"};}
      else if (randPos == 3 && playersInQ.pos != "C"){playersInQ={offP:offC,defP:defC, assist:fastResult , pos:"C"};}
      else{alert("ERROR 919: PASS NO ASSIST PLAYER RECIEVED");}
      ballPosition -= 1;
      if (ballPosition<0 || ballPosition > 3){
        ballPosition = 0;
        console.log("had to adj ball position to 0. It was out of range.");
      }
      for(var x in playersInQ.assist){
        console.log ("assist opprortunity for "+x+". Passed to the "+playersInQ.pos+" at position "+ballPosition);
      }
    }
    //ERROR WARNING
    else{alert("ERROR 924. NO VISION RESULT FOUND!!!");}
  }//END OF PLAY LOOP

  //FINALLY, RETURN OBJ TO GAME LOOP. INCLUDE .SIDE TO NOTE WHO HAS BALL NEXT.
  if(typeof playersInQ.pos == 'undefined'){console.log("!!!!WARNING, V.SIDE PLAYERSINQ.POS EMPTY!!!");}
  if (playersInQ.pos == "G"){gameObj.oG = playersInQ.offP; gameObj.dG = playersInQ.defP;}
  else{gameObj.oG = offG; gameObj.dG = defG;}
  if (playersInQ.pos == "F"){gameObj.oF = playersInQ.offP; gameObj.dF = playersInQ.defP;}
  else{gameObj.oF = offF; gameObj.dF = defF;}
  if (playersInQ.pos == "C"){gameObj.oC = playersInQ.offP; gameObj.dC = playersInQ.defP;}
  else{gameObj.oC = offC; gameObj.dFC = defC;}
  return gameObj;
}

//CHECK ENDURANCE OF EACH STARTER
function checkEndur(team, startPos, curPlayer,startNameArray){
  var done = false;
  var curPlayerName;
  if(typeof curPlayer != 'undefined'){
    for(var player in curPlayer){
      curPlayerName = player;
      console.log(player+" is already assigned to the position "+startPos+". His endurance is "+curPlayer[player]["endurance"]);
      if(curPlayer[player].endurance > 1){
        curPlayer[player].endurance -= 20;//NEEDED: REPLACE WITH THE NUMBER 3 WHEN IN ALPHA.
        curPlayer[player].stats.play += 1;
        done = true;
        return player;
      }else{
        console.log(player+" has been subbed to the bench to rest");
      }
    }
  }
  if (!done){
    for(i=1; i<4; i++){
      for(var target in team[startPos + i ]){
        for (var z = startNameArray.length - 1; z >= 0; z--) {
          if(target ==startNameArray[z]){curPlayerName = target;}
        }
        if (team[startPos + i ][target].endurance > 19 && curPlayerName != target && !done){
          team[startPos + i ][target].endurance -= 3;
          team[startPos + i ][target].stats.play += 1;
          curPlayer = team[startPos + i ];
          console.log(target+" has been assigned to "+startPos+". His endurance is "+curPlayer[target]["endurance"]);
          done = true;
          return target;
        }
      }
    }
  }
  if (!done){
    for(var position in team){
      if(position == "b1" || position == "b2" || position == "b3"){
        for(var target in team[position]){
          for (var z = startNameArray.length - 1; z >= 0; z--) {
            if(target ==startNameArray[z]){curPlayerName = target;}
          }
          if (team[position][target].endurance > 19 && target != curPlayerName && !done){
            team[position][target].endurance -= 3;
            team[position][target].stats.play += 1;
            console.log(target+" is called off the bench, to the position "+startPos);
            curPlayer = team[position];
            done = true;
            return target;
          }
        }
      }
    }
  }
  if (!done){
    console.log("Last player started becasue no position player started after endurance check");
  }
}
//CHECK DRIBBLE PAST DEFENDER
function dribbleCheck(hasBall,defendBall,gameLength, posMod){
  if(!posMod || posMod <20){posMod = 74;}
  var noRepeat;
  //console.log("dribble check has run.");
  for(var has in hasBall){
    //console.log("has ball speed: "+ hasBall[has].speed);
    var hc = 0;
    if(gameLength<40){hc = (hasBall[has].clutch)/5;}
    var hs = hasBall[has].speed;
    var hb = hasBall[has].ballControl;
    for(var defend in defendBall){
      if(!noRepeat){
        var dc = 0;
        if(gameLength<40){dc = (defendBall[defend].clutch)/5;}
        var ds = defendBall[defend].speed;
        var dd = defendBall[defend].defence;
        var chance = (((hs+hb+hc)-(ds+dd+dc))*.2)+posMod;
        chance = roundToTwo(chance);
        //console.log("chance "+chance);
        var roll = randNum(0,100);
        console.log(has+" has a dribble chance of "+chance+", compared to a base of "+posMod+". And the roll was: "+roll);
        if (roll < chance) {
          return chance;
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
function runFastBreak(offP, defP, gameLength, posMod){
  var fastObj = {score:0};
  var randBreak = randNum(0,100);
  var duelResult = dribbleCheck(offP,defP,gameLength,posMod);
  if(duelResult){
    for(var x in offP){
      offP[x].stats.dunk +=1;
      offP[x].stats.point +=2;
      console.log(x+" scored on a fast break.");
    }
    //for(var x in defP){defP[x].stats.allow +=1;}
    fastObj.score +=2;
  }
  else if(randBreak < 50){
    console.log(" ball carrier didn't make it to the hoop and resets offense.");
    fastObj.stay = "off";
  }
  else{
    for(var x in offP){
      offP[x].stats.turnOver +=1;
      console.log(x+" lost the ball.");
    }
    for(var x in defP){defP[x].stats.steal +=1;}
    fastObj.side = "def";
  }
  fastObj.defP =defP;
  fastObj.offP = offP;
  return fastObj;
}
//CHECK IF THE POSITION PLAYER PASSES HIS VISION CHECK. . RETURN OBJ INCLUEDS .SIDE IF DEFENSE HAS THE BALL> .fB IF FAST BREAK> .REBOUND
function runVisionCheck(offP,defP,gameLength, ballPosition, assist){
  var decision = "pass";
  var checkDribble;
  var checkShot;
  var vision;
  var duelResult;
  var duelObj={score:0};
  for (x in offP){
    var oc = 0;
    if(gameLength<40){oc = (offP[x].clutch)/5;}
    vision = (offP[x].vision)+oc;
    console.log(x+"s vision after clutch is: "+vision);
    var check = randNum(0,100);
    if (vision > check){
      //CHECK TO SEE IF THE OFF HAS A GOOD CHANCE TO SHOOT OR DRIVE. ELSE PASS
      var checkPass;
      var checkObj ={};
      if (ballPosition >1){
        checkObj = runPassBall(offP,defP, gameLength);
        if(checkObj){
          checkPass = checkObj.chance;
          checkPass+= randNum(-5,5);
          console.log ("vision check for pass is: "+ checkPass);
        }else{
          checkPass=false;
        }
      }
      checkDribble= dribbleCheck(offP,defP, gameLength);
      checkDribble += randNum(-5,5);
      console.log ("vision check for dribble is: "+ checkDribble);
      checkShot = 2*(runShootBall(offP,defP, gameLength, ballPosition));
      console.log("vision check, check shot is: " +checkShot);
      checkShot += randNum(-5,5);
      if(ballPosition <1){checkShot = 200;}
      console.log("check shot after randNum and ball position "+ballPosition+" is: " +checkShot);
      var refNum =0;
      if (checkPass){
        refNum = checkPass;
        decision = "pass";
      }
      if (checkDribble && checkDribble > refNum){
        refNum = checkDribble;
        decision = "dribble";
      }
      if (checkShot && checkShot > refNum){ decision = "shot";}
      console.log("vision check passed, decision is: "+ decision);

    //IF THE VISION CHECK FAILED. NORMAL DECISION MAKING BELOW.
    } else{
      var refNum = randNum(1,3);
      if (refNum == 1 && ballPosition > 1){decision = "pass";}
      else if (refNum == 2 && ballPosition > 0){decision = "dribble";}
      else { decision = "shot";}
      console.log("vision check failed, random decision is "+ decision);
    }
  }
  if(decision =="pass"){
    checkObj = runPassBall(offP,defP, gameLength);
    if(checkObj){duelResult = checkObj.chance;}
    if(duelResult){
      console.log("the offense succesfully passed the ball.")
      duelObj.assist = checkObj.oP;
      // for(var x in defP){}
    }
    else{
      for(var x in offP){offP[x].stats.turnOver +=1;}
      for(var x in defP){
        defP[x].stats.steal +=1;
        console.log(x+" intercepted a pass and has a fast break opportunity.");
      }
      duelObj.side = "def";
      duelObj.fB = true;
    }
  }
  else if(decision =="dribble"){
    duelResult = dribbleCheck(offP,defP,gameLength);
    if(duelResult){
      for(var x in offP){
        offP[x].stats.drive +=1;
        if(ballPosition <= 1){
          offP[x].stats.dunk +=1;
          offP[x].stats.point +=2;
          duelObj.side = "def";
          console.log(x+" drove past his defender, and dunks the ball for "+offP[x].stats.point+" points.");
        }else{
          duelObj.fB = true;
          console.log(x+" drove past his defender, and has a fast break opportunity.");
        }
      }
      for(var x in defP){defP[x].stats.allow +=1;}
    }
    else{
      for(var y in offP){
        offP[y].stats.turnOver +=1;
        for(var x in defP){
          defP[x].stats.steal +=1;
          console.log(x+ " steals the ball when "+y+" drives past him.");
        }
      }
      duelObj.side = "def";
      duelObj.fB = true;
    }
  }
  else if(decision =="shot"){

    if(ballPosition >0){duelResult = runShootBall(offP,defP,gameLength, ballPosition);}
    else{
      duelResult = 95;
      console.log("ball postion run as 0: correct? "+ballPosition);
    }
    var roll = randNum(0,100);
    if(roll > duelResult){duelResult =false;}
    if(duelResult){
      for(x in offP){
        if(ballPosition > 2){
          offP[x].stats.point +=3;
          duelObj.score=3;
          offP[x].stats.pointer3 +=1;
          console.log(x+" scores a "+duelObj.score+" pointer, from range "+ballPosition);
        }else {
          offP[x].stats.point +=2;
          duelObj.score=2;
          if(ballPosition >0){
            offP[x].stats.pointer2 +=1;
            console.log(x+" scores a "+duelObj.score+" pointer, from range "+ballPosition);
          }
          else{
            offP[x].stats.dunk +=1;
            console.log(x+" scores a "+duelObj.score+" point dunk, from range "+ballPosition);
          }
        }
      }
      //for(x in defP){}//IF DEFENSIVE PLAYER NEEDS A STAT WHEN THE SHOT WAS GOOD.
      duelObj.side = "def";
    }else{
      for(x in offP){
        console.log(x+" missed the shot.");
        if (ballPosition<3){offP[x].stats.miss +=1;}
        else{offP[x].stats.miss3 +=1;}
      }
      duelResult=false;
      duelResult = runBlockChance(offP,defP, gameLength, ballPosition);
      if (duelResult.side =="off"){
        duelObj.rebound = true;
        console.log("rebounding.");
      }
      else{
        for(x in defP){
          console.log(x+" blocked the shot. defence takes the ball.");
          defP[x].stats.block +=1;
        }
        duelObj.side = "def";
      }
    }
  }else{console.log("!!!!WARNING, NO DECISION FOUND WITHIN THE VISION CHECK!!!")}
  duelObj.offP =offP;
  duelObj.defP = defP;
  return duelObj;
}
//PASS THE BALL. RETURNS PASSoBJ WITH .CHANCE = PERCENT NUMBER. AND .oP as player obj
function runPassBall(hasBall,defendBall, gameLength){
  var noRepeat;
  var passObj ={};
  passObj.oP = hasBall;
  //console.log("dribble check has run.");
  for(var has in hasBall){
    //console.log("has ball speed: "+ hasBall[has].speed);
    var hc = 0;
    if(gameLength<40){hc = (hasBall[has].clutch)/5;}
    var hv = hasBall[has].vision;
    var hb = hasBall[has].ballControl;
    for(var defend in defendBall){
      if(!noRepeat){
        var dc = 0;
        if(gameLength<40){dc = (defendBall[defend].clutch)/5;}
        var dv = defendBall[defend].vision;
        var dd = defendBall[defend].defence;
        var chance = (((hv+hb+hc)-(dv+dd+dc))*0.2)+74; //NEEDED: MAKE SURE THIS USES DIFFERENT SKILLS THAN DRIBBLE. ALSO, INCLUDE BALL POSITION.
        console.log("pass chance should be: "+chance);
        var roll = randNum(0,100);
        if (roll < chance) {
          passObj.chance = chance;
          return passObj;
          noRepeat = 1;
        }else{
          return false;
          noRepeat = 1;
        }
      }
    }
  }
}
//SHOOT THE BALL
function runShootBall(hasBall,defendBall,gameLength,ballPosition){
  var noRepeat;
  var bp = ballPosition*10;
  for(var has in hasBall){
    var hc = 0;
    if(gameLength<40){hc = (hasBall[has].clutch)/3;}
    var hs = hasBall[has].shooting;
    var hh = hasBall[has]["height"];
    for(var defend in defendBall){
      if(!noRepeat){
        var dc = 0;
        if(gameLength<40){dc = (defendBall[defend].clutch)/5;}
        var dh = defendBall[defend]["height"];
        var dd = defendBall[defend].defence;
        var adjH = (2/ballPosition)*(hh-dh);
        adjH = roundToTwo(adjH);
        var chance = (((hs+hc)-(dd+dc))*.3) + (60 - bp) + adjH;
        chance = roundToTwo(chance);
        //var roll = randNum(0,100);
        console.log("Shot at ball position: "+ ballPosition +". Base shooting chance: "+ (60 - bp) +". Height adjust: "+adjH+". Total chance: "+chance);
        // if (roll < chance) {
        //   return chance;
        //   noRepeat = 1;
        // }else{
        //   return false;
        //   noRepeat = 1;
        // }
        return chance;
      }
    }
  }
}
// REBOUNDING FUNCTION. Returns all arguments as one obj. PLUS .SIDE. (EXCEPT GAMELENGTH)
function runRebound(offG, offF, offC, defG, defF, defC, gameLength, ballPosition){
  var chance = randNum(0, ballPosition);
  var duelResult = {};
  var result = {oG:offG,oF:offF,oC:offC,dG:defG,dF:defF,dC:defC,bP:chance,score:0};
  if(chance < 2){
    console.log("centers rebounding at ball position "+chance);
    duelResult = reboundDuel(offC, defC, gameLength);
    result.oC = duelResult.offP;
    result.dC = duelResult.defP;
  }
  else if (chance == 2){
    console.log("forwards rebounding at ball position "+chance);
    duelResult = reboundDuel(offF, defF, gameLength);
    result.oF = duelResult.offP;
    result.dF = duelResult.defP;
  }
  else if (chance == 3){
    console.log("guards rebounding at ball position "+chance);
    duelResult = reboundDuel(offG, defG, gameLength);
    result.oG = duelResult.offP;
    result.dG = duelResult.defP;
  }
  else{console.log("!!!!WARNING, RUN REBOUND CHANCE NUMBER OUTSIDE RANGE!!!" + chance);}
  result.bP = chance;
  result.side = duelResult.side;
  if(result.side == "off" && chance <1){//THE OFF CENTER HAS AT BP 0, SO HE SLAM DUNKS.
    for(var x in result.oC){
      console.log("off center rebounded at range 0 and dunks it.");
      result.oC[x].stats.point +=2;
      result.score+=2;
      result.oC[x].stats.dunk +=1;
      result.side = "def";
    }
  }
  return result;
}
//REBOUNDING HELPER FUNCTION. RETURNS OBJ WITH .SIDE AND BOTH PLAYERS IN QUESTION
function reboundDuel(offP, defP, gameLength){
  var chance, oR, oH, oC, dR, dH, dC, adjH, roll = 0;
  var duelObj={};
  duelObj.offP = offP;
  duelObj.defP = defP;
  for(var x in offP){
    for(var y in defP){
      if(gameLength < 40){
        oC = (offP[x].clutch) * 0.2;
        dC = (defP[y].clutch) * 0.2;
      }
      oR = offP[x].rebounding;
      oH = offP[x]["height"];
      dR = defP[y].rebounding;
      dH = defP[y]["height"];
      adjH = (oH - dH);
      chance = 100/((oR+ oC +adjH) + (2*(dR +dC -adjH)));
      chance = chance * (oR+adjH);
      roll = randNum(0,100);
      if(roll < chance){//OFFENCE GOT THE BALL BACK
        console.log("offense rebounded the ball.");
        duelObj.side = "off";
        duelObj.offP[x].stats.oBoard +=1;
      }else{//DEFENSE GOT THE BALL
        console.log("defense rebound the ball.");
        duelObj.side = "def";
        duelObj.defP[y].stats.dBoard +=1;
      }
      return duelObj;
    }
  }
}
function runBlockChance(offP,defP, gameLength, ballPosition){
  var chance, oS, oH, oC, dD, dH, dC, adjH, roll = 0;
  var duelObj={};
  duelObj.offP = offP;
  duelObj.defP = defP;
  for(var x in offP){
    for(var y in defP){
      if(gameLength < 40){
        oC = (offP[x].clutch) * 0.3;
        dC = (defP[y].clutch) * 0.3;
      }
      oS = offP[x].speed;
      oH = offP[x]["height"];
      dD = defP[y].defense;
      dH = defP[y]["height"];
      adjH = (oH - dH)*(4 - ballPosition);
      chance = 100/((ballPosition*(oS+ oC +adjH)) + (dD +dC -adjH));//NEEDED: FIX CHANCE. CURRENTLY NAN.
      chance = chance * (ballPosition*(oS+ oC +adjH));
      roll = randNum(0,100);
      console.log("The inverse chance that the ball is blocked is: "+chance+". And the roll is:"+roll);
      if(roll > chance){//DEFENSE BLOCKED THE SHOT.
        console.log(y+" blocked the shot. Defense gains possesion");
        duelObj.side = "def";
      }else{//OFFENSE AVOIDED THE BLOCK, BUT STILL MUST REBOUND.
        console.log("shot not blocked, but now must be rebounded.");
        duelObj.side = "off";
      }
      return duelObj;
    }
  }
}
//FUNCTION TO DROP PLAYER AND MOVE THEM TO THE FREE AGENT LIST
function dropPlayer(){
  if(typeof playerName == 'undefined'){window.location.assign("fbs3.html");}
  var qVerify = confirm(playerName+" will be released to free agency?  Please note that your team will still be responsible for 77% of remaining contract.");
  if(qVerify == true){
    console.log("player moved to freeagent team.");
    if(typeof leagueArrayComplete == 'object'){
      userLeagueName = leagueArrayComplete.key();
      if(typeof userArrayComplete == 'object'){userTeamName = (userArrayComplete.child("team").val()); console.log("used userArrayComplete.child");}
      else if(typeof userTeamName == 'string'){console.log("used userTeamName: "+ userTeamName);}
      else{alert("ERROR 1316: team object not available."); return true;}
      var tempPlayer = leagueArrayComplete.child(userTeamName).child(playerName).val();
      fireRef.child("leagueArray").child(userLeagueName).child("team16").child(playerName).set(tempPlayer);
      console.log(userTeamName);
      fireRef.child("leagueArray").child(userLeagueName).child(userTeamName).child(playerName).remove();
      window.location.assign("fbs3.html");
      //NEEDED :STILL HAVE TO ADJUST TEAM SALARY.
    }
    else{alert("ERROR 1325: league object not available.");}
  }
}
//FUNCTION TO sign PLAYER AND MOVE THEM TO THE FREE AGENT LIST
function signPlayer(){
  console.log("player signed to "+userTeamName);
  if(typeof playerName == 'undefined'){window.location.assign("freeagent.html");}
  var qVerify = confirm(playerName+" will be signed to your team?  Please note that your team will be responsible for the cost of this players contract.");
  if(qVerify == true){
    console.log("player moved to your team.");
    if(typeof leagueArrayComplete == 'object'){
      userLeagueName = leagueArrayComplete.key();
      if(storageType =="local"){ userTeamName = localStorage.localUserTeam; console.log("user team from local");}
      if(typeof userTeamName != 'string'){userTeamName = (userArrayComplete.child("team").val()); console.log("used userArrayComplete.child");}
      var tempPlayer = leagueArrayComplete.child("team16").child(playerName).val();
      fireRef.child("leagueArray").child(userLeagueName).child(userTeamName).child(playerName).set(tempPlayer);
      fireRef.child("leagueArray").child(userLeagueName).child(userTeamName).child(playerName).update({position:"bench"});
      fireRef.child("leagueArray").child(userLeagueName).child("team16").child(playerName).remove();
      window.location.assign("fbs3.html");
      //NEEDED :STILL HAVE TO ADJUST TEAM SALARY.
    }
    else{alert("ERROR 1347: league object not available.");}
  }
}
//FUNCTION TO DESPLAY PLAYER DETAILS.
function playerGlance(){
  console.log(playerName);
  var playerAge=0;
  if(typeof playerName == 'undefined'){window.location.assign("fbs3.html");}
  $('#teamContain').css("display","inline-block");
  $('#playerGlance > tbody').html('');
  if (typeof userTeamName == 'undefined'){userTeamName = userArrayComplete.child("team").val();}
  if(typeof leagueArrayComplete != 'object'){
    if(typeof userLeagueName == 'string'){var leaguePromise = leagueSnapshot(userLeagueName); console.log("used userLeagueName: "+ userLeagueName);}
    else if(typeof userArrayComplete == 'object'){var leaguePromise = leagueSnapshot(userArrayComplete.child("league").val()); console.log("used userArrayComplete.child");}
    else{alert("ERROR 1324: league array check was run without a user league name."); window.location.assign("fbs3.html");}
    leaguePromise.fail(function(){
      alert("ERROR 1326: leaguePromise failed: Was not able to contact server.");
    });
    leaguePromise.done(function(snap){
      console.log("league promise done.");
      leagueArrayComplete = snap;
      if(!avoidBrokenLoop){
        console.log("avoidBrokenLoop is "+avoidBrokenLoop);
        avoidBrokenLoop = true;
        playerGlance();
      }
      return true;
    });
  }
  if(typeof leagueArrayComplete == 'object'){
    var statInfo=[];
    var playerInfo=[];
    var playerPresent;
    leagueArrayComplete.child(userTeamName).forEach(function(nameSnap){
      if (playerName == nameSnap.key()) {
        playerPresent=true; console.log("player found");
        $('#addDropButton').text("Release Player").click(function(){dropPlayer()});
      }
    });
    if(!playerPresent){
      userTeamName="team16";
      console.log("player not present on user team. Changed to free agents.");
      $('#addDropButton').text("Sign Player").click(function(){signPlayer()});
    }
    leagueArrayComplete.child(userTeamName).child(playerName).forEach(function(playerSnap) {
      if(typeof playerSnap.val() != "object"){
        if(playerSnap.key() == "draft"){
          var tempNum = leagueArrayComplete.child("year").val()-playerSnap.val();
          playerAge=playerInfo[0]+tempNum;
        }
        playerInfo.push(playerSnap.val());
      }
      else{
        playerSnap.forEach(function(statSnap) {
          statInfo.push(statSnap.val());
        });
      }
    });
    $('#playerGlance > tbody:last-child').append('<tr><td>'+playerName+'</td><td>'+playerAge+'</td><td>'+playerInfo[13]+"in."+'</td><td>'+playerInfo[2]+"/"+playerInfo[1]+'</td><td>'+playerInfo[19]+"/"+playerInfo[20]+'</td><td>'+playerInfo[8]+"/"+playerInfo[9]+'</td><td>'+playerInfo[4]+"/"+playerInfo[3]+'</td><td>'+playerInfo[18]+"/"+playerInfo[17]+'</td><td>'+playerInfo[21]+"/"+playerInfo[22]+'</td><td>'+playerInfo[12]+"/"+playerInfo[11]+'</td><td>'+playerInfo[23]+"/"+playerInfo[24]+'</td><td>'+playerInfo[5]+"/"+playerInfo[6]+'</td><td>'+playerInfo[14]+'</td></tr>');
    $('#statGlance > tbody:last-child').append('<tr><td>'+statInfo[0]+'</td><td>'+statInfo[1]+'</td><td>'+statInfo[2]+'</td><td>'+statInfo[3]+'</td><td>'+statInfo[4]+'</td><td>'+statInfo[5]+'</td><td>'+statInfo[6]+'</td><td>'+statInfo[7]+'</td><td>'+statInfo[8]+'</td><td>'+statInfo[9]+'</td><td>'+statInfo[10]+'</td></tr>');
  }
  if(typeof userArrayComplete =='object'){userTeamName=userArrayComplete.child("team").val();}
  else {userTeamName = localStorage.localUserTeam;}
}
//FILL DEPTH CHART PULL DOWNS.
function depthFill(){
  if (typeof userTeamName == 'undefined'){userTeamName = userArrayComplete.child("team").val(); console.log("set user team name.");}
  if (typeof userTeamName == 'undefined'){alert("ERROR 1407: no user team name found.");}
  if(typeof leagueArrayComplete != 'object'){
    if(typeof userLeagueName == 'string'){var leaguePromise = leagueSnapshot(userLeagueName); console.log("used userLeagueName: "+ userLeagueName);}
    else if(typeof userArrayComplete == 'object'){var leaguePromise = leagueSnapshot(userArrayComplete.child("league").val()); console.log("used userArrayComplete.child");}
    else{alert("ERROR 1411: depth fill was run without a user league name."); window.location.assign("index.html");}
    leaguePromise.fail(function(){
      alert("ERROR 1413: leaguePromise failed: Was not able to contact server.");
    });
    leaguePromise.done(function(snap){
      console.log("league promise done.");
      leagueArrayComplete = snap;
      if(!avoidBrokenLoop){
        console.log("avoidBrokenLoop is "+avoidBrokenLoop);
        avoidBrokenLoop = true;
        depthFill();
      }
    });
  }
  if(typeof leagueArrayComplete == 'object'){
    var guardStart, forwardStart, centerStart;
    avoidBrokenLoop=0;
    for (var y = 1; y<4; y++) {
      $("#guard"+y+"Select").empty().append('<option disabled selected value=false> -- Who will be your '+y+' guard? -- </option>');
      $("#forward"+y+"Select").empty().append('<option disabled selected value=false> -- Who will be your '+y+' forward? -- </option>');
      $("#center"+y+"Select").empty().append('<option disabled selected value=false> -- Who will be your '+y+' center? -- </option>');
      leagueArrayComplete.child(userTeamName).forEach(function(playerSnap){
        if(typeof playerSnap.child("position").val()== 'string'){
          if(playerSnap.key()!=guardStart && playerSnap.key()!=forwardStart && playerSnap.key()!=centerStart){
              if(playerSnap.child("position").val() == "g"+y){
                $("#guard"+y+"Select").prepend('<option value="'+playerSnap.key()+'">'+playerSnap.key()+'</option>');
                if(y==1){guardStart=playerSnap.key();}
              }
              else if (playerSnap.child("position").val() == "f"+y) {
                $("#forward"+y+"Select").prepend('<option value="'+playerSnap.key()+'">'+playerSnap.key()+'</option>');
                if(y==1){forwardStart=playerSnap.key();}
              }
              else if (playerSnap.child("position").val() == "c"+y) {
                $("#center"+y+"Select").prepend('<option value="'+playerSnap.key()+'">'+playerSnap.key()+'</option>');
                if(y==1){centerStart=playerSnap.key();}
              }
              else {
                $("#guard"+y+"Select").append('<option value="'+playerSnap.key()+'">'+playerSnap.key()+'</option>');
                $("#forward"+y+"Select").append('<option value="'+playerSnap.key()+'">'+playerSnap.key()+'</option>');
                $("#center"+y+"Select").append('<option value="'+playerSnap.key()+'">'+playerSnap.key()+'</option>');
              }
            }
         }//else{console.log(playerSnap.key() +" not a player ");}
      });
    }
    $('select').prop('selectedIndex', 0);
  }
}
//DEPTH CHART PULL DOWNS CHANGED.
function depthChange(selectPlayer, location){
  var oldVal;
  console.log("value retrieved is: "+ selectPlayer+" and "+location);
  oldVal = $('select[name=' + location + '] :nth-child(1)').val();
  if(oldVal!="false"){
    console.log("old val found to be a player: "+oldVal);
    fireRef.child("leagueArray").child(leagueArrayComplete.key()).child(userTeamName).child(oldVal).child("position").set("bench");
  }
  fireRef.child("leagueArray").child(leagueArrayComplete.key()).child(userTeamName).child(selectPlayer).child("position").set(location);
}
function roundToTwo(num) {
    return +(Math.round(num + "e+2")  + "e-2");
}