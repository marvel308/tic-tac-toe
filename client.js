var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
let rect = canvas.getBoundingClientRect();
let cellSize = 110;

let path = window.location.pathname;
path = path.split('/')

let GameObject = JSON.parse(atob(path[1]))

let drawBoard = () => {
	ctx.save();
	ctx.strokeStyle = 'rgba(0,0,0,0.2)';
	ctx.lineWidth = 6;
	ctx.lineCap = 'round';
	ctx.beginPath();
	// vertical
	ctx.moveTo(cellSize, 10);
	ctx.lineTo(cellSize, canvas.height - 10);
	ctx.moveTo(cellSize * 2, 10);
	ctx.lineTo(cellSize * 2, canvas.height - 10);
	// horizontal
	ctx.moveTo(10, cellSize);
	ctx.lineTo(canvas.width - 10, cellSize);
	ctx.moveTo(10, cellSize * 2);
	ctx.lineTo(canvas.width - 10, cellSize * 2);
	// draw
	ctx.stroke();
	ctx.closePath();
	ctx.restore();
};
  
 let drawX = (x, y) => {
	x = x + 55;
	y = y + 55;
	ctx.beginPath();
	ctx.strokeStyle = 'blue';
	ctx.lineCap = 'round';
	ctx.lineWidth = 6;
	ctx.moveTo(x - 28, y - 28);
	ctx.lineTo(x + 28, y + 28);
	ctx.moveTo(x + 28, y - 28);
	ctx.lineTo(x - 28, y + 28);
	ctx.stroke();
};

let drawO = (x, y) => {
	x = x + 55;
	y = y + 55;
	ctx.beginPath();
	ctx.strokeStyle = 'red';
	ctx.lineWidth = 6;
	ctx.arc(x, y, 30, Math.PI * 2, 0, false);
	ctx.stroke();
};
  
let winCombo = [
	[ 0 , 1 , 2 ], [ 3 , 4 , 5 ],
	[ 6 , 7 , 8 ], [ 0 , 3 , 6 ],
	[ 1 , 4 , 7 ], [ 2 , 5 , 8 ],
	[ 0 , 4 , 8 ], [ 2 , 4 , 6 ]
];

let X = 1, O = 2;
  
let getCell = (cell) => {
	return {x: (cell % 3) * cellSize, y: Math.floor(cell / 3) * cellSize};
};

let getCellOnClick = (mouse) => {
			return (Math.floor((mouse.x - rect.left) / cellSize) % 3) + (Math.floor((mouse.y - rect.top) / cellSize) * 3);
};

async function getData() {
	let game_id = GameObject.game;
	let id = GameObject.id
	const response = await fetch('getdata?game=' + game_id);
    const data = await response.json();
    console.log(data);
    return data;
}
  
async function fillBoard() {
	data = await getData();
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	drawBoard();
	for (let i = 0; i < data.length; i++) {
		let {x, y} = getCell(i);
		switch (data[i]) {
			case X:
				drawX(x, y);
				break;
			case O:
				drawO(x, y);
				break;
		}
	}
	return data;
};
  
// fillBoard();
  
document.addEventListener('click', (event) => play(event));

async function handleErrors(response) {
    if (!response.ok) {
        let text = await response.text();
        throw Error(text);
    }
    return response;
}

async function updateData(cell) {
	let game_id = GameObject.game;
	let id = GameObject.id
	let update = JSON.stringify([game_id, id, cell]);
	const response = await fetch('updatedata?update=' + btoa(update))
                            .then(handleErrors)
                            .then(function(response) {
                                return response;
                            }).catch(function(error) {
                                alert(error);
                                return [];
                            });
    if (response == []) {
        return [];
    }
    const data = await response.json();
    return data;
}
  
async function play(event) {
  	const mouse = {x: 0, y: 0};
    mouse.x = event.clientX;
	mouse.y = event.clientY;
    if(mouse.x > 330 || mouse.y > 330) {
        return;
    }
    data = await updateData(getCellOnClick(mouse));
    fillBoard();
    if(data) {
        checkWin(data);
    }
};
  
let reset = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    fillBoard();
}

let finished = false;

let checkWin = (data) => {

    if(finished || !data) {
        return;
    }
  	for (let i = 0; i < winCombo.length; i++) {
        if(winCombo[i].every(num => data[num] == X)) {
            alert('X won');
            finished = true;
            // reset();
        }
      
      	if(winCombo[i].every(num => data[num] == O)) {
        	alert('O won');
            finished = true;
          // reset();
        }
        if(data.every(num => num!=0)) {
            finished = true;
      	    // reset();
        }
    }
};

async function refresh() {
    let data = await fillBoard();
    checkWin(data);
    if(!finished) {
        setTimeout(refresh, 1000);
    }
}

refresh()
