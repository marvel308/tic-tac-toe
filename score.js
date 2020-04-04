let canvas2 = document.getElementById("score");
let ctx2 = canvas2.getContext("2d");

function drawIntro() {
    ctx2.font = "20px Arial";
    ctx2.fillStyle = "#0095DD";
    ctx2.fillText("Welcome player" + GameObject.id, 80, 20);
}

async function getTurnText() {
    let game_id = GameObject.game;
	let id = GameObject.id
    const response = await fetch('turn?game=' + game_id)
                            .then(handleErrors)
                            .then(function(response) {
                                return response;
                            }).catch(function(error) {
                                return null;
                            });
    if(response == null) {
        return {text:"Waiting for the another player to join", style:"rgb(255,0,0)"};
    }
    const data = await response.json();
    if(data == id) {
        return {text:"It is your turn", style:"rgb(0,255,0)"};
    }
    else {
        return {text:"Waiting for the other player to move", style:"rgb(255,0,0)"};
    }
    
}
function drawTurn(turnObject) {
    ctx2.font = "20px Arial";
    ctx2.fillStyle = turnObject.style;
    ctx2.fillText(turnObject.text, 10, 80);
}

async function getScores() {
    let game_id = GameObject.game;
	let id = GameObject.id
    const response = await fetch('getscores?game=' + game_id)
                            .then(handleErrors)
                            .then(function(response) {
                                return response;
                            }).catch(function(error) {
                                return null;
                            });
    let score = {"0": 0,"1":0, "2":0};
    if(response != null) {
        score = await response.json();
    }
    return score;
}

function drawScoreBoard(score) {
    ctx2.fillStyle = "#000000"
    ctx2.beginPath();
	ctx2.rect(20, 100, 300, 200);
    ctx2.fillText("Score Board", 130, 120);
    ctx2.fillText("Player1   " + score["1"], 20, 150);
    ctx2.fillText("Player2   " + score["2"], 20, 190);
    ctx2.fillText("Draw       " + score["0"], 20, 230);
	ctx2.stroke();
}

async function drawScore() {
    const turnObject = await getTurnText();
    const score = await getScores();
    ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
    drawIntro();
    drawTurn(turnObject);
    drawScoreBoard(score);
    setTimeout(drawScore, 1000);
}

drawScore();