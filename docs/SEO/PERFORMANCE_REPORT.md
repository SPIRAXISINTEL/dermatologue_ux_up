# Performance report

## Implemented
- WebP sources retained for available clinic/doctor photographs.
- Main homepage portrait is configured with `fetchpriority="high"` and intrinsic dimensions.
- Below-the-fold photos use lazy loading and intrinsic dimensions.
- Existing WebP assets retained; no source images were replaced by stock imagery.

## Not measured
No fresh Lighthouse run or PageSpeed field-data snapshot was available during source editing. Do not report a Core Web Vitals pass until mobile and desktop measurements are collected from the deployed preview. Targets: LCP <= 2.5s, INP <= 200ms, CLS <= 0.1.
