<template>
  <div id="map" ref="map"></div>
  <button @click="leftMove">左移</button>
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
          // center: fromLonLat([104.065735, 35.659462]), // 定义地图显示中心于经度0度，纬度0度处
          center: [104.06, 30.67],
          zoom: 4.5, // 并且定义地图显示层级为2
          // 指定投影使用EPSG:4326
          projection: "EPSG:4326",
          // minZoom: 4.5,
          // maxZoom: 19,
        }),
        target: "map",
      });
    },
    leftMove() {
      const view = this.map.getView();
      const center = view.getCenter();
      console.log(center);
      center[0] -= 50000;
      view.setCenter(center);
      this.map.render();
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