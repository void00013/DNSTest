// DNS 列表数据
export interface DNSRecord {
  ip: string;
  name: string;
  dohUrl?: string; // 与dns-types.ts保持一致，设为可选属性
}

const dnsList: DNSRecord[] = [
  { ip: '223.5.5.5', name: '阿里 AliDNS', dohUrl: 'https://dns.alidns.com/dns-query' },
  { ip: '223.6.6.6', name: '阿里 AliDNS（备）', dohUrl: 'https://dns.alidns.com/dns-query' },
  { ip: '119.29.29.29', name: 'DNSPod', dohUrl: 'https://doh.pub/dns-query' },
  // 注释掉有问题的DNS服务器
  { ip: '114.114.114.114', name: '114DNS', dohUrl: 'https://dns.114dns.com/dns-query' },
  { ip: '114.114.115.115', name: '114DNS（备）', dohUrl: 'https://dns.114dns.com/dns-query' },
  { ip: '180.76.76.76', name: '百度 BaiduDNS', dohUrl: 'https://doh.360.cn/dns-query' },
  { ip: '122.112.208.1', name: 'OneDNS 北京', dohUrl: 'https://doh.onedns.net/dns-query' },
  { ip: '139.9.23.90', name: 'OneDNS 杭州', dohUrl: 'https://doh.onedns.net/dns-query' },
  { ip: '1.12.12.12', name: '360 安全 DNS', dohUrl: 'https://doh.360.cn/dns-query' },
  { ip: '101.226.4.6', name: '中国电信', dohUrl: 'https://dns.189.cn/dns-query' },
  { ip: '218.85.152.99', name: '福建电信', dohUrl: 'https://dns.189.cn/dns-query' },
  { ip: '202.96.209.133', name: '上海电信', dohUrl: 'https://dns.189.cn/dns-query' },
  { ip: '211.136.112.50', name: '中国移动', dohUrl: 'https://cmcc-dns.do/dns-query' },
  { ip: '211.140.13.188', name: '中国移动（备）', dohUrl: 'https://cmcc-dns.do/dns-query' }
];

export default dnsList;