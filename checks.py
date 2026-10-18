from html.parser import HTMLParser
from pathlib import Path
class Document(HTMLParser):
    def __init__(self):
        super().__init__(); self.ids = set(); self.links = []; self.assets = []
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if 'id' in a:
            assert a['id'] not in self.ids, f"Duplicate id: {a['id']}"
            self.ids.add(a['id'])
        if tag == 'a': self.links.append(a.get('href', ''))
        if tag == 'script': self.assets.append(a.get('src', ''))
        if tag == 'link' and a.get('rel') == 'stylesheet': self.assets.append(a['href'])
root = Path(__file__).parent / 'public'
html = (root / 'index.html').read_text()
doc = Document(); doc.feed(html)
for link in doc.links:
    if link.startswith('#') and len(link) > 1:
        assert link[1:] in doc.ids, f'Missing anchor {link}'
for asset in doc.assets:
    assert (root / asset).is_file(), f'Missing asset {asset}'
for text in ['support@qualifylocalize.com', '447770012186', 'Document & Content', 'Software & App', 'Website Localization', 'Multimedia &', 'Desktop Publishing', 'Post-Editing']:
    assert text in html, f'Missing content: {text}'
for path in root.iterdir():
    assert 'interpretation' not in path.read_text().lower(), f'Excluded wording in {path}'
print(f'PASS: {len(doc.ids)} unique IDs, local assets, fragment links, six services, contacts, content constraint')
