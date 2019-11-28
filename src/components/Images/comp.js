import Api from "src/services/api";
import Events from "src/services/events";
import PulseLoader from "vue-spinner/src/PulseLoader.vue";

export default {
  mounted() {
    Events.$emit("start-loading");
    this.loadImages(() => {
      Events.$emit("stop-loading");
    });
    Events.$on("server-event/image-imported", () => {
      this.loadImages();
    });
  },
  methods: {
    loadImages(then) {
      Api.get("list").then(r => {
        this.images = r.data.map(i => {
          i.short_name = i.name.includes("/")
            ? "…/" + i.name.split("/").splice(-1)[0]
            : i.name;

          i.imported_tag = i.imported_tag || "latest";

          i.sha = i.tags.find(t => t.name == i.imported_tag);
          i.sha = i.sha && i.sha.sha;

          i.inputs_display = i.inputs.map(i =>
            i.includes("|") ? i.split("|")[0] + "|…" : i
          );
          i.inputs_display = i.inputs_display.join(", ");

          i.outputs_display = i.outputs.map(i =>
            i.includes("|") ? i.split("|")[0] + "|…" : i
          );
          i.outputs_display = i.outputs_display.join(", ");

          return i;
        });
        this.imagesLoading = [];
        then && then();
      });
    },
    promptImport() {
      this.$bvModal.show("import-image-modal");
    },
    doImport() {
      const name = this.importName;

      this.imagesLoading.push({ name });

      Api.post("import_image", {
        name,
        tag: this.importTag || false
      });
    },
    updateImage(image) {
      const i = this.images.findIndex(i => i.name == image.name);
      image.updating = true;
      this.$set(this.images, i, image);

      const name = image.name;
      Api.post("update_image", { name });
    },
    promptEdit(image) {
      this.jsonWrite = this.jsonRead = {
        tag: image.imported_tag,
        labels: image.labels,
        env: image.env,
        entrypoint: image.entrypoint,
        cmd: image.cmd
      };
      this.editImage = image;

      this.$bvModal.show("edit-image-modal");
    },
    doEdit() {
      let data = this.jsonWrite;
      ["labels", "env"].forEach(key => {
        Object.keys(this.editImage[key]).forEach(k => {
          if (data[key][k] === undefined) {
            data[key][k] = null;
          }
        });
      });

      Api.post("change_image", {
        name: this.editImage.name,
        data
      });
    },
    originalEdit() {
      Api.post("change_image", {
        name: this.editImage.name,
        data: {}
      });
    },
    deleteImage(image) {
      this.$bvModal.msgBoxConfirm("Are you sure?").then(value => {
        value && this.deleteImageConfirmed(image);
      });
    },
    deleteImageConfirmed(image) {
      Events.$emit("start-loading");
      const name = image.name;
      Api.delete("delete_image", { name }).then(() => {
        this.loadImages(() => {
          Events.$emit("stop-loading");
        });
      });
    },
    jsonChanged(j) {
      this.jsonWrite = j;
    }
  },
  data() {
    return {
      images: [],
      imagesLoading: [],
      importName: null,
      importTag: null,
      jsonRead: {},
      jsonWrite: {},
      editImage: null
    };
  },
  components: {
    "vue-spinner": PulseLoader
  }
};
