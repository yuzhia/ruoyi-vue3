<template>
  <div class="px-5 pt-5">
    <el-row :gutter="10" class="mb8">
      <el-col :span="24">
        <el-form v-show="showSearch" ref="queryRef" :model="queryParams" :inline="true" label-width="68px">
          <el-form-item label="节点名称" prop="name">
            <el-input
              v-model="queryParams.name"
              placeholder="请输入节点名称"
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
        <el-button type="primary" plain icon="Plus">新建节点</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" :columns="clusterList" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="clusterList" style="width: 100%">
      <el-table-column prop="id" label="ID" width="100" />
      <el-table-column prop="name" label="节点名称" width="180" />
      <el-table-column label="接口地址">
        <template #default="scope">
          <a :href="'https://' + scope.row.ip + ':' + scope.row.port" target="_blank" class="text-#0096e0">{{
            'https://' + scope.row.ip + ':' + scope.row.port
          }}</a>
        </template>
      </el-table-column>
      <el-table-column label="用户名@领域">
        <template #default="scope">
          <div>{{ scope.row.username + '@' + scope.row.realm }}</div>
        </template>
      </el-table-column>
      <el-table-column prop="stock" label="库存" width="100">
        <template #default="scope">
          <el-input v-model="scope.row.stock" @keyup.enter="handleStatusChange(scope.row)" />
        </template>
      </el-table-column>
      <el-table-column prop="sort" label="排序" width="100" />
      <el-table-column prop="enabled" label="状态" width="100">
        <template #default="scope">
          <el-switch v-model="scope.row.enabled" @change="handleStatusChange(scope.row)" />
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="150" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" @click="handleCopy(scope.row)">复制</el-button>
          <el-button link type="primary" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button link type="primary" @click="handleDelete(scope.row.id)">删除</el-button>
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
    <el-dialog v-model="dialogVisible" title="编辑Proxmox VE" width="40%">
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 基本配置 -->
        <el-tab-pane label="基本配置" name="basic">
          <el-form :model="form" label-width="120px">
            <el-row>
              <el-col :span="24">
                <el-form-item label="节点名称">
                  <el-input v-model="form.name" />
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="绑定区域">
                  <el-tree-select
                    v-model="form.regionId"
                    :check-strictly="false"
                    :data="regionList"
                    :render-after-expand="false"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="简介">
                  <el-input v-model="form.desc" type="textarea" />
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="处理器">
                  <div class="flex flex-1 justify-between gap-10">
                    <el-input v-model="form.basicConfig.cpuType">
                      <template #prepend>型号</template>
                    </el-input>
                    <el-input v-model="form.basicConfig.cpuHz">
                      <template #prepend>频率</template>
                    </el-input>
                  </div>
                </el-form-item>
              </el-col>

              <el-col :span="12">
                <el-form-item label="高可用">
                  <el-radio-group v-model="form.basicConfig.ha">
                    <el-radio-button :label="false">禁用</el-radio-button>
                    <el-radio-button :label="true">启用</el-radio-button>
                  </el-radio-group>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item>
                  <el-input v-model="form.basicConfig.storageType">
                    <template #prepend>存储类型</template>
                  </el-input>
                </el-form-item>
              </el-col>

              <el-col :span="24">
                <el-form-item label="防火墙">
                  <el-radio-group v-model="form.basicConfig.firewall">
                    <el-radio-button :label="false">禁用</el-radio-button>
                    <el-radio-button :label="true">启用</el-radio-button>
                  </el-radio-group>
                </el-form-item>
              </el-col>

              <el-col :span="12">
                <el-form-item label="CPU核心">
                  <el-input-number v-model="form.basicConfig.cpu" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="内存大小">
                  <div class="flex">
                    <el-input-number v-model="form.basicConfig.memory" />
                    <div class="el-input-group__prepend">G</div>
                  </div>
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="硬盘容量">
                  <el-input-number v-model="form.basicConfig.diskSize" />
                  <div class="el-input-group__prepend">G</div>
                </el-form-item>
              </el-col>

              <el-col :span="24">
                <el-form-item label="VNC远程连接">
                  <el-radio-group v-model="form.basicConfig.vnc">
                    <el-radio-button :label="false">禁用</el-radio-button>
                    <el-radio-button :label="true">启用</el-radio-button>
                  </el-radio-group>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-tab-pane>

        <!-- 接口配置 -->
        <el-tab-pane label="接口配置" name="interface">
          <el-form :model="form" label-width="100px">
            <el-form-item label="接口地址">
              <div class="flex flex-1 justify-between gap-10">
                <el-input v-model="form.ip" />
                <el-input v-model="form.port">
                  <template #prepend>连接端口</template>
                </el-input>
              </div>
            </el-form-item>
            <el-form-item label="SSH IP">
              <div class="flex flex-1 justify-between gap-10">
                <el-input v-model="form.sshIp" />
                <el-input v-model="form.sshPort" placeholder="默认22">
                  <template #prepend>SSH端口</template>
                </el-input>
              </div>
            </el-form-item>
            <el-form-item label="用户名">
              <div class="flex flex-1 justify-between gap-10">
                <el-input v-model="form.username" />
                <el-input v-model="form.password" placeholder="不修改留空即可">
                  <template #prepend>密码</template>
                </el-input>
              </div>
            </el-form-item>
            <el-form-item label="领域">
              <el-select v-model="form.realm" class="w-full">
                <el-option label="Linux PAM standard authentication" value="pam" />
                <el-option label="Proxmox VE authentication server" value="pve" />
              </el-select>
            </el-form-item>
            <el-form-item prop="verifySsl" label="SSL连接">
              <div class="flex gap-5">
                <el-radio-group v-model="form.verifySsl">
                  <el-radio-button :label="false">否</el-radio-button>
                  <el-radio-button :label="true">是</el-radio-button>
                </el-radio-group>
                <el-button @click="handleTestConnect">测试连接</el-button>
              </div>
            </el-form-item>
            <el-form-item label="系统盘">
              <el-select v-model="form.basicConfig.systemStorage" class="w-full">
                <el-option label="local" value="local" />
                <el-option label="data" value="data" />
              </el-select>
            </el-form-item>
            <el-form-item label="数据盘">
              <el-select v-model="form.basicConfig.dataStorage" class="w-full">
                <el-option label="local" value="local" />
                <el-option label="data" value="data" />
              </el-select>
            </el-form-item>
            <el-form-item label="备份盘">
              <el-select v-model="form.basicConfig.backupStorage" class="w-full">
                <el-option label="local" value="local" />
                <el-option label="data" value="data" />
              </el-select>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 服务器配置 -->
        <el-tab-pane label="服务器配置" name="server">
          <el-form :model="form.serverConfig" label-width="100px">
            <el-row>
              <el-col :span="12">
                <el-form-item label="Qemu代理">
                  <el-radio-group v-model="form.serverConfig.agent">
                    <el-radio-button :label="false">禁用</el-radio-button>
                    <el-radio-button :label="true">启用</el-radio-button>
                  </el-radio-group>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="BIOS">
                  <el-radio-group v-model="form.serverConfig.bios">
                    <el-radio-button label="seabios">SeaBIOS</el-radio-button>
                    <el-radio-button label="ovmf">OVMF(UEFI)</el-radio-button>
                  </el-radio-group>
                </el-form-item>
              </el-col>
              <!--  -->
              <el-col :span="12">
                <el-form-item label="机型">
                  <el-radio-group v-model="form.serverConfig.machine">
                    <el-radio-button label="i440fx">Default(i440fx)</el-radio-button>
                    <el-radio-button label="q35">Q35</el-radio-button>
                  </el-radio-group>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Xterm">
                  <el-radio-group v-model="form.serverConfig.xterm">
                    <el-radio-button :label="false">禁用</el-radio-button>
                    <el-radio-button :label="true">启用</el-radio-button>
                  </el-radio-group>
                </el-form-item>
              </el-col>
              <!--  -->
              <el-col :span="12">
                <el-form-item label="NUMA">
                  <el-radio-group v-model="form.serverConfig.numa">
                    <el-radio-button :label="false">禁用</el-radio-button>
                    <el-radio-button :label="true">启用</el-radio-button>
                  </el-radio-group>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="CPU类型">
                  <el-select v-model="form.serverConfig.cpu" class="w-full">
                    <el-option label="host / Host" value="host" />
                    <el-option label="kvm64 / QEMU" value="kvm64" />
                    <el-option label="qemu64 / QEMU" value="qemu64" />
                    <el-option label="x86-64-v2-AES" value="x86-64-v2-AES" />
                  </el-select>
                </el-form-item>
              </el-col>
              <!--  -->
              <!-- <el-col :span="24">
                <el-form-item label="网卡名">
                  <div class="flex flex-1 justify-between gap-10">
                    <el-input v-model="form.serverConfig.publicNetName">
                      <template #prepend>公网网卡名</template>
                    </el-input>
                    <el-input v-model="form.serverConfig.privateNetName">
                      <template #prepend>内网网卡名</template>
                    </el-input>
                  </div>
                </el-form-item>
              </el-col> -->
              <!--  -->
              <el-col :span="24">
                <el-form-item label="防火墙">
                  <el-radio-group v-model="form.serverConfig.firewall">
                    <el-radio-button :label="false">禁用</el-radio-button>
                    <el-radio-button :label="true">启用</el-radio-button>
                  </el-radio-group>
                </el-form-item>
              </el-col>
              <!--  -->
              <el-col :span="24">
                <el-form-item label="SCSI控制器">
                  <el-select v-model="form.serverConfig.scsihw">
                    <el-option label="VirtIO SCSI（默认）" value="virtio-scsi-pci" />
                    <el-option label="VirtIO SCSI single" value="virtio-scsi-single" />
                    <el-option label="LSI 53C895A" value="lsi" />
                    <el-option label="LSI 53C810" value="lsi53c810" />
                    <el-option label="MegaRAID SAS 8708EM2" value="megasas" />
                    <el-option label="VMware PVSCSI" value="pvscsi" />
                  </el-select>
                </el-form-item>
              </el-col>
              <!--  -->
              <el-col :span="24">
                <el-form-item label="总线设备">
                  <el-radio-group v-model="form.serverConfig.diskType">
                    <el-radio-button label="scsi">SCSI</el-radio-button>
                    <el-radio-button label="ide">IDE</el-radio-button>
                    <el-radio-button label="sata">SATA</el-radio-button>
                    <el-radio-button label="virtio">VirtIO Block</el-radio-button>
                  </el-radio-group>
                </el-form-item>
              </el-col>
              <!--  -->
              <el-col :span="24">
                <el-form-item label="缓存">
                  <el-radio-group v-model="form.serverConfig.diskCache">
                    <el-radio-button label="none">无缓存</el-radio-button>
                    <el-radio-button label="directsync">Direct sync</el-radio-button>
                    <el-radio-button label="writethrough">Write through</el-radio-button>
                    <el-radio-button label="writeback">Write back</el-radio-button>
                    <el-radio-button label="unsafe">Write back (不安全)</el-radio-button>
                  </el-radio-group>
                </el-form-item>
              </el-col>
              <!--  -->
              <el-col :span="12">
                <el-form-item label="SSD仿真">
                  <el-radio-group v-model="form.serverConfig.diskSsd">
                    <el-radio-button :label="false">禁用</el-radio-button>
                    <el-radio-button :label="true">启用</el-radio-button>
                  </el-radio-group>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="IO Thread">
                  <el-radio-group v-model="form.serverConfig.diskIOThread">
                    <el-radio-button :label="false">禁用</el-radio-button>
                    <el-radio-button :label="true">启用</el-radio-button>
                  </el-radio-group>
                </el-form-item>
              </el-col>
              <!--  -->
              <el-col :span="24">
                <el-form-item label="IO配置">
                  <div class="flex flex-1 justify-between gap-10 mb-2">
                    <el-input v-model="form.serverConfig.iopsRead">
                      <template #prepend>读取限制（MB/s）</template>
                    </el-input>
                    <el-input v-model="form.serverConfig.iopsReadMax">
                      <template #prepend>读取最大突发（MB/s）</template>
                    </el-input>
                  </div>
                  <div class="flex flex-1 justify-between gap-10 mb-2">
                    <el-input v-model="form.serverConfig.iopsWrite">
                      <template #prepend>写入限制（MB/s）</template>
                    </el-input>
                    <el-input v-model="form.serverConfig.iopsWriteMax">
                      <template #prepend>写入最大突发（MB）</template>
                    </el-input>
                  </div>
                  <div class="flex flex-1 justify-between gap-10 mb-2">
                    <el-input v-model="form.serverConfig.mbpsRead">
                      <template #prepend>读取限制（ops/s）</template>
                    </el-input>
                    <el-input v-model="form.serverConfig.mbpsReadMax">
                      <template #prepend>读取最大突发（ops）</template>
                    </el-input>
                  </div>
                  <div class="flex flex-1 justify-between gap-10">
                    <el-input v-model="form.serverConfig.mbpsWrite">
                      <template #prepend>写入限制（ops/s）</template>
                    </el-input>
                    <el-input v-model="form.serverConfig.mbpsWriteMax">
                      <template #prepend>写入最大突发（ops）</template>
                    </el-input>
                  </div>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-tab-pane>
      </el-tabs>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleConfirm"> 确认 </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { listCluster, updateCluster, addCluster, delCluster, copyCluster, testConnect } from '@/api/server/cluster'
import { treeRegion } from '@/api/server/region'

const { proxy } = getCurrentInstance()

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

const clusterList = ref([])
const regionList = ref([])

const getList = async () => {
  loading.value = true
  listCluster({ ...pageQuery.value, ...queryParams.value }).then(res => {
    loading.value = false
    clusterList.value = res.rows
    total.value = res.total
  })
}

treeRegion().then(res => {
  regionList.value = transformObj(res.data)
})

const transformObj = list => {
  return list.map(item => ({
    value: item.id,
    label: item.name,
    disabled: item.children.length === 0 && item.pid === 0,
    children: transformObj(item.children)
  }))
}

getList()

const handleStatusChange = row => {
  updateCluster(row).then(() => {
    ElMessage.success('修改成功')
  })
}

listCluster({}).then(res => {
  clusterList.value = res.rows
})

const dialogVisible = ref(false)
const activeName = ref('basic')

const handleTabClick = () => {}

const handleEdit = row => {
  form.value = JSON.parse(JSON.stringify(row))
  dialogVisible.value = true
}

const handleCopy = row => {
  copyCluster(row).then(() => {
    ElMessage.success('操作成功')
    getList()
  })
}

const handleDelete = id => {
  proxy.$modal
    .confirm('确认删除吗?')
    .then(() => {
      return delCluster(Array.of(id))
    })
    .then(() => {
      getList()
      proxy.$modal.msgSuccess('删除成功')
    })
    .catch(() => {})
}

const handleTestConnect = () => {
  testConnect(form.value).then(() => {
    ElMessage.success('连接成功')
  })
}

const form = ref({
  systemDisk: 'data'
})

const handleConfirm = () => {
  updateCluster(form.value).then(() => {
    ElMessage.success('操作成功')
    getList()
    dialogVisible.value = false
  })
}
</script>

<style lang="scss" scoped></style>
