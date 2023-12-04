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
      <right-toolbar v-model:showSearch="showSearch" :columns="couponsList" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="couponsList" style="width: 100%">
      <el-table-column prop="id" label="ID" width="100" />
      <el-table-column prop="code" label="优惠码" width="180" />
      <el-table-column prop="type" label="优惠券类型" width="180">
        <template #default="scope">
          <dict-tag :options="coupon_type" :value="scope.row.type" />
        </template>
      </el-table-column>
      <el-table-column prop="amount" label="价值" width="180" />
      <el-table-column prop="recurring" label="循环优惠" width="180">
        <template #default="scope">
          <el-switch v-model="scope.row.recurring" disabled />
        </template>
      </el-table-column>
      <el-table-column prop="uses" label="已使用次数" width="180" />
      <el-table-column prop="startDate" label="开始时间" />
      <el-table-column prop="expirationDate" label="失效时间" />
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
      <el-form ref="couponsRef" :model="form" :rules="rules" label-position="right" label-width="160px">
        <el-form-item label="优惠码" prop="code">
          <div class="flex gap-2">
            <el-input v-model="form.code" />
            <el-button @click="autoGen">自动生成</el-button>
          </div>
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="form.type" placeholder="选择类型">
            <el-option
              v-for="dict in coupon_type"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="循环优惠" prop="recurring">
          <el-switch v-model="form.recurring" inline-prompt active-text="启用" inactive-text="禁用" />
        </el-form-item>
        <el-form-item v-if="form.recurring" label="循环次数" prop="recurringCount">
          <el-input-number v-model="form.recurringCount" :min="0" />
        </el-form-item>
        <el-form-item label="价值" prop="amount">
          <el-input-number v-model="form.amount" :min="0" />
        </el-form-item>
        <el-form-item label="适用于" prop="applies">
          <el-select v-model="form.applies" multiple placeholder="选择产品" style="width: 300px">
            <el-option v-for="item in instanceList" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="需要" prop="applies">
          <el-select v-model="form.requires" multiple placeholder="选择产品" style="width: 300px">
            <el-option v-for="item in instanceList" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="有效期" prop="startDate">
          <el-date-picker v-model="form.startDate" value-format="YYYY-MM-DD" type="date" placeholder="选择开始时间" />
          <el-date-picker
            v-model="form.expirationDate"
            value-format="YYYY-MM-DD"
            type="date"
            placeholder="选择结束时间"
          />
        </el-form-item>
        <el-form-item label="最大使用次数" prop="maxUses">
          <el-input-number v-model="form.maxUses" :min="0" />
        </el-form-item>
        <el-form-item label="每个用户只能使用一次" prop="oncePerUser">
          <el-switch v-model="form.oncePerUser" inline-prompt active-text="启用" inactive-text="禁用" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span>
          <el-button @click="dialogFormVisible = false">取消</el-button>
          <el-button type="primary" @click="handleConfirm"> 确认 </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { listCoupons, addCoupons, updateCoupons, delCoupons } from '@/api/coupon/coupons'
import { listInstance } from '@/api/server/instance'
import { createUniqueString } from '@/utils'

const { proxy } = getCurrentInstance()
const { coupon_type } = proxy.useDict('coupon_type')

const rules = ref({
  code: [{ required: true, message: '请填写优惠码', trigger: 'blur' }],
  type: [{ required: true, message: '请选择优惠券类型', trigger: 'blur' }]
})

const instanceList = ref([])
listInstance({}).then(res => {
  instanceList.value = res.rows
})

const autoGen = () => {
  form.value.code = createUniqueString()
}

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

const couponsList = ref([])

const getList = async () => {
  loading.value = true
  listCoupons({ ...pageQuery.value, ...queryParams.value }).then(res => {
    loading.value = false
    couponsList.value = res.rows
    total.value = res.total
  })
}

getList()

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
      return delCoupons(id)
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
  type: 'FIX_COUPON',
  recurringCount: 0,
  amount: 0,
  maxUses: 0
  //   quantity: 0,
  //   quantityLimitPerUser: 0
})

const title = ref('')

const handleClosed = () => {
  form.value = {
    type: 'FIX_COUPON',
    recurringCount: 0,
    amount: 0,
    maxUses: 0
  }
  proxy.resetForm('couponsRef')
}

const handleConfirm = () => {
  proxy.$refs['couponsRef'].validate(valid => {
    if (valid) {
      if (!form.value.id) {
        addCoupons(form.value).then(() => {
          ElMessage.success('操作成功')
          dialogFormVisible.value = false
          getList()
        })
      } else {
        updateCoupons(form.value).then(() => {
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
