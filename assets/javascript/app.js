// Initialize Firebase
var config = {
    apiKey: "AIzaSyCGMu42W2VCH3QSsHWWSjQgJa6B-qHpGFI",
    authDomain: "traintime-e87db.firebaseapp.com",
    databaseURL: "https://traintime-e87db.firebaseio.com",
    projectId: "traintime-e87db",
    storageBucket: "traintime-e87db.appspot.com",
    messagingSenderId: "518350603464"
};
firebase.initializeApp(config);

var database = firebase.database();

var trainName = "";
var destination = "";
var startTime = "";
var frequency = 0;

//Posting current time for reference
function currentTime() {
    var current = moment().format('LT');
    $("#currentTime").html(current);
    setTimeout(currentTime, 1000);
};

$(".form-field").on("keyup", function () {
    var traintemp = $("#train-name").val().trim();
    var citytemp = $("#destination").val().trim();
    var timetemp = $("#first-train").val().trim();
    var freqtemp = $("#frequency").val().trim();

    sessionStorage.setItem("train", traintemp);
    sessionStorage.setItem("city", citytemp);
    sessionStorage.setItem("time", timetemp);
    sessionStorage.setItem("freq", freqtemp);
});

$("#train-name").val(sessionStorage.getItem("train"));
$("#destination").val(sessionStorage.getItem("city"));
$("#first-train").val(sessionStorage.getItem("time"));
$("#frequency").val(sessionStorage.getItem("freq"));

//Click event for submit button
$("#submit").on("click", function (event) {
    event.preventDefault();

//Making sure all info in inserted before sending user input
    if ($("#train-name").val().trim() === "" ||
        $("#destination").val().trim() === "" ||
        $("#first-train").val().trim() === "" ||
        $("#frequency").val().trim() === "") {

           
        alert("Almost there but we still need some info!");

    } else {

        trainName = $("#train-name").val().trim();
        destination = $("#destination").val().trim();
        startTime = $("#first-train").val().trim();
        frequency = $("#frequency").val().trim();

        $(".form-field").val("");

        database.ref().push({
            trainName: trainName,
            destination: destination,
            frequency: frequency,
            startTime: startTime,
            dateAdded: firebase.database.ServerValue.TIMESTAMP
        });

        sessionStorage.clear();
    }

});

//Using moment.js to convert time 
database.ref().on("child_added", function (childSnapshot) {
    var startTimeConverted = moment(childSnapshot.val().startTime, "hh:mm").subtract(1, "years");
    var timeDiff = moment().diff(moment(startTimeConverted), "minutes");
    var timeRemain = timeDiff % childSnapshot.val().frequency;
    var minToArrival = childSnapshot.val().frequency - timeRemain;
    var nextTrain = moment().add(minToArrival, "minutes");
    var key = childSnapshot.key;
//Appending to each row in out Current Train Schedule. Also adding our remove button.
    var newrow = $("<tr>");
    newrow.append($("<td>" + childSnapshot.val().trainName + "</td>"));
    newrow.append($("<td>" + childSnapshot.val().destination + "</td>"));
    newrow.append($("<td class='text-center'>" + childSnapshot.val().frequency + "</td>"));
    newrow.append($("<td class='text-center'>" + moment(nextTrain).format("LT") + "</td>"));
    newrow.append($("<td class='text-center'>" + minToArrival + "</td>"));
    newrow.append($("<td class='text-center'><button class='arrival btn btn-outline-danger' data-key='" + key + "'>X</button></td>"));

    if (minToArrival < 6) {
        newrow.addClass("info");
    }

    $("#train-table-rows").append(newrow);

});

$(document).on("click", ".arrival", function () {
    keyref = $(this).attr("data-key");
    database.ref().child(keyref).remove();
    window.location.reload();
});

currentTime();

setInterval(function () {
    window.location.reload();
}, 60000);


//Fun Ideas for later:
    //Add MARTA API so train time is functional for Atlanta citzens.
    //Change Alert to a modal and make it look fancy.