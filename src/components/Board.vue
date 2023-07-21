<template>
  <v-container style="height:100%">
    <v-row style="height:100%" align="center">
      <v-col md="9">
        <v-row>
          <v-col cols="12">
            <div class="display-2">
              {{ t("Game") }}
              <code class="accent--text text-uppercase">{{ game.gameId }}</code>
              <small class="ml-lg-4"
                >{{ t("Round") }} {{ game.round }} {{ t("of") }} 3</small
              >
            </div>
            <p class="display-1 my-4">
              {{ t("Suspects of the crime:") }}
            </p>
          </v-col>
          <v-col
            class="suspect"
            v-for="player in suspects"
            :key="player.playerkey"
            md="6"
            xl="3"
          >
            <div
              class="stamp"
              v-if="game.finished"
              :style="{
                transform: `translate(-50%, -50%) rotate(${parseInt(
                  3 - Math.random() * 6
                )}deg)`,
              }"
            >
              <span class="red--text" v-if="game.murderer === player.slug">Murderer</span>
              <span v-else-if="game.accompliances && game.accompliances.includes(player.slug)">Accompliance</span>
              <span v-else>Detective</span>
            </div>
            <v-card
              :style="{
                transform: `rotate(${parseInt(3 - Math.random() * 6)}deg)`,
              }"
            >
              <v-card-text>
                <div class="title">{{ player.name }}</div>
                <div
                  style="font-family:'Shadows Into Light'; font-size: 18px; font-weight:bold;"
                  v-if="game.passedTurns && game.passedTurns[player.index]"
                >
                  {{ t("Passed this turn") }}
                </div>
                <div
                  style="font-family:'Shadows Into Light'; font-size: 18px; font-weight:bold; color: #5f6c7b"
                  v-if="game.guesses && game.guesses[player.index]"
                >
                  {{ t("Guessed that the murderer was") }}
                  {{ players[game.guesses[player.index].player].name }},
                  {{ t("the M.O. was") }}
                  {{ game.guesses[player.index].mean }}
                  {{ t("and the key evidence was") }}
                  {{ game.guesses[player.index].key }}
                </div>
                <v-divider class="my-2" />
                <v-chip-group column>
                  <v-chip
                    small
                    color="blue lighten-4"
                    v-for="(mean, index) in [...game.means].slice(
                      player.index * game.meansNumber,
                      player.index * game.meansNumber + game.meansNumber
                    )"
                    :key="index"
                    >{{ mean }}</v-chip
                  >
                </v-chip-group>
                <v-chip-group column>
                  <v-chip
                    small
                    color="red lighten-4"
                    v-for="(mean, index) in [...game.clues].slice(
                      player.index * game.cluesNumber,
                      player.index * game.cluesNumber + game.cluesNumber
                    )"
                    :key="'clue' + index"
                    >{{ mean }}</v-chip
                  >
                </v-chip-group>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12">
            <div class="finished" v-if="game.finished">
              The game is finshed. The {{ game.winner }} won!
            </div>
          </v-col>
          <v-btn
            class="mr-4 mb-4 mb-lg-0"
            @click.prevent="createNewGame"
            type="submit"
            x-large
            color="accent"
            v-if="game.finished"
            >{{ t("Start a new game") }}</v-btn
          >
        </v-row>
      </v-col>
      <v-col md="3">
        <div class="display-1 mb-4">
          {{ t("Analysis") }}
          <div class="signature">
            <span class="sign">{{ players[game.detective].name }}</span>
            <span class="text">{{ t("Forensic Scientist") }}</span>
          </div>
        </div>
        <div class="subtitle-1"></div>
        <v-card
          v-for="(item, index) in game.forensicAnalysis"
          :key="'fa' + index"
          class="mb-4"
          :style="{
            transform: `rotate(${parseInt(3 - Math.random() * 6)}deg)`,
          }"
        >
          <v-card-text class="analysis">
            <strong class="type"
              >{{ index + 1 }} {{ game.analysis[index].title }}:</strong
            >
            <span class="text">{{ item }}</span>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: "Board",

  locales: {
    pt_br: {
      Game: "Jogo",
      "Suspects of the crime:": "Suspeitos do crime:",
      "Passed this turn": "Passou o turno",
      "Guessed that the murderer was": "Achou que o assassino fosse",
      "the M.O. was": "a causa foi",
      "and the key evidence was": "e a evidência principal foi",
      Round: "Turno",
      of: "de",
      Analysis: "Análise",
      "Forensic Scientist": "Cientista Forense",
    },
  },
  computed: {
    game() {
      return this.$store.state.game;
    },
    players() {
      if (!this.game || !this.game.players) return false;
      return Object.keys(this.game.players).map(
        (item) => this.game.players[item]
      );
    },
    suspects() {
      return this.players.filter((item) => item.index !== this.game.detective);
    },
  },
  methods: {
    async createNewGame() {
      await this.$store.dispatch(
        "createGame",
        {
          gameId: this.$route.params.id,
          lang: this.$translate.lang,
        }
      );
    },
  },
  mounted() {
    this.$translate.setLang(this.game.lang);
  },
};
</script>

<style lang="scss" scoped>
.suspect {
  position: relative;
  .v-card {
    transition: all 0.3s ease-out;
  }
  &:before {
    content: "";
    display: block;
    width: 5em;
    height: 2em;
    position: absolute;
    top: 0;
    left: 50%;
    margin: auto;
    z-index: 1;
    background: rgba(255, 255, 200, 0.4);
    box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.2);
    transform: translate(-50%, -10%);
  }
  .stamp {
    font-size: 2em;
    font-family: "kingthings_trypewriter_2Rg";
    position: absolute;
    width: 100%;
    top: 50%;
    left: 50%;
    z-index: 2;
    text-align: center;
    font-weight: bold;
    letter-spacing: -1px;
    text-transform: uppercase;
    color: #00000080;
    text-shadow: 1px -1px rgba(0, 0, 0, 0.7), -1px 1px rgba(255, 255, 255, 0.7);
  }
}
.signature {
  display: flex;
  flex-direction: column;
  font-family: "Shadows Into Light";
  .sign {
    font-size: 1.25em;
    color: #3da9fc;
    letter-spacing: 0;
  }
  .text {
    font-family: "kingthings_trypewriter_2Rg";
    font-size: 0.5em;
    line-height: 1.2;
    word-spacing: 5px;
    border-top: 1px dashed $darkblue;
  }
}
.analysis {
  .type {
    font-family: "kingthings_trypewriter_2Rg";
    margin-right: 0.5em;
  }
  .text {
    font-family: "Shadows Into Light";
    font-weight: bold;
    font-size: 1.5em;
    color: #3da9fc;
    display: inline-block;
  }
}
.finished {
  margin-top: 1em;
  font-size: 2em;
  color: #ff5252;
  font-weight: bold;
  font-family: "Shadows Into Light";
}
</style>
