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
      });
    },
    uploadStarted() {
      Events.$emit("stop-drag");
    }
  },
  data() {
    return {
      reassembling: false,
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
