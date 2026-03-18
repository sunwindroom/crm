<template>
  <div class="profile">
    <el-card>
      <template #header>
        <span>个人中心</span>
      </template>

      <el-tabs v-model="activeTab">
        <el-tab-pane label="基本信息" name="info">
          <div class="profile-info">
            <div class="avatar-section">
              <el-avatar :size="100" :src="userInfo.avatar">
                {{ userInfo.name?.charAt(0) }}
              </el-avatar>
              <el-button type="primary" link @click="handleUploadAvatar">
                更换头像
              </el-button>
            </div>

            <el-form
              ref="infoFormRef"
              :model="userInfo"
              :rules="infoRules"
              label-width="120px"
              class="info-form"
            >
              <el-form-item label="用户名">
                <el-input v-model="userInfo.username" disabled />
              </el-form-item>

              <el-form-item label="姓名" prop="name">
                <el-input v-model="userInfo.name" placeholder="请输入姓名" />
              </el-form-item>

              <el-form-item label="电话" prop="phone">
                <el-input v-model="userInfo.phone" placeholder="请输入电话" />
              </el-form-item>

              <el-form-item label="邮箱" prop="email">
                <el-input v-model="userInfo.email" placeholder="请输入邮箱" />
              </el-form-item>

              <el-form-item label="部门">
                <el-input v-model="userInfo.department" placeholder="请输入部门" />
              </el-form-item>

              <el-form-item label="职位">
                <el-input v-model="userInfo.position" placeholder="请输入职位" />
              </el-form-item>

              <el-form-item label="角色">
                <el-tag :type="getRoleColor(userInfo.role)">
                  {{ getRoleDisplayName(userInfo.role) }}
                </el-tag>
              </el-form-item>

              <el-form-item label="状态">
                <el-tag :type="userInfo.status === 'active' ? 'success' : 'info'">
                  {{ userInfo.status === 'active' ? '正常' : '禁用' }}
                </el-tag>
              </el-form-item>

              <el-form-item>
                <el-button type="primary" :loading="infoLoading" @click="handleUpdateInfo">
                  更新信息
                </el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>

        <el-tab-pane label="修改密码" name="password">
          <div class="password-section">
            <el-alert
              title="安全提示"
              type="warning"
              :closable="false"
              show-icon
              style="margin-bottom: 20px"
            >
              为了账户安全，建议定期修改密码。密码长度为6-20个字符。
            </el-alert>

            <el-form
              ref="passwordFormRef"
              :model="passwordForm"
              :rules="passwordRules"
              label-width="120px"
              class="password-form"
            >
              <el-form-item label="原密码" prop="oldPassword">
                <el-input
                  v-model="passwordForm.oldPassword"
                  type="password"
                  placeholder="请输入原密码"
                  show-password
                />
              </el-form-item>

              <el-form-item label="新密码" prop="newPassword">
                <el-input
                  v-model="passwordForm.newPassword"
                  type="password"
                  placeholder="请输入新密码"
                  show-password
                />
              </el-form-item>

              <el-form-item label="确认密码" prop="confirmPassword">
                <el-input
                  v-model="passwordForm.confirmPassword"
                  type="password"
                  placeholder="请再次输入新密码"
                  show-password
                />
              </el-form-item>

              <el-form-item>
                <el-button type="primary" :loading="passwordLoading" @click="handleChangePassword">
                  修改密码
                </el-button>
              </el-form-item>
            </el-form>

            <el-divider />

            <div class="password-strength">
              <h4>密码强度要求</h4>
              <ul>
                <li>密码长度为6-20个字符</li>
                <li>建议包含大小写字母、数字和特殊字符</li>
                <li>不要使用常见的密码</li>
                <li>定期更换密码</li>
              </ul>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="账户信息" name="account">
          <div class="account-section">
            <el-descriptions :column="1" border>
              <el-descriptions-item label="用户ID">
                {{ userInfo.id }}
              </el-descriptions-item>
              <el-descriptions-item label="用户名">
                {{ userInfo.username }}
              </el-descriptions-item>
              <el-descriptions-item label="注册时间">
                {{ userInfo.createdAt }}
              </el-descriptions-item>
              <el-descriptions-item label="最后更新">
                {{ userInfo.updatedAt }}
              </el-descriptions-item>
              <el-descriptions-item label="上级">
                {{ superiorInfo?.name || '无' }}
              </el-descriptions-item>
              <el-descriptions-item label="下属数量">
                {{ userInfo.subordinateIds?.length || 0 }} 人
              </el-descriptions-item>
            </el-descriptions>

            <el-divider />

            <div class="subordinate-list" v-if="userInfo.subordinateIds && userInfo.subordinateIds.length > 0">
              <h4>下属列表</h4>
              <el-table :data="subordinates" border style="margin-top: 10px">
                <el-table-column prop="name" label="姓名" width="120" />
                <el-table-column prop="username" label="用户名" width="120" />
                <el-table-column prop="phone" label="电话" width="130" />
                <el-table-column prop="department" label="部门" width="120" />
                <el-table-column prop="position" label="职位" width="120" />
                <el-table-column prop="role" label="角色" width="120">
                  <template #default="{ row }">
                    <el-tag :type="getRoleColor(row.role)" size="small">
                      {{ getRoleDisplayName(row.role) }}
                    </el-tag>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { userApi } from '@/api/user'
import { useAuthStore } from '@/stores/auth'
import { getRoleDisplayName, getRoleColor } from '@/utils/permission'
import type { User, ChangePasswordRequest } from '@/types'

const authStore = useAuthStore()
const activeTab = ref('info')
const infoFormRef = ref<FormInstance>()
const passwordFormRef = ref<FormInstance>()
const infoLoading = ref(false)
const passwordLoading = ref(false)

const userInfo = reactive<User>({
  id: '',
  username: '',
  name: '',
  phone: '',
  email: '',
  department: '',
  position: '',
  role: 'sales',
  status: 'active',
  avatar: '',
  superiorId: '',
  subordinateIds: [],
  createdAt: '',
  updatedAt: ''
})

const passwordForm = reactive<ChangePasswordRequest>({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const superiorInfo = ref<User | null>(null)
const subordinates = ref<User[]>([])

const infoRules: FormRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
}

const passwordRules: FormRules = {
  oldPassword: [
    { required: true, message: '请输入原密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度为6-20个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

const handleUploadAvatar = () => {
  ElMessage.info('头像上传功能开发中')
}

const handleUpdateInfo = async () => {
  if (!infoFormRef.value) return

  await infoFormRef.value.validate(async (valid) => {
    if (valid) {
      infoLoading.value = true
      try {
        await userApi.updateCurrentUser({
          name: userInfo.name,
          phone: userInfo.phone,
          email: userInfo.email,
          department: userInfo.department,
          position: userInfo.position
        })
        ElMessage.success('信息更新成功')
        await fetchUserInfo()
      } catch (error: any) {
        ElMessage.error(error.message || '信息更新失败')
      } finally {
        infoLoading.value = false
      }
    }
  })
}

const handleChangePassword = async () => {
  if (!passwordFormRef.value) return

  await passwordFormRef.value.validate(async (valid) => {
    if (valid) {
      passwordLoading.value = true
      try {
        await userApi.changePassword(passwordForm)
        ElMessage.success('密码修改成功，请重新登录')
        // 清空表单
        Object.assign(passwordForm, {
          oldPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
        // 退出登录
        await authStore.logout()
      } catch (error: any) {
        ElMessage.error(error.message || '密码修改失败')
      } finally {
        passwordLoading.value = false
      }
    }
  })
}

const fetchUserInfo = async () => {
  try {
    // 实际应该调用API
    // const response = await userApi.getCurrentUser()
    // Object.assign(userInfo, response)
    // 暂时使用authStore中的用户信息
    if (authStore.user) {
      Object.assign(userInfo, authStore.user)
    }
  } catch (error: any) {
    console.error('获取用户信息失败:', error)
  }
}

const fetchSubordinates = async () => {
  try {
    // 实际应该调用API
    // const response = await userApi.getSubordinates()
    // subordinates.value = response
    // 暂时使用模拟数据
  } catch (error: any) {
    console.error('获取下属列表失败:', error)
  }
}

const fetchSuperior = async () => {
  if (!userInfo.superiorId) return

  try {
    // 实际应该调用API
    // const response = await userApi.getSuperior()
    // superiorInfo.value = response
  } catch (error: any) {
    console.error('获取上级信息失败:', error)
  }
}

onMounted(() => {
  fetchUserInfo()
  fetchSubordinates()
  fetchSuperior()
})
</script>

<style scoped>
.profile {
  padding: 0;
}

.profile-info {
  display: flex;
  gap: 40px;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  min-width: 150px;
}

.info-form {
  flex: 1;
}

.password-section,
.account-section {
  max-width: 600px;
}

.password-strength {
  background: #f5f7fa;
  padding: 20px;
  border-radius: 8px;
}

.password-strength h4 {
  margin: 0 0 10px 0;
  color: #303133;
}

.password-strength ul {
  margin: 0;
  padding-left: 20px;
  color: #606266;
}

.password-strength li {
  margin-bottom: 5px;
}

.subordinate-list h4 {
  margin-bottom: 10px;
  color: #303133;
}
</style>
