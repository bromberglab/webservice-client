import Events from "src/services/events";
import Api from "src/services/api";

// boot up the demo
export default {
  methods: {
    showModal() {
      this.$bvModal.show("node-info-modal");
    },
    hideModal() {
      this.$bvModal.hide("node-info-modal");
    },
    dismiss() {
      if (this.node === null) return;
      this.node = null;
    },
    loadLogs() {
      Api.get("job/logs", {
        name: this.node.node.id
      }).then(r => {
        this.logs = r.data.replace(/^[\n\s]+/, "").replace(/[\n\s]+$/, "");
        setTimeout(() => {
          this.$root.$emit("bv::toggle::collapse", "collapse-logs");
        }, 0);
      });
    },
    render() {
      Api.get("job", {
        name: this.node.node.id
      }).then(r => (this.meta = r.data));
    }
  },
  data() {
    return {
      node: null,
      logs: "loading …",
      uri: Api.uri,
      meta: {}
    };
  },
  mounted() {
    Events.$on("open-node-info", v => {
      if (!v || !v.node.data) return;
      this.node = v;
    });
  },
  watch: {
    node(v) {
      if (v !== null) {
        this.render();
        this.showModal();
      } else {
        this.hideModal();
      }
    }
  },
  filters: {
    time: function(value) {
      if (value !== 0 && !value) return "";
      value = ~~value;
      let hours = Math.floor(value / 3600).pad(2);
      value %= 3600;
      let minutes = Math.floor(value / 60).pad(2);
      let seconds = (value % 60).pad(2);

      return `${hours}:${minutes}:${seconds}`;
    }
  }
};
