# web-modbus

- 此项目基于 Electron-Vue-template, 使用electron，以web的方式开发modbus应用。
- 使用的modbus库：[wtcp-modbus](https://github.com/shuangguo3/wtcp-modbus.git)（作者开发的node版本的modbus库）
- 用到的技术栈：elementUI, vuex, vue-router, axios。


## 安装
```
npm i

# 建立开发环境 at localhost:9080
npm run dev

# build electron 应用
npm run build
```

## 使用
- 下载并运行 build/web-modbus Setup 0.0.1.exe 执行程序

## 启动程序后
### 连接设置
- 程序首先进入连接设置页面，选择server模式或者client模式进行连接
- 本例子使用server模式，监听本机的7777端口
- 点击 "启动server"按钮
![image](https://gitlab.com/shuangguo3/web-modbus/-/raw/master/readme-pics/1.png)

### 以server模式监听client连接
- 当client连接后，会自动增加一个连接tab，点击tab，即可对此连接进行modbus通信
![image](https://gitlab.com/shuangguo3/web-modbus/-/raw/master/readme-pics/2.png)

### 查询从机地址
- 输入查询从机地址的起始和结束地址（最好不要太大范围，比较浪费时间），点击"查询地址"按钮，开始自动查找从机
![image](https://gitlab.com/shuangguo3/web-modbus/-/raw/master/readme-pics/3.png)

### modbus 0x03 读命令
- 如果查找到从机，会自动增加一个从机tab，点击tab，即可对从机进行modbu通信
- 输入寄存器起始地址、数量，读出寄存器值后，自动添加到下面的表格
![image](https://gitlab.com/shuangguo3/web-modbus/-/raw/master/readme-pics/4.png)

### modbus 0x10 写命令
- 输入寄存器起始地址、数量、写入值，自动把同样的值写入每个寄存器
- 写入成功后，自动添加到下面的表格
![image](https://gitlab.com/shuangguo3/web-modbus/-/raw/master/readme-pics/5.png)

### modbus 0x10 写命令，寄存器值递增（以值递增的方式）
- 输入寄存器起始地址、数量、写入值，自动把同样的值写入每个寄存器
- 写入成功后，自动添加到下面的表格
![image](https://gitlab.com/shuangguo3/web-modbus/-/raw/master/readme-pics/6.png)

### 导出寄存器值到文件
- 输入寄存器起始地址、结束地址、每次读取数量（根据从机允许单此读取的寄存器数量来动态调整）
- 导出成功后，将把文件保存到相关目录
![image](https://gitlab.com/shuangguo3/web-modbus/-/raw/master/readme-pics/7.png)
