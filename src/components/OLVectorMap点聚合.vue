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
} from "ol/layer";
// import XYZ from "ol/source/XYZ";
import {
  OSM,
  XYZ,
  Vector as VectorSource,
  TileDebug,
  Cluster,
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
          new TileLayer({ source: new OSM() }),
          // 添加一个显示Open Street Map地图瓦片网格的图层
          new TileLayer({
            source: new TileDebug({
              projection: "EPSG:3857",
              tileGrid: new OSM().getTileGrid(),
            }),
          }),
        ],
        // 设置显示地图的视图
        view: new View({
          center: transform([104, 30], "EPSG:4326", "EPSG:3857"),
          zoom: 5,
        }),
        target: "map",
      });
    },
    /** 添加随机点坐标到地图并实现聚合效果 */
    addClusterLayerToMap() {
      let coord = undefined;
      let coords = [];
      for (let i = 0; i < 500; i++) {
        // 随机生成五百个点并添加至地图
        coord = [104.3 + Math.random() * 0.5, 30.06 + Math.random() * 0.5];
        var feature = new Feature({
          geometry: new Point(fromLonLat(coord)),
        });
        coords.push(feature);
      }
      const clusterSource = new Cluster({
        distance: 20, // 要素将被聚合在一起的像素距离，默认为20
        minDistance: 200, // 聚合块之间的最小像素距离，默认为零
        source: new VectorSource({
          features: coords,
        }),
      });
      const clusters = new VectorLayer({
        source: clusterSource,
        name: "clusterLayer",
        zIndex: 1,
        // 设置描边样式, 如果feature上有样式，则使用feature上的样式。
        style: new Style({
          image: new CircleStyle({
            radius: 10,
            // fill: new Fill({
            //   color: "red",
            // }),
            stroke: new Stroke({
              color: "red",
              size: 50,
            }),
          }),
        }),
      });
      this.map.addLayer(clusters); // 将可聚合的点图层添加至地图
    },
  },
  mounted() {
    this.initMap(); //初始化地图
    // this.getGeoJson()
    this.addClusterLayerToMap();
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
