<template>
  <div id="map" ref="map">
    <div class="title">四川省土壤环境一张图</div>
    <!-- 菜单列表 -->
    <div class="menu-list">
      <el-tabs v-model="TabActiveName" :stretch="true" class="demo-tabs">
        <el-tab-pane label="农用地块" name="first">
          <el-scrollbar height="400px">
            <span
              v-for="(item, index) in farmAreaList"
              :key="item"
              class="scrollbar-demo-item"
              :title="item.properties.name"
              :class="{
                'scrollbar-demo-item-active': index == activitySelectFarmIndex,
              }"
              @click="gotoCity(item, index)"
            >
              <img class="farm-icon" :src="useImg(item)" alt="">
              {{ item.properties.name }}
            </span>
          </el-scrollbar>
        </el-tab-pane>
        <el-tab-pane label="污染地块" name="second">
          <el-scrollbar height="400px">
            <p
              v-for="(item, index) in polluteList"
              :key="item"
              class="scrollbar-demo-item"
              :title="item.properties.name"
              :class="{
                'scrollbar-demo-item-active':
                  index == activitySelectPolluteIndex,
              }"
              @click="gotoCity(item, index)"
            >
              {{ item.properties.name }}
            </p>
          </el-scrollbar>
        </el-tab-pane>
        <el-tab-pane label="监管单位" name="third">
          <el-scrollbar height="400px">
            <p
              v-for="(item, index) in superviseList"
              :key="item"
              class="scrollbar-demo-item"
              :title="item.properties.name"
              :class="{
                'scrollbar-demo-item-active':
                  index == activitySelectCompanyIndex,
              }"
              @click="gotoCity(item, index)"
            >
              {{ item.properties.name }}
            </p>
          </el-scrollbar>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 显示与隐藏 -->
    <div class="show-list">
      <ul>
        <li
          v-for="(item, index) in layerList"
          :key="index"
          :class="{ active: item.visible }"
          @click="isVisible(item)"
          @mouseenter="showTip(index)"
          @mouseleave="showTip(index)"
        >
          <img class="show-list-img" :src="item.icon" alt="" />
          <span>
            {{ item.name }}
          </span>
          <div class="tip" v-if="index == 1 && isShowTip">
            <div>
              <img class="show-list-img" src="/image/farm-safe.png" alt="">
              优先保护类
            </div>
            <div>
              <img class="show-list-img" src="/image/farm-control1.png" alt="">
              严格管控类
            </div>
            <div>
              <img class="show-list-img" src="/image/farm-use1.png" alt="">
              安全利用类
            </div>
          </div>


          <!-- <el-switch
            v-model="item.visible"
            :active-text="item.name"
            size="small"
            :style="{
              '--el-switch-on-color': item.color,
              '--el-switch-off-color': '#dcdfe6',
            }"
          /> -->
        </li>
      </ul>
    </div>
  </div>
  <!--此处用html布局，各种样式均在css中定义好了-->
  <div id="popup" class="ol-popup">
    <a href="#" id="popup-closer" class="ol-popup-closer"></a>
    <div id="popup-content">
      <table v-if="overlayInfo && overlayInfo.Type === 'pollute'">
        <tr style="white-space: nowrap; text-align: left">
          <td>监管单位：</td>
          <td>{{ overlayInfo.Name }}</td>
        </tr>
        <tr style="white-space: nowrap; text-align: left">
          <td>地块类型：</td>
          <td>{{ overlayInfo.AreaType }}</td>
        </tr>
        <tr style="white-space: nowrap; text-align: left">
          <td>所属行业：</td>
          <td>{{ overlayInfo.Industry }}</td>
        </tr>
      </table>
      <table v-else-if="overlayInfo && overlayInfo.Type === 'company'">
        <tr style="white-space: nowrap; text-align: left">
          <td>监管单位：</td>
          <td>{{ overlayInfo.Name }}</td>
        </tr>
        <tr style="white-space: nowrap; text-align: left">
          <td>企业类型：</td>
          <td>{{ overlayInfo.EnterprisType }}</td>
        </tr>
        <tr style="white-space: nowrap; text-align: left">
          <td>监管状态：</td>
          <td>{{ overlayInfo.Status }}</td>
        </tr>
      </table>
      <div v-else>
        <img class="imgInfo" src="/image/farm.png" alt="" />
      </div>
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

// 导入相关数据
import { polluteAreaList, companyList } from "./js/data";

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
import polluteImg from "/image/pollute1.png";
import farmImg from "/image/farm-use1.png";
import farmControlImg from "/image/farm-control1.png";
import farmSafeImg from "/image/farm-safe.png";
import watchImg from "/image/watch1.png";

export default {
  data() {
    return {
      map: null,
      tiandiLayer: null,
      isShowTip: false,
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
      // tab切换页面
      TabActiveName: "first",
      x: 0,
      y: 0,
      list: [1],
      layers: [],
      overlay: null,
      projectionName: "GCJ-02",
      // 监管单位列表
      superviseList: [],
      // 农用地区列表
      farmAreaList: [],
      // 污染地区列表
      polluteList: [],
      // 当前活跃的污染区域
      polluteAreaActiveFeature: null,
      pollutePointActiveFeature: null,
      activitySelectPolluteIndex: null,
      activitySelectFarmIndex: null,
      activitySelectCompanyIndex: null,
      // 当前活跃的监管单位
      pointActiveFeatures: null,
      // 当前活跃的农用地
      farmAreaActiveFeature: null,
      farmPointActiiveFeature: null,
      farmPointImg: null,
      // 控制overlay显示隐藏开关
      overlayKey: true,
      overlayInfo: null,
      overlayInfoContent: [],
      flyFlag: true,
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
          name: "污染地块(6)",
          value: "polluteLayer",
          visible: true,
          color: "rgba(255, 109, 109,1)",
          icon: polluteImg,
        },
        {
          name: "农用地块(14)",
          value: "farmlandLayer",
          visible: true,
          color: "#32e0a9",
          icon: farmImg,
        },
        {
          name: "重点监管单位(13)",
          value: "superviseLayer",
          visible: true,
          color: "#20a2f4",
          icon: watchImg,
        },
      ],

      tiandituLink: {
        vec_c: ".tianditu.gov.cn/vec_c/wmts?tk=",
        vec_w: ".tianditu.gov.cn/vec_w/wmts?tk=",
        cva_c: ".tianditu.gov.cn/cva_c/wmts?tk=",
        cva_w: ".tianditu.gov.cn/cva_w/wmts?tk=",
        // 影响地图
        img_c: ".tianditu.gov.cn/img_c/wmts?tk=",
        img_w: ".tianditu.gov.cn/img_w/wmts?tk=",
        cia_c: ".tianditu.gov.cn/cia_c/wmts?tk=",
        cia_w: ".tianditu.gov.cn/cia_w/wmts?tk=",
        ter_c: ".tianditu.gov.cn/ter_c/wmts?tk=",
        ter_w: ".tianditu.gov.cn/ter_w/wmts?tk=",
        cta_c: ".tianditu.gov.cn/cta_c/wmts?tk=",
        cta_w: ".tianditu.gov.cn/cta_w/wmts?tk=",
      },
      tiandiTuTk: import.meta.env.VITE_TIANDITU_TK,
      // 演示使用
      // tiandiTuTk: "df269ecc24afb3eec74690c2cfe0fd44",
      // shice
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
        zIndex: 0,
        opacity: 1,
      });
      return AmapLayer;
    },
    addGoogleLayer() {
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
          url: "http://gac-geo.googlecnapps.cn/maps/vt?lyrs=s,h&hl=zh-CN&gl=CN&x={x}&y={y}&z={z}&src=app&scale=2",
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
          url: "http://t" + 1 + this.tiandituLink.cia_w + this.tiandiTuTk,
          layer: "cia",
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
      });
      return layer;
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
          url: "http://t" + 0 + this.tiandituLink.img_w + this.tiandiTuTk,
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
      // console.log("TK:",import.meta.env.VITE_TIANDITU_TK)
      // 高德坐标系注册
      gaodeTranslate();
      // 添加高德地图
      this.AmapLayer = this.addAmapLayer();
      // 添加天地图
      this.tiandiLayer = this.addTianduLayer();
      const tiandituLayer = this.addTianDiLayer();

      const googleMapLayer = this.addGoogleLayer();
      this.mapView = new View({
        center: transform([104.065735, 30.659462], "EPSG:4326", "EPSG:3857"),
        // center: transform([108.9421, 34.2244], "EPSG:4326", "GCJ-02"),
        projection: "GCJ-02",
        // projection: "EPSG:3857",
        zoom: 8,
        maxZoom: 19,
        minZoom: 2,
        constrainResolution: true,
      });
      const layers = [
        // this.tiandiLayer,
        // this.AmapLayer,
        googleMapLayer,
        // tiandituLayer,
      ];
      // 创建一个overlay提示
      this.overlay = new Overlay({
        element: document.getElementById("popup"),
        positioning: "center-left",
        offset: [15, 0],
      });
      // 使用ol.Map来创建地图
      this.map = new olMap({
        // 地图图层
        // layers: this.layers,
        layers: layers,
        // 设置显示地图的视图
        view: this.mapView,
        overlays: [this.overlay],
        target: "map",
        controls: new defaultControls({
          attribution: false,
          rotate: false,
          zoom: false,
        }),
      });

      // 加载四川省的区域地图显示。
      this.getGeoJson();

      // 加载污染地区
      this.getpolluteLayer();

      // 农用地域
      this.getfarmlandLayer();

      // 管理局
      this.getSuperviseLayer();

      // 弹窗取消
      this.closerClick(this.overlay);

      // 监听事件
      this.listenEvent(this.map, "pointermove", this.overlay);
    },
    // 注册弹窗取消事件
    closerClick(overlay) {
      const _this = this;
      const closer = document.getElementById("popup-closer");
      closer.onclick = function () {
        overlay.setPosition(undefined);
        _this.overlayKey = true;
        // 取消污染区域高亮
        _this.polluteAreaActiveFeature &&
          _this.polluteAreaFeatureSetStyle(_this.polluteAreaActiveFeature, 2);
        _this.farmAreaActiveFeature &&
          _this.farmAreaFeatureSetStyle(_this.farmAreaActiveFeature, 2);
        closer.blur();
        return false;
      };
    },

    /**
     * 创建一个活动图标需要的feature，并设置位置。
     */
    addPoint(
      layer,
      imgSrc,
      coordinate,
      scale,
      pointName,
      offset = [0, 0],
      linkFeatureId = ""
    ) {
      // 创建一个活动图标需要的Feature，并设置位置
      const activity = new Feature({
        geometry: new Point(transform(coordinate, "EPSG:4326", "EPSG:3857")),
        name: pointName,
        linkFeatureId: linkFeatureId,
      });
      // 设置Feature的样式，
      activity.setStyle(
        new Style({
          image: new Icon({
            src: imgSrc,
            anchor: [0.5, 60],
            anchorOrigin: "top-right",
            anchorXUnits: "fraction",
            anchorYUnits: "pixels",
            offsetOrigin: "top-left",
            offset: offset,
            scale: scale,
          }),
        })
      );
      layer.getSource().addFeature(activity);
    },
    // 添加四川省的区域
    addGeoJSON(
      src,
      strokeColor = "",
      fillColor = "",
      layerName = "geojson",
      zIndex = 1
    ) {
      // 创建geojson数据来源
      const geoSourece = new VectorSource({
        features: new GeoJSON().readFeatures(src, {
          //readFeature可以重新设置坐标系
          dataProjection: "EPSG:4326", // 设定JSON数据使用的坐标系
          featureProjection: "EPSG:3857", // 设定当前地图使用的feature的坐标系
        }),
        // projection: "GCJ-02",
      });
      // 创建一个矢量地图图层
      const layer = new VectorLayer({
        className: layerName,
        source: geoSourece,
        projection: "GCJ-02",
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
        zIndex: zIndex,
      });
      return layer;
    },
    // 获取四川省区域的内容。
    getGeoJson() {
      axios.get("/show/sichuan.geojson").then((res) => {
        this.geoLayer = this.addGeoJSON(res.data, "pink", "", "province", 1);
        this.map.addLayer(this.geoLayer);
      });
    },
    // 获取污染区域的内容
    getpolluteLayer() {
      const _this = this;
      axios.get("/show/polluteArea.json").then((res) => {
        _this.polluteList = res.data.features;
        _this.polluteLayer = this.addGeoJSON(
          res.data,
          "rgba(255, 109, 109,1)",
          "rgba(255, 109, 109,0.3)",
          "pollute",
          2
        );
        _this.map.addLayer(this.polluteLayer);
        // 添加锚点
        _this.polluteList.forEach((item) => {
          _this.addPoint(
            _this.polluteLayer,
            polluteImg,
            item.properties.center,
            0.8,
            "pollutePoint",
            [-15, 0],
            item.properties.code
          );
        });
        // 添加地图标记点
        // 开启监听事件
        this.registerEvents(
          this.polluteLayer.getSource().getFeatures(),
          "mousemove",
          (evt, feature) => {
            let polluteAreaInfo = null;
            const featureName = feature.get("name");
            if (featureName != "pollutePoint") {
              // 获取关联id
              const currentId = feature.get("code");
              polluteAreaInfo = polluteAreaList.filter((item) => {
                if (item.No == currentId) return item;
              });
              _this.polluteAreaActiveFeature = feature;
              _this.polluteAreaFeatureSetStyle(feature, 5);
            } else {
              _this.pollutePointActiveFeature = feature;
              const linkFeatureId = feature.get("linkFeatureId");
              polluteAreaInfo = polluteAreaList.filter((item) => {
                if (item.No == linkFeatureId) return item;
              });
              // 高亮旗帜
              _this.flagFeatureSetStyle(feature, 1.1, polluteImg,[-15, 0]);
            }
            // 给overInfo传值。
            _this.overlayInfo = polluteAreaInfo[0];

            var coordinate = evt.evt.coordinate;
            const content = document.getElementById("popup-content");
            _this.overlay.setPosition(coordinate);

            // 关联监管单位高亮。
            // const pointFeatures = _this.superviseLayer.getSource().getFeatures();
            // for (let i = 0; i < pointFeatures.length; i++) {
            //   const cId = Array.prototype.slice.call(
            //     pointFeatures[i].get("cId")
            //   );
            //   if (cId.includes(currentId)) {
            //     _this.pointActiveFeatures = pointFeatures[i];
            //     pointFeatures[i].setStyle(
            //       new Style({
            //         image: new Icon({
            //           src: "/image/blueIcon.png",
            //           anchor: [0.5, 60],
            //           anchorOrigin: "top-right",
            //           anchorXUnits: "fraction",
            //           anchorYUnits: "pixels",
            //           offsetOrigin: "top-right",
            //           scale: 2,
            //         }),
            //       })
            //     );
            //     break;
            //   }
            // }
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
      const _this = this;
      axios.get("/show/guanliju.geojson").then((res) => {
        this.superviseList = res.data.features;
        var reader = new GeoJSON({
          defaultDataProjection: "EPSG:4326",
          featureProjection: "EPSG:3857",
        });

        this.superviseLayer = new VectorLayer({
          className: "point",
          zIndex: 4,
        });
        var pointSourceVector = new VectorSource();
        this.superviseLayer.setSource(pointSourceVector);
        this.map.addLayer(this.superviseLayer);
        pointSourceVector.addFeatures(reader.readFeatures(res.data));

        // 给点设置样式。
        const features = pointSourceVector.getFeatures();
        features.forEach((item) => {
          _this.flagFeatureSetStyle(item, 0.8, watchImg);
        });

        // 添加自定义事件
        this.registerEvents(features, "mousemove", (evt, feature) => {
          const currentId = feature.get("code");
          const companyInfo = companyList.filter((item) => {
            if (item.ContaminatedPlot == currentId) return item;
          });
          _this.overlayInfo = companyInfo[0];
          _this.pointActiveFeatures = feature;
          _this.flagFeatureSetStyle(feature, 1.1, watchImg);
          var coordinate = evt.evt.coordinate;
          const content = document.getElementById("popup-content");
          _this.overlay.setPosition(coordinate);
        });
      });
    },

    // 农用地区域内容
    getfarmlandLayer() {
      const _this = this;
      axios.get("/show/farmland2.geojson").then((res) => {
        _this.farmAreaList = res.data.features;
        _this.farmlandLayer = _this.addGeoJSON(
          res.data,
          "rgba(50, 224, 169, 1)",
          "rgba(50, 224, 169, 0.3)",
          "farmland",
          3
        );
        this.map.addLayer(this.farmlandLayer);

        const farmFeatures = _this.farmlandLayer.getSource().getFeatures();
        const strokeColor = "rgba(50, 224, 169, 1)";
        let fillColor = "rgba(50, 224, 169, 0.3)";
        farmFeatures.forEach((feature) => {
          const level = feature.get("level");
          const center = feature
            .getGeometry()
            .getInteriorPoint()
            .getCoordinates();
          let imgSrc = farmImg;
          if (level === "1") {
            fillColor = "rgba(228, 82, 230, 0.3)";
            imgSrc = farmControlImg;
          } else if (level === "2") {
            fillColor = "rgba(255, 126, 0, 0.3)";
            imgSrc = farmSafeImg;
          } else {
            fillColor = "rgba(50, 224, 169, 0.3)";
            imgSrc = farmImg;
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

          _this.addPoint(
            _this.farmlandLayer,
            imgSrc,
            transform(center, "EPSG:3857", "EPSG:4326"),
            1,
            "farmPoint",
            [-15, 0]
          );
        });

        // 开启监听事件
        this.registerEvents(
          _this.farmlandLayer.getSource().getFeatures(),
          "mousemove",
          (evt, feature) => {
            const featureName = feature.get("name");
            if ("farmPoint" != featureName) {
              _this.farmAreaFeatureSetStyle(feature, 5);
              _this.farmAreaActiveFeature = feature;
            } else {
              const style = feature.getStyle();
              _this.farmPointImg = style.getImage().iconImage_.src_;
              _this.farmPointActiiveFeature = feature;
              _this.flagFeatureSetStyle(
                feature,
                1.1,
                _this.farmPointImg,
                [-15, 0]
              );
            }
            var coordinate = evt.evt.coordinate;
            const content = document.getElementById("popup-content");

            _this.overlay.setPosition(coordinate);
            // _this.overlay.setPositioning('center-right');
          }
        );
      });
    },

    updateFeature() {
      this.pointLayer.getSource().clear();
      this.geoLayer.getSource().clear();

      this.getGeoJson(); //加载geojson图层
      this.addPoint();
      // this.mapView.setZoom(13);
    },

    // 隐藏显示四川省区域
    checkVector(elem) {
      this.geoLayer.setVisible(elem.target.checked);
    },

    // 飞行动画
    flyTo(location, done) {
      const distance = getDistance(this.currentCoordinates, location);
      let duration = 2000;
      let startTime = 500;
      const _this = this;
      const zoom = this.mapView.getZoom();
      const endZoom = 15;
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

      let scaleLevel = 2;

      if (distance > 10000 && distance < 30000) {
        scaleLevel = zoom - 10;
      } else if (distance >= 30000 && distance < 500000) {
        scaleLevel = zoom - 9;
      } else if (distance >= 500000) {
        scaleLevel = zoom - 7;
      }

      this.mapView.animate(
        {
          zoom: zoom - scaleLevel,
          duration: duration / 2,
        },
        callback
      );
      setTimeout(() => {
        this.mapView.animate(
          {
            center: transform(location, "EPSG:4326", "EPSG:3857"),
            duration: duration,
          },
          callback
        );
      }, duration / 2);
      setTimeout(() => {
        this.mapView.animate(
          {
            zoom: endZoom,
            duration: duration / 2,
          },
          callback
        );
      }, duration * 1.5);

      this.currentCoordinates = location;
    },

    gotoCity(item, index) {
      const _this = this;
      // 控制不让overlay消失
      _this.overlayKey = false;
      _this.overlayInfo = null;
      _this.overlay.setPosition(undefined);
      if (_this.flyFlag) {
        // 控制动画打断
        _this.flyFlag = false;

        switch (item.properties.type) {
          // 农用地区
          case "farm":
            _this.activitySelectFarmIndex = index;
            // 高亮农用地区
            const farmFeatures = _this.farmlandLayer.getSource().getFeatures();
            const theFarmFeature = farmFeatures.filter((feature) => {
              return feature.id_ === item.id;
            });

            if (theFarmFeature[0]) {
              _this.farmAreaFeatureSetStyle(theFarmFeature[0], 5);
              _this.farmAreaActiveFeature = theFarmFeature[0];
            }
            break;

          // 监管单位
          case "company":
            _this.activitySelectCompanyIndex = index;
            // 拿到监管单位的信息
            const companyInfo = companyList.filter((company) => {
              if (company.ContaminatedPlot === item.properties.code)
                return item;
            });
            // 控制监管单位的点样式变化.
            const companyFeatures = _this.superviseLayer
              .getSource()
              .getFeatures();
            const theCompanyFeature = companyFeatures.filter((feature) => {
              return feature.id_ === item.id;
            });
            _this.pointActiveFeatures = theCompanyFeature[0];
            // 图标大小变化
            _this.flagFeatureSetStyle(theCompanyFeature[0], 0.8, watchImg);
            _this.overlayInfo = companyInfo[0];
            break;

          // 污染地区
          default:
            _this.activitySelectPolluteIndex = index;
            // 处理污染物点击高亮。
            const polluteFeatures = this.polluteLayer.getSource().getFeatures();
            const thePolluteFeature = polluteFeatures.filter((feature) => {
              return feature.id_ === item.id;
            });
            if (thePolluteFeature.length > 0) {
              _this.polluteAreaFeatureSetStyle(thePolluteFeature[0], 5);
              _this.polluteAreaActiveFeature = thePolluteFeature[0];
              // 从数据列表中拿到数据
              const currentId = thePolluteFeature[0].get("code");
              const polluteAreaInfo = polluteAreaList.filter((item) => {
                if (item.No == currentId) return item;
              });
              _this.overlayInfo = polluteAreaInfo[0];
            }
            break;
        }
        const coordinate = item.properties.center ?? item.geometry.coordinates;
        // 飞跃
        _this.flyTo(coordinate, function () {
          _this.flyFlag = true;
          _this.overlay.setPosition(
            transform(coordinate, "EPSG:4326", "EPSG:3857")
          );
        });
      }
    },

    isVisible(item) {
      if (item.value == "polluteLayer") {
        this.polluteLayer.setVisible(!item.visible);
      } else if (item.value === "geoLayer") {
        this.geoLayer.setVisible(!item.visible);
      } else if (item.value === "farmlandLayer") {
        this.farmlandLayer.setVisible(!item.visible);
      } else {
        this.superviseLayer.setVisible(!item.visible);
      }
      item.visible = !item.visible;
      this.mapView.animate({
        zoom: 8,
        center: transform([104.065735, 30.659462], "EPSG:4326", "EPSG:3857"),
        duration: 2000,
      });
    },

    // 污染地区设置颜色
    polluteAreaFeatureSetStyle(feature, width) {
      feature.setStyle(
        new Style({
          fill: new Fill({
            color: "rgba(255, 109, 109, 0.3)",
          }),
          stroke: new Stroke({
            color: "rgba(255, 109, 109,1)",
            width: width,
          }),
        })
      );
      // this.polluteAreaActiveFeature = null
    },
    // 农用地区颜色设置
    farmAreaFeatureSetStyle(feature, width) {
      const style = feature.getStyle();
      const strokeStyle = style.getStroke();
      const FillStyle = style.getFill();
      feature.setStyle(
        new Style({
          stroke: new Stroke({
            color: strokeStyle.color_,
            width: width,
          }),
          fill: new Fill({
            color: FillStyle.color_,
          }),
        })
      );
      // this.farmAreaActiveFeature = null
    },
    // 标记大小变化
    flagFeatureSetStyle(feature, scale, src, offset = [0, 0]) {
      feature.setStyle(
        new Style({
          image: new Icon({
            src: src,
            anchor: [0.5, 60],
            anchorOrigin: "top-right",
            anchorXUnits: "fraction",
            anchorYUnits: "pixels",
            offsetOrigin: "top-left",
            offset: offset,
            scale: scale,
          }),
        })
      );
    },

    /**
     * 监听事件
     */
    listenEvent(map, event, overlay) {
      const _this = this;
      map.on(event, (evt) => {
        if (_this.overlayKey) {
          const someFeature = map.forEachFeatureAtPixel(
            evt.pixel,
            function (feature, layer) {
              // 自定义事件
              feature.dispatchEvent({
                type: "mousemove",
                event: event,
                evt: evt,
              });
              return feature;
            }
          );
          if (someFeature) {
            // console.log("somneFeature", someFeature);
          } else {
            // 如果有选中的polluteLayer
            if (_this.polluteAreaActiveFeature) {
              _this.polluteAreaFeatureSetStyle(
                _this.polluteAreaActiveFeature,
                2
              );
              _this.polluteAreaActiveFeature = null;
            }
            if (_this.pointActiveFeatures) {
              _this.flagFeatureSetStyle(_this.pointActiveFeatures, 0.8, watchImg);
              _this.pointActiveFeatures = null;
            }
            // 如果有选中的farmArea
            if (_this.farmAreaActiveFeature) {
              _this.farmAreaFeatureSetStyle(_this.farmAreaActiveFeature, 2);
              _this.farmAreaActiveFeature = null;
            }

            // 如果有选中的农用地falg
            if (_this.farmPointActiiveFeature) {
              _this.flagFeatureSetStyle(
                _this.farmPointActiiveFeature,
                0.8,
                _this.farmPointImg,
                [-15, 0]
              );
              _this.farmPointActiiveFeature = null;
            }
            // 如果选中了污染地块的flag
            if (_this.pollutePointActiveFeature) {
              _this.flagFeatureSetStyle(
                _this.pollutePointActiveFeature,
                1,
                polluteImg,
                [-15, 0]
              );
            }

            // 取消弹窗
            _this.overlay.setPosition(undefined);
            _this.overlayInfo = null;
          }
        }
      });
    },

    useImg(item) {
      const level = item.properties.level
      if(level === "1") return farmControlImg
      if(level === "2") return farmSafeImg
      if(level === "3") return farmImg
    },
    showTip(index) {
      if(index === 1) {
        this.isShowTip = !this.isShowTip
      }
    }
  },
  mounted() {
    this.initMap(); //初始化地图
  },
  computed: {

  },
};
</script>
<style lang="less">
#map {
  position: absolute;
  width: 100%;
  height: 100%;
  .title {
    position: absolute;
    background-color: rgba(8, 18, 28, 0.5);
    z-index: 9;
    top: 20px;
    font-size: 36px;
    padding: 5px 10px 5px 18px;
    letter-spacing: 8px;
    font-weight: 700;
    border-radius: 5px;
    left: 50%;
    color: #fff;
    transform: translateX(-50%);
  }

  .menu-list {
    position: absolute;
    background-color: rgba(8, 18, 28, 0.7);
    left: 20px;
    top: 28%;
    z-index: 999;
    width: 280px;
    padding: 10px 10px;
    border-radius: 8px;
    transition: all 0.5s;
    .farm-icon {
      width: 18px;
      margin-right: 5px;
    }
    ul {
      height: 100%;
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
  .scrollbar-demo-item {
    display: flex;
    align-items: center;
    line-height: 1.5;
    margin: 10px;
    text-align: left;
    font-size: 16px;
    border-radius: 4px;
    color: #bbb;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    cursor: pointer;
    &:hover {
      color: #fff;
    }
  }
  .scrollbar-demo-item-active {
    color: #409eff;
  }

  .show-list {
    position: absolute;
    left: 20px;
    top: 11%;
    width: 280px;
    // height: 130px;
    padding: 10px 15px;
    background-color: rgba(8, 18, 28, 0.7);
    z-index: 999;
    border-radius: 8px;
    ul {
      display: flex;
      flex-direction: column;
      justify-content: flex-start;

      li {
        line-height: 1.8;
        height: 15%;
        text-align: left;
        cursor: pointer;
        color: #bbb;
        .show-list-img {
          width: 18px;
          margin-right: 5px;
          vertical-align: text-bottom;
        }
        .tip {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          right: 5px;
          // background-color: black;
        }
      }

      .active {
        color: #fff;
      }
    }
  }
}
.el-switch--large .el-switch__label * {
  font-size: 18px;
}
.el-switch {
  line-height: 1.5;
}

.ol-popup {
  background-color: black !important;
  opacity: 0.8;
  color: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
  padding: 10px;
  border-radius: 10px;
  bottom: 12px;
  left: -50px;
  min-width: 280px;

  .imgInfo {
    width: 400px;
  }
}

.ol-popup:after,
.ol-popup:before {
  top: 50%;
  border: solid transparent;
  content: " ";
  height: 0;
  width: 0;
  transform: translateY(-50%);
  position: absolute;
  pointer-events: none;
}

// .ol-popup:after {
//   border-top-color: white;
//   border-width: 10px;
//   left: 48px;
//   margin-left: -10px;
// }

.ol-popup:before {
  border-right-color: #cccccc;
  border-width: 11px;
  left: -11px;
  margin-left: -11px;
}

.ol-popup-closer {
  text-decoration: none;
  position: absolute;
  top: 1px;
  right: 6px;
  color: #fff;
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
.el-switch__label {
  color: #ccc;
  font-size: 18px;
}
.el-switch__label.is-active {
  color: #fff;
}
</style>
