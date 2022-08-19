<template>
  <div id="map" ref="map"></div>

  <!--此处用html布局，各种样式均在css中定义好了-->
  <div id="popup" class="ol-popup">
    <a href="#" id="popup-closer" class="ol-popup-closer"></a>
    <div id="popup-content"></div>
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
  WMTS,
} from "ol/source";
import { Map as olMap, View, Feature, Overlay } from "ol";
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

import * as olEvents from "ol/events";

import TileGrid from "ol/tilegrid/TileGrid";
//
import * as olCoordinate from "ol/coordinate";
// 选中图层交互
import { Select as InteractionSelect } from "ol/interaction";

import { pointerMove } from "ol/events/condition";

// 导入axios
import axios from "axios";

import {
  gaodeTranslate,
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
      gaodeTranslate();
      // 地图设置中心，设置到成都，在本地离线地图 offlineMapTiles刚好有一张zoom为4的成都瓦片
      var center = transform([0, 0], "EPSG:4326", "EPSG:3857");
      // 计算图片映射到地图上的范围，保持比例的情况下。 放大1000倍 除以2 让图片中心点和地图中心点重合
      var extent = [
        center[0] - (1030 * 1000) / 2,
        center[1] - (536 * 1000) / 2,
        center[0] + (1030 * 1000) / 2,
        center[1] + (536 * 1000) / 2,
      ];

      this.layers = [
        // 静态图片图层
        // new ImageLayer({
        //   source: new ImageStatic({
        //     url: '../../public/image/产业地图.png',
        //     imageExtent: extent
        //   })
        // })
        // OSM静态地图图层
        new TileLayer({ source: new OSM() }),
        // geoJson图层
      ];
      // 创建一个overlay提示
      this.overlay = new Overlay({
        element: document.getElementById("popup"),
        positioning: "center-left",
        // autoPan: true,
        // autoPanAnimation: {
        //   duration: 250,
        // },
      });
      // 使用ol.Map来创建地图
      this.map = new olMap({
        // 地图图层
        layers: this.layers,
        // 设置显示地图的视图
        view: new View({
          center: fromLonLat([108.94681668, 34.26982767]),
          zoom: 5,
        }),
        overlays: [this.overlay],
        target: "map",
      });
      this.listenEvent(this.map, this.overlay);
      // 弹窗取消
      this.closerClick(this.overlay);
      this.addGeoJSON("");
      this.addPoint();

      // 注册点击交互事件。
      // Select的默认事件是singleClick
      const _this = this;
      // this.map.addInteraction(
      //   new InteractionSelect({
      //     condition: pointerMove, // 唯一的不同之处，设置鼠标移到feature上就选取
      //     style: new Style({
      //       image: new CircleStyle({
      //         radius: 10,
      //         fill: new Fill({
      //           color: "red",
      //         }),
      //       }),
      //     }),
      //   })
      // );
      var selectSingleClick = new InteractionSelect({});
      this.map.addInteraction(selectSingleClick);
      selectSingleClick.on("select", function (event) {
        console.log("event", event);
        const features = _this.pointLayer.getSource().getFeatures();
        features.forEach((item) => {
          // console.log("item",item)
          item.setStyle(
            new Style({
              image: new CircleStyle({
                radius: 10,
                fill: new Fill({
                  color: "blue",
                }),
              }),
            })
          );
        });
        // console.log("demo")
      });
    },
    // 注册弹窗取消事件
    closerClick(overlay) {
      const closer = document.getElementById("popup-closer");
      closer.onclick = function () {
        overlay.setPosition(undefined);
        closer.blur();
        return false;
      };
    },
    addGeoJSON(src) {
      // 创建geojson数据来源
      console.log(1)
      var geoSourece = new VectorSource({
        // 写法1
        // features: new GeoJSON().readFeatures(src, {
        //   //readFeature可以重新设置坐标系
        //   dataProjection: "EPSG:4326", // 设定JSON数据使用的坐标系
        //   featureProjection: "EPSG:3857", // 设定当前地图使用的feature的坐标系
        // }),
        // 写法2
        url: "/show/sichuandaxue.geojson",
        projection: "EPSG:3857",
        format: new GeoJSON(),
      });
      // 创建一个矢量地图图层
      var geoLayer = new VectorLayer({
        source: geoSourece,
        projection: "GCJ-02",
        // 设置样式，边框和填充
        style: function (feature, demo) {
          return new Style({
            stroke: new Stroke({
              color: "green",
              width: 2,
            }),
            // fill: new Fill({
            //   color: "red",
            //   color: feature.get("COLOR"),
            // }),
          });
        },
      });
      this.map.addLayer(geoLayer);
    },
    // 穿件一个overlay提示
    overlayInfo() {
      this.overlay = new Overlay({
        element: this.$refs.popup,
        autoPan: true,
        autoPanAnimation: {
          duration: 250,
        },
      });
    },
    // 使用axios获取数据
    getGeoJson() {
      // axios.get("../../public/json/data.geojson").then((res) => {});
      axios.get("/show/sichuandaxue.geojson").then((res) => {
        this.addGeoJSON(res.data);
      });
      // axios
      //   .get("https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json")
      //   .then((res) => {});
    },
    /**
     * 监听事件
     */
    listenEvent(map, overlay) {
      const _this = this;
      map.on("pointermove", function (evt) {
        var feature = map.forEachFeatureAtPixel(
          evt.pixel,
          function (feature, layer) {
            return feature;
          }
        );
        const features = _this.pointLayer.getSource().getFeatures();
        // console.log("feature", feature.get("CITY"));
        // 获取当前点击坐标，并设置到HTML元素上去
        if (feature) {
          var coordinate = evt.coordinate;
          var hdms = olCoordinate.toStringHDMS(
            transform(coordinate, "EPSG:3857", "EPSG:4326")
          );
          const content = document.getElementById("popup-content");
          // 设置overlay的位置，从而显示在鼠标点击处
          content.innerHTML = `
          <h3>您点击的城市是：${feature.get("CITY")}</h3>
          <p>You clicked here:</p><code>${hdms}</code>
          `;
          overlay.setPosition(coordinate);

          // features.forEach((item) => {
          //   // console.log("item",item)
          //   item.setStyle(
          //     new Style({
          //       image: new CircleStyle({
          //         radius: 50,
          //         fill: new Fill({
          //           color: "green",
          //         }),
          //       }),
          //     })
          //   );
          // });
        } else {
          console.log("cancel");
          // 取消弹窗
          _this.overlay.setPosition(undefined);

          features.forEach((item) => {
            // console.log("item",item)
            item.setStyle(
              new Style({
                image: new CircleStyle({
                  radius: 50,
                  fill: new Fill({
                    color: "rgba(8, 18, 28, 0.7)",
                  }),
                }),
              })
            );
          });
        }
      });
    },
    // 打点
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
        name: "My Polygon",
        CITY: "成都",
      });
      // 设置Feature的样式，
      activity.setStyle(
        new Style({
          image: new CircleStyle({
            // src: "/image/blueIcon.png",
            anchor: [0.5, 60],
            anchorOrigin: "top-right",
            anchorXUnits: "fraction",
            anchorYUnits: "pixels",
            offsetOrigin: "top-right",
            // scale: 1,
            radius: 10,
            fill: new Fill({
              color: "rgba(8, 18, 28, 0.7)",
            }),
            // stroke: new Stroke({
            //   color: "red",
            //   size: 50,
            // }),
          }),
        })
      );
      this.pointLayer.getSource().addFeature(activity);
      this.map.addLayer(this.pointLayer);
    },
  },
  mounted() {
    this.initMap(); //初始化地图
    this.getGeoJson(); //加载geojson图层
    // this.overlayInfo();

    // this.addClusterLayerToMap();
    // 开启监听事件
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
