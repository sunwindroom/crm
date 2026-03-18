<template>
  <div class="contract-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>合同管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增合同
          </el-button>
        </div>
      </template>

      <!-- 搜索表单 -->
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keyword"
            placeholder="合同编号/合同名称"
            clearable
            @clear="handleSearch"
          />
        </el-form-item>
        <el-form-item label="合同状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable>
            <el-option label="草稿" value="draft" />
            <el-option label="审批中" value="pending" />
            <el-option label="执行中" value="active" />
            <el-option label="已完成" value="completed" />
            <el-option label="已终止" value="terminated" />
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
        <el-table-column prop="contractNo" label="合同编号" width="150" />
        <el-table-column prop="name" label="合同名称" min-width="200" />
        <el-table-column prop="customerName" label="客户" width="150" />
        <el-table-column prop="amount" label="合同金额" width="120">
          <template #default="{ row }">¥{{ formatMoney(row.amount) }}</template>
        </el-table-column>
        <el-table-column prop="paidAmount" label="已回款" width="120">
          <template #default="{ row }">¥{{ formatMoney(row.paidAmount) }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="signedAt" label="签订日期" width="120" />
        <el-table-column prop="startDate" label="开始日期" width="120" />
        <el-table-column prop="endDate" label="结束日期" width="120" />
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleView(row)">查看</el-button>
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="success" link @click="handlePayment(row)">回款</el-button>
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
      width="800px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="合同编号" prop="contractNo">
              <el-input v-model="formData.contractNo" placeholder="系统自动生成" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="合同名称" prop="name">
              <el-input v-model="formData.name" placeholder="请输入合同名称" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="客户" prop="customerId">
              <el-select v-model="formData.customerId" placeholder="请选择客户" filterable>
                <el-option label="科技有限公司" value="1" />
                <el-option label="网络科技公司" value="2" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="关联合同" prop="parentContractId">
              <el-select v-model="formData.parentContractId" placeholder="请选择" clearable>
                <el-option label="主合同" value="" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="合同金额" prop="amount">
              <el-input-number v-model="formData.amount" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="合同类型" prop="type">
              <el-select v-model="formData.type" placeholder="请选择">
                <el-option label="销售合同" value="sales" />
                <el-option label="服务合同" value="service" />
                <el-option label="采购合同" value="purchase" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="签订日期" prop="signedAt">
              <el-date-picker
                v-model="formData.signedAt"
                type="date"
                placeholder="选择日期"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="合同状态" prop="status">
              <el-select v-model="formData.status" placeholder="请选择">
                <el-option label="草稿" value="draft" />
                <el-option label="审批中" value="pending" />
                <el-option label="执行中" value="active" />
                <el-option label="已完成" value="completed" />
                <el-option label="已终止" value="terminated" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="开始日期" prop="startDate">
              <el-date-picker
                v-model="formData.startDate"
                type="date"
                placeholder="选择日期"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结束日期" prop="endDate">
              <el-date-picker
                v-model="formData.endDate"
                type="date"
                placeholder="选择日期"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="合同条款" prop="terms">
          <el-input
            v-model="formData.terms"
            type="textarea"
            :rows="4"
            placeholder="请输入合同主要条款"
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

    <!-- 回款管理对话框 -->
    <el-dialog
      v-model="paymentDialogVisible"
      title="回款管理"
      width="1100px"
      @close="handlePaymentDialogClose"
    >
      <div class="payment-header">
        <el-button type="primary" @click="handleAddPayment">
          <el-icon><Plus /></el-icon>
          添加回款
        </el-button>
        <div class="payment-summary">
          <el-tag type="success">已确认: ¥{{ formatMoney(paymentStats.confirmed) }}</el-tag>
          <el-tag type="warning">待确认: ¥{{ formatMoney(paymentStats.pending) }}</el-tag>
          <el-tag type="info">总金额: ¥{{ formatMoney(paymentStats.total) }}</el-tag>
          <el-progress
            :percentage="paymentProgress"
            :color="paymentProgress === 100 ? '#67C23A' : '#409EFF'"
          />
        </div>
      </div>

      <el-table
        v-loading="paymentLoading"
        :data="payments"
        border
        class="payment-table"
      >
        <el-table-column prop="amount" label="回款金额" width="120">
          <template #default="{ row }">¥{{ formatMoney(row.amount) }}</template>
        </el-table-column>
        <el-table-column prop="paymentMethod" label="支付方式" width="100">
          <template #default="{ row }">
            <el-tag>{{ getPaymentMethodText(row.paymentMethod) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="paymentDate" label="支付日期" width="120" />
        <el-table-column prop="expectedDate" label="预期日期" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getPaymentStatusType(row.status)">
              {{ getPaymentStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="200" show-overflow-tooltip />
        <el-table-column prop="creatorName" label="创建人" width="100" />
        <el-table-column prop="createdAt" label="创建时间" width="160" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 'pending'"
              type="success"
              link
              @click="handleConfirmPayment(row)"
            >
              确认
            </el-button>
            <el-button
              v-if="row.status === 'pending'"
              type="danger"
              link
              @click="handleRejectPayment(row)"
            >
              拒绝
            </el-button>
            <el-button type="primary" link @click="handleEditPayment(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDeletePayment(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <!-- 新增/编辑回款对话框 -->
    <el-dialog
      v-model="paymentFormDialogVisible"
      :title="paymentFormTitle"
      width="600px"
      @close="handlePaymentFormClose"
    >
      <el-form
        ref="paymentFormRef"
        :model="paymentForm"
        :rules="paymentFormRules"
        label-width="120px"
      >
        <el-form-item label="回款金额" prop="amount">
          <el-input-number
            v-model="paymentForm.amount"
            :min="0"
            :precision="2"
            :max="remainingAmount"
            style="width: 100%"
          />
          <div class="form-tip">剩余未回款: ¥{{ formatMoney(remainingAmount) }}</div>
        </el-form-item>
        <el-form-item label="支付方式" prop="paymentMethod">
          <el-select v-model="paymentForm.paymentMethod" placeholder="请选择支付方式">
            <el-option label="现金" value="cash" />
            <el-option label="银行转账" value="bank_transfer" />
            <el-option label="支票" value="check" />
            <el-option label="在线支付" value="online" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="支付日期" prop="paymentDate">
          <el-date-picker
            v-model="paymentForm.paymentDate"
            type="date"
            placeholder="选择支付日期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="预期日期" prop="expectedDate">
          <el-date-picker
            v-model="paymentForm.expectedDate"
            type="date"
            placeholder="选择预期日期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="paymentForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="paymentFormDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="paymentSubmitLoading" @click="handlePaymentSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { paymentApi } from '@/api/payment'

const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const paymentDialogVisible = ref(false)
const paymentFormDialogVisible = ref(false)
const paymentLoading = ref(false)
const paymentSubmitLoading = ref(false)
const dialogTitle = ref('新增合同')
const paymentFormTitle = ref('新增回款')
const formRef = ref<FormInstance>()
const paymentFormRef = ref<FormInstance>()

// 当前选中的合同ID
const currentContractId = ref('')

// 回款表单
const paymentForm = reactive({
  id: '',
  contractId: '',
  amount: 0,
  paymentMethod: 'bank_transfer',
  paymentDate: '',
  expectedDate: '',
  remark: ''
})

const paymentFormRules: FormRules = {
  amount: [{ required: true, message: '请输入回款金额', trigger: 'blur' }],
  paymentMethod: [{ required: true, message: '请选择支付方式', trigger: 'change' }],
  paymentDate: [{ required: true, message: '请选择支付日期', trigger: 'change' }]
}

// 回款列表
const payments = ref([
  {
    id: '1',
    contractId: '1',
    amount: 200000,
    paymentMethod: 'bank_transfer',
    paymentDate: '2024-02-15',
    expectedDate: '2024-02-20',
    status: 'confirmed',
    remark: '首期付款',
    creatorName: '张三',
    createdAt: '2024-02-15 10:00:00'
  },
  {
    id: '2',
    contractId: '1',
    amount: 150000,
    paymentMethod: 'bank_transfer',
    paymentDate: '2024-04-01',
    expectedDate: '2024-04-15',
    status: 'pending',
    remark: '二期付款',
    creatorName: '李四',
    createdAt: '2024-04-01 09:00:00'
  }
])

// 回款统计
const paymentStats = computed(() => {
  const confirmed = payments.value
    .filter(p => p.status === 'confirmed')
    .reduce((sum, p) => sum + p.amount, 0)
  const pending = payments.value
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0)
  const total = payments.value.reduce((sum, p) => sum + p.amount, 0)
  return { confirmed, pending, total }
})

// 回款进度
const paymentProgress = computed(() => {
  if (paymentStats.value.total === 0) return 0
  return Math.round((paymentStats.value.confirmed / paymentStats.value.total) * 100)
})

// 剩余未回款金额
const remainingAmount = computed(() => {
  const currentContract = tableData.value.find(c => c.id === currentContractId.value)
  if (!currentContract) return 0
  return currentContract.amount - paymentStats.value.confirmed - paymentStats.value.pending
})

const searchForm = reactive({
  keyword: '',
  status: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const tableData = ref([
  {
    id: '1',
    contractNo: 'HT2024001',
    name: 'CRM系统开发合同',
    customerName: '科技有限公司',
    amount: 500000,
    paidAmount: 200000,
    status: 'active',
    signedAt: '2024-01-15',
    startDate: '2024-01-01',
    endDate: '2024-12-31'
  }
])

const formData = reactive({
  id: '',
  contractNo: 'HT' + Date.now(),
  name: '',
  customerId: '',
  parentContractId: '',
  amount: 0,
  type: 'sales',
  signedAt: '',
  status: 'draft',
  startDate: '',
  endDate: '',
  terms: ''
})

const formRules: FormRules = {
  name: [{ required: true, message: '请输入合同名称', trigger: 'blur' }],
  customerId: [{ required: true, message: '请选择客户', trigger: 'change' }],
  amount: [{ required: true, message: '请输入合同金额', trigger: 'blur' }],
  type: [{ required: true, message: '请选择合同类型', trigger: 'change' }],
  signedAt: [{ required: true, message: '请选择签订日期', trigger: 'change' }],
  startDate: [{ required: true, message: '请选择开始日期', trigger: 'change' }],
  endDate: [{ required: true, message: '请选择结束日期', trigger: 'change' }]
}

const formatMoney = (value: number) => {
  return (value / 10000).toFixed(2) + '万'
}

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    draft: '草稿',
    pending: '审批中',
    active: '执行中',
    completed: '已完成',
    terminated: '已终止'
  }
  return texts[status] || status
}

const getStatusType = (status: string) => {
  const types: Record<string, any> = {
    draft: 'info',
    pending: 'warning',
    active: 'primary',
    completed: 'success',
    terminated: 'danger'
  }
  return types[status] || 'info'
}

const getPaymentMethodText = (method: string) => {
  const texts: Record<string, string> = {
    cash: '现金',
    bank_transfer: '银行转账',
    check: '支票',
    online: '在线支付',
    other: '其他'
  }
  return texts[method] || method
}

const getPaymentStatusText = (status: string) => {
  const texts: Record<string, string> = {
    pending: '待确认',
    confirmed: '已确认',
    rejected: '已拒绝'
  }
  return texts[status] || status
}

const getPaymentStatusType = (status: string) => {
  const types: Record<string, any> = {
    pending: 'warning',
    confirmed: 'success',
    rejected: 'danger'
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
  handleSearch()
}

const handleAdd = () => {
  dialogTitle.value = '新增合同'
  dialogVisible.value = true
}

const handleView = (row: any) => {
  ElMessage.info('查看合同详情功能开发中')
}

const handleEdit = (row: any) => {
  dialogTitle.value = '编辑合同'
  Object.assign(formData, row)
  dialogVisible.value = true
}

const handlePayment = async (row: any) => {
  currentContractId.value = row.id
  paymentDialogVisible.value = true
  await fetchPayments(row.id)
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm('确定要删除此合同吗?', '提示', {
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
    contractNo: 'HT' + Date.now(),
    name: '',
    customerId: '',
    parentContractId: '',
    amount: 0,
    type: 'sales',
    signedAt: '',
    status: 'draft',
    startDate: '',
    endDate: '',
    terms: ''
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

// 回款相关方法
const handlePaymentDialogClose = () => {
  currentContractId.value = ''
}

const handleAddPayment = () => {
  paymentFormTitle.value = '新增回款'
  Object.assign(paymentForm, {
    id: '',
    contractId: currentContractId.value,
    amount: 0,
    paymentMethod: 'bank_transfer',
    paymentDate: '',
    expectedDate: '',
    remark: ''
  })
  paymentFormDialogVisible.value = true
}

const handleEditPayment = (row: any) => {
  paymentFormTitle.value = '编辑回款'
  Object.assign(paymentForm, {
    id: row.id,
    contractId: currentContractId.value,
    amount: row.amount,
    paymentMethod: row.paymentMethod,
    paymentDate: row.paymentDate,
    expectedDate: row.expectedDate,
    remark: row.remark || ''
  })
  paymentFormDialogVisible.value = true
}

const handlePaymentFormClose = () => {
  paymentFormRef.value?.resetFields()
  Object.assign(paymentForm, {
    id: '',
    contractId: '',
    amount: 0,
    paymentMethod: 'bank_transfer',
    paymentDate: '',
    expectedDate: '',
    remark: ''
  })
}

const handlePaymentSubmit = async () => {
  if (!paymentFormRef.value) return

  await paymentFormRef.value.validate(async (valid) => {
    if (valid) {
      paymentSubmitLoading.value = true
      try {
        if (paymentForm.id) {
          // 编辑
          await paymentApi.update(paymentForm.id, {
            amount: paymentForm.amount,
            paymentMethod: paymentForm.paymentMethod,
            paymentDate: paymentForm.paymentDate,
            expectedDate: paymentForm.expectedDate,
            remark: paymentForm.remark
          })
          ElMessage.success('编辑成功')
        } else {
          // 新增
          await paymentApi.create({
            contractId: paymentForm.contractId,
            amount: paymentForm.amount,
            paymentMethod: paymentForm.paymentMethod,
            paymentDate: paymentForm.paymentDate,
            expectedDate: paymentForm.expectedDate,
            remark: paymentForm.remark
          })
          ElMessage.success('新增成功')
        }
        paymentFormDialogVisible.value = false
        await fetchPayments(currentContractId.value)
      } catch (error: any) {
        ElMessage.error(error.message || '操作失败')
      } finally {
        paymentSubmitLoading.value = false
      }
    }
  })
}

const handleConfirmPayment = async (row: any) => {
  ElMessageBox.prompt('请输入确认备注', '确认回款', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPlaceholder: '可选'
  }).then(async ({ value }) => {
    try {
      await paymentApi.confirm(row.id, { remark: value })
      ElMessage.success('回款已确认')
      await fetchPayments(currentContractId.value)
    } catch (error: any) {
      ElMessage.error(error.message || '操作失败')
    }
  })
}

const handleRejectPayment = (row: any) => {
  ElMessageBox.prompt('请输入拒绝原因', '拒绝回款', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPlaceholder: '请输入拒绝原因',
    inputValidator: (value) => {
      if (!value) {
        return '请输入拒绝原因'
      }
      return true
    }
  }).then(async ({ value }) => {
    try {
      await paymentApi.reject(row.id, { reason: value })
      ElMessage.success('回款已拒绝')
      await fetchPayments(currentContractId.value)
    } catch (error: any) {
      ElMessage.error(error.message || '操作失败')
    }
  })
}

const handleDeletePayment = (row: any) => {
  ElMessageBox.confirm('确定要删除此回款吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await paymentApi.delete(row.id)
      ElMessage.success('删除成功')
      await fetchPayments(currentContractId.value)
    } catch (error: any) {
      ElMessage.error(error.message || '删除失败')
    }
  })
}

const fetchPayments = async (contractId: string) => {
  paymentLoading.value = true
  try {
    // 模拟数据,实际应该调用API
    // const response = await paymentApi.getByContractId(contractId)
    // payments.value = response.data
    // 暂时使用模拟数据
    paymentLoading.value = false
  } catch (error: any) {
    ElMessage.error(error.message || '获取回款列表失败')
  } finally {
    paymentLoading.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.contract-management {
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

.payment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.payment-summary {
  display: flex;
  gap: 10px;
  align-items: center;
}

.payment-table {
  margin-top: 0;
}

.form-tip {
  margin-top: 5px;
  font-size: 12px;
  color: #909399;
}
</style>
