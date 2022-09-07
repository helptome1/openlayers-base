<template>
  <div id="map" ref="mapEle">
    <Legend :map="map"></Legend>
  </div>
</template>

<script setup lang="ts">
  import { View } from 'ol'

  import BaseLayer from 'ol/layer/Base'

  // viewOptions
  import { viewOptions } from '@/common/View'

  // map
  import { createMap, addInteraction } from '@/common/Map'

  // layer
  import { layerList, provinceLayer, polluteLayer, superviseLayer, farmLayer } from '@/common/Layer'

  const mapEle = ref(null)
  const map = ref(null)

  // view
  const view: View = viewOptions()

  // layers
  const layers: BaseLayer[] = layerList

  const init = () => {
    // 初始化map
    map.value = createMap(view, layers)

    // province
    provinceLayer(map.value)

    // polluteLayer
    polluteLayer(map.value)

    // superviseLayer
    superviseLayer(map.value)

    // farmLayer
    farmLayer(map.value)

    // interaction
    const interaction = addInteraction()

    map.value.addInteraction(interaction)
  }

  onMounted(() => {
    init()
  })
</script>

<style scoped>
  #map {
    position: absolute;
    width: 100%;
    height: 800px;
  }
</style>
