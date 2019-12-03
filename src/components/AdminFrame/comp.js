import Config from "src/config";

export default {
  methods: {
    changed(p) {
      this.$router.replace({
        path: this.$route.matched[1].path + "/" + p
      });
    }
  },
  mounted() {
    if (this.$route.params.path) this.path = this.$route.params.path;
    else this.path = "";
  },
  data() {
    return {
      path: null,
      prod: Config.prod
    };
  }
};
