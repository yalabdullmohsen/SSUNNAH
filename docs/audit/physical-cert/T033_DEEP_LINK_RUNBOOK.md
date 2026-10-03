# T-033 Deep Link Runbook (repository-derived URLs only)

**Exit today:** `T033_DEEP_LINK_RUNBOOK_READY` · physical cert `DEVICE_REQUIRED`  
**Honesty:** `IOS_DEEP_LINKS_NOT_CERTIFIED` remains  
**AASA:** network-validated separately; UL certification requires physical device

## Derived configuration (do not invent)

```text
Associated Domains:
  applinks:www.ssunnah.com
  applinks:ssunnah.com
  applinks:majlisilm.com
  applinks:www.majlisilm.com

Application identifier:
  5D8TX37HTS.com.yousef.majlisilm

Custom scheme (Info.plist):
  majlisilm://

sunnah:// :
  NOT REGISTERED as OS URL scheme → NOT_APPLICABLE for OS open tests
```

### AASA included paths (examples — from live components)

```text
/prayer-times* /mushaf* /quran* /adhkar* /tasbih*
/lessons* /hadith* /fiqh* /library* /search*
/adhan* /qibla* /calendar* /settings* /account* /more*
```

### AASA excluded (NOT_APPLICABLE for Universal Link open-into-app cert)

```text
/  /admin /admin/* /api/* /.well-known/*
/auth/* /privacy* /terms* /contact* /about*
```

Note: `/auth/*` excluded → Auth callback Universal Link is **NOT_APPLICABLE**.  
Use in-app/OAuth flow + `majlisilm://` where product supports it; document actual product callback URL without inventing hosts.

## Exact eligible Universal Link samples

Host preferred for cert: `https://www.ssunnah.com`

```text
https://www.ssunnah.com/prayer-times
https://www.ssunnah.com/mushaf
https://www.ssunnah.com/quran
https://www.ssunnah.com/search
https://www.ssunnah.com/lessons
https://www.ssunnah.com/hadith
https://www.ssunnah.com/fiqh
https://www.ssunnah.com/library
https://www.ssunnah.com/settings
https://www.ssunnah.com/account
https://www.ssunnah.com/search?q=%D8%B5%D9%84%D8%A7%D8%A9
https://www.ssunnah.com/mushaf#page-2
```

## Exact eligible custom scheme samples

```text
majlisilm://prayer-times
majlisilm://mushaf
majlisilm://quran
majlisilm://search
majlisilm://lessons
majlisilm://settings
majlisilm://account
majlisilm://search?q=test
majlisilm:///mushaf
```

## Negative / safety samples (must reject or stay out-of-app safely)

```text
https://evil.example/prayer-times          (unsupported host)
https://www.ssunnah.com/admin              (excluded path — Safari/web expected)
https://www.ssunnah.com/not-a-real-route-zz
javascript:alert(1)                        (unsafe scheme)
sunnah://prayer-times                      (unregistered OS scheme)
majlisilm://../../etc/passwd               (traversal — resolver must null)
```

## States to test per eligible URL

1. App not installed (behavior note only)  
2. Installed + terminated  
3. Background  
4. Foreground  
5. Already on another route  
6. Query parameters preserved  
7. Hash fragment preserved  
8. Auth callback (scheme/product path only — not AASA `/auth/*`)  
9. Unsupported host  
10. Unsupported/excluded path  
11. Unsafe scheme  
12. Malformed URL  

## Required evidence fields

```text
exactUrl · deviceModel · osVersion · appBuild · initialAppState
expectedRoute · actualRoute · browserFallback
artifactPath · logRef · result · tester · testedAt
```

## Resolver unit (repository)

`artifacts/majalis/src/lib/native-deep-link.ts` — trusted hosts + `majlisilm` only.  
Repository PASS ≠ physical UL certification.

## Build class

```text
Baseline smoke on TF_55 / review build = allowed with Build declared
Tip-aligned / fix certification        = REQUIRES_FUTURE_BUILD_GE_56
```
