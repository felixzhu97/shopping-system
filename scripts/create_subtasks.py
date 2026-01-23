#!/usr/bin/env python3
"""
批量创建 Jira 子任务
参照 SHOPPING-001 的子任务结构，为指定任务创建相同的子任务
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

# 子任务模板（参照 SHOPPING-204）
SUBTASK_TEMPLATES = [
    "设计",
    "开发",
    "联调",
    "自测",
    "bug修复"
]

# 要创建子任务的任务列表
PARENT_ISSUES = [
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


def create_subtask(parent_key: str, summary: str, auth: tuple) -> str:
    """
    创建子任务
    
    Args:
        parent_key: 父任务的键
        summary: 子任务摘要
        auth: HTTP Basic Auth 凭证 (email, api_token)
    
    Returns:
        str: 创建的子任务键，如果失败返回 None
    """
    url = f"{JIRA_BASE_URL}/rest/api/2/issue"
    
    # 获取父任务的 ID（用于 next-gen 项目）
    parent_url = f"{JIRA_BASE_URL}/rest/api/2/issue/{parent_key}"
    
    try:
        # 先获取父任务信息
        parent_response = requests.get(parent_url, auth=auth, timeout=30)
        if parent_response.status_code != 200:
            print(f"✗ 无法获取父任务 {parent_key} 信息: {parent_response.status_code}")
            return None
        
        parent_data = parent_response.json()
        parent_id = parent_data["id"]
        
        # 创建子任务的 payload
        payload = {
            "fields": {
                "project": {
                    "key": "SHOPPING"
                },
                "summary": summary,
                "issuetype": {
                    "name": "子任务"
                },
                "parent": {
                    "id": parent_id
                },
                "priority": {
                    "name": "Medium"
                }
            }
        }
        
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
        
        response = requests.post(
            url,
            auth=auth,
            headers=headers,
            json=payload,
            timeout=30
        )
        
        if response.status_code == 201:
            created_issue = response.json()
            subtask_key = created_issue["key"]
            print(f"✓ 成功创建子任务 {subtask_key}: {summary} (父任务: {parent_key})")
            return subtask_key
        else:
            print(f"✗ 创建子任务失败 ({summary}, 父任务: {parent_key}): {response.status_code} - {response.text}")
            return None
            
    except requests.exceptions.RequestException as e:
        print(f"✗ 创建子任务时发生错误 ({summary}, 父任务: {parent_key}): {str(e)}")
        return None


def batch_create_subtasks(parent_issues: List[str]) -> dict:
    """
    批量创建子任务
    
    Args:
        parent_issues: 父任务键列表
    
    Returns:
        dict: 创建结果统计
    """
    if not JIRA_EMAIL or not JIRA_API_TOKEN:
        print("错误: 请设置环境变量 JIRA_EMAIL 和 JIRA_API_TOKEN")
        return {"success": 0, "failed": 0, "total": 0}
    
    auth = (JIRA_EMAIL, JIRA_API_TOKEN)
    
    total_subtasks = len(parent_issues) * len(SUBTASK_TEMPLATES)
    results = {"success": 0, "failed": 0, "total": total_subtasks}
    
    print(f"开始为 {len(parent_issues)} 个父任务创建子任务...")
    print(f"每个父任务将创建 {len(SUBTASK_TEMPLATES)} 个子任务")
    print(f"总计需要创建 {total_subtasks} 个子任务\n")
    
    for parent_key in parent_issues:
        print(f"\n处理父任务: {parent_key}")
        print("-" * 60)
        
        for summary in SUBTASK_TEMPLATES:
            subtask_key = create_subtask(parent_key, summary, auth)
            if subtask_key:
                results["success"] += 1
            else:
                results["failed"] += 1
    
    return results


def main():
    """主函数"""
    print("=" * 60)
    print("Jira 子任务批量创建脚本")
    print("=" * 60)
    print(f"Jira URL: {JIRA_BASE_URL}")
    print(f"父任务数: {len(PARENT_ISSUES)}")
    print(f"子任务模板: {', '.join(SUBTASK_TEMPLATES)}")
    print(f"总计将创建: {len(PARENT_ISSUES) * len(SUBTASK_TEMPLATES)} 个子任务\n")
    
    if not JIRA_EMAIL or not JIRA_API_TOKEN:
        print("\n提示: 请设置以下环境变量:")
        print("  export JIRA_EMAIL=your-email@example.com")
        print("  export JIRA_API_TOKEN=your-api-token")
        print("\n或者编辑脚本，直接在代码中设置这些值")
        sys.exit(1)
    
    results = batch_create_subtasks(PARENT_ISSUES)
    
    print("\n" + "=" * 60)
    print("创建完成!")
    print("=" * 60)
    print(f"总计: {results['total']} 个子任务")
    print(f"成功: {results['success']} 个")
    print(f"失败: {results['failed']} 个")
    
    if results["failed"] > 0:
        sys.exit(1)


if __name__ == "__main__":
    main()

