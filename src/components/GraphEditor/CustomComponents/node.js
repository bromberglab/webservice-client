import mixin from "rete-vue-render-plugin/src/mixin";
import Socket from "./socket.vue";
import DatasetDropdown from "./dataset-dropdown.vue";
import Events from "src/services/events";
import Api from "src/services/api";

export default {
  mixins: [mixin],
  components: {
    Socket,
    DatasetDropdown
  },
  methods: {
    openSettings() {
      Events.$emit("open-node-settings", this);
    },
    download() {
      let type = this.node.data.type;
      Api.post("create_download", {
        name: this.node.data.data_name,
        type: type
      }).then(r => {
        window.location.href = r.data.url;
      });
    }
  },
  mounted() {
    if (!this.isDocked) {
      Events.$on("server-event/status-change", d => {
        // important: == not ===
        if (d.type == "job" && d.uuid == this.node.id) {
          this.running = !d.finished && d.scheduled; // 'scheduled' on the server means 'running' in vue.
          this.scheduled = !d.scheduled; // 'scheduled' in vue means not yet 'running', so not 'scheduled' on server.
          this.finished = d.finished;
          this.success = d.status = "succeeded";
        }
      });
      Events.$on("run-all", () => {
        this.scheduled = true;
      });
      if (this.isDataset) {
        this.dataNode = this.node;
      }
    } else {
      if (this.node.name.startsWith("from_data")) {
        Events.$on("node-filter/inputs", v => {
          this.buttonFilteredOut = !v;
        });
      }
      if (this.node.name.startsWith("to_data")) {
        Events.$on("node-filter/outputs", v => {
          this.buttonFilteredOut = !v;
        });
      }
      if (this.node.name.startsWith("node/")) {
        Events.$on("node-filter/nodes", v => {
          this.buttonFilteredOut = !v;
        });
      }
      Events.$on("node-filter/text", v => {
        this.textFilteredOut = false;
        if (this.node.name.includes(v)) return;
        try {
          this.node.inputs.forEach(i => {
            if (i.socket.name.includes(v)) throw "break";
          });
        } catch (err) {
          return;
        }

        this.textFilteredOut = true;
      });
    }
  },
  data() {
    return {
      running: false,
      scheduled: false,
      finished: false,
      success: false,
      buttonFilteredOut: false,
      textFilteredOut: false,
      dataNode: null
    };
  },
  computed: {
    isDataset() {
      return this.node.isDataNode || false;
    },
    isDocked() {
      return Array(this.$el.parentElement.classList).find(v => v == "dock-item")
        ? true
        : false;
    },
    tier() {
      if (this.isDataset) return 2;
      return this.node.data.image.labels.tier || 1;
    }
  }
};
