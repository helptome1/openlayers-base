<template>
  <div class="menu-list">
    <el-tabs v-model="TabActiveName" :stretch="true" class="demo-tabs">
      <el-tab-pane label="农用地块" name="first">
        <el-scrollbar height="400px">
          <span
            v-for="(item, index) in farmAreaList"
            :key="item"
            class="scrollbar-demo-item"
            :title="item.properties.name"
            :class="{
              'scrollbar-demo-item-active': index == activitySelectFarmIndex,
            }"
            @click="gotoCity(item, index)"
          >
            <img class="farm-icon" :src="useImg(item)" alt="" />
            {{ item.properties.name }}
          </span>
        </el-scrollbar>
      </el-tab-pane>
      <el-tab-pane label="污染地块" name="second">
        <el-scrollbar height="400px">
          <p
            v-for="(item, index) in polluteList"
            :key="item"
            class="scrollbar-demo-item"
            :title="item.properties.name"
            :class="{
              'scrollbar-demo-item-active': index == activitySelectPolluteIndex,
            }"
            @click="gotoCity(item, index)"
          >
            {{ item.properties.name }}
          </p>
        </el-scrollbar>
      </el-tab-pane>
      <el-tab-pane label="监管单位" name="third">
        <el-scrollbar height="400px">
          <p
            v-for="(item, index) in superviseList"
            :key="item"
            class="scrollbar-demo-item"
            :title="item.properties.name"
            :class="{
              'scrollbar-demo-item-active': index == activitySelectCompanyIndex,
            }"
            @click="gotoCity(item, index)"
          >
            {{ item.properties.name }}
          </p>
        </el-scrollbar>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import polluteImg from "/image/pollute1.png";
import farmImg from "/image/farm-use1.png";
import farmControlImg from "/image/farm-control1.png";
import farmSafeImg from "/image/farm-safe.png";
import watchImg from "/image/watch1.png";

export default {
  data() {
    return {
      TabActiveName: "first",
    };
  },
  props: {
    farmAreaList: {
      type: Array,
      default: [],
    },
    polluteList: {
      type: Array,
      default: [],
    },
    superviseList: {
      type: Array,
      default: [],
    },
    activitySelectFarmIndex: Number,
    activitySelectPolluteIndex: Number,
    activitySelectCompanyIndex: Number,
  },
  methods: {
    gotoCity(item, index) {
      this.$emit("gotoCity", item, index);
    },
    useImg(item) {
      const level = item.properties.level;
      if (level === "1") return farmControlImg;
      if (level === "2") return farmSafeImg;
      if (level === "3") return farmImg;
    },
  },
};
</script>

<style></style>
