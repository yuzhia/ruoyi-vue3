<template>
  <div class="px-5 pt-5">
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd(null)">新建区域</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" :columns="regionList" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table
      v-loading="loading"
      :data="regionList"
      row-key="id"
      :default-expand-all="true"
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
    >
      <el-table-column prop="name" label="地区" />
      <el-table-column prop="sort" label="排序" />
      <el-table-column prop="enabled" label="状态">
        <template #default="scope">
          <el-switch v-model="scope.row.enabled" @change="handleStatusChange(scope.row)" />
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button v-if="scope.row.pid === 0" link type="primary" @click="handleAdd(scope.row.id)">新增</el-button>
          <el-button link type="primary" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      v-model="dialogFormVisible"
      :title="form.pid && form.pid !== 0 ? '新增二级区域' : '新增一级区域'"
      @closed="handleDialogClose"
    >
      <el-form ref="regionRef" :model="form" :rules="rules">
        <el-form-item v-if="form.pid && form.pid !== 0" label="上级菜单" prop="pid">
          <el-select v-model="form.pid" :data="regionList" placeholder="选择上级菜单">
            <el-option v-for="item in regionList" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="区域名称" prop="name">
          <el-input v-model="form.name" />
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
import { treeRegion, addRegion, updateRegion, delRegion } from '@/api/server/region'

const { proxy } = getCurrentInstance()

const rules = ref({
  name: [{ required: true, message: '请填写区域名', trigger: 'blur' }],
  pid: [{ required: true, message: '请选择上级区域', trigger: 'blur' }]
})

const showSearch = ref(true)
const loading = ref(true)

const regionList = ref([])

const getList = async () => {
  loading.value = true
  treeRegion().then(res => {
    loading.value = false
    regionList.value = res.data
  })
}

getList()

const handleStatusChange = row => {
  updateRegion(row).then(() => {
    getList()
    ElMessage.success('修改成功')
  })
}

const dialogFormVisible = ref(false)
const form = ref({
  pid: 0
})

const handleAdd = id => {
  if (id) {
    form.value.pid = id
  }
  dialogFormVisible.value = true
}

const handleDialogClose = () => {
  form.value = {
    pid: 0,
    name: null
  }
  proxy.resetForm('regionRef')
}

const handleConfirm = () => {
  proxy.$refs['regionRef'].validate(valid => {
    if (valid) {
      addRegion(form.value).then(() => {
        getList()
        ElMessage.success('添加成功')
        dialogFormVisible.value = false
      })
    }
  })
}

const handleDelete = row => {
  if (row.pid === 0 && row.children.length !== 0) {
    ElMessage.warning('请先删除子数据')
    return
  }
  delRegion(Array.of(row.id)).then(() => {
    getList()
    ElMessage.success('删除成功')
  })
}
</script>

<style lang="scss" scoped></style>
