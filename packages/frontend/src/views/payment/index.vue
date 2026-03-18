<template>
  <div class="payment-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>回款管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增回款
          </el-button>
        </div>
      </template>

      <!-- 搜索表单 -->
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keyword"
            placeholder="回款编号/客户名称"
            clearable
            @clear="handleSearch"
          />
        </el-form-item>
        <el-form-item label="回款状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable>
            <el-option label="待确认" value="pending" />
            <el-option label="已到账" value="received" />
            <el-option label="已退回" value="returned" />
          </el-select>
        </el-form-item>
        <el-form-item label="回款日期">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
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
        <el-table-column prop="paymentNo" label="回款编号" width="150" />
        <el-table-column prop="contractName" label="关联合同" min-width="180" />
        <el-table-column prop="customerName" label="客户" width="150" />
        <el-table-column prop="amount" label="回款金额" width="120">
          <template #default="{ row }">¥{{ formatMoney(row.amount) }}</template>
        </el-table-column>
        <el-table-column prop="paymentMethod" label="付款方式" width="120">
          <template #default="{ row }">
            <el-tag>{{ getPaymentMethodText(row.paymentMethod) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="paymentDate" label="回款日期" width="120" />
        <el-table-column prop="receivedAt" label="到账日期" width="120" />
        <el-table-column prop="createdAt" label="创建时间" width="160" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleView(row)">查看</el-button>
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
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
        <el-form-item label="回款编号" prop="paymentNo">
          <el-input v-model="formData.paymentNo" placeholder="系统自动生成" disabled />
        </el-form-item>
        <el-form-item label="关联合同" prop="contractId">
          <el-select v-model="formData.contractId" placeholder="请选择合同" filterable>
            <el-option label="CRM系统开发合同" value="1" />
            <el-option label="ERP系统升级合同" value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="回款金额" prop="amount">
          <el-input-number v-model="formData.amount" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="付款方式" prop="paymentMethod">
          <el-select v-model="formData.paymentMethod" placeholder="请选择">
            <el-option label="银行转账" value="bank_transfer" />
            <el-option label="现金" value="cash" />
            <el-option label="支票" value="check" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="回款日期" prop="paymentDate">
          <el-date-picker
            v-model="formData.paymentDate"
            type="date"
            placeholder="选择日期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="回款状态" prop="status">
          <el-select v-model="formData.status" placeholder="请选择">
            <el-option label="待确认" value="pending" />
            <el-option label="已到账" value="received" />
            <el-option label="已退回" value="returned" />
          </el-select>
        </el-form-item>
        <el-form-item label="到账日期" prop="receivedAt">
          <el-date-picker
            v-model="formData.receivedAt"
            type="date"
            placeholder="选择日期"
            style="width: 100%"
          />
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
const dialogTitle = ref('新增回款')
const formRef = ref<FormInstance>()

const searchForm = reactive({
  keyword: '',
  status: '',
  dateRange: []
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const tableData = ref([
  {
    id: '1',
    paymentNo: 'HK2024001',
    contractName: 'CRM系统开发合同',
    customerName: '科技有限公司',
    amount: 200000,
    paymentMethod: 'bank_transfer',
    status: 'received',
    paymentDate: '2024-01-20',
    receivedAt: '2024-01-21',
    createdAt: '2024-01-20 10:00:00'
  }
])

const formData = reactive({
  id: '',
  paymentNo: 'HK' + Date.now(),
  contractId: '',
  amount: 0,
  paymentMethod: 'bank_transfer',
  paymentDate: '',
  status: 'pending',
  receivedAt: '',
  remark: ''
})

const formRules: FormRules = {
  contractId: [{ required: true, message: '请选择合同', trigger: 'change' }],
  amount: [{ required: true, message: '请输入回款金额', trigger: 'blur' }],
  paymentMethod: [{ required: true, message: '请选择付款方式', trigger: 'change' }],
  paymentDate: [{ required: true, message: '请选择回款日期', trigger: 'change' }],
  status: [{ required: true, message: '请选择回款状态', trigger: 'change' }]
}

const formatMoney = (value: number) => {
  return (value / 10000).toFixed(2) + '万'
}

const getPaymentMethodText = (method: string) => {
  const texts: Record<string, string> = {
    bank_transfer: '银行转账',
    cash: '现金',
    check: '支票',
    other: '其他'
  }
  return texts[method] || method
}

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    pending: '待确认',
    received: '已到账',
    returned: '已退回'
  }
  return texts[status] || status
}

const getStatusType = (status: string) => {
  const types: Record<string, any> = {
    pending: 'warning',
    received: 'success',
    returned: 'danger'
  }
  return types[status] || 'info'
}

const handleSearch = () => {
  pagination.page = 1
  fetchData()
}

const handleReset = () => {
  searchForm.keyword = ''
  searchForm.status = ''
  searchForm.dateRange = []
  handleSearch()
}

const handleAdd = () => {
  dialogTitle.value = '新增回款'
  dialogVisible.value = true
}

const handleView = (row: any) => {
  ElMessage.info('查看回款详情功能开发中')
}

const handleEdit = (row: any) => {
  dialogTitle.value = '编辑回款'
  Object.assign(formData, row)
  dialogVisible.value = true
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm('确定要删除此回款记录吗?', '提示', {
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
    paymentNo: 'HK' + Date.now(),
    contractId: '',
    amount: 0,
    paymentMethod: 'bank_transfer',
    paymentDate: '',
    status: 'pending',
    receivedAt: '',
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
.payment-management {
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
