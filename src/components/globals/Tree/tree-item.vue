<template>
  <!-- item template -->
  <div type="text/x-template" id="item-template">
    <li>
      <div :class="{ bold: isFolder }" @click="toggle">
        {{ item.name }}
        <span v-if="isFolder && !alwaysExtended"
          >[{{ isOpen ? "-" : "+" }}]</span
        >
        <span v-if="isEmptyFolder">(empty)</span>
      </div>
      <ul v-show="isOpen || alwaysExtended" v-if="isFolder">
        <tree-item
          class="item"
          v-for="(child, i) in item.children"
          :key="i"
          :item="child"
          :always-extended="alwaysExtended"
        ></tree-item>
      </ul>
    </li>
  </div>
</template>

<script>
export default {
  name: "tree-item",
  template: "#item-template",
  props: {
    item: Object,
    alwaysExtended: Boolean
  },
  data: () => {
    return {
      isOpen: false
    };
  },
  computed: {
    isFolder() {
      return this.item.children && this.item.children.length;
    },
    isEmptyFolder() {
      return this.item.children && this.item.children.length === 0;
    }
  },
  methods: {
    toggle() {
      if (this.isFolder) {
        this.isOpen = !this.isOpen;
      }
    }
  }
};
</script>
