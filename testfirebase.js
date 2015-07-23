$(document).ready(console.log("JQuery ready"));
// CREATE A REFERENCE TO FIREBASE
var fireRef = new Firebase("https://blinding-torch-6843.firebaseio.com/");
// var ref = new Firebase("https://docs-examples.firebaseio.com/web/saving-data/fireblog");
// var usersRef = ref.child("users");
var playerFireRef = fireRef.child("playerArray");

function lamo (){
  var nameField = $('#playerNameInput');
  nameField.keypress(function (y){
    if(y.keyCode == 13){
      var playerName = nameField.val();
      playerFireRef.child(playerName).set(
          {name: playerName},
          function(error) {
              if (error) {
                alert("Data could not be saved." + error);
              } else {
                console.log("Data saved successfully.");
              }
           })
     }
  })
  //Listener
  fireRef.on("child_changed", function(snapshot) {
      var changedItem = snapshot.val();
      console.log(snapshot.val());
    }, function (errorObject) {
      console.log("The read failed: " + errorObject.code);
  });
}

function oldPants (){
    $('#testBlock').text("Greetings");

  // REGISTER DOM ELEMENTS
  var messageField = $('#messageInput');
  var nameField = $('#nameInput');
  var messageList = $('#example-messages');

  // LISTEN FOR KEYPRESS EVENT
  messageField.keypress(function  (e) {
    if (e.keyCode == 13) {
      //FIELD VALUES
      var username = nameField.val();
      var message = messageField.val();

      //SAVE DATA TO FIREBASE AND EMPTY FIELD
      var pushGetID = fireRef.push({name:username, text:message});
      console.log(pushGetID.key());
      messageField.val('');
    }
  });

  // Add a callback that is triggered for each chat message.
  fireRef.limitToLast(10).on('child_added', function (snapshot) {
    //GET DATA
    var data = snapshot.val();
    var username = data.name || "anonymous";
    var message = data.text;

    //CREATE ELEMENTS MESSAGE & SANITIZE TEXT
    var messageElement = $("<li>");
    var nameElement = $("<strong class='example-chat-username'></strong>")
    nameElement.text(username);
    messageElement.text(message).prepend(nameElement);

    //ADD MESSAGE
    messageList.append(messageElement)

    //SCROLL TO BOTTOM OF MESSAGE LIST
    messageList[0].scrollTop = messageList[0].scrollHeight;
  });
}