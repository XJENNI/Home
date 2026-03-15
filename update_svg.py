import codecs
import re

svg_content = '''<svg class="floor-svg" viewBox="0 0 1000 1500" xmlns="http://www.w3.org/2000/svg">
          <!-- Outer Boundary 34ft x 60ft scaled to approx 1000x1500 -->
          <rect x="50" y="50" width="900" height="1400" fill="none" class="boundary-line" />
          
          <!-- Parking (16ft x 13ft) -->
          <rect x="50" y="50" width="400" height="300" class="room-rect" onclick="window.location.href='space-detail.html?id=parking'" />
          <text x="250" y="200" class="room-label">Parking</text>
          
          <!-- Kitchen (13ft x 10ft) -->
          <rect x="550" y="50" width="400" height="250" class="room-rect" onclick="window.location.href='space-detail.html?id=kitchen'" />
          <text x="750" y="175" class="room-label">Kitchen</text>

          <!-- Hall / Living Room (16ft x 17ft) -->
          <rect x="50" y="350" width="900" height="400" class="room-rect" onclick="window.location.href='space-detail.html?id=hall'" />
          <text x="500" y="550" class="room-label">Hall</text>

          <!-- Common Toilet (6ft x 4ft 5in) -->
          <rect x="50" y="750" width="200" height="150" class="room-rect" onclick="window.location.href='space-detail.html?id=commonbathroom'" />
          <text x="150" y="825" class="room-label">Bath</text>
          
          <!-- Master Bedroom (13ft x 11ft) -->
          <rect x="550" y="750" width="400" height="300" class="room-rect" onclick="window.location.href='space-detail.html?id=masterbed'" />
          <text x="750" y="900" class="room-label">Master Bed</text>

          <!-- Children Bedroom (11ft 7in x 11ft) -->
          <rect x="50" y="1150" width="450" height="300" class="room-rect" onclick="window.location.href='space-detail.html?id=childrenbed'" />
          <text x="275" y="1300" class="room-label">Children Bed</text>
          
          <!-- Rear Walkway (3ft wide) -->
          <rect x="550" y="1150" width="400" height="100" class="room-rect" onclick="window.location.href='space-detail.html?id=openarea'" />
          <text x="750" y="1200" class="room-label">Wash Area</text>
          
          <!-- Staircase (10ft x 6ft) -->
          <rect x="350" y="1250" width="600" height="200" class="room-rect" onclick="window.location.href='space-detail.html?id=staircase'" />
          <text x="650" y="1350" class="room-label">Staircase</text>
        </svg>'''

with codecs.open('patel-mansion/index.html', 'r', 'utf-8') as f:
    html = f.read()

html = re.sub(r'<svg class="floor-svg".*?</svg>', svg_content, html, flags=re.DOTALL)

with codecs.open('patel-mansion/index.html', 'w', 'utf-8') as f:
    f.write(html)
print('Updated SVG in index.html')
