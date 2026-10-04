# CUSTOM_WIDGET_CONFIGURATION_STRATEGY

TASK_CLASSIFICATION: IOS_ONLY
PR: W2

## Chosen architecture

OPTION C

- Canonical registered owner: `CustomContentStaticWidget`
- Kind: `sunnah.widget.custom`
- `CustomContentWidget` (AppIntent) exists in source behind iOS 17 availability but is **not** registered in `PrayerWidgetBundle`
- Dual registration under the same kind is forbidden

## Exit markers

CUSTOM_WIDGET_CONFIGURATION_CANONICAL = true  
DUPLICATE_CUSTOM_KIND_ZERO = true  
OLDER_IOS_COMPATIBILITY_EXPLICIT = true  
MULTIPLE_INSTANCES_SAFE = true  

## Migration (future)

When minimum deployment target allows and product requires App Intent configuration for every instance, swap Static → AppIntent under the same kind in a single owner-controlled iOS release (FUTURE_IOS_UPDATE_REQUIRED). Validate existing home-screen instances on TestFlight before Store.
