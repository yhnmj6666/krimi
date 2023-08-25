export default {
  createRandomId() {
    return Math.random()
      .toString(36)
      .substring(2, 7);
  },

  chooseRandomMurderer(players, detective) {
    const available = players.filter((item, index) => index !== detective);
    const allSlugs = players.map(item => item.slug);
    const randomPlayer =
      available[Math.floor(Math.random() * available.length)].slug;
    return allSlugs.indexOf(randomPlayer);
  },

  identities: {
    detective: "detective",
    murderer: "murderer",
    accompliance: "accompliance",
    host: "host",
  },

  assignRandomIdentities(players, host) {
    var available = players.filter((item, index) => index !== host);
    //shuffle array
    available = shuffle(available);
    
    var availableSlugs = available.map(item => item.slug);
    const murderer = 1;
    const accompliance = Math.floor(available.length/3) - 1;
    var assignedIdentities = availableSlugs.map((slug, index) => {
      if (index < murderer)
        return {slug: slug, identity: this.identities.murderer}
      else if (index < murderer + accompliance) 
        return {slug: slug, identity: this.identities.accompliance}
      else
        return {slug: slug, identity: this.identities.detective}
    });
    assignedIdentities.push({
      slug: players.filter((item, index) => index === host)[0].slug,
      identity: this.identities.host
    });
    return assignedIdentities;
  },

  getRandom(arr, n) {
    const result = new Array(n);
    let len = arr.length;
    const taken = new Array(len);

    if (n > len)
      throw new RangeError("getRandom: more elements taken than available");
    while (n--) {
      var x = Math.floor(Math.random() * len);
      result[n] = arr[x in taken ? taken[x] : x];
      taken[x] = --len in taken ? taken[len] : len;
    }
    return result;
  }
};

function shuffle(array) {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}