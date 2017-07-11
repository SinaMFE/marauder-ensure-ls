# @mfelibs/webpack-marauder-ensure-ls

被marauder引用，用于提高性能，在require.ensure使用过程中利用ls进行缓存


#### demo
[http://unpkg.smfe.sina.cn/@mfelibs/webpack-marauder-ensure-ls@0.0.6/dist/demo.html](http://unpkg.smfe.sina.cn/@mfelibs/webpack-marauder-ensure-ls@0.0.6/dist/demo.html)


## 安装

```bash
cnpm install @mfelibs/webpack-marauder-ensure-ls --save
```


## 使用

在配置文件marauder.config.js中进行配置
```javascript
ensurels:true
```

### 说明
通过`require.ensure`引用的JS，会在页面第一次引入时添加到body之后，再次引用时取缓存中的js进行添加
localStorage中缓存如下对应关系：
```
js/zx:"js/zx.2dd482ec.chunk.js"
js/zx.2dd482ec.chunk.js:xxxxxxxxxx……

```
每次页面刷新时会查询该js的md5版本号，若版本号相对则取出缓存插入到页面。
若版本号不对，会将原地址插入到页面，并更新缓存中的版本号。
请注意命名的不重复的性。
### 版本
0.0.5 测试版本
0.0.6 修改body后插入
0.0.7 修改正则匹配bug


