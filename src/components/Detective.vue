<template>
  <v-row style="height:100%" direction="column" justify="center">
    <v-col class="mt-10" cols="12" md="6">
      <v-card>
        <v-card-text>
          <h2 class="display-2 mb-4">{{ player.name }}</h2>
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
        <v-card-actions>
          <v-btn @click="sheet = !sheet" text>{{ t("Role & Board") }}</v-btn>
          <v-btn @click="passTurn" :disabled="disableActions" text>{{
            t("Pass turn")
          }}</v-btn>
          <v-btn
            @click="solve = !solve"
            color="accent"
            :disabled="disableActions"
            text
            >{{ t("Solve") }}</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-col>
    <v-bottom-sheet inset v-model="sheet">
      <v-sheet class="text-center" height="750px"
        style="height:750px; overflow-y:auto;">
        <v-container>
          <v-btn class="mt-6" dark @click="sheet = !sheet">{{
            t("close")
          }}</v-btn>
          <p class="headline mt-4">{{ t("You are") }} {{ playerRole }}</p>
          <murderer-choice
            @choice="this.sheet = false"
            v-if="player.slug === game.murderer"
            :game="game"
            :player="player"
          />
          <accompliance
            @choice="this.sheet = false"
            v-if="game.accompliances && game.accompliances.includes(player.slug)"
            :game="game"
            :player="player"
          />
          <board-view/>
        </v-container>
      </v-sheet>
    </v-bottom-sheet>
    <v-bottom-sheet inset v-model="solve">
      <v-sheet
        class="text-center"
        height="500px"
        style="height:500px; overflow-y:auto;"
      >
        <v-container>
          <v-btn class="mt-6" dark @click="solve = !solve">{{
            t("close")
          }}</v-btn>
          <p class="headline mt-4">{{ t("Solve the crime") }}</p>
          <v-col cols="12">
            <v-card>
              <v-card-text>
                {{ t("Who is the murderer?") }}
                <v-select
                  class="mt-2"
                  :items="players"
                  v-model="guess.player"
                  :label="t('Who is the murderer?')"
                  item-text="name"
                  item-value="index"
                  solo
                ></v-select>
                <v-row v-if="selectedPlayer">
                  <v-col cols="12" md="6">
                    <div class="text-left">
                      {{ t("Select the means of murder:") }}
                      <v-chip-group column>
                        <v-chip
                          small
                          style="opacity: 1"
                          :class="{ 'v-chip--active': guess.mean === mean }"
                          @click="guess.mean = mean"
                          color="blue lighten-4"
                          v-for="(mean, index) in [...game.means].slice(
                            selectedPlayer.index * game.meansNumber,
                            selectedPlayer.index * game.meansNumber + game.meansNumber
                          )"
                          :key="index"
                        >
                          <v-icon class="mr-1" small v-if="guess.mean === mean"
                            >mdi-check</v-icon
                          >
                          {{ mean }}
                        </v-chip>
                      </v-chip-group>
                    </div>
                  </v-col>
                  <v-col cols="12" md="6">
                    <div class="text-left">
                      {{ t("Select the key evidence:") }}
                      <v-chip-group column>
                        <v-chip
                          small
                          style="opacity: 1"
                          :class="{ 'v-chip--active': guess.key === clue }"
                          @click="guess.key = clue"
                          color="red lighten-4"
                          v-for="(clue, index) in [...game.clues].slice(
                            selectedPlayer.index * game.cluesNumber,
                            selectedPlayer.index * game.cluesNumber + game.cluesNumber
                          )"
                          :key="index"
                        >
                          <v-icon class="mr-1" small v-if="guess.key === clue"
                            >mdi-check</v-icon
                          >
                          {{ clue }}
                        </v-chip>
                      </v-chip-group>
                    </div>
                  </v-col>
                </v-row>
                <v-card-text>
                  <v-btn 
                    @click="sendGuess"
                    :disabled="guess.player == null || guess.mean == null || guess.key == null || 
                    !game.means.slice(guess.player*game.meansNumber, guess.player*game.meansNumber+game.meansNumber).includes(guess.mean) || 
                    !game.clues.slice(guess.player*game.cluesNumber, guess.player*game.cluesNumber+game.cluesNumber).includes(guess.key) "
                    >{{ t("Send guess") }}</v-btn>
                </v-card-text>
              </v-card-text>
            </v-card>
          </v-col>
        </v-container>
      </v-sheet>
    </v-bottom-sheet>
  </v-row>
</template>

<script>
import MurdererChoice from "@/components/MurdererChoice";
import Accompliance from "@/components/Accompliance";
import BoardView from "./BoardView.vue";
export default {
  components: { MurdererChoice, Accompliance, BoardView },
  data: () => ({
    sheet: true,
    solve: false,
    guess: {
      player: null,
      mean: null,
      key: null,
    }
  }),
  props: {
    game: {
      type: Object,
      required: true
    },
    player: {
      type: Object,
      required: true
    }
  },
  locales: {
    pt_br: {
      "the murderer": "o assassino",
      "a detective": "um detetive",
      "You are": "Você é",
      close: "fechar",
      Role: "Papel",
      "Pass turn": "Passar",
      Solve: "Solucionar",
      "Solve the crime": "Solucione o crime",
      "Who is the murderer?": "Quem é o assassino?",
      "Select the means of murder:": "Selecione a causa de morte",
      "Select the key evidence:": "Selecione a evidência principal",
      "Send guess": "Mandar palpite"
    }
  },
  computed: {
    disableActions() {
      return (
        (this.game.forensicAnalysis == null || this.game.forensicAnalysis.length < this.game.availableClues) ||
        (this.game.passedTurns && this.game.passedTurns[this.player.index]) ||
        (this.game.guesses && !!this.game.guesses[this.player.index])
      );
    },
    playerRole() {
      if (this.player.slug === this.game.murderer) {
        return this.t("the murderer");
      } else if (this.game.accompliances && this.game.accompliances.includes(this.player.slug)) {
        return "an accompliance";
      } else {
        return this.t("a detective");
      }
    },
    players() {
      return Object.keys(this.game.players)
        .map(item => this.game.players[item])
        .filter(
          item =>
            item.index !== this.game.detective &&
            item.index !== this.player.index
        );
    },
    selectedPlayer() {
      return this.players.find(item => item.index === this.guess.player);
    }
  },
  methods: {
    async passTurn() {
      await this.$store.dispatch("passTurn", {
        game: this.game.gamekey,
        player: this.player
      });
    },
    async sendGuess() {
      await this.$store.dispatch("makeGuess", {
        game: this.game.gamekey,
        player: this.player,
        guess: this.guess
      });
      this.solve = false;
    }
  }
};
</script>

<style lang="scss" scoped></style>
