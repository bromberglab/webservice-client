import Tree from "../Tree/comp.vue";
import Api from "src/services/api";

export default {
  components: {
    Tree
  },
  props: {
    stepOneData: Object
  },
  data() {
    return {
      stepOne: { tree: null },
      tree: [],
      suffixes: [],
      types: [],
      lines: [],
      checkboxes: [],
      manualName: "",
      nameState: null,
      wrapFiles: true
    };
  },
  methods: {
    addLines(treeItem, i) {
      i = i || 0;
      this.lines.push({
        val: "folder"
      });
      treeItem.forEach(item => {
        if (!item.children) {
          this.lines.push({
            val: "box",
            index: i++
          });
        } else {
          i = this.addLines(item.children, i);
        }
      });
      return i;
    },
    setup(v) {
      if (v.error === "manual") {
        v.error = null;
        return this.$bvModal.show("manual-format-modal");
      }
      this.tree = v.tree;
      this.suffixes = v.suffixes;
      this.checkboxes = [];
      for (let i = 0; i < v.suffixes.length; i++) {
        let row = [];
        for (let j = 0; j < v.suffixes.length; j++) {
          row.push(i == j);
        }
        this.checkboxes.push(row);
      }

      this.lines = [];
      this.addLines(v.tree);

      this.types = [];
      v.suffixes.forEach(v => this.types.push(v));
    },
    removeColumn(index) {
      this.checkboxes.splice(index, 1);
      this.types.splice(index, 1);
    },
    addColumn() {
      this.checkboxes.push(this.checkboxes[0].map(() => false));
      this.types.push("");
    },
    checked(i, j, v) {
      this.checkboxes[i][j] = v;
    },
    changeType(i, t) {
      this.types[i] = t;
    },
    finish(manualFormat) {
      let checkboxes = [];
      for (let j = 0; j < this.suffixes.length; j++) {
        let row = [];
        for (let i = 0; i < this.types.length; i++) {
          if (this.checkboxes[i][j]) {
            row.push(i);
          }
        }
        checkboxes.push(row);
      }

      let payload = {
        manual_format: manualFormat,
        wrap_files: manualFormat && this.wrapFiles,
        checkboxes,
        suffixes: this.suffixes,
        types: this.types
      };
      Api.post("finalize_upload", payload).then(() => {
        window.location.reload();
      });
    },
    checkFormValidity() {
      this.nameState = this.manualName.length > 0;
      return this.nameState;
    },
    resetModal() {
      this.manualName = "";
      this.nameState = null;
    },
    handleOk(bvModalEvt) {
      // Prevent modal from closing
      bvModalEvt.preventDefault();
      // Trigger submit handler
      this.handleSubmit();
    },
    handleSubmit() {
      // Exit when the form isn't valid
      if (!this.checkFormValidity()) {
        return;
      }

      this.finish(this.manualName);
      // Hide the modal manually
      this.$nextTick(() => {
        this.$refs.modal.hide();
      });
    },
    focusModal() {
      document.getElementById("manual-upload-name-input").focus();
    }
  },
  watch: {
    stepOneData(v) {
      if (v) {
        this.stepOne = v;
        this.setup(v);
      }
    }
  }
};
