## 基本信息

```sh
## 构建指令
docker build --build-arg https_proxy=$(proxy) --build-arg http_proxy=$(proxy) -t llm-loong64 --file docker/Dockerfile.loongarch64 .
```
目前阻塞点： “anythingllm”依赖"@xenova/transformers@^2.14.0"->"sharp^0.32.0"->"libvips大于8.14.5"，目前debian系统上的"libvips=8.7.4"不满足条件
