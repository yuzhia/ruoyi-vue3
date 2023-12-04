<template>
  <div class="px-5 pt-5">
    <el-tabs v-model="activeName">
      <el-tab-pane label="邮箱配置" name="email">
        <el-form :model="form" label-width="150px">
          <el-form-item label="SMTP服务器地址">
            <el-input v-model="form.host" placeholder="smtp.qq.com" />
          </el-form-item>
          <el-form-item label="SMTP用户邮箱">
            <el-input v-model="form.email" placeholder="8888888@qq.com" />
          </el-form-item>
          <el-form-item label="SMTP邮箱密码">
            <el-input v-model="form.password" type="password" />
          </el-form-item>
          <el-form-item label="SMTP邮箱端口">
            <el-input v-model="form.port" placeholder="25" />
          </el-form-item>
          <el-form-item label="SSL加密">
            <el-radio-group v-model="form.ssl">
              <el-radio-button :label="false">否</el-radio-button>
              <el-radio-button :label="true">是</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item>
            <el-button type="success" @click="onSubmit">确认</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
      <el-tab-pane label="短信配置" name="message">Config</el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
const activeName = ref('email')

const form = ref({
  ssl: true
})

const onSubmit = () => {}
</script>
