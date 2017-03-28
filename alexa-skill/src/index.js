"use strict";
var APP_ID = undefined;  // TODO replace with your app ID (OPTIONAL).

var ANSWER_COUNT = 4; // The number of possible answers per trivia question.
var GAME_LENGTH = 1;  // The number of questions per trivia game.
var GAME_STATES = {
    BACKUP: "_BACKUP", // Asking trivia questions.
    START: "_STARTMODE", // Entry point, start the game.
    YES: "_YES", // Entry point, start the game.
    HELP: "_HELPMODE" // The user is asking for help.
};
var questions = require("./questions");
var https = require('https');
var http = require('http');


//var restURL_sendRight = "https://shrouded-forest-41191.herokuapp.com/sendRight"
//var restURL_stopRight = "https://shrouded-forest-41191.herokuapp.com/stopRight"
var restURL_sendRight = {
    host: 'https://shrouded-forest-41191.herokuapp.com',
    path: '/sendRight',
    headers: { 'Content-Type': "text/plain" }
};

var restURL_stopRight = {
    host: 'https://shrouded-forest-41191.herokuapp.com',
    path: '/stopRight',
    headers: { 'Content-Type': "text/plain" }
};

/**
 * When editing your questions pay attention to your punctuation. Make sure you use question marks or periods.
 * Make sure the first answer is the correct one. Set at least ANSWER_COUNT answers, any extras will be shuffled in.
 */
var languageString = {
    "en": {
        "translation": {
            "QUESTIONS" : questions["QUESTIONS_EN_US"],
            "GAME_NAME" : "Test", // Be sure to change this for your skill.
            "HELP_MESSAGE": "Depending on the step of the game, the help message would change.",
            "REPEAT_QUESTION_MESSAGE": "To repeat the last question, say, repeat. ",
            "ASK_MESSAGE_START": "Would you like to start playing?",
            "HELP_REPROMPT": "To give an answer to a question, respond with the number of the answer. ",
            "STOP_MESSAGE": "Would you like to keep playing?",
            "CANCEL_MESSAGE": "Ok, let\'s play again soon.",
            "NO_MESSAGE": "Ok, we\'ll play another time. Goodbye!",
            "TRIVIA_UNHANDLED": "Try saying a number between 1 and %s",
            "HELP_UNHANDLED": "Say yes to continue, or no to end the game.",
            "START_UNHANDLED": "Say start to start a new game.",
            "NEW_GAME_MESSAGE": "Welcome to %s. ",
            "WELCOME_MESSAGE": "Starting application." +
            "Just say the number of the answer. Let\'s begin. ",
            "ANSWER_CORRECT_MESSAGE": "correct. ",
            "ANSWER_WRONG_MESSAGE": "wrong. ",
            "CORRECT_ANSWER_MESSAGE": "The correct answer is %s: %s. ",
            "ANSWER_IS_MESSAGE": "That answer is ",
            "TELL_QUESTION_MESSAGE": "Question %s. %s ",
            "GAME_OVER_MESSAGE": "You got %s out of %s questions correct. Thank you for playing!",
            "SCORE_IS_MESSAGE": "Your score is %s. ",
            "BALL_RIGHT": "Moving right.",
            "BALL_UNHANDLED": "Say move right to move the ball to the right",
            "BALL_MOVED_RIGHT" : "Moved right."
        }
    }
};

var Alexa = require("alexa-sdk");
var APP_ID = undefined;  // TODO replace with your app ID (OPTIONAL).

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context, callback);
    alexa.appId = APP_ID;
    // To enable string internationalization (i18n) features, set a resources object.
    alexa.resources = languageString;
    alexa.registerHandlers(newSessionHandlers, startStateHandlers, triviaStateHandlers, helpStateHandlers, yesHandlers);
    alexa.execute();
};

var newSessionHandlers = {
    "LaunchRequest": function () {
        this.handler.state = GAME_STATES.START;
        this.emitWithState("StartGame", true);
    },
    "AMAZON.StartOverIntent": function() {
        this.handler.state = GAME_STATES.START;
        this.emitWithState("StartGame", true);
    },
    "AMAZON.HelpIntent": function() {
        this.handler.state = GAME_STATES.HELP;
        this.emitWithState("helpTheUser", true);
    },
    "Unhandled": function () {
        var speechOutput = this.t("START_UNHANDLED");
        this.emit(":ask", speechOutput, speechOutput);
    }
};


function CallURL(endpoint, update, callback) {
    //var speechOutput = this.t("BALL_RIGHT")
    //https.request(restURL_sendRight, function(response){console.log(response)}).end();

    if(endpoint == "state"){
        var options = {
            host: 'sample-env.bj3rsbfq2s.us-east-1.elasticbeanstalk.com',
            path: '/setState?s=' + update,
            agent: false,
            method: 'GET',
            headers: { 'Content-Type': "text/plain" }
        };
    } else if( endpoint == "afterBeginTO"){
        var options = {
            host: 'sample-env.bj3rsbfq2s.us-east-1.elasticbeanstalk.com',
            path: '/afterBeginTO',
            agent: false,
            method: 'GET',
            headers: { 'Content-Type': "text/plain" }
        };
    } else if( endpoint == "beforeDangerTO"){
        var options = {
            host: 'sample-env.bj3rsbfq2s.us-east-1.elasticbeanstalk.com',
            path: '/beforeDangerTO',
            agent: false,
            method: 'GET',
            headers: { 'Content-Type': "text/plain" }
        };
    } else {
        var options = {
            host: 'sample-env.bj3rsbfq2s.us-east-1.elasticbeanstalk.com',
            path: '/getEgg',
            agent: false,
            method: 'GET',
            headers: { 'Content-Type': "text/plain" }
        };
    }

    /*
    https.get("https://shrouded-forest-41191.herokuapp.com/sendRight", function (res) {
        console.log("Received response:" + res.statusCode);
    });
    */
    
    console.log("Debugging console test")
    var rdata = ''
    var req = http.request(options, function (res) {
        res.on('data', function (data) {
            rdata = data
        });
        
        res.on('end', function(){
            callback(rdata);
            console.log("finished get");
        });
    })
    req.end();
    // .on('error', function (e) {
    //     console.log("Error message: " + e.message);
    // });
    
    /*
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", "https://shrouded-forest-41191.herokuapp.com/sendRight", true);
    xhttp.setRequestHeader("Content-type", "text/plain");
    xhttp.send();
    var response = xhttp.responseText;
    console.log(response)
    */
};

function EmptyFunc() { }


var startStateHandlers = Alexa.CreateStateHandler(GAME_STATES.START, {
    "StartGame": function (newGame) {
        var speechOutput = "Welcome to the Hammond Creation Lab."
        speechOutput += "Mission Clue: Rescue what came first. Would you like to begin?";

        //this.emit(":tell", speechOutput)
        // CallURL(response => {
        //     console.log(response);
        //     this.handler.state = GAME_STATES.TRIVIA;
        //     // this.emit(":tell", speechOutput + ". we also received " + response + "!!!", repromptText, this.t("GAME_NAME"), repromptText);
        //     // this.emit(":tell", "Hello", repromptText, this.t("GAME_NAME"), repromptText);
        //     // this.emit(":tell", "Hello number 2");
        //     // this.emit(":tell", "Hello number 2", repromptText, this.t("GAME_NAME"), repromptText);
        //     // var that = this
        //     setTimeout(() => {
        //         this.emit(":tell", "hello again");
        //         console.log("help");
        //     }, 
        //     10000);
        //     console.log("new");
        // });
        // setTimeout(() => this.emit(":tell", "hello again"), 10000);

        // Select GAME_LENGTH questions for the game
        // var translatedQuestions = this.t("QUESTIONS");
        // var gameQuestions = populateGameQuestions(translatedQuestions);
        // // Generate a random index for the correct answer, from 0 to 3
        // var correctAnswerIndex = Math.floor(Math.random() * (ANSWER_COUNT));
        // // Select and shuffle the answers for each question
        // var roundAnswers = populateRoundAnswers(gameQuestions, 0, correctAnswerIndex, translatedQuestions);
        // var currentQuestionIndex = 0;
        // var spokenQuestion = Object.keys(translatedQuestions[gameQuestions[currentQuestionIndex]])[0];
        // var repromptText = this.t("TELL_QUESTION_MESSAGE", "1", spokenQuestion);

        // for (var i = 0; i < ANSWER_COUNT; i++) {
        //     repromptText += (i+1).toString() + ". " + roundAnswers[i] + ". ";
        // }

        // speechOutput += repromptText;
        // console.log("after....");

        Object.assign(this.attributes, {
            "speechOutput": speechOutput,
            "repromptText": speechOutput,
            "state": "START"
        });

        // Set the current state to trivia mode. The skill will now use handlers defined in triviaStateHandlers
        this.handler.state = GAME_STATES.START;
        this.emit(":ask", speechOutput);
    },
    "AMAZON.YesIntent": function() {
        this.handler.state = GAME_STATES.YES;
        this.emitWithState("saidYes");
    }
});

var yesHandlers = Alexa.CreateStateHandler(GAME_STATES.YES, {
    "saidYes": function () {

        if(this.attributes.state == "START"){
            CallURL("state", "STARTMISSION", response => {
                CallURL("afterBeginTO", "", to => {
                    var speechOutput = "Velociraptor mongoliensis was created by InGen for the IBRIS Project. By augmenting missing dinosaur DNA with reptilian and avian DNA, the Raptors of Jurassic World exhibit surprising unexpected characteristics not yet fully discovered."
                    speechOutput += "<break time=\"1s\"/>Backup Power supply is available at 50%. Shall I turn on emergency safety lights?"
                    this.handler.state = GAME_STATES.YES;
                    Object.assign(this.attributes, {
                        "speechOutput": speechOutput,
                        "repromptText": speechOutput,
                        "state": "EMERGENCYLIGHT"
                    });
                    console.log(parseInt(to));
                    setTimeout(() => {
                        this.emit(":ask", speechOutput);
                    }, parseInt(to));
                });
            });
        }

        if(this.attributes.state == "EMERGENCYLIGHT"){
            CallURL("state", "EMERGENCYLIGHTS", response => {
                CallURL("beforeDangerTO", "", to => {
                    var speechOutput = "warning. warning. T-Rex in area"
                    this.handler.state = GAME_STATES.YES;
                    Object.assign(this.attributes, {
                        "speechOutput": speechOutput,
                        "repromptText": speechOutput,
                        "state": "EMERGENCYLIGHT"
                    });
                    console.log(parseInt(to));
                    setTimeout(() => {
                        CallURL("state", "DANGER", response2 => {
                            this.emit(":tell", speechOutput)
                        });
                    }, parseInt(to));
                });
            });
        }
    },
    "AMAZON.YesIntent": function() {
        this.handler.state = GAME_STATES.YES;
        this.emitWithState("saidYes");
    }
});

var triviaStateHandlers = Alexa.CreateStateHandler(GAME_STATES.TRIVIA, {
    "AMAZON.StartOverIntent": function () {
        this.handler.state = GAME_STATES.START;
        this.emitWithState("StartGame", false);
    },
    "AMAZON.RepeatIntent": function () {
        this.emit(":ask", this.attributes["speechOutput"], this.attributes["repromptText"]);
    },
    "AMAZON.HelpIntent": function () {
        this.handler.state = GAME_STATES.HELP;
        this.emitWithState("helpTheUser", false);
    },
    "AMAZON.StopIntent": function () {
        this.handler.state = GAME_STATES.HELP;
        var speechOutput = this.t("STOP_MESSAGE");
        this.emit(":ask", speechOutput, speechOutput);
    },
    "AMAZON.CancelIntent": function () {
        this.emit(":tell", this.t("CANCEL_MESSAGE"));
    },
    "Unhandled": function () {
        var speechOutput = this.t("TRIVIA_UNHANDLED", ANSWER_COUNT.toString());
        this.emit(":ask", speechOutput, speechOutput);
    },
    "SessionEndedRequest": function () {
        console.log("Session ended in trivia state: " + this.event.request.reason);
    }
});

var helpStateHandlers = Alexa.CreateStateHandler(GAME_STATES.HELP, {
    "helpTheUser": function (newGame) {
        var askMessage = newGame ? this.t("ASK_MESSAGE_START") : this.t("REPEAT_QUESTION_MESSAGE") + this.t("STOP_MESSAGE");
        var speechOutput = this.t("HELP_MESSAGE", GAME_LENGTH) + askMessage;
        var repromptText = this.t("HELP_REPROMPT") + askMessage;
        this.emit(":ask", speechOutput, repromptText);
    },
    "AMAZON.StartOverIntent": function () {
        this.handler.state = GAME_STATES.START;
        this.emitWithState("StartGame", false);
    },
    "AMAZON.RepeatIntent": function () {
        var newGame = (this.attributes["speechOutput"] && this.attributes["repromptText"]) ? false : true;
        this.emitWithState("helpTheUser", newGame);
    },
    "AMAZON.HelpIntent": function() {
        var newGame = (this.attributes["speechOutput"] && this.attributes["repromptText"]) ? false : true;
        this.emitWithState("helpTheUser", newGame);
    },
    "AMAZON.YesIntent": function() {
        this.handler.state = GAME_STATES.YES;
        this.emitWithState("saidYes");
    },
    "AMAZON.NoIntent": function() {
        var speechOutput = this.t("NO_MESSAGE");
        this.emit(":tell", speechOutput);
    },
    "AMAZON.StopIntent": function () {
        var speechOutput = this.t("STOP_MESSAGE");
        this.emit(":ask", speechOutput, speechOutput);
    },
    "AMAZON.CancelIntent": function () {
        this.emit(":tell", this.t("CANCEL_MESSAGE"));
    },
    "Unhandled": function () {
        var speechOutput = this.t("HELP_UNHANDLED");
        this.emit(":ask", speechOutput, speechOutput);
    },
    "SessionEndedRequest": function () {
        console.log("Session ended in help state: " + this.event.request.reason);
    }
});

function handleUserGuess(userGaveUp) {
    
    var answerSlotValid = isAnswerSlotValid(this.event.request.intent);
    var speechOutput = "";
    var speechOutputAnalysis = "";
    var gameQuestions = this.attributes.questions;
    var correctAnswerIndex = parseInt(this.attributes.correctAnswerIndex);
    var currentScore = parseInt(this.attributes.score);
    var currentQuestionIndex = parseInt(this.attributes.currentQuestionIndex);
    var correctAnswerText = this.attributes.correctAnswerText;
    var translatedQuestions = this.t("QUESTIONS");

    if (answerSlotValid && parseInt(this.event.request.intent.slots.Answer.value) == this.attributes["correctAnswerIndex"]) {
        currentScore++;
        speechOutputAnalysis = this.t("ANSWER_CORRECT_MESSAGE");
    } else {
        if (!userGaveUp) {
            speechOutputAnalysis = this.t("ANSWER_WRONG_MESSAGE");
        }

        speechOutputAnalysis += this.t("CORRECT_ANSWER_MESSAGE", correctAnswerIndex, correctAnswerText);
    }

    // Check if we can exit the game session after GAME_LENGTH questions (zero-indexed)
    if (this.attributes["currentQuestionIndex"] == GAME_LENGTH - 1) {
        speechOutput = userGaveUp ? "" : this.t("ANSWER_IS_MESSAGE");
        speechOutput += speechOutputAnalysis + this.t("GAME_OVER_MESSAGE", currentScore.toString(), GAME_LENGTH.toString());

        this.emit(":tell", speechOutput)
    } else {
        currentQuestionIndex += 1;
        correctAnswerIndex = Math.floor(Math.random() * (ANSWER_COUNT));
        var spokenQuestion = Object.keys(translatedQuestions[gameQuestions[currentQuestionIndex]])[0];
        var roundAnswers = populateRoundAnswers.call(this, gameQuestions, currentQuestionIndex, correctAnswerIndex, translatedQuestions);
        var questionIndexForSpeech = currentQuestionIndex + 1;
        var repromptText = this.t("TELL_QUESTION_MESSAGE", questionIndexForSpeech.toString(), spokenQuestion);

        for (var i = 0; i < ANSWER_COUNT; i++) {
            repromptText += (i+1).toString() + ". " + roundAnswers[i] + ". "
        }

        speechOutput += userGaveUp ? "" : this.t("ANSWER_IS_MESSAGE");
        speechOutput += speechOutputAnalysis + this.t("SCORE_IS_MESSAGE", currentScore.toString()) + repromptText;

        Object.assign(this.attributes, {
            "speechOutput": repromptText,
            "repromptText": repromptText,
            "currentQuestionIndex": currentQuestionIndex,
            "correctAnswerIndex": correctAnswerIndex + 1,
            "questions": gameQuestions,
            "score": currentScore,
            "correctAnswerText": translatedQuestions[gameQuestions[currentQuestionIndex]][Object.keys(translatedQuestions[gameQuestions[currentQuestionIndex]])[0]][0]
        });

        this.emit(":askWithCard", speechOutput, repromptText, this.t("GAME_NAME"), repromptText);
    }
    
}

function populateGameQuestions(translatedQuestions) {
    var gameQuestions = [];
    var indexList = [];
    var index = translatedQuestions.length;

    if (GAME_LENGTH > index){
        throw new Error("Invalid Game Length.");
    }

    for (var i = 0; i < translatedQuestions.length; i++){
        indexList.push(i);
    }

    // Pick GAME_LENGTH random questions from the list to ask the user, make sure there are no repeats.
    for (var j = 0; j < GAME_LENGTH; j++){
        var rand = Math.floor(Math.random() * index);
        index -= 1;

        var temp = indexList[index];
        indexList[index] = indexList[rand];
        indexList[rand] = temp;
        gameQuestions.push(indexList[index]);
    }

    return gameQuestions;
}

/**
 * Get the answers for a given question, and place the correct answer at the spot marked by the
 * correctAnswerTargetLocation variable. Note that you can have as many answers as you want but
 * only ANSWER_COUNT will be selected.
 * */
function populateRoundAnswers(gameQuestionIndexes, correctAnswerIndex, correctAnswerTargetLocation, translatedQuestions) {
    var answers = [];
    var answersCopy = translatedQuestions[gameQuestionIndexes[correctAnswerIndex]][Object.keys(translatedQuestions[gameQuestionIndexes[correctAnswerIndex]])[0]].slice();
    var index = answersCopy.length;

    if (index < ANSWER_COUNT) {
        throw new Error("Not enough answers for question.");
    }

    // Shuffle the answers, excluding the first element which is the correct answer.
    for (var j = 1; j < answersCopy.length; j++){
        var rand = Math.floor(Math.random() * (index - 1)) + 1;
        index -= 1;

        var temp = answersCopy[index];
        answersCopy[index] = answersCopy[rand];
        answersCopy[rand] = temp;
    }

    // Swap the correct answer into the target location
    for (var i = 0; i < ANSWER_COUNT; i++) {
        answers[i] = answersCopy[i];
    }
    temp = answers[0];
    answers[0] = answers[correctAnswerTargetLocation];
    answers[correctAnswerTargetLocation] = temp;
    return answers;
}

function isAnswerSlotValid(intent) {
    var answerSlotFilled = intent && intent.slots && intent.slots.Answer && intent.slots.Answer.value;
    var answerSlotIsInt = answerSlotFilled && !isNaN(parseInt(intent.slots.Answer.value));
    return answerSlotIsInt && parseInt(intent.slots.Answer.value) < (ANSWER_COUNT + 1) && parseInt(intent.slots.Answer.value) > 0;
}