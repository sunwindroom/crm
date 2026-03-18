<template>
  <div class="opportunity-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>商机管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增商机
          </el-button>
        </div>
      </template>

      <!-- 搜索表单 -->
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keyword"
            placeholder="商机名称/客户名称"
            clearable
            @clear="handleSearch"
          />
        </el-form-item>
        <el-form-item label="商机阶段">
          <el-select v-model="searchForm.stage" placeholder="请选择" clearable>
            <el-option label="初步接触" value="initial" />
            <el-option label="需求确认" value="requirement" />
            <el-option label="方案报价" value="proposal" />
            <el-option label="商务谈判" value="negotiation" />
            <el-option label="已成交" value="won" />
            <el-option label="已失败" value="lost" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 数据表格 -->
      <el-table
        v-loading="loading"
        :data="tableData"
        style="width: 100%"
        border
      >
        <el-table-column prop="name" label="商机名称" min-width="200" />
        <el-table-column prop="customerName" label="客户" width="150" />
        <el-table-column prop="amount" label="金额" width="120">
          <template #default="{ row }">¥{{ formatMoney(row.amount) }}</template>
        </el-table-column>
        <el-table-column prop="stage" label="阶段" width="120">
          <template #default="{ row }">
            <el-tag :type="getStageType(row.stage)">
              {{ getStageText(row.stage) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="probability" label="成功率" width="100">
          <template #default="{ row }">{{ row.probability }}%</template>
        </el-table-column>
        <el-table-column prop="expectedCloseDate" label="预计成交日期" width="120" />
        <el-table-column prop="ownerName" label="负责人" width="100" />
        <el-table-column prop="createdAt" label="创建时间" width="160" />
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="success" link @click="handleConvert(row)">转化</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="700px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
      >
        <el-form-item label="商机名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入商机名称" />
        </el-form-item>
        <el-form-item label="客户" prop="customerId">
          <el-select v-model="formData.customerId" placeholder="请选择客户" filterable>
            <el-option label="科技有限公司" value="1" />
            <el-option label="网络科技公司" value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="商机金额" prop="amount">
          <el-input-number v-model="formData.amount" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="商机阶段" prop="stage">
          <el-select v-model="formData.stage" placeholder="请选择">
            <el-option label="初步接触" value="initial" />
            <el-option label="需求确认" value="requirement" />
            <el-option label="方案报价" value="proposal" />
            <el-option label="商务谈判" value="negotiation" />
            <el-option label="已成交" value="won" />
            <el-option label="已失败" value="lost" />
          </el-select>
        </el-form-item>
        <el-form-item label="成功概率" prop="probability">
          <el-slider v-model="formData.probability" :marks="{ 0: '0%', 50: '50%', 100: '100%' }" />
        </el-form-item>
        <el-form-item label="预计成交日期" prop="expectedCloseDate">
          <el-date-picker
            v-model="formData.expectedCloseDate"
            type="date"
            placeholder="选择日期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="负责人" prop="ownerId">
          <el-select v-model="formData.ownerId" placeholder="请选择" filterable>
            <el-option label="张三" value="1" />
            <el-option label="李四" value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="formData.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('新增商机')
const formRef = ref<FormInstance>()

const searchForm = reactive({
  keyword: '',
  stage: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const tableData = ref([
  {
    id: '1',
    name: 'CRM系统开发商机',
    customerName: '科技有限公司',
    amount: 500000,
    stage: 'proposal',
    probability: 70,
    expectedCloseDate: '2024-03-31',
    ownerName: '张三',
    createdAt: '2024-01-10 10:00:00'
  }
])

const formData = reactive({
  id: '',
  name: '',
  customerId: '',
  amount: 0,
  stage: 'initial',
  probability: 30,
  expectedCloseDate: '',
  ownerId: '',
  remark: ''
})

const formRules: FormRules = {
  name: [{ required: true, message: '请输入商机名称', trigger: 'blur' }],
  customerId: [{ required: true, message: '请选择客户', trigger: 'change' }],
  amount: [{ required: true, message: '请输入商机金额', trigger: 'blur' }],
  stage: [{ required: true, message: '请选择商机阶段', trigger: 'change' }],
  ownerId: [{ required: true, message: '请选择负责人', trigger: 'change' }]
}

const formatMoney = (value: number) => {
  return (value / 10000).toFixed(2) + '万'
}

const getStageText = (stage: string) => {
  const texts: Record<string, string> = {
    initial: '初步接触',
    requirement: '需求确认',
    proposal: '方案报价',
    negotiation: '商务谈判',
    won: '已成交',
    lost: '已失败'
  }
  return texts[stage] || stage
}

const getStageType = (stage: string) => {
  const types: Record<string, any> = {
    initial: 'info',
    requirement: 'primary',
    proposal: 'warning',
    negotiation: 'warning',
    won: 'success',
    lost: 'danger'
  }
  return types[stage] || 'info'
}

const handleSearch = () => {
  pagination.page = 1
  fetchData()
}

const handleReset = () => {
  searchForm.keyword = ''
  searchForm.stage = ''
  handleSearch()
}

const handleAdd = () => {
  dialogTitle.value = '新增商机'
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  dialogTitle.value = '编辑商机'
  Object.assign(formData, row)
  dialogVisible.value = true
}

const handleConvert = (row: any) => {
  ElMessageBox.confirm('确定要将此商机转化为项目吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('转化成功')
  })
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm('确定要删除此商机吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
    fetchData()
  })
}

const handleDialogClose = () => {
  formRef.value?.resetFields()
  Object.assign(formData, {
    id: '',
    name: '',
    customerId: '',
    amount: 0,
    stage: 'initial',
    probability: 30,
    expectedCloseDate: '',
    ownerId: '',
    remark: ''
  })
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate((valid) => {
    if (valid) {
      submitLoading.value = true
      setTimeout(() => {
        ElMessage.success(formData.id ? '编辑成功' : '新增成功')
        dialogVisible.value = false
        submitLoading.value = false
        fetchData()
      }, 500)
    }
  })
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  fetchData()
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
  fetchData()
}

const fetchData = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    pagination.total = 100
  }, 500)
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.opportunity-management {
  padding: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-form {
  margin-bottom: 20px;
}

.el-pagination {
  margin-top: 20px;
  justify-content: flex-end;
}
</style>
