<template>
  <div class="app-container">
    <div>
      <el-row :gutter="10" class="mb8">
        <el-col :span="1.5">
          <!-- <el-button type="primary" plain icon="Plus" @click="handleAdd">新建服务器</el-button> -->
        </el-col>
        <right-toolbar v-model:showSearch="showSearch" :columns="logList" @queryTable="getList"></right-toolbar>
      </el-row>

      <el-table v-loading="loading" :data="logList" style="width: 100%">
        <el-table-column prop="username" label="用户名" width="180" />
        <el-table-column prop="queueKey" label="定时任务" width="180" />
        <el-table-column prop="config" label="日志描述" width="180">
          <template #default="scope">
            <div>
              {{ '集群：' + scope.row.clusterName }}
            </div>
            <div>{{ 'VMID：' + scope.row.vmId }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="queueMsg" label="日志状态" />
        <el-table-column prop="queueProgress" label="进度" width="180">
          <template #default="scope">
            <el-progress :percentage="scope.row.queueProgress" :status="getProgressStatus(scope.row)" />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="开始时间" width="180" />
        <el-table-column prop="updateTime" label="结束时间" width="180" />
        <el-table-column label="操作" align="center" width="150" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-button
              v-if="scope.row.status === 'reboot'"
              v-hasPermi="['system:user:edit']"
              link
              type="primary"
              @click="rebootTask(scope.row)"
              >重启任务</el-button
            >
            <el-button v-if="scope.row.status === 'running'" link type="info" disabled>运行中</el-button>
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
    </div>
  </div>
</template>

<script setup>
import { listServerLog, restartTask } from '@/api/server/log'
import { createVM } from '@/api/server/task'

const total = ref(0)
const pageQuery = ref({
  pageNum: 1,
  pageSize: 10
})

const showSearch = ref(true)
const loading = ref(true)

const getList = async () => {
  loading.value = true
  listServerLog(pageQuery.value).then(res => {
    loading.value = false
    logList.value = res.rows
    total.value = res.total
  })
}

getList()

const logList = ref()

const getProgressStatus = row => {
  if (row.status === 'success') {
    return 'success'
  }
  if (row.status === 'fail' || row.status === 'reboot') {
    return 'exception'
  }
}

// 重启任务
const rebootTask = row => {
  ElMessageBox.confirm('确定重新开始任务吗？', '请确认', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('任务重启成功')
    restartTask(row.id)
    getList()
  })
}

// 新建服务器
const handleAdd = () => {
  const obj = {
    memory: 2048,
    sockets: 1,
    cores: 2,
    cpu: 'host',
    agent: true,
    osType: 'L26',
    description: '创建方式：mskvm  \n\n订单编号：#888  \n\n会员账号：ms  \n\n邮箱地址：1122@qq.com',
    onBoot: true,
    numa: true,
    scsihw: 'virtio-scsi-single',
    serial: 1,
    networks: [
      {
        model: 'virtio',
        bridge: 'vmbr1',
        firewall: true,
        rate: 20
      },
      {
        model: 'virtio',
        bridge: 'vmbr10',
        firewall: true,
        rate: 20
      }
    ],
    disks: [
      {
        diskType: 'scsi',
        storage: 'data',
        cache: 'none',
        size: 30,
        importFrom: '/kvm/qemu/Ubuntu-20.04.1-x64.qcow2',
        backup: true
      },
      {
        diskType: 'scsi',
        storage: 'data',
        cache: 'none',
        size: 40,
        backup: true
      }
    ],
    netIp: {
      pubIp: '120.233.27.157',
      priIp: '172.16.27.157',
      pubNetmask: '255.255.255.0',
      priNetmask: '255.255.0.0',
      gateway: '120.233.27.1',
      dns1: '119.29.29.29',
      dns2: '8.8.8.8'
    },
    sshPassword: '123456'
  }
  createVM(obj)
}
</script>

<style lang="scss" scoped></style>
