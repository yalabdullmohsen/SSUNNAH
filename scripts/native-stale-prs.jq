# يصنّف كل PR: آخر تشغيل لكل فحص إلزامي فقط (تُتجاهل التشغيلات القديمة الملغاة/المستبدلة)
.[] | . as $p
  | ([ $p.statusCheckRollup[]? | select((.name // .context) as $c | ["gate","deterministic","ownership"] | index($c)) ]
     | group_by(.name // .context) | map(sort_by(.completedAt // .startedAt // "") | last)) as $r
  | ([ $r[] | select(.conclusion != "SUCCESS" and .state != "SUCCESS") | (.name // .context) ]) as $f
  | [$p.number,$p.headRefName,$p.mergeable,$p.updatedAt,(if ($r|length)<3 then "ناقص" elif ($f|length)>0 then ($f|unique|join("+")) else "OK" end),$p.url] | @tsv
