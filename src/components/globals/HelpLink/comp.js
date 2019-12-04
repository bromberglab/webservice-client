export default {
  methods: {
    click() {
      var win = window.open("#/docs/" + this.path, "_blank");
      win.focus();
    },
    setPath(p) {
      p = p.replace("#", ":");
      let main = p.split(":")[0];
      if (!main.endsWith("/")) {
        main += "/";
      }
      if (main.startsWith("/")) {
        main = main.slice(1);
      }
      if (!p.includes(":")) {
        return (this.path = main);
      }
      let sub = p.split(":")[1];
      if (sub.endsWith("/")) {
        sub = sub.slice(0, -1);
      }
      return (this.path = `${main}:${sub}`);
    }
  },
  data() {
    return {
      path: ""
    };
  },
  mounted() {
    this.setPath(this.page);
  },
  watch: {
    page(v) {
      this.setPath(v);
    }
  },
  props: ["page", "sm", "pad"]
};
