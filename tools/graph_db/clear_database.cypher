// 清空OpenMTSciEd图谱数据(谨慎使用!)
// 仅用于开发阶段重置数据

MATCH (n)
DETACH DELETE n;

// 验证已清空
MATCH (n) RETURN count(n) AS remaining_nodes;
