<template>
  <div id="map" ref="map">
    <!-- 菜单列表 -->
    <div class="menu-list">
      <ul>
        <li
          v-for="(item, index) in cityList"
          :key="index"
          @click="gotoCity(item)"
        >
          {{ item.name }}
        </li>
      </ul>
    </div>
    <!-- 显示与隐藏 -->
    <div class="show-list">
      <ul>
        <li
          v-for="(item, index) in layerList"
          :key="index"
          @click="isVisible(item)"
        >
          {{ item.name }}
        </li>
      </ul>
    </div>
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

import { getDistance } from "ol/sphere";

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
      projectionName: "GCJ-02",
      cityList: [
        {
          name: "北京",
          coordinate: [116.418757, 39.917544],
        },
        {
          name: "郑州",
          coordinate: [113.665412, 34.757975],
        },
        {
          name: "四川",
          coordinate: [104.065735, 30.659462],
        },
      ],
      layerList: [
        {
          name: "区域轮廓",
          value: "geoLayer",
          visible: true,
        },
        {
          name: "重点单位",
          value: "pointLayer",
          visible: true,
        },
      ],
      tiandituLink: {
        vec_c: "http://t1.tianditu.gov.cn/vec_c/wmts?tk=",
        vec_w: "http://t1.tianditu.gov.cn/vec_w/wmts?tk=",
        cva_c: "http://t3.tianditu.gov.cn/cva_c/wmts?tk=",
        cva_w: "http://t0.tianditu.gov.cn/cva_w/wmts?tk=",
        // 影响地图
        img_c: "http://t0.tianditu.gov.cn/img_c/wmts?tk=",
        img_w: "http://t0.tianditu.gov.cn/img_w/wmts?tk=",
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
          url: "http://wprd0{1-4}.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=1&style=6",
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
        opacity: 1,
      });
      return AmapLayer;
    },
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
          url: this.tiandituLink.img_w + this.tiandiTuTk,
          layer: "img",
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
    /**
     * 初始化地图
     */
    initMap() {
      // 高德坐标系注册
      gaodeTranslate();
      // 添加高德地图
      this.AmapLayer = this.addAmapLayer();
      // 添加天地图
      this.tiandiLayer = this.addTianduLayer();

      this.mapView = new View({
        center: transform([104.065735, 30.659462], "EPSG:4326", "EPSG:3857"),
        projection: "EPSG:3857",
        zoom: 13,
        maxZoom: 19,
        // minZoom: 0,
      });
      const layers = [
        // this.tiandiLayer,
        this.AmapLayer,
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

      //加载geojson图层
      this.getGeoJson();

      this.addPoint();
      const LayersArr = this.map.getLayers();
      console.log("layers", LayersArr);
      LayersArr.forEach((item) => {
        console.log("item", item);
      });
    },
    addPoint() {
      /**
       * 创建一个活动图标需要的feature，并设置位置。
       */
      this.pointLayer = new VectorLayer({
        source: new VectorSource(),
        projection: "EPSG:3857",
        className: "point",
        zIndex: 4,
      });

      // 创建一个活动图标需要的Feature，并设置位置
      var activity = new Feature({
        geometry: new Point(
          // transform([108.9421, 34.2244], "EPSG:4326", this.projectionName)
          transform([104.065735, 30.659462], "EPSG:4326", "EPSG:3857")
          // fromLonLat([108.9421, 34.2244])
        ),
      });
      // 设置Feature的样式，
      activity.setStyle(
        new Style({
          image: new Icon({
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
        className: "geoJson",
        source: geoSourece,
        zIndex: 3,
        style: function (feature, demo) {
          return new Style({
            stroke: new Stroke({
              color: "yellow",
              width: 2,
            }),
            // fill: new Fill({
            //   color: rgba(255, 255, 255),
            // }),
          });
        },
      });

      this.map.addLayer(this.geoLayer);
    },
    getGeoJson() {
      axios.get("/show/sichuan.geojson").then((res) => {
        this.addGeoJSON(res.data);
      });
    },

    updateFeature() {
      this.pointLayer.getSource().clear();
      this.geoLayer.getSource().clear();

      this.getGeoJson(); //加载geojson图层
      this.addPoint();
      this.mapView.setZoom(5);
    },

    checkPoint(elem) {
      this.pointLayer.setVisible(elem.target.checked);
    },
    // 隐藏显示circle图层
    checkVector(elem) {
      this.geoLayer.setVisible(elem.target.checked);
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

    // 飞行动画
    flyTo(location, done) {
      const duration = 4000;
      const zoom = this.mapView.getZoom();
      let parts = 2;
      let called = false;
      function callback(complete) {
        --parts;
        if (called) {
          return;
        }
        if (parts === 0 || !complete) {
          called = true;
          done(complete);
        }
      }
      this.mapView.animate(
        {
          center: transform(location, "EPSG:4326", "EPSG:3857"),
          duration: duration,
        },
        callback
      );
      this.mapView.animate(
        {
          zoom: zoom - 4,
          duration: duration / 2,
        },
        {
          zoom: zoom,
          duration: duration / 2,
        },
        callback
      );
    },

    gotoCity(item) {
      const _this = this;
      _this.mapView.setZoom(13);
      setTimeout(function () {
        _this.flyTo(item.coordinate, function () {
          _this.mapView.setZoom(15);
        });
      }, 16);
    },

    isVisible(item) {
      if (item.value == "pointLayer") {
        this.pointLayer.setVisible(!item.visible);
      } else if (item.value === "geoLayer") {
        this.geoLayer.setVisible(!item.visible);
      }
      item.visible = !item.visible;
    },
  },
  mounted() {
    this.initMap(); //初始化地图
  },
};
</script>
<style lang="less">
#map {
  position: absolute;
  width: 100%;
  height: 100%;
  .menu-list {
    position: absolute;
    background-color: rgba(8, 18, 28, 0.7);
    right: 20px;
    top: 25%;
    width: 100px;
    height: 200px;
    z-index: 999;
    ul {
      display: flex;
      height: 100%;
      flex-direction: column;
      justify-content: flex-start;
      align-content: center;
      li {
        line-height: 1.8;
        height: 15%;
        cursor: pointer;
        color: #bbb;
        &:hover {
          // background-color: #ccc;
          color: #fff;
        }
      }
    }
  }
  .show-list {
    position: absolute;
    left: 10px;
    top: 30%;
    width: 100px;
    height: 100px;
    background-color: rgba(8, 18, 28, 0.7);
    z-index: 999;
    ul {
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      li {
        line-height: 1.8;
        height: 15%;
        cursor: pointer;
        color: #bbb;
        &:hover {
          color: #fff;
        }
      }
    }
  }
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
