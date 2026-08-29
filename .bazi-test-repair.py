from pathlib import Path

p = Path('tests/bazi-semantic-layer-tests.js')
text = p.read_text(encoding='utf-8')
bad = "join('" + "\n" + "');"
if bad not in text:
    raise SystemExit('generated newline test fragment not found')
p.write_text(text.replace(bad, "join('');", 1), encoding='utf-8')
