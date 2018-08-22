## 使用 1.0 版本

Hyperledger Fabric 1.0 版本整体 [重新设计了架构](https://github.com/hyperledger/fabric/blob/master/proposals/r1/Next-Consensus-Architecture-Proposal.md)，新的设计可以实现更好的扩展性和安全性。

### 下载 Compose 模板文件

```sh
$ git clone https://github.com/yeasy/docker-compose-files
```

进入 `hyperledger/1.0` 目录，查看包括若干模板文件，功能如下。

文件 | 功能 
-- | --
orderer-base.yaml | orderer 节点的基础服务模板
peer-base.yaml | peer 节点的基础服务模板
docker-compose-base.yaml | 包含 orderer 和 peers 组织结构的基础服务模板
docker-compose-1peer.yaml | 使用自定义的 `channel` 启动一个最小化的环境，包括 1 个 peer 节点、1 个 orderer 节点、1 个 CA 节点、1 个 cli 节点
docker-compose-2orgs-4peers.yaml | 使用自定义的 `channel` 启动一个环境，包括 4 个 peer 节点、1 个 orderer 节点、1 个 CA 节点、1 个 cli 节点
docker-compose-2orgs-4peers-couchdb.yaml | 启动一个带有 couchdb 服务的网络环境
docker-compose-2orgs-4peers-event.yaml | 启动一个带有 event 事件服务的网络环境
e2e_cli/channel-artifacts | 存放创建 orderer, channel, anchor peer 操作时的配置文件
e2e_cli/crypto-config | 存放 orderer 和 peer 相关证书
e2e_cli/example | 用来测试的 chaincode
scripts/setup_Docker.sh | 安装并配置 dokcer 和 docker-compose
scripts/download_images.sh | 下载依赖镜像
scripts/start_fabric.sh | 快速启动一个fabric 网络
scripts/initialize.sh | 自动化测试脚本，用来初始化 `channel` 和 `chaincode`
scripts/test_4peers.sh | 自动化测试脚本，用来执行 chaincode 操作
scripts/cleanup_env.sh | 容器，镜像自动清除脚本
scripts/test_1peer.sh | 测试1个peer网络的自动化脚本
kafka/ |基于kafka 的 ordering 服务

### 安装 Docker 和 docker-compose 

docker 及 docker-compose 可以自行手动安装。也可以通过 hyperledger/1.0/scripts 提供的 `setup_Docker.sh` 脚本自动安装。

```bash
$ bash scripts/setup_Docker.sh
```

### 获取 Docker 镜像

Docker 镜像可以自行从源码编译（`make docker`），或从 DockerHub 仓库下载。

#### 执行脚本获取
直接执行 hyperledger/1.0/scripts 提供的 `download_images.sh` 脚本获取。

```bash
$ bash scripts/download_images.sh
```

#### 从官方仓库获取
从社区 DockerHub 仓库下载。

```bash
# pull fabric images
ARCH=x86_64
BASEIMAGE_RELEASE=0.3.1
BASE_VERSION=1.0.0
PROJECT_VERSION=1.0.0
IMG_TAG=1.0.0

echo "Downloading fabric images from DockerHub...with tag = ${IMG_TAG}... need a while"
# TODO: we may need some checking on pulling result?
docker pull hyperledger/fabric-peer:$ARCH-$IMG_TAG
docker pull hyperledger/fabric-orderer:$ARCH-$IMG_TAG
docker pull hyperledger/fabric-ca:$ARCH-$IMG_TAG
docker pull hyperledger/fabric-tools:$ARCH-$IMG_TAG
docker pull hyperledger/fabric-ccenv:$ARCH-$PROJECT_VERSION
docker pull hyperledger/fabric-baseimage:$ARCH-$BASEIMAGE_RELEASE
docker pull hyperledger/fabric-baseos:$ARCH-$BASEIMAGE_RELEASE

# Only useful for debugging
# docker pull yeasy/hyperledger-fabric

echo "===Re-tagging images to *latest* tag"
docker tag hyperledger/fabric-peer:$ARCH-$IMG_TAG hyperledger/fabric-peer
docker tag hyperledger/fabric-orderer:$ARCH-$IMG_TAG hyperledger/fabric-orderer
docker tag hyperledger/fabric-ca:$ARCH-$IMG_TAG hyperledger/fabric-ca
docker tag hyperledger/fabric-tools:$ARCH-$IMG_TAG hyperledger/fabric-tools
```
#### 从第三方仓库获取
这里也提供了调整（基于 golang:1.8 基础镜像制作）后的第三方镜像，与社区版本功能是一致的。

通过如下命令拉取相关镜像，并更新镜像别名。

```bash
$ ARCH=x86_64
$ BASEIMAGE_RELEASE=0.3.1
$ BASE_VERSION=1.0.0
$ PROJECT_VERSION=1.0.0
$ IMG_TAG=1.0.0
$ docker pull yeasy/hyperledger-fabric-base:$IMG_VERSION \
  && docker pull yeasy/hyperledger-fabric-peer:$IMG_VERSION \
  && docker pull yeasy/hyperledger-fabric-orderer:$IMG_VERSION \
  && docker pull yeasy/hyperledger-fabric-ca:$IMG_VERSION \
  && docker pull hyperledger/fabric-couchdb:$ARCH-$IMG_VERSION \
  && docker pull hyperledger/fabric-kafka:$ARCH-$IMG_VERSION \
  && docker pull hyperledger/fabric-zookeeper:$ARCH-$IMG_VERSION
  
$ docker tag yeasy/hyperledger-fabric-peer:$IMG_VERSION hyperledger/fabric-peer \
  && docker tag yeasy/hyperledger-fabric-orderer:$IMG_VERSION hyperledger/fabric-orderer \
  && docker tag yeasy/hyperledger-fabric-ca:$IMG_VERSION hyperledger/fabric-ca \
  && docker tag yeasy/hyperledger-fabric-peer:$IMG_VERSION hyperledger/fabric-tools \
  && docker tag yeasy/hyperledger-fabric-base:$IMG_VERSION hyperledger/fabric-ccenv:$ARCH-$PROJECT_VERSION \
  && docker tag yeasy/hyperledger-fabric-base:$IMG_VERSION hyperledger/fabric-baseos:$ARCH-$BASEIMAGE_RELEASE \
  && docker tag yeasy/hyperledger-fabric-base:$IMG_VERSION hyperledger/fabric-baseimage:$ARCH-$BASEIMAGE_RELEASE \
  && docker tag hyperledger/fabric-couchdb:$ARCH-$IMG_VERSION hyperledger/fabric-couchdb \
  && docker tag hyperledger/fabric-zookeeper:$ARCH-$IMG_VERSION hyperledger/fabric-zookeeper \
  && docker tag hyperledger/fabric-kafka:$ARCH-$IMG_VERSION hyperledger/fabric-kafka
```

### 启动 fabric 1.0 网络

通过如下命令快速启动。

```sh
$ bash scripts/start_fabric.sh
```

或者

```bash
$ docker-compose -f docker-compose-2orgs-4peers.yaml up
```

注意输出日志中无错误信息。

此时，系统中包括 7 个容器。

```bash
$ docker ps -a
CONTAINER ID        IMAGE                        COMMAND                  CREATED             STATUS              PORTS                                                                                 NAMES
8683435422ca        hyperledger/fabric-peer      "bash -c 'while true;"   19 seconds ago      Up 18 seconds       7050-7059/tcp                                                                         fabric-cli
f284c4dd26a0        hyperledger/fabric-peer      "peer node start --pe"   22 seconds ago      Up 19 seconds       7050/tcp, 0.0.0.0:7051->7051/tcp, 7052/tcp, 7054-7059/tcp, 0.0.0.0:7053->7053/tcp     peer0.org1.example.com
95fa3614f82c        hyperledger/fabric-ca        "fabric-ca-server sta"   22 seconds ago      Up 19 seconds       0.0.0.0:7054->7054/tcp                                                                fabric-ca
833ca0d8cf41        hyperledger/fabric-orderer   "orderer"                22 seconds ago      Up 19 seconds       0.0.0.0:7050->7050/tcp                                                                orderer.example.com
cd21cfff8298        hyperledger/fabric-peer      "peer node start --pe"   22 seconds ago      Up 20 seconds       7050/tcp, 7052/tcp, 7054-7059/tcp, 0.0.0.0:9051->7051/tcp, 0.0.0.0:9053->7053/tcp     peer0.org2.example.com
372b583b3059        hyperledger/fabric-peer      "peer node start --pe"   22 seconds ago      Up 20 seconds       7050/tcp, 7052/tcp, 7054-7059/tcp, 0.0.0.0:10051->7051/tcp, 0.0.0.0:10053->7053/tcp   peer1.org2.example.com
47ce30077276        hyperledger/fabric-peer      "peer node start --pe"   22 seconds ago      Up 20 seconds       7050/tcp, 7052/tcp, 7054-7059/tcp, 0.0.0.0:8051->7051/tcp, 0.0.0.0:8053->7053/tcp     peer1.org1.example.com
```

### 测试网络

启动 fabric 网络后，可以进行 chaincode 操作，验证网络是否启动正常。

进入到 cli 容器里面，执行 `initialize.sh` 和 `test_4peers.sh` 脚本。

通过如下命令进入容器 cli 并执行测试脚本。

```bash
$ docker exec -it fabric-cli bash
$ bash ./scripts/initialize.sh
```

注意输出日志无错误提示，最终返回结果应该为：

```bash
UTC [main] main -> INFO 00c Exiting.....
===================== Chaincode Instantiation on PEER2 on channel 'businesschannel' is successful ===================== 


===================== All GOOD, initialization completed ===================== 


 _____   _   _   ____  
| ____| | \ | | |  _ \ 
|  _|   |  \| | | | | |
| |___  | |\  | | |_| |
|_____| |_| \_| |____/ 
```

之后同样是在 `cli` 容器里执行 `test_4peers.sh` 脚本

```bash
$ bash ./scripts/test_4peers.sh
```

输出日志无错误提示，最终返回结果应该为：

```bash
Query Result: 80
UTC [main] main -> INFO 008 Exiting.....
===================== Query on PEER3 on channel 'businesschannel' is successful ===================== 

===================== All GOOD, End-2-End execution completed ===================== 


 _____   _   _   ____  
| ____| | \ | | |  _ \ 
|  _|   |  \| | | | | |
| |___  | |\  | | |_| |
|_____| |_| \_| |____/ 
```

至此，整个网络启动并验证成功。