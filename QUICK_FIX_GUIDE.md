# 快速修复指南 - 登录跳转和导入错误问题

## 问题描述

1. **登录跳转问题**: 登录成功后显示"登录成功",但页面不跳转到dashboard
2. **导入错误**: 合同管理页面报错 "Failed to resolve import '@/api/payment'"

## 快速修复步骤

### 步骤1: SSH连接到服务器

```bash
ssh user@192.168.10.19
```

### 步骤2: 进入项目目录

```bash
cd /usr/local/crm/packages/frontend
```

### 步骤3: 停止当前服务

```bash
pm2 stop crm-frontend
# 或者
pkill -f "vite"
```

### 步骤4: 清除Vite缓存

```bash
rm -rf node_modules/.vite
rm -rf dist
rm -rf .vite
```

### 步骤5: 验证关键文件存在

```bash
ls -la src/api/payment.ts
ls -la src/api/milestone.ts
ls -la src/api/user.ts
ls -la src/components/GanttChart.vue
```

### 步骤6: 重新启动服务

```bash
pm2 start npm --name "crm-frontend" -- run dev
```

### 步骤7: 查看服务状态

```bash
pm2 status
pm2 logs crm-frontend --lines 50
```

### 步骤8: 验证服务运行

```bash
curl http://localhost:5173
curl http://192.168.10.19:5173
```

## 如果问题仍然存在

### 方案A: 使用修复脚本

```bash
cd /usr/local/crm
chmod +x scripts/fix-deployment-issues.sh
./scripts/fix-deployment-issues.sh
```

### 方案B: 完全重新部署

```bash
cd /usr/local/crm/packages/frontend

# 停止服务
pm2 stop crm-frontend

# 删除node_modules和缓存
rm -rf node_modules
rm -rf node_modules/.vite
rm -rf dist
rm -rf .vite

# 重新安装依赖
npm install

# 启动服务
pm2 start npm --name "crm-frontend" -- run dev

# 查看日志
pm2 logs crm-frontend
```

### 方案C: 检查文件同步

如果文件同步有问题,需要从本地重新上传文件:

```bash
# 在本地执行
cd d:\MyCode\crm\packages\frontend

# 上传关键文件到服务器
scp src/api/payment.ts user@192.168.10.19:/usr/local/crm/packages/frontend/src/api/
scp src/api/milestone.ts user@192.168.10.19:/usr/local/crm/packages/frontend/src/api/
scp src/api/user.ts user@192.168.10.19:/usr/local/crm/packages/frontend/src/api/
scp src/components/GanttChart.vue user@192.168.10.19:/usr/local/crm/packages/frontend/src/components/
```

## 登录跳转问题的调试

### 查看浏览器控制台

1. 打开浏览器开发者工具 (F12)
2. 切换到 Console 标签页
3. 尝试登录
4. 查看是否有错误信息

### 检查网络请求

1. 切换到 Network 标签页
2. 尝试登录
3. 查看登录请求是否成功
4. 检查响应数据格式

### 检查localStorage

1. 打开浏览器开发者工具
2. 切换到 Application 标签页
3. 查看 Local Storage
4. 检查是否有 token 和 user 数据

### 临时解决方案

如果登录跳转仍然有问题,可以手动访问dashboard:

```bash
# 登录成功后,在浏览器地址栏手动输入
http://192.168.10.19:5173/dashboard
```

## 导入错误的调试

### 检查文件路径

```bash
# 在服务器上执行
cd /usr/local/crm/packages/frontend/src/api
ls -la
```

### 检查文件权限

```bash
# 确保文件有正确的权限
chmod 644 src/api/payment.ts
chmod 644 src/api/milestone.ts
chmod 644 src/api/user.ts
```

### 检查文件内容

```bash
# 查看文件内容是否正确
cat src/api/payment.ts
```

### 临时解决方案

如果导入错误持续存在,可以修改导入路径:

```bash
# 编辑合同管理文件
vi src/views/contract/index.vue

# 将导入语句从
import { paymentApi } from '@/api/payment'

# 改为
import { paymentApi } from '../../api/payment'
```

## 监控和维护

### 查看服务状态

```bash
pm2 status
pm2 info crm-frontend
```

### 查看实时日志

```bash
pm2 logs crm-frontend
```

### 重启服务

```bash
pm2 restart crm-frontend
```

### 停止服务

```bash
pm2 stop crm-frontend
```

## 防火墙检查

如果外部无法访问,检查防火墙设置:

```bash
# 检查防火墙状态
sudo ufw status

# 如果需要,允许5173端口
sudo ufw allow 5173/tcp

# 或者临时关闭防火墙测试
sudo ufw disable
```

## 网络检查

```bash
# 检查端口是否监听
netstat -tlnp | grep 5173

# 检查服务是否运行
ps aux | grep vite

# 测试本地访问
curl http://localhost:5173

# 测试外部访问
curl http://192.168.10.19:5173
```

## 常见错误和解决方案

### 错误1: "Failed to resolve import"

**原因**: Vite缓存问题或文件同步问题

**解决**: 清除缓存并重启服务

### 错误2: "Cannot find module"

**原因**: node_modules损坏或依赖未安装

**解决**: 删除node_modules并重新安装

### 错误3: "Port 5173 is already in use"

**原因**: 端口被占用

**解决**: 杀死占用端口的进程

```bash
lsof -ti:5173 | xargs kill -9
```

### 错误4: "Connection refused"

**原因**: 服务未启动或防火墙阻止

**解决**: 启动服务并检查防火墙设置

## 联系支持

如果以上方法都无法解决问题,请提供以下信息:

1. 服务器日志: `pm2 logs crm-frontend --lines 100`
2. 浏览器控制台错误截图
3. 网络请求详情
4. 文件列表: `ls -la src/api/`

## 预防措施

1. 定期清理Vite缓存
2. 使用PM2自动重启
3. 监控服务状态
4. 设置日志轮转
5. 定期备份重要文件

---

**更新时间**: 2024-03-17
**版本**: 1.0
