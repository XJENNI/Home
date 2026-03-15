import codecs
with codecs.open('patel-mansion/index.html', 'r', 'utf-8') as f:
    html = f.read()

blueprint_html = '''
    <section class="grid-2" style="margin-top: 2rem;">
      <article class="premium-card" style="grid-column: 1 / -1;">
        <h2>Uploaded Architectural Blueprints</h2>
        <p class="muted">Click to view full-size original layout map images.</p>
        <div style="display:flex; gap:1rem; overflow-x:auto; margin-top:1rem; padding-bottom:1rem;">
          <a href="assets/img/photo_2026-03-14_22-10-55.jpg" target="_blank" style="flex: 0 0 auto;">
            <img src="assets/img/photo_2026-03-14_22-10-55.jpg" alt="Blueprint 1" style="height:350px; border-radius:8px; border:2px solid var(--accent-gold); box-shadow:0 10px 20px rgba(0,0,0,0.3);">
          </a>
          <a href="assets/img/photo_2026-03-14_22-11-01.jpg" target="_blank" style="flex: 0 0 auto;">
            <img src="assets/img/photo_2026-03-14_22-11-01.jpg" alt="Blueprint 2" style="height:350px; border-radius:8px; border:2px solid var(--accent-gold); box-shadow:0 10px 20px rgba(0,0,0,0.3);">
          </a>
        </div>
      </article>
    </section>
'''

html = html.replace('</svg>\n      </article>', '</svg>\n      </article>' + blueprint_html)
with codecs.open('patel-mansion/index.html', 'w', 'utf-8') as f:
    f.write(html)
print('Updated index.html')
