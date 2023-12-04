<template>
  <div class="px-5 pt-5">
    <el-row :gutter="20">
      <el-col :span="24" :xs="24">
        <el-row :gutter="10" class="mb8">
          <el-col :span="24">
            <el-form v-show="showSearch" ref="queryRef" :model="queryParams" :inline="true" label-width="68px">
              <el-form-item label="实例名称" prop="name">
                <el-input
                  v-model="queryParams.name"
                  placeholder="请输入实例名称"
                  clearable
                  style="width: 240px"
                  @keyup.enter="handleQuery"
                />
              </el-form-item>
              <el-form-item label="实例分组" prop="groupId">
                <el-select v-model="queryParams.groupId" placeholder="实例分组" clearable style="width: 240px">
                  <el-option v-for="item in groupList" :key="item.id" :label="item.name" :value="item.id" />
                </el-select>
              </el-form-item>
              <el-form-item label="节点" prop="clusterId">
                <el-select v-model="queryParams.clusterId" placeholder="节点" clearable style="width: 240px">
                  <el-option v-for="item in clusterList" :key="item.id" :label="item.name" :value="item.id" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
                <el-button icon="Refresh" @click="resetQuery">重置</el-button>
              </el-form-item>
            </el-form>
          </el-col>
          <el-col :span="1.5">
            <el-button type="primary" plain icon="Plus">新建实例</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" :columns="instanceList" @queryTable="getList"></right-toolbar>
        </el-row>

        <el-table v-loading="loading" :data="instanceList" style="width: 100%">
          <el-table-column prop="id" label="ID" width="100" />
          <el-table-column prop="name" label="实例名称" width="200" />
          <el-table-column prop="cpu" label="CPU数量">
            <template #default="scope">
              <div>{{ scope.row.paramConfig.cpus }}</div>
            </template>
          </el-table-column>
          <el-table-column prop="memory" label="内存大小(G)">
            <template #default="scope">
              <div>{{ scope.row.paramConfig.memory }}</div>
            </template>
          </el-table-column>
          <el-table-column prop="price" label="价格（元/月）" />
          <el-table-column prop="description" label="简介" show-overflow-tooltip />
          <el-table-column prop="sort" label="排序" width="120" />
          <el-table-column prop="pack" label="套餐" width="120">
            <template #default="scope">
              <el-switch v-model="scope.row.pack" @change="handleStatusChange(scope.row)" />
            </template>
          </el-table-column>
          <el-table-column prop="upgradeable" label="升级" width="120">
            <template #default="scope">
              <el-switch v-model="scope.row.upgradeable" @change="handleStatusChange(scope.row)" />
            </template>
          </el-table-column>
          <el-table-column prop="enabled" label="状态" width="120">
            <template #default="scope">
              <el-switch v-model="scope.row.enabled" @change="handleStatusChange(scope.row)" />
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
            <template #default="scope">
              <el-button link type="primary" @click="handleCopy(scope.row)">复制</el-button>
              <el-button link type="primary" @click="handleEdit(scope.row.id)">编辑</el-button>
              <el-button link type="primary" @click="handleDel(scope.row.id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <pagination
          v-show="total > 0"
          v-model:page="pageQuery.pageNum"
          v-model:limit="pageQuery.pageSize"
          class="mr-5"
          :total="total"
          @pagination="getList"
        />
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { listCluster } from '@/api/server/cluster'
import {
  listInstance,
  listInstanceGroup,
  updateInstance,
  delInstance,
  saveInstance,
  getInstance
} from '@/api/server/instance'

const { proxy } = getCurrentInstance()

const router = useRouter()

const clusterList = ref([])
listCluster().then(res => {
  clusterList.value = res.rows
})

const showSearch = ref(true)
const loading = ref(true)

const total = ref(0)
const pageQuery = ref({
  pageNum: 1,
  pageSize: 10
})

const queryParams = ref({
  name: null,
  groupId: null,
  clusterId: null
})

const instanceList = ref([])

const getList = async () => {
  loading.value = true
  listInstance({ ...pageQuery.value, ...queryParams.value }).then(res => {
    loading.value = false
    instanceList.value = res.rows
    total.value = res.total
  })
}

getList()

const groupList = ref([])

listInstanceGroup().then(res => {
  groupList.value = res.rows
})

const handleQuery = () => {
  pageQuery.value.pageNum = 1
  getList()
}
const resetQuery = () => {
  proxy.resetForm('queryRef')
  handleQuery()
}

const handleStatusChange = row => {
  updateInstance(row).then(() => {
    getList()
    ElMessage.success('修改成功')
  })
}

const handleCopy = async row => {
  const res = await getInstance(row.id)
  row.id = null
  row.discountList = res.data.instanceDiscountList
  row.clusterIds = res.data.instanceClusterList.map(item => item.clusterId)
  saveInstance(row).then(() => {
    ElMessage.success('复制成功')
    getList()
  })
}

const handleEdit = id => {
  router.push('/server/instance-edit/' + id)
}

const handleDel = id => {
  proxy.$modal
    .confirm('确认删除吗?')
    .then(() => {
      return delInstance(Array.of(id))
    })
    .then(() => {
      getList()
      proxy.$modal.msgSuccess('删除成功')
    })
    .catch(() => {})
}
</script>

<style lang="scss" scoped></style>
