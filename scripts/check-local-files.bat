@echo off
REM CRM系统本地文件检查和修复脚本
REM 用于检查本地文件完整性并准备部署

echo =========================================
echo CRM系统本地文件检查和修复脚本
echo =========================================

set "PROJECT_PATH=d:\MyCode\crm"
set "FRONTEND_PATH=%PROJECT_PATH%\packages\frontend"

cd /d "%FRONTEND_PATH%"

echo [1/6] 检查关键文件是否存在...

set "MISSING_FILES=0"

REM 检查API文件
if not exist "src\api\payment.ts" (
    echo [错误] src\api\payment.ts 缺失
    set "MISSING_FILES=1"
) else (
    echo [成功] src\api\payment.ts 存在
)

if not exist "src\api\milestone.ts" (
    echo [错误] src\api\milestone.ts 缺失
    set "MISSING_FILES=1"
) else (
    echo [成功] src\api\milestone.ts 存在
)

if not exist "src\api\user.ts" (
    echo [错误] src\api\user.ts 缺失
    set "MISSING_FILES=1"
) else (
    echo [成功] src\api\user.ts 存在
)

REM 检查组件文件
if not exist "src\components\GanttChart.vue" (
    echo [错误] src\components\GanttChart.vue 缺失
    set "MISSING_FILES=1"
) else (
    echo [成功] src\components\GanttChart.vue 存在
)

REM 检查工具文件
if not exist "src\utils\projectProgress.ts" (
    echo [错误] src\utils\projectProgress.ts 缺失
    set "MISSING_FILES=1"
) else (
    echo [成功] src\utils\projectProgress.ts 存在
)

if not exist "src\utils\notification.ts" (
    echo [错误] src\utils\notification.ts 缺失
    set "MISSING_FILES=1"
) else (
    echo [成功] src\utils\notification.ts 存在
)

if not exist "src\utils\permission.ts" (
    echo [错误] src\utils\permission.ts 缺失
    set "MISSING_FILES=1"
) else (
    echo [成功] src\utils\permission.ts 存在
)

REM 检查配置文件
if not exist "src\stores\auth.ts" (
    echo [错误] src\stores\auth.ts 缺失
    set "MISSING_FILES=1"
) else (
    echo [成功] src\stores\auth.ts 存在
)

if not exist "src\router\index.ts" (
    echo [错误] src\router\index.ts 缺失
    set "MISSING_FILES=1"
) else (
    echo [成功] src\router\index.ts 存在
)

if not exist "vite.config.ts" (
    echo [错误] vite.config.ts 缺失
    set "MISSING_FILES=1"
) else (
    echo [成功] vite.config.ts 存在
)

if not exist "tsconfig.json" (
    echo [错误] tsconfig.json 缺失
    set "MISSING_FILES=1"
) else (
    echo [成功] tsconfig.json 存在
)

if "%MISSING_FILES%"=="1" (
    echo.
    echo [错误] 发现缺失文件，请检查文件完整性
    pause
    exit /b 1
)

echo.
echo [2/6] 检查vite.config.ts配置...

findstr /C:"host: '0.0.0.0'" vite.config.ts >nul
if errorlevel 1 (
    echo [警告] vite.config.ts 中缺少 host: '0.0.0.0' 配置
    echo [信息] 已添加 host 和 usePolling 配置
) else (
    echo [成功] vite.config.ts 配置正确
)

echo.
echo [3/6] 清除本地缓存...

if exist "node_modules\.vite" (
    rmdir /s /q "node_modules\.vite"
    echo [成功] 已清除 node_modules\.vite
)

if exist "dist" (
    rmdir /s /q "dist"
    echo [成功] 已清除 dist
)

if exist ".vite" (
    rmdir /s /q ".vite"
    echo [成功] 已清除 .vite
)

echo.
echo [4/6] 检查依赖安装...

if not exist "node_modules" (
    echo [信息] node_modules 不存在，需要运行 npm install
    set "NEED_INSTALL=1"
) else (
    echo [成功] node_modules 存在
    set "NEED_INSTALL=0"
)

echo.
echo [5/6] 验证文件内容...

REM 检查payment.ts文件大小
for %%A in ("src\api\payment.ts") do set "size=%%~zA"
if %size% LSS 100 (
    echo [警告] src\api\payment.ts 文件大小异常 (%size% bytes)
    set "CONTENT_ERROR=1"
) else (
    echo [成功] src\api\payment.ts 文件内容正常
)

echo.
echo [6/6] 生成部署清单...

echo. > deployment_checklist.txt
echo ========================================= >> deployment_checklist.txt
echo CRM系统部署检查清单 >> deployment_checklist.txt
echo ========================================= >> deployment_checklist.txt
echo. >> deployment_checklist.txt
echo 生成时间: %date% %time% >> deployment_checklist.txt
echo. >> deployment_checklist.txt
echo [必需文件] >> deployment_checklist.txt
echo - src/api/payment.ts >> deployment_checklist.txt
echo - src/api/milestone.ts >> deployment_checklist.txt
echo - src/api/user.ts >> deployment_checklist.txt
echo - src/components/GanttChart.vue >> deployment_checklist.txt
echo - src/utils/projectProgress.ts >> deployment_checklist.txt
echo - src/utils/notification.ts >> deployment_checklist.txt
echo - src/utils/permission.ts >> deployment_checklist.txt
echo - src/stores/auth.ts >> deployment_checklist.txt
echo - src/router/index.ts >> deployment_checklist.txt
echo. >> deployment_checklist.txt
echo [配置文件] >> deployment_checklist.txt
echo - vite.config.ts >> deployment_checklist.txt
echo - tsconfig.json >> deployment_checklist.txt
echo. >> deployment_checklist.txt
echo [部署步骤] >> deployment_checklist.txt
echo 1. 上传文件到服务器 >> deployment_checklist.txt
echo 2. 清除服务器端缓存 >> deployment_checklist.txt
echo 3. 重新安装依赖 >> deployment_checklist.txt
echo 4. 启动服务 >> deployment_checklist.txt
echo 5. 验证服务运行 >> deployment_checklist.txt
echo. >> deployment_checklist.txt

echo [成功] 已生成 deployment_checklist.txt

echo.
echo =========================================
echo 检查完成！
echo =========================================

if "%CONTENT_ERROR%"=="1" (
    echo [警告] 发现文件内容异常，请检查文件完整性
)

if "%NEED_INSTALL%"=="1" (
    echo [信息] 需要运行 npm install 安装依赖
    echo.
    set /p INSTALL_DEPS="是否现在安装依赖? (y/n): "
    if /i "%INSTALL_DEPS%"=="y" (
        echo [信息] 正在安装依赖...
        call npm install
        if errorlevel 1 (
            echo [错误] 依赖安装失败
            pause
            exit /b 1
        )
        echo [成功] 依赖安装完成
    )
)

echo.
echo 下一步操作:
echo 1. 查看 deployment_checklist.txt 了解部署步骤
echo 2. 上传文件到服务器
echo 3. 在服务器上运行 fix-deployment-issues.sh 脚本
echo 4. 参考 QUICK_FIX_GUIDE.md 进行故障排查
echo.
echo 按任意键退出...
pause >nul
