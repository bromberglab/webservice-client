import Events from "src/services/events";
const debounce = require("debounce");

// boot up the demo
export default {
  methods: {
    applySettings() {
      this.node.node.data = this.jsonEditor;
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
      this.nodeMode.input = this.node.node.name.startsWith("from_data");
      this.nodeMode.output = this.node.node.name.startsWith("to_data");
      this.nodeMode.node = this.node.node.name.startsWith("node/");
      this.nameOptions = [];
      this.selectedName = null;
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
        node: false
      },
      nameOptions: [],
      selectedName: null,
      outputName: null
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
    }
  }
};
