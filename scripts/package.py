"""Package the built site, never the source secrets or font files."""
from pathlib import Path
from zipfile import ZipFile,ZIP_DEFLATED
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'artifacts';OUT.mkdir(exist_ok=True)
with ZipFile(OUT/'saytmsk-website.zip','w',ZIP_DEFLATED) as archive:
    for path in sorted((ROOT/'dist').rglob('*')):
        if path.is_file() and not path.name.startswith('.env') and path.suffix not in ['.woff','.woff2','.ttf','.otf']:
            archive.write(path,path.relative_to(ROOT/'dist'))
print('Created artifacts/saytmsk-website.zip')

with ZipFile(OUT/'saytmsk-source.zip','w',ZIP_DEFLATED) as archive:
    for path in sorted(ROOT.rglob('*')):
        relative=path.relative_to(ROOT)
        if any(part in ['dist','artifacts','node_modules','.git','.bootstrap','__pycache__'] for part in relative.parts): continue
        if path.is_file() and (not path.name.startswith('.env') or path.name=='.env.example') and path.suffix not in ['.woff','.woff2','.ttf','.otf']:
            archive.write(path,relative)
print('Created artifacts/saytmsk-source.zip')
