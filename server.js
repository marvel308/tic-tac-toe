const fs = require('fs');
const http = require('http');

function respond(response, code, contentType, data) {
  response.writeHead(code, {'Content-Type': contentType});
  response.write(data);
  response.end();
}

function serve(response, contentType, data) {
  respond(response, 200, contentType, data);
}

function error(response, message) {
  respond(response, 404, 'text/plain', message);
}

function load(file) {
  return new Promise((resolve, reject) => {
    fs.readFile(file, (err, data) => {
      err ? reject(err) : resolve(data);
    });
  });
}

function save(file, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(file, data, 'utf8', err => {
      err ? reject(err) : resolve();
    });
  });
}

let games = new Map();
let turns = new Map();
let datas = new Map();

async function main() {
  const indexPage = await load('index.html');
  const clientPage = await load('client.html');
  const drawScript = await load('client.js');

  const server = http.createServer(async (request, response) => {
    const url = new URL(request.url, 'http://localhost:8080');
    const path = url.pathname;
    if (path == '/') return serve(response, 'text/html', indexPage);
    if (path == '/client.js') {
      return serve(response, 'text/javascript', drawScript);
    }

    if (path == '/id') {
      let game_id = url.searchParams.get('game');
      if(game_id) {
          let game = games.get(game_id)
          if(game) {
            if(game == 1) {
                games.set(game_id, 2);
                turns.set(game_id, 1);
                return serve(response, 'application/json', JSON.stringify(2));
            }
            return error(response, 'Room is full.');
          }
          games.set(game_id, 1);
          return serve(response, 'application/json', JSON.stringify(1));
      }
      return error(response, 'Invalid operation.');
    }
    if (path == '/turn') {
      let game_id = url.searchParams.get('game');
      if(game_id) {
          let turn = turns.get(game_id);
          if(turn) {
              return serve(response, 'application/json', JSON.stringify(turn));
          }
          return error(response, 'Room not full.');
      }
      return error(response, 'Invalid operation.');
    }
    if (path == '/getdata') {
        let game_id = url.searchParams.get('game');
        if(game_id) {
            let data = datas.get(game_id)
            if(data) {
                return serve(response, 'application/json', JSON.stringify(data));
            }
            data = [
	            0, 0, 0,
	            0, 0, 0,
	            0, 0, 0
            ];
            datas.set(game_id, data);
            return serve(response, 'application/json', JSON.stringify(data));
        }
        return error(response, 'Invalid operation.');
    }
    if (path == '/updatedata') {
        let update = url.searchParams.get('update');
        if(update) {
            try {
                let [game_id, id, cell] = JSON.parse(Buffer.from(update, 'base64').toString());
                if(game_id && id) {
                    let turn = turns.get(game_id);
                    if(turn == undefined) {
                        return error(response, 'Please wait for another player.');
                    }
                    if(turn == id) {
                        let data = datas.get(game_id);
                        if(data[cell] == 0) {
                            data[cell] = id;
                        }
                        datas.set(game_id, data);
                        turn = (turn==1?2:1);
                        turns.set(game_id, turn);
                        return serve(response, 'application/json', JSON.stringify(data));
                    }
                }
            }
            catch (e) {
                return error(response, JSON.stringify(e));
            }
        }
        return error(response, 'Invalid operation.');
    }
    return serve(response, 'text/html', clientPage);
  });
  server.listen(8080);
}
main().catch(function(error) {
  console.error(error);
});
