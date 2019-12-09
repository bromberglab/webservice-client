<template>
  <div class="host" v-if="node" :class="{ output: !isInput }">
    <b-dropdown :disabled="!connected" :text="selectedType" variant="light">
      <b-dropdown-item
        v-for="type in typeOptions"
        :value="type"
        :key="type"
        @click="selectType(type)"
      >
        {{ type }}
      </b-dropdown-item>
    </b-dropdown>
    <b-dropdown
      v-if="connected && typeSelection && isInput"
      :disabled="!connected"
      :text="selectedName"
      variant="light"
      class="name"
    >
      <b-dropdown-item
        v-for="name in nameOptions"
        :value="name"
        :key="name"
        @click="selectName(name)"
      >
        {{ name }}
      </b-dropdown-item>
    </b-dropdown>

    <b-input
      v-if="connected && typeSelection && !isInput"
      :value="selectedName"
      placeholder="Dataset name"
      class="name"
      @input="nameChange"
      @pointermove.stop=""
    ></b-input>
  </div>
</template>

<script>
import Types from "src/services/types";
import Api from "src/services/api";

const debounce = require("debounce");

export default {
  props: ["node"],
  data() {
    return {
      connected: false,
      typeOptions: [],
      nameOptions: [],
      typeSelection: null,
      nameSelection: null,
      editor: null
    };
  },
  watch: {
    node(v) {
      if (!v) return;
      v.dropdown = this;
      v.data.type && this.selectType(v.data.type);
      (v.data.data_name && this.selectName(v.data.data_name)) ||
        this.randomName();
    }
  },
  methods: {
    updateList(fileTypes, type, e) {
      this.editor = e;
      this.typeOptions = fileTypes.filter(t => Types.areCompatible(t, type));
      this.connected = true;
      if (this.typeOptions.length == 1) {
        this.selectType(this.typeOptions[0]);
      }
      if (this.isInput && !this.typeOptions.includes(this.typeSelection)) {
        this.typeSelection = null;
      }
      this.rerender();
    },
    clearList() {
      this.connected = false;
      this.rerender();
    },
    selectName(name) {
      this.nameSelection = name;
      this.node.data.data_name = name;
      return 1;
    },
    randomName() {
      if (this.isInput) return;
      Api.get("random_name").then(r => {
        this.selectName(r.data);
      });
    },
    selectType(type) {
      if (this.typeSelection == type) return;

      this.typeSelection = type;
      this.node.data.type = type;

      Api.get("names_for_type", { type }).then(r => {
        this.nameOptions = r.data;
        const name = this.node.data.data_name;

        if (!this.isInput || r.data.find(v => v == name)) {
          this.selectName(name);
        } else {
          this.nameSelection = null;
        }
        this.rerender();
      });
    },
    rerender() {
      let node = this.node;
      setTimeout(() => {
        this.editor && this.editor.view.updateConnections({ node });
      }, 0);
    },
    nameChange: debounce(function(v) {
      this.selectName(v);
    }, 50)
  },
  computed: {
    selectedType() {
      if (!this.connected) return "Please connect";
      if (!this.typeSelection) return "Select type …";
      if (!this.typeOptions.length) return "Not available";

      return this.typeSelection;
    },
    selectedName() {
      if (this.isInput) {
        if (!this.connected) return "Please connect";
        if (!this.nameSelection) return "Select Dataset …";
        if (this.isInput && !this.nameOptions.length) return "Not available";
      }

      return this.nameSelection;
    },
    isInput() {
      return this.node.name.startsWith("from");
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
$width: 160px;
.host {
  display: inline-block;
  margin: 0 1em;
  ::v-deep * {
    color: #495057 !important;
  }
  .dropdown {
    min-width: $width;
    ::v-deep * {
      text-align: right;
    }
    display: flex;
  }
  .name {
    margin: 5px 0 0;
  }
  &.output {
    ::v-deep * {
      text-align: left;
    }
  }
  input {
    width: $width;
  }
}
</style>
