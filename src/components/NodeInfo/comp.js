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
    }
  },
  data() {
    return {
      node: null,
      logs: "loading …",
      uri: Api.uri
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
        this.showModal();
      } else {
        this.hideModal();
      }
    }
  }
};
