# Test Coverage Gap Analysis & Decisions

**Date:** 2026-01-17
**Analyst:** Claude Code (Critical Review)
**Purpose:** Identify test coverage gaps and decide: DROP, TODO, or IMPLEMENT

---

## Decision Key

- 🟢 **IMPLEMENT NOW** - High impact, clear requirements, critical for quality
- 🟡 **TODO/NOTE** - Important but complex, depends on unimplemented features, or needs infrastructure
- 🔴 **DROP** - Misdiagnosis, out of scope, or over-engineering

---

## WEBAPP E2E TESTS

| # | Gap | Decision | Rationale | Implementation Effort |
|---|-----|----------|-----------|----------------------|
| **Integration & Workflows** |
| W1 | Complete turn cycle (player → GM → timeline) | 🟢 IMPLEMENT | Mock forecaster exists, core gameplay | 2 tests |
| W2 | Multi-turn sequences (3+ turns) | 🟢 IMPLEMENT | State consistency critical for event sourcing | 1 test |
| W3 | Search → export workflow | 🟢 IMPLEMENT | Common user path | 1 test |
| W4 | Import → conflict resolution | 🟡 TODO | Conflict resolution not designed yet | Note only |
| W5 | Export during modifications | 🔴 DROP | LocalStorage is synchronous, no race | - |
| **Edge Cases - Scale** |
| W6 | Timeline with 100+ events (rendering) | 🟢 IMPLEMENT | Will happen in real use, performance critical | 1 test |
| W7 | Timeline with 1000+ events | 🟡 TODO | Performance test, needs benchmarking setup | Note + skeleton |
| W8 | Search with 100+ events | 🟢 IMPLEMENT | Same data as W6, minimal effort | 1 test |
| W9 | Import large file (1000+ events) | 🟡 TODO | Performance test, low priority | Note only |
| W10 | Very long event titles (1000+ chars) | 🟢 IMPLEMENT | Data validation, XSS prevention | 1 test |
| **Edge Cases - Data** |
| W11 | Events with identical timestamps | 🟢 IMPLEMENT | Ordering stability critical | 1 test |
| W12 | Events with HTML-like content (XSS) | 🟢 IMPLEMENT | Security critical | 1 test |
| W13 | Event ID uniqueness enforcement | 🟢 IMPLEMENT | Data integrity critical | 1 test |
| W14 | Import duplicate event IDs | 🟢 IMPLEMENT | Should reject or dedupe | 1 test |
| W15 | Import future dates | 🔴 DROP | Game allows future dates | - |
| W16 | Mixed valid/invalid events in import | 🟢 IMPLEMENT | Partial success handling | 1 test |
| **Edge Cases - Input** |
| W17 | Search with regex special chars | 🟢 IMPLEMENT | Common user error | 1 test |
| W18 | Search very long queries (1000+ chars) | 🔴 DROP | Unrealistic, UI limits input | - |
| W19 | Accented character search (é vs e) | 🟡 TODO | i18n feature, not MVP | Note only |
| W20 | Form input: HTML tags | 🟢 IMPLEMENT | XSS prevention | 1 test |
| W21 | Form input: Emoji/Unicode | 🟢 IMPLEMENT | Common modern input | 1 test |
| **Persistence** |
| W22 | localStorage quota exceeded | 🟡 TODO | Hard to test, needs mock storage | Note + test stub |
| W23 | Concurrent tab race conditions | 🟡 TODO | Complex timing, low probability | Note only |
| W24 | Corrupted JSON partial recovery | 🔴 DROP | Already have corrupted data test | - |
| W25 | Private browsing mode | 🔴 DROP | Browser-specific, not controllable | - |
| **Error Handling** |
| W26 | API timeout during turn | 🟢 IMPLEMENT | Mock can simulate | 1 test |
| W27 | API rate limiting | 🟡 TODO | Real API behavior, cassette feature | Note only |
| W28 | Network offline during import | 🔴 DROP | Import is local, no network | - |
| W29 | Storage quota error toast | 🟡 TODO | Depends on W22 | Note only |
| W30 | Invalid event structure rejection | 🟢 IMPLEMENT | Engine validation test | 1 test |
| W31 | File too large (>100MB) | 🔴 DROP | Browser rejects before app sees | - |
| W32 | Unsupported file format (CSV) | 🟢 IMPLEMENT | User error, should fail gracefully | 1 test |
| **State Consistency** |
| W33 | Turn markers (started/finished) pairing | 🟢 IMPLEMENT | Telemetry integrity | 1 test |
| W34 | Turn boundary date validation | 🟢 IMPLEMENT | Chronological consistency | 1 test |
| W35 | Actor field consistency | 🟢 IMPLEMENT | player vs game_master enforcement | 1 test |
| W36 | State diff after reload | 🟢 IMPLEMENT | Event sourcing correctness | 1 test |
| W37 | Event count UI vs localStorage | 🔴 DROP | Implicit in other tests | - |
| **Accessibility & UX** |
| W38 | Keyboard nav (Tab, Enter, Escape) | 🟢 IMPLEMENT | Basic a11y expectation | 3 tests |
| W39 | Focus management after interactions | 🟢 IMPLEMENT | UX quality | 2 tests |
| W40 | Screen reader announcements | 🟡 TODO | Full a11y is unimplemented feature | Note only |
| W41 | Color contrast | 🔴 DROP | Manual design review, not automated | - |
| W42 | Mobile/responsive layout | 🔴 DROP | Manual testing per CLAUDE.md | - |
| W43 | Touch events | 🔴 DROP | Mobile not priority | - |
| **Not Applicable** |
| W44 | URL/routing | 🔴 DROP | No routing in SPA design | - |
| W45 | Visual regression | 🔴 DROP | Already documented as manual only | - |
| W46 | Drag-and-drop | 🔴 DROP | Not in feature set | - |
| W47 | Copy-to-clipboard | 🔴 DROP | Not in current design | - |

**Webapp Summary:**
- 🟢 IMPLEMENT: 27 gaps → ~35 new tests
- 🟡 TODO: 8 gaps → notes and test stubs
- 🔴 DROP: 12 gaps (out of scope)

---

## CLI TESTS

| # | Gap | Decision | Rationale | Implementation Effort |
|---|-----|----------|-----------|----------------------|
| **Integration & Workflows** |
| C1 | Full pipeline (prepare → call → parse → aggregate) | 🟢 IMPLEMENT | Core developer workflow | 1 test |
| C2 | Error recovery (retry after failure) | 🟡 TODO | Needs retry logic implementation | Note only |
| C3 | Materials workflow (all vs none) | 🟢 IMPLEMENT | Verify materials system | 1 test |
| C4 | Multi-turn state progression | 🟢 IMPLEMENT | Game loop verification | 1 test |
| C5 | JSONL line endings (CRLF vs LF) | 🟢 IMPLEMENT | Cross-platform compatibility | 1 test |
| **CLI Standards** |
| C6 | Exit codes (0=success, 1=error) | 🟢 IMPLEMENT | Unix standard, critical for scripts | 6 tests |
| C7 | STDOUT/STDERR separation | 🟢 IMPLEMENT | Piping and logging | 2 tests |
| C8 | Help text (--help, -h) | 🟢 IMPLEMENT | Basic usability | 6 tests |
| C9 | Version flag (--version) | 🔴 DROP | Low priority, add later | - |
| C10 | Verbose/debug output | 🔴 DROP | Feature not implemented | - |
| C11 | Quiet mode | 🔴 DROP | Feature not implemented | - |
| C12 | Dry-run mode | 🔴 DROP | Feature not implemented | - |
| **Command Combinations** |
| C13 | Invalid flag combinations | 🟢 IMPLEMENT | User error prevention | 4 tests |
| C14 | Required vs optional validation | 🟢 IMPLEMENT | Argument validation | 2 tests |
| C15 | Piping (stdin/stdout) | 🟡 TODO | Needs design decision | Note + investigate |
| C16 | Flag aliases (-i vs --input) | 🔴 DROP | Not implemented, low priority | - |
| **File I/O Edge Cases** |
| C17 | Relative paths | 🟢 IMPLEMENT | Common usage pattern | 3 tests |
| C18 | Paths with spaces/special chars | 🟢 IMPLEMENT | Windows compatibility | 2 tests |
| C19 | File permissions errors | 🟡 TODO | Hard to test reliably, needs mock FS | Note + test stub |
| C20 | Disk full scenario | 🔴 DROP | Requires filesystem mocking, rare | - |
| C21 | Symlinks | 🔴 DROP | Node.js handles transparently | - |
| C22 | Output file exists (overwrite) | 🟢 IMPLEMENT | Data safety | 2 tests |
| C23 | Windows path handling (backslashes) | 🔴 DROP | Test on Windows if needed | - |
| C24 | Files modified during processing | 🔴 DROP | Rare, complex to test | - |
| **Data Edge Cases** |
| C25 | Commands with null/undefined fields | 🟢 IMPLEMENT | Data validation | 2 tests |
| C26 | Non-JSON API responses | 🟢 IMPLEMENT | Error handling | 1 test |
| C27 | Partial JSON (streaming mid-parse) | 🟡 TODO | Depends on streaming implementation | Note only |
| C28 | Large material content (1MB+) | 🔴 DROP | Performance test, not functional | - |
| C29 | Empty history (edge case) | 🟢 IMPLEMENT | Boundary condition | 1 test |
| C30 | Conflicting event IDs in turn | 🟢 IMPLEMENT | Data integrity | 1 test |
| **API Integration** |
| C31 | Real Gemini API calls | 🟡 TODO | Requires API key, cassette system | Note (already flagged) |
| C32 | Timeout handling | 🟡 TODO | Needs real API integration | Note only |
| C33 | Rate limiting | 🟡 TODO | Needs real API or mock | Note only |
| C34 | Retry logic | 🟡 TODO | Feature not implemented | Note (already in unimpl) |
| C35 | Streaming response | 🟡 TODO | Check if implemented, then test | Investigate first |
| **Signal Handling** |
| C36 | SIGINT/SIGTERM handling | 🟡 TODO | Graceful shutdown, nice-to-have | Note + test stub |
| C37 | Cleanup on interrupt | 🟡 TODO | Depends on C36 | Note only |
| **Idempotency & Consistency** |
| C38 | Running aggregate twice (idempotent) | 🟢 IMPLEMENT | Safety property | 1 test |
| C39 | Event ordering stability | 🟢 IMPLEMENT | Same input → same output | 1 test |
| C40 | Deduplication correctness | 🔴 DROP | Already tested | - |
| **Not Applicable** |
| C41 | Interactive mode | 🔴 DROP | Not planned | - |
| C42 | Config file support | 🔴 DROP | Over-engineering | - |
| C43 | JSON structured errors | 🔴 DROP | Feature not planned | - |
| C44 | Progress indicators | 🟡 TODO | UX enhancement, check if implemented | Investigate first |

**CLI Summary:**
- 🟢 IMPLEMENT: 24 gaps → ~40 new tests
- 🟡 TODO: 13 gaps → notes and investigations
- 🔴 DROP: 13 gaps (out of scope)

---

## ENGINE TESTS

| # | Gap | Decision | Rationale | Implementation Effort |
|---|-----|----------|-----------|----------------------|
| **Event Sourcing & State** |
| E1 | State reduction (events → state) | 🟢 IMPLEMENT | Core engine function | 3 tests |
| E2 | Idempotency of reduction | 🟢 IMPLEMENT | Pure function guarantee | 1 test |
| E3 | Event schema validation (strict Zod) | 🟢 IMPLEMENT | Type safety | 5 tests |
| E4 | Event type dispatch correctness | 🟢 IMPLEMENT | Polymorphism validation | 2 tests |
| E5 | Circular dependency detection | 🔴 DROP | No evidence of event refs in design | - |
| E6 | Same-day event ordering | 🟢 IMPLEMENT | Deterministic ordering | 1 test |
| E7 | Turn cycle state transitions | 🟢 IMPLEMENT | Game logic correctness | 2 tests |
| **Validation Edge Cases** |
| E8 | Date validation (leap years, Feb 30) | 🟢 IMPLEMENT | Data integrity | 3 tests |
| E9 | Icon validation (ICON_SET bounds) | 🟢 IMPLEMENT | Enum validation | 2 tests |
| E10 | Title/description length limits | 🟡 TODO | No limits defined, document if needed | Investigate + note |
| E11 | Event ID format validation | 🟡 TODO | Check if IDs are user-gen or system-gen | Investigate + note |
| E12 | Required field presence | 🟢 IMPLEMENT | Zod schema enforcement | 3 tests |
| E13 | Null/undefined handling | 🟢 IMPLEMENT | Optional field behavior | 2 tests |
| E14 | Whitespace normalization | 🟢 IMPLEMENT | Consistent data | 2 tests |
| **Integration Scenarios** |
| E15 | Multi-log merging with validation | 🟢 IMPLEMENT | Aggregate correctness | 1 test |
| E16 | Partial event processing | 🟡 TODO | Error recovery strategy unclear | Note only |
| E17 | State snapshot/restore | 🟡 TODO | Persistence feature, check if needed | Investigate + note |
| E18 | Event filtering/projection | 🟡 TODO | Check if implemented | Investigate first |
| E19 | Batch insertion consistency | 🔴 DROP | Not a batch system | - |
| **Forecaster Adapters** |
| E20 | Mock forecaster (expand coverage) | 🟢 IMPLEMENT | More deterministic scenarios | 2 tests |
| E21 | Replay forecaster (expand coverage) | 🟢 IMPLEMENT | Cassette edge cases | 2 tests |
| E22 | Gemini forecaster (with mocks) | 🟡 TODO | Requires API mocking | Note only |
| E23 | Browser vs Node adapter differences | 🟡 TODO | Check for actual differences | Investigate first |
| E24 | Forecaster error handling | 🟢 IMPLEMENT | Adapter resilience | 3 tests |
| E25 | Timeout handling in adapters | 🟡 TODO | Feature implementation unclear | Note only |
| E26 | Retry logic in adapters | 🟡 TODO | Unimplemented feature | Note (in unimpl) |
| **Materials System** |
| E27 | Material selection algorithm | 🟡 TODO | Advanced feature, not MVP | Note only |
| E28 | Multiple material bundles | 🟡 TODO | Check current implementation | Investigate first |
| E29 | Material size optimization | 🔴 DROP | Performance, not correctness | - |
| E30 | Circular refs in materials | 🔴 DROP | Materials are flat files | - |
| E31 | Missing material sources | 🟢 IMPLEMENT | Error handling | 1 test |
| **Performance & Scale** |
| E32 | Large event logs (1000+) | 🟡 TODO | Performance test, needs benchmarking | Note + skeleton |
| E33 | Large material content | 🔴 DROP | Performance, not correctness | - |
| E34 | State reduction performance | 🟡 TODO | Benchmark, not functional test | Note only |
| E35 | Memory usage tracking | 🔴 DROP | Requires profiling tools | - |
| **Error Handling** |
| E36 | Material load failure (graceful) | 🟢 IMPLEMENT | Error recovery | 1 test |
| E37 | Partial event acceptance | 🟢 IMPLEMENT | Best-effort processing | 1 test |
| E38 | Forecaster failure recovery | 🟢 IMPLEMENT | Adapter error propagation | 2 tests |
| E39 | Invalid state recovery | 🟡 TODO | Recovery strategy unclear | Note only |
| **Type Safety** |
| E40 | Cross-field validation | 🟢 IMPLEMENT | Business logic validation | 3 tests |
| E41 | Conditional field requirements | 🟢 IMPLEMENT | Polymorphic validation | 2 tests |
| E42 | Type discriminator edge cases | 🟢 IMPLEMENT | Union type safety | 2 tests |
| E43 | Immutability (no mutations) | 🟢 IMPLEMENT | React requirement | 2 tests |

**Engine Summary:**
- 🟢 IMPLEMENT: 28 gaps → ~50 new tests
- 🟡 TODO: 15 gaps → notes and investigations
- 🔴 DROP: 7 gaps (out of scope)

---

## OVERALL SUMMARY

| Component | IMPLEMENT | TODO | DROP | Total Gaps | New Tests |
|-----------|-----------|------|------|------------|-----------|
| Webapp | 27 | 8 | 12 | 47 | ~35 |
| CLI | 24 | 13 | 13 | 50 | ~40 |
| Engine | 28 | 15 | 7 | 50 | ~50 |
| **TOTAL** | **79** | **36** | **32** | **147** | **~125** |

---

## PRIORITIZATION PLAN

### Phase 1: Critical Infrastructure (P0) - ~4 hours
**Focus:** Tests that unblock development or catch critical bugs

1. **CLI Exit Codes & Help** (C6, C7, C8) - 14 tests
2. **Turn Cycle Integration** (W1, W2) - 3 tests
3. **Event ID Uniqueness** (W13, W14) - 2 tests
4. **State Consistency** (W33-W36, E1, E2) - 8 tests
5. **XSS Prevention** (W12, W20) - 2 tests

**Subtotal: ~29 tests**

### Phase 2: Data Integrity (P1) - ~3 hours
**Focus:** Edge cases that corrupt data or break core functionality

1. **Event Validation** (E3, E8, E9, E12-E14) - 15 tests
2. **File I/O** (C17, C18, C22) - 7 tests
3. **Invalid Data Rejection** (W30, W32, C25, C26) - 5 tests
4. **Turn State Transitions** (E7, W34, W35) - 5 tests

**Subtotal: ~32 tests**

### Phase 3: Scale & Performance (P2) - ~2 hours
**Focus:** Performance degradation and large dataset handling

1. **Large Timelines** (W6, W8, W10) - 3 tests
2. **Workflows** (C1, C3, C4, W3) - 4 tests
3. **Idempotency** (C38, C39, E6) - 3 tests

**Subtotal: ~10 tests**

### Phase 4: UX & Robustness (P3) - ~3 hours
**Focus:** User experience and error handling

1. **Keyboard Navigation** (W38, W39) - 5 tests
2. **Forecaster Errors** (E20, E21, E24, E36-E38) - 8 tests
3. **CLI Validation** (C13, C14, C29, C30) - 6 tests
4. **Materials** (E31, C5) - 2 tests
5. **Type Safety** (E40-E43) - 9 tests

**Subtotal: ~30 tests**

### Phase 5: Investigations & TODOs - ~2 hours
**Focus:** Document gaps that need design decisions

1. Create TODO markers in code
2. Write skeleton tests for complex scenarios
3. Document investigations needed

---

## RECOMMENDATIONS

### Immediate Actions (Today)

1. **Implement Phase 1** (Critical Infrastructure) - Highest ROI
2. **Start Phase 2** (Data Integrity) - Prevents corruption
3. **Document all TODOs** in code with clear markers

### Medium Term (This Week)

4. Complete Phase 2-4
5. Investigate unclear features (piping, streaming, material selection)
6. Add test skeletons for performance tests

### Long Term (Next Sprint)

7. Cassette replay system integration
8. Performance benchmarking infrastructure
9. Full accessibility test suite

### Notes

- **BUG FIX FIRST**: Fix aggregate.ts sorting bug before adding more tests
- **Mock Integration**: Many webapp tests blocked on mock forecaster - prioritize
- **CI Time**: 125 new tests will add ~5-10 minutes to CI - acceptable
- **Maintenance**: TODO markers ensure future developers don't forget gaps

---

**Decision Authority:** Claude Code
**Next Review:** After Phase 1 implementation
**Questions?** Review individual decisions in tables above
