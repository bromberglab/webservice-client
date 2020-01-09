import mixin from "rete-vue-render-plugin/src/mixin";
import Socket from "./socket.vue";
import DatasetDropdown from "./dataset-dropdown.vue";
import Events from "src/services/events";
import Api from "src/services/api";
import Sockets from "src/services/sockets";

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
    openInfo() {
      if (this.isDataset) return;
      Events.$emit("open-node-info", this);
    },
    download() {
      let type = this.node.data.type;
      Api.post("create_download", {
        name: this.node.data.data_name,
        type: type
      }).then(r => {
        window.location.href = r.data.url;
      });
    },
    inputsPlus() {
      let i = this.inputs();
      if (this.canAddInput) {
        i.push({
          isAdd: true,
          socket: { name: this.node.data.image.add_input }
        });
      }
      return i;
    },
    addInput() {
      Sockets.addInput(
        this.inputsPlus().length,
        this.node.data.image.add_input,
        this.node
      );
      this.node.data.addInputs++;
      this.$forceUpdate();
    },
    outputsPlus() {
      let o = this.outputs();
      if (this.canAddOutput) {
        o.push({
          isAdd: true,
          socket: { name: this.node.data.image.add_output }
        });
      }
      return o;
    },
    addOutput() {
      Sockets.addOutput(
        this.outputsPlus().length,
        this.node.data.image.add_output,
        this.node
      );
      this.node.data.addOutputs++;
      this.$forceUpdate();
    },
    monitorProgress() {
      if (this.finished) {
        this.progress = 100;
      } else if (!this.running) {
        this.progress = 0;
      } else {
        Api.get("job", { name: this.node.id }).then(j => {
          if (j.data.parallel_runs > 0) {
            this.progress = ~~(
              (100 * j.data.finished_runs) /
              j.data.parallel_runs
            );
          }
        });
        setTimeout(() => {
          this.monitorProgress();
        }, 5000);
      }
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
          if (this.node.name.startsWith("node/")) {
            this.success = d.status == "succeeded";
          } else {
            this.success = true;
          }

          this.monitorProgress();
        }
      });
      Events.$on("run-all", () => {
        this.scheduled = true;
      });
      if (this.isDataset) {
        this.dataNode = this.node;
      }
      this.monitorProgress();
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
      dataNode: null,
      progress: 0
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
    },
    canAddInput() {
      if (this.isDataset) return false;
      return this.node.data.image.add_input || false;
    },
    canAddOutput() {
      if (this.isDataset) return false;
      return this.node.data.image.add_output || false;
    }
  }
};
