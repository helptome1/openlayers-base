<template>
  <div class="show-list">
    <ul>
      <li
        v-for="(item, index) in layerList.landList"
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
          <div v-for="farm in layerList.farmList">
            <img class="show-list-img" :src="farm.img" alt="" />
            {{ farm.name }}
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
  import polluteImg from '/images/pollute1.png'
  import farmImg from '/images/farm-use1.png'
  import watchImg from '/images/watch1.png'

  import farmSafe from '/images/farm-safe.png'
  import farmControl from '/images/farm-control1.png'
  import farmUse from '/images/farm-use1.png'
  import { Map } from 'ol'

  // props
  const props = defineProps({
    map: Map
  })

  const layerList = reactive({
    landList: [
      {
        name: '污染地块(6)',
        value: 'pollute',
        visible: true,
        color: 'rgba(255, 109, 109,1)',
        icon: polluteImg
      },
      {
        name: '农用地块(14)',
        value: 'farmland',
        visible: true,
        color: '#32e0a9',
        icon: farmImg
      },
      {
        name: '重点监管单位(13)',
        value: 'supervise',
        visible: true,
        color: '#20a2f4',
        icon: watchImg
      }
    ],
    farmList: [
      {
        name: '优先保护类',
        img: farmSafe
      },
      {
        name: '严格管控类',
        img: farmControl
      },
      {
        name: '安全利用类',
        img: farmUse
      }
    ]
  })

  const isShowTip = ref(false)

  /**
   * control the land visible.
   */
  const isVisible = function (item) {
    const layers = props.map.getLayers().getArray()
    const theLayer = layers.find((layer) => {
      return layer.get('name') === item.value
    })
    theLayer.setVisible(!item.visible)
    item.visible = !item.visible
  }

  /**
   * show the farmland flag.
   */
  const showTip = function (index: number) {
    if (index === 1) {
      this.isShowTip = !this.isShowTip
    }
  }
</script>

<style lang="less" scoped>
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
</style>
