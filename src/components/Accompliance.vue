<template>
  <v-row style="height:100%" align="center" justify="center">
    <v-col
      cols="12"
      lg="6"
      style="margin-top:auto;"
      :style="[!game.murdererChoice && 'margin-bottom:auto']"
    >
      <div class="display-1" v-if="game.murdererChoice">
        {{ murderer.name }} {{ t("used") }}
        <span class="blue--text"
          >&nbsp;&nbsp;{{ game.murdererChoice.mean }}</span
        >
        {{ t("to kill, and left behind") }}
        <span class="red--text">&nbsp;&nbsp;{{ game.murdererChoice.key }}</span>
        {{ t("as a key evidence.") }}
      </div>
      <v-card v-else>
        <v-card-title style="word-break: inherit"
          >{{ murderer.name }}
          {{
            t("is the murderer. Wait for means of murder and key evidence.")
          }}</v-card-title
        >
      </v-card>
      <v-progress-linear
        v-if="!game.murdererChoice"
        indeterminate
        absolute
        bottom
        rounded
        color="accent"
      ></v-progress-linear>
    </v-col>
  </v-row>
</template>

<script>
export default {
  data: () => ({
  }),
  locales: {
    pt_br: {
      "is the murderer. Wait for means of murder and key evidence.":
        "cometeu o crime. Aguarde a causa e evidência principal.",
      used: "usou",
      "to kill, and left behind": "para matar, e deixou pra trás",
      "as a key evidence.": "como evidência principal.",
    }
  },
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
  computed: {
    murderer() {
      const key = Object.keys(this.game.players).find(
        item => this.game.players[item].slug === this.game.murderer
      );
      return this.game.players[key];
    }
  }
};
</script>

<style lang="scss" scoped></style>