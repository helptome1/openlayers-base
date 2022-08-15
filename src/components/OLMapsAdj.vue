<template>
  <div id="map" ref="map"></div>
  <div>
    显示/隐藏：
    <input
      type="checkbox"
      checked="checked"
      @click="checkTiandi($event)"
    />天地图
    <input type="checkbox" checked="checked" @click="checkBaidu($event)" />百度
    <input
      type="checkbox"
      checked="checked"
      @click="checkAmap($event)"
    />高德地图
    <input type="checkbox" checked="checked" @click="checkOMS($event)" />OMS地图
    <input type="checkbox" checked="checked" @click="checkPoint($event)" />点
    <input
      type="checkbox"
      checked="checked"
      @click="checkVector($event)"
    />矢量图
  </div>
  <div>
    图层顺序：
    <input
      name="seq"
      type="radio"
      value=""
      @click="upTiandi($event)"
    />天地图最上
    <input
      name="seq"
      type="radio"
      value=""
      checked="checked"
      @click="upBaidu($event)"
    />百度最上
    <input
      name="seq"
      type="radio"
      value=""
      checked="checked"
      @click="upAmap($event)"
    />高德地图
    <!-- <input name="seq" type="radio" value="" @click="upPoint($event)" />点最上
    <input
      name="seq"
      type="radio"
      value=""
      @click="upVector($event)"
    />矢量图最上 -->
  </div>
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

import {
  get as getProjection,
  fromLonLat,
  transform,
  addProjection,
  addCoordinateTransforms,
} from "ol/proj";
import Projection from "ol/proj/Projection";

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
import WMTSTileGrid from "ol/tilegrid/WMTS";

// 百度地图坐标系
import projzh from "projzh";
import { getTopLeft, getWidth, applyTransform } from "ol/extent";

// 导入axios
import axios from "axios";

import { mercatorToLngLat, lngLatToMercator } from "./js/bd09";

// 导入公共模块
import {
  addTdtWmtsLayer,
  addWmtsLayer,
  addOSMLayer,
  addXYZLayer,
  addWMSLayer,
  changeTheme,
  addLayerToMap,
  gaodeTranslate,
} from "./js/commonApi";

export default {
  data() {
    return {
      map: null,
      tiandiLayer: null,
      baiduLayer: null,
      AmapLayer: null,
      pointLayer: null,
      circleLayer: null,
      geoLayer: null,
      mapView: null,
      OMSLayer: null,
      x: 0,
      y: 0,
      list: [1],
      layers: [],
      overlay: null,
      // projectionName: "BD-09",
      projectionName: "GCJ-02",
      // projectionName: "EPSG:3857",
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
      ArcGisLink: [
        "https://services.arcgisonline.com/arcgis/rest/services/World_Terrain_Base/MapServer",
        "https://services.arcgisonline.com/arcgis/rest/services/World_Street_Map/MapServer/WMTS/", //世界街道地图23
        "https://services.arcgisonline.com/arcgis/rest/services/World_Physical_Map/MapServer/WMTS/", //仅有8层
        "https://services.arcgisonline.com/arcgis/rest/services/World_Shaded_Relief/MapServer/WMTS/", //仅有12层
        "https://services.arcgisonline.com/arcgis/rest/services/NatGeo_World_Map/MapServer/WMTS/", //自然地理世界地图16层
        "https://services.arcgisonline.com/arcgis/rest/services/USA_Topo_Maps/MapServer/WMTS/", //美国地形图15
        "https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/WMTS", // 世界影像图 23
        "https://services.arcgisonline.com/arcgis/rest/services/Elevation/World_Hillshade_Dark/MapServer/WMTS/", //世界山阴暗 23
        "https://services.arcgisonline.com/arcgis/rest/services/Elevation/World_Hillshade/MapServer/WMTS/",
        "https://services.arcgisonline.com/arcgis/rest/services/Reference/World_Boundaries_and_Places_Alternate/MapServer/WMTS/", //标记矢量图
        "https://services.arcgisonline.com/arcgis/rest/services/Reference/World_Boundaries_and_Places/MapServer/WMTS/", //矢量标注图
        "https://services.arcgisonline.com/arcgis/rest/services/Reference/World_Transportation/MapServer/WMTS/", //交通
        "https://services.arcgisonline.com/arcgis/rest/services/Reference/World_Reference_Overlay/MapServer/WMTS/", //13世界参考覆盖
        "https://services.arcgisonline.com/arcgis/rest/services/Specialty/DeLorme_World_Base_Map/MapServer/WMTS/", //德洛姆世界底图基础底图。
        "https://services.arcgisonline.com/arcgis/rest/services/Specialty/World_Navigation_Charts/MapServer/WMTS/", //世界导航图
      ],
    };
  },
  methods: {
    // 天地图的坐标系统。
    addTianduLayer() {
      const projection = getProjection("EPSG:3857");
      const projectionExtent = projection.getExtent();
      const size = getWidth(projectionExtent) / 256;
      const resolutions = new Array(19);
      const matrixIds = new Array(19);
      for (let z = 0; z < 19; ++z) {
        resolutions[z] = size / Math.pow(2, z);
        matrixIds[z] = z;
      }
      let layer = new TileLayer({
        source: new WMTS({
          url: this.tiandituLink.vec_w + this.tiandiTuTk,
          layer: "vec",
          matrixSet: "w",
          format: "tiles",
          projection: projection,
          // 投影坐标系
          tileGrid: new WMTSTileGrid({
            // 获取范围的左上角坐标。
            origin: getTopLeft(projectionExtent),
            resolutions: resolutions,
            matrixIds: matrixIds,
          }),
          style: "default",
          wrapX: false,
          // 跨域请求
          crossOrigin: "anonymous",
        }),
        zIndex: 0,
        opacity: 1,
      });
      // map.addLayer(layer)
      return layer;
    },
    addTianDiLayer() {
      const projection = getProjection("EPSG:3857");
      const projectionExtent = projection.getExtent();
      const size = getWidth(projectionExtent) / 256;
      const resolutions = new Array(19);
      const matrixIds = new Array(19);
      for (let z = 0; z < 19; ++z) {
        resolutions[z] = size / Math.pow(2, z);
        matrixIds[z] = z;
      }
      let layer = new TileLayer({
        source: new WMTS({
          url: this.tiandituLink.cva_w + this.tiandiTuTk,
          layer: "cva",
          matrixSet: "w",
          format: "tiles",
          projection: projection,
          // 投影坐标系
          tileGrid: new WMTSTileGrid({
            // 获取范围的左上角坐标。
            origin: getTopLeft(projectionExtent),
            resolutions: resolutions,
            matrixIds: matrixIds,
          }),
          style: "default",
          wrapX: true,
          // 跨域请求
          crossOrigin: "anonymous",
        }),
        zIndex: 3,
        // opacity: 0.5,
      });
      // map.addLayer(layer)
      return layer;
    },
    baiduProj() {
      // 百度坐标系注册
      var projBD09 = new Projection({
        code: "BD-09",
        // extent: [-20037726.37, -11708041.66, 20037726.37, 12474104.17],
        extent: applyTransform(
          [72.004, 0.8293, 137.8347, 55.8271],
          projzh.ll2bmerc
        ),
        units: "m",
      });

      addProjection(projBD09);
      addCoordinateTransforms(
        "EPSG:4326",
        projBD09,
        projzh.ll2bmerc,
        projzh.bmerc2ll
      );
      addCoordinateTransforms(
        "EPSG:3857",
        projBD09,
        projzh.smerc2bmerc,
        projzh.bmerc2smerc
      );
    },
    // 百度地图
    addBaiduLayer() {
      /*定义百度地图分辨率与瓦片网格*/
      var resolutions = [];
      for (var i = 0; i <= 18; i++) {
        resolutions[i] = Math.pow(2, 18 - i);
      }

      var tilegrid = new TileGrid({
        origin: [0, 0],
        resolutions: resolutions,
      });

      var source = new TileImage({
        projection: "BD-09",
        tileGrid: tilegrid,
        tileUrlFunction: function (tileCoord, pixelRatio, proj) {
          if (!tileCoord) {
            return "";
          }
          //openlayers6的版本
          let z = tileCoord[0];
          let x = tileCoord[1];
          let y = -tileCoord[2] - 1;
          if (x < 0) x = "M" + -x;
          if (y < 0) y = "M" + -y;
          // const style = 't:land|e:g|v:on|c:#091220ff,t:water|e:g|v:on|c:#113549ff,t:green|e:g|v:on|c:#0e1b30ff,t:building|e:g|v:on,t:building|e:g.tf|c:#113549ff,t:building|e:g.sf|c:#143e56ff,t:building|e:g.s|c:#dadada00,t:subwaystation|e:g|v:on|c:#113549B2,t:education|e:g|v:on|c:#12223dff,t:medical|e:g|v:on|c:#12223dff,t:scenicspots|e:g|v:on|c:#12223dff,t:highway|e:g|v:on|w:4,t:highway|e:g.f|c:#12223dff,t:highway|e:g.s|c:#fed66900,t:highway|e:l|v:on,t:highway|e:l.t.f|c:#12223dff,t:highway|e:l.t.s|c:#ffffff00,t:highway|e:l.i|v:on,t:arterial|e:g|v:on|w:2,t:arterial|e:g.f|c:#12223dff,t:arterial|e:g.s|c:#ffeebb00,t:arterial|e:l|v:on,t:arterial|e:l.t.f|c:#2dc4bbff,t:arterial|e:l.t.s|c:#ffffff00,t:local|e:g|v:on|w:1,t:local|e:g.f|c:#12223dff,t:local|e:g.s|c:#ffffff00,t:local|e:l|v:on,t:local|e:l.t.f|c:#979c9aff,t:local|e:l.t.s|c:#ffffffff,t:railway|e:g|v:off,t:subway|e:g|v:off|w:1,t:subway|e:g.f|c:#d8d8d8ff,t:subway|e:g.s|c:#ffffff00,t:subway|e:l|v:on,t:subway|e:l.t.f|c:#979c9aff,t:subway|e:l.t.s|c:#ffffffff,t:continent|e:l|v:on,t:continent|e:l.i|v:on,t:continent|e:l.t.f|c:#2dc4bbff,t:continent|e:l.t.s|c:#ffffff00,t:city|e:l.i|v:off,t:city|e:l|v:on,t:city|e:l.t.f|c:#2dc4bbff,t:city|e:l.t.s|c:#ffffff00,t:town|e:l.i|v:on,t:town|e:l|v:off,t:town|e:l.t.f|c:#454d50ff,t:town|e:l.t.s|c:#ffffffff,t:road|e:g.f|c:#12223dff,t:poi|e:l|v:on,t:label|e:l|v:off,t:road|e:g|v:on,t:road|e:l|v:off,t:road|e:g.s|c:#ffffff00,t:district|e:l|v:on,t:poi|e:l.i|v:off,t:poi|e:l.t.f|c:#2dc4bbff,t:poi|e:l.t.s|c:#ffffff00,t:manmade|e:g|c:#12223dff,t:label|e:l.t.s|c:#ffffffff,t:entertainment|e:g|c:#12223dff,t:shopping|e:g|c:#12223dff,t:nationalway|e:g|v:off|z:6,t:nationalway|e:g|v:off|z:7,t:nationalway|e:g|v:off|z:8,t:nationalway|e:g|v:off|z:9,t:nationalway|e:g|v:off|z:10,t:nationalway|e:l|v:off|z:6,t:nationalway|e:l|v:off|z:7,t:nationalway|e:l|v:off|z:8,t:nationalway|e:l|v:off|z:9,t:nationalway|e:l|v:off|z:10,t:cityhighway|e:g|v:off|z:6,t:cityhighway|e:g|v:off|z:7,t:cityhighway|e:g|v:off|z:8,t:cityhighway|e:g|v:off|z:9,t:cityhighway|e:l|v:off|z:6,t:cityhighway|e:l|v:off|z:7,t:cityhighway|e:l|v:off|z:8,t:cityhighway|e:l|v:off|z:9,t:subwaylabel|e:l|v:off,t:subwaylabel|e:l.i|v:off,t:tertiarywaysign|e:l|v:off,t:tertiarywaysign|e:l.i|v:off,t:provincialwaysign|e:l|v:off,t:provincialwaysign|e:l.i|v:off,t:nationalwaysign|e:l|v:off,t:nationalwaysign|e:l.i|v:off,t:highwaysign|e:l|v:off,t:highwaysign|e:l.i|v:off,t:village|e:l|v:off,t:district|e:l.t|f:20,t:district|e:l.t.f|c:#2dc4bbff,t:district|e:l.t.s|c:#ffffff00,t:country|e:l.t.f|c:#2dc4bbff,t:country|e:l.t.s|c:#ffffff00,t:water|e:l.t.f|c:#2dc4bbff,t:water|e:l.t.s|c:#ffffff00,t:cityhighway|e:g.f|c:#12223dff,t:cityhighway|e:g.s|c:#ffffff00,t:tertiaryway|e:g.f|c:#12223dff,t:tertiaryway|e:g.s|c:#ffffff10,t:provincialway|e:g.f|c:#12223dff,t:provincialway|e:g.s|c:#ffffff00,t:nationalway|e:g.f|c:#12223dff,t:nationalway|e:g.s|c:#ffffff00,t:highway|e:l.t|f:20,t:nationalway|e:l.t.s|c:#ffffff00,t:nationalway|e:l.t.f|c:#12223dff,t:nationalway|e:l.t|f:20,t:provincialway|e:l.t.f|c:#12223dff,t:provincialway|e:l.t.s|c:#ffffff00,t:provincialway|e:l.t|f:20,t:cityhighway|e:l.t.f|c:#12223dff,t:cityhighway|e:l.t|f:20,t:cityhighway|e:l.t.s|c:#ffffff00,t:estate|e:g|c:#12223dff,t:tertiaryway|e:l.t.f|c:#2dc4bbff,t:tertiaryway|e:l.t.s|c:#ffffff00,t:fourlevelway|e:l.t.f|c:#2dc4bbff,t:fourlevelway|e:l.t.s|c:#ffffff00,t:scenicspotsway|e:g.f|c:#12223dff,t:scenicspotsway|e:g.s|c:#ffffff00,t:universityway|e:g.f|c:#12223dff,t:universityway|e:g.s|c:#ffffff00,t:vacationway|e:g.f|c:#12223dff,t:vacationway|e:g.s|c:#ffffff00,t:fourlevelway|e:g|v:on,t:fourlevelway|e:g.f|c:#12223dff,t:fourlevelway|e:g.s|c:#ffffff00,t:transportationlabel|e:l|v:on,t:transportationlabel|e:l.i|v:off,t:transportationlabel|e:l.t.f|c:#2dc4bbff,t:transportationlabel|e:l.t.s|c:#ffffff00,t:educationlabel|e:l|v:on,t:educationlabel|e:l.i|v:off,t:educationlabel|e:l.t.f|c:#2dc4bbff,t:educationlabel|e:l.t.s|c:#ffffff00,t:transportation|e:g|c:#113549ff,t:airportlabel|e:l.t.f|c:#2dc4bbff,t:airportlabel|e:l.t.s|c:#ffffff00,t:scenicspotslabel|e:l.t.f|c:#2dc4bbff,t:scenicspotslabel|e:l.t.s|c:#ffffff00,t:medicallabel|e:l.t.f|c:#2dc4bbff,t:medicallabel|e:l.t.s|c:#ffffff00,t:medicallabel|e:l.i|v:off,t:scenicspotslabel|e:l.i|v:off,t:airportlabel|e:l.i|v:off,t:entertainmentlabel|e:l.i|v:off,t:entertainmentlabel|e:l.t.f|c:#2dc4bbff,t:entertainmentlabel|e:l.t.s|c:#ffffff00,t:estatelabel|e:l.i|v:off,t:estatelabel|e:l.t.f|c:#2dc4bbff,t:estatelabel|e:l.t.s|c:#ffffff00,t:businesstowerlabel|e:l.t.f|c:#2dc4bbff,t:businesstowerlabel|e:l.t.s|c:#ffffff00,t:businesstowerlabel|e:l.i|v:off,t:companylabel|e:l.t.f|c:#2dc4bbff,t:companylabel|e:l.t.s|c:#ffffff00,t:companylabel|e:l.i|v:off,t:governmentlabel|e:l.i|v:off,t:governmentlabel|e:l.t.f|c:#2dc4bbff,t:governmentlabel|e:l.t.s|c:#ffffff00,t:restaurantlabel|e:l.t.f|c:#2dc4bbff,t:restaurantlabel|e:l.t.s|c:#ffffff00,t:restaurantlabel|e:l.i|v:off,t:hotellabel|e:l.i|v:off,t:hotellabel|e:l.t.f|c:#2dc4bbff,t:hotellabel|e:l.t.s|c:#ffffff00,t:shoppinglabel|e:l.t.f|c:#2dc4bbff,t:shoppinglabel|e:l.t.s|c:#ffffff00,t:shoppinglabel|e:l.i|v:off,t:lifeservicelabel|e:l.t.f|c:#2dc4bbff,t:lifeservicelabel|e:l.t.s|c:#ffffff00,t:lifeservicelabel|e:l.i|v:off,t:carservicelabel|e:l.t.f|c:#2dc4bbff,t:carservicelabel|e:l.t.s|c:#ffffff00,t:carservicelabel|e:l.i|v:off,t:financelabel|e:l.t.f|c:#2dc4bbff,t:financelabel|e:l.t.s|c:#ffffff00,t:financelabel|e:l.i|v:off,t:otherlabel|e:l.t.f|c:#2dc4bbff,t:otherlabel|e:l.t.s|c:#ffffff00,t:otherlabel|e:l.i|v:off,t:manmade|e:l.t.f|c:#2dc4bbff,t:manmade|e:l.t.s|c:#ffffff00,t:transportation|e:l.t.f|c:#2dc4bbff,t:transportation|e:l.t.s|c:#ffffff00,t:education|e:l.t.f|c:#2dc4bbff,t:education|e:l.t.s|c:#ffffff00,t:medical|e:l.t.f|c:#2dc4bbff,t:medical|e:l.t.s|c:#ffffff00,t:scenicspots|e:l.t.f|c:#2dc4bbff,t:scenicspots|e:l.t.s|c:#ffffff00'
          // return `https://api.map.baidu.com/customimage/tile?&x=${x}&y=${y}&z=${z}&styles=${style}&scaler=1&udt=20211014&from=jsapi2_0`
          return `https://maponline0.bdimg.com/tile/?qt=vtile&x=${x}&y=${y}&z=${z}&styles=pl&scaler=1&udt=20220811&from=jsapi2_0`;
        },
      });

      var mapLayer = new TileLayer({
        source: source,
        zIndex: 1,
        opacity: 1,
      });

      return mapLayer;
    },
    addAmapLayer() {
      const projection = getProjection("GCJ-02");
      const projectionExtent = projection.getExtent();
      const size = getWidth(projectionExtent) / 256;
      const resolutions = new Array(19);
      const matrixIds = new Array(19);
      for (let z = 0; z < 19; ++z) {
        resolutions[z] = size / Math.pow(2, z);
        matrixIds[z] = z;
      }
      const AmapLayer = new TileLayer({
        source: new XYZ({
          projection: "GCJ-02",
          url: "http://wprd0{1-4}.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=2&style=7",
          wrapX: false,
          // 投影坐标系
          tileGrid: new WMTSTileGrid({
            // 获取范围的左上角坐标。
            origin: getTopLeft(projectionExtent),
            resolutions: resolutions,
            matrixIds: matrixIds,
          }),
        }),
        zIndex: 2,
        opacity: 0.6,
      });
      return AmapLayer;
    },
    addOSMLayer() {
      const layer = new TileLayer({
        source: new OSM(),
      });
      return layer;
    },
    /**
     * 初始化地图
     */
    initMap() {
      // 百度的坐标系注册
      this.baiduProj();
      // 高德坐标系注册
      gaodeTranslate();

      // 添加天地图
      this.tiandiLayer = this.addTianduLayer();
      // this.map.addLayer(this.tiandiLayer);
      // 添加百度地图
      this.baiduLayer = this.addBaiduLayer();
      // this.map.addLayer(this.baiduLayer);
      // 添加高德地图
      this.AmapLayer = this.addAmapLayer();
      // this.map.addLayer(this.AmapLayer);

      // osm的layers
      this.OMSLayer = this.addOSMLayer();

      const tiandituLayer = this.addTianDiLayer();

      this.mapView = new View({
        center: transform(
          [108.9421, 34.2244],
          "EPSG:4326",
          // this.projectionName
          "EPSG:3857"
        ),
        // center: transform([108.9421, 34.2244], "EPSG:4326", "BD-09"),
        // center: [108.9421, 34.2244],
        // projection: "BD-09",
        projection: "EPSG:3857",
        // projection: "EPSG:4326",
        zoom: 5,
        maxZoom: 19,
        // minZoom: 0,
      });
      const layers = [
        this.tiandiLayer,
        this.AmapLayer,
        this.baiduLayer,
        this.OMSLayer,

        tiandituLayer,
      ];
      // 使用ol.Map来创建地图
      this.map = new olMap({
        // 地图图层
        // layers: this.layers,
        layers: layers,
        // 设置显示地图的视图
        view: this.mapView,
        target: "map",
      });

      // this.map.addLayer(tiandituLayer)

      console.log("layers", this.map.getLayers());

      // 添加百度地图
      this.getGeoJson(); //加载geojson图层

      this.addPoint();
    },
    addPoint() {
      /**
       * 创建一个活动图标需要的feature，并设置位置。
       */
      this.pointLayer = new VectorLayer({
        source: new VectorSource(),
        projection: "EPSG:3857",
        zIndex: 4,
      });

      // 创建一个活动图标需要的Feature，并设置位置
      var activity = new Feature({
        geometry: new Point(
          // transform([108.9421, 34.2244], "EPSG:4326", this.projectionName)
          transform([108.9421, 34.2244], "EPSG:4326", "EPSG:3857")
          // fromLonLat([108.9421, 34.2244])
        ),
      });
      // 设置Feature的样式，
      activity.setStyle(
        new Style({
          image: new Icon({
            // src: "../../public/image/blueIcon.png",
            // src: "../../image/blueIcon.png",
            src: "/image/blueIcon.png",
            anchor: [0.5, 60],
            anchorOrigin: "top-right",
            anchorXUnits: "fraction",
            anchorYUnits: "pixels",
            offsetOrigin: "top-right",
            // scale: 1,
          }),
        })
      );
      this.pointLayer.getSource().addFeature(activity);
      this.map.addLayer(this.pointLayer);
    },
    addGeoJSON(src) {
      // 创建geojson数据来源
      var geoSourece = new VectorSource({
        // url: '../../public/json/data.json'
        features: new GeoJSON().readFeatures(src, {
          //readFeature可以重新设置坐标系
          dataProjection: "EPSG:4326", // 设定JSON数据使用的坐标系
          featureProjection: "EPSG:3857", // 设定当前地图使用的feature的坐标系
          // featureProjection: this.projectionName, // 设定当前地图使用的feature的坐标系
        }),
      });
      // 创建一个矢量地图图层
      this.geoLayer = new VectorLayer({
        source: geoSourece,
        zIndex: 3,
        style: function (feature, demo) {
          return new Style({
            stroke: new Stroke({
              color: "green",
              width: 2,
            }),
            fill: new Fill({
              color: feature.get("COLOR"),
            }),
          });
        },
      });

      this.map.addLayer(this.geoLayer);
    },
    getGeoJson() {
      // axios.get("../../public/json/data.geojson").then((res) => {});
      // axios.get("../../json/sxhn.geojson").then((res) => {
      //   console.log(res.data);
      //   this.addGeoJSON(res.data);
      // });
      axios.get("/json/sxhn.geojson").then((res) => {
        console.log(res.data);
        this.addGeoJSON(res.data);
      });
    },

    updateFeature() {
      this.pointLayer.getSource().clear();
      this.geoLayer.getSource().clear();

      this.getGeoJson(); //加载geojson图层
      this.addPoint();
      this.mapView.setZoom(5);
      // this.tiandiLayer.getSource().refresh()
      // this.baiduLayer.getSource().refresh()
    },
    // 隐藏显示tiandi图层
    checkTiandi(elem) {
      this.tiandiLayer.setVisible(elem.target.checked);
      // if (!elem.target.checked) {
      //   this.projectionName = "BD-09";
      // } else {
      //   this.projectionName = "EPSG:3857";
      // }
      // this.updateFeature();
    },

    // 隐藏显示point图层
    checkBaidu(elem) {
      this.baiduLayer.setVisible(elem.target.checked);
      // if (!elem.target.checked) {
      //   this.projectionName = "EPSG:3857";
      // } else {
      //   this.projectionName = "BD-09";
      // }
      // this.updateFeature();
    },

    checkAmap(elem) {
      this.AmapLayer.setVisible(elem.target.checked);
      // if (!elem.target.checked) {
      //   this.projectionName = "EPSG:3857";
      // } else {
      //   this.projectionName = "GCJ-02";
      // }
      // this.updateFeature();
    },
    checkPoint(elem) {
      this.pointLayer.setVisible(elem.target.checked);
    },
    // 隐藏显示circle图层
    checkVector(elem) {
      this.geoLayer.setVisible(elem.target.checked);
    },

    checkOMS(elem) {
      this.OMSLayer.setVisible(elem.target.checked);
    },

    // 置顶osm图层到最上面
    upTiandi(elem) {
      if (elem.target.checked) {
        this.projectionName = "EPSG:3857";
        this.tiandiLayer.setZIndex(2);
        this.baiduLayer.setZIndex(this.baiduLayer.getZIndex() - 1);
        this.AmapLayer.setZIndex(this.AmapLayer.getZIndex() - 1);
        this.updateFeature();
      }
    },

    // 置顶circle图层到最上面
    upBaidu(elem) {
      if (elem.target.checked) {
        this.projectionName = "BD-09";
        this.baiduLayer.setZIndex(2);
        this.tiandiLayer.setZIndex(this.tiandiLayer.getZIndex() - 1);
        this.AmapLayer.setZIndex(this.AmapLayer.getZIndex() - 1);
        this.updateFeature();
      }
    },
    upAmap(elem) {
      if (elem.target.checked) {
        this.AmapLayer.setZIndex(2);
        this.projectionName = "GCJ-02";
        this.baiduLayer.setZIndex(this.baiduLayer.getZIndex() - 1);
        this.tiandiLayer.setZIndex(this.tiandiLayer.getZIndex() - 1);
        this.updateFeature();
      }
    },

    // 置顶point图层到最上面
    upPoint(elem) {
      if (elem.target.checked) {
        this.AmapLayer.setZIndex(3);
        this.baiduLayer.setZIndex(this.baiduLayer.getZIndex() - 1);
        this.AmapLayer.setZIndex(this.AmapLayer.getZIndex() - 1);
      }
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
