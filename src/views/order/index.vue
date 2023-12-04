<template>
  <div class="px-5 pt-5">
    <el-row :gutter="10" class="mb8">
      <el-col :span="24">
        <el-form v-show="showSearch" ref="queryRef" :model="queryParams" :inline="true" label-width="68px">
          <el-form-item label="节点名称" prop="clusterName">
            <el-input
              v-model="queryParams.clusterName"
              placeholder="请输入节点名称"
              clearable
              style="width: 240px"
              @keyup.enter="handleQuery"
            />
          </el-form-item>
          <el-form-item label="订单状态" prop="status">
            <el-select v-model="queryParams.status" placeholder="请选择">
              <el-option
                v-for="dict in open_status"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
      </el-col>
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd">开通云服务器</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" :columns="orderList" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="orderList" style="width: 100%">
      <el-table-column prop="serviceId" label="ID" width="200" />
      <el-table-column prop="username" label="会员" width="150" />
      <el-table-column prop="vmId" label="VMID" width="200">
        <template #default="scope">
          <div>{{ scope.row.firstName + ' / ' + scope.row.secondName + ' / ' + scope.row.clusterName }}</div>
          <div class="text-#919599">{{ scope.row.node + ' / ' + scope.row.vmId }}</div>
        </template>
      </el-table-column>
      <el-table-column prop="config" label="配置" width="150">
        <template #default="scope">
          <el-tooltip placement="top">
            <template #content>
              操作系统：{{ scope.row.osName }}<br />CPU：{{ scope.row.cpu }}<br />内存：{{ scope.row.memory
              }}<br />带宽：{{ scope.row.bandwidth }}Mbps
            </template>
            <div>{{ scope.row.cpu + '核 ' + scope.row.memory + 'GB' }}</div>
            <div>{{ scope.row.secondName }}</div>
          </el-tooltip>
          <div></div>
        </template>
      </el-table-column>
      <el-table-column prop="bandwidth" label="带宽">
        <template #default="scope">
          <div>{{ scope.row.bandwidth }} Mbps</div>
          <div v-if="scope.row.bandwidthMode === 2">按流量计费</div>
        </template>
      </el-table-column>
      <el-table-column prop="pubAddresses" label="IP" show-overflow-tooltip />
      <el-table-column prop="payTime" label="开通时间" width="180" />
      <el-table-column prop="endTime" label="到期时间" width="180" />
      <el-table-column prop="openStatus" label="状态" width="80">
        <template #default="scope">
          <dict-tag :options="open_status" :value="scope.row.openStatus" />
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="150">
        <template #default="scope">
          <el-tooltip content="删除" placement="top">
            <el-button link type="primary" icon="Delete" @click="handleDel(scope.row)"></el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>

    <!-- 弹框 -->
    <el-dialog v-model="dialogFormVisible" :title="title" @closed="handleClosed">
      <el-form ref="orderRef" :model="form" label-position="right" :rules="rules" label-width="140px">
        <el-form-item label="所属用户" prop="userIds">
          <div>
            <el-button @click="openSelectUser">添加用户</el-button>
            <el-tag v-for="item in userSelectedList" :key="item.id" closable class="ml-2" @close="closeTag(item.id)"
              >{{ item.username }}
            </el-tag>
          </div>
        </el-form-item>
        <el-form-item label="开通产品" prop="server">
          <el-input model-value="云服务器" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span>
          <el-button @click="dialogFormVisible = false">取消</el-button>
          <el-button type="primary" @click="handleConfirm"> 确认 </el-button>
        </span>
      </template>
    </el-dialog>

    <SelectUser
      ref="userSelectRef"
      :user-page-api="listUser"
      is-radio
      :checked-user-list="form.userIds"
      @onBack="userBack"
    />
  </div>
</template>

<script setup>
import { listOrder } from '@/api/order'
import { listCluster } from '@/api/server/cluster'
import { listUser } from '@/api/system/user'

const { proxy } = getCurrentInstance()
const { open_status } = proxy.useDict('open_status')

// 添加用户
const userSelectRef = ref()
const userSelectedList = ref([])
const openSelectUser = () => {
  userSelectRef.value.show()
}

const userBack = data => {
  userSelectedList.value = data
}

const closeTag = id => {
  userSelectedList.value = userSelectedList.value.filter(obj => obj.id !== id)
}

watch(
  () => userSelectedList.value,
  () => {
    form.value.userIds = userSelectedList.value.map(obj => {
      return obj.id
    })
  }
)

const rules = ref({
  userIds: [{ required: true, message: '请选择用户', trigger: 'change' }]
})

const total = ref(0)
const pageQuery = ref({
  pageNum: 1,
  pageSize: 10
})

const queryParams = ref({
  name: null,
  osType: null
})

const handleQuery = () => {
  pageQuery.value.pageNum = 1
  getList()
}
const resetQuery = () => {
  proxy.resetForm('queryRef')
  handleQuery()
}

const showSearch = ref(true)
const loading = ref(true)

const orderList = ref([])
const clusterList = ref([])
const osList = ref([])

const getList = async () => {
  loading.value = true
  listOrder({ ...pageQuery.value, ...queryParams.value }).then(res => {
    loading.value = false
    orderList.value = res.rows
    total.value = res.total

    osList.value = new Set(res.rows.map(obj => obj.osType))
  })
}

getList()

listCluster({}).then(res => {
  clusterList.value = res.rows
})

const handleAdd = () => {
  title.value = '开通产品'
  dialogFormVisible.value = true
}

const handleDel = id => {
  proxy.$modal
    .confirm('确认删除吗?')
    .then(() => {
      return delSystem(id)
    })
    .then(() => {
      getList()
      proxy.$modal.msgSuccess('删除成功')
    })
    .catch(() => {})
}

// 弹框
const dialogFormVisible = ref(false)
const form = ref({
  userIds: []
})

const title = ref('')

const handleClosed = () => {
  form.value = {
    userIds: []
  }
  userSelectedList.value = []
  proxy.resetForm('orderRef')
}

const handleConfirm = () => {
  proxy.$refs['orderRef'].validate(valid => {
    if (valid) {
      if (!form.value.id) {
        addSystem(form.value).then(() => {
          ElMessage.success('操作成功')
          dialogFormVisible.value = false
          getList()
        })
      } else {
        updateSystem(form.value).then(() => {
          ElMessage.success('操作成功')
          dialogFormVisible.value = false
          getList()
        })
      }
    }
  })
}
</script>

<style lang="scss" scoped></style>
