import Rete from "rete";
import ConnectionPlugin from "rete-connection-plugin";
import VueRenderPlugin from "rete-vue-render-plugin";
import { Mutex } from "async-mutex";
import DockPlugin from "rete-dock-plugin";
import CustomNodeComponent from "./CustomComponents/node.vue";
import NodeSettings from "../NodeSettings/comp.vue";
import Api from "src/services/api";
import Config from "src/config";
import Notifications from "src/services/notifications";
import Types from "src/services/types";
import Store from "src/services/store";
import Events from "src/services/events";
import Auth from "src/services/auth";
import ContextMenuPlugin from "rete-context-menu-plugin";
import AutoArrangePlugin from "rete-auto-arrange-plugin";
import AreaPlugin from "rete-area-plugin";
import ReadonlyPlugin from "rete-readonly-plugin";

const debounce = require("debounce");
const mutex = new Mutex();

class CustomSocket extends Rete.Socket {
  constructor(name, isDataSocket) {
    super(name);
    this.isDataSocket = isDataSocket || false;
  }
  compatibleWith(otherSocket) {
    if (this.isDataSocket && otherSocket.isDataSocket) {
      return false;
    }
    if (this.isDataSocket || otherSocket.isDataSocket) {
      return true;
    }

    let str1 = this.name,
      str2 = otherSocket.name;

    return Types.areCompatible(str1, str2);
  }
}

export default {
  props: {
    workflow: Object
  },
  data() {
    return {
      meta: {},
      saveName: "My Workflow",
      editor: null,
      filterText: "",
      classes: Array(),
      sockets: {},
      engine: null,
      buttons: [
        { caption: "Inputs", state: true },
        { caption: "Outputs", state: true },
        { caption: "Nodes", state: true }
      ],
      fileTypes: []
    };
  },
  watch: {
    filterText: debounce(function(v) {
      Events.$emit("node-filter/text", v);
      if (v == "matrixmode") {
        Events.$emit("enable-overlay");
        setTimeout(() => {
          this.filterText = "";
        }, 1000);
      }
    }, 200),
    workflow(v) {
      this.applyWorkflow(v);
    }
  },
  methods: {
    filterButtonClicked() {
      Events.$emit("node-filter/inputs", this.buttons[0].state);
      Events.$emit("node-filter/outputs", this.buttons[1].state);
      Events.$emit("node-filter/nodes", this.buttons[2].state);
    },
    saveFlow() {
      this.arrange();
      setTimeout(() => {
        let data = this.editor.toJSON();
        data.id = Config.reteVersion;
        Api.post("workflow_storage", {
          name: this.saveName,
          data
        });
      }, 0);
    },
    runFlow() {
      let data = this.editor.toJSON();
      Api.post("workflow_run", {
        name: this.saveName,
        data
      }).then(r => {
        this.$router.push("/workflows/" + r.data);
      });
    },
    loadFlow() {
      Api.get("workflow_storage", {
        name: this.saveName
      }).then(r => {
        this.applyWorkflow(r.data);
      });
    },
    updateMeta() {
      if (!this.workflow || !this.workflow.name) return;
      Api.get(`workflows/${this.workflow.name}`).then(r => {
        this.meta = r.data;
      });
    },
    applyWorkflow(data) {
      this.updateMeta();
      data = Api.legacySupport(data);

      this.editor.fromJSON(data);
      setTimeout(() => {
        this.arrange();
        if (this.workflow) {
          this.editor.trigger("readonly", true);
          Events.$emit("run-all");
          this.loadJobs();
        }
      }, 0);
    },
    loadJobs() {
      this.editor.nodes.forEach(node => {
        Api.get("job", { name: node.id }).then(j => {
          j.data.type = "job";
          Events.$emit("server-event/status-change", j.data);
        });
      });
    },
    fetchTypes() {
      Api.get("file_types").then(r => {
        this.fileTypes = r.data.map(v => v.name);
        this.createDataNodes();
        this.fetchImages();
      });
    },
    updateDataNode(node) {
      let inOutputs;
      if (node.outputs["o/1"]) {
        inOutputs = node.outputs["o/1"].connections;
      } else {
        inOutputs = node.inputs["i/1"].connections;
      }

      node = this.editor.nodes.filter(n => n.id == node.id)[0];
      node.connected = inOutputs.length || false;
      if (node.connected) {
        let connection = inOutputs[0];
        let other = this.editor.nodes.filter(n => n.id == connection.node)[0];

        let socket = connection.input || connection.output;
        socket = other.inputs.get(socket) || other.outputs.get(socket);

        node.dropdown.updateList(this.fileTypes, socket.name, this.editor);
      } else {
        node.dropdown.clearList();
      }
    },
    createDataNodes() {
      let updateDataNode = this.updateDataNode;
      let inputSocket = new CustomSocket("input", true);
      let outputSocket = new CustomSocket("output", true);
      this.classes.push(
        class extends Rete.Component {
          constructor() {
            super("from_data");
          }

          builder(node) {
            let out = new Rete.Output("o/1", "-", inputSocket);

            node.addOutput(out);
            node.data.type = node.data.type || null;
            node.data.displayName = "Input";
            node.data.data_name = node.data.data_name || null;
            node.isDataNode = true;
          }

          worker(node) {
            updateDataNode(node);
          }
        }
      );
      this.classes.push(
        class extends Rete.Component {
          constructor() {
            super("to_data");
          }

          builder(node) {
            let inp = new Rete.Input("i/" + 1, "-", outputSocket);

            node.addInput(inp);
            node.data.type = node.data.type || null;
            node.data.displayName = "Output";
            node.data.data_name = node.data.data_name || null;
            node.isDataNode = true;
          }

          worker(node) {
            updateDataNode(node);
          }
        }
      );
    },
    fetchImages() {
      let sockets = this.sockets;
      Api.get("list").then(r => {
        r.data.forEach(image => {
          this.classes.push(
            class extends Rete.Component {
              constructor() {
                super("node/" + image.name);
              }

              builder(node) {
                node.data.image = node.data.image || image;

                let j = 0;
                image.inputs.forEach(v => {
                  sockets[v] = sockets[v] || new CustomSocket(v);
                  node.addInput(new Rete.Input("i/" + ++j, v, sockets[v]));
                });
                j = 0;
                image.outputs.forEach(v => {
                  sockets[v] = sockets[v] || new CustomSocket(v);
                  node.addOutput(new Rete.Output("o/" + ++j, v, sockets[v]));
                });

                node.data.displayName = image.name.split("/").slice(-1)[0];
              }

              worker() {
                return;
              }
            }
          );
        });
        this.classes.forEach(SomeClass => {
          const numComponent = new SomeClass();
          this.engine.register(numComponent);
          this.editor.register(numComponent);
        });
        Events.$emit("stop-loading");

        this.restoreState();
      });
    },
    arrange() {
      let withConnections = [];
      this.editor.nodes.forEach(n => {
        n.inputs.forEach(c => {
          c.connections.forEach(() => {
            withConnections.push(n);
          });
        });
      });

      withConnections.forEach(node => this.editor.trigger("arrange", { node }));
      AreaPlugin.zoomAt(this.editor);
    },
    storeState() {
      Store.graphNodes = this.editor.toJSON();
      Store.graphSave = this.saveName;
      Store.graphFilter = this.filterText;
      Store.graphButtons = this.buttons;
    },
    restoreState() {
      if (this.workflow) return this.applyWorkflow(this.workflow);
      if (Store.graphNodes) this.editor.fromJSON(Store.graphNodes);
      if (Store.graphSave) this.saveName = Store.graphSave;
      if (Store.graphFilter) this.filterText = Store.graphFilter;
      if (Store.graphButtons) this.buttons = Store.graphButtons;

      setTimeout(() => {
        this.filterButtonClicked();
      }, 0);
    }
  },
  mounted() {
    if (!Auth.authenticated) return this.$router.push("docs");
    Events.$emit("start-loading");
    this.editor = new Rete.NodeEditor(
      Config.reteId,
      document.querySelector(".rete-editor .node-editor")
    );
    this.engine = new Rete.Engine(Config.reteId);

    const renderOptions = {
      component: CustomNodeComponent
    };
    this.editor.use(ConnectionPlugin);
    this.editor.use(VueRenderPlugin, renderOptions);
    this.editor.use(DockPlugin, {
      container: document.querySelector(".rete-editor .dock"),
      plugins: [[VueRenderPlugin, renderOptions]]
    });
    this.editor.use(ContextMenuPlugin, {
      allocate() {
        return null;
      },
      searchBar: false, // true by default
      delay: 200,
      items: {},
      nodeItems: {
        Delete: true, // Enable delete
        Clone: false // Disable clone
      }
    });

    this.editor.use(AutoArrangePlugin, { margin: { x: 50, y: 50 }, depth: 0 }); // depth - max depth for arrange (0 - unlimited)
    this.editor.use(ReadonlyPlugin, { enabled: false });

    this.fetchTypes();

    this.editor.on(
      "process nodecreated noderemoved connectioncreated connectionremoved",
      async () => {
        mutex.runExclusive(async () => {
          await this.engine.abort();
          await this.engine.process(this.editor.toJSON());
        });
      }
    );
    this.editor.on("warn", e => {
      Notifications.warn("Workflow Editor:", e.message);
    });
    Events.$on("server-event/workflow-finished", r => {
      if (this.workflow && r.name == this.workflow.name) this.updateMeta();
    });
  },
  beforeDestroy() {
    if (!this.workflow) this.storeState();
  },
  components: {
    NodeSettings
  }
};
