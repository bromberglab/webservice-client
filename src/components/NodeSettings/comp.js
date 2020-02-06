import Events from "src/services/events";
const debounce = require("debounce");

// boot up the demo
export default {
  methods: {
    applySettings() {
      if (!this.simpleMode) this.node.node.data = this.jsonEditor;
      else {
        this.node.node.data.image.labels.parameters = this.params;
        this.node.node.data.image.labels.cpu = this.cpu.replace(" ", "");
        this.node.node.data.image.labels.memory = this.memory.replace(" ", "");
        this.node.node.data.image.labels.parallelism =
          "" + this.parallelism / 100.0;
      }
    },
    showModal() {
      this.$bvModal.show("node-settings-modal");
    },
    hideModal() {
      this.$bvModal.hide("node-settings-modal");
    },
    dismiss() {
      if (this.node === null) return;
      this.applySettings();
      this.node = null;
    },
    onError() {
      return;
    },
    jsonEditorChanged(v) {
      this.jsonEditor = v;
    },
    render() {
      this.params = this.node.node.data.image.labels.parameters || "";
      this.cpu = this.node.node.data.image.labels.cpu || "";
      this.memory = this.node.node.data.image.labels.memory || "";
      this.parallelism =
        (this.node.node.data.image.labels.parallelism || 1) * 100.0;
    },
    outputNameChange: debounce(function(v) {
      this.node.node.data.data_name = v;
    }, 100)
  },
  data() {
    return {
      node: null,
      jsonEditor: {},
      jsonRead: {},
      nodeMode: {
        input: false,
        output: false,
        node: true
      },
      nameOptions: [],
      selectedName: null,
      outputName: null,
      selected: ["simple"],
      simpleMode: true
    };
  },
  mounted() {
    Events.$on("open-node-settings", v => {
      if (!v || !v.node.data) return;
      this.jsonEditor = this.jsonRead = v.node.data;
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
    },
    selectedName(v) {
      if (v) {
        this.node.node.data.data_name = v;
      }
    },
    selected(newValue, oldValue) {
      if (newValue.length === 0) {
        this.selected = oldValue;
        return;
      }
      newValue.forEach(v => {
        this.simpleMode = v === "simple";
        if (!oldValue.includes(v)) this.selected = [v];
      });
    }
  }
};
