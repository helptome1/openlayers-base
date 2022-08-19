<template>
  <div id="popup" class="ol-popup">
    <a href="#" id="popup-closer" class="ol-popup-closer"></a>
    <div id="popup-content">
      <table v-if="overlayInfo && overlayInfo.Type === 'pollute'">
        <tr style="white-space: nowrap; text-align: left">
          <td>监管单位：</td>
          <td>{{ overlayInfo.Name }}</td>
        </tr>
        <tr style="white-space: nowrap; text-align: left">
          <td>地块类型：</td>
          <td>{{ overlayInfo.AreaType }}</td>
        </tr>
        <tr style="white-space: nowrap; text-align: left">
          <td>所属行业：</td>
          <td>{{ overlayInfo.Industry }}</td>
        </tr>
      </table>
      <table v-else-if="overlayInfo && overlayInfo.Type === 'company'">
        <tr style="white-space: nowrap; text-align: left">
          <td>监管单位：</td>
          <td>{{ overlayInfo.Name }}</td>
        </tr>
        <tr style="white-space: nowrap; text-align: left">
          <td>企业类型：</td>
          <td>{{ overlayInfo.EnterprisType }}</td>
        </tr>
        <tr style="white-space: nowrap; text-align: left">
          <td>监管状态：</td>
          <td>{{ overlayInfo.Status }}</td>
        </tr>
        <tr style="white-space: nowrap; text-align: left">
          <td>污染源：</td>
          <td>{{ overlayInfo.MainPollutants }}</td>
        </tr>
      </table>
      <div v-else>
        <img class="imgInfo" src="/image/farm.png" alt="" />
      </div>
    </div>
  </div>
</template>

<script>
import { Overlay } from "ol";
export default {
  data() {
    return {
      overlay: null,
    };
  },
  props: {
    overlayInfo: {
      type: Object,
      default: () => {},
    },
    map: {
      type: Object,
      default: () => {},
    },
  },
  methods: {
    init() {
      this.overlay = new Overlay({
        element: document.getElementById("popup"),
        positioning: "center-left",
        offset: [15, 0],
        id: 1,
      });

      this.map.addOverlay(this.overlay);
      this.closerClick(this.overlay);
    },
    closerClick(overlay) {
      const _this = this
      const closer = document.getElementById("popup-closer");
      this.$emit("closerClick", this.overlay);
      closer.onclick = function () {
        _this.$emit("closerClick", this.overlay);
        overlay.setPosition(undefined);
        closer.blur();
        return false;
      };
    },
  },
  mounted() {},
  watch: {
    map(value) {
      this.init();
    },
  },
};
</script>

<style lang="less" scoped>
.ol-popup {
  background-color: black !important;
  opacity: 0.8;
  color: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
  padding: 10px;
  border-radius: 10px;
  bottom: 12px;
  left: -50px;
  min-width: 280px;

  .imgInfo {
    width: 400px;
  }
}

.ol-popup:after,
.ol-popup:before {
  top: 50%;
  border: solid transparent;
  content: " ";
  height: 0;
  width: 0;
  transform: translateY(-50%);
  position: absolute;
  pointer-events: none;
}

// .ol-popup:after {
//   border-top-color: white;
//   border-width: 10px;
//   left: 48px;
//   margin-left: -10px;
// }

.ol-popup:before {
  border-right-color: #cccccc;
  border-width: 11px;
  left: -11px;
  margin-left: -11px;
}

.ol-popup-closer {
  text-decoration: none;
  position: absolute;
  top: 1px;
  right: 6px;
  color: #fff;
}

.ol-popup-closer:after {
  content: "✖";
}
</style>
