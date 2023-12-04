<template>
  <div class="px-5 pt-5">
    <el-button type="primary" class="mb-5" @click="handleConfirm">确认</el-button>
    <el-tabs v-model="activeName" class="demo-tabs" @tab-click="handleClick">
      <el-tab-pane label="基本配置" name="first">
        <!-- 基本配置 -->
        <el-form :model="form" label-width="120px">
          <el-form-item label="实例名称">
            <el-input v-model="form.name" />
          </el-form-item>
          <el-form-item label="实例分组">
            <el-select v-model="form.groupId">
              <el-option v-for="item in groupList" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="描述">
            <el-input v-model="form.description" />
          </el-form-item>
          <el-form-item label="CPU">
            <el-input v-model="form.paramConfig.cpus" />
          </el-form-item>
          <el-form-item label="内存">
            <el-input v-model="form.paramConfig.memory" />
          </el-form-item>
          <el-form-item label="价格">
            <el-input-number v-model="form.price" />
          </el-form-item>
          <el-form-item label="库存">
            <el-input-number v-model="form.stock" />
          </el-form-item>
          <el-form-item label="套餐">
            <el-switch v-model="form.pack" />
          </el-form-item>
          <el-form-item label="绑定可用区">
            <el-tree
              ref="clusterRef"
              class="tree-border"
              :data="clusterTree"
              :default-checked-keys="clusterIds"
              show-checkbox
              default-expand-all
              node-key="id"
              empty-text="加载中，请稍候"
              :props="{ label: 'label', children: 'children' }"
            ></el-tree>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!--  -->
      <el-tab-pane label="参数配置" name="second">
        <div v-if="form.paramConfig" class="flex flex-col gap-6">
          <div class="gridLayout">
            <div>系统盘</div>
            <div>基本配置</div>
            <div>升级梯度</div>
            <div>升级价格/每月</div>
            <div>升级限制</div>
            <div>赠送</div>
          </div>
          <div class="gridLayout">
            <div>CPU</div>
            <div class="flex">
              <div class="prepareLeft">初始</div>
              <el-input-number v-model="form.paramConfig.cpus" :controls="false"></el-input-number>
              <div class="prepareRight">GB</div>
            </div>
            <div class="flex">
              <div class="prepareLeft">每增加</div>
              <el-input-number v-model="form.priceUpgradeConfig.cpuStep" :controls="false"></el-input-number>
              <div class="prepareRight">GB</div>
            </div>
            <div class="flex">
              <el-input-number v-model="form.priceUpgradeConfig.cpuPrice" :controls="false"></el-input-number>
              <div class="prepareRight">元</div>
            </div>
            <div class="flex">
              <div class="prepareLeft">最多</div>
              <el-input-number v-model="form.priceUpgradeConfig.cpuMax" :controls="false"></el-input-number>
              <div class="prepareRight">GB</div>
            </div>
            <div class="flex">
              <div class="prepareLeft">赠送</div>
              <el-input-number v-model="form.paramConfig.cpusFree" :controls="false"></el-input-number>
              <div class="prepareRight">GB</div>
            </div>
          </div>
          <div class="gridLayout">
            <div>内存</div>
            <div class="flex">
              <div class="prepareLeft">初始</div>
              <el-input-number v-model="form.paramConfig.memory" :controls="false"></el-input-number>
              <div class="prepareRight">GB</div>
            </div>
            <div class="flex">
              <div class="prepareLeft">每增加</div>
              <el-input-number v-model="form.priceUpgradeConfig.memoryStep" :controls="false"></el-input-number>
              <div class="prepareRight">GB</div>
            </div>
            <div class="flex">
              <el-input-number v-model="form.priceUpgradeConfig.memoryPrice" :controls="false"></el-input-number>
              <div class="prepareRight">元</div>
            </div>
            <div class="flex">
              <div class="prepareLeft">最多</div>
              <el-input-number v-model="form.priceUpgradeConfig.memoryMax" :controls="false"></el-input-number>
              <div class="prepareRight">GB</div>
            </div>
            <div class="flex">
              <div class="prepareLeft">赠送</div>
              <el-input-number v-model="form.paramConfig.memoryFree" :controls="false"></el-input-number>
              <div class="prepareRight">GB</div>
            </div>
          </div>
          <div class="gridLayout">
            <div>系统盘</div>
            <div class="flex">
              <div class="prepareLeft">初始</div>
              <el-input-number v-model="form.paramConfig.systemDisk" :controls="false"></el-input-number>
              <div class="prepareRight">GB</div>
            </div>
            <div class="flex">
              <div class="prepareLeft">每增加</div>
              <el-input-number v-model="form.priceUpgradeConfig.systemDiskStep" :controls="false"></el-input-number>
              <div class="prepareRight">GB</div>
            </div>
            <div class="flex">
              <el-input-number v-model="form.priceUpgradeConfig.systemDiskPrice" :controls="false"></el-input-number>
              <div class="prepareRight">元</div>
            </div>
            <div class="flex">
              <div class="prepareLeft">最多</div>
              <el-input-number v-model="form.priceUpgradeConfig.systemDiskMax" :controls="false"></el-input-number>
              <div class="prepareRight">GB</div>
            </div>
            <div class="flex">
              <div class="prepareLeft">赠送</div>
              <el-input-number v-model="form.paramConfig.systemDiskFree" :controls="false"></el-input-number>
              <div class="prepareRight">GB</div>
            </div>
          </div>
          <div class="gridLayout">
            <div>数据盘</div>
            <div class="flex">
              <div class="prepareLeft">初始</div>
              <el-input-number v-model="form.paramConfig.dataDisk" :controls="false"></el-input-number>
              <div class="prepareRight">GB</div>
            </div>
            <div class="flex">
              <div class="prepareLeft">每增加</div>
              <el-input-number v-model="form.priceUpgradeConfig.dataDiskStep" :controls="false"></el-input-number>
              <div class="prepareRight">GB</div>
            </div>
            <div class="flex">
              <el-input-number v-model="form.priceUpgradeConfig.dataDiskPrice" :controls="false"></el-input-number>
              <div class="prepareRight">元</div>
            </div>
            <div class="flex">
              <div class="prepareLeft">最多</div>
              <el-input-number v-model="form.priceUpgradeConfig.dataDiskMax" :controls="false"></el-input-number>
              <div class="prepareRight">GB</div>
            </div>
            <div class="flex">
              <div class="prepareLeft">赠送</div>
              <el-input-number v-model="form.paramConfig.dataDiskFree" :controls="false"></el-input-number>
              <div class="prepareRight">GB</div>
            </div>
          </div>
          <div class="gridLayout">
            <div>IP数量</div>
            <div class="flex">
              <div class="prepareLeft">初始</div>
              <el-input-number v-model="form.paramConfig.ipNum" :controls="false"></el-input-number>
              <div class="prepareRight">个</div>
            </div>
            <div class="flex">
              <div class="prepareLeft">每增加</div>
              <el-input-number v-model="form.priceUpgradeConfig.ipStep" :controls="false"></el-input-number>
              <div class="prepareRight">个</div>
            </div>
            <div class="flex">
              <el-input-number v-model="form.priceUpgradeConfig.ipPrice" :controls="false"></el-input-number>
              <div class="prepareRight">元</div>
            </div>
            <div class="flex">
              <div class="prepareLeft">最多</div>
              <el-input-number v-model="form.priceUpgradeConfig.ipMax" :controls="false"></el-input-number>
              <div class="prepareRight">个</div>
            </div>
            <div class="flex">
              <div class="prepareLeft">赠送</div>
              <el-input-number v-model="form.paramConfig.ipNumFree" :controls="false"></el-input-number>
              <div class="prepareRight">个</div>
            </div>
          </div>
          <div class="gridLayout">
            <div>计费方式</div>
            <div>
              <el-radio-group v-model="form.bandwidthMode">
                <el-radio-button label="FIX">按固定带宽</el-radio-button>
                <el-radio-button label="FLOW">按使用流量</el-radio-button>
              </el-radio-group>
            </div>
          </div>
          <div v-if="form.bandwidthMode === 'FLOW'" class="gridLayout">
            <div>流量计费</div>
            <div class="flex">
              <div class="prepareLeft">初始</div>
              <el-input-number v-model="form.paramConfig.flow" :controls="false"></el-input-number>
              <div class="prepareRight">GB</div>
            </div>
            <div class="flex">
              <div class="prepareLeft">每增加</div>
              <el-input-number v-model="form.priceUpgradeConfig.flowStep" :controls="false"></el-input-number>
              <div class="prepareRight">GB</div>
            </div>
            <div class="flex">
              <el-input-number v-model="form.priceUpgradeConfig.flowPrice" :controls="false"></el-input-number>
              <div class="prepareRight">元</div>
            </div>
            <div class="flex"></div>
            <div class="flex"></div>
          </div>
          <div class="gridLayout">
            <div>带宽（上行）</div>
            <div class="flex">
              <div class="prepareLeft">初始</div>
              <el-input-number v-model="form.paramConfig.bandwidthUp" :controls="false"></el-input-number>
              <div class="prepareRight">Mbps</div>
            </div>
            <div class="flex">
              <div class="prepareLeft">每增加</div>
              <el-input-number v-model="form.priceUpgradeConfig.bandwidthUpStep" :controls="false"></el-input-number>
              <div class="prepareRight">Mbps</div>
            </div>
            <div class="flex">
              <el-input-number v-model="form.priceUpgradeConfig.bandwidthUpPrice" :controls="false"></el-input-number>
              <div class="prepareRight">元</div>
            </div>
            <div class="flex">
              <div class="prepareLeft">最多</div>
              <el-input-number v-model="form.priceUpgradeConfig.bandwidthUpMax" :controls="false"></el-input-number>
              <div class="prepareRight">Mbps</div>
            </div>
            <div class="flex">
              <div class="prepareLeft">赠送</div>
              <el-input-number v-model="form.paramConfig.bandwidthUpFree" :controls="false"></el-input-number>
              <div class="prepareRight">Mbps</div>
            </div>
          </div>
          <div class="gridLayout">
            <div>带宽（下行）</div>
            <div class="flex">
              <div class="prepareLeft">固定</div>
              <el-input-number v-model="form.paramConfig.bandwidthDown" :controls="false"></el-input-number>
              <div class="prepareRight">Mbps</div>
            </div>
          </div>
          <div class="gridLayout">
            <div>带宽（内网）</div>
            <div class="flex">
              <div class="prepareLeft">固定</div>
              <el-input-number v-model="form.paramConfig.intranet" :controls="false"></el-input-number>
              <div class="prepareRight">Mbps</div>
            </div>
          </div>
          <div v-if="form.bandwidthMode === 'FLOW'" class="gridLayout">
            <div>带宽峰值</div>
            <div class="flex">
              <div class="prepareLeft">固定</div>
              <el-input-number v-model="form.paramConfig.bandwidthPeak" :controls="false"></el-input-number>
              <div class="prepareRight">Mbps</div>
            </div>
            <div></div>
            <div></div>
            <div class="flex">
              <div class="prepareLeft">最多</div>
              <el-input-number v-model="form.priceUpgradeConfig.bandwidthPeakMax" :controls="false"></el-input-number>
              <div class="prepareRight">Mbps</div>
            </div>
          </div>
          <div class="gridLayout">
            <div>防御</div>
            <div class="flex">
              <div class="prepareLeft">初始</div>
              <el-input-number v-model="form.paramConfig.defense" :controls="false"></el-input-number>
              <div class="prepareRight">GB</div>
            </div>
            <div class="flex">
              <div class="prepareLeft">每增加</div>
              <el-input-number v-model="form.priceUpgradeConfig.defenseStep" :controls="false"></el-input-number>
              <div class="prepareRight">GB</div>
            </div>
            <div class="flex">
              <el-input-number v-model="form.priceUpgradeConfig.defensePrice" :controls="false"></el-input-number>
              <div class="prepareRight">元</div>
            </div>
            <div class="flex">
              <div class="prepareLeft">最多</div>
              <el-input-number v-model="form.priceUpgradeConfig.defenseMax" :controls="false"></el-input-number>
              <div class="prepareRight">GB</div>
            </div>
            <div class="flex">
              <div class="prepareLeft">赠送</div>
              <el-input-number v-model="form.paramConfig.defenseFree" :controls="false"></el-input-number>
              <div class="prepareRight">GB</div>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!--  -->
      <el-tab-pane label="升级配置" name="third">
        <div>..</div>
      </el-tab-pane>

      <!--  -->
      <el-tab-pane label="购买时长折扣配置" name="four">
        <div v-for="(item, index) in discountList" :key="item" class="flex gap-5 mb-3">
          <div class="flex items-center gap-2">
            <el-input-number v-model="item.month" :min="1" />
            <span>个月</span>
          </div>
          <div class="flex items-center gap-2">
            <span>折扣</span>
            <el-input-number v-model="item.discount" :min="1" :max="100" />
          </div>
          <el-button @click="handleDiscountDel(index)">删除</el-button>
        </div>
        <el-button type="primary" @click="handleDiscountAdd">新增</el-button>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { treeCluster } from '@/api/server/cluster'
import { listInstanceGroup, saveInstance, getInstance } from '@/api/server/instance'

const route = useRoute()
const router = useRouter()

const instanceId = route.params.instanceId

const groupList = ref([])
const clusterIds = ref([])

getInstance(instanceId).then(res => {
  form.value = res.data.instance
  clusterIds.value = res.data.instanceClusterList.map(item => item.clusterId)
  discountList.value = res.data.instanceDiscountList
})

listInstanceGroup().then(res => {
  groupList.value = res.rows
})

const clusterRef = ref()
const clusterTree = ref([])
treeCluster().then(res => {
  clusterTree.value = res.data
})

const activeName = ref('first')

const handleClick = () => {}

const form = ref({
  bandwidthMode: 'FIX',
  paramConfig: {},
  priceUpgradeConfig: {}
})

const getSelected = () => {
  const val = clusterRef.value.getCheckedNodes(true, false)
  return val.map(obj => obj.id)
}

const discountList = ref([])

const handleDiscountDel = index => {
  discountList.value.splice(index, 1)
}

const handleDiscountAdd = () => {
  discountList.value.push({
    month: 1,
    discount: 100
  })
}

const handleConfirm = () => {
  form.value.clusterIds = getSelected()
  form.value.discountList = discountList.value
  saveInstance(form.value).then(() => {
    ElMessage.success('保存成功')
    router.go(-1)
  })
}
</script>

<style lang="scss" scoped>
:deep(.el-input__wrapper) {
  border-radius: 0;
}

.prepareLeft {
  @apply h-8 px-2 text-center line-height-8 border border-r-none border-solid border-#dcdfe6 bg-#eee rounded-l-1 text-#606266 text-14px;
}
.prepareRight {
  @apply h-8 px-2 text-center line-height-8 border border-l-none border-solid border-#dcdfe6 bg-#eee rounded-r-1 text-#606266 text-14px;
}

.gridLayout {
  display: grid;
  grid-template-columns: 100px 1fr 1fr 1fr 1fr 1fr;
  place-items: center;
}
</style>
