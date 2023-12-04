<template>
  <div class="px-5 pt-5">
    <el-row :gutter="10" class="mb8">
      <el-col :span="24">
        <el-form v-show="showSearch" ref="queryRef" :model="queryParams" :inline="true" label-width="68px">
          <el-form-item label="镜像名称" prop="name">
            <el-input
              v-model="queryParams.name"
              placeholder="请输入镜像名称"
              clearable
              style="width: 240px"
              @keyup.enter="handleQuery"
            />
          </el-form-item>
          <el-form-item label="操作系统" prop="osType">
            <el-select v-model="queryParams.osType" placeholder="选择操作系统" clearable style="width: 240px">
              <el-option v-for="item in osList" :key="item" :label="item" :value="item" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
      </el-col>
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd">新建系统模板</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" :columns="systemList" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="systemList" style="width: 100%">
      <el-table-column prop="id" label="ID" width="100" />
      <el-table-column prop="name" label="系统镜像名" width="180" />
      <el-table-column prop="diskImage" label="系统镜像地址" width="200" show-overflow-tooltip />
      <el-table-column prop="clusterNames" label="所属节点" />
      <el-table-column prop="osType" label="操作系统类型" width="150" />
      <el-table-column prop="sort" label="排序" width="100" />
      <el-table-column prop="enabled" label="状态" width="100">
        <template #default="scope">
          <el-switch v-model="scope.row.enabled" @change="handleStatusChange(scope.row)" />
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="150">
        <template #default="scope">
          <el-tooltip v-if="scope.row.userId !== 1" content="修改" placement="top">
            <el-button link type="primary" icon="Edit" @click="handleEdit(scope.row)"></el-button>
          </el-tooltip>
          <el-tooltip v-if="scope.row.userId !== 1" content="绑定节点" placement="top">
            <el-button link type="primary" icon="CircleCheck" @click="handleBindCluster(scope.row)"></el-button>
          </el-tooltip>
          <el-tooltip v-if="scope.row.userId !== 1" content="删除" placement="top">
            <el-button link type="primary" icon="Delete" @click="handleDel(scope.row)"></el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>

    <!-- 弹框 -->
    <el-dialog v-model="dialogFormVisible" :title="title" @closed="handleClosed">
      <el-form ref="systemRef" :model="form" label-position="right" :rules="rules" label-width="140px">
        <el-form-item label="系统镜像名" prop="name">
          <el-input v-model="form.name" autocomplete="off" />
        </el-form-item>
        <el-form-item label="操作系统类型" prop="osType">
          <el-radio-group v-model="form.osType">
            <el-radio-button v-for="dict in server_os_type" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-radio-group>
        </el-form-item>
        <el-form-item label="系统镜像地址" prop="diskImage">
          <el-input v-model="form.diskImage" autocomplete="off" />
        </el-form-item>
        <el-form-item label="pve操作系统版本" prop="pveOsType">
          <el-select v-model="form.pveOsType" placeholder="请选择">
            <el-option
              v-for="dict in pve_os_type"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span>
          <el-button @click="dialogFormVisible = false">取消</el-button>
          <el-button type="primary" @click="handleConfirm"> 确认 </el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog v-model="clusterDialog" title="绑定节点" @closed="handleDialogClose">
      <el-form :model="form" label-position="right" label-width="100px">
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
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="clusterDialog = false">取消</el-button>
          <el-button type="primary" @click="handleClusterConfirm"> 确认 </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { listSystem, updateSystem, delSystem, addSystem, bindSystemAndCluster } from '@/api/server/template'
import { listCluster, treeCluster } from '@/api/server/cluster'

const { proxy } = getCurrentInstance()
const { server_os_type, pve_os_type } = proxy.useDict('server_os_type', 'pve_os_type')

const rules = ref({
  name: [{ required: true, message: '请填写镜像名', trigger: 'blur' }],
  diskImage: [{ required: true, message: '请填写镜像地址', trigger: 'blur' }],
  osType: [{ required: true, message: '请选择操作系统类型', trigger: 'blur' }],
  pveOsType: [{ required: true, message: '请选择pve操作系统', trigger: 'blur' }]
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

const systemList = ref([])
const clusterList = ref([])
const osList = ref([])

const getList = async () => {
  loading.value = true
  listSystem({ ...pageQuery.value, ...queryParams.value }).then(res => {
    loading.value = false
    systemList.value = res.rows
    total.value = res.total

    osList.value = new Set(res.rows.map(obj => obj.osType))
  })
}

getList()

const handleStatusChange = row => {
  updateSystem(row).then(() => {
    ElMessage.success('修改成功')
  })
}

listCluster({}).then(res => {
  clusterList.value = res.rows
})

const handleAdd = () => {
  title.value = '添加系统模板'
  dialogFormVisible.value = true
}

const handleEdit = row => {
  form.value = { ...row }
  title.value = '编辑系统模板'
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
  osType: 'centos',
  pveOsType: 'l26'
})

const title = ref('')

const handleClosed = () => {
  form.value = {
    osType: 'centos',
    pveOsType: 'l26'
  }
  proxy.resetForm('systemRef')
}

const handleConfirm = () => {
  proxy.$refs['systemRef'].validate(valid => {
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

const clusterIds = ref([])

const clusterRef = ref()
const clusterTree = ref([])
treeCluster().then(res => {
  clusterTree.value = res.data
})

const getSelected = () => {
  const val = clusterRef.value.getCheckedNodes(true, false)
  return val.map(obj => obj.id)
}

const clusterDialog = ref(false)
const handleBindCluster = row => {
  form.value = { ...row }
  if (row.clusterIds) {
    clusterIds.value = row.clusterIds.split(',')
  }
  clusterDialog.value = true
}

const handleClusterConfirm = () => {
  const data = getSelected()
  bindSystemAndCluster(form.value.id, data).then(() => {
    getList()
    ElMessage.success('绑定成功')
    clusterDialog.value = false
  })
}

const handleDialogClose = () => {}
</script>

<style lang="scss" scoped></style>
