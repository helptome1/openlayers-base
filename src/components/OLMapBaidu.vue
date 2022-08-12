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
import {
  get as getProjection,
  fromLonLat,
  transform,
  addProjection,
  addCoordinateTransforms,
} from "ol/proj";
import Projection from "ol/proj/Projection";

import { register } from "ol/proj/proj4";
import { getTopLeft, getWidth, applyTransform } from "ol/extent";
import WMTSTileGrid from "ol/tilegrid/WMTS";
// 加载坐标系转换函数
import proj4 from "proj4/dist/proj4";
// 百度地图坐标系
import projzh from "projzh";
// 导入axios
import axios from "axios";

import {
  addTdtWmtsLayer,
  addWmtsLayer,
  addOSMLayer,
  addXYZLayer,
  addWMSLayer,
  gaodeTranslate,
  baiduProj,
  addBaiduLayer,
  addLayerToMap
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
     * 百度坐标系转换
     */
    // baiduProj() {
    //   let center = [108.94238, 34.26097]; //西安钟楼
    //   // let center = [108.964031,34.217865]; //西安大雁塔
    //   // let center = [116.411794, 39.9068]; //北京东单
    //   let extent = [72.004, 0.8293, 137.8347, 55.8271];
    //   let baiduMercator = new Projection({
    //     code: "bd-09",
    //     extent: applyTransform(extent, projzh.ll2bmerc),
    //     units: "m",
    //   });
    //   addProjection(baiduMercator);
    //   addCoordinateTransforms(
    //     "EPSG:4326",
    //     baiduMercator,
    //     projzh.ll2bmerc,
    //     projzh.bmerc2ll
    //   );
    //   addCoordinateTransforms(
    //     "EPSG:3857",
    //     baiduMercator,
    //     projzh.smerc2bmerc,
    //     projzh.bmerc2smerc
    //   );
    // },

    /**
     * 初始化地图
     */
    initMap() {
      // this.baiduProj();
      baiduProj();
      //通过范围计算得到分辨率数组
      // 定义一些常量
      // const projection = getProjection("EPSG:4326");
      const projection = getProjection("EPSG:3857");
      const projectionExtent = projection.getExtent();
      const size = getWidth(projectionExtent) / 256;
      const resolutions = new Array(16);
      const matrixIds = new Array(16);
      for (let z = 0; z < 16; ++z) {
        resolutions[z] = size / Math.pow(2, z);
        matrixIds[z] = z;
      }

      // 百度地图投影调整
      // proj4.defs("EPSG:4008", "+proj=longlat +ellps=clrk66 +no_defs");
      // proj4.defs(
      //   "BD-MC",
      //   "+proj=merc +lon_0=0 +units=m +ellps=clrk66 +no_defs"
      // );
      // register(proj4);

      // 自定义分辨率和瓦片坐标系
      var resolutions2 = [];
      var maxZoom = 18;

      // 计算百度使用的分辨率
      for (var i = 0; i <= maxZoom; i++) {
        resolutions2[i] = Math.pow(2, 18 - i); //计算每一层的分辨率，存进 resolutions 中
      }
      var tilegrid = new TileGrid({
        origin: [0, 0], // 设置原点坐标
        resolutions: resolutions2, // 设置分辨率
      });

      // 百度矢量底图地图服务
      /*加载百度地图离线瓦片不能用ol.source.XYZ，ol.source.XYZ针对谷歌地图（注意：是谷歌地图）而设计，
             而百度地图与谷歌地图使用了不同的投影、分辨率和瓦片网格。因此这里使用ol.source.TileImage来自行指定
           投影、分辨率、瓦片网格。*/
      let source0 = new TileImage({
        projection: "bd-09",
        tileGrid: tilegrid,
        tileUrlFunction: function (tileCoord, pixelRatio, proj) {
          if (!tileCoord) {
            return "";
          }
          var z = tileCoord[0];
          var x = tileCoord[1];
          var y = -tileCoord[2] - 1;
          if (x < 0) {
            x = "M" + -x;
          }
          if (y < 0) {
            y = "M" + -y;
          }
          return (
            "http://online3.map.bdimg.com/onlinelabel/?qt=tile&x=" +
            x +
            "&y=" +
            y +
            "&z=" +
            z +
            "&styles=pl&udt=20151021&scaler=1&p=1"
          );
        },
        // url: 'http://online3.map.bdimg.com/onlinelabel/?qt=tile&x={x}&y={y}&z={z}&styles=pl&udt=20170712&scaler=1&p=1',
        crossOrigin: "anonymous",
      });
      // 百度影像注记地图服务
      let source1 = new TileImage({
        projection: "bd-09",
        tileGrid: tilegrid,
        tileUrlFunction: function (tileCoord, pixelRatio, proj) {
          if (!tileCoord) {
            return "";
          }
          var z = tileCoord[0];
          var x = tileCoord[1];
          var y = -tileCoord[2] - 1;
          if (x < 0) {
            x = "M" + -x;
          }
          if (y < 0) {
            y = "M" + -y;
          }
          return (
            "http://online1.map.bdimg.com/tile/?qt=tile&x=" +
            x +
            "&y=" +
            y +
            "&z=" +
            z +
            "&styles=sl&v=020"
          );
        },
        crossOrigin: "anonymous",
      });
      // 百度影像地图服务
      let source2 = new TileImage({
        projection: "bd-09",
        tileGrid: tilegrid,
        tileUrlFunction: function (tileCoord, pixelRatio, proj) {
          if (!tileCoord) {
            return "";
          }
          var z = tileCoord[0];
          var x = tileCoord[1];
          var y = -tileCoord[2] - 1;
          if (x < 0) {
            x = "M" + -x;
          }
          if (y < 0) {
            y = "M" + -y;
          }
          return (
            "http://shangetu1.map.bdimg.com/it/u=x=" +
            x +
            ";y=" +
            y +
            ";z=" +
            z +
            ";v=009;type=sate&fm=46"
          );
        },
        crossOrigin: "anonymous",
      });

      // 数据源信息
      this.layers = [
        // 百度地图
        // new TileLayer({
        //   source: source0,
        // }),
        // 加载WMTS协议的地图
        new TileLayer({
          source: new WMTS({
            url: "http://t0.tianditu.gov.cn/vec_c/wmts?tk=20671382c71c11dac5d763aab0185146",
            layer: "vec", //注意每个图层这里不同
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
      ];
      // 使用ol.Map来创建地图
      this.map = new olMap({
        // 地图图层
        layers: this.layers,
        // 设置显示地图的视图
        view: new View({
          // center: transform([108.9421, 34.2244], "EPSG:4326", "EPSG:3857"),
          center: [108.9421, 34.2244],
          zoom: 16,
          maxZoom: 19,
          projection: "EPSG:4326",
        }),
        target: "map",
      });
      const baiduLayer = addBaiduLayer(this.map);
      addLayerToMap(this.map, baiduLayer)
      // 添加点坐标
      this.addPoint();
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
          // transform([108.9421, 34.2244], "EPSG:4326", "EPSG:3857")
          [108.9421, 34.2244]
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
