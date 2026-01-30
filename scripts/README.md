# Scripts

## Jira batch update

### batch_update_jira_tasks.py

Batch update Jira issues and link them to an Epic.

#### Usage

1. Set environment variables:

```bash
export JIRA_EMAIL=your-email@example.com
export JIRA_API_TOKEN=your-api-token
```

2. Run:

```bash
python3 scripts/batch_update_jira_tasks.py
```

#### Jira API token

1. Open `https://id.atlassian.com/manage-profile/security/api-tokens`
2. Click "Create API token"
3. Copy the token
4. Set `JIRA_API_TOKEN`

#### Config

- `JIRA_BASE_URL`: Jira instance base URL
- `JIRA_EMAIL`: Jira account email
- `JIRA_API_TOKEN`: Jira API token
- `ISSUE_KEYS`: issue keys to update
- `EPIC_KEY`: target Epic key

## Data mining (machine learning + deep learning)

The data mining pipeline lives in `services/data-mining/`.

### Generate sample data

```bash
python3 services/data-mining/generate_synthetic.py
```

### Build purchase propensity dataset

```bash
python3 services/data-mining/prepare_propensity_dataset.py
```

### Train purchase propensity models

```bash
python3 services/data-mining/train_propensity_ml.py
python3 services/data-mining/train_propensity_dl.py
```

### Train recommender model

```bash
python3 services/data-mining/train_recommender_dl.py
```


