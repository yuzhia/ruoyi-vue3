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
          <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
      </el-col>
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd">新建优惠券规则</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" :columns="couponRuleList" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="couponRuleList" style="width: 100%">
      <el-table-column prop="id" label="ID" width="100" />
      <el-table-column prop="name" label="优惠券名" width="180" />
      <el-table-column prop="type" label="优惠券类型" width="150">
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
      <el-table-column label="有效期" width="230">
        <template #default="scope">
          <div v-if="scope.row.validityType === 'ABSOLUTE'">
            <div>{{ scope.row.startTime }} 至</div>
            <div>{{ scope.row.endTime }}</div>
          </div>
          <div v-else>领取后当天生效，{{ scope.row.duration }} 天有效期</div>
        </template>
      </el-table-column>
      <el-table-column prop="quantity" label="券数量" width="150">
        <template #default="scope">
          <div>
            {{ scope.row.quantity == 0 ? '不限制' : scope.row.quantity }}
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="quantityLimitPerUser" label="每人领取限制">
        <template #default="scope">
          <div>{{ scope.row.quantityLimitPerUser == 0 ? '不限制' : scope.row.quantityLimitPerUser }}</div>
        </template>
      </el-table-column>
      <el-table-column prop="availableServices" label="可用业务">
        <template #default="scope">
          <el-tag v-for="item in scope.row.availableServices" :key="item">{{ services[item] }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="availableRegion" label="可用区">
        <template #default="scope">
          <el-tag v-for="item in scope.row.availableRegion" :key="item">{{ getNameById(item) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="enabled" label="状态" width="100">
        <template #default="scope">
          <el-switch v-model="scope.row.enabled" @change="handleStatusChange(scope.row)" />
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
      <el-form ref="couponRuleRef" :rules="rules" :model="form" label-position="right" label-width="140px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" autocomplete="off" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <div class="flex flex-col gap-2">
            <el-select v-model="form.type" placeholder="请选择">
              <el-option
                v-for="dict in coupon_type"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              ></el-option>
            </el-select>
            <div v-if="form.type === 'FIX_COUPON'" class="flex items-center h-10 gap-1">
              <span>满</span>
              <el-input-number v-model="form.threshold" :min="1" :controls="false" />
              <span>元</span>
              <span>减</span>
              <el-input-number v-model="form.discount" :min="0.1" :controls="false" />
              <span>元</span>
            </div>
            <div v-else-if="form.type === 'DISCOUNT_COUPON'">
              <div>
                <span>折扣 </span>
                <el-input-number v-model="form.discount" :min="0.1" :max="9.9" :controls="false" />
              </div>
              <div class="flex items-center h-10 gap-1">
                <span>满</span>
                <el-input-number v-model="form.threshold" :min="0" :controls="false" />
                <span>元可用，最高优惠</span>
                <el-input-number v-model="form.maxDiscount" :min="0.1" :controls="false" />
                <span>元</span>
              </div>
            </div>
            <div v-else class="flex items-center h-10 gap-1">
              <span>立减</span>
              <el-input-number v-model="form.discount" :min="0.1" :controls="false" />
              <span>元</span>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="有效期" prop="validityType">
          <el-radio-group v-model="form.validityType">
            <el-radio-button v-for="dict in validity_type" :key="dict.value" :label="dict.value">{{
              dict.label
            }}</el-radio-button>
          </el-radio-group>
          <div v-if="form.validityType === 'ABSOLUTE'" class="ml-2">
            <el-date-picker
              v-model="form.startTime"
              value-format="YYYY-MM-DD HH:mm:ss"
              type="datetime"
              placeholder="选择开始时间"
            />
            <el-date-picker
              v-model="form.endTime"
              value-format="YYYY-MM-DD HH:mm:ss"
              type="datetime"
              placeholder="选择结束时间"
            />
          </div>
          <div v-else class="ml-2">
            <span>领取后当天生效，有效天数</span>
            <el-input-number v-model="form.duration" class="ml-2" :controls="false" :min="1" />
          </div>
        </el-form-item>
        <el-form-item label="发放数量">
          <el-input-number v-model="form.quantity" :controls="false" :min="0" placeholder="0表示无限制" />
        </el-form-item>
        <el-form-item label="每人限领">
          <el-input-number v-model="form.quantityLimitPerUser" :controls="false" :min="0" placeholder="0表示无限制" />
        </el-form-item>
        <el-form-item label="可用业务">
          <el-checkbox-group v-model="form.availableServices">
            <el-checkbox v-for="[key, val] of Object.entries(services)" :key="key" :label="key">{{ val }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="可用地区">
          <el-checkbox-group v-model="form.availableRegion">
            <el-checkbox v-for="item in regionList" :key="item.id" :label="item.id">{{ item.name }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="备注">
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
import { listRule, updateRule, addRule, delRule, listServices } from '@/api/coupon/rule'
import { topRegion } from '@/api/server/region'

const { proxy } = getCurrentInstance()
const { coupon_type, validity_type } = proxy.useDict('coupon_type', 'validity_type')

const rules = ref({
  name: [{ required: true, message: '请填写镜像名', trigger: 'blur' }]
})

const total = ref(0)
const pageQuery = ref({
  pageNum: 1,
  pageSize: 10
})

const queryParams = ref({
  name: null
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

const couponRuleList = ref([])
const osList = ref([])

const getList = async () => {
  loading.value = true
  listRule({ ...pageQuery.value, ...queryParams.value }).then(res => {
    loading.value = false
    couponRuleList.value = res.rows
    total.value = res.total

    osList.value = new Set(res.rows.map(obj => obj.osType))
  })
}

getList()

// 查询地区
const regionList = ref([])
topRegion().then(res => {
  regionList.value = res.data
})

const getNameById = id => {
  const region = regionList.value.find(obj => obj.id === id)
  if (region) {
    return region.name
  }
}

const services = ref({})
listServices().then(res => {
  services.value = res.data
})

const handleStatusChange = row => {
  updateRule(row).then(() => {
    ElMessage.success('修改成功')
  })
}

const handleAdd = () => {
  title.value = '添加优惠券规则'
  dialogFormVisible.value = true
}

const handleEdit = row => {
  form.value = { ...row }
  title.value = '编辑优惠券规则'
  dialogFormVisible.value = true
}

const handleDel = id => {
  proxy.$modal
    .confirm('确认删除吗?')
    .then(() => {
      return delRule(id)
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
  validityType: 'ABSOLUTE'
  //   quantity: 0,
  //   quantityLimitPerUser: 0
})

const title = ref('')

const handleClosed = () => {
  form.value = {
    type: 'FIX_COUPON',
    validityType: 'ABSOLUTE'
  }
}

const handleConfirm = () => {
  if (!form.value.id) {
    addRule(form.value).then(() => {
      ElMessage.success('操作成功')
      dialogFormVisible.value = false
      getList()
    })
  } else {
    updateRule(form.value).then(() => {
      ElMessage.success('操作成功')
      dialogFormVisible.value = false
      getList()
    })
  }
}
</script>

<style lang="scss" scoped></style>
