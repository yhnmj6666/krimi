import { ref, push, update, query, orderByChild, equalTo, onChildAdded, onValue, set, onChildChanged, get, remove } from "firebase/database";
import database from "@/database";
import rules from "@/api/rules";
import means from "@/data/means";
import clues from "@/data/clues";
import analysis from "@/data/analysis";
import cardMapping from "@/data/card-mapping";
import meanspt_br from "@/data/means-ptbr";
import cluespt_br from "@/data/clues-ptbr";
import analysispt_br from "@/data/analysis-ptbr";

import router from "@/router";

export default {
  createGame: async (context, payload) => {
    const payload_lang = payload.lang;
    const payload_gameId = payload.gameId;
    const gameList = ref(database, "/");
    // const gameList = database.ref("/");
    var game;
    var gamekey;
    var lastGame;
    var gameId; 
    var players = {};
    if (payload_gameId) {
      // we are restarting a existing game.
      game = query(gameList, orderByChild("gameId"), equalTo(payload_gameId));
      await get(game).then(x => lastGame = x.val());
      gamekey = Object.keys(lastGame)[0];
      gameId = lastGame[gamekey].gameId;
      game = ref(database, "/" + gamekey);
      players = lastGame[gamekey].players;
    }
    else {
      game = await push(gameList);
      gamekey = game.key;
      gameId = rules.createRandomId();
    }
    const gameData = {
      gameId: gameId,
      players: players,
      detective: 0,
      gamekey,
      finished: false,
      availableClues: 6,
      round: 1,
      lang: payload_lang
    };
    await set(game, gameData);
    context.commit("setGame", gameData);
    return {
      gameId: gameData.gameId,
      gamekey
    };
  },

  loadGame: async (context, payload) => {
    const loadedGame = query(ref(database, "/"), orderByChild("gameId"), equalTo(payload));
    // const loadedGame = database
    //   .ref("/")
    //   .orderByChild("gameId")
    //   .equalTo(payload);
    await onChildAdded(loadedGame, snapshot => {
      context.commit("setGame", snapshot.val());
    });
    // await loadedGame.on("child_added", snapshot => {
    //   context.commit("setGame", snapshot.val());
    // });
    onChildChanged(loadedGame, snapshot => {
      context.commit("setGame", snapshot.val());
    });
    // loadedGame.on("child_changed", snapshot => {
    //   context.commit("setGame", snapshot.val());
    // });
  },

  async startGame(context, payload) {
    const gameclues = {
      en: {
        clues,
        means,
        analysis
      },
      pt_br: {
        clues: cluespt_br,
        means: meanspt_br,
        analysis: analysispt_br
      }
    };
    const lang = payload.lang || "en";
    const gameMeansNumber = payload.meansNumber || 4;
    const gameCluesNumber = payload.cluesNumber || 4;
    const gameMeans = rules.getRandom(
      gameclues[lang].means,
      payload.players.length * gameMeansNumber
    );
    const gameClues = rules.getRandom(
      gameclues[lang].clues,
      payload.players.length * gameCluesNumber
    );
    const analysisCause = gameclues[lang].analysis.filter(
      item => item.type === 0
    );
    const analysisLocation = rules.getRandom(
      gameclues[lang].analysis.filter(item => item.type === 1),
      1
    );
    const analysisOther = rules.getRandom(
      gameclues[lang].analysis.filter(item => item.type === 2),
      6
    );

    const players = payload.playersObj;
    let iterate = 0;
    for (let player in players) {
      players[player] = {
        index: iterate,
        ...players[player]
      };
      iterate++;
    }
    const identities = rules.assignRandomIdentities(payload.players, payload.host);
    const startedGame = {
      started: true,
      means: gameMeans,
      meansNumber: gameMeansNumber,
      clues: gameClues,
      cluesNumber: gameCluesNumber,
      players,
      analysis: [...analysisCause, ...analysisLocation, ...analysisOther],
      murderer: identities.filter(item => item.identity === rules.identities.murderer)[0].slug,
      accompliances: identities.filter(item => item.identity === rules.identities.accompliance).map(x => x.slug),
    };
    await update(ref(database, "/" + payload.game), startedGame);
    // await database.ref("/" + payload.game).update(startedGame);
  },

  async setDetective(context, payload) {
    await update(ref(database, "/" + payload.game), {
      detective: payload.player
    });
    // await database.ref("/" + payload.game).update({
    //   detective: payload.player
    // });
  },

  async setAnalysis(context, payload) {
    await update(ref(database, "/" + payload.game), {
      forensicAnalysis: payload.analysis
    });
    // await database.ref("/" + payload.game).update({
    //   forensicAnalysis: payload.analysis
    // });
  },

  async setMurdererChoice(context, payload) {
    await update(ref(database, "/" + payload.game), {
      murdererChoice: payload.choice
    });
    // await database.ref("/" + payload.game).update({
    //   murdererChoice: payload.choice
    // });
  },

  async passTurn(context, payload) {
    const game = context.state.game;
    const players = Object.keys(game.players).length;
    const turnsArray = game.passedTurns || new Array(players).fill(false);
    turnsArray[payload.player.index] = true;
    await update(ref(database, `/${payload.game}`), {
      passedTurns: turnsArray
    });
    // await database.ref(`/${payload.game}`).update({
    //   passedTurns: turnsArray
    // });
    context.dispatch("checkEndGame", payload);
  },

  async makeGuess(context, payload) {
    const game = context.state.game;
    const players = Object.keys(game.players).length;
    const guessesArray = game.guesses || new Array(players).fill(false);
    guessesArray[payload.player.index] = payload.guess;
    await update(ref(database, `/${payload.game}`), {
      guesses: guessesArray
    });
    // await database.ref(`/${payload.game}`).update({
    //   guesses: guessesArray
    // });
    context.dispatch("checkEndGame", payload);
  },

  async checkEndGame(context, payload) {
    const game = context.state.game;
    const players = Object.keys(game.players).length;
    const validGuesses =
      (game.guesses && game.guesses.filter(item => item.key)) || [];
    const playersPassed =
      (game.passedTurns && game.passedTurns.filter(item => item === true)) ||
      [];
    if (
      game.guesses &&
      game.guesses.filter(
        item =>
          item.mean === game.murdererChoice.mean &&
          item.key === game.murdererChoice.key
      ).length > 0
    ) {
      await update(ref(database, `/${payload.game}`), {
        finished: true,
        winner: "detectives"
      });
      // await database.ref(`/${payload.game}`).update({
      //   finished: true,
      //   winner: "detectives"
      // });
    } else if ((validGuesses.length === players - 1) || (game.round === 3 &&
    validGuesses.length + playersPassed.length === players - 1) || game.round > 3) {
      await update(ref(database, `/${payload.game}`), {
        finished: true,
        winner: "murderer"
      });
      // await database.ref(`/${payload.game}`).update({
      //   finished: true,
      //   winner: "murderer"
      // });
    } else {
      const newRound =
        validGuesses.length + playersPassed.length === players - 1
          ? game.round + 1
          : game.round;
      const newClues =
        validGuesses.length + playersPassed.length === players - 1
          ? game.availableClues + 1
          : game.availableClues;
      const clearPass =
        (validGuesses.length + playersPassed.length === players - 1
          ? new Array(players).fill(false)
          : game.passedTurns) || [];
      await update(ref(database, `/${payload.game}`), {
        passedTurns: clearPass,
        availableClues: newClues,
        round: newRound
      });
      // await database.ref(`/${payload.game}`).update({
      //   passedTurns: clearPass,
      //   availableClues: newClues,
      //   round: newRound
      // });
    }
  },

  async addPlayer(context, payload) {
    const loadedGame = await new Promise((resolve, reject) => {
      onChildAdded(query(ref(database, "/"), orderByChild("gameId"), equalTo(payload.gameId)), 
        x => {
          resolve(x);
          reject;
        }, {
          onlyOnce: true
        }
      );
    }).then(snaphot => snaphot.val());
    // const loadedGame = await database
    //   .ref("/")
    //   .orderByChild("gameId")
    //   .equalTo(payload.gameId)
    //   .once("child_added")
    //   .then(snaphot => snaphot.val());

    const gamePlayers = await ref(database, `/${loadedGame.gamekey}/players`);
    // const gamePlayers = await database.ref(`/${loadedGame.gamekey}/players`);

    const oldPlayer = await new Promise((resolve, reject) => {
      onValue(query(gamePlayers, orderByChild("slug"), equalTo(payload.slug)),
        x => {
          resolve(x);
          reject;
        }, {
          onlyOnce: true
        }
      );
    }).then(snapshot => {
      return snapshot.val();
    });
    // const oldPlayer = await gamePlayers
    //   .orderByChild("slug")
    //   .equalTo(payload.slug)
    //   .once("value")
    //   .then(snapshot => {
    //     return snapshot.val();
    //   });

    if (oldPlayer && loadedGame.started) {
      router.push(`/game/${payload.gameId}/player/${payload.slug}`);
      return false;
    } else if (loadedGame.started) {
      return "Game has alredy started and no new players can join";
    }

    const player = push(gamePlayers);
    // const player = gamePlayers.push();
    const playerkey = player.key;
    // const playerkey = player.getKey();

    const playerData = {
      name: payload.nickname,
      slug: payload.slug,
      playerkey
    };
    await set(player, playerData);
    // await player.set(playerData);
    context.commit("setPlayer", playerData);
    router.push(`/game/${payload.gameId}/player/${payload.slug}`);
  },

  async loadPlayer(context, payload) {
    const loadedGame = await new Promise((resolve, reject) => {
      onChildAdded(query(ref(database, "/"), orderByChild("gameId"), equalTo(payload.game)), 
        x => {
          resolve(x);
          reject;
        }, {
          onlyOnce: true
        }
      );
    }).then(snaphot => snaphot.val());
    // const loadedGame = await database
    //   .ref("/")
    //   .orderByChild("gameId")
    //   .equalTo(payload.game)
    //   .once("child_added")
    //   .then(snapshot => {
    //     return snapshot.val();
    //   });
    context.dispatch("loadGame", payload.game);
    const target = await new Promise((resolve, reject) => {
      onChildAdded(query(ref(database, `/${loadedGame.gamekey}/players/`), orderByChild("slug"), equalTo(payload.player)), 
        x => {
          resolve(x);
          reject;
        }, {
          onlyOnce: true
        }
      );
    }).then(snaphot => snaphot.val());
    // const target = await database
    //   .ref(`/${loadedGame.gamekey}/players/`)
    //   .orderByChild("slug")
    //   .equalTo(payload.player)
    //   .once("child_added")
    //   .then(snapshot => snapshot.val());
    context.commit("setPlayer", target);
  },

  async removePlayer(context, payload) {
    const loadedGame = await new Promise((resolve, reject) => {
      onChildAdded(query(ref(database, "/"), orderByChild("gamekey"), equalTo(payload.game)), 
        x => {
          resolve(x);
          reject;
        }, {
          onlyOnce: true
        }
      );
    }).then(snaphot => snaphot.val());

    
    const gamePlayers = await ref(database, `/${loadedGame.gamekey}/players`);

    const oldPlayer = await new Promise((resolve, reject) => {
      onValue(query(gamePlayers, orderByChild("playerkey"), equalTo(payload.playerkey)),
        x => {
          resolve(x);
          reject;
        }, {
          onlyOnce: true
        }
      );
    }).then(snapshot => {
      return snapshot.val();
    });

    await remove(ref(database, `/${loadedGame.gamekey}/players/${Object.keys(oldPlayer)[0]}`));
  },

  getWordUrl(context, payload) {
    return `/img/cards/${cardMapping[payload.word] || "unknown"}.png`
  }
};
