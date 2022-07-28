<template>
  <div id="map" ref="map"></div>
  <!-- <button @click="leftMove">左移</button> -->
</template>

<script>
import "ol/ol.css";
import {
  Tile as TileLayer,
  Heatmap as HeatmapLayer,
  Vector as VectorLayer,
  Image as ImageLayer,
} from "ol/layer";
// import XYZ from "ol/source/XYZ";
import {
  OSM,
  XYZ,
  Vector as VectorSource,
  TileDebug,
  Cluster,
  ImageWMS,
} from "ol/source";
import { Map as olMap, View, Feature } from "ol";
import { Point, Circle } from "ol/geom";
import { defaults as defaultControls } from "ol/control";
import { fromLonLat, transform } from "ol/proj";
import GeoJSON from "ol/format/GeoJSON";
import {
  Style,
  Text,
  Icon,
  Fill,
  Stroke,
  Image as ImageStyle,
  Circle as CircleStyle,
} from "ol/style";

import TileGrid from "ol/tilegrid/TileGrid";

// 导入axios
import axios from "axios";
// 导入公共模块
import {
  addTdtWmtsLayer,
  addWmtsLayer,
  addOSMLayer,
  addXYZLayer,
  addWMSLayer,
} from "./js/commonApi";

/**
 * 矢量图
 */

export default {
  data() {
    return {
      map: null,
      osmLayer: null,
      pointLayer: null,
      circleLayer: null,
      x: 0,
      y: 0,
      list: [1],
      layers: [],
    };
  },
  methods: {
    /**
     * 初始化地图
     */
    initMap() {
      this.layers = [
        new TileLayer({
          source: new OSM(),
        }),
        // new ImageLayer({
        //   extent: [-13884991, 2870341, -7455066, 6338219],
        //   source: new ImageWMS({
        //     url: "https://ahocevar.com/geoserver/wms",
        //     params: { LAYERS: "topp:states" },
        //     ratio: 1,
        //     serverType: "geoserver",
        //   }),
        // }),
      ];

      // 使用ol.Map来创建地图
      this.map = new olMap({
        // 地图图层
        layers: this.layers,
        // 设置显示地图的视图
        view: new View({
          center: [-10997148, 4569099],
          zoom: 5,
        }),
        target: "map",
      });
      const wmsLayer = addWMSLayer(this.map, 'https://ahocevar.com/geoserver/wms', 'topp:states');
    },
  },
  mounted() {
    this.initMap(); //初始化地图
    // this.getGeoJson()
    // this.addClusterLayerToMap();
  },
};
</script>
<style lang="less" scoped>
#map {
  width: 100%;
  height: 800px;
}
td {
  border: 1px solid black;
}
</style>
