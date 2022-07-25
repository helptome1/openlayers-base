<template>
  <div id="map" ref="map"></div>
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
  Image,
  ImageStatic,
  TileImage,
  WMTS,
  TileArcGISRest,
} from "ol/source";
import { Map as olMap, View, Feature, Overlay } from "ol";
import { Point, Circle } from "ol/geom";
import { defaults as defaultControls } from "ol/control";
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
//
import * as olCoordinate from "ol/coordinate";
// 选中图层交互
import { Select as InteractionSelect } from "ol/interaction";
import Attribution from "ol/control/Attribution";

/**
 * 加载WMTS所需
 */
import { get as getProjection, fromLonLat, transform } from "ol/proj";
import { getTopLeft, getWidth } from "ol/extent";
import WMTSTileGrid from "ol/tilegrid/WMTS";

// 导入axios
import axios from "axios";

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
      overlay: null,
    };
  },
  methods: {
    /**
     * 初始化地图
     */
    initMap() {
      //通过范围计算得到分辨率数组
      var projection = getProjection("EPSG:3857");
      // 获取此投影的有效范围。
      var projectionExtent = projection.getExtent();
      // getWidth获取范围宽度。
      var size = getWidth(projectionExtent) / 256;
      var resolutions = new Array(10);
      var matrixIds = new Array(10);
      for (var z = 0; z < 10; ++z) {
        //分辨率和matrixIds数组
        resolutions[z] = size / Math.pow(2, z);
        matrixIds[z] = z;
      }

      /**
       * 加载本地瓦片地图。
       */
      let OffilineMapLayer = new TileLayer({
        source: new XYZ({
          url: "../../public/tiles_sx/{z}/{x}/{y}.png",
        }),
      });
      // 高德地图层
      var gaodeMapLayer = new TileLayer({
        source: new XYZ({
          url: "http://wprd0{1-4}.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=1&style=7",
        }),
      });
      // 数据源信息
      this.layers = [
        // 加载WMTS协议的地图
        // new TileLayer({
        //   source: OffilineMapLayer,
        // }),
        OffilineMapLayer,
        // gaodeMapLayer
      ];
      // 使用ol.Map来创建地图
      this.map = new olMap({
        // 地图图层
        layers: this.layers,
        // 设置显示地图的视图
        view: new View({
          center: transform([108.94678, 34.22287], "EPSG:4326", "EPSG:3857"),
          zoom: 11,
          maxZoom: 13,
          minZoom: 0,
        }),
        target: "map",
      });
    },
    // 异步加载矢量地图数据
    addGeoJSON(src) {
      var layer = new VectorLayer({
        source: new VectorSource({
          features: new GeoJSON().readFeatures(src, {
            // 用readFeatures方法可以自定义坐标系
            dataProjection: "EPSG:4326", // 设定JSON数据使用的坐标系
            featureProjection: "EPSG:3857", // 设定当前地图使用的feature的坐标系
          }),
        }),
      });
      this.map.addLayer(layer);
    },
    // 使用axios获取数据
    getGeoJson() {
      axios.get("../../public/geojson_sx/140000.geoJson").then((res) => {
        // this.addGeoJSON(res.data);
        console.log("res", res);
      });
    },
  },
  mounted() {
    this.initMap(); //初始化地图
    this.getGeoJson();
  },
};
</script>
<style lang="less">
#map {
  width: 100%;
  height: 800px;
}
td {
  border: 1px solid black;
}
.ol-popup {
  position: absolute;
  background-color: black !important;
  opacity: 0.7;
  color: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
  padding: 15px;
  border-radius: 10px;
  border: 1px solid #cccccc;
  bottom: 12px;
  left: -50px;
  min-width: 280px;
}
.ol-popup:after,
.ol-popup:before {
  top: 100%;
  border: solid transparent;
  content: " ";
  height: 0;
  width: 0;
  position: absolute;
  pointer-events: none;
}
.ol-popup:after {
  border-top-color: white;
  border-width: 10px;
  left: 48px;
  margin-left: -10px;
}
.ol-popup:before {
  border-top-color: #cccccc;
  border-width: 11px;
  left: 48px;
  margin-left: -11px;
}
.ol-popup-closer {
  text-decoration: none;
  position: absolute;
  top: 2px;
  right: 8px;
}
.ol-popup-closer:after {
  content: "✖";
}
</style>
