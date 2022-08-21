import { Map, View } from 'ol'
import BaseLayer from 'ol/layer/Base'
import { MapOptions } from 'ol/Map'

function createMap(view: View, layers: BaseLayer[], options?: MapOptions) {
  return new Map({
    target: 'map',
    view: view,
    layers: layers,
    ...options
  })
}

export {
  createMap
}
