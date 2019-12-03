import Api from "src/services/api";
import Uploader from "../Uploader/comp.vue";
import Tree from "../Tree/comp.vue";
import UploadInputLine from "../UploadInputLine/comp.vue";
import Events from "src/services/events";

export default {
  components: {
    Uploader,
    Tree,
    UploadInputLine
  },
  mounted() {
    Events.$on("server-event/reassembled", d => {
      if (d.uuid == this.uploadId) {
        this.getTree();
      }
    });
    Events.$on("server-event/extracted", d => {
      if (d.uuid == this.uploadId) {
        this.getTree();
      }
    });
    Events.$emit("start-loading");
    Api.get("my_upload").then(response => {
      this.uploadId = response.data.uuid;
      this.upload = response.data;
      this.getTree();
      Events.$emit("stop-loading");
    });
  },
  methods: {
    getTree() {
      Api.get("upload_tree").then(response => (this.files = response.data));
      Api.get("my_upload").then(response => {
        this.reassembling = response.data.reassembling;
        this.extracting = response.data.extracting;
      });
    },
    uploadStarted() {
      Events.$emit("stop-drag");
    },
    continueUpload($event) {
      if ($event.error === "extracting") {
        this.extracting = true;
        return;
      }

      // refresh the tree because hidden files were removed.
      Api.get("upload_tree").then(r => {
        $event.single_folder =
          r.data.length == 1 && r.data[0].children && r.data[0].children.length;
        this.$emit("next-step", $event);
      });
    }
  },
  data() {
    return {
      reassembling: false,
      extracting: false,
      upload: null,
      uploadId: "loading …",
      files: [
        {
          name: "loading …"
        }
      ]
    };
  }
};
