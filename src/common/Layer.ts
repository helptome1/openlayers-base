import BaseLayer from 'ol/layer/Base'
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer'
import { OSMSource, googleSource, VectorSource } from './Source'

import TileSource from 'ol/source/Tile'
import Style from 'ol/style/Style'
import Stroke from 'ol/style/Stroke'
import Fill from 'ol/style/Fill'
import Icon from 'ol/style/Icon'

import watchImg from '/images/watch1.png'
import { Feature } from 'ol'

// TileLayer
function createTileLayer(source: TileSource, zIndex) {
  return new TileLayer({
    source: source,
    zIndex: zIndex
  })
}

// VectorLayer
function createVectorLayer(VectorName = 'geojson', url: string, strokeColor = '', fillColor = '', zIndex = 1) {
  const layer = new VectorLayer({
    className: VectorName,
    source: VectorSource(url),
    opacity: 1,
    zIndex: zIndex,
    style: VectorStyle(VectorName, strokeColor, fillColor)
  })
  return layer
}

// VectorStyle
function VectorStyle(VectorName: string, strokeColor: string, fillColor: string) {
  return function (feature, state) {
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
const provinceLayer = createVectorLayer('province', '/show/sichuan.geojson', 'yellow', '', 2)

// polluteLayer
const polluteLayer = createVectorLayer(
  'pollute',
  '/show/polluteArea.geojson',
  'rgba(255, 109, 109,1)',
  'rgba(255, 109, 109,0.3)',
  2
)

// SuperviseLayer
const superviseLayer = createVectorLayer('supervise', '/show/guanliju.geojson', '', '', 3)

// farmLayer
const farmLayer = createVectorLayer(
  'farmland',
  '/show/farmland.geojson',
  'rgba(50, 224, 169, 1)',
  'rgba(50, 224, 169, 0.3)',
  4
)

function signFarmLayer() {
  // const features = farmLayer.getSource().getFeatures()
  // features.forEach((feature: Feature) => {
  //   const level = feature.get('level')
  //   const center = feature.getGeometry().getExtent().getCenter()
  //   let imgSrc = farmImg
  //   if (level === '1') {
  //     fillColor = 'rgba(228, 82, 230, 0.3)'
  //     imgSrc = farmControlImg
  //   } else if (level === '2') {
  //     fillColor = 'rgba(255, 126, 0, 0.3)'
  //     imgSrc = farmSafeImg
  //   } else {
  //     fillColor = 'rgba(50, 224, 169, 0.3)'
  //     imgSrc = farmImg
  //   }

  //   feature.setStyle(
  //     new Style({
  //       stroke: new Stroke({
  //         color: strokeColor,
  //         width: 2
  //       }),
  //       fill: new Fill({
  //         color: fillColor
  //       })
  //     })
  //   )
  // })
}

let layerList: BaseLayer[] = [googleLayer, provinceLayer, polluteLayer, superviseLayer, farmLayer]

export { layerList, createVectorLayer }
