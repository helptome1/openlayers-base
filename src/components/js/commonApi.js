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
  TileWMS,
  Image,
  ImageStatic,
  TileImage,
  WMTS,
  TileArcGISRest,
  Raster as RasterSource
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
import { get as getProjection, fromLonLat, transform, addProjection, addCoordinateTransforms } from "ol/proj";
import WMTSTileGrid from "ol/tilegrid/WMTS";

// 百度地图坐标系
import projzh from "projzh";
import { getTopLeft, getWidth, applyTransform } from "ol/extent";
// 导入axios
import axios from "axios";

// 高德坐标系需要
import Projection from "ol/proj/Projection";
import projzh_gd from "./gaodeTranslate";



/**
 * 天地图相关api
 */
const projection = getProjection('EPSG:3857');
const projectionExtent = projection.getExtent();
const size = getWidth(projectionExtent) / 256;
const resolutions = new Array(19);
const matrixIds = new Array(19);
for (let z = 0; z < 19; ++z) {
  resolutions[z] = size / Math.pow(2, z);
  matrixIds[z] = z;
}
/**
 * 加载天地图wmts协议的相关的api
 * @param {*} map 地图组件
 * @param {*} url 天地图wmts链接
 * @param {*} tk 天地图的key
 * @param {*} layerName 图层名称
 * @param {*} matrixSet 矩阵名称
 * @param {*} format 图片格式
 * @returns 
 */
function addTdtWmtsLayer(map, url, tk, layerName, matrixSet, format, opacity) {
  let source = new WMTS({
    url: `${url}${tk}`,
    layer: layerName,
    matrixSet: matrixSet,
    format: format,
    projection: projection,
    tileGrid: new WMTSTileGrid({
      origin: getTopLeft(projectionExtent),
      resolutions: resolutions,
      matrixIds: matrixIds
    }),
    style: 'default',
    wrapX: true,
  })
  let layer = new TileLayer({
    source: source,
    opacity: opacity
  })
  map.addLayer(layer);
  return layer;
}

/**
 * 自定义切片地图颜色的函数。
 * @param {*} pixelsTemp 
 */
function reverseFunc(pixelsTemp) {
  //蓝色
  for (var i = 0; i < pixelsTemp.length; i += 4) {
    var r = pixelsTemp[i];
    var g = pixelsTemp[i + 1];
    var b = pixelsTemp[i + 2];
    //运用图像学公式，设置灰度值
    var grey = r * 0.3 + g * 0.59 + b * 0.11;
    //将rgb的值替换为灰度值
    pixelsTemp[i] = grey;
    pixelsTemp[i + 1] = grey;
    pixelsTemp[i + 2] = grey;

    //基于灰色，设置为蓝色，这几个数值是我自己试出来的，可以根据需求调整
    pixelsTemp[i] = 55 - pixelsTemp[i];
    pixelsTemp[i + 1] = 255 - pixelsTemp[i + 1];
    pixelsTemp[i + 2] = 305 - pixelsTemp[i + 2];
  }
};

/**
 * 转换天地图主题颜色
 * @param {*} layer 图层
 */
function changeTheme(Tilelayer) {
  //openlayer 像素转换类，可以直接当做source使用
  const raster = new RasterSource({
    sources: [
      //传入图层
      Tilelayer,
    ],
    //这里设置为image类型，与官方示例不同，优化速度
    operationType: 'image',
    operation: function (pixels, data) {
      //执行颜色转换方法，注意，这里的方法需要使用lib引入进来才可以使用
      reverseFunc(pixels[0].data)
      return pixels[0];
    },
    //线程数量
    threads: 10,
    //允许operation使用外部方法
    lib: {
      reverseFunc: reverseFunc,
    }
  });
  //创建新图层，注意，必须使用 ImageLayer
  let layer = new ImageLayer({
    name: "天地图矢量图层",
    source: raster
  });
  // map.addLayer(layer);
  return layer;
}

/**
 * 加载OSM图层
 * @param {*} map 地图
 * @returns 图层信息
 */
function addOSMLayer() {
  let OSMLayer = new TileLayer({
    source: new OSM(),
  })
  // map.addLayer(OSMLayer)
  return OSMLayer;
}
/**
 * 添加百度地图图层
 * @param {*} map 地图
 */
function addBaiduLayer() {
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
  // 配置bd-09坐标投影。
  baiduProj();

  let source = new TileImage({
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
    crossOrigin: "anonymous",
  });
  let layer = new TileLayer({
    source: source,
  })
  // map.addLayer(layer)
  return layer
}

// 增加XYZ格式的地图服务图层
function addXYZLayer(url, projection = "EPSG:3857", zIndex = 0, opacity = 1) {
  let source = new XYZ({
    url: url,
    projection: projection,
    wrapX: true,
    // crossOrigin: 'anonymous'
  })
  let layer = new TileLayer({
    source: source,
    zIndex: zIndex,
    opacity: opacity
  })
  // map.addLayer(layer);
  return layer;
}

/**
 * 增加WMS格式的地图服务图层
 * @param {*} map 地图
 * @param {*} url 地图链接
 * @param {*} layerName 图层名称
 * @param {*} extent 加载范围
 * @returns 图层
 */
function addWMSLayer(url, layerName, extent = null) {
  let source = new TileWMS({
    url: url,
    // params: {
    //   'LAYERS': layerName,
    //   'TILED': true
    // },
    crossOrigin: 'anonymous'
  })
  let layer = new TileLayer({
    extent: extent,
    source: source
  })
  // map.addLayer(layer);
  return layer;
}

/**
 * 加载wmts服务的api
 * @param {*} map 地图
 * @param {*} url wmts服务地址
 * @returns 
 */
function addWmtsLayer(url, tk = '', layerName = '', matrixSet = '', format = '') {
  let layer = new TileLayer({
    source: new WMTS({
      url: `${url}${tk != '' ? tk : ''}`,
      layer: layerName,
      matrixSet: matrixSet,
      format: format,
      projection: projection,
      // 投影坐标系
      tileGrid: new WMTSTileGrid({
        // 获取范围的左上角坐标。
        origin: getTopLeft(projectionExtent),
        resolutions: resolutions,
        matrixIds: matrixIds,
      }),
      style: 'default',
      wrapX: true,
      // 跨域请求
      crossOrigin: "anonymous",
    }),
  })
  // map.addLayer(layer)
  return layer;
}

/**
 * 把地图添加到地图中去
 * @param {MAP} map 地图
 * @param {*} layer 图层
 */
function addLayerToMap(map, layer) {
  map.addLayer(layer)
}

/**
 * 高德地图坐标系转换函数
 */
function gaodeTranslate() {
  // 规定gcj-02的范围
  const gcj02Extent = [
    -20037508.342789244, -20037508.342789244, 20037508.342789244,
    20037508.342789244,
  ];
  // 注册一个gcj-02的投影
  const gcjMecator = new Projection({
    code: "GCJ-02",
    extent: gcj02Extent,
    units: "m",
  });
  addProjection(gcjMecator);
  // 注册坐标变换的函数,主要是为了在4326和3857坐标系和新建的gcjMecator坐标系之间建立一种坐标转换关系，
  // 当我们用传统的wgs84坐标时，系统自动映射到gcjMecator坐标系
  addCoordinateTransforms(
    "EPSG:4326",
    gcjMecator,
    projzh_gd.ll2gmerc,
    projzh_gd.gmerc2ll
  );
  addCoordinateTransforms(
    "EPSG:3857",
    gcjMecator,
    projzh_gd.smerc2gmerc,
    projzh_gd.gmerc2smerc
  );
}
/**
 * GCJ02 转换为 WGS84
 * @param lng
 * @param lat
 * @returns {*[]}
 */
function gcj02towgs84(lng, lat) {
  //定义一些常量
  const PI = 3.1415926535897932384626;
  const a = 6378245.0;  //长半轴
  const ee = 0.00669342162296594323; //扁率
  lat = +lat
  lng = +lng
  if (out_of_china(lng, lat)) {
    return [lng, lat]
  } else {
    let dlat = transformlat(lng - 105.0, lat - 35.0)
    let dlng = transformlng(lng - 105.0, lat - 35.0)
    let radlat = lat / 180.0 * PI
    let magic = Math.sin(radlat)
    magic = 1 - ee * magic * magic
    let sqrtmagic = Math.sqrt(magic)
    dlat = (dlat * 180.0) / ((a * (1 - ee)) / (magic * sqrtmagic) * PI)
    dlng = (dlng * 180.0) / (a / sqrtmagic * Math.cos(radlat) * PI)
    let mglat = lat + dlat
    let mglng = lng + dlng
    return [lng * 2 - mglng, lat * 2 - mglat]
  }
}
/**
 * 百度坐标系转换
 */
function baiduProj() {
  // let center = [108.94238, 34.26097]; //西安钟楼
  // let center = [108.964031,34.217865]; //西安大雁塔
  // let center = [116.411794, 39.9068]; //北京东单
  let extent = [72.004, 0.8293, 137.8347, 55.8271];
  let baiduMercator = new Projection({
    code: 'bd-09',
    extent: applyTransform(extent, projzh.ll2bmerc),
    units: 'm'
  });
  addProjection(baiduMercator);
  addCoordinateTransforms('EPSG:4326', baiduMercator, projzh.ll2bmerc, projzh.bmerc2ll);
  addCoordinateTransforms('EPSG:3857', baiduMercator, projzh.smerc2bmerc, projzh.bmerc2smerc);
}

/**
 * 飞行定位动画
 */


export {
  addTdtWmtsLayer,
  addWmtsLayer,
  addOSMLayer,
  addXYZLayer,
  addWMSLayer,
  addLayerToMap,
  gaodeTranslate,
  baiduProj,
  addBaiduLayer,
  changeTheme,
  gcj02towgs84
  // flyTo
}