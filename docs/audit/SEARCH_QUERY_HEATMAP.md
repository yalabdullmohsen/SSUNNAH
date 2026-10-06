# SEARCH_QUERY_HEATMAP

Generated: 2026-10-06

Live latency: **NOT_MEASURED — no wall-clock invent; use DEVICE_REQUIRED / CI probes**

## Index

| Metric | Value |
|---|---:|
| docs | 4650 |
| bytes | 1856232 |
| KiB | 1813 |
| schema | 3 (need ≥3) |
| shards | 30 |
| worker | true |
| yieldToMain | true |
| gin/trgm mentions | 85 |
| fts mentions | 140 |

## Cost proxies (static)

- **full_index_scan_client**: 4650 — Client scans primed docs; worker loads JSON
- **index_payload_kib**: 1813 — Network/parse cost of index.json
- **largest_shard_kib**: 1115 — qa

## Largest shards

- `qa`: 1115 KiB
- `tafsir`: 274 KiB
- `adhkar`: 105 KiB
- `history`: 104 KiB
- `lesson`: 50 KiB
- `discover-islam`: 50 KiB
- `person`: 43 KiB
- `quran-people`: 24 KiB
