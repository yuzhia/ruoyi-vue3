<template>
  <div class="px-5 pt-5">
    <div class="flex flex-col gap-20">
      <div class="flex flex-col gap-5">
        <div class="text-#0096e0">可用区</div>
        <div class="flex items-center gap-10">
          <span class="w-25">地域：</span>
          <el-radio-group v-model="regionRadio" @change="handleRegionChange">
            <el-radio-button v-for="item in regionList" :key="item.id" :label="item.id">{{
              item.name
            }}</el-radio-button>
          </el-radio-group>
        </div>
        <div class="flex items-center gap-10">
          <span class="w-25">线路：</span>
          <el-radio-group v-model="routeRadio">
            <el-radio-button v-if="regionChildrenList.length === 0" disabled>无可用线路</el-radio-button>
            <el-radio-button v-for="item in regionChildrenList" :key="item.id" :label="item.id">{{
              item.name
            }}</el-radio-button>
          </el-radio-group>
        </div>
        <div>
          <div class="flex items-center gap-10">
            <span class="w-25">可用区：</span>
            <div>
              <el-radio-group v-model="clusterRadio">
                <el-radio-button v-if="clusterList.length === 0" disabled>无可用区</el-radio-button>
                <el-radio-button v-if="clusterList.length > 0" label="random">随机分配</el-radio-button>
                <el-radio-button v-for="item in clusterList" :key="item.id" :label="item.id">{{
                  item.name
                }}</el-radio-button>
              </el-radio-group>
            </div>
          </div>
          <div v-if="clusterList.length > 0 && clusterRadio === 'random'" class="text-sm ml-35">
            自动分配的是：{{ currentCluster.name }}
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-5">
        <div class="text-#0096e0">基础配置</div>
        <div class="flex items-start gap-10">
          <span class="w-25">套餐：</span>
          <el-radio-button v-if="clusterList.length === 0" disabled>无可用套餐</el-radio-button>
          <div v-if="clusterList.length !== 0" class="flex gap-10">
            <el-card
              v-for="item in instanceList"
              :key="item.id"
              :shadow="orderParam.instanceId === item.id ? 'always' : 'hover'"
              class="w-250px cursor-pointer"
              :class="orderParam.instanceId === item.id ? ['border-#0096e0!'] : ''"
              @click="handleInstanceClick(item)"
            >
              <template #header>
                <div class="card-header">
                  <span :class="orderParam.instanceId === item.id ? 'text-#0096e0' : ''">{{ item.name }}</span>
                </div>
              </template>
              <div class="h-6 flex gap-1 items-center justify-center my-2 mx-2 line-height-6">
                <span>CPU</span>
                <span>{{ item.paramConfig.cpus }}核</span>
              </div>
              <div class="h-6 flex gap-1 items-center justify-center my-2 mx-2 line-height-6">
                <span>内存</span>
                <span>{{ item.paramConfig.memory }}G</span>
              </div>
              <div class="h-6 flex gap-1 items-center justify-center my-2 mx-2 line-height-6">
                <span>带宽</span>
                <span>{{ item.paramConfig.bandwidthUp }}Mbps</span>
              </div>
              <div class="h-6 flex gap-1 items-center justify-center my-2 mx-2 line-height-6">
                <span>IP数量</span>
                <span>{{ item.paramConfig.ipNum }}个</span>
              </div>
              <div class="h-6 flex gap-1 items-center justify-center my-2 mx-2 line-height-6">
                <span>系统盘</span>
                <span>{{ item.paramConfig.systemDisk }}G</span>
              </div>
              <div class="h-6 flex gap-1 items-center justify-center my-2 mx-2 line-height-6">
                <span>数据盘</span>
                <span>{{ item.paramConfig.dataDisk }}G</span>
              </div>
              <div class="h-6 flex gap-1 items-center justify-center my-2 mx-2 line-height-6">
                <span>防御</span>
                <span>10G</span>
              </div>
            </el-card>
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-5">
        <div class="text-#0096e0">操作系统</div>
        <div class="flex items-center gap-10">
          <span class="w-25">操作系统：</span>
          <el-radio-group v-model="system" @change="handleSystemChange">
            <el-radio-button v-for="item in osList" :key="item" :label="item">{{ item }}</el-radio-button>
          </el-radio-group>
        </div>
        <div class="flex items-center gap-10">
          <span class="w-25">系统版本：</span>
          <el-select v-model="orderParam.systemId" placeholder="Select">
            <el-option v-for="item in systemVersionList" :key="item.value" :label="item.name" :value="item.id" />
          </el-select>
        </div>
        <div class="flex items-center gap-10">
          <span class="w-25">登录凭证：</span>
          <el-radio-group v-model="loginType">
            <el-radio-button label="1">自动创建</el-radio-button>
            <el-radio-button label="2">自定义密码</el-radio-button>
          </el-radio-group>
        </div>
        <div v-if="loginType === '2'" class="flex items-center gap-10">
          <span class="w-25">SSH账号：</span>
          <el-input class="w-50" disabled model-value="root"></el-input>
        </div>
        <div v-if="loginType === '2'" class="flex items-center gap-10">
          <span class="w-25">SSH密码：</span>
          <el-input v-model="orderParam.sshPassword" class="w-50"></el-input>
        </div>
      </div>

      <div class="flex flex-col gap-5">
        <div class="text-#0096e0">购买设置</div>
        <div class="flex items-center gap-10">
          <span class="w-25">购买时长：</span>
          <div class="relative">
            <el-radio-group v-model="orderParam.month" @change="calculatePrice">
              <el-radio-button v-if="!monthList.find(obj => obj.month === 1)" :label="1" :value="1"
                >1个月</el-radio-button
              >
              <el-radio-button v-for="item in monthList" :key="item.id" :label="item.month">
                {{ item.month }}个月
                <span
                  v-if="item.discount !== 100"
                  class="absolute -top-5 right-0 bg-#ff5f5f px-3px py-2px border-rounded-2 text-#fff"
                  >{{ item.discount / 10 }}折</span
                >
              </el-radio-button>
            </el-radio-group>
          </div>
        </div>
        <div class="flex items-center gap-10">
          <span class="w-25">主机别名：</span>
          <el-input v-model="orderParam.serverName" class="w-50"></el-input>
        </div>
        <div class="flex items-center gap-10">
          <span class="w-25">购买数量：</span>
          <el-input-number v-model="orderParam.buyNum" :min="1" class="w-50" @change="calculatePrice"></el-input-number>
        </div>
      </div>
    </div>
    <el-affix v-if="orderParam.instanceId && orderParam.clusterId" position="bottom" :offset="0" class="w-full mt-10">
      <el-card class="mx-20">
        <div class="flex justify-between items-center py-2">
          <div>
            <span>费用总计：</span>
            <span class="text-red text-3xl">￥{{ orderParam.orderAmount }}</span>
          </div>
          <el-button type="primary" size="large" @click="handlePurchase">立即购买</el-button>
        </div>
      </el-card>
    </el-affix>
  </div>
</template>

<script setup>
import { listRegion, listCluster, getBuyInfo, getDiscount, getPrice, buy } from '@/api/server/purchase'
import { watch } from 'vue'

const regionList = ref()
const regionRadio = ref()

const regionChildrenList = ref([])
const routeRadio = ref()

const currentCluster = ref({})
const clusterList = ref([])
const clusterRadio = ref()

const orderParam = ref({
  instanceId: null,
  clusterId: null,
  systemId: null,
  cpu: null,
  memory: null,
  systemDisk: null,
  dataDisk: null,
  month: 1,
  bandwidthMode: 1,
  bandwidth: null,
  ipNum: 1,
  defense: null,
  serverName: 'MyServer',
  sshPassword: '123456',
  buyNum: 1,
  orderAmount: 0.0
})

listRegion().then(res => {
  regionList.value = res.data
  regionRadio.value = regionList.value[0].id
  regionChildrenList.value = regionList.value[0].children
  routeRadio.value = regionList.value[0].children[0].id
})

const handleRegionChange = () => {
  const currentRegion = regionList.value.find(item => {
    return item.id == regionRadio.value
  })
  regionChildrenList.value = currentRegion.children
  if (regionChildrenList.value.length !== 0) {
    console.log('aa')
    routeRadio.value = regionChildrenList.value[0].id
  } else {
    clusterList.value = []
    routeRadio.value = -1
  }
}

watch(
  () => routeRadio.value,
  () => {
    if (routeRadio.value !== -1) {
      listCluster(routeRadio.value).then(res => {
        if (res.data.clusterList.length === 0) {
          clusterRadio.value = null
        }
        clusterList.value = res.data.clusterList
        currentCluster.value = res.data.currentCluster
        clusterRadio.value = 'random'
      })
    }
  }
)

watch(
  () => clusterRadio.value,
  () => {
    if (clusterRadio.value !== 'random') {
      orderParam.value.clusterId = clusterRadio.value
    }
  }
)

const system = ref()
const osList = ref({})
const systemList = ref({})

const handleSystemChange = () => {
  systemVersionList.value = systemList.value[system.value]
  orderParam.value.systemId = systemVersionList.value[0].id
}

const systemVersionList = ref([])

const loginType = ref('2')

const currentInstance = ref({})
const instanceList = ref([])

const handleInstanceClick = instance => {
  orderParam.value.instanceId = instance.id
  currentInstance.value = instance
}

watch(
  () => orderParam.value.instanceId,
  () => {
    getDiscount(orderParam.value.instanceId).then(res => {
      monthList.value = res.data
    })

    orderParam.value.cpu = currentInstance.value.paramConfig.cpus
    orderParam.value.memory = currentInstance.value.paramConfig.memory
    orderParam.value.bandwidth = currentInstance.value.paramConfig.bandwidthUp
    orderParam.value.ipNum = currentInstance.value.paramConfig.ipNum
    orderParam.value.systemDisk = currentInstance.value.paramConfig.systemDisk
    orderParam.value.dataDisk = currentInstance.value.paramConfig.dataDisk
    orderParam.value.defense = currentInstance.value.paramConfig.defense

    calculatePrice()
  },
  { deep: true }
)

watch(
  () => clusterRadio.value,
  () => {
    if (clusterRadio.value === 'random') {
      orderParam.value.clusterId = currentCluster.value.id
    }
    getBuyInfo(orderParam.value.clusterId).then(res => {
      instanceList.value = res.data.instanceList.filter(item => {
        return item.pack
      })
      if (instanceList.value.length !== 0) {
        orderParam.value.instanceId = instanceList.value[0].id
        currentInstance.value = instanceList.value[0]
      }
      systemList.value = res.data.systemList
      osList.value = Object.keys(systemList.value)

      if (osList.value.length !== 0) {
        system.value = osList.value[0]
        systemVersionList.value = res.data.systemList[system.value].filter(item => {
          return item.osType === system.value
        })
        orderParam.value.systemId = systemVersionList.value[0].id
      }
    })
  }
)

const calculatePrice = () => {
  getPrice(orderParam.value).then(res => {
    const data = res.data
    orderParam.value.orderAmount =
      data.instancePrice +
      data.bandwidthPrice +
      data.cpuPrice +
      data.systemDiskPrice +
      data.dataDiskPrice +
      data.ipPrice +
      data.memoryPrice
  })
}

const monthList = ref([])

const handlePurchase = () => {
  ElMessageBox.confirm('已确认配置并下单吗？', '确认框！', {
    confirmButtonText: '确认购买',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    buy(orderParam.value)
    ElMessage.success('已下单')
  })
}
</script>

<style lang="scss" scoped></style>
