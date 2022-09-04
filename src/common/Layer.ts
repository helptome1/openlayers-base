import BaseLayer from 'ol/layer/Base'
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer'
import { OSMSource, googleSource, VectorSourceCustom } from './Source'

import TileSource from 'ol/source/Tile'
import Style from 'ol/style/Style'
import Stroke from 'ol/style/Stroke'
import Fill from 'ol/style/Fill'
import Icon from 'ol/style/Icon'
import { Feature, Map } from 'ol'
import { getCenter } from 'ol/extent'

import axios from 'axios'

import watchImg from '/images/watch1.png'
import farmImg from '/images/farm-use1.png'
import farmControlImg from '/images/farm-control1.png'
import farmSafeImg from '/images/farm-safe.png'
import VectorSource from 'ol/source/Vector'

// TileLayer
function createTileLayer(source: TileSource, zIndex) {
  return new TileLayer({
    source: source,
    zIndex: zIndex
  })
}

// VectorLayer
function createVectorLayer(VectorName = 'geojson', src: any, strokeColor = '', fillColor = '', zIndex = 1) {
  const layer = new VectorLayer({
    properties: {
      name: VectorName
    },
    source: VectorSourceCustom(src),
    opacity: 1,
    zIndex: zIndex,
    style: VectorStyle(VectorName, strokeColor, fillColor)
  })
  return layer
}

function requestData(url: string, fn: Function) {
  axios.get(url).then((res) => {
    const layer = fn(res)
    return layer
  })
}

// VectorStyle
function VectorStyle(VectorName: string, strokeColor: string, fillColor: string) {
  return function () {
    switch (VectorName) {
      case 'province':
        return StrokeStyle(strokeColor)
      case 'pollute':
        return StrokeStyle(strokeColor).concat(fillStyle(fillColor))
      case 'supervise':
        return pointStyle(watchImg, 0.8)
      case 'farmland':
        return StrokeStyle(strokeColor).concat(fillStyle(fillColor))
      default:
        break
    }
  }
}

const StrokeStyle = function (strokeColor: string, width = 2) {
  return [
    new Style({
      stroke: new Stroke({
        color: strokeColor,
        width: width
      })
    })
  ]
}

const fillStyle = function (fillColor: string): Style[] {
  return [
    new Style({
      fill: new Fill({
        color: fillColor
      })
    })
  ]
}

const pointStyle = function (src: string, scale: number, offset = [0, 0]) {
  return [
    new Style({
      image: new Icon({
        src: src,
        anchor: [0.5, 60],
        anchorOrigin: 'top-right',
        anchorXUnits: 'fraction',
        anchorYUnits: 'pixels',
        offsetOrigin: 'top-left',
        offset: offset,
        scale: scale
      })
    })
  ]
}

// OSM
const OSMLayer: BaseLayer = createTileLayer(OSMSource, 1)

// googleLayer
const googleLayer: BaseLayer = createTileLayer(googleSource, 1)

// provinceLayer
const provinceLayer = function (map: Map) {
  requestData('/show/sichuan.geojson', (src: any) => {
    const layer = createVectorLayer('province', src.data, 'yellow', '', 2)
    map.addLayer(layer)
  })
}

// polluteLayer
const polluteLayer = function (map: Map) {
  requestData('/show/polluteArea.geojson', (src: any) => {
    const layer = createVectorLayer('pollute', src.data, 'rgba(255, 109, 109,1)', 'rgba(255, 109, 109,0.3)', 2)
    map.addLayer(layer)
  })
}

// SuperviseLayer
const superviseLayer = function (map: Map) {
  requestData('/show/guanliju.geojson', (src: any) => {
    const layer = createVectorLayer('supervise', src.data, '', '', 3)
    map.addLayer(layer)
  })
}

// farmLayer
const farmLayer = function (map: Map) {
  requestData('/show/farmland.geojson', (src: any) => {
    const layer = createVectorLayer('farmland', src.data, 'rgba(50, 224, 169, 1)', 'rgba(50, 224, 169, 0.3)', 4)
    map.addLayer(layer)
    signFarmLayer(layer)
  })
}

// sign diffener farmlayer
function signFarmLayer(layer: VectorLayer<VectorSource>) {
  const features = layer.getSource().getFeatures()

  features.forEach((feature: Feature) => {
    const level = feature.get('level')
    const tempExtent = feature.getGeometry().getExtent()
    // get center for add flag
    const center = getCenter(tempExtent)
    const strokeColor = 'rgba(50, 224, 169, 1)'
    let fillColor = ''
    let imgSrc = farmImg
    if (level === '1') {
      fillColor = 'rgba(228, 82, 230, 0.3)'
      imgSrc = farmControlImg
    } else if (level === '2') {
      fillColor = 'rgba(255, 126, 0, 0.3)'
      imgSrc = farmSafeImg
    } else {
      fillColor = 'rgba(50, 224, 169, 0.3)'
      imgSrc = farmImg
    }

    feature.setStyle(StrokeStyle(strokeColor).concat(fillStyle(fillColor)))
    // add point in farmLayer
  })
}

//
let layerList: BaseLayer[] = [googleLayer]

// Set farmLayer color

export { layerList, createVectorLayer, signFarmLayer, provinceLayer, polluteLayer, superviseLayer, farmLayer }
