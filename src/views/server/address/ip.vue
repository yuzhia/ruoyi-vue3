<template>
  <div class="px-5 pt-5">
    <el-row :gutter="10" class="mb8">
      <right-toolbar v-model:showSearch="showSearch" :columns="addressList" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="addressList" row-key="id">
      <el-table-column prop="ip" label="IP地址" />
      <el-table-column prop="orderDetailId" label="订单号" />
      <el-table-column prop="netmask" label="占用">
        <template #default="scope">
          <el-checkbox v-model="scope.row.used" @change="handleStatusChange(scope.row)" />
        </template>
      </el-table-column>
      <el-table-column prop="enabled" label="状态">
        <template #default="scope">
          <el-switch v-model="scope.row.enabled" @change="handleStatusChange(scope.row)" />
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button link type="primary" @click="handleDelete(scope.row)">删除</el-button>
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

    <el-dialog v-model="dialogFormVisible" title="编辑IP" @closed="handleDialogClose">
      <el-form ref="ipRef" :model="form" :rules="rules" label-position="right" label-width="100px">
        <el-form-item label="IP地址" prop="ip">
          <el-input v-model="form.ip" />
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
  </div>
</template>

<script setup>
import { listAddress, updateAddress, delAddress } from '@/api/server/address'

const route = useRoute()

const { proxy } = getCurrentInstance()

const rules = ref({
  ip: [{ required: true, message: '请填写IP', trigger: 'blur' }]
})

const total = ref(0)
const pageQuery = ref({
  pageNum: 1,
  pageSize: 10
})

const queryParams = ref({
  poolId: route.query.poolId
})

const showSearch = ref(true)
const loading = ref(true)

const addressList = ref([])

const getList = async () => {
  loading.value = true
  listAddress({ ...pageQuery.value, ...queryParams.value }).then(res => {
    loading.value = false
    addressList.value = res.rows
    total.value = res.total
  })
}

getList()

const dialogFormVisible = ref(false)
const form = ref({
  pid: 0
})

const handleStatusChange = row => {
  updateAddress(row).then(() => {
    getList()
    ElMessage.success('修改成功')
  })
}

const handleEdit = row => {
  form.value = { ...row }
  form.value.used = 0
  dialogFormVisible.value = true
}

const handleDialogClose = () => {
  form.value = {
    pid: 0,
    name: null
  }
}

const handleConfirm = () => {}

const handleDelete = row => {
  delAddress(Array.of(row.id)).then(() => {
    getList()
    ElMessage.success('删除成功')
  })
}
</script>

<style lang="scss" scoped></style>
