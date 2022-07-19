<template>
  <div id="Map" ref="map"></div>
</template>

<script>
import "ol/ol.css";
import VectorSource from "ol/source/Vector";
import { Tile as TileLayer, Heatmap as HeatmapLayer } from "ol/layer";
import XYZ from "ol/source/XYZ";
import { Map, View, Feature } from "ol";
import { Point } from "ol/geom";
import { defaults as defaultControls } from "ol/control";
import { fromLonLat } from "ol/proj";
 
export default {
    data() {
        return {
            map: null,
        };
    },
    methods: {
        /**
        * 初始化地图
        */
        initMap() {
            // 使用ol.Map来创建地图
            this.map = new Map({
                // 挂载对象id
                target: "Map",
                controls: defaultControls({
                    zoom: true,
                }).extend([]),
                // 从数据源获取数据的轻量级容器，图层。这只是一个图层。可以叠加很多图层来达到我们想要的效果
                // 设置地图图层
                layers: [
                    // 创建一个使用Open Street Map地图源的瓦片图层
                    // new ol.layer.Tile({source: new ol.source.OSM()}),
                    new TileLayer({
                        source: new XYZ({
                            url:"http://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}",
                        }),
                    }),
                ],
                // 
                view: new View({
                    center: fromLonLat([104.065735, 30.659462]),
                    zoom: 6.5,
                    maxZoom: 19,
                    minZoom: 5,
                }),
            });
        },
        /**
        * 添加热力图
        */
        addHeatMap() {
            let colors = ["#2200FF", "#16D9CC", "#4DEE12", "#E8D225", "#EF1616"];
            let hatmapData = [
                { name: "成都市" },
                { name: "成都市" },
                { name: "成都市" },
                { name: "成都市" },
                { name: "绵阳市" },
                { name: "广安市" },
                { name: "雅安市" },
                { name: "自贡市" },
                { name: "自贡市" },
                { name: "自贡市" },
                { name: "自贡市" },
                { name: "自贡市" },
                { name: "自贡市" },
                { name: "自贡市" },
                { name: "宜宾市" },
                { name: "甘孜藏族自治州市" },
            ];
            let codeList = {
                成都市: { center: { lng: 104.061902, lat: 30.609503 } },
                广安市: { center: { lng: 106.619126, lat: 30.474142 } },
                绵阳市: { center: { lng: 104.673612, lat: 31.492565 } },
                雅安市: { center: { lng: 103.031653, lat: 30.018895 } },
                自贡市: { center: { lng: 104.797794, lat: 29.368322 } },
                宜宾市: { center: { lng: 104.610964, lat: 28.781347 } },
                甘孜藏族自治州市: {
                    center: { lng: 101.592433, lat: 30.426712 },
                },
            };
 
            this.layer = new HeatmapLayer({
                source: new VectorSource(),
                blur: 30,
                radius: 15,
                gradient: colors,
            });
            this.map.addLayer(this.layer);
            this.AppendFeatures(hatmapData, colors, codeList, 50);
        },
        /**
        * 增加要素至热力图
        */
        AppendFeatures(hatmapData, colors, points, max) {
            for (var i in hatmapData) {
                if (points[hatmapData[i].name]) {
                    var coords = points[hatmapData[i].name];
                    this.max = max;
                    var f = new Feature({
                        geometry: new Point(
                            fromLonLat([coords.center.lng, coords.center.lat])
                        ),
                    });
                    this.layer.getSource().addFeature(f);
                }
            }
        },
    },
    mounted() {
        this.initMap(); //初始化地图
        this.addHeatMap(); //添加热力图数据
    },
};
</script>
<style lang="less" scoped>
  #Map {
    width: 100%;
    height: 900px;
  }
</style>