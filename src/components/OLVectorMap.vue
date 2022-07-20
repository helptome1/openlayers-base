<template>
  <div id="map" ref="map"></div>
  <!-- <button @click="leftMove">左移</button> -->
  <div>
    显示/隐藏：
    <input type="checkbox" checked="checked" @change="checkOsm($event)" />底图
    <input type="checkbox" checked="checked" @change="checkCircle($event)" />圆
    <input type="checkbox" checked="checked" @change="checkPoint($event)" />点
  </div>
  <div>
    图层顺序：
    <input name="seq" type="radio" value="" @change="upOsm($event);" />底图最上
    <input name="seq" type="radio" value="" checked="checked" @change="upCircle($event);" />圆最上
    <input name="seq" type="radio" value="" @change="upPoint($event);" />点最上
  </div>
</template>

<script>
import "ol/ol.css";
import {
  Tile as TileLayer,
  Heatmap as HeatmapLayer,
  Vector as VectorLayer,
} from "ol/layer";
// import XYZ from "ol/source/XYZ";
import { OSM, XYZ, Vector as VectorSource, TileDebug } from "ol/source";
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

import TileGrid from 'ol/tilegrid/TileGrid';


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
              projection: 'EPSG:3857',
              tileGrid: (new OSM()).getTileGrid()
            })
          })
        ],
        // 设置显示地图的视图
        view: new View({
          center: transform(
            [104, 30], 'EPSG:4326', 'EPSG:3857'),
          zoom: 10,
        }),
        target: "map",
      });
    },

  },
  mounted() {
    this.initMap(); //初始化地图
    // this.getGeoJson()
  },
};
</script>
<style lang="less" scoped>
#map {
  width: 100%;
  height: 800px;
}
</style>
