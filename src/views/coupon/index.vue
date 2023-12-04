<template>
  <div class="px-5 pt-5">
    <el-row :gutter="10" class="mb8">
      <el-col :span="24">
        <el-form v-show="showSearch" ref="queryRef" :model="queryParams" :inline="true" label-width="100px">
          <el-form-item label="优惠券名称" prop="name">
            <el-input
              v-model="queryParams.name"
              placeholder="请输入优惠券名称"
              clearable
              style="width: 240px"
              @keyup.enter="handleQuery"
            />
          </el-form-item>
          <el-form-item label="优惠券状态" prop="status">
            <el-select v-model="queryParams.status" placeholder="请选择">
              <el-option
                v-for="dict in coupon_status"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="优惠券类型" prop="type">
            <el-select v-model="queryParams.type" placeholder="请选择">
              <el-option
                v-for="dict in coupon_type"
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
        <el-button type="primary" plain icon="Plus" @click="handleAdd">新建优惠券</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" :columns="couponList" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="couponList" style="width: 100%">
      <el-table-column prop="id" label="ID" width="100" />
      <el-table-column prop="sn" label="编码" width="180" />
      <el-table-column prop="username" label="用户" width="180" />
      <el-table-column prop="name" label="优惠券名" width="180" />
      <el-table-column prop="type" label="优惠券类型" width="180">
        <template #default="scope">
          <dict-tag :options="coupon_type" :value="scope.row.type" />
        </template>
      </el-table-column>
      <el-table-column prop="discount" label="优惠信息">
        <template #default="scope">
          <div v-if="scope.row.type === 'FIX_COUPON'">
            {{ '满 ' + scope.row.threshold + ' 减 ' + scope.row.discount }}
          </div>
          <div v-else-if="scope.row.type === 'DISCOUNT_COUPON'">
            <div v-if="scope.row.threshold !== 0">
              {{ '满 ' + scope.row.threshold + ' 打 ' + scope.row.discount + ' 折' }}
            </div>
            <div v-else>{{ '打 ' + scope.row.discount + ' 折' }}</div>
          </div>
          <div v-else>{{ '立减 ' + scope.row.discount }}</div>
        </template>
      </el-table-column>
      <el-table-column label="有效期">
        <template #default="scope">
          <div>{{ scope.row.startTime }} 至</div>
          <div>{{ scope.row.endTime }}</div>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <dict-tag :options="coupon_status" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="150">
        <template #default="scope">
          <el-tooltip content="修改" placement="top">
            <el-button link type="primary" icon="Edit" @click="handleEdit(scope.row)"></el-button>
          </el-tooltip>
          <el-tooltip content="删除" placement="top">
            <el-button link type="primary" icon="Delete" @click="handleDel(scope.row)"></el-button>
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

    <!-- 弹框 -->
    <el-dialog v-model="dialogFormVisible" :title="title" @closed="handleClosed">
      <el-form ref="couponRef" :model="form" :rules="rules" label-position="right" label-width="140px">
        <el-form-item v-if="title === '编辑优惠券'" label="编码">
          <el-input v-model="form.sn" disabled />
        </el-form-item>
        <el-form-item label="所属用户" prop="userIds">
          <div v-if="title === '添加优惠券'">
            <el-button @click="openSelectUser">添加用户</el-button>
            <el-tag v-for="item in userSelectedList" :key="item.id" closable class="ml-2" @close="closeTag(item.id)"
              >{{ item.username }}
            </el-tag>
          </div>
          <el-input v-else v-model="form.username" disabled />
        </el-form-item>
        <el-form-item label="优惠券规则" prop="ruleId">
          <el-select v-model="form.ruleId" placeholder="请选择" :disabled="title === '编辑优惠券'">
            <el-option v-for="item in couponRuleList" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="有效期">
          <el-radio-group v-model="form.status">
            <el-radio-button v-for="dict in coupon_status" :key="dict.value" :label="dict.value"
              >{{ dict.label }}
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span>
          <el-button @click="dialogFormVisible = false">取消</el-button>
          <el-button type="primary" @click="handleConfirm"> 确认 </el-button>
        </span>
      </template>
    </el-dialog>

    <SelectUser ref="userSelectRef" :user-page-api="listUser" :checked-user-list="form.userIds" @onBack="userBack" />
  </div>
</template>

<script setup>
import { listCoupon, addCoupon, updateCoupon, delCoupon } from '@/api/coupon'
import { listUser } from '@/api/system/user'
import { listRule } from '@/api/coupon/rule'
import { watch } from 'vue'

const { proxy } = getCurrentInstance()
const { coupon_type, coupon_status } = proxy.useDict('coupon_type', 'coupon_status')

const rules = ref({
  userIds: [{ required: true, message: '请选择用户', trigger: 'change' }],
  ruleId: [{ required: true, message: '请选择优惠券规则', trigger: 'blur' }]
})

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

// 查
const total = ref(0)
const pageQuery = ref({
  pageNum: 1,
  pageSize: 10
})

const queryParams = ref({
  name: null,
  status: null,
  type: null
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

const couponList = ref([])
const osList = ref([])

const getList = async () => {
  loading.value = true
  listCoupon({ ...pageQuery.value, ...queryParams.value }).then(res => {
    loading.value = false
    couponList.value = res.rows
    total.value = res.total

    osList.value = new Set(res.rows.map(obj => obj.osType))
  })
}

getList()

const couponRuleList = ref([])
listRule({}).then(res => {
  couponRuleList.value = res.rows
})

const handleAdd = () => {
  title.value = '添加优惠券'
  dialogFormVisible.value = true
}

const handleEdit = row => {
  form.value = { ...row }
  title.value = '编辑优惠券'
  dialogFormVisible.value = true
}

const handleDel = id => {
  proxy.$modal
    .confirm('确认删除吗?')
    .then(() => {
      return delCoupon(id)
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
  status: 'UNUSED'
  //   quantity: 0,
  //   quantityLimitPerUser: 0
})

const title = ref('')

const handleClosed = () => {
  form.value = {
    status: 'UNUSED',
    userIds: []
  }
  userSelectedList.value = []
  proxy.resetForm('couponRef')
}

const handleConfirm = () => {
  proxy.$refs['couponRef'].validate(valid => {
    if (valid) {
      if (!form.value.id) {
        addCoupon(form.value).then(() => {
          ElMessage.success('操作成功')
          dialogFormVisible.value = false
          getList()
        })
      } else {
        updateCoupon(form.value).then(() => {
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
