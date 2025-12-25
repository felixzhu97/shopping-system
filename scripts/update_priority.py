#!/usr/bin/env python3
"""
批量更新 Jira 任务优先级为 Highest
"""

import os
import sys
import requests
import json
from typing import List

# Jira 配置
JIRA_BASE_URL = os.getenv("JIRA_BASE_URL", "https://luckychat.atlassian.net")
JIRA_EMAIL = os.getenv("JIRA_EMAIL", "")
JIRA_API_TOKEN = os.getenv("JIRA_API_TOKEN", "")

# 要更新优先级的任务列表
ISSUE_KEYS = [
    "SHOPPING-001",  # 项目搭建
    "SHOPPING-002",  # 首页
    "SHOPPING-003",  # 商品详情
    "SHOPPING-004",  # 购物车
    "SHOPPING-005",  # 订单
    "SHOPPING-006",  # 支付
    "SHOPPING-007",  # 评价
    "SHOPPING-008",  # 退货
    "SHOPPING-009",  # 退款
    "SHOPPING-010",  # 退货退款
]

# 目标优先级
PRIORITY = "Highest"


def update_issue_priority(issue_key: str, priority: str, auth: tuple) -> bool:
    """
    更新任务的优先级
    
    Args:
        issue_key: 要更新的任务键
        priority: 目标优先级（如 "Highest", "High", "Medium", "Low"）
        auth: HTTP Basic Auth 凭证 (email, api_token)
    
    Returns:
        bool: 是否更新成功
    """
    url = f"{JIRA_BASE_URL}/rest/api/2/issue/{issue_key}"
    
    payload = {
        "fields": {
            "priority": {
                "name": priority
            }
        }
    }
    
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    
    try:
        response = requests.put(
            url,
            auth=auth,
            headers=headers,
            json=payload,
            timeout=30
        )
        
        if response.status_code == 204:
            print(f"✓ 成功更新 {issue_key} 优先级为 {priority}")
            return True
        else:
            print(f"✗ 更新 {issue_key} 失败: {response.status_code} - {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"✗ 更新 {issue_key} 时发生错误: {str(e)}")
        return False


def batch_update_priorities(issue_keys: List[str], priority: str) -> dict:
    """
    批量更新任务优先级
    
    Args:
        issue_keys: 要更新的任务键列表
        priority: 目标优先级
    
    Returns:
        dict: 更新结果统计
    """
    if not JIRA_EMAIL or not JIRA_API_TOKEN:
        print("错误: 请设置环境变量 JIRA_EMAIL 和 JIRA_API_TOKEN")
        return {"success": 0, "failed": 0, "total": len(issue_keys)}
    
    auth = (JIRA_EMAIL, JIRA_API_TOKEN)
    
    results = {"success": 0, "failed": 0, "total": len(issue_keys)}
    
    print(f"开始批量更新 {len(issue_keys)} 个任务的优先级...")
    print(f"目标优先级: {priority}\n")
    
    for issue_key in issue_keys:
        success = update_issue_priority(issue_key, priority, auth)
        if success:
            results["success"] += 1
        else:
            results["failed"] += 1
    
    return results


def main():
    """主函数"""
    print("=" * 60)
    print("Jira 任务优先级批量更新脚本")
    print("=" * 60)
    print(f"Jira URL: {JIRA_BASE_URL}")
    print(f"目标优先级: {PRIORITY}")
    print(f"要更新的任务数: {len(ISSUE_KEYS)}\n")
    
    if not JIRA_EMAIL or not JIRA_API_TOKEN:
        print("\n提示: 请设置以下环境变量:")
        print("  export JIRA_EMAIL=your-email@example.com")
        print("  export JIRA_API_TOKEN=your-api-token")
        print("\n或者编辑脚本，直接在代码中设置这些值")
        sys.exit(1)
    
    results = batch_update_priorities(ISSUE_KEYS, PRIORITY)
    
    print("\n" + "=" * 60)
    print("更新完成!")
    print("=" * 60)
    print(f"总计: {results['total']} 个任务")
    print(f"成功: {results['success']} 个")
    print(f"失败: {results['failed']} 个")
    
    if results["failed"] > 0:
        sys.exit(1)


if __name__ == "__main__":
    main()

