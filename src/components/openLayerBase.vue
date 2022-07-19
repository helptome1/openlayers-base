<template>
  <div id="map" ref="map"></div>
</template>

<script>
import "ol/ol.css";
import VectorSource from "ol/source/Vector";
import { Tile as TileLayer, Heatmap as HeatmapLayer } from "ol/layer";
import XYZ from "ol/source/XYZ";
import { OSM } from "ol/source";
import { Map as olMap, View, Feature } from "ol";
import { Point } from "ol/geom";
import { defaults as defaultControls } from "ol/control";
import { fromLonLat } from "ol/proj";
// import ol from "ol";

export default {
  data() {
    return {
      map: null,
    };
  },
  methods: {
    /**
     * 初始化地图
     */
    initMap() {
      // 使用ol.Map来创建地图
      this.map = new olMap({
        // 地图图层
        layers: [
          // 创建一个使用Open Street Map地图源的瓦片图层
          new TileLayer({ source: new OSM({}) }),
        ],
        // 设置显示地图的视图
        view: new View({
          center: [0, 0], // 定义地图显示中心于经度0度，纬度0度处
          zoom: 2, // 并且定义地图显示层级为2
        }),
        target: "map",
      });
    },
  },
  mounted() {
    this.initMap(); //初始化地图
  },
};
</script>
<style lang="less" scoped>
#map {
  width: 100%;
  height: 800px;
}
</style>