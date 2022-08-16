<template>
  <div id="map" ref="map">
    <!-- 菜单列表 -->
    <div class="menu-list">
      <ul>
        <li
          v-for="(item, index) in polluteList"
          :key="index"
          @click="gotoCity(item)"
        >
          {{ item.properties.name }}
        </li>
      </ul>
    </div>
    <!-- 显示与隐藏 -->
    <div class="show-list">
      <ul>
        <li
          v-for="(item, index) in layerList"
          :key="index"
          :class="{ active: item.visible }"
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
      // 污染地区图层
      polluteLayer: null,
      // 农用地区图层
      farmlandLayer: null,
      // 监管单位
      superviseLayer: null,
      geoLayer: null,
      mapView: null,
      OMSLayer: null,
      currentCoordinates: [104.065735, 30.659462],
      x: 0,
      y: 0,
      list: [1],
      layers: [],
      overlay: null,
      projectionName: "GCJ-02",
      polluteList: [],
      // 当前活跃的污染区域
      polluteAreaActiveFeature: null,
      // 当前活跃的监管单位
      pointActiveFeatures: null,
      colorList: [
        "#32e0a9",
        "#27eaff",
        "#ff6d6d",
        "#d4a9ff",
        "#ffd52f",
        "#63ff67",
        "#e452e6",
        "#20a2f4",
        "#09c5fa",
        "#ff7e00",
      ],
      layerList: [
        {
          name: "四川省区域",
          value: "geoLayer",
          visible: true,
        },
        {
          name: "污染地区",
          value: "polluteLayer",
          visible: true,
        },
        {
          name: "农用地区",
          value: "farmlandLayer",
          visible: true,
        },
        {
          name: "监管单位",
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
          url: "http://wprd0{1-4}.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=2&style=6",
          wrapX: false,
          // 投影坐标系
          tileGrid: new WMTSTileGrid({
            // 获取范围的左上角坐标。
            origin: getTopLeft(projectionExtent),
            resolutions: resolutions,
            matrixIds: matrixIds,
          }),
        }),
        zIndex: 0,
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
        zoom: 12,
        maxZoom: 19,
        minZoom: 5,
        constrainResolution: true,
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

      // 加载四川省的区域地图显示。
      this.getGeoJson();

      // 加载污染地区
      this.getpolluteLayer();

      // 农用地域
      this.getfarmlandLayer();

      // 管理局
      this.getSuperviseLayer();

      // 监听事件
      this.listenEvent(this.map, "pointermove");
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
    // 添加四川省的区域
    addGeoJSON(src, strokeColor = "", fillColor = "", layerName = "geojson") {
      // 创建geojson数据来源
      var geoSourece = new VectorSource({
        features: new GeoJSON().readFeatures(src, {
          //readFeature可以重新设置坐标系
          dataProjection: "EPSG:4326", // 设定JSON数据使用的坐标系
          featureProjection: "EPSG:3857", // 设定当前地图使用的feature的坐标系
        }),
      });
      // 创建一个矢量地图图层
      const layer = new VectorLayer({
        className: layerName,
        source: geoSourece,
        style: function (feature, demo) {
          if (layerName === "province") {
            return new Style({
              stroke: new Stroke({
                color: strokeColor,
                width: 2,
              }),
            });
          } else {
            return new Style({
              stroke: new Stroke({
                color: strokeColor,
                width: 2,
              }),
              fill: new Fill({
                color: fillColor,
              }),
            });
          }
        },
      });
      return layer;
    },
    // 获取四川省区域的内容。
    getGeoJson() {
      axios.get("/show/sichuan.geojson").then((res) => {
        this.geoLayer = this.addGeoJSON(res.data, "pink", "", "province");
        this.map.addLayer(this.geoLayer);
      });
    },
    // 获取污染区域的内容
    getpolluteLayer() {
      const _this = this;
      axios.get("/show/wurandiqu.geojson").then((res) => {
        this.polluteList = res.data.features;
        this.polluteLayer = this.addGeoJSON(
          res.data,
          "rgba(255, 109, 109,1)",
          "rgba(255, 109, 109,0.3)",
          "pollute"
        );
        this.map.addLayer(this.polluteLayer);
        // 开启监听事件
        this.registerEvents(
          this.polluteLayer.getSource().getFeatures(),
          "mousemove",
          function (evt, feature) {
            // 获取关联id
            const currentId = feature.get("code");
            _this.polluteAreaActiveFeature = feature;
            feature.setStyle(
              new Style({
                fill: new Fill({
                  color: "rgba(255, 109, 109, 0.3)",
                }),
                stroke: new Stroke({
                  color: "rgba(255, 109, 109, 1)",
                  width: 5,
                }),
              })
            );
            // 关联监管单位高亮。
            const pointFeatures = _this.pointLayer.getSource().getFeatures();
            for (let i = 0; i < pointFeatures.length; i++) {
              const cId = Array.prototype.slice.call(
                pointFeatures[i].get("cId")
              );
              if (cId.includes(currentId)) {
                _this.pointActiveFeatures = pointFeatures[i];
                pointFeatures[i].setStyle(
                  new Style({
                    image: new Icon({
                      src: "/image/blueIcon.png",
                      anchor: [0.5, 60],
                      anchorOrigin: "top-right",
                      anchorXUnits: "fraction",
                      anchorYUnits: "pixels",
                      offsetOrigin: "top-right",
                      scale: 2,
                    }),
                  })
                );
                break;
              }
            }
          }
        );
      });
    },

    registerEvents(features, event, fn) {
      features.forEach((item) => {
        item.on(event, (evt) => {
          fn(evt, item);
        });
      });
    },

    // 监管单位
    getSuperviseLayer() {
      axios.get("/show/guanliju.geojson").then((res) => {
        var reader = new GeoJSON({
          defaultDataProjection: "EPSG:4326",
          featureProjection: "EPSG:3857",
        });

        this.pointLayer = new VectorLayer({
          className: "point",
        });
        var pointSourceVector = new VectorSource();
        this.pointLayer.setSource(pointSourceVector);
        this.map.addLayer(this.pointLayer);
        pointSourceVector.addFeatures(reader.readFeatures(res.data));

        // 给点设置样式。
        const features = pointSourceVector.getFeatures();
        features.forEach((item) => {
          item.setStyle(
            new Style({
              image: new Icon({
                src: "/image/blueIcon.png",
                anchor: [0.5, 60],
                anchorOrigin: "top-right",
                anchorXUnits: "fraction",
                anchorYUnits: "pixels",
                offsetOrigin: "top-right",
              }),
            })
          );
        });
      });
    },

    // 农用地区域内容
    getfarmlandLayer() {
      axios.get("/show/farmland.geojson").then((res) => {
        this.farmlandLayer = this.addGeoJSON(
          res.data,
          // "rgba(50, 224, 169, 1)",
          // "rgba(50, 224, 169, 0.3)",
          "farmland"
        );
        const farmFeature = this.farmlandLayer.getSource().getFeatures();
        const strokeColor = "rgba(50, 224, 169, 1)";
        let fillColor = "rgba(50, 224, 169, 0.3)";
        farmFeature.forEach((feature) => {
          const level = feature.get("level");
          if (level === "严格管控类") {
            fillColor = "rgba(255, 126, 0, 0.3)";
          } else if (level === "优先保护类") {
            fillColor = "rgba(228, 82, 230, 0.3)";
          }
          feature.setStyle(
            new Style({
              stroke: new Stroke({
                color: strokeColor,
                width: 2,
              }),
              fill: new Fill({
                color: fillColor,
              }),
            })
          );
        });
        this.map.addLayer(this.farmlandLayer);
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
    // 隐藏显示四川省区域
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
      const distance = getDistance(this.currentCoordinates, location);
      let duration = 3000;
      let startTime = 500;
      const _this = this;
      const zoom = this.mapView.getZoom();

      console.log("zoom", zoom);
      console.log("distance", distance);
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

      let scaleLevel = Math.ceil(distance / 100000);
      if (zoom <= 15) {
        scaleLevel = 0;
        startTime = 16;
      } else if (distance < 10000) {
        scaleLevel = 3;
        startTime = 100;
      } else if (distance >= 10000 && distance < 100000) {
        scaleLevel = 3;
        duration = 2000;
        startTime = 100;
      } else if (distance >= 100000 && distance < 300000) {
        scaleLevel = 5;
        duration = 3000;
        startTime = 500;
        this.mapView.animate(
          {
            zoom: zoom - (zoom % 10),
            duration: 500,
          },
          function () {
            _this.mapView.setZoom(zoom - (zoom % 10));
          }
        );
      } else {
        scaleLevel = 9;
        duration = 5000;
        startTime = 2000;
        this.mapView.animate(
          {
            zoom: zoom - (zoom % 10),
            duration: 2000,
          },
          function () {
            _this.mapView.setZoom(zoom - (zoom % 10));
          }
        );
      }

      setTimeout(() => {
        this.mapView.animate(
          {
            center: transform(location, "EPSG:4326", "EPSG:3857"),
            duration: duration,
          },
          callback
        );
        this.mapView.animate(
          {
            zoom: zoom - scaleLevel,
            duration: duration / 2,
          },
          {
            zoom: zoom,
            duration: duration / 2,
          },
          callback
        );
      }, startTime);

      this.currentCoordinates = location;
    },

    gotoCity(item) {
      const _this = this;
      const arr = this.polluteLayer.getSource().getFeatures();
      const theFeature = arr.filter((feature) => {
        return feature.id_ === item.id;
      });

      _this.flyTo(item.properties.center, function () {
        _this.mapView.fit(theFeature[0].getGeometry().getExtent(), {
          duration: 1000,
          // minResolution: 17,
        });
      });
    },

    isVisible(item) {
      if (item.value == "polluteLayer") {
        this.polluteLayer.setVisible(!item.visible);
      } else if (item.value === "geoLayer") {
        this.geoLayer.setVisible(!item.visible);
      } else if (item.value === "farmlandLayer") {
        this.farmlandLayer.setVisible(!item.visible);
      } else {
        this.pointLayer.setVisible(!item.visible);
      }
      item.visible = !item.visible;
    },

    /**
     * 监听事件
     */
    listenEvent(map, event) {
      const _this = this;
      map.on(event, (evt) => {
        const someFeature = map.forEachFeatureAtPixel(
          evt.pixel,
          function (feature, layer) {
            // if (layer.className_ == "pollute") {
            // 自定义事件
            feature.dispatchEvent({ type: "mousemove", event: event });
            return feature;
            // }
          }
        );
        if (someFeature) {
          // console.log("feature", feature);
        } else {
          if (_this.polluteAreaActiveFeature) {
            _this.polluteAreaActiveFeature.setStyle(
              new Style({
                fill: new Fill({
                  color: "rgba(255, 109, 109, 0.3)",
                }),
                stroke: new Stroke({
                  color: "rgba(255, 109, 109,1)",
                  width: 2,
                }),
              })
            );
            _this.polluteAreaActiveFeature = null;
          }
          if (_this.pointActiveFeatures) {
            _this.pointActiveFeatures.setStyle(
              new Style({
                image: new Icon({
                  src: "/image/blueIcon.png",
                  anchor: [0.5, 60],
                  anchorOrigin: "top-right",
                  anchorXUnits: "fraction",
                  anchorYUnits: "pixels",
                  offsetOrigin: "top-right",
                  scale: 1,
                }),
              })
            );
          }
        }
      });
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
    border-radius: 4px;
    right: 20px;
    top: 25%;
    width: 300px;
    height: 450px;
    z-index: 999;
    overflow-y: scroll;
    ul {
      // display: flex;
      height: 100%;
      // flex-direction: column;
      // justify-content: flex-start;
      // align-content: center;
      li {
        line-height: 1.8;
        // height: 15%;
        cursor: pointer;
        color: rgb(119, 193, 246);
        text-align: left;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
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
    height: 120px;
    padding: 10px 5px;
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
      }
      .active {
        color: #fff;
      }
    }
  }
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
/*滚动条的宽度*/
::-webkit-scrollbar {
  width: 4px;
}

/*滚动条里面小方块*/
::-webkit-scrollbar-thumb {
  border-radius: 2px;
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.5);
  background: white;
}

/*滚动条里面轨道*/
::-webkit-scrollbar-track {
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
  border-radius: 0;
  background: rgba(0, 0, 0, 0.1);
}
.demo {
  color: rgb(20, 164, 173);
  background-color: #1d3e53;
  // color: '#3366FF;
}
</style>
