import TreeItem from "./tree-item.vue";

// boot up the demo
export default {
  components: { TreeItem },
  data() {
    return {
      treeData: { name: "Uploaded Files:", children: this.files }
    };
  },
  props: { files: Array, alwaysExtended: Boolean },
  watch: {
    files: function(newVal) {
      this.treeData.children = newVal;
    }
  }
};
