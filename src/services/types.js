export default {
  matchesRule(str, rule) {
    var escapeRegex = str => str.replace(/([.*+?^=!:${}()|[\]/\\])/g, "\\$1");
    return new RegExp(
      "^" +
        rule
          .split("*")
          .map(escapeRegex)
          .join(".*") +
        "$"
    ).test(str);
  },
  areCompatible(str1, str2) {
    try {
      str1.split("|").forEach(s1 => {
        str2.split("|").forEach(s2 => {
          if (s1 === "*" || s2 === "*") throw "break";
          if (s1.includes("*") && s2.includes("*")) return; // continue, cant match
          if (s1.includes("*") && this.matchesRule(s2, s1)) throw "break";
          if (this.matchesRule(s1, s2)) throw "break";
        });
      });
    } catch (err) {
      return true;
    }

    return false;
  }
};
