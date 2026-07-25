import assert from "node:assert/strict";
import test from "node:test";
import {
  canonicalizeSvgSource,
  sourceSha256,
} from "../scripts/brand-source-integrity.mjs";

const lfSource = [
  '<svg viewBox="0 0 64 64">',
  '  <path fill="#c9f25f" d="M8 8h20v48H8z"/>',
  "</svg>",
  "",
].join("\n");

test("canonical SVG bytes and hashes are identical for LF and CRLF checkouts", () => {
  const crlfSource = lfSource.replaceAll("\n", "\r\n");
  const bomCrlfSource = `\uFEFF${crlfSource}`;
  assert.deepEqual(
    canonicalizeSvgSource(crlfSource),
    canonicalizeSvgSource(lfSource),
  );
  assert.deepEqual(
    canonicalizeSvgSource(bomCrlfSource),
    canonicalizeSvgSource(lfSource),
  );
  assert.equal(sourceSha256(crlfSource), sourceSha256(lfSource));
  assert.equal(sourceSha256(bomCrlfSource), sourceSha256(lfSource));
});

test("canonical SVG hashing still detects substantive source changes", () => {
  const changedSource = lfSource.replace("#c9f25f", "#ffffff");
  assert.notEqual(sourceSha256(changedSource), sourceSha256(lfSource));
});
