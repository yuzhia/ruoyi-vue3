<template>
  <div class="px-5 pt-5">
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="gatewayDialog = true">添加网关</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" :columns="poolList" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="poolList" row-key="id">
      <el-table-column prop="name" label="名称" />
      <el-table-column prop="gateway" label="网关" />
      <el-table-column prop="clusterNames" label="所属节点" />
      <el-table-column prop="sort" label="起止IP">
        <template #default="scope">
          <div>{{ scope.row.ipStart }}</div>
          <div>{{ scope.row.ipEnd }}</div>
        </template>
      </el-table-column>
      <el-table-column prop="netmask" label="子网掩码" />
      <el-table-column prop="netType" label="网络类型">
        <template #default="scope">
          <el-tag>{{ scope.row.netType === 'extranet' ? '外网' : '内网' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="netCard" label="网卡" />
      <el-table-column prop="enabled" label="状态">
        <template #default="scope">
          <el-switch v-model="scope.row.enabled" @change="handleStatusChange(scope.row)" />
        </template>
      </el-table-column>
      <el-table-column prop="netCard" label="已使用/全部">
        <template #default="scope">
          <div>
            {{ scope.row.totalUsed ? scope.row.totalUsed : 0 }} / {{ scope.row.totalCount ? scope.row.totalCount : 0 }}
          </div>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="200" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-tooltip v-if="scope.row.userId !== 1" content="修改" placement="top">
            <el-button link type="primary" icon="Edit" @click="handleEdit(scope.row)"></el-button>
          </el-tooltip>
          <el-tooltip v-if="scope.row.userId !== 1" content="绑定节点" placement="top">
            <el-button link type="primary" icon="CircleCheck" @click="handleBindCluster(scope.row)"></el-button>
          </el-tooltip>
          <el-tooltip v-if="scope.row.userId !== 1" content="添加IP" placement="top">
            <el-button link type="primary" icon="plus" @click="handleAddIp(scope.row)"></el-button>
          </el-tooltip>
          <el-tooltip v-if="scope.row.userId !== 1" content="IP地址" placement="top">
            <el-button link type="primary" icon="link" @click="handleAddress(scope.row)"></el-button>
          </el-tooltip>
          <el-tooltip v-if="scope.row.userId !== 1" content="删除" placement="top">
            <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"></el-button>
          </el-tooltip>
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

    <el-dialog v-model="gatewayDialog" :title="form.id === 0 ? '新增网关' : '编辑网关'" @closed="handleDialogClose">
      <el-form ref="gatewayRef" :model="form" :rules="rules" label-position="right" label-width="100px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="IP类型" prop="ipType">
          <el-radio-group v-model="form.ipType">
            <el-radio-button label="ipv4" />
            <el-radio-button label="ipv6" />
          </el-radio-group>
          <el-radio-group v-model="form.netType" class="ml-2">
            <el-radio-button label="extranet">外网</el-radio-button>
            <el-radio-button label="intranet">内网</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="网关地址" prop="gateway">
          <el-input v-model="form.gateway" />
        </el-form-item>
        <el-form-item label="IP范围" prop="ipStart">
          <div class="flex gap-2">
            <el-input v-model="form.ipStart"> <template #prepend>开始IP</template></el-input>
            <el-input v-model="form.ipEnd"> <template #prepend>结束IP</template></el-input>
          </div>
        </el-form-item>
        <el-form-item label="网卡" prop="netCard">
          <el-input v-model="form.netCard" />
        </el-form-item>
        <el-form-item label="子网掩码" prop="netmask">
          <el-input v-model="form.netmask" />
        </el-form-item>
        <el-form-item label="DNS" prop="dns1">
          <div class="flex gap-2">
            <el-input v-model="form.dns1"> <template #prepend>首选</template></el-input>
            <el-input v-model="form.dns2"> <template #prepend>备用</template></el-input>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="gatewayDialog = false">取消</el-button>
          <el-button type="primary" @click="handleGatewayConfirm"> 确认 </el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog v-model="dialogFormVisible" title="新增IP" @closed="handleDialogClose">
      <el-form ref="ipRef" :model="form" label-position="right" :rules="ipRules" label-width="100px">
        <el-form-item label="网关">
          <el-input v-model="form.gateway" disabled />
        </el-form-item>
        <el-form-item label="开始IP" prop="ipStart">
          <el-input v-model="form.ipStart" />
        </el-form-item>
        <el-form-item label="结束IP" prop="ipEnd">
          <el-input v-model="form.ipEnd" />
        </el-form-item>
        <el-form-item label="使用状态">
          <el-radio-group v-model="form.used">
            <el-radio-button :label="0">未使用</el-radio-button>
            <el-radio-button :label="1">已使用</el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
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
import { treeCluster } from '@/api/server/cluster'
import { listPool, addAddress, addPool, updatePool, delPool, bindPoolAndCluster } from '@/api/server/address'

const router = useRouter()

const { proxy } = getCurrentInstance()

const rules = ref({
  name: [{ required: true, message: '请填写网关名', trigger: 'blur' }],
  gateway: [{ required: true, message: '请填写网关', trigger: 'blur' }],
  ipStart: [{ required: true, message: '请填写IP', trigger: 'blur' }],
  netCard: [{ required: true, message: '请填写网卡', trigger: 'blur' }],
  netmask: [{ required: true, message: '请填写子网掩码', trigger: 'blur' }]
})

const ipRules = ref({
  ipStart: [{ required: true, message: '请填写开始IP', trigger: 'blur' }],
  ipEnd: [{ required: true, message: '请填写结束IP', trigger: 'blur' }]
})

const total = ref(0)
const pageQuery = ref({
  pageNum: 1,
  pageSize: 10
})

const showSearch = ref(true)
const loading = ref(true)

const poolList = ref([])

const getList = async () => {
  loading.value = true
  listPool({ ...pageQuery.value }).then(res => {
    loading.value = false
    poolList.value = res.rows
    total.value = res.total
  })
}

getList()

const clusterDialog = ref(false)
const gatewayDialog = ref(false)
const dialogFormVisible = ref(false)
const form = ref({
  id: 0,
  ipType: 'ipv4',
  netType: 'extranet',
  dns1: '119.29.29.29',
  dns2: '8.8.8.8'
})

const handleStatusChange = row => {
  updatePool(row).then(() => {
    getList()
    ElMessage.success('修改成功')
  })
}

const handleBindCluster = row => {
  form.value = { ...row }
  if (row.clusterIds) {
    clusterIds.value = row.clusterIds.split(',')
  }
  clusterDialog.value = true
}

const handleClusterConfirm = () => {
  const data = getSelected()
  bindPoolAndCluster(form.value.id, data).then(() => {
    getList()
    ElMessage.success('绑定成功')
    clusterDialog.value = false
  })
}

const handleEdit = row => {
  form.value = { ...row }
  gatewayDialog.value = true
}

const handleAddress = row => {
  router.push('/server/address-edit?poolId=' + row.id)
}

const handleAddIp = row => {
  form.value = { ...row }
  form.value.used = 0
  dialogFormVisible.value = true
}

const handleDialogClose = () => {
  form.value = {
    id: 0,
    ipType: 'ipv4',
    netType: 'extranet',
    dns1: '119.29.29.29',
    dns2: '8.8.8.8'
  }
  proxy.resetForm('gatewayRef')
}

const handleGatewayConfirm = () => {
  // form.value.clusterIds = getSelected()
  proxy.$refs['gatewayRef'].validate(valid => {
    if (valid) {
      if (!form.value.id) {
        addPool(form.value).then(() => {
          ElMessage.success('操作成功')
          gatewayDialog.value = false
          getList()
        })
      } else {
        updatePool(form.value).then(() => {
          ElMessage.success('操作成功')
          gatewayDialog.value = false
          getList()
        })
      }
    }
  })
}

// IP
const handleConfirm = () => {
  proxy.$refs['ipRef'].validate(valid => {
    if (valid) {
      form.value.ipPoolId = form.value.id
      addAddress(form.value).then(() => {
        router.push('/server/address-edit?poolId=' + form.value.id)
      })
    }
  })
}

const handleDelete = row => {
  proxy.$modal
    .confirm('是否确认删除用户编号为"' + row.id + '"的数据项？')
    .then(function () {
      return delPool(row.id)
    })
    .then(() => {
      getList()
      proxy.$modal.msgSuccess('删除成功')
    })
    .catch(() => {})
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
</script>

<style lang="scss" scoped></style>
