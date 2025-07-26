# DNS 测速排行榜 · 中国版  
**纯前端、离线可用、炫酷图表(比如折线，根据你的理解选用最合适的)、一键导出**

---

## 1. 项目愿景
让用户在浏览器里一键测试 **中国常用公共 DNS** 的速度与可靠性，实时生成排行榜，并可导出 CSV / JSON / 截图。

---

## 2. 功能清单
| 编号 | 功能 | 描述 | 优先级 |
|---|---|---|---|
| F1 | DNS 测速 | 并发测试解析延迟、正确性、QPS | P0 |
| F2 | 排行榜 | 多维度加权打分实时排序 | P0 |
| F3 | 炫酷图表 | ECharts 折线实时刷新 | P0 |
| F4 | 自定义域名 | 用户可输入任意域名测试 | P0 |
| F5 | 导出 CSV / JSON / PNG | html2canvas + file-saver | P0 |
| F6 | 离线缓存 | Service Worker + CacheFirst | P0 |
| F7 | 节流与重试 | 每轮 1 s 间隔，3 次重试 | P0 |

---

## 3. 技术栈
- **前端框架**: Vue 3 + `<script setup>` + TypeScript  
- **构建工具**: Vite
- **PWA**: VitePWA 插件（自动生成 Service Worker）  
- **图表**: 最新的ECharts + echarts-gl  
- **截图**: html2canvas 最新  
- **并发**: Web Worker + fetch(DoH)  
- **浏览器基线**: Chrome 110+（支持 HTTP/3）  

---

## 4. DNS 列表（14 组）
| IP | 名称 | DoH URL |
|---|---|---|
| 223.5.5.5 | 阿里 AliDNS | https://dns.alidns.com/dns-query |
| 223.6.6.6 | 阿里 AliDNS（备） | https://dns.alidns.com/dns-query |
| 119.29.29.29 | DNSPod | https://doh.pub/dns-query |
| 114.114.114.114 | 114DNS | https://dns.114dns.com/dns-query |
| 114.114.115.115 | 114DNS（备） | https://dns.114dns.com/dns-query |
| 180.76.76.76 | 百度 BaiduDNS | https://doh.360.cn/dns-query |
| 122.112.208.1 | OneDNS 北京 | https://doh.onedns.net/dns-query |
| 139.9.23.90 | OneDNS 杭州 | https://doh.onedns.net/dns-query |
| 1.12.12.12 | 360 安全 DNS | https://doh.360.cn/dns-query |
| 101.226.4.6 | 中国电信 | https://dns.189.cn/dns-query |
| 218.85.152.99 | 福建电信 | https://dns.189.cn/dns-query |
| 202.96.209.133 | 上海电信 | https://dns.189.cn/dns-query |
| 211.136.112.50 | 中国移动 | https://cmcc-dns.do/dns-query |
| 211.140.13.188 | 中国移动（备） | https://cmcc-dns.do/dns-query |

---

## 5. 打分规则
| 维度 | 权重 | 计算方式 |
|---|---|---|
| 解析延迟 | 40 % | 平均 RTT（ms），越小越好 |
| 正确性 | 30 % | 与权威答案匹配率（0/1） |
| QPS | 30 % | 3 轮并发下的平均 QPS |

最终得分 = 100 - (归一化后的加权值)

---

## 6. 性能与节流
- **并发上限**: ≤ 10（浏览器同源限制）  
- **测试轮次**: 3 轮，每轮间隔 1 s  
- **重试**: 超时或 SERVFAIL 自动重试 3 次，指数退避 500 ms → 1 s → 2 s  
- **节流**: 全局 AbortController，防止用户狂点

---

## 7. 用户交互流程
1. 进入页面 → Service Worker 缓存静态资源  
2. 输入/选择待测域名  
3. 点击「开始测试」→ 启动 Web Worker  
4. 实时折线图滚动显示每轮延迟  
5. 测试完成 → 排行榜 + 导出按钮

---

## 8. 隐私与安全
纯前端，不发送任何数据到服务器
DoH 请求直接到对应 DNS 官方域名，无中间人
Service Worker 缓存策略：静态资源 CacheFirst，API 不缓存

---


