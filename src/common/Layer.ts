import BaseLayer from 'ol/layer/Base'
import { Tile as TileLayer } from 'ol/layer'
import { OSMSource, googleSource } from './Source'
import TileSource from 'ol/source/Tile'

// TileLayer
function createTileLayer(source: TileSource) {
  return new TileLayer({
    source: source
  })
}

// OSM
const OSMLayer: BaseLayer = createTileLayer(OSMSource)

// google
const googleLayer: BaseLayer = createTileLayer(googleSource)

let layerList: BaseLayer[] = [googleLayer]

export { layerList }
