<template>
  <!-- 授权用户 -->
  <el-dialog v-model="visible" title="选择用户" width="800px" top="5vh" append-to-body>
    <el-form ref="queryRef" :model="queryParams" :inline="true">
      <el-form-item label="用户名称" prop="userName">
        <el-input
          v-model="queryParams.userName"
          placeholder="请输入用户名称"
          clearable
          style="width: 200px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="手机号码" prop="phonenumber">
        <el-input
          v-model="queryParams.phonenumber"
          placeholder="请输入手机号码"
          clearable
          style="width: 200px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <el-row>
      <el-table
        ref="refTable"
        :data="userList"
        height="260px"
        @row-click="clickRow"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column label="用户名称" prop="userName" :show-overflow-tooltip="true" />
        <el-table-column label="邮箱" prop="email" :show-overflow-tooltip="true" />
        <el-table-column label="手机" prop="phonenumber" :show-overflow-tooltip="true" />
        <el-table-column label="状态" align="center" prop="status">
          <template #default="scope">
            <dict-tag :options="sys_normal_disable" :value="scope.row.status" />
          </template>
        </el-table-column>
      </el-table>
      <pagination
        v-show="total > 0"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        :total="total"
        @pagination="getList"
      />
    </el-row>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="handleSelectUser">确 定</el-button>
        <el-button @click="visible = false">取 消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup name="SelectUser">
import { nextTick } from 'vue'

const { proxy } = getCurrentInstance()
const { sys_normal_disable } = proxy.useDict('sys_normal_disable')

const props = defineProps({
  isRadio: {
    type: Boolean
  },
  userPageApi: {
    type: Function,
    default: function () {}
  },
  checkedUserList: {
    type: Array,
    default() {
      return []
    }
  }
})

const isRadio = props.isRadio || false

const userList = ref([])
const visible = ref(false)
const total = ref(0)
const selectedData = ref([])

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  userName: undefined,
  phonenumber: undefined
})

// 显示弹框
const show = () => {
  getList()
  visible.value = true
}

const comeBack = () => {
  if (props.checkedUserList.length === 0) {
    return
  }
  userList.value.forEach(ele => {
    if (props.checkedUserList.some(item => item === ele.userId)) {
      nextTick(() => {
        proxy.$refs['refTable'].toggleRowSelection(ele)
      })
    }
  })
}

/**选择行 */
const clickRow = row => {
  proxy.$refs['refTable'].toggleRowSelection(row)
}
// 多选框选中数据
const handleSelectionChange = selection => {
  selectedData.value = selection
}
// 查询表数据
const getList = () => {
  props.userPageApi(queryParams).then(res => {
    userList.value = res.rows
    total.value = res.total
    // 回显选项
    comeBack()
  })
}
/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNum = 1
  getList()
}
/** 重置按钮操作 */
const resetQuery = () => {
  proxy.resetForm('queryRef')
  handleQuery()
}
const emit = defineEmits(['onBack'])

// 选择用户操作
const handleSelectUser = () => {
  if (isRadio && selectedData.value.length > 1) {
    ElMessage.warning('只可选择一条')
    return
  }
  const emitVal = selectedData.value.map(obj => {
    return {
      id: obj.userId,
      username: obj.userName
    }
  })
  emit('onBack', emitVal)
  visible.value = false
}

defineExpose({
  show
})
</script>
