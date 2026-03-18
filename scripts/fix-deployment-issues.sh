#!/bin/bash

# CRM系统部署问题修复脚本
# 用于修复登录跳转和导入错误问题

echo "========================================="
echo "CRM系统部署问题修复脚本"
echo "========================================="

# 设置颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 项目路径
PROJECT_PATH="/usr/local/crm"
FRONTEND_PATH="$PROJECT_PATH/packages/frontend"

echo -e "${YELLOW}步骤 1: 停止前端服务${NC}"
cd $FRONTEND_PATH
pm2 stop crm-frontend 2>/dev/null || echo "前端服务未运行或已停止"
pkill -f "vite" 2>/dev/null || echo "没有vite进程"

echo -e "${YELLOW}步骤 2: 清除缓存${NC}"
cd $FRONTEND_PATH
rm -rf node_modules/.vite
rm -rf dist
rm -rf .vite
echo "缓存已清除"

echo -e "${YELLOW}步骤 3: 验证必需文件${NC}"
REQUIRED_FILES=(
    "src/api/payment.ts"
    "src/api/milestone.ts"
    "src/api/user.ts"
    "src/components/GanttChart.vue"
    "src/utils/projectProgress.ts"
    "src/utils/notification.ts"
    "src/utils/permission.ts"
    "src/stores/auth.ts"
    "src/router/index.ts"
)

MISSING_FILES=0

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file 存在"
    else
        echo -e "${RED}✗${NC} $file 缺失"
        MISSING_FILES=$((MISSING_FILES + 1))
    fi
done

if [ $MISSING_FILES -gt 0 ]; then
    echo -e "${RED}发现 $MISSING_FILES 个缺失文件，请检查文件同步${NC}"
    exit 1
fi

echo -e "${YELLOW}步骤 4: 检查配置文件${NC}"

# 检查vite.config.ts
if [ -f "vite.config.ts" ]; then
    echo -e "${GREEN}✓${NC} vite.config.ts 存在"
else
    echo -e "${RED}✗${NC} vite.config.ts 缺失"
    exit 1
fi

# 检查tsconfig.json
if [ -f "tsconfig.json" ]; then
    echo -e "${GREEN}✓${NC} tsconfig.json 存在"
else
    echo -e "${RED}✗${NC} tsconfig.json 缺失"
    exit 1
fi

echo -e "${YELLOW}步骤 5: 重新安装依赖${NC}"
npm install

echo -e "${YELLOW}步骤 6: 启动前端服务${NC}"
# 使用PM2启动服务
pm2 start npm --name "crm-frontend" -- run dev || {
    echo -e "${RED}PM2启动失败，尝试直接启动${NC}"
    npm run dev &
    FRONTEND_PID=$!
    echo "前端服务PID: $FRONTEND_PID"
}

echo -e "${YELLOW}步骤 7: 等待服务启动${NC}"
sleep 5

echo -e "${YELLOW}步骤 8: 验证服务状态${NC}"
if curl -s http://localhost:5173 > /dev/null; then
    echo -e "${GREEN}✓${NC} 前端服务启动成功"
else
    echo -e "${RED}✗${NC} 前端服务启动失败"
    echo "请检查服务日志: pm2 logs crm-frontend"
    exit 1
fi

echo -e "${YELLOW}步骤 9: 检查外部访问${NC}"
if curl -s http://192.168.10.19:5173 > /dev/null; then
    echo -e "${GREEN}✓${NC} 外部访问正常"
else
    echo -e "${YELLOW}⚠${NC} 外部访问可能受限，请检查防火墙设置"
fi

echo "========================================="
echo -e "${GREEN}修复完成！${NC}"
echo "========================================="
echo ""
echo "请测试以下功能:"
echo "1. 登录功能: http://192.168.10.19:5173/login"
echo "2. 合同管理: 登录后访问 http://192.168.10.19:5173/contracts"
echo ""
echo "查看服务日志: pm2 logs crm-frontend"
echo "查看服务状态: pm2 status"
echo "停止服务: pm2 stop crm-frontend"
echo "重启服务: pm2 restart crm-frontend"
