#!/bin/bash

echo "==================================="
echo "CRM 系统 API 连接测试"
echo "==================================="

API_BASE="http://localhost:3000/api/v1"

echo ""
echo "1. 测试健康检查..."
curl -s $API_BASE/health | jq '.'
echo ""

echo "2. 测试 API 基本信息..."
curl -s $API_BASE | jq '.'
echo ""

echo "3. 测试登录接口..."
curl -s -X POST $API_BASE/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123456"}' | jq '.'
echo ""

echo "==================================="
echo "测试完成"
echo "==================================="
