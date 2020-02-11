const debounce = require("debounce");
import Config from "src/config";
import Api from "src/services/api";

const jobCounts = [
  {
    value: "auto",
    text: "Job Count: Auto"
  },
  {
    value: "single",
    text: "Job Count: Single"
  },
  {
    value: "multiple",
    text: "Job Count: Multiple"
  }
];

export default {
  methods: {
    updateName: debounce(function(value) {
      this.uploadName = value;
    }, Config.debounceDefault),
    updateType: debounce(function(value) {
      // deprecated
      this.fileType = value;
    }, Config.debounceDefault),
    updateUpload(isFinished) {
      if (isFinished) return Api.post("finish_upload");
      return Api.post("my_upload", {
        file_type: this.fileType,
        name: this.uploadName
      });
    },
    doExtract(choice) {
      this.finishUpload({
        extract: choice
      });
    },
    handleExtract() {
      this.$bvModal.show("extract-modal");
    },
    finishUpload(payload) {
      if (!this.notStatic) {
        Api.post("finish_upload", { extract_only: true }).then(r => {
          if (r.data.error === "extract") {
            return this.handleExtract();
          }
          return this.$emit("continue", { error: "manual" });
        });
      }
      payload = payload || {};
      Api.post("finish_upload", payload).then(r => {
        if (r.data.error === "extract") {
          return this.handleExtract();
        }

        this.$emit("continue", r.data);
      });
    }
  },
  data() {
    return {
      files: [
        {
          name: "loading …"
        }
      ],
      fileType: null,
      uploadName: null,
      jobCounts,
      notStatic: true,
      selectedJobCount: null
    };
  },
  props: {
    upload: Object,
    ready: Boolean
  },
  watch: {
    fileType(newVal, oldVal) {
      if (oldVal !== null && oldVal !== newVal) this.updateUpload();
    },
    uploadName(newVal, oldVal) {
      if (oldVal !== null && oldVal !== newVal) this.updateUpload();
    },
    selectedJobCount(newVal, oldVal) {
      if (oldVal !== null && oldVal.value !== newVal.value) this.updateUpload();
    },
    upload(val) {
      if (val === null) return;
      this.fileType = val.file_type;
      this.uploadName = val.display_name;
    }
  }
};
