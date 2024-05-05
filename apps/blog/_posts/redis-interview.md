---
title: 'Redis'
excerpt: 'Redis 缓存管理、持久化存储、哨兵与高可用、集群'
coverImage: '/assets/blog/redis-interview/redis-logo.svg'
date: '2024-03-20T04:16:53.929Z'
author:
  name: Coda
  picture: 'https://avatars.githubusercontent.com/u/23135654?v=4'
ogImage:
  url: '/assets/blog/redis-interview/redis-logo.svg'
---

# Redis 缓存管理

## Redis

Redis 是内存数据库并可以持久化数据到硬盘，数据以K/V形式保存。由 [Antirez](https://github.com/antirez) 创建。

> Redis is an in-memory database that persists on disk. The data model is key-value, but many different kind of values are supported: Strings, Lists, Sets, Sorted Sets, Hashes, Streams, HyperLogLogs, Bitmaps.

在没有 Redis 之前用户发送的每一次请求需要直接在数据库上做读/写操作，当用户越来越多请求也随之暴涨，而数据库的请求大多是重复查询一个东西数据库需要时间去读硬盘，后来就有了给数据库加缓存于是 Redis 就出现了。

> 固态硬盘（SSD）60-170MB/s
> 机械硬盘（HDD）150-300MB/s。
> 内存（RAM）2-50GB/s。

## RAM 清理 [Key eviction](https://redis.io/docs/reference/eviction/)

随着应用运行缓存在 Redis 的数据越来越多，需要有个清理机制来确保内存不会爆掉

### 定期删除

缓存内容由应用设置超时时间，Redis 100ms 执行一次清理过期内容，由于数据可能很多，Redis 随机选择一部分删除

### 惰性删除

查询请求过期的内容 Redis 立即删除

### 内存淘汰策略

- **noeviction**: New values aren’t saved when memory limit is reached. When a database uses replication, this applies to the primary database 返回错误，不会删除任何键值
- **allkeys-lru**: Keeps most recently used keys; removes least recently used (LRU[^1^][1]) keys 使用LRU算法删除最近最少使用的键值
- **allkeys-lfu**: Keeps frequently used keys; removes least frequently used (LFU[^2^][2]) keys 从所有键中删除使用频率最少的键
- **volatile-lru**: Removes least recently used keys with the expire field set to true. 使用LRU算法从设置了过期时间的键集合中删除最近最少使用的键值
- **volatile-lfu**: Removes least frequently used keys with the expire field set to true. 从配置了过期时间的键中删除使用频率最少的键
- **allkeys-random**: Randomly removes keys to make space for the new data added. 从所有key随机删除
- **volatile-random**: Randomly removes keys with expire field set to true. 从设置了过期时间的键的集合中随机删除
- **volatile-ttl**: Removes keys with expire field set to true and the shortest remaining time-to-live (TTL) value. 从设置了过期时间的键中删除剩余时间最短的键

## 缓存击穿

频繁查询不存在的数据 Redis 无法缓存导致数据库频繁操作

布隆过滤器 [bloom-filter](https://redis.io/docs/data-types/probabilistic/bloom-filter/)

## 缓存雪崩

缓存集体失效导致数据库频繁操作。

过期时间均匀分布，热点数据永不过期

# 持久化存储

## RDB [^3^][3]

RDB 持久化是通过子进程创建数据集的快照来持久化数据的。你可以通过修改 `redis.conf` 配置文件来设置多个 save 规则，满足任意规则都会触发保存机制。

```
save 60 1000
```

如果在 60 秒内至少有 1000 个键值对发生变化，Redis 就会自动触发 BGSAVE 命令，将当前所有数据生成一个快照并保存到磁盘。

此外，你还可以手动执行 save 或 bgsave 命令来生成 RDB 快照。每次执行这些命令，Redis 都会将所有内存数据快照到一个新的 rdb 文件，并覆盖原有的 rdb 快照文件

需要注意的是，虽然 RDB 快照可以提供一种方便的数据备份方式，但如果 Redis 在没有正确关闭的情况下停止工作（例如电源故障），你可能会丢失最近几分钟的数据。因此，如果你需要最小化数据丢失的可能性，可能需要考虑使用 AOF 持久化。AOF 持久化会记录服务器执行的所有写命令，并在服务重启时通过重放这些命令来还原数据

## AOF

当 Redis 的 AOF（Append Only File）持久化功能打开时，服务器在执行完一个写命令之后，会以协议格式将被执行的写命令追加到 `aof_buf` 缓冲区的末尾。

这个 `aof_buf` 缓冲区中的内容会在一定条件下被写入到 AOF 文件中。具体的写入和同步行为由服务器配置的 appendfsync 选项决定。

Redis 会将接收到的每一个写操作都记录到一个日志文件中。这些操作可以在服务器启动时重新播放，从而重建原始数据集。

### AOF 重写

随着 Redis 操作的不断进行，AOF 文件可能会变得越来越大，因为它记录了所有的写操作。为了解决这个问题，Redis 提供了 AOF 重写机制。

在 AOF 重写过程中，Redis 会创建一个新的 AOF 文件，这个新文件包含了恢复当前数据库状态所需的最小写操作集。这个过程是由后台进程 `bgrewriteaof` 来完成的。主线程会 fork 出一个 `bgrewriteaof` 子进程，然后这个子进程会读取数据库的数据，并将这些数据转换为写操作，写入到新的 AOF 文件中。

在 AOF 重写期间，如果有新的写命令被执行，主线程会将这些命令同时追加到旧的 AOF 文件和 AOF 重写缓冲区 `aof_rewrite_buf`。当 `bgrewriteaof` 子进程完成 AOF 文件的重写操作后，主线程会将 AOF 重写缓冲区中的命令追加到新的 AOF 文件后面。

需要注意的是，AOF 重写过程中有几个地方可能会阻塞主线程：

1. fork 子进程时，需要拷贝虚拟页表，会对主线程造成阻塞。

2. 主进程有 bigkey 写入时，操作系统会创建页面的副本，并拷贝原有的数据，会对主线程造成阻塞1。

3. 子进程重写日志完成后，主进程追加 AOF 重写缓冲区时可能会对主线程造成阻塞1。

总的来说，AOF 重写是一种有效的方式来控制 AOF 文件的大小，但在重写过程中需要注意可能会对主线程造成阻塞的情况。

选择使用 RDB 还是 AOF 持久化，或者同时使用两者，取决于你的具体需求和应用场景。如果你需要最小化数据丢失的可能性，可能需要考虑使用 AOF 持久化。如果你需要快速重启或者进行数据备份，可能会选择 RDB 持久化。同时使用 RDB 和 AOF 可能会提供更好的持久性，同时仍然保持快速重启的能力。

# [哨兵与高可用](https://redis.io/docs/management/sentinel/)

Redis 的哨兵（Sentinel）模式是一种高可用性解决方案。哨兵模式可以监控和管理 Redis 集群中的多个节点，并在发现主节点出现宕机等异常情况时，自动将从节点提升为主节点，继续提供服务。

哨兵模式的主要功能包括：

- 监控：哨兵会不断地检查你的主服务器和从服务器是否运作正常。
- 通知：通过事件 API 将服务实例异常情况即时告知监听者。
- 自动故障转移：当主服务器宕机时，哨兵可以自动从从服务器中选举出一个新的主服务器，并通知应用程序新的主服务器地址。

哨兵模式的工作原理如下：

- 每个哨兵以每秒钟一次的频率，向它已知的所有主服务器和从服务器发送一个 PING 命令。
- 如果某一个实例距离最后一次有效回复 PING 命令的时间超过 down-after-milliseconds 所指定的值，那么这个实例会被哨兵标记为主观下线。
- 如果一个主服务器被标记为主观下线，并且有足够数量的哨兵（至少要达到配置文件指定的数量）在指定的时间范围内同意这一判断，那么这个主服务器被标记为客观下线。
- 当主服务器被标记为客观下线时，哨兵会开始一个故障转移过程，选举一个新的主服务器，并通知所有的从服务器和客户端新的主服务器地址。

Redis 主节点出现故障时，哨兵会投票选择新的主节点，会依据以下几个关键指标：

1. 在线状态：哨兵会选择在线的节点，过滤掉已经下线的节点。
2. 响应速度：哨兵会选择响应速度快的节点，过滤掉响应慢的节点。
3. 与原主节点的断开时间：哨兵会选择与原主节点断开时间短的节点，过滤掉断开时间长的节点。
4. 复制偏移量：如果以上优先级都一致时，哨兵会选择复制偏移量最大的节点。
5. runid：如果复制偏移量也相同，那么哨兵会选择 runid 偏大的节点

当 Redis 的一个节点重新上线并需要与主节点同步时，它会遵循以下步骤：

- 发送 SYNC 命令：重新上线的节点（作为从节点）会向主节点发送 SYNC 命令来请求同步14。这个命令请求包含了一个参数，表示从节点的复制偏移量 repl_offset 以及目标 master 节点的 id replid4。这个偏移量指定了从节点需要获取的数据起始点，master 节点的 id 指定了具体同步的 master 节点4。
- 主节点开始同步：主节点收到 SYNC 请求后，会开始执行 BGSAVE 命令生成 RDB 文件，并使用缓冲区记录所有接收到的写命令操作14。主节点接收到 SYNC 命令请求后，会执行 BGSAVE 命令生成 RDB 文件，并将所有接收到的写命令操作记录在主节点的 Replication Buffer 中4。
- 数据同步：主节点会将生成的 RDB 文件和 Replication Buffer 中的数据发送给从节点。从节点接收到这些数据后，会加载 RDB 文件，将自己的数据集替换成主节点的数据集。同时，从节点也会执行 Replication Buffer 中的写命令，以确保自己的数据与主节点保持一致。

需要注意的是，如果主从节点之间的网络连接在同步过程中断开，那么当网络连接恢复后，从节点会再次发送 SYNC 命令来请求同步。此时，如果主节点的 Replication Buffer 中还包含了从节点未接收的数据，那么主节点会将这些数据发送给从节点，从而完成同步。否则，主节点会再次进行全量同步

# [集群](https://redis.io/docs/management/scaling/)

Redis 集群是一个分布式数据库系统，由多个独立的 Redis 节点组成，每个节点都拥有自己的数据副本和负载均衡机制，可以根据需要进行动态扩容和缩容。以下是 Redis 集群的主要工作原理：

1. 数据分片：Redis 集群采用的是虚拟槽分片算法，将数据分散存储在多个节点上，实现数据的均衡分布。整个 Redis 集群有 16384 个哈希槽，数据库中的每个键都属于这 16384 个哈希槽的其中一个，集群使用公式 CRC16(key) % 16384 来计算键 key 属于哪个槽。
2. 故障转移：Redis 集群采用的是自动故障转移算法，当某个节点宕机或者网络中断时，集群中的其他节点会自动接管故障节点的工作。
3. 数据同步：Redis 集群采用的是异步复制算法，即每个节点都有自己的主节点和从节点，主节点负责写入数据，从节点负责读取数据，当主节点写入数据时，会异步复制到从节点上。
4. 负载均衡：Redis 集群采用的是客户端分片算法，将客户端请求均衡分配到集群中的各个节点上，提高系统的性能和可用性

新节点加入 Redis 集群的过程主要包括以下几个步骤：

1. 创建新节点：在新的服务器上部署 Redis，为新节点配置适当的端口和其他设置。
2. 启动新节点：启动新节点的 Redis 实例。
3. 添加新节点到集群：使用 `redis-cli --cluster add-node` 命令将新节点添加到集群中。这个命令需要指定新节点的 IP 和端口，以及集群中任意一个已存在节点的 IP 和端口。
4. 分配哈希槽：新添加的节点默认是没有哈希槽的，因此无法存储数据。需要使用 `redis-cli --cluster reshard` 命令为新节点分配哈希槽。这个命令需要指定要分配的哈希槽数量，以及哈希槽的来源节点。
5. 添加从节点：如果新节点是从节点，还需要使用 `redis-cli --cluster add-node --cluster-slave --cluster-master-id` 命令将新节点添加为某个主节点的从节点。这个命令需要指定新节点的 IP 和端口，主节点的 ID，以及集群中任意一个已存在节点的 IP 和端口

# Reference

[^1^][1]: LRU [https://redis.com/glossary/lru-cache/](https://redis.com/glossary/lru-cache/)

[^2^][2]: [LFU](https://redis.io/docs/reference/eviction/#the-new-lfu-mode)

[^3^][3]: [https://redis.io/docs/management/persistence/](https://redis.io/docs/management/persistence/)

[轩辕的编程宇宙 趣话Redis](https://www.bilibili.com/video/BV1Fd4y1T7pD)
