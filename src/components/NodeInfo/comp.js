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
    }
  },
  data() {
    return {
      node: null
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
