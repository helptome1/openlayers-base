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
      tiandituLink: {
        vec_c: "http://t1.tianditu.gov.cn/vec_c/wmts?tk=",
        vec_w: "http://t1.tianditu.gov.cn/vec_w/wmts?tk=",
        cva_c: "http://t3.tianditu.gov.cn/cva_c/wmts?tk=",
        cva_w: "http://t0.tianditu.gov.cn/cva_w/wmts?tk=",
        img_c: "http://t2.tianditu.gov.cn/img_c/wmts?tk=",
        img_w: "http://t3.tianditu.gov.cn/img_w/wmts?tk=",
        cia_c: "http://t0.tianditu.gov.cn/cia_c/wmts?tk=",
        cia_w: "http://t0.tianditu.gov.cn/cia_w/wmts?tk=",
        ter_c: "http://t0.tianditu.gov.cn/ter_c/wmts?tk=",
        ter_w: "http://t0.tianditu.gov.cn/ter_w/wmts?tk=",
        cta_c: "http://t0.tianditu.gov.cn/cta_c/wmts?tk=",
        cta_w: "http://t0.tianditu.gov.cn/cta_w/wmts?tk=",
      },
      tiandiTuTk: "20671382c71c11dac5d763aab0185146",
    };
  },
  methods: {
    /**
     * 初始化地图
     */
    initMap() {
      //通过范围计算得到分辨率数组
      // var projection = getProjection("EPSG:3857");
      // 天地图使用EPSG: 4326坐标系
      var projection = getProjection("EPSG:4326");
      // 获取此投影的有效范围。
      var projectionExtent = projection.getExtent();
      // getWidth获取范围宽度。
      var size = getWidth(projectionExtent) / 256;
      var resolutions = new Array(14);
      var matrixIds = new Array(14);
      for (var z = 0; z < 14; ++z) {
        //分辨率和matrixIds数组
        resolutions[z] = size / Math.pow(2, z);
        matrixIds[z] = z;
      }
      // 数据源信息
      this.layers = [
        // 加载天地图的WMTS协议的地图
        new TileLayer({
          source: new WMTS({
            url: this.tiandituLink.img_c + this.tiandiTuTk,
            layer: "img", //注意每个图层这里不同
            //投影坐标系设置矩阵
            matrixSet: "c",
            format: "tiles",
            style: "default",
            projection: projection,
            tileGrid: new WMTSTileGrid({
              origin: getTopLeft(projectionExtent),
              resolutions: resolutions,
              matrixIds: matrixIds,
            }),
            wrapX: true,
          }),
        }),
        // new TileLayer({
        //   source: new WMTS({
        //     url: this.tiandituLink.vec_c + this.tiandiTuTk,
        //     layer: "vec", //注意每个图层这里不同
        //     //投影坐标系设置矩阵
        //     matrixSet: "c",
        //     format: "tiles",
        //     style: "default",
        //     projection: projection,
        //     tileGrid: new WMTSTileGrid({
        //       origin: getTopLeft(projectionExtent),
        //       resolutions: resolutions,
        //       matrixIds: matrixIds,
        //     }),
        //     wrapX: true,
        //   }),
        // }), 
        // 加载arcgis的WMTS协议的地图
        // new TileLayer({
        //   source: new WMTS({
        //     // url: "https://services.arcgisonline.com/arcgis/rest/services/World_Terrain_Base/MapServer",
        //     url: "https://services.arcgisonline.com/arcgis/rest/services/World_Street_Map/MapServer/WMTS/", //世界街道地图23
        //     // url: "https://services.arcgisonline.com/arcgis/rest/services/World_Physical_Map/MapServer/WMTS/",//仅有8层
        //     // url: "https://services.arcgisonline.com/arcgis/rest/services/World_Shaded_Relief/MapServer/WMTS/", //仅有12层
        //     // url: "https://services.arcgisonline.com/arcgis/rest/services/NatGeo_World_Map/MapServer/WMTS/",//自然地理世界地图16层
        //     // url: "https://services.arcgisonline.com/arcgis/rest/services/USA_Topo_Maps/MapServer/WMTS/", //美国地形图15
        //     // url: "https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/WMTS",// 世界影像图 23
        //     // url: "https://services.arcgisonline.com/arcgis/rest/services/Elevation/World_Hillshade_Dark/MapServer/WMTS/",//世界山阴暗 23
        //     // url: "https://services.arcgisonline.com/arcgis/rest/services/Elevation/World_Hillshade/MapServer/WMTS/",
        //     // url: "https://services.arcgisonline.com/arcgis/rest/services/Reference/World_Boundaries_and_Places_Alternate/MapServer/WMTS/",//标记矢量图
        //     // url: "https://services.arcgisonline.com/arcgis/rest/services/Reference/World_Boundaries_and_Places/MapServer/WMTS/",//矢量标注图
        //     // url: "https://services.arcgisonline.com/arcgis/rest/services/Reference/World_Transportation/MapServer/WMTS/", //交通
        //     // url: "https://services.arcgisonline.com/arcgis/rest/services/Reference/World_Reference_Overlay/MapServer/WMTS/", //13世界参考覆盖
        //     // url: "https://services.arcgisonline.com/arcgis/rest/services/Specialty/DeLorme_World_Base_Map/MapServer/WMTS/", //德洛姆世界底图基础底图。
        //     // url: "https://services.arcgisonline.com/arcgis/rest/services/Specialty/World_Navigation_Charts/MapServer/WMTS/",//世界导航图
        //     // 投影坐标系
        //     tileGrid: new WMTSTileGrid({
        //       // 获取范围的左上角坐标。
        //       origin: getTopLeft(projectionExtent),
        //       resolutions: resolutions,
        //       matrixIds: matrixIds,
        //     }),
        //     wrapX: true,
        //     crossOrigin: "anonymous",
        //   }),
        // })
      ];
      // 使用ol.Map来创建地图
      this.map = new olMap({
        // 地图图层
        layers: this.layers,
        // 设置显示地图的视图
        view: new View({
          center: transform([108.9421, 34.2244], "EPSG:4326", "EPSG:3857"),
          zoom: 10,
          maxZoom: 19,
          minZoom: 0,
        }),
        target: "map",
      });
      this.addPoint()
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
          transform([108.9421, 34.2244], "EPSG:4326", "EPSG:3857")
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
