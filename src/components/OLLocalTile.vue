<template>
  <div id="map" ref="map"></div>
  <!-- <div>
    <input name="seq" type="radio" value="" @change="upOsm($event)" />底图最上
    <input
      name="seq"
      type="radio"
      value=""
      checked="checked"
      @change="upCircle($event)"
    />圆最上
    <input name="seq" type="radio" value="" @change="upPoint($event)" />点最上
  </div> -->
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

// 封装的函数
import {
  addTdtWmtsLayer,
  addWmtsLayer,
  addOSMLayer,
  addXYZLayer,
  addWMSLayer,
  changeTheme,
} from "./js/commonApi";

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
       * 加载本地瓦片地图。或者服务器瓦片地图数据
       */
      let OffilineMapLayer = new TileLayer({
        source: new XYZ({
          url: "http://172.16.29.100:9800/gis/bj/tiles/{z}/{x}/{y}.png",
          // projection: "EPSG:3857",
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
        // 本地
        OffilineMapLayer,
        // gaodeMapLayer
      ];
      // 使用ol.Map来创建地图
      this.map = new olMap({
        // 地图图层
        layers: this.layers,
        // 设置显示地图的视图
        view: new View({
          // center: transform([108.9421, 34.2244], "EPSG:4326", "EPSG:3857"),//西安小寨
          // center: transform([116.423816, 39.511305], "EPSG:4326", "EPSG:3857"), //北京
          center: transform([116.404269, 39.913607], "EPSG:4326", "EPSG:3857"),
          // projection: "EPSG:3857",
          zoom: 8,
          // maxZoom: 13,
          maxZoom: 14,
          minZoom: 0,
          // 鼠标每次滚动一个图层
          // constrainResolution: true,
        }),
        target: "map",
      });

      // addWmtsLayer(this.map, 'http://172.16.29.100:9800/gis/bj/tiles');

      // this.addPoint()
      this.map.on("moveend", function (e) {
        console.log("e", this.getView().getZoom());
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
    addPoint() {
      /**
       * 创建一个活动图标需要的feature，并设置位置。
       */
      const activityLayer = new VectorLayer({
        source: new VectorSource(),
      });

      // 创建一个活动图标需要的Feature，并设置位置
      var activity = new Feature({
        geometry: new Point(
          transform([116.423816, 39.511305], "EPSG:4326", "EPSG:3857")
          // [108.9421, 34.2244]
        ),
      });
      // 设置Feature的样式，
      activity.setStyle(
        new Style({
          image: new Icon({
            src: "../../public/image/blueIcon.png",
            anchor: [0.5, 60],
            anchorOrigin: "top-right",
            anchorXUnits: "fraction",
            anchorYUnits: "pixels",
            offsetOrigin: "top-right",
            // scale: 1,
          }),
        })
      );
      activityLayer.getSource().addFeature(activity);
      this.map.addLayer(activityLayer);
    },
  },
  mounted() {
    this.initMap(); //初始化地图
    // this.getGeoJson();
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
