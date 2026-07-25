# Link integrity

Project 42 checks navigation, static assets, page fragments, metadata
endpoints, and cited HTTP(S) sources before a site release can merge.

## Run the gate

```powershell
npm run build
npm run links:check
```

`npm run check` includes the build, link-integrity unit tests, the complete
link gate, rendered-page tests, and browser journeys. The link report names
the source route, target, status, and failure class so maintainers can correct
the content rather than hunt through the catalog.

The validator:

- renders every public index, learning path, module, and resource route;
- verifies every internal route and fragment;
- verifies generated scripts, styles, brand files, icons, and other static
  assets against the deployment output;
- verifies the manifest, robots, and sitemap endpoints;
- checks each unique external HTTP(S) target with redirects enabled, bounded
  concurrency, a timeout, and retries; and
- fails when an exception is expired, unused, incomplete, or receives a
  status other than the one explicitly approved.

The following environment variables tune local diagnostics without changing
the committed policy:

| Variable | Default | Purpose |
| --- | ---: | --- |
| `LINK_CHECK_CONCURRENCY` | `12` | Maximum simultaneous external requests |
| `LINK_CHECK_TIMEOUT_MS` | `20000` | Timeout for one request attempt |
| `LINK_CHECK_ATTEMPTS` | `3` | Total attempts before a target fails |

## Handle a failure

1. Open the URL in a normal browser and determine whether the target moved,
   disappeared, or blocks automated clients.
2. Replace broken or redirected-away content with the current authoritative
   source. Update content verification metadata when that changes evidence.
3. Run `npm run links:check` again.
4. If a public source consistently blocks only automated clients, add the
   narrowest possible entry to
   [`config/link-check-exceptions.json`](../config/link-check-exceptions.json).

An exception must include:

- an exact URL or narrowly scoped `*` pattern;
- the expected blocking HTTP status;
- a concrete rationale;
- an accountable owner; and
- an ISO expiry date.

Exceptions are not permanent allowlists. A successful response always passes,
including when another network or CI runner receives the documented blocking
status. The exception remains in use while its narrow pattern matches a
crawled site target, and its expiry forces periodic review. A pattern matching
no current target fails as unused. Timeouts, DNS failures, expired exceptions,
and unexpected statuses cannot be hidden by a status exception.

Link reachability does not prove that a source is factually current. Content
verification dates and freshness governance remain separate release evidence.
