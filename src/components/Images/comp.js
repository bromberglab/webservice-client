import Api from "src/services/api";
import Events from "src/services/events";

export default {
  mounted() {
    Events.$emit("start-loading");
    this.loadImages(() => {
      Events.$emit("stop-loading");
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
        then && then();
      });
    },
    promptImport() {
      this.$bvModal.show("import-image-modal");
    },
    doImport() {
      Events.$emit("start-loading");
      Api.post("import_image", {
        name: this.importName,
        tag: this.importTag || false
      }).then(() => {
        this.loadImages(() => {
          Events.$emit("stop-loading");
        });
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
    }
  },
  data() {
    return {
      images: [],
      importName: null,
      importTag: null
    };
  }
};
